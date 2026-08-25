import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Alternative = {
  letter: string;
  content: string;
};

type ExtractedQuestion = {
  number: number;
  statement: string;
  alternatives: Alternative[];
  confidence: number;
};

function extractQuestions(text: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];

  const questionRegex = /(?:^|\n)\s*(\d{1,2})\s*[.)]\s+/g;
  const questionMatches = [...text.matchAll(questionRegex)];

  for (let i = 0; i < questionMatches.length; i++) {
    const number = Number(questionMatches[i][1]);

    const start =
      (questionMatches[i].index ?? 0) +
      questionMatches[i][0].length;

    const end =
      i + 1 < questionMatches.length
        ? (questionMatches[i + 1].index ?? text.length)
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

    const alternatives: Alternative[] =
      alternativeMatches.slice(0, 5).map(
        (match, index) => {
          const alternativeStart =
            (match.index ?? 0) +
            match[0].length;

          const alternativeEnd =
            index + 1 < alternativeMatches.length
              ? (alternativeMatches[index + 1].index ??
                  chunk.length)
              : chunk.length;

          return {
            letter: match[1].toUpperCase(),
            content: chunk
              .slice(
                alternativeStart,
                alternativeEnd
              )
              .trim(),
          };
        }
      );

    const statement = chunk
      .slice(
        0,
        alternativeMatches[0].index ?? 0
      )
      .trim();

    questions.push({
      number,
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
    const body = await req.json();
    const url = body.url;

    if (
      typeof url !== "string" ||
      !/^https:\/\//i.test(url)
    ) {
      return NextResponse.json(
        {
          error: "Informe uma URL HTTPS válida.",
        },
        { status: 400 }
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
          error: `Erro ao baixar PDF: HTTP ${response.status}`,
        },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(
      await response.arrayBuffer()
    );

    if (buffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: "O arquivo baixado está vazio.",
        },
        { status: 400 }
      );
    }

    if (buffer.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "PDF acima do limite de 25 MB.",
        },
        { status: 413 }
      );
    }

    const header = new TextDecoder().decode(
      buffer.slice(0, 5)
    );

    if (header !== "%PDF-") {
      return NextResponse.json(
        {
          error:
            "A URL não retornou um arquivo PDF válido.",
        },
        { status: 400 }
      );
    }

    // Carregamento dinâmico:
    // evita erro durante a inicialização da rota na Vercel.
    const pdfjsLib = await import(
      "pdfjs-dist/legacy/build/pdf.mjs"
    );

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
          .map((item: unknown) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "str" in item
            ) {
              return String(
                (item as { str?: string }).str ?? ""
              );
            }

            return "";
          })
          .join(" ");
    }

    const questions = extractQuestions(text);

    return NextResponse.json({
      pages: pdf.numPages,
      questions,
      extractedTextLength: text.length,
    });
  } catch (error) {
    console.error(
      "ERRO AO PROCESSAR PDF:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar PDF.",
      },
      { status: 500 }
    );
  }
}