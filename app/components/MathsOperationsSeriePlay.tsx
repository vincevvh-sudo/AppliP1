"use client";

import { useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "./MiyazakiDecor";
import {
  TITRE_OPERATIONS,
  getOperationsSerie,
  type OperationSerieId,
} from "../data/maths-operations";

type Props = {
  serieId: OperationSerieId;
  backHref: string;
  backLabel?: string;
};

export function MathsOperationsSeriePlay({ serieId, backHref, backLabel = "← Retour" }: Props) {
  const { titre, questions } = getOperationsSerie(serieId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isMissingSecond = current?.mode === "missingSecond";
  const op = current?.op ?? "+";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (input.trim() === "") return;
    const value = Number(input.trim());
    setAnswers((prev) => [...prev, value]);
    setInput("");
    if (index === questions.length - 1) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const score =
    finished &&
    answers.reduce((acc, val, i) => {
      const q = questions[i];
      if (!q || Number.isNaN(val)) return acc;
      if (q.mode === "missingSecond") {
        const correctB = q.b;
        return acc + (val === correctB && q.a + val === q.result ? 1 : 0);
      }
      return acc + (val === q.result ? 1 : 0);
    }, 0);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#1f2933]/10 bg-[#fef9ff]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#1f2933]">
            {TITRE_OPERATIONS} — {titre}
          </span>
          <Link
            href={backHref}
            className="rounded-full bg-[#1f2933]/10 px-4 py-2 text-sm font-medium text-[#1f2933] transition hover:bg-[#1f2933]/20"
          >
            {backLabel}
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-5 py-8">
        <p className="mb-6 text-sm text-[#1f2933]/80">
          Écris la bonne réponse pour chaque calcul. Si tu te trompes, tu passes au calcul suivant. À la fin, tu verras ton
          score. Pour les séries 9 et 10, tu complètes le calcul (le nombre manquant).
        </p>

        {!finished && current ? (
          <div className="rounded-2xl bg-white/95 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[#1f2933]/80">
                Calcul {index + 1} / {questions.length}
              </span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-[#1f2933]">
                <span>{current.a}</span>
                <span>{op}</span>
                {isMissingSecond ? (
                  <>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-20 rounded-xl border-2 border-[#1f2933]/30 bg-white px-3 py-2 text-center text-2xl font-bold focus:border-[#4a7c5a] focus:outline-none"
                      aria-label="Nombre manquant"
                    />
                    <span>=</span>
                    <span>{current.result}</span>
                  </>
                ) : (
                  <>
                    <span>{current.b}</span>
                    <span>=</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-20 rounded-xl border-2 border-[#1f2933]/30 bg-white px-3 py-2 text-center text-2xl font-bold focus:border-[#4a7c5a] focus:outline-none"
                      aria-label="Réponse"
                    />
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={input.trim() === ""}
                  className="rounded-xl bg-[#4a7c5a] px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-xl text-[#1f2933]">Résultat</h2>
            <p className="mt-2 text-2xl font-bold text-[#4a7c5a]">
              {score} / {questions.length}
            </p>
            <p className="mt-2 text-sm text-[#1f2933]/80">
              Voici le détail de tes réponses. Tu peux refaire l&apos;exercice pour t&apos;entraîner.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#1f2933]/85">
              {questions.map((q, i) => {
                const val = answers[i];
                const hasVal = typeof val === "number" && !Number.isNaN(val);
                if (q.mode === "missingSecond") {
                  const correctB = q.b;
                  const correct = hasVal && val === correctB && q.a + val === q.result;
                  return (
                    <li key={q.id} className={correct ? "text-[#166534]" : "text-[#b91c1c]"}>
                      {q.a} + <span className="font-semibold">{hasVal ? val : "—"}</span> = {q.result}{" "}
                      {correct ? "✓" : `✗ (réponse : ${correctB})`}
                    </li>
                  );
                }
                const correct = hasVal && val === q.result;
                return (
                  <li key={q.id} className={correct ? "text-[#166534]" : "text-[#b91c1c]"}>
                    {q.a} + {q.b} = <span className="font-semibold">{hasVal ? val : "—"}</span>{" "}
                    {correct ? "✓" : `✗ (réponse : ${q.result})`}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setIndex(0);
                  setAnswers([]);
                  setInput("");
                  setFinished(false);
                }}
                className="rounded-xl bg-[#1f2933]/5 px-5 py-2 text-sm font-medium text-[#1f2933]"
              >
                Recommencer
              </button>
              <Link
                href={backHref}
                className="rounded-xl bg-[#4a7c5a] px-5 py-2 text-sm font-semibold text-white"
              >
                Retour aux évaluations
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
