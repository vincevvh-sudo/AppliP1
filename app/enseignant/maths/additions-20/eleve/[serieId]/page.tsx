"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { MathsAdditions20SeriePlay } from "../../../../../components/MathsAdditions20SeriePlay";
import type { Addition20SerieId } from "../../../../../data/maths-additions-20";

const VALID_SERIES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function EnseignantMathsAdditions20ElevePreviewPage() {
  const params = useParams();
  const serieId = (params?.serieId as string) ?? "1";
  const isValidSerie = VALID_SERIES.includes(serieId);

  if (!isValidSerie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Série introuvable.</p>
          <Link href="/enseignant/maths/additions-20" className="mt-4 inline-block text-[#4a7c5a]">
            ← Additions jusque 20
          </Link>
        </div>
      </main>
    );
  }

  return (
    <MathsAdditions20SeriePlay
      serieId={serieId as Addition20SerieId}
      backHref="/enseignant/maths/additions-20"
      backLabel="← Additions jusque 20"
    />
  );
}
