"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantSonsEvaluationsPage() {
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
            Forêt des sons — Évaluations
          </Link>
          <Link
            href="/enseignant/sons"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour à la Forêt des sons
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Évaluations
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Évaluations 1 à 4 par son, dictées de syllabes (Évaluation 5), dictées de mots et
          Évaluation lecture.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/enseignant/sons/evaluation"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluations 1 à 4</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Par son : Évaluation 1, 2, 3, 4 (exercices chronométrés). Choisis un son puis une évaluation.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/fluence"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Fluence</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Lecture rapide par son. Choisis une lettre, puis Start / Stop pour chronométrer la lecture.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation-5"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation 5 — Dictées</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Dictée 1, Dictée 2, Dictée 3 — points sur 5 par élève.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/dictees-mots"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Dictées de mots</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              16 dictées de mots (5 mots / phrases chacune). À dicter sur feuille, score sur 5.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20 sm:col-span-2"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation lecture</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Exercices de lecture et évaluation lecture.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation/parler"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20 sm:col-span-2"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Parler</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Grilles d&apos;évaluation poésie et présentation de ma famille.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation/ecriture"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20 sm:col-span-2"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation écriture</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Grilles et exercices d&apos;évaluation de l&apos;écriture.
            </p>
          </Link>
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire"
            className="rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20 sm:col-span-2"
          >
            <p className="font-display text-lg text-[#2d4a3e]">Évaluation écouter-lire</p>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              Écouter et lire : exercices et évaluation (à compléter).
            </p>
          </Link>
        </div>

        <Link
          href="/enseignant/sons"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour à la Forêt des sons
        </Link>
      </div>
    </main>
  );
}
