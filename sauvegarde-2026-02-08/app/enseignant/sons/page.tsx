"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { SONS } from "../../data/sons-data";
import {
  isSonSharedToAll,
  getElevesForSon,
  shareToAll,
  unshareFromAll,
  shareToEleves,
} from "../../data/sons-partages";
import { supabase } from "../../../utils/supabase";
import type { EleveRow } from "../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantSonsPage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [partages, setPartages] = useState<Record<string, { all: boolean; eleves: number[] }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
        setEleves((data ?? []) as EleveRow[]);
      } catch {
        setEleves([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const p: Record<string, { all: boolean; eleves: number[] }> = {};
      for (const s of SONS) {
        const [all, eleves] = await Promise.all([isSonSharedToAll(s.id), getElevesForSon(s.id)]);
        p[s.id] = { all, eleves };
      }
      setPartages(p);
    })();
  }, []);

  const handleShareAll = async (sonId: string) => {
    await shareToAll(sonId);
    setPartages((prev) => ({
      ...prev,
      [sonId]: { all: true, eleves: prev[sonId]?.eleves ?? [] },
    }));
  };

  const handleUnshareAll = async (sonId: string) => {
    await unshareFromAll(sonId);
    setPartages((prev) => ({
      ...prev,
      [sonId]: { ...prev[sonId], all: false },
    }));
  };

  const handleShareToEleves = async (sonId: string, eleveIds: number[]) => {
    await shareToEleves(sonId, eleveIds);
    setPartages((prev) => ({
      ...prev,
      [sonId]: { ...prev[sonId], eleves: eleveIds },
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Forêt des sons
          </Link>
          <Link
            href="/enseignant"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Forêt des sons
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Partage les sons aux enfants et teste les exercices.
        </p>

        <div className="mt-10 space-y-4">
          {SONS.map((son) => (
            <div
              key={son.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#a8d5ba]/60 text-2xl font-bold text-[#2d4a3e]">
                  {son.grapheme.split(",")[0].trim()}
                </span>
                <div>
                  <p className="font-display text-lg text-[#2d4a3e]">
                    {son.grapheme} — {son.phoneme}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Link
                      href={`/enseignant/sons/jeu/${son.id}`}
                      className="text-sm font-medium text-[#4a7c5a] hover:underline"
                    >
                      Tester les exercices
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {partages[son.id]?.all ? (
                  <button
                    type="button"
                    onClick={() => handleUnshareAll(son.id)}
                    className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-medium text-white"
                  >
                    Partagé à tous ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleShareAll(son.id)}
                    className="rounded-xl border border-[#2d4a3e]/30 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
                  >
                    Partager à tous
                  </button>
                )}
                {loading ? null : (
                  <select
                    className="rounded-xl border border-[#2d4a3e]/30 px-3 py-2 text-sm"
                    value={partages[son.id]?.eleves?.length ? "some" : "none"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "all") handleShareAll(son.id);
                      else if (v === "none") handleShareToEleves(son.id, []);
                      else {
                        const ids = prompt("IDs élèves (séparés par des virgules):");
                        if (ids)
                          handleShareToEleves(
                            son.id,
                            ids.split(",").map((x) => parseInt(x.trim(), 10)).filter(Boolean)
                          );
                      }
                    }}
                  >
                    <option value="none">Personne</option>
                    <option value="all">Tous</option>
                    <option value="some">Quelques-uns</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/enseignant"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
