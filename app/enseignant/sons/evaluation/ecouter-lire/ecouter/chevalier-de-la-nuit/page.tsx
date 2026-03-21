"use client";

import { useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../../../components/MiyazakiDecor";
import { TITRE_CHEVALIER, ITEMS_CHEVALIER } from "../../../../../../data/ecouter-lire-chevalier";

type Reponse = boolean | null;

export default function EnseignantChevalierPage() {
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
            href="/enseignant/sons/evaluation/ecouter-lire/ecouter"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation écouter
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_CHEVALIER}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Les élèves répondent Vrai ou Faux à chaque phrase après avoir écouté l&apos;histoire.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/enfant/ecouter-lire/chevalier-de-la-nuit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            Ouvrir le test (vue élève) ↗
          </a>
        </div>

        {/* Tester le test (même interface que les élèves) */}
        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Tester le test</h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/70">Réponds comme un élève pour vérifier le déroulement.</p>
          {!envoye ? (
            <>
              <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[#2d4a3e]/15 pb-2 text-sm font-semibold text-[#2d4a3e] sm:gap-4">
                <div />
                <span className="flex items-center justify-center gap-1">👍 Vrai</span>
                <span className="flex items-center justify-center gap-1">👎 Faux</span>
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
                        reponses[i] === true ? "border-[#4a7c5a] bg-[#4a7c5a] text-white" : "border-[#2d4a3e]/25 bg-white text-[#2d4a3e]/60 hover:border-[#4a7c5a]/50"
                      }`}
                    >
                      <span className="text-lg sm:text-xl">👍</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChoice(i, false)}
                      disabled={envoye}
                      aria-pressed={reponses[i] === false}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition sm:h-12 sm:w-12 ${
                        reponses[i] === false ? "border-[#c45a5a] bg-[#c45a5a] text-white" : "border-[#2d4a3e]/25 bg-white text-[#2d4a3e]/60 hover:border-[#c45a5a]/50"
                      }`}
                    >
                      <span className="text-lg sm:text-xl">👎</span>
                    </button>
                  </div>
                );
              })}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="rounded-xl bg-[#2d4a3e] px-8 py-3 font-semibold text-white transition hover:bg-[#2d4a3e]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer mes réponses
                </button>
                {!allAnswered && <p className="mt-2 text-sm text-[#2d4a3e]/60">Réponds à toutes les phrases pour envoyer.</p>}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-lg bg-[#a8d5ba]/30 p-4 text-center">
              <p className="font-medium text-[#2d4a3e]">Résultat : {score !== null ? `${score} / ${total}` : ""}</p>
              <button
                type="button"
                onClick={() => { setReponses(ITEMS_CHEVALIER.map(() => null)); setEnvoye(false); setScore(null); }}
                className="mt-3 text-sm font-medium text-[#4a7c5a] underline hover:no-underline"
              >
                Refaire le test
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Réponses attendues (pour correction)</h2>
          <ul className="mt-4 space-y-2">
            {ITEMS_CHEVALIER.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d4a3e]/10 font-medium text-[#2d4a3e]">
                  {i + 1}
                </span>
                <span className="text-[#2d4a3e]/90">{item.phrase}</span>
                <span className="shrink-0 font-medium text-[#4a7c5a]">
                  {item.correct ? "Vrai" : "Faux"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/evaluation/ecouter-lire/ecouter"
          className="mt-8 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour à Évaluation écouter
        </Link>
      </div>
    </main>
  );
}
