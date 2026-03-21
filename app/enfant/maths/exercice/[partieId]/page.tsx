"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../../data/maths-data";
import { getMathsThemesExercicesPartages } from "../../../../data/maths-partages";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantMathsExercicePartiePage() {
  const params = useParams();
  const partieId = params?.partieId as string;
  const [exercicesPartages, setExercicesPartages] = useState<string[]>([]);
  const partie = PARTIES_MATHS.find((p) => p.id === partieId);

  useEffect(() => {
    setExercicesPartages(getMathsThemesExercicesPartages());
  }, []);

  const isNombres = partieId === "nombres";
  const hasNombres15 = exercicesPartages.includes("nombres-1-5");
  const hasNombres610 = exercicesPartages.includes("nombres-6-10");
  const themesToShow =
    isNombres && partie
      ? partie.themes.filter((t) => (t.id === "1-5" && hasNombres15) || (t.id === "6-10" && hasNombres610))
      : partie?.themes ?? [];

  if (!partie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Partie introuvable.</p>
          <Link href="/enfant/maths/exercice" className="mt-4 inline-block text-[#4a7c5a]">← Exercice</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/maths/exercice" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {partie.titre}
          </Link>
          <Link href="/enfant/maths/exercice" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Exercice
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{partie.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">Choisis un thème (exercices partagés par ton maître ou ta maîtresse).</p>

        {themesToShow.length === 0 ? (
          <p className="mt-6 text-[#2d4a3e]/70">
            {isNombres ? "Aucun exercice partagé pour le moment. Demande à ton maître ou ta maîtresse." : "Bientôt disponible."}
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {themesToShow.map((theme) => (
              <Link
                key={theme.id}
                href={`/enfant/maths/nombres/${theme.id}/exercice`}
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">{theme.titre}</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">Exercices</p>
              </Link>
            ))}
          </div>
        )}

        <Link href="/enfant/maths/exercice" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
