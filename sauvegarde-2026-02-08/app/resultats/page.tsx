"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function ResultatsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8b4d4]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Résultats
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Résultats des enfants
        </h1>
        <p className="mt-4 text-[#2d4a3e]/85">
          Consulter les résultats des exercices et évaluations.
        </p>
        <p className="mt-2 text-sm text-[#2d4a3e]/60">
          (Fonctionnalité en cours de restauration)
        </p>
        <Link href="/enseignant" className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
