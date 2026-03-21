"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEnfantSession } from "../../utils/enfant-session";

/**
 * Redirection : les enfants connectés → leurs résultats personnels (/enfant/resultats).
 * Sinon → espace enseignant (lien court /resultats pour les profs).
 */
function ResultatsRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eleve = searchParams.get("eleve");

  useEffect(() => {
    const enfant = getEnfantSession();
    if (enfant) {
      router.replace("/enfant/resultats");
      return;
    }
    const url = eleve ? `/enseignant/resultats?eleve=${eleve}` : "/enseignant/resultats";
    router.replace(url);
  }, [router, eleve]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[#2d4a3e]">
      Redirection…
    </div>
  );
}

export default function ResultatsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#2d4a3e]">Chargement…</div>
      }
    >
      <ResultatsRedirectInner />
    </Suspense>
  );
}
