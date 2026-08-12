"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { FluenceLectureView } from "../../../../../components/FluenceLectureView";
import { PartageEvalNiveauForm } from "../../../../../components/PartageEvalNiveauForm";
import { getSonById } from "../../../../../data/sons-data";
import { fluenceNiveauId, getFluenceDisplayLabel } from "../../../../../data/fluence-partage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantFluenceTestSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Son introuvable.</p>
          <Link href="/enseignant/sons/fluence" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour à Fluence
          </Link>
        </div>
      </main>
    );
  }

  const displayLabel = getFluenceDisplayLabel(son);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/enseignant/sons/fluence"
              className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
                <IconLeaf />
              </span>
              Fluence — {displayLabel}
            </Link>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Test (vue élève)
            </span>
          </div>
          <Link
            href="/enseignant/sons/fluence"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour à Fluence
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <PartageEvalNiveauForm
          sonId={son.id}
          niveauId={fluenceNiveauId(son.id)}
          titre={`Fluence — ${displayLabel}`}
          description={`Partage « ${displayLabel} » cette semaine : les enfants le verront dans la Forêt des sons → Fluence. Tu peux partager une seule fluence à la fois (ex. Voyelle 1, puis plus tard Voyelle 2).`}
        />

        <div className="mt-8">
          <FluenceLectureView
            son={son}
            mode="practice"
            intro={`Aperçu libre : Start / Stop. Chez l’élève, c’est un chrono de 1 minute : il clique ensuite sur la dernière unité lue ; chaque essai apparaît dans Résultats (essai 1, 2, 3…).`}
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/enseignant/sons/fluence"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            ← Retour à Fluence
          </Link>
        </div>
      </div>
    </main>
  );
}
