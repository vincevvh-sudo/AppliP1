"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { MathsOperationsSeriePlay } from "../../../../components/MathsOperationsSeriePlay";
import { isOperationSerieShared } from "../../../../data/maths-partages";
import type { OperationSerieId } from "../../../../data/maths-operations";

const VALID_SERIES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

export default function EnfantMathsOperationsSeriePage() {
  const params = useParams();
  const router = useRouter();
  const serieId = (params?.serieId as string) ?? "1";
  const isValidSerie = VALID_SERIES.includes(serieId);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isValidSerie) return;
    const ok = isOperationSerieShared(serieId);
    if (!ok) {
      router.replace("/enfant/maths/evaluation/nombres");
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, [isValidSerie, serieId, router]);

  if (!isValidSerie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Série d&apos;opérations introuvable.</p>
          <Link href="/enfant/maths/evaluation/nombres" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour
          </Link>
        </div>
      </main>
    );
  }

  if (allowed === false || allowed === null) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12 text-center text-[#1f2933]/80">
          {allowed === null ? <p>Chargement…</p> : <p>Redirection…</p>}
        </div>
      </main>
    );
  }

  return (
    <MathsOperationsSeriePlay serieId={serieId as OperationSerieId} backHref="/enfant/maths/evaluation/nombres" />
  );
}
