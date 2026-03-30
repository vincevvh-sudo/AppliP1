"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { saveResultat } from "../../../data/resultats-storage";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";
import {
  JOURS_SEMAINE,
  TITRE_JOURS_SEMAINE,
  melangerJours,
  type JourSemaineItem,
} from "../../../data/jours-semaine-data";

const IconMaths = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantJoursSemainePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);

  const [ordre, setOrdre] = useState<JourSemaineItem[]>(() => melangerJours(JOURS_SEMAINE));
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = ordre.length;

  const allAnswered = useMemo(
    () =>
      ordre.every((j) => {
        const a = answers[j.id]?.trim() ?? "";
        const n = Number(a);
        return a !== "" && Number.isInteger(n) && n >= 1 && n <= 7;
      }),
    [ordre, answers]
  );

  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const recommencer = useCallback(() => {
    setOrdre(melangerJours(JOURS_SEMAINE));
    setAnswers({});
    setFinished(false);
    setPoints(null);
    setSaveError(null);
    setResultSaved(false);
  }, []);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) router.replace("/enfant");
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void moduleEstAccessiblePourEleve("jours-semaine", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/grandeur");
    });
  }, [session, router]);

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleTerminer = useCallback(async () => {
    if (!session) return;
    if (!allAnswered || saving || finished) return;

    setSaving(true);
    setSaveError(null);

    const correct = ordre.reduce<number>((acc, j) => {
      const n = Number(answers[j.id]?.trim());
      return acc + (n === j.numero ? 1 : 0);
    }, 0);

    setPoints(correct);
    setFinished(true);

    try {
      await saveResultat({
        eleve_id: String(session.id),
        son_id: "maths-jours-semaine",
        niveau_id: "maths-jours-semaine",
        points: correct,
        points_max: total,
        reussi: correct >= Math.ceil(total * 0.6),
        detail_exercices: [
          {
            type: "jours-semaine",
            titre: TITRE_JOURS_SEMAINE,
            points: correct,
            pointsMax: total,
          },
        ],
      });
      setResultSaved(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erreur enregistrement");
    } finally {
      setSaving(false);
    }
  }, [allAnswered, answers, finished, ordre, saving, session, total]);

  useEffect(() => {
    if (!finished || !resultSaved || saveError) return;
    const t = setTimeout(() => {
      router.replace("/enfant/resultats");
    }, 1200);
    return () => clearTimeout(t);
  }, [finished, resultSaved, saveError, router]);

  if (!session) return null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant/maths/exercice/grandeur"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_JOURS_SEMAINE}
          </Link>
          <Link
            href="/enfant/maths/exercice/grandeur"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Grandeur
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-5 py-8">
        <h1 className="font-display text-2xl text-white">{TITRE_JOURS_SEMAINE}</h1>
        <p className="mt-1 text-sm text-white/95">
          Lundi = 1, mardi = 2, mercredi = 3, jeudi = 4, vendredi = 5, samedi = 6, dimanche = 7. Les jours sont
          mélangés : écris le bon numéro à côté de chaque jour.
        </p>

        {!finished ? (
          <>
            <div className="mt-6 space-y-3 rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-lg">
              {ordre.map((j, index) => (
                <div key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-[#faf8f3] px-3 py-2">
                  <span className="min-w-[1.25rem] text-sm font-medium text-[#2d4a3e]/60">{index + 1}.</span>
                  <span className="min-w-[6.5rem] font-display text-lg font-semibold text-[#2d4a3e]">{j.label}</span>
                  <span className="text-sm text-[#2d4a3e]/70">→</span>
                  <label htmlFor={`jour-${j.id}`} className="sr-only">
                    Numéro pour {j.label}
                  </label>
                  <input
                    id={`jour-${j.id}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={7}
                    value={answers[j.id] ?? ""}
                    onChange={(e) => setAnswer(j.id, e.target.value)}
                    className="w-16 rounded-lg border-2 border-[#2d4a3e]/25 bg-white px-2 py-2 text-center text-lg font-semibold text-[#2d4a3e] focus:border-[#4a7c5a] focus:outline-none"
                    placeholder="?"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!allAnswered || saving}
                onClick={() => void handleTerminer()}
                className="rounded-xl bg-[#4a7c5a] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Terminer
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-xl text-[#2d4a3e]">Résultat</h2>
            <p className="mt-2 text-2xl font-bold text-[#4a7c5a]">
              {points} / {total}
            </p>
            {saveError ? <p className="mt-2 text-sm text-red-700">{saveError}</p> : null}
            {saving ? <p className="mt-2 text-sm text-[#2d4a3e]/70">Enregistrement…</p> : null}
            <ul className="mt-4 space-y-1 text-sm text-[#2d4a3e]/85">
              {ordre.map((j) => {
                const rep = Number(answers[j.id]?.trim());
                const ok = rep === j.numero;
                return (
                  <li key={j.id} className={ok ? "text-[#166534]" : "text-[#b91c1c]"}>
                    {j.label} : {rep} — {ok ? "✓" : `✗ (${j.numero})`}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={recommencer}
                className="rounded-xl bg-[#1f2933]/10 px-5 py-2 text-sm font-medium text-[#2d4a3e]"
              >
                Recommencer (nouvel ordre)
              </button>
              <Link
                href="/enfant/maths/exercice/grandeur"
                className="rounded-xl bg-[#c4a8e8]/80 px-5 py-2 text-sm font-medium text-[#2d4a3e]"
              >
                ← Retour
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
