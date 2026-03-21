"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";

export default function EnseignantEvaluationEcouterLirePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation écouter-lire</span>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation écouter-lire</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Choisis une évaluation : lecture ou écouter.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation lecture</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Exercices de lecture et évaluation lecture.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire/ecouter"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation écouter</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Exercices d&apos;écoute — Le chevalier de la nuit (Vrai/Faux).
            </p>
          </Link>
        </div>

        <Link
          href="/enseignant/sons/evaluations"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}
