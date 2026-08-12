"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { FluenceLectureView, type FluenceEssaiResult } from "../../../../components/FluenceLectureView";
import { EvalNiveauAccessGate } from "../../../../components/EvalNiveauAccessGate";
import { getSonById } from "../../../../data/sons-data";
import { fluenceNiveauId, getFluenceDisplayLabel } from "../../../../data/fluence-partage";
import { getEnfantSession } from "../../../../../utils/enfant-session";
import { getResultatsByEleve, saveResultat } from "../../../../data/resultats-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function EnfantFluenceSonInner() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);
  const [meilleurScore, setMeilleurScore] = useState<number | null>(null);

  useEffect(() => {
    if (!son) return;
    const session = getEnfantSession();
    if (!session?.id) return;
    let cancelled = false;
    const niveauId = fluenceNiveauId(son.id);
    getResultatsByEleve(session.id)
      .then((rows) => {
        if (cancelled) return;
        const fluenceRows = rows.filter((r) => r.son_id === son.id && r.niveau_id === niveauId);
        if (fluenceRows.length === 0) {
          setMeilleurScore(null);
          return;
        }
        setMeilleurScore(Math.max(...fluenceRows.map((r) => r.points)));
      })
      .catch(() => {
        if (!cancelled) setMeilleurScore(null);
      });
    return () => {
      cancelled = true;
    };
  }, [son]);

  const handleEssaiTermine = useCallback(
    async (result: FluenceEssaiResult) => {
      if (!son) return;
      const session = getEnfantSession();
      if (!session?.id) {
        throw new Error("Session élève introuvable. Reconnecte-toi.");
      }
      await saveResultat({
        eleve_id: String(session.id),
        son_id: son.id,
        niveau_id: fluenceNiveauId(son.id),
        points: result.points,
        points_max: result.pointsMax,
        reussi: true,
        detail_exercices: [
          {
            type: "fluence-maison",
            titre: `Fluence 1 min — ${getFluenceDisplayLabel(son)}`,
            points: result.points,
            pointsMax: result.pointsMax,
            duree_secondes: result.dureeSecondes,
          },
        ],
      });
      setMeilleurScore((prev) => (prev == null ? result.points : Math.max(prev, result.points)));
    },
    [son]
  );

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Fluence introuvable.</p>
          <Link href="/enfant/sons" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant/sons"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Fluence — {displayLabel}
          </Link>
          <Link
            href="/enfant/sons"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <FluenceLectureView
          son={son}
          mode="record"
          meilleurScore={meilleurScore}
          onEssaiTermine={handleEssaiTermine}
        />
        <div className="mt-12 text-center">
          <Link
            href="/enfant/sons"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            ← Retour à la Forêt des sons
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function EnfantFluenceSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;

  return (
    <EvalNiveauAccessGate sonId={sonId} niveauId={fluenceNiveauId(sonId)} matiereLabel="Fluence">
      <EnfantFluenceSonInner />
    </EvalNiveauAccessGate>
  );
}
