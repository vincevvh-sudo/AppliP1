"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { saveResultat } from "../../../data/resultats-storage";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";
import {
  CATEGORIES_INSTRUMENTS,
  ITEMS_INSTRUMENTS_MESURE,
  TITRE_INSTRUMENTS_MESURE,
  melangerInstruments,
  type CategorieInstrumentId,
  type InstrumentMesureItem,
} from "../../../data/instruments-mesure-data";

const IconMaths = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantInstrumentsMesurePage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);

  const [ordre, setOrdre] = useState<InstrumentMesureItem[]>(() =>
    melangerInstruments(ITEMS_INSTRUMENTS_MESURE)
  );
  const [choices, setChoices] = useState<Partial<Record<string, CategorieInstrumentId>>>({});

  const total = ordre.length;

  const allAnswered = useMemo(
    () => ordre.every((it) => choices[it.id] != null),
    [ordre, choices]
  );

  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const pick = useCallback((itemId: string, cat: CategorieInstrumentId) => {
    setChoices((prev) => ({ ...prev, [itemId]: cat }));
  }, []);

  const recommencer = useCallback(() => {
    setOrdre(melangerInstruments(ITEMS_INSTRUMENTS_MESURE));
    setChoices({});
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
    void moduleEstAccessiblePourEleve("instruments-mesure", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/grandeur");
    });
  }, [session, router]);

  const handleTerminer = useCallback(async () => {
    if (!session) return;
    if (!allAnswered || saving || finished) return;

    setSaving(true);
    setSaveError(null);

    const correct = ordre.reduce<number>((acc, it) => {
      const c = choices[it.id];
      return acc + (c === it.correct ? 1 : 0);
    }, 0);

    setPoints(correct);
    setFinished(true);

    try {
      await saveResultat({
        eleve_id: String(session.id),
        son_id: "maths-instruments-mesure",
        niveau_id: "maths-instruments-mesure",
        points: correct,
        points_max: total,
        reussi: correct >= Math.ceil(total * 0.6),
        detail_exercices: [
          {
            type: "instruments-mesure",
            titre: TITRE_INSTRUMENTS_MESURE,
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
  }, [allAnswered, choices, finished, ordre, saving, session, total]);

  useEffect(() => {
    if (!finished || !resultSaved || saveError) return;
    const t = setTimeout(() => {
      router.replace("/enfant/resultats");
    }, 1200);
    return () => clearTimeout(t);
  }, [finished, resultSaved, saveError, router]);

  if (!session) return null;

  const labelFor = (id: CategorieInstrumentId) =>
    CATEGORIES_INSTRUMENTS.find((c) => c.id === id)?.label ?? id;

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
            {TITRE_INSTRUMENTS_MESURE}
          </Link>
          <Link
            href="/enfant/maths/exercice/grandeur"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Grandeur
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-white">{TITRE_INSTRUMENTS_MESURE}</h1>
        <p className="mt-1 text-sm text-white/95">
          Pour chaque image, choisis le type de mesure correspondant. L&apos;ordre des images est mélangé.
        </p>

        {!finished ? (
          <>
            <div className="mt-6 space-y-8">
              {ordre.map((it, idx) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-lg"
                >
                  <p className="mb-3 text-sm font-medium text-[#2d4a3e]/80">
                    {idx + 1}. Quel type de mesure ?
                  </p>
                  <div className="relative mx-auto mb-4 flex max-h-48 w-full max-w-xs justify-center">
                    <Image
                      src={it.imageSrc}
                      alt=""
                      width={280}
                      height={200}
                      className="max-h-48 w-auto object-contain"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CATEGORIES_INSTRUMENTS.map((cat) => {
                      const selected = choices[it.id] === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => pick(it.id, cat.id)}
                          className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition ${
                            selected
                              ? "border-[#4a7c5a] bg-[#4a7c5a]/15 text-[#2d4a3e]"
                              : "border-[#2d4a3e]/20 bg-white text-[#2d4a3e] hover:border-[#4a7c5a]/50"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
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
            <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto text-xs text-[#2d4a3e]/85 sm:text-sm">
              {ordre.map((it) => {
                const c = choices[it.id];
                const ok = c === it.correct;
                return (
                  <li key={it.id} className={ok ? "text-[#166534]" : "text-[#b91c1c]"}>
                    #{it.id} — {ok ? "✓" : `✗ (réponse : ${labelFor(it.correct)})`}
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
                Recommencer (ordre mélangé)
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
