"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { DICTEE_MOTS, NOM_DICTEE_MOTS } from "../../data/dictee-mots-data";
import { getDicteesMotsPartagesPourEleve } from "../../data/dictee-mots-partages";
import { getEnfantSession } from "../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantDicteesMotsPage() {
  const session = getEnfantSession();
  const [partageDicteesMots, setPartageDicteesMots] = useState<number[] | null>(null);

  useEffect(() => {
    if (!session?.id) {
      setPartageDicteesMots([]);
      return;
    }
    getDicteesMotsPartagesPourEleve(session.id as number).then(setPartageDicteesMots);
  }, [session?.id]);

  if (partageDicteesMots === null) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 flex min-h-[40vh] items-center justify-center">
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        </div>
      </main>
    );
  }

  const aucuneDictee = partageDicteesMots.length === 0;

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
            Dictées de mots
          </Link>
          <Link
            href="/enfant/sons"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour à la Forêt des sons
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">Dictées de mots</h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Choisis une dictée de mots. Tu pourras écouter chaque mot autant de fois que tu veux puis
          l&apos;écrire pour t&apos;entraîner.
        </p>

        {aucuneDictee ? (
          <div className="mt-8 text-[#2d4a3e]/80">
            <p>
              Ton maître ou ta maîtresse n&apos;a pas encore partagé de dictées de mots. Il pourra
              partager la Dictée de mots 1, puis la 2, etc., depuis la partie enseignant.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {partageDicteesMots.map((num) => {
              const i = num - 1;
              const mots = DICTEE_MOTS[i] ?? [];
              if (mots.length === 0) return null;
              return (
                <Link
                  key={num}
                  href={`/enfant/dictees-mots/${num}`}
                  className="block rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
                >
                  <p className="font-display text-lg font-semibold text-[#2d4a3e]">
                    {NOM_DICTEE_MOTS[i]}
                  </p>
                  <p className="mt-1 text-sm text-[#2d4a3e]/70">
                    {mots.length} mots à écouter et à écrire
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

