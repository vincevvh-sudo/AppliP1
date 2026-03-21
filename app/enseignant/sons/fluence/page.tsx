"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PARTIES_FORET, getSonsByPartie } from "../../../data/sons-data";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Mêmes parties que Évaluations 1 à 4 : Voyelles, Consonnes, Sons. */
const PARTIES_EVAL = PARTIES_FORET.filter((p) => p.sonIds.length > 0);

/** Pour la section Voyelles, les 3 premiers sons s’affichent comme Voyelle 1, 2, 3. */
const FLUENCE_VOYELLE_LABEL: Record<string, string> = {
  o: "Voyelle 1",
  u: "Voyelle 2",
  e: "Voyelle 3",
};

function getFluenceLabel(partieId: string, son: { id: string; grapheme: string }, index: number): string {
  if (partieId === "voyelles" && index < 3) {
    return FLUENCE_VOYELLE_LABEL[son.id] ?? `Voyelle ${index + 1}`;
  }
  return son.grapheme;
}

export default function EnseignantFluencePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/sons/evaluations" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Fluence
          </Link>
          <Link href="/enseignant/sons/evaluations" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour aux Évaluations
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Choisir un son — Fluence (lecture rapide)</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Mêmes lettres et sons qu&apos;en Évaluations 1 à 4. Utilise <strong>Tester</strong> pour essayer la fluence (vue élève, chrono Start / Stop).
        </p>

        {PARTIES_EVAL.map((partie) => {
          const sons = getSonsByPartie(partie).filter((s) => s.id !== "et");
          if (sons.length === 0) return null;
          return (
            <section key={partie.id} className="mt-10">
              <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{partie.titre}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {sons.map((son, index) => {
                  const label = getFluenceLabel(partie.id, son, index);
                  const isVoyelleNum = partie.id === "voyelles" && index < 3;
                  return (
                  <div
                    key={son.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-6 shadow-lg transition hover:bg-[#a8d5ba]/20"
                  >
                    <div>
                      <p className="font-display text-lg text-[#2d4a3e]">{label}</p>
                      {!isVoyelleNum && <p className="mt-1 text-sm text-[#2d4a3e]/70">{son.phoneme}</p>}
                    </div>
                    <Link
                      href={`/enseignant/sons/fluence/test/${son.id}`}
                      className="rounded-xl bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
                    >
                      Tester
                    </Link>
                  </div>
                );})}
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
