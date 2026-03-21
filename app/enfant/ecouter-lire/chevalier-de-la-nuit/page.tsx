"use client";

import { useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { TITRE_CHEVALIER, ITEMS_CHEVALIER } from "../../../data/ecouter-lire-chevalier";

type Reponse = boolean | null;

export default function EnfantChevalierPage() {
  const [reponses, setReponses] = useState<Reponse[]>(ITEMS_CHEVALIER.map(() => null));
  const [envoye, setEnvoye] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleChoice = (index: number, value: boolean) => {
    if (envoye) return;
    setReponses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    const total = ITEMS_CHEVALIER.filter((item, i) => reponses[i] === item.correct).length;
    setScore(total);
    setEnvoye(true);
  };

  const allAnswered = reponses.every((r) => r !== null);
  const total = ITEMS_CHEVALIER.length;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_CHEVALIER}</span>
          <Link
            href="/enfant/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <p className="mb-6 flex items-center gap-2 text-sm text-[#2d4a3e]/80">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8d4e8]/60">🎧</span>
          Écoute l&apos;histoire, puis coche la bonne réponse pour chaque phrase.
        </p>
        <p className="mb-6 font-medium text-[#2d4a3e]">Coche la bonne réponse.</p>

        <div className="rounded-xl bg-white/95 p-4 shadow-lg sm:p-6">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[#2d4a3e]/15 pb-2 text-sm font-semibold text-[#2d4a3e] sm:gap-4">
            <div />
            <span className="flex items-center justify-center gap-1">
              <span className="text-lg" aria-hidden>👍</span> Vrai
            </span>
            <span className="flex items-center justify-center gap-1">
              <span className="text-lg" aria-hidden>👎</span> Faux
            </span>
          </div>
          {ITEMS_CHEVALIER.map((item, i) => {
            const correct = reponses[i] === item.correct;
            return (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[#2d4a3e]/10 py-3 last:border-0 sm:gap-4 ${envoye ? (correct ? "bg-[#a8d5ba]/15" : "bg-[#f0d0d0]/30") : ""}`}
              >
                <p className="text-[#2d4a3e] flex items-center gap-2">
                  <span className="mr-2 font-medium text-[#2d4a3e]/70">{i + 1}.</span>
                  {item.phrase}
                  {envoye && (
                    <span className="shrink-0" aria-label={correct ? "Correct" : "Incorrect"}>
                      {correct ? <span className="text-[#4a7c5a] text-lg">✓</span> : <span className="text-[#c45a5a] text-lg">✗</span>}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => handleChoice(i, true)}
                  disabled={envoye}
                  aria-pressed={reponses[i] === true}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition sm:h-12 sm:w-12 ${
                    reponses[i] === true
                      ? "border-[#4a7c5a] bg-[#4a7c5a] text-white"
                      : "border-[#2d4a3e]/25 bg-white text-[#2d4a3e]/60 hover:border-[#4a7c5a]/50"
                  } ${envoye ? "opacity-80" : ""}`}
                >
                  <span className="text-lg sm:text-xl">👍</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice(i, false)}
                  disabled={envoye}
                  aria-pressed={reponses[i] === false}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition sm:h-12 sm:w-12 ${
                    reponses[i] === false
                      ? "border-[#c45a5a] bg-[#c45a5a] text-white"
                      : "border-[#2d4a3e]/25 bg-white text-[#2d4a3e]/60 hover:border-[#c45a5a]/50"
                  } ${envoye ? "opacity-80" : ""}`}
                >
                  <span className="text-lg sm:text-xl">👎</span>
                </button>
              </div>
            );
          })}
        </div>

        {!envoye ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer mes réponses
            </button>
            {!allAnswered && (
              <p className="mt-2 text-sm text-[#2d4a3e]/60">Réponds à toutes les phrases pour pouvoir envoyer.</p>
            )}
          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-[#a8d5ba]/30 p-6 text-center">
            <p className="font-display text-xl text-[#2d4a3e]">Résultat</p>
            <p className="mt-2 text-2xl font-bold text-[#4a7c5a]">
              {score !== null ? `${score} / ${total}` : ""}
            </p>
            <p className="mt-2 text-sm text-[#2d4a3e]/80">
              {score !== null && score === total && "Bravo, tout est correct !"}
              {score !== null && score < total && score >= total / 2 && "Bien joué ! Tu peux réécouter l'histoire et réessayer."}
              {score !== null && score < total / 2 && "Réécoute l'histoire et réessaie quand tu veux."}
            </p>
            <Link
              href="/enfant/evaluations"
              className="mt-6 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
            >
              ← Retour aux évaluations
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
