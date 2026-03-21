"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { MathsOperationsSeriePlay } from "../../../../../components/MathsOperationsSeriePlay";
import type { OperationSerieId } from "../../../../../data/maths-operations";

const VALID_SERIES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

/** Prévisualisation enseignant (même exercice que l'élève, sans contrôle de partage). */
export default function EnseignantMathsOperationsElevePreviewPage() {
  const params = useParams();
  const serieId = (params?.serieId as string) ?? "1";
  const isValidSerie = VALID_SERIES.includes(serieId);

  if (!isValidSerie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Série introuvable.</p>
          <Link href="/enseignant/maths/operations" className="mt-4 inline-block text-[#4a7c5a]">
            ← Opérations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <MathsOperationsSeriePlay
      serieId={serieId as OperationSerieId}
      backHref="/enseignant/maths/operations"
      backLabel="← Opérations"
    />
  );
}
