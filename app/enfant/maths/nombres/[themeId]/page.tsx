"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PARTIES_MATHS, FEUILLES_NOMBRES_1_5 } from "../../../../data/maths-data";
import { getMathsThemesExercicesPartages, getMathsThemesEvaluationsPartages } from "../../../../data/maths-partages";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantMathsNombresThemePage() {
  const params = useParams();
  const themeId = params?.themeId as string;
  const [exercicesPartages, setExercicesPartages] = useState<string[]>([]);
  const [evaluationsPartagees, setEvaluationsPartagees] = useState<string[]>([]);

  useEffect(() => {
    setExercicesPartages(getMathsThemesExercicesPartages());
    setEvaluationsPartagees(getMathsThemesEvaluationsPartages());
  }, []);

  const partie = PARTIES_MATHS.find((p) => p.id === "nombres");
  const theme = partie?.themes.find((t) => t.id === themeId);
  const partageId = themeId === "1-5" ? "nombres-1-5" : themeId === "6-10" ? "nombres-6-10" : null;
  const exercicesOk = !!partageId && exercicesPartages.includes(partageId);
  const evaluationsOk = !!partageId && evaluationsPartagees.includes(partageId);

  if (!partie || !theme) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Thème introuvable.</p>
          <Link href="/enfant/maths" className="mt-4 inline-block text-[#4a7c5a]">← Maths</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/maths" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {theme.titre}
          </Link>
          <Link href="/enfant/maths" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Maths
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{theme.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">Choisis Exercice ou Évaluation.</p>

        <div className="mt-8 flex flex-col gap-4">
          {exercicesOk && (
            <Link
              href={`/enfant/maths/nombres/${themeId}/exercice`}
              className="rounded-2xl bg-white/95 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
            >
              <span className="font-display text-lg font-semibold text-[#2d4a3e]">Exercice</span>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">4 feuilles d&apos;exercices</p>
            </Link>
          )}
          {evaluationsOk && (
            <Link
              href={`/enfant/maths/nombres/${themeId}/evaluation`}
              className="rounded-2xl bg-white/95 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
            >
              <span className="font-display text-lg font-semibold text-[#2d4a3e]">Évaluation</span>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">Évaluation {theme.titre}</p>
            </Link>
          )}
        </div>

        {!exercicesOk && !evaluationsOk && (
          <p className="mt-6 text-sm text-[#2d4a3e]/60">Rien de partagé pour ce thème pour le moment.</p>
        )}

        <Link href="/enfant/maths" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
