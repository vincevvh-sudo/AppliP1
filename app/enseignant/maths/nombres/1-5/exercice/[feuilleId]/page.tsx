"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../../components/MiyazakiDecor";
import { FEUILLES_NOMBRES_1_5 } from "../../../../../../data/maths-data";

export default function EnseignantMathsNombres15FeuillePage() {
  const params = useParams();
  const feuilleId = params?.feuilleId as string;
  const feuille = FEUILLES_NOMBRES_1_5.find((f) => f.id === feuilleId);

  if (!feuille) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Feuille introuvable.</p>
          <Link href="/enseignant/maths/nombres/1-5" className="mt-4 inline-block text-[#4a7c5a]">← Les nombres de 1 à 5</Link>
        </div>
      </main>
    );
  }

  const exercices = feuille.description.split("·").map((s) => s.trim()).filter(Boolean);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{feuille.titre} — Nombres 1 à 5</span>
          <Link
            href="/enseignant/maths/nombres/1-5"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux exercices
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{feuille.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">Une partie par feuille. Contenu de cette feuille :</p>

        <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg print:shadow-none">
          <ul className="list-inside list-decimal space-y-2 text-[#2d4a3e]">
            {exercices.map((exo, i) => (
              <li key={i}>{exo}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#2d4a3e]/60">
            Tu peux imprimer cette page (Ctrl+P) ou proposer les exercices sur papier en t&apos;inspirant de cette liste.
          </p>
        </div>

        <Link href="/enseignant/maths/nombres/1-5" className="mt-8 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour aux 4 feuilles
        </Link>
      </div>
    </main>
  );
}
