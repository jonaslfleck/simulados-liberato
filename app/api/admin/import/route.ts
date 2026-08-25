import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

type Alt = {
  letter: string;
  content: string;
};

type ExtractedQuestion = {
  number: number;
  statement: string;
  alternatives: Alt[];
  confidence: number;
};

function extract(text: string): ExtractedQuestion[] {
  const questionRegex = /(?:^|\n)\s*(\d{1,2})\s*[.)]\s+/g;
  const questionMatches = [...text.matchAll(questionRegex)];

  const questions: ExtractedQuestion[] = [];

  for (let i = 0; i < questionMatches.length; i++) {
    const questionNumber = Number(questionMatches[i][1]);

    if (questionNumber < 1 || questionNumber > 60) {
      continue;
    }

    const start =
      (questionMatches[i].index || 0) +
      questionMatches[i][0].length;

    const end =
      i + 1 < questionMatches.length
        ? questionMatches[i + 1].index || text.length
        : text.length;

    const chunk = text.slice(start, end);

    const alternativeRegex =
      /(?:^|\n)\s*([A-E])\s*[.)]\s+/gi;

    const alternativeMatches = [
      ...chunk.matchAll(alternativeRegex),
    ];

    if (alternativeMatches.length < 4) {
      continue;
    }

    const alternatives: Alt[] = alternativeMatches
      .slice(0, 5)
      .map((match, index) => {
        const alternativeStart =
          (match.index || 0) + match[0].length;

        const alternativeEnd =
          index + 1 < alternativeMatches.length
            ? alternativeMatches[index + 1].index || chunk.length
            : chunk.length;

        return {
          letter: match[1].toUpperCase(),
          content: chunk
            .slice(alternativeStart, alternativeEnd)
            .trim(),
        };
      });

    const statementEnd =
      alternativeMatches[0].index || 0;

    const statement = chunk
      .slice(0, statementEnd)
      .trim();

    questions.push({
      number: questionNumber,
      statement,
      alternatives,
      confidence:
        alternatives.length === 5 &&
        statement.length > 30
          ? 0.98
          : 0.65,
    });
  }

  return questions;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (
      typeof url !== "string" ||
      !/^https:\/\//i.test(url)
    ) {
      return NextResponse.json(
        {
          error:
            "Informe uma URL HTTPS válida do PDF",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 SimuladosLiberato/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            `Não foi possível baixar o PDF: HTTP ${response.status}`,
        },
        {
          status: 400,
        }
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    const buffer = new Uint8Array(
      await response.arrayBuffer()
    );

    if (buffer.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "PDF acima de 25 MB",
        },
        {
          status: 413,
        }
      );
    }

    const pdfHeader = String.fromCharCode(
      ...buffer.slice(0, 5)
    );

    if (
      buffer.byteLength < 5 ||
      pdfHeader !== "%PDF-"
    ) {
      return NextResponse.json(
        {
          error:
            `A URL não retornou um PDF válido (${contentType || "tipo desconhecido"})`,
        },
        {
          status: 400,
        }
      );
    }

    // CORREÇÃO:
    // Removido disableWorker, pois a versão atual
    // do pdfjs-dist não aceita essa propriedade.
    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
    });

    const pdf = await loadingTask.promise;

    let text = "";

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);

      const content =
        await page.getTextContent();

      text +=
        "\n" +
        content.items
          .map((item: any) => item.str || "")
          .join(" ");
    }

    const questions = extract(text);

    return NextResponse.json({
      pages: pdf.numPages,
      questions,
    });
  } catch (error) {
    console.error(
      "PDF import error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar PDF",
      },
      {
        status: 500,
      }
    );
  }
}