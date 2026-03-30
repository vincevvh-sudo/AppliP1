"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { getVocabulaireSpatialByEleve } from "../../../data/vocabulaire-spatial-storage";
import { TITRE_VOCABULAIRE_SPATIAL, libelleMaitrise } from "../../../data/vocabulaire-spatial-data";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantVocabulaireSpatialPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const [result, setResult] = useState<{ points_obtenus: number; score_sur_10: number; phrase_scores: number[] } | null | "loading">("loading");

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) {
      router.replace("/enfant");
      return;
    }
    const eleveId = Number(s.id);
    if (!Number.isFinite(eleveId)) {
      setResult(null);
      return;
    }
    getVocabulaireSpatialByEleve(eleveId).then((r) => setResult(r ?? null));
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void moduleEstAccessiblePourEleve("vocabulaire-spatial", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/solide-figure");
    });
  }, [session, router]);

  if (!session) return null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/evaluations" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            {TITRE_VOCABULAIRE_SPATIAL}
          </Link>
          <Link href="/enfant/evaluations" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Mes évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-white">{TITRE_VOCABULAIRE_SPATIAL}</h1>

        {result === "loading" && (
          <p className="mt-6 text-[#2d4a3e]/70">Chargement…</p>
        )}

        {result === null && (
          <p className="mt-6 text-[#2d4a3e]/80">
            Tu n&apos;as pas encore de résultat pour cette évaluation. Ton maître ou ta maîtresse enregistrera tes points après l&apos;avoir faite sur feuille.
          </p>
        )}

        {result && result !== "loading" && (
          <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
            <p className="text-lg text-[#2d4a3e]">
              Tu as obtenu <strong>{result.points_obtenus} point{result.points_obtenus > 1 ? "s" : ""}</strong> sur 14.
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#2d4a3e]">
              Score : {result.score_sur_10} / 10
            </p>
            <p className="mt-2 text-[#2d4a3e]/80">
              {libelleMaitrise(result.score_sur_10)}
            </p>
          </div>
        )}

        <Link href="/enfant/evaluations" className="mt-10 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}
