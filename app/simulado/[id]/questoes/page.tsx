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
  subject?: string;
  statement: string;
  alternatives: Alternative[];
};

export default function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const { id } = await params;
        const data = await getExamQuestions(id);
        setQuestions(data as Question[]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as questões"
        );
      }
    }

    loadQuestions();
  }, [params]);

  if (error) {
    return (
      <>
        <Nav />
        <main className="container">
          <div className="card">
            <strong>Erro:</strong> {error}
          </div>
        </main>
      </>
    );
  }

  if (!questions.length) {
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

  const question = questions[currentIndex];

  function selectAnswer(alternativeId: string) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: alternativeId,
    }));
  }

  function previousQuestion() {
    setCurrentIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
  }

  function nextQuestion() {
    setCurrentIndex((previousIndex) =>
      Math.min(questions.length - 1, previousIndex + 1)
    );
  }

  function finishExam() {
    alert(
      `Simulado finalizado. ${
        Object.keys(answers).length
      } respostas registradas nesta sessão.`
    );
  }

  return (
    <>
      <Nav />

      <main className="container">
        <p className="muted">
          Questão {currentIndex + 1} de {questions.length}
        </p>

        <div className="card">
          {question.subject && (
            <p className="muted">{question.subject}</p>
          )}

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
                  checked={
                    answers[question.id] === alternative.id
                  }
                  onChange={() =>
                    selectAnswer(alternative.id)
                  }
                />

                {" "}

                <strong>
                  {alternative.letter})
                </strong>{" "}
                {alternative.content}
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
            onClick={previousQuestion}
          >
            Anterior
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              className="btn"
              onClick={nextQuestion}
            >
              Próxima
            </button>
          ) : (
            <button
              className="btn"
              onClick={finishExam}
            >
              Finalizar
            </button>
          )}
        </div>

        <p
          className="muted"
          style={{ marginTop: 15 }}
        >
          Respondidas: {Object.keys(answers).length} de{" "}
          {questions.length}
        </p>
      </main>
    </>
  );
}
