"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../data/maths-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantMathsExercicePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/maths" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            Exercice
          </Link>
          <Link href="/enfant/maths" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Arbre des mathématiques
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">Exercice</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Choisis une partie : Arithmétique, Grandeur, Espace et géométrie, Traitement de données.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PARTIES_MATHS.map((partie) => (
            <Link
              key={partie.id}
              href={`/enfant/maths/exercice/${partie.id}`}
              className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
            >
              <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{partie.titre}</h2>
              {partie.themes.length > 0 ? (
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  {partie.themes.length} thème{partie.themes.length > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[#2d4a3e]/60">
                  Grandeur, espace ou données : exercices activables par l&apos;enseignant
                </p>
              )}
            </Link>
          ))}
        </div>

        <Link href="/enfant/maths" className="mt-12 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
