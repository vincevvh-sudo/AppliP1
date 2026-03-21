"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { renderJeu } from "../../../../../components/JeuxSons";
import { getSonById, getNiveauById } from "../../../../../data/sons-data";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantJeuNiveauPage() {
  const params = useParams();
  const router = useRouter();
  const sonId = params.sonId as string;
  const niveauId = params.niveauId as string;

  const son = getSonById(sonId);
  const niveau = son ? getNiveauById(sonId, niveauId) : undefined;

  const handleTermine = (reussi: boolean) => {
    if (reussi) {
      router.push(`/enfant/sons/${sonId}?success=1`);
    } else {
      const again = window.confirm("Tu peux réessayer ! Veux-tu réessayer ?");
      if (!again) router.push(`/enfant/sons/${sonId}`);
    }
  };

  if (!son || !niveau) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Exercice introuvable.</p>
          <Link href="/enfant/sons" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href={`/enfant/sons/${sonId}`}
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            {son.grapheme} — {niveau.titre}
          </Link>
          <Link
            href={`/enfant/sons/${sonId}`}
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-3xl bg-white/95 p-8 shadow-xl">
          {renderJeu(son, niveau, handleTermine)}
        </div>
      </div>
    </main>
  );
}
