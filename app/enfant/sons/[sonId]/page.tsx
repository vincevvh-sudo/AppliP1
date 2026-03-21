"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getSonById, type Niveau } from "../../../data/sons-data";
import { getResultatsByEleve } from "../../../data/resultats-storage";
import { getNiveauxEvalPartagesPourEleve } from "../../../data/sons-partages";
import { getEnfantSession } from "../../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);
  const session = typeof window !== "undefined" ? getEnfantSession() : null;
  const [completedEvalNiveauIds, setCompletedEvalNiveauIds] = useState<Set<string>>(new Set());
  const [niveauxEvalPartages, setNiveauxEvalPartages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.id || !sonId) return;
    getResultatsByEleve(session.id).then((resultats) => {
      const ids = new Set(
        resultats.filter((r) => r.son_id === sonId && (r.niveau_id?.includes("eval") ?? false)).map((r) => r.niveau_id)
      );
      setCompletedEvalNiveauIds(ids);
    });
  }, [session?.id, sonId]);

  useEffect(() => {
    if (!session?.id) return;
    getNiveauxEvalPartagesPourEleve(session.id).then((pairs) => {
      setNiveauxEvalPartages(new Set(pairs.map((p) => `${p.son_id}:${p.niveau_id}`)));
    });
  }, [session?.id]);

  const niveauxVisibles = son
    ? son.niveaux.filter((n: Niveau) => {
        if (n.type === "phono" || n.type === "phono-image" || n.type === "relie" || n.type === "article" || n.type === "phrases-vrai-faux" || n.type === "ecrire-syllabe") return true;
        if (n.type === "eval") return niveauxEvalPartages.has(`${sonId}:${n.id}`);
        return false;
      })
    : [];

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Son introuvable.</p>
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
            href="/enfant/sons"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            {son.grapheme}
          </Link>
          <Link
            href="/enfant/sons"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">
          Choisir un exercice — {son.id === "e-accent" ? "é" : son.grapheme}
        </h1>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {niveauxVisibles.map((niveau) => (
            <Link
              key={niveau.id}
              href={`/enfant/sons/${son.id}/jeu/${niveau.id}`}
              className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#a8d5ba]/30"
            >
              <p className="font-display text-lg text-[#2d4a3e]">{niveau.titre}</p>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
              {niveau.type === "eval" ? "Évaluation" : niveau.type === "phono" ? "Lettre entendue" : niveau.type === "phono-image" ? "Image → lettre" : niveau.type === "relie" ? "Relie cursive et imprimé" : niveau.type === "article" ? "Le, la, un, une" : niveau.type === "phrases-vrai-faux" ? "Phrase possible ou impossible" : niveau.type === "ecrire-syllabe" ? "Écrire la syllabe" : niveau.type}
            </p>
            </Link>
          ))}
        </div>

        <Link
          href="/enfant/sons"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux sons
        </Link>
      </div>
    </main>
  );
}
