"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PartageEvalNiveauForm } from "../../../components/PartageEvalNiveauForm";
import { PARTIES_FORET, getSonsByPartie } from "../../../data/sons-data";
import {
  FLUENCE_VOYELLE_LABEL,
  fluenceNiveauId,
  getFluenceDisplayLabel,
} from "../../../data/fluence-partage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Mêmes parties que les exercices de sons : Voyelles, Consonnes, Sons. */
const PARTIES_FLUENCE = PARTIES_FORET.filter((p) => p.sonIds.length > 0);

function getFluenceLabel(partieId: string, son: { id: string; grapheme: string }, index: number): string {
  if (partieId === "voyelles" && index < 3) {
    return FLUENCE_VOYELLE_LABEL[son.id] ?? `Voyelle ${index + 1}`;
  }
  return getFluenceDisplayLabel(son);
}

export default function EnseignantFluencePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/exercices"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Fluence
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/enseignant/sons/evaluations"
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Évaluations
            </Link>
            <Link
              href="/enseignant/sons/exercices"
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Exercices
            </Link>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Choisir une fluence</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Sous chaque test : <strong>Tester</strong> (aperçu) et le bloc vert{" "}
          <strong>Partager aux élèves</strong> (tous ou une sélection). Dès que tu enregistres le partage, les
          enfants le voient dans <strong>Français → Fluence</strong>.
        </p>

        {PARTIES_FLUENCE.map((partie) => {
          const sons = getSonsByPartie(partie).filter((s) => s.id !== "et");
          if (sons.length === 0) return null;
          return (
            <section key={partie.id} className="mt-10">
              <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{partie.titre}</h2>
              <div className="mt-3 space-y-6">
                {sons.map((son, index) => {
                  const label = getFluenceLabel(partie.id, son, index);
                  const isVoyelleNum = partie.id === "voyelles" && index < 3;
                  const niveauId = fluenceNiveauId(son.id);
                  return (
                    <div
                      key={son.id}
                      className="rounded-2xl bg-white/95 p-5 shadow-lg"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg text-[#2d4a3e]">{label}</p>
                          {!isVoyelleNum && (
                            <p className="mt-1 text-sm text-[#2d4a3e]/70">{son.phoneme}</p>
                          )}
                        </div>
                        <Link
                          href={`/enseignant/sons/fluence/test/${son.id}`}
                          className="rounded-xl border border-[#2d4a3e]/30 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#a8d5ba]/30"
                        >
                          Tester
                        </Link>
                      </div>
                      <PartageEvalNiveauForm
                        sonId={son.id}
                        niveauId={niveauId}
                        titre={`Fluence — ${label}`}
                        description={`Partage « ${label} » : les enfants le verront dans Français → Fluence. Sans partage, ils ne le voient pas.`}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <Link
          href="/enseignant/sons/exercices"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux Exercices
        </Link>
      </div>
    </main>
  );
}
