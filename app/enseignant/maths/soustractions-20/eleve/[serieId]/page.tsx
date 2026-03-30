"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { MathsSoustractions20SeriePlay } from "../../../../../components/MathsSoustractions20SeriePlay";
import type { Soustraction20SerieId } from "../../../../../data/maths-soustractions-20";

const VALID_SERIES = ["1", "2", "3", "4", "5"];

export default function EnseignantMathsSoustractions20ElevePreviewPage() {
  const params = useParams();
  const serieId = (params?.serieId as string) ?? "1";
  const isValidSerie = VALID_SERIES.includes(serieId);

  if (!isValidSerie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Série introuvable.</p>
          <Link href="/enseignant/maths/soustractions-20" className="mt-4 inline-block text-[#4a7c5a]">
            ← Soustractions jusque 20
          </Link>
        </div>
      </main>
    );
  }

  return (
    <MathsSoustractions20SeriePlay
      serieId={serieId as Soustraction20SerieId}
      backHref="/enseignant/maths/soustractions-20"
      backLabel="← Soustractions jusque 20"
    />
  );
}
