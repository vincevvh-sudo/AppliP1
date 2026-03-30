"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { MathsAdditionsSeriePlay } from "../../../../components/MathsAdditionsSeriePlay";
import { isAdditionSerieShared } from "../../../../data/maths-partages";
import type { AdditionSerieId } from "../../../../data/maths-additions";

const VALID_SERIES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function EnfantMathsAdditionsSeriePage() {
  const params = useParams();
  const router = useRouter();
  const serieId = (params?.serieId as string) ?? "1";
  const isValidSerie = VALID_SERIES.includes(serieId);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isValidSerie) return;
    const ok = isAdditionSerieShared(serieId);
    if (!ok) {
      router.replace("/enfant/maths/exercice/nombres");
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
          <p>Série d&apos;additions introuvable.</p>
          <Link href="/enfant/maths/exercice/nombres" className="mt-4 inline-block text-[#4a7c5a]">
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
    <MathsAdditionsSeriePlay
      serieId={serieId as AdditionSerieId}
      backHref="/enfant/maths/exercice/nombres"
    />
  );
}
