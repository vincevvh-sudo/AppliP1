"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";

export default function EnseignantEvaluationEcouterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation écouter</span>
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Écouter-lire
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation écouter</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Ouvre chaque exercice pour prévisualiser la vue élève et <strong>partager l&apos;évaluation</strong> à tous les
          élèves ou à ceux que tu choisis (bloc « Partager aux élèves » en bas de page).
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire/ecouter/chevalier-de-la-nuit"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Le chevalier de la nuit</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">10 phrases Vrai/Faux — prévisualiser et partager sur la page</p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire/ecouter/consignes-1"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Consignes 1</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">10 exercices (écrire, entourer, dessiner, barrer, colorier, encadrer…)</p>
          </Link>
        </div>

        <Link
          href="/enseignant/sons/evaluation/ecouter-lire"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour à écouter-lire
        </Link>
      </div>
    </main>
  );
}
