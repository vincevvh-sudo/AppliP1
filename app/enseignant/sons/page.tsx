"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantSonsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Forêt des sons
          </Link>
          <Link
            href="/enseignant"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Forêt des sons
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Choisis une partie : exercices (voyelles, consonnes, sons, lecture) ou évaluations.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/enseignant/sons/exercices"
            className="flex flex-col rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#a8d5ba]/20"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#a8d5ba]/60 text-2xl font-bold text-[#2d4a3e]">
              📖
            </span>
            <p className="mt-4 font-display text-xl text-[#2d4a3e]">Exercices</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Voyelles, consonnes, les sons et lecture — Phono, Phono images, partage par son.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="flex flex-col rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#a8d5ba]/20"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#a8d5ba]/60 text-2xl font-bold text-[#2d4a3e]">
              ✓
            </span>
            <p className="mt-4 font-display text-xl text-[#2d4a3e]">Évaluations</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Évaluations 1 à 4, Évaluation 5 (dictées) et Évaluation lecture.
            </p>
          </Link>
        </div>

        <Link
          href="/enseignant"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
