"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { DICTEE_MOTS, NOM_DICTEE_MOTS } from "../../../../../data/dictee-mots-data";
const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantDicteeMotsTestPage() {
  const params = useParams();
  const num = parseInt(params.num as string, 10);
  const index = Number.isFinite(num) && num >= 1 && num <= DICTEE_MOTS.length ? num - 1 : -1;

  if (index < 0) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Dictée de mots introuvable.</p>
          <Link
            href="/enseignant/sons/dictees-mots"
            className="mt-4 inline-block text-[#4a7c5a]"
          >
            ← Retour aux dictées de mots
          </Link>
        </div>
      </main>
    );
  }

  const mots = DICTEE_MOTS[index] ?? [];
  const titre = NOM_DICTEE_MOTS[index] ?? `Dictée de mots ${num}`;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/dictees-mots"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Tester — {titre}
          </Link>
          <Link
            href="/enseignant/sons/dictees-mots"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux dictées de mots
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10">
        <p className="text-sm text-[#2d4a3e]/80">
          Lis chaque mot / phrase à haute voix pour vérifier la dictée avant de la faire aux élèves.
        </p>

        <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">{titre}</h2>
          <ul className="mt-3 list-decimal space-y-2 pl-6 text-[#2d4a3e]/90">
            {mots.map((mot, i) => (
              <li key={i}>{mot}</li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/dictees-mots"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux dictées de mots
        </Link>
      </div>
    </main>
  );
}

