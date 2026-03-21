"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { TITRE_LECTURE_MOTS, LECTURE_MOTS_ITEMS } from "../../../../data/lecture-mots-data";

export default function EnseignantLectureMotsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/lecture"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              📖
            </span>
            {TITRE_LECTURE_MOTS}
          </Link>
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation lecture
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_LECTURE_MOTS}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          L&apos;enfant voit un mot et choisit l&apos;image (emoji) qui va avec. 10 mots, score sur 10.
        </p>

        <div className="mt-6">
          <a
            href="/enfant/sons/lecture/mots"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;exercice (enfant)
          </a>
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Les 10 mots</h2>
          <ul className="mt-4 space-y-2 text-[#2d4a3e]/90">
            {LECTURE_MOTS_ITEMS.map((x) => (
              <li key={x.id}>
                <span className="mr-2 text-2xl">{x.emoji}</span>
                {x.mot}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/lecture"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour à Évaluation lecture
        </Link>
      </div>
    </main>
  );
}
