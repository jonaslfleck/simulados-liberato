"use client";

import { useEffect, useState } from "react";
import Nav from "../../../../components/Nav";
import { getExamQuestions } from "../../../../lib/questions";

type Alternative = {
  id: string;
  letter: string;
  content: string;
};

type Question = {
  id: string;
  question_number: number;
  subject: string;
  statement: string;
  alternatives: Alternative[];
};

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [qs, setQs] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    params
      .then(({ id }) => getExamQuestions(id))
      .then((data) => {
        setQs(data as Question[]);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [params]);

  if (error) {
    return (
      <>
        <Nav />
        <main className="container">
          <div className="card">
            Erro: {error}
          </div>
        </main>
      </>
    );
  }

  if (!qs.length) {
    return (
      <>
        <Nav />
        <main className="container">
          <div className="card">
            Carregando questões...
          </div>
        </main>
      </>
    );
  }

  const question = qs[currentIndex];

  function selectAnswer(alternativeId: string) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: alternativeId,
    }));
  }

  function finishExam() {
    alert(
      `Simulado finalizado. ${Object.keys(answers).length} respostas registradas nesta sessão.`
    );
  }

  return (
    <>
      <Nav />

      <main className="container">
        <p className="muted">
          Questão {currentIndex + 1} de {qs.length}
        </p>

        <div className="card">
          <p className="muted">{question.subject}</p>

          <h2>
            {question.question_number}. {question.statement}
          </h2>

          <div>
            {question.alternatives?.map((alternative) => (
              <label
                key={alternative.id}
                style={{
                  display: "block",
                  padding: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  checked={answers[question.id] === alternative.id}
                  onChange={() => selectAnswer(alternative.id)}
                />

                {" "}

                <b>{alternative.letter})</b> {alternative.content}
              </label>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 15,
          }}
        >
          <button
            className="btn secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            Anterior
          </button>

          {currentIndex < qs.length - 1 ? (
            <button
              className="btn"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Próxima
            </button>
          ) : (
            <button className="btn" onClick={finishExam}>
              Finalizar
            </button>
          )}
        </div>

        <p className="muted" style={{ marginTop: 15 }}>
          Respondidas: {Object.keys(answers).length} de {qs.length}
        </p>
      </main>
    </>
  );
}