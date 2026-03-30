"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  PARTIES_MATHS,
  FEUILLES_NOMBRES_1_5,
  FEUILLES_NOMBRES_6_10,
  FEUILLES_NOMBRES_10_15,
  FEUILLES_NOMBRES_15_20,
} from "../../../../data/maths-data";
import {
  getMathsThemeEvaluationsEleveIds,
  getMathsThemeExercicesEleveIds,
  setMathsThemeEvaluationsEleveIds,
  setMathsThemeExercicesEleveIds,
  type MathsThemePartageKey,
} from "../../../../data/maths-partages";
import { supabase, type EleveRow } from "../../../../../utils/supabase";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantMathsNombresThemePage() {
  const params = useParams();
  const themeId = params?.themeId as string;
  const [partageExercices, setPartageExercices] = useState(false);
  const [partageEvaluations, setPartageEvaluations] = useState(false);
  const [mode, setMode] = useState<"choix" | "exercice" | "evaluation">("choix");
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [selectedExercices, setSelectedExercices] = useState<Set<string>>(new Set());
  const [selectedEvaluations, setSelectedEvaluations] = useState<Set<string>>(new Set());

  const partie = PARTIES_MATHS.find((p) => p.id === "nombres");
  const theme = partie?.themes.find((t) => t.id === themeId);
  const isNombres15 = themeId === "1-5";
  const isNombres610 = themeId === "6-10";
  const isNombres1015 = themeId === "10-15";
  const isNombres1520 = themeId === "15-20";
  const partageThemeId = isNombres15
    ? "nombres-1-5"
    : isNombres610
      ? "nombres-6-10"
      : isNombres1015
        ? "nombres-10-15"
        : isNombres1520
          ? "nombres-15-20"
          : null;

  useEffect(() => {
    if (partageThemeId) {
      const exIds = getMathsThemeExercicesEleveIds(partageThemeId as MathsThemePartageKey);
      const evIds = getMathsThemeEvaluationsEleveIds(partageThemeId as MathsThemePartageKey);
      setSelectedExercices(new Set(exIds));
      setSelectedEvaluations(new Set(evIds));
      setPartageExercices(exIds.length > 0);
      setPartageEvaluations(evIds.length > 0);
    }
  }, [partageThemeId]);

  useEffect(() => {
    supabase
      .from("eleves")
      .select("*")
      .order("nom")
      .order("prenom")
      .then(({ data }) => setEleves((data ?? []) as EleveRow[]));
  }, []);

  const handleToggleExercices = () => {
    if (!partageThemeId) return;
    if (selectedExercices.size > 0) {
      setSelectedExercices(new Set());
      setMathsThemeExercicesEleveIds(partageThemeId as MathsThemePartageKey, []);
      setPartageExercices(false);
      return;
    }
    const all = eleves.map((e) => String(e.id));
    setSelectedExercices(new Set(all));
    setMathsThemeExercicesEleveIds(partageThemeId as MathsThemePartageKey, all);
    setPartageExercices(all.length > 0);
  };

  const handleToggleEvaluations = () => {
    if (!partageThemeId) return;
    if (selectedEvaluations.size > 0) {
      setSelectedEvaluations(new Set());
      setMathsThemeEvaluationsEleveIds(partageThemeId as MathsThemePartageKey, []);
      setPartageEvaluations(false);
      return;
    }
    const all = eleves.map((e) => String(e.id));
    setSelectedEvaluations(new Set(all));
    setMathsThemeEvaluationsEleveIds(partageThemeId as MathsThemePartageKey, all);
    setPartageEvaluations(all.length > 0);
  };

  const toggleEleveExercice = (id: string) => {
    if (!partageThemeId) return;
    const next = new Set(selectedExercices);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedExercices(next);
    const list = Array.from(next);
    setMathsThemeExercicesEleveIds(partageThemeId as MathsThemePartageKey, list);
    setPartageExercices(list.length > 0);
  };

  const toggleEleveEvaluation = (id: string) => {
    if (!partageThemeId) return;
    const next = new Set(selectedEvaluations);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEvaluations(next);
    const list = Array.from(next);
    setMathsThemeEvaluationsEleveIds(partageThemeId as MathsThemePartageKey, list);
    setPartageEvaluations(list.length > 0);
  };

  if (!partie || !theme) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Thème introuvable.</p>
          <Link href="/enseignant/maths/nombres" className="mt-4 inline-block text-[#4a7c5a]">← Arithmétique</Link>
        </div>
      </main>
    );
  }

  if (mode === "exercice" && (isNombres15 || isNombres610 || isNombres1015 || isNombres1520)) {
    const feuilles = isNombres15
      ? FEUILLES_NOMBRES_1_5
      : isNombres610
        ? FEUILLES_NOMBRES_6_10
        : isNombres1015
          ? FEUILLES_NOMBRES_10_15
          : FEUILLES_NOMBRES_15_20;
    const basePath = `/enseignant/maths/nombres/${themeId}/exercice`;
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <span className="font-display text-xl text-[#2d4a3e]">Exercices — {theme.titre}</span>
            <button
              type="button"
              onClick={() => setMode("choix")}
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
            >
              ← Retour
            </button>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p className="text-sm text-[#2d4a3e]/75">4 parties, une partie par feuille. Choisis une feuille.</p>
          <div className="mt-6 space-y-4">
            {feuilles.map((feuille) => (
              <Link
                key={feuille.id}
                href={`${basePath}/${feuille.id}`}
                className="block rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{feuille.titre}</h2>
                <p className="mt-2 text-sm text-[#2d4a3e]/70">{feuille.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (mode === "evaluation" && (isNombres15 || isNombres610 || isNombres1015 || isNombres1520)) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <span className="font-display text-xl text-[#2d4a3e]">Évaluation — {theme.titre}</span>
            <button
              type="button"
              onClick={() => setMode("choix")}
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
            >
              ← Retour
            </button>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p className="text-[#2d4a3e]/80">L&apos;évaluation {theme.titre} sera bientôt disponible.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/nombres" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {theme.titre}
          </Link>
          <Link href="/enseignant/maths/nombres" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Arithmétique
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{theme.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">Choisis Exercice ou Évaluation, puis partage aux enfants si tu le souhaites.</p>

        <div className="mt-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setMode("exercice")}
            className="rounded-2xl bg-white/95 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
          >
            <span className="font-display text-lg font-semibold text-[#2d4a3e]">Exercice</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">4 feuilles d&apos;exercices ({theme.titre})</p>
          </button>
          <button
            type="button"
            onClick={() => setMode("evaluation")}
            className="rounded-2xl bg-white/95 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
          >
            <span className="font-display text-lg font-semibold text-[#2d4a3e]">Évaluation</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">Évaluation {theme.titre}</p>
          </button>
        </div>

        {partageThemeId && (
          <div className="mt-10 rounded-2xl border-2 border-[#2d4a3e]/15 bg-white/90 p-6">
            <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">Partager aux enfants</h2>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">Sélectionne les élèves autorisés pour ce thème.</p>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={partageExercices}
                  onChange={handleToggleExercices}
                  className="h-5 w-5 rounded border-[#2d4a3e]/30 text-[#c4a8e8]"
                />
                <span className="text-[#2d4a3e]">Partager les exercices (élèves sélectionnés)</span>
              </label>
              {partageExercices && (
                <div className="ml-8 grid gap-2">
                  {eleves.map((e) => (
                    <label key={`ex-${e.id}`} className="flex items-center gap-2 text-sm text-[#2d4a3e]">
                      <input
                        type="checkbox"
                        checked={selectedExercices.has(String(e.id))}
                        onChange={() => toggleEleveExercice(String(e.id))}
                        className="h-4 w-4 rounded border-[#2d4a3e]/30"
                      />
                      {e.prenom} {e.nom}
                    </label>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={partageEvaluations}
                  onChange={handleToggleEvaluations}
                  className="h-5 w-5 rounded border-[#2d4a3e]/30 text-[#c4a8e8]"
                />
                <span className="text-[#2d4a3e]">Partager les évaluations (élèves sélectionnés)</span>
              </label>
              {partageEvaluations && (
                <div className="ml-8 grid gap-2">
                  {eleves.map((e) => (
                    <label key={`ev-${e.id}`} className="flex items-center gap-2 text-sm text-[#2d4a3e]">
                      <input
                        type="checkbox"
                        checked={selectedEvaluations.has(String(e.id))}
                        onChange={() => toggleEleveEvaluation(String(e.id))}
                        className="h-4 w-4 rounded border-[#2d4a3e]/30"
                      />
                      {e.prenom} {e.nom}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Link href="/enseignant/maths/nombres" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour à Arithmétique
        </Link>
      </div>
    </main>
  );
}
