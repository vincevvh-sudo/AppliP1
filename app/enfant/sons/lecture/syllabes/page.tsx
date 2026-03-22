"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_LECTURE_SYLLABES,
  QUESTIONS_LECTURE_SYLLABES,
  getSonPourTTS,
} from "../../../../data/lecture-syllabes";
import { saveResultat } from "../../../../data/resultats-storage";
import { getEnfantSession } from "../../../../../utils/enfant-session";
import { LectureEvalAccessGate } from "../../../../components/LectureEvalAccessGate";
import { LECTURE_EVAL_NIVEAU_SYLLABES } from "../../../../data/lecture-eval-partage";

export default function EnfantLectureSyllabesPage() {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>(
    QUESTIONS_LECTURE_SYLLABES.map(() => null)
  );
  const [envoye, setEnvoye] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const question = QUESTIONS_LECTURE_SYLLABES[step];
  const total = QUESTIONS_LECTURE_SYLLABES.length;
  const isLast = step === total - 1;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const lireSon = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const textePrononce = getSonPourTTS(text);
    const u = new SpeechSynthesisUtterance(textePrononce);
    u.lang = "fr-FR";
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find((v) => v.lang.startsWith("fr"));
    if (fr) u.voice = fr;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handleChoice = (index: number) => {
    if (reponses[step] !== null) return;
    setReponses((prev) => {
      const next = [...prev];
      next[step] = index;
      return next;
    });
  };

  const handleSuivant = () => {
    if (!isLast) setStep((s) => s + 1);
    else setEnvoye(true);
  };

  const score = reponses.reduce<number>(
    (acc, r, i) => acc + (r === QUESTIONS_LECTURE_SYLLABES[i].correctIndex ? 1 : 0),
    0
  );

  useEffect(() => {
    if (!envoye || resultSaved) return;
    const session = getEnfantSession();
    if (!session?.id) return;
    saveResultat({
      eleve_id: String(session.id),
      son_id: "lecture",
      niveau_id: "lecture-syllabes",
      points: score,
      points_max: total,
      reussi: score >= total / 2,
      detail_exercices: QUESTIONS_LECTURE_SYLLABES.map((q, i) => ({
        type: "lecture-syllabe",
        titre: `Question ${i + 1}`,
        points: reponses[i] === q.correctIndex ? 1 : 0,
        pointsMax: 1,
      })),
    }).finally(() => setResultSaved(true));
  }, [envoye, resultSaved, score, total, reponses]);

  return (
    <LectureEvalAccessGate niveauId={LECTURE_EVAL_NIVEAU_SYLLABES}>
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_SYLLABES}</span>
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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#a8d5ba]/60">🎧</span>
          Écoute le son (ou ton professeur le dit), puis clique sur la syllabe ou le mot qui correspond.
        </p>

        {!envoye ? (
          <>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2 shadow">
              <span className="text-sm font-medium text-[#2d4a3e]/80">
                Question {step + 1} / {total}
              </span>
              <div className="flex gap-1">
                {QUESTIONS_LECTURE_SYLLABES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    className={`h-2 w-2 rounded-full transition sm:h-2.5 sm:w-2.5 ${
                      i === step ? "bg-[#4a7c5a]" : reponses[i] !== null ? "bg-[#4a7c5a]/50" : "bg-[#2d4a3e]/20"
                    }`}
                    aria-label={`Question ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-lg sm:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#a8d5ba]/60 font-display text-lg text-[#2d4a3e]">
                  {step + 1}
                </span>
                <span className="font-medium text-[#2d4a3e]">
                  Quel son as-tu entendu ?
                </span>
                <button
                  type="button"
                  onClick={() => lireSon(question.son)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#a8d5ba]/80"
                  aria-label="Écouter le son"
                >
                  <span className="text-lg" aria-hidden>🔊</span>
                  Écouter le son
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {question.options.map((opt, i) => {
                  const selected = reponses[step] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChoice(i)}
                      className={`min-w-[4rem] rounded-xl border-2 px-4 py-3 text-lg font-medium transition ${
                        selected
                          ? "border-[#4a7c5a] bg-[#a8d5ba]/40 text-[#2d4a3e]"
                          : "border-[#2d4a3e]/20 bg-white text-[#2d4a3e] hover:border-[#4a7c5a]/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-xl bg-[#2d4a3e]/10 px-5 py-2 font-medium text-[#2d4a3e] disabled:opacity-40"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={handleSuivant}
                  disabled={reponses[step] === null}
                  className="rounded-xl bg-[#4a7c5a] px-6 py-2 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLast ? "Voir le résultat" : "Suivant →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-xl text-[#2d4a3e]">Résultat</h2>
            <p className="mt-2 text-2xl font-bold text-[#4a7c5a]">
              {score} / {total}
            </p>
            <p className="mt-2 text-sm text-[#2d4a3e]/80">
              {score === total && "Bravo, tout est correct !"}
              {score !== total && score >= total / 2 && "Bien joué !"}
              {score !== total && score < total / 2 && "Tu peux réécouter les sons et réessayer."}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#2d4a3e]/80">
              {QUESTIONS_LECTURE_SYLLABES.map((q, i) => {
                const r = reponses[i];
                const correct = r === q.correctIndex;
                return (
                  <li key={i} className={`flex items-center gap-2 ${correct ? "text-[#4a7c5a]" : "text-[#c45a5a]"}`}>
                    <span>{correct ? "✓" : "✗"}</span>
                    <span>Question {i + 1} : {q.son} → {r !== null ? q.options[r] : "—"} {!correct && `(réponse : ${q.options[q.correctIndex]})`}</span>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/enfant/evaluations"
              className="mt-6 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
            >
              ← Retour aux évaluations
            </Link>
          </div>
        )}
      </div>
    </main>
    </LectureEvalAccessGate>
  );
}
