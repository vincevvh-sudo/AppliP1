"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import {
  SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES,
  isSoustraction20SerieShared,
  setSoustraction20SerieShared,
  setAllSoustractions20SeriesShared,
} from "../../../data/maths-partages";
import { TITRE_SOUSTRACTIONS_JUSQUE_20, getSoustraction20Serie } from "../../../data/maths-soustractions-20";

export default function EnseignantMathsSoustractions20Page() {
  const [partage, setPartage] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const id of SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES) next[id] = isSoustraction20SerieShared(id);
    setPartage(next);
    setHydrated(true);
  }, []);

  const toggleSerie = useCallback((id: string) => {
    setPartage((p) => {
      const next = !p[id];
      setSoustraction20SerieShared(id, next);
      return { ...p, [id]: next };
    });
  }, []);

  const shareAll = useCallback(() => {
    setAllSoustractions20SeriesShared(true);
    const next: Record<string, boolean> = {};
    for (const id of SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES) next[id] = true;
    setPartage(next);
  }, []);

  const shareNone = useCallback(() => {
    setAllSoustractions20SeriesShared(false);
    const next: Record<string, boolean> = {};
    for (const id of SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES) next[id] = false;
    setPartage(next);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#1f2933]/10 bg-[#fef9ff]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#1f2933]">{TITRE_SOUSTRACTIONS_JUSQUE_20}</span>
          <Link
            href="/enseignant/maths/exercice/nombres"
            className="rounded-full bg-[#1f2933]/10 px-4 py-2 text-sm font-medium text-[#1f2933] transition hover:bg-[#1f2933]/20"
          >
            ← Arithmétique
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl text-[#1f2933]">5 séries de 10 soustractions</h1>
        <p className="mt-2 text-sm text-[#1f2933]/80">
          Chaque calcul commence à 20 ou un nombre entre 10 et 20, avec un résultat entre 10 et 20.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={shareAll} className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d]">
            Tout partager avec les enfants
          </button>
          <button type="button" onClick={shareNone} className="rounded-xl bg-[#1f2933]/10 px-4 py-2 text-sm font-semibold text-[#1f2933] transition hover:bg-[#1f2933]/20">
            Ne plus rien partager
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {hydrated ? (
            SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.map((id) => (
              <div key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f2933]/15 bg-white/95 px-4 py-3 shadow-sm">
                <span className="font-medium text-[#1f2933]">Soustractions 20 - {id}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1f2933]">
                    <input type="checkbox" checked={partage[id] ?? false} onChange={() => toggleSerie(id)} className="h-4 w-4 rounded border-[#1f2933]/40" />
                    Partager avec les enfants
                  </label>
                  <a href={`/enseignant/maths/soustractions-20/eleve/${id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#4a7c5a] underline-offset-2 hover:underline">
                    Prévisualiser (vue élève) ↗
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1f2933]/70">Chargement…</p>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.map((id) => {
            const { titre, questions } = getSoustraction20Serie(id);
            return (
              <div key={`preview-sub20-${id}`} className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
                <h2 className="font-display text-lg text-[#1f2933]">{titre}</h2>
                <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
                  {questions.map((q) => (
                    <li key={q.id}>
                      {q.a} - {q.b} = <span className="font-semibold">{q.result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
