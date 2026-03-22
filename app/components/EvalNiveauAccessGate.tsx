"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "./MiyazakiDecor";
import { useEvalNiveauAccess } from "../hooks/useEvalNiveauAccess";

type Props = {
  sonId: string;
  niveauId: string;
  /** Sous-titre du message « non disponible » */
  matiereLabel?: string;
  children: React.ReactNode;
};

export function EvalNiveauAccessGate({ sonId, niveauId, matiereLabel, children }: Props) {
  const state = useEvalNiveauAccess(sonId, niveauId);

  if (state === "loading" || state === "no-session") {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-lg px-5 py-20 text-center text-[#2d4a3e]/80">
          <p>Chargement…</p>
        </div>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-display text-xl text-[#2d4a3e]">Évaluation non disponible</h1>
          <p className="mt-3 text-sm text-[#2d4a3e]/80">
            Cette évaluation{matiereLabel ? ` (${matiereLabel})` : ""} n&apos;a pas été partagée avec toi. Demande à ton
            enseignant ou reviens plus tard.
          </p>
          <Link
            href="/enfant/evaluations"
            className="mt-6 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            ← Mes évaluations
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
