"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_JANVIER,
  JANVIER_EX1_SYLLABES,
  JANVIER_EX2_MOTS,
  JANVIER_EX3_MOTS,
  JANVIER_EX4_VRAI_FAUX,
  JANVIER_TOTAL_QUESTIONS,
  janvierScoreSur10,
  getChoixEmojisEx1,
  getChoixEmojisEx2,
  getChoixEmojisEx3,
} from "../../../../data/lecture-janvier-data";
import { saveResultat } from "../../../../data/resultats-storage";
import { getEnfantSession } from "../../../../../utils/enfant-session";
import { LectureEvalAccessGate } from "../../../../components/LectureEvalAccessGate";
import { LECTURE_EVAL_NIVEAU_JANVIER } from "../../../../data/lecture-eval-partage";

const EXO_TITRES = [
  "1. Choisis l'image qui va avec la syllabe.",
  "2. Choisis l'image qui va avec le mot.",
  "3. Choisis l'image qui va avec le mot.",
  "4. La phrase est-elle vraie ou fausse ?",
];

function EnfantLectureJanvierPageInner() {
  const router = useRouter();
  const [exoIndex, setExoIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choix, setChoix] = useState<string[]>([]);
  const [reponse, setReponse] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    if (!termine || resultSaved) return;
    const session = getEnfantSession();
    if (!session?.id) return;
    saveResultat({
      eleve_id: String(session.id),
      son_id: "lecture",
      niveau_id: "lecture-janvier",
      points: score,
      points_max: JANVIER_TOTAL_QUESTIONS,
      reussi: score >= JANVIER_TOTAL_QUESTIONS / 2,
    }).finally(() => setResultSaved(true));
  }, [resultSaved, score, termine]);

  useEffect(() => {
    if (!termine || !resultSaved) return;
    const t = setTimeout(() => {
      router.replace("/enfant/resultats");
    }, 1200);
    return () => clearTimeout(t);
  }, [termine, resultSaved, router]);

  const isExo4 = exoIndex === 3;
  const itemsLength =
    exoIndex === 0
      ? JANVIER_EX1_SYLLABES.length
      : exoIndex === 1
        ? JANVIER_EX2_MOTS.length
        : exoIndex === 2
          ? JANVIER_EX3_MOTS.length
          : JANVIER_EX4_VRAI_FAUX.length;
  const isLastQuestion = questionIndex === itemsLength - 1;
  const isLastExo = exoIndex === 3;

  useEffect(() => {
    if (exoIndex === 0) setChoix(getChoixEmojisEx1(questionIndex));
    else if (exoIndex === 1) setChoix(getChoixEmojisEx2(questionIndex));
    else if (exoIndex === 2) setChoix(getChoixEmojisEx3(questionIndex));
    setReponse(null);
  }, [exoIndex, questionIndex]);

  const correctIndex = useMemo(() => {
    if (exoIndex === 0) return choix.indexOf(JANVIER_EX1_SYLLABES[questionIndex].emoji);
    if (exoIndex === 1) return choix.indexOf(JANVIER_EX2_MOTS[questionIndex].emoji);
    if (exoIndex === 2) {
      const item = JANVIER_EX3_MOTS[questionIndex];
      return choix.indexOf(item.image ?? item.emoji);
    }
    return -1;
  }, [exoIndex, questionIndex, choix]);

  const handleChoixEmoji = (index: number) => {
    if (reponse !== null) return;
    setReponse(index);
    if (index === correctIndex) setScore((s) => s + 1);
    setTimeout(() => {
      if (isLastQuestion && isLastExo) setTermine(true);
      else if (isLastQuestion) {
        setExoIndex((e) => e + 1);
        setQuestionIndex(0);
      } else setQuestionIndex((q) => q + 1);
    }, 600);
  };

  const handleVraiFaux = (valeur: boolean) => {
    if (reponse !== null) return;
    const correct = JANVIER_EX4_VRAI_FAUX[questionIndex].correct;
    setReponse(valeur === correct ? 1 : 0);
    if (valeur === correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (isLastQuestion) setTermine(true);
      else setQuestionIndex((q) => q + 1);
    }, 600);
  };

  const totalDone =
    (exoIndex === 0 ? 0 : exoIndex === 1 ? JANVIER_EX1_SYLLABES.length : exoIndex === 2 ? JANVIER_EX1_SYLLABES.length + JANVIER_EX2_MOTS.length : JANVIER_EX1_SYLLABES.length + JANVIER_EX2_MOTS.length + JANVIER_EX3_MOTS.length) +
    questionIndex +
    1;

  if (termine) {
    const sur10 = janvierScoreSur10(score);
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <span className="font-display text-xl text-[#2d4a3e]">Évaluation {TITRE_JANVIER}</span>
            <Link href="/enfant/evaluations" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
              ← Évaluations
            </Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
            <p className="text-xl text-[#2d4a3e]">
              Tu as obtenu <strong>{score}</strong> bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {JANVIER_TOTAL_QUESTIONS}.
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#2d4a3e]">Score : {sur10} / 10</p>
          </div>
          <Link href="/enfant/resultats" className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
            Vers mes résultats
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
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation {TITRE_JANVIER}</span>
          <span className="text-sm text-[#2d4a3e]/70">
            {totalDone} / {JANVIER_TOTAL_QUESTIONS}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10">
        <p className="mb-4 text-center text-sm font-medium text-[#2d4a3e]/80">
          {EXO_TITRES[exoIndex]}
        </p>

        <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
          {!isExo4 ? (
            <>
              <p className="text-center text-2xl font-semibold text-[#2d4a3e]">
                {exoIndex === 0 && JANVIER_EX1_SYLLABES[questionIndex].syllabe}
                {exoIndex === 1 && JANVIER_EX2_MOTS[questionIndex].mot}
                {exoIndex === 2 && JANVIER_EX3_MOTS[questionIndex].mot}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {choix.map((emojiOrImage, index) => (
                  <button
                    key={`${exoIndex}-${questionIndex}-${index}`}
                    type="button"
                    onClick={() => handleChoixEmoji(index)}
                    disabled={reponse !== null}
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden transition ${
                      reponse === null
                        ? "bg-[#a8d5ba]/30 hover:bg-[#a8d5ba]/50"
                        : index === correctIndex
                          ? "bg-green-200 ring-2 ring-green-500"
                          : reponse === index
                            ? "bg-red-100 ring-2 ring-red-400"
                            : "bg-[#2d4a3e]/5 opacity-60"
                    } ${emojiOrImage.startsWith("/") ? "p-1" : "text-4xl"}`}
                  >
                    {emojiOrImage.startsWith("/") ? (
                      <img src={emojiOrImage} alt="" className="h-full w-full object-contain" />
                    ) : (
                      emojiOrImage
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-lg font-medium text-[#2d4a3e]">
                {JANVIER_EX4_VRAI_FAUX[questionIndex].phrase}
              </p>
              <div className="mt-8 flex justify-center gap-8">
                <button
                  type="button"
                  onClick={() => handleVraiFaux(false)}
                  disabled={reponse !== null}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-6 text-4xl transition ${
                    reponse === null ? "bg-[#a8d5ba]/30 hover:bg-[#a8d5ba]/50" : "opacity-60"
                  }`}
                >
                  <span aria-hidden>👎</span>
                  <span className="text-sm font-medium">Faux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVraiFaux(true)}
                  disabled={reponse !== null}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-6 text-4xl transition ${
                    reponse === null ? "bg-[#a8d5ba]/30 hover:bg-[#a8d5ba]/50" : "opacity-60"
                  }`}
                >
                  <span aria-hidden>👍</span>
                  <span className="text-sm font-medium">Vrai</span>
                </button>
              </div>
            </>
          )}
        </div>

        <Link href="/enfant/evaluations" className="mt-8 inline-block text-sm text-[#2d4a3e]/70 underline">
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}

export default function EnfantLectureJanvierPage() {
  return (
    <LectureEvalAccessGate niveauId={LECTURE_EVAL_NIVEAU_JANVIER}>
      <EnfantLectureJanvierPageInner />
    </LectureEvalAccessGate>
  );
}
