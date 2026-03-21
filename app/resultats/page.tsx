"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Redirection vers /enseignant/resultats pour intégrer les résultats dans l'espace enseignant.
 */
function ResultatsRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eleve = searchParams.get("eleve");

  useEffect(() => {
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
