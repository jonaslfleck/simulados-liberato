"use client";

import { useState } from "react";

type Alternative = {
  letter: string;
  content: string;
};

type Question = {
  number: number;
  statement: string;
  alternatives: Alternative[];
  confidence: number;
};

type ImportResult = {
  questions: Question[];
  pages: number;
  error?: string;
};

export default function ImportarPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function processar() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha ao processar o PDF");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao processar o PDF"
      );
    } finally {
      setLoading(false);
    }
  }

  async function salvar(status: "review" | "published") {
    if (!data) return;

    const title = window.prompt(
      "Título da prova:",
      "Processo Seletivo"
    );

    const yearText = window.prompt(
      "Ano:",
      "2026"
    );

    const year = Number(yearText);

    if (!title || !year || Number.isNaN(year)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/import/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          title,
          year,
          shift: "diurno",
          status,
          questions: data.questions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar prova");
      }

      alert(
        `Prova salva com ${result.questions} questões. Status: ${result.status}`
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar"
      );
    }
  }

  function updateQuestionStatement(
    questionIndex: number,
    statement: string
  ) {
    setData((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        questions: previous.questions.map((question, index) =>
          index === questionIndex
            ? {
                ...question,
                statement,
              }
            : question
        ),
      };
    });
  }

  function updateAlternative(
    questionIndex: number,
    alternativeIndex: number,
    content: string
  ) {
    setData((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        questions: previous.questions.map((question, index) =>
          index === questionIndex
            ? {
                ...question,
                alternatives: question.alternatives.map(
                  (alternative, altIndex) =>
                    altIndex === alternativeIndex
                      ? {
                          ...alternative,
                          content,
                        }
                      : alternative
                ),
              }
            : question
        ),
      };
    });
  }

  const readyQuestions =
    data?.questions.filter(
      (question) =>
        question.confidence >= 0.9 &&
        question.alternatives.length === 5
    ).length ?? 0;

  const reviewQuestions =
    data?.questions.length
      ? data.questions.length - readyQuestions
      : 0;

  return (
    <main className="container">
      <h1>Importar prova</h1>

      <p className="muted">
        Use a URL de um PDF oficial. O processamento ocorre no servidor.
        Revise as questões antes de publicar.
      </p>

      <div className="card">
        <label htmlFor="pdf-url">
          URL do PDF oficial
        </label>

        <input
          id="pdf-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.exemplo.com/prova.pdf"
          style={{
            width: "100%",
            padding: 12,
            margin: "10px 0",
          }}
        />

        <button
          className="btn"
          disabled={!url || loading}
          onClick={processar}
        >
          {loading ? "Processando PDF..." : "Processar PDF"}
        </button>
      </div>

      {error && (
        <div className="card">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {data && (
        <>
          <div className="card">
            <h2>Resultado da importação</h2>

            <p>
              {data.pages} páginas ·{" "}
              {data.questions.length} questões encontradas
            </p>

            <p>
              Prontas: {readyQuestions} · Revisar: {reviewQuestions}
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn secondary"
                onClick={() => salvar("review")}
              >
                Salvar para revisão
              </button>

              <button
                className="btn"
                onClick={() => salvar("published")}
              >
                Publicar agora
              </button>
            </div>
          </div>

          {data.questions.map((question, questionIndex) => (
            <div
              className="card"
              key={`${question.number}-${questionIndex}`}
            >
              <div
                style={{
                  marginBottom: 10,
                }}
              >
                <strong>
                  Questão {question.number}
                </strong>

                <span className="muted">
                  {" "}
                  · confiança{" "}
                  {Math.round(question.confidence * 100)}%
                </span>
              </div>

              <textarea
                value={question.statement}
                onChange={(event) =>
                  updateQuestionStatement(
                    questionIndex,
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  minHeight: 100,
                  marginBottom: 10,
                  padding: 8,
                }}
              />

              {question.alternatives.map(
                (alternative, alternativeIndex) => (
                  <div
                    key={`${alternative.letter}-${alternativeIndex}`}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <strong>
                      {alternative.letter})
                    </strong>

                    <input
                      value={alternative.content}
                      onChange={(event) =>
                        updateAlternative(
                          questionIndex,
                          alternativeIndex,
                          event.target.value
                        )
                      }
                      style={{
                        flex: 1,
                        padding: 8,
                      }}
                    />
                  </div>
                )
              )}
            </div>
          ))}
        </>
      )}
    </main>
  );
}