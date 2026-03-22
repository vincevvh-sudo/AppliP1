"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_LECTURE_MOTS,
  LECTURE_MOTS_ITEMS,
  getChoixEmojis,
} from "../../../../data/lecture-mots-data";
import { saveResultat } from "../../../../data/resultats-storage";
import { getEnfantSession } from "../../../../../utils/enfant-session";
import { LectureEvalAccessGate } from "../../../../components/LectureEvalAccessGate";
import { LECTURE_EVAL_NIVEAU_MOTS } from "../../../../data/lecture-eval-partage";

function EnfantLectureMotsPageInner() {
  const [step, setStep] = useState(0);
  const [choix, setChoix] = useState<string[]>(() => getChoixEmojis(0));
  const [reponse, setReponse] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const item = LECTURE_MOTS_ITEMS[step];
  const total = LECTURE_MOTS_ITEMS.length;
  const isLast = step === total - 1;

  useEffect(() => {
    setChoix(getChoixEmojis(step));
    setReponse(null);
  }, [step]);

  const correctIndex = useMemo(() => {
    if (!item) return -1;
    return choix.indexOf(item.emoji);
  }, [item, choix]);

  const handleClick = (index: number) => {
    if (reponse !== null) return;
    setReponse(index);
    if (index === correctIndex) setScore((s) => s + 1);
    if (isLast) {
      setTimeout(() => setTermine(true), 600);
    } else {
      setTimeout(() => setStep((s) => s + 1), 600);
    }
  };

  useEffect(() => {
    if (!termine || resultSaved) return;
    const session = getEnfantSession();
    if (!session?.id) return;
    saveResultat({
      eleve_id: String(session.id),
      son_id: "lecture",
      niveau_id: "lecture-mots",
      points: score,
      points_max: total,
      reussi: score >= total / 2,
    }).finally(() => setResultSaved(true));
  }, [resultSaved, score, termine, total]);

  if (termine) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_MOTS}</span>
            <Link
              href="/enfant/evaluations"
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Évaluations
            </Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
            <p className="text-xl text-[#2d4a3e]">
              Tu as mis <strong>{score}</strong> bonne{score > 1 ? "s" : ""} image{score > 1 ? "s" : ""} sur les mots.
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#2d4a3e]">
              Score : {score} / 10
            </p>
          </div>
          <Link
            href="/enfant/evaluations"
            className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_MOTS}</span>
          <span className="text-sm text-[#2d4a3e]/70">
            {step + 1} / {total}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10">
        <p className="mb-6 text-center text-sm text-[#2d4a3e]/80">
          Choisis l&apos;image qui va avec le mot.
        </p>

        <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
          <p className="text-center text-2xl font-semibold text-[#2d4a3e]">{item.mot}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {choix.map((emoji, index) => (
              <button
                key={`${step}-${index}`}
                type="button"
                onClick={() => handleClick(index)}
                disabled={reponse !== null}
                className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl transition ${
                  reponse === null
                    ? "bg-[#a8d5ba]/30 hover:bg-[#a8d5ba]/50"
                    : index === correctIndex
                      ? "bg-green-200 ring-2 ring-green-500"
                      : reponse === index
                        ? "bg-red-100 ring-2 ring-red-400"
                        : "bg-[#2d4a3e]/5 opacity-60"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/enfant/evaluations"
          className="mt-8 inline-block text-sm text-[#2d4a3e]/70 underline"
        >
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}

export default function EnfantLectureMotsPage() {
  return (
    <LectureEvalAccessGate niveauId={LECTURE_EVAL_NIVEAU_MOTS}>
      <EnfantLectureMotsPageInner />
    </LectureEvalAccessGate>
  );
}
