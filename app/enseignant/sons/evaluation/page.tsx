"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PARTIES_FORET, getSonsByPartie } from "../../../data/sons-data";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Parties utilisées pour les évaluations : Voyelles, Consonnes, Sons (OU, OI, ON, AN, IN). */
const PARTIES_EVAL = PARTIES_FORET.filter((p) => p.sonIds.length > 0);

export default function EnseignantEvaluationPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/sons/evaluations" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Évaluations 1 à 4
          </Link>
          <Link href="/enseignant/sons/evaluations" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour aux Évaluations
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Choisir un son — Évaluation 1, 2, 3 ou 4</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">Pour chaque son : Évaluation 1, 2, 3 et 4 (chrono 1 min).</p>

        {PARTIES_EVAL.map((partie) => {
          const sons = getSonsByPartie(partie).filter((s) => s.id !== "et");
          if (sons.length === 0) return null;
          return (
            <section key={partie.id} className="mt-10">
              <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{partie.titre}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {sons.map((son) => (
                  <Link
                    key={son.id}
                    href={`/enseignant/sons/evaluation/${son.id}`}
                    className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#a8d5ba]/30"
                  >
                    <p className="font-display text-lg text-[#2d4a3e]">{son.grapheme}</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">{son.phoneme}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <Link href="/enseignant/sons/evaluations" className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour aux Évaluations
        </Link>
      </div>
    </main>
  );
}
