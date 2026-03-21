"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantLecturePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Lecture
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluations
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation lecture</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Choisis un exercice de lecture à faire passer ou à partager aux élèves.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/enseignant/sons/lecture/syllabes"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Lecture de syllabes</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              10 questions : dire un son, l&apos;élève choisit parmi 5 syllabes ou mots.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/lecture/mots"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Lecture de mots</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              10 mots : l&apos;enfant choisit l&apos;image qui va avec chaque mot. Score sur 10.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/lecture/janvier"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Janvier</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              4 exercices : syllabes, 20 mots, 5 mots, vrai/faux. Choisir l&apos;emoji qui correspond. Score sur 10.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/lecture/phrases"
            className="block rounded-xl border-2 border-[#4a7c5a]/30 bg-white/90 p-5 shadow-md transition hover:border-[#4a7c5a] hover:bg-[#f0f7f2]"
          >
            <span className="font-display text-lg text-[#2d4a3e]">Construction de phrases</span>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Remettre les parties de la phrase dans l&apos;ordre (sujet, verbe, compléments) avec majuscules et points.
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
