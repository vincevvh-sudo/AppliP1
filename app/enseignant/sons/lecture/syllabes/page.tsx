"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_LECTURE_SYLLABES,
  QUESTIONS_LECTURE_SYLLABES,
} from "../../../../data/lecture-syllabes";

export default function EnseignantLectureSyllabesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_SYLLABES}</span>
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation lecture
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_LECTURE_SYLLABES}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          10 questions : tu dis un son (ou l&apos;élève l&apos;écoute), il choisit parmi 5 syllabes ou mots.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/enfant/sons/lecture/syllabes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            Ouvrir l&apos;exercice (vue élève) ↗
          </a>
        </div>

        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Réponses attendues</h2>
          <ul className="mt-4 space-y-3">
            {QUESTIONS_LECTURE_SYLLABES.map((q, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d4a3e]/10 font-medium text-[#2d4a3e]">
                  {i + 1}
                </span>
                <span className="font-medium text-[#2d4a3e]">Son à dire :</span>
                <span className="rounded bg-[#a8d5ba]/40 px-2 py-0.5 font-medium">{q.son}</span>
                <span className="text-[#2d4a3e]/70">→</span>
                <span className="text-[#4a7c5a] font-medium">{q.options[q.correctIndex]}</span>
                <span className="text-[#2d4a3e]/50">
                  (parmi {q.options.join(", ")})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/lecture"
          className="mt-8 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour à Évaluation lecture
        </Link>
      </div>
    </main>
  );
}
