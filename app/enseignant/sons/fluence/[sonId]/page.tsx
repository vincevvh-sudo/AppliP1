"use client";

import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { getSonById } from "../../../../data/sons-data";

/** Redirection vers la page test (vue élève) pour l’enseignant. */
export default function EnseignantFluenceSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Son introuvable.</p>
          <Link href="/enseignant/sons/fluence" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour à Fluence
          </Link>
        </div>
      </main>
    );
  }

  redirect(`/enseignant/sons/fluence/test/${sonId}`);
}
