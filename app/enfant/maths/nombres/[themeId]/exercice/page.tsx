"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { PARTIES_MATHS, FEUILLES_NOMBRES_1_5, FEUILLES_NOMBRES_6_10 } from "../../../../../data/maths-data";

export default function EnfantMathsNombresExercicePage() {
  const params = useParams();
  const themeId = params?.themeId as string;
  const partie = PARTIES_MATHS.find((p) => p.id === "nombres");
  const theme = partie?.themes.find((t) => t.id === themeId);

  if (!theme) {
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
          <span className="font-display text-xl text-[#2d4a3e]">Exercices — {theme.titre}</span>
          <Link
            href={`/enfant/maths/nombres/${themeId}`}
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
          >
            ← Retour
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-[#2d4a3e]/75">Choisis une feuille d&apos;exercices.</p>
        <div className="mt-6 space-y-4">
          {(themeId === "6-10" ? FEUILLES_NOMBRES_6_10 : FEUILLES_NOMBRES_1_5).map((feuille) => (
            <Link
              key={feuille.id}
              href={`/enfant/maths/nombres/${themeId}/exercice/${feuille.id}`}
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
