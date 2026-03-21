"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../../../data/maths-data";

export default function EnfantMathsNombresEvaluationPage() {
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
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation — {theme.titre}</span>
          <Link href={`/enfant/maths/nombres/${themeId}`} className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e]">
            ← Retour
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <p className="text-[#2d4a3e]/80">L&apos;évaluation sera bientôt disponible.</p>
        <Link href={`/enfant/maths/nombres/${themeId}`} className="mt-6 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
