"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { SONS, getSonById } from "../../data/sons-data";
import { getSharedSonsForEleve } from "../../data/sons-partages";
import { getEnfantSession } from "../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantSonsPage() {
  const [sharedIds, setSharedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const session = getEnfantSession();

  useEffect(() => {
    if (!session) return;
    getSharedSonsForEleve(session.id).then((ids) => {
      setSharedIds(ids);
      setLoading(false);
    });
  }, [session?.id]);

  // Si pas connecté ou pas de partages Supabase, afficher tous les sons (fallback)
  const idsToShow = sharedIds.length > 0 ? sharedIds : SONS.map((s) => s.id);
  const sonsToShow = idsToShow
    .map((id) => getSonById(id))
    .filter(Boolean)
    .sort((a, b) => (a?.ordre ?? 0) - (b?.ordre ?? 0)) as NonNullable<ReturnType<typeof getSonById>>[];

  if (!session) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Connecte-toi d&apos;abord.</p>
          <Link href="/enfant" className="mt-4 inline-block text-[#4a7c5a]">
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
            href="/enfant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Forêt des sons
          </Link>
          <Link
            href="/enfant"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Choisis un son
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Clique sur un son pour faire les exercices.
        </p>

        {loading ? (
          <p className="mt-12 text-center text-[#2d4a3e]/70">Chargement…</p>
        ) : sonsToShow.length === 0 ? (
          <p className="mt-12 text-center text-[#2d4a3e]/80">
            Aucun son partagé pour le moment. Demande à ton maître ou ta maîtresse !
          </p>
        ) : (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {sonsToShow.map((son) => (
              <Link
                key={son.id}
                href={`/enfant/sons/${son.id}`}
                className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white/95 shadow-lg transition hover:-translate-y-2 hover:bg-[#a8d5ba]/50 hover:shadow-xl"
              >
                <span className="text-3xl font-bold text-[#2d4a3e]">
                  {son.grapheme.split(",")[0].trim()}
                </span>
                <span className="text-xs text-[#2d4a3e]/70">{son.phoneme}</span>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/enfant"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}
