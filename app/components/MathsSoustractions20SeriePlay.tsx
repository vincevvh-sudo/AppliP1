"use client";

import { useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "./MiyazakiDecor";
import {
  TITRE_SOUSTRACTIONS_JUSQUE_20,
  getSoustraction20Serie,
  type Soustraction20SerieId,
} from "../data/maths-soustractions-20";

type Props = {
  serieId: Soustraction20SerieId;
  backHref: string;
  backLabel?: string;
};

export function MathsSoustractions20SeriePlay({ serieId, backHref, backLabel = "← Retour" }: Props) {
  const { titre, questions } = getSoustraction20Serie(serieId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);

  const current = questions[index];

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
      return acc + (val === q.result ? 1 : 0);
    }, 0);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#1f2933]/10 bg-[#fef9ff]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#1f2933]">
            {TITRE_SOUSTRACTIONS_JUSQUE_20} — {titre}
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
          10 soustractions dans la série. Départ entre 10 et 20, réponse entre 10 et 20.
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
                <span>-</span>
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
            <ul className="mt-4 space-y-2 text-sm text-[#1f2933]/85">
              {questions.map((q, i) => {
                const val = answers[i];
                const hasVal = typeof val === "number" && !Number.isNaN(val);
                const correct = hasVal && val === q.result;
                return (
                  <li key={q.id} className={correct ? "text-[#166534]" : "text-[#b91c1c]"}>
                    {q.a} - {q.b} = <span className="font-semibold">{hasVal ? val : "—"}</span>{" "}
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
                Retour aux exercices
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
