"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantMathsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            L&apos;arbre des mathématiques
          </Link>
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          L&apos;arbre des mathématiques
        </h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Choisis Exercice ou Évaluation.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/enfant/maths/exercice"
            className="rounded-2xl bg-white/95 p-8 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
          >
            <h2 className="font-display text-xl font-semibold text-[#2d4a3e]">Exercice</h2>
            <p className="mt-2 text-sm text-[#2d4a3e]/70">
              Arithmétique, Grandeur, Espace et géométrie, Traitement de données
            </p>
          </Link>
          <Link
            href="/enfant/maths/evaluation"
            className="rounded-2xl bg-white/95 p-8 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
          >
            <h2 className="font-display text-xl font-semibold text-[#2d4a3e]">Évaluation</h2>
            <p className="mt-2 text-sm text-[#2d4a3e]/70">
              Arithmétique, Grandeur, Espace et géométrie, Traitement de données
            </p>
          </Link>
        </div>

        <Link href="/enfant" className="mt-12 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
