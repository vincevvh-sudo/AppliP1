"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNiveauxEvalPartagesPourEleve } from "../data/sons-partages";
import { getEnfantSession } from "../../utils/enfant-session";

export type EvalNiveauAccessState = "loading" | "allowed" | "denied" | "no-session";

/**
 * Vérifie si l’élève connecté a reçu le partage pour cette évaluation (son_id + niveau_id).
 */
export function useEvalNiveauAccess(sonId: string, niveauId: string): EvalNiveauAccessState {
  const router = useRouter();
  const [state, setState] = useState<EvalNiveauAccessState>("loading");

  useEffect(() => {
    const session = getEnfantSession();
    if (!session?.id) {
      setState("no-session");
      router.replace("/enfant");
      return;
    }
    let cancelled = false;
    getNiveauxEvalPartagesPourEleve(session.id).then((pairs) => {
      if (cancelled) return;
      const ok = pairs.some((p) => p.son_id === sonId && p.niveau_id === niveauId);
      setState(ok ? "allowed" : "denied");
    });
    return () => {
      cancelled = true;
    };
  }, [sonId, niveauId, router]);

  return state;
}
