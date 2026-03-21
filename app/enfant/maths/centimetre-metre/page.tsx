"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import {
  QUESTIONS_CENTIMETRE_METRE,
  TITRE_CENTIMETRE_METRE,
  scoreSur10CentimetreMetre,
  type Unite,
} from "../../../data/centimetre-metre-data";
import { saveCentimetreMetreResult } from "../../../data/centimetre-metre-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantCentimetreMetrePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const [answers, setAnswers] = useState<(Unite | null)[]>(() =>
    Array(QUESTIONS_CENTIMETRE_METRE.length).fill(null)
  );
  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) router.replace("/enfant");
  }, [router]);

  const setAnswer = useCallback((index: number, value: Unite) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const allAnswered = answers.every((a) => a !== null);

  const handleTerminer = useCallback(() => {
    if (!allAnswered || !session) return;
    let correct = 0;
    QUESTIONS_CENTIMETRE_METRE.forEach((q, i) => {
      if (answers[i] === q.uniteCorrecte) correct++;
    });
    setPoints(correct);
    setFinished(true);
    setSaving(true);
    setSaveError(null);
    saveCentimetreMetreResult(session.id, correct)
      .then(() => setSaving(false))
      .catch((err) => {
        setSaveError(err?.message ?? "Erreur enregistrement");
        setSaving(false);
      });
  }, [allAnswered, answers, session]);

  if (!session) return null;

  const scoreSur10 = points != null ? scoreSur10CentimetreMetre(points) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/evaluations" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            {TITRE_CENTIMETRE_METRE}
          </Link>
          <Link href="/enfant/evaluations" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Mes évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_CENTIMETRE_METRE}</h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/75">
          Choisis pour chaque objet : on le mesure en mètre ou en centimètre ?
        </p>

        {!finished ? (
          <>
            <div className="mt-6 space-y-4">
              {QUESTIONS_CENTIMETRE_METRE.map((q, index) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-sm"
                >
                  <span className="text-[#2d4a3e]/70 font-medium w-6">{q.id}.</span>
                  <span className="text-2xl" role="img" aria-hidden>{q.emoji}</span>
                  <span className="min-w-0 flex-1 font-medium text-[#2d4a3e] capitalize">{q.nomObjet}</span>
                  <span className="text-sm text-[#2d4a3e]/70">c&apos;est en :</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAnswer(index, "mètre")}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        answers[index] === "mètre"
                          ? "bg-[#c4a8e8] text-[#2d4a3e]"
                          : "bg-[#2d4a3e]/10 text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/20"
                      }`}
                    >
                      mètre
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswer(index, "centimètre")}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        answers[index] === "centimètre"
                          ? "bg-[#c4a8e8] text-[#2d4a3e]"
                          : "bg-[#2d4a3e]/10 text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/20"
                      }`}
                    >
                      centimètre
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleTerminer}
                disabled={!allAnswered}
                className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terminer
              </button>
              {!allAnswered && (
                <p className="text-sm text-[#2d4a3e]/60">Réponds à toutes les questions pour terminer.</p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
            <p className="text-lg text-[#2d4a3e]">
              Tu as obtenu <strong>{points} point{(points ?? 0) > 1 ? "s" : ""}</strong> sur 20.
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#2d4a3e]">
              Score : {scoreSur10} / 10
            </p>
            {saving && <p className="mt-2 text-sm text-[#2d4a3e]/70">Enregistrement…</p>}
            {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
          </div>
        )}

        <Link href="/enfant/evaluations" className="mt-10 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}
