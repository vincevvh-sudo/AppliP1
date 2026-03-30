"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { EuroMonnaiePile, descriptionAccessibilite } from "../../../components/maths/EuroMonnaieGraphics";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { saveResultat } from "../../../data/resultats-storage";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";
import {
  QUESTIONS_EUROS_MONNAIE,
  TITRE_EUROS_MONNAIE,
  totalEuros,
} from "../../../data/euros-monnaie-data";

const IconMaths = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantEurosMonnaiePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const total = QUESTIONS_EUROS_MONNAIE.length;

  const [answers, setAnswers] = useState<string[]>(() => Array(total).fill(""));
  const allAnswered = useMemo(
    () =>
      answers.every((a) => {
        const n = Number(a.trim());
        return a.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= 20;
      }),
    [answers]
  );

  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const setAnswer = useCallback((index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) router.replace("/enfant");
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void moduleEstAccessiblePourEleve("euros-monnaie", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/grandeur");
    });
  }, [session, router]);

  const handleTerminer = useCallback(async () => {
    if (!session) return;
    if (!allAnswered || saving || finished) return;

    setSaving(true);
    setSaveError(null);

    const correct = QUESTIONS_EUROS_MONNAIE.reduce<number>((acc, q, i) => {
      const n = Number(answers[i].trim());
      return acc + (n === totalEuros(q) ? 1 : 0);
    }, 0);

    setPoints(correct);
    setFinished(true);

    try {
      await saveResultat({
        eleve_id: String(session.id),
        son_id: "maths-euros-monnaie",
        niveau_id: "maths-euros-monnaie",
        points: correct,
        points_max: total,
        reussi: correct >= Math.ceil(total * 0.6),
        detail_exercices: [
          {
            type: "euros-monnaie",
            titre: TITRE_EUROS_MONNAIE,
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
  }, [allAnswered, answers, finished, saving, session, total]);

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
            {TITRE_EUROS_MONNAIE}
          </Link>
          <Link
            href="/enfant/maths/exercice/grandeur"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Grandeur
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-xl px-5 py-8">
        <h1 className="font-display text-2xl text-white">{TITRE_EUROS_MONNAIE}</h1>
        <p className="mt-1 text-sm text-white/95">
          Compte les pièces de 1 € et 2 € et les billets de 5 € et 10 €. Écris le total en euros (entre 1 et 20).
        </p>

        {!finished ? (
          <>
            <div className="mt-6 space-y-5">
              {QUESTIONS_EUROS_MONNAIE.map((q, index) => {
                const labelId = `euro-q-${q.id}-label`;
                return (
                  <div key={q.id} className="rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-sm">
                    <p id={labelId} className="sr-only">
                      Question {index + 1} : {descriptionAccessibilite(q)}. Combien d&apos;euros en tout ?
                    </p>
                    <p className="mb-2 text-sm font-medium text-[#2d4a3e]/80" aria-hidden>
                      {index + 1}. Total en euros ?
                    </p>
                    <EuroMonnaiePile n1={q.n1} n2={q.n2} n5={q.n5} n10={q.n10} labelId={labelId} />
                    <div className="mt-3 flex items-center gap-2">
                      <label htmlFor={`euro-ans-${q.id}`} className="text-sm text-[#2d4a3e]/80">
                        Total
                      </label>
                      <input
                        id={`euro-ans-${q.id}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        value={answers[index]}
                        onChange={(e) => setAnswer(index, e.target.value)}
                        className="w-24 rounded-lg border-2 border-[#2d4a3e]/25 bg-white px-3 py-2 text-center text-lg font-semibold text-[#2d4a3e] focus:border-[#4a7c5a] focus:outline-none"
                        aria-describedby={labelId}
                      />
                      <span className="text-sm text-[#2d4a3e]/70">€</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
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
            <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto text-sm text-[#2d4a3e]/85">
              {QUESTIONS_EUROS_MONNAIE.map((q, i) => {
                const att = totalEuros(q);
                const rep = Number(answers[i].trim());
                const ok = rep === att;
                return (
                  <li key={q.id} className={ok ? "text-[#166534]" : "text-[#b91c1c]"}>
                    {i + 1}. Réponse : {rep} € — {ok ? "✓" : `✗ (${att} €)`}
                  </li>
                );
              })}
            </ul>
            <Link
              href="/enfant/maths/exercice/grandeur"
              className="mt-6 inline-block rounded-xl bg-[#c4a8e8]/80 px-5 py-2 text-sm font-medium text-[#2d4a3e]"
            >
              ← Retour
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
