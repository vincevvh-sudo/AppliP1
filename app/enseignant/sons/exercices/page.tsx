"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PARTIES_FORET, getSonsByPartie } from "../../../data/sons-data";
import {
  isSonSharedToAll,
  getElevesForSon,
  shareToAll,
  unshareFromAll,
  shareToEleves,
  isEvaluationsSharedToAll,
  getElevesEvaluationsForSon,
  setPartageEvaluationsToAll,
} from "../../../data/sons-partages";
import { supabase } from "../../../../utils/supabase";
import type { EleveRow } from "../../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Parties affichées dans Exercices : tout sauf la section Évaluations. */
const PARTIES_EXERCICES = PARTIES_FORET.filter((p) => p.id !== "evaluations");

export default function EnseignantSonsExercicesPage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [partages, setPartages] = useState<Record<string, { all: boolean; eleves: number[] }>>({});
  const [partagesEval, setPartagesEval] = useState<Record<string, { all: boolean; eleves: number[] }>>({});
  const [loading, setLoading] = useState(true);

  const allSonIds = PARTIES_EXERCICES.flatMap((p) => p.sonIds);

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
      const pEval: Record<string, { all: boolean; eleves: number[] }> = {};
      for (const sonId of allSonIds) {
        const [all, eleves, allEval, elevesEval] = await Promise.all([
          isSonSharedToAll(sonId),
          getElevesForSon(sonId),
          isEvaluationsSharedToAll(sonId),
          getElevesEvaluationsForSon(sonId),
        ]);
        p[sonId] = { all, eleves };
        pEval[sonId] = { all: allEval, eleves: elevesEval };
      }
      setPartages(p);
      setPartagesEval(pEval);
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

  const handleToggleEvaluations = async (sonId: string) => {
    const current = partagesEval[sonId]?.all ?? false;
    const next = !current;
    const result = await setPartageEvaluationsToAll(sonId, next);
    if (!result.ok) {
      alert(
        "Impossible d'enregistrer le partage des évaluations. Avez-vous créé la table dans Supabase ? Exécutez le fichier supabase-sons-partages-evaluations.sql dans le SQL Editor."
      );
      return;
    }
    setPartagesEval((prev) => ({
      ...prev,
      [sonId]: { ...prev[sonId], all: next },
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Forêt des sons — Exercices
          </Link>
          <Link
            href="/enseignant/sons"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour à la Forêt des sons
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Exercices
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Voyelles, consonnes, les sons et lecture — Phono 1, Phono 2, Phono Image 1 et Sons images. Partage et teste par son.
        </p>

        {PARTIES_EXERCICES.map((partie) => (
          <section key={partie.id} className="mt-12 first:mt-10">
            <h2 className="font-display text-xl text-[#2d4a3e]">{partie.titre}</h2>
            {partie.sonIds.length > 0 && (
              <p className="mt-1 text-sm text-[#2d4a3e]/75">
                Phono 1, Phono 2, Phono Image 1 et Sons images — partage et teste par son.
              </p>
            )}
            {partie.sonIds.length > 0 && (
              <div className="mt-4 space-y-4">
                {getSonsByPartie(partie).map((son) => (
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
                            Phono 1, Phono 2, Phono Image 1 et Sons images
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-[#2d4a3e]/80">Partager à :</label>
                      {loading ? (
                        <span className="text-sm text-[#2d4a3e]/60">Chargement…</span>
                      ) : (
                        <select
                          className="min-w-[180px] rounded-xl border border-[#2d4a3e]/30 bg-white px-3 py-2 text-sm text-[#2d4a3e]"
                          value={
                            partages[son.id]?.all
                              ? "all"
                              : partages[son.id]?.eleves?.length === 1
                                ? String(partages[son.id].eleves[0])
                                : ""
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "all") handleShareAll(son.id);
                            else if (v === "" || v === "none") handleShareToEleves(son.id, []);
                            else handleShareToEleves(son.id, [parseInt(v, 10)]);
                          }}
                        >
                          <option value="">— Choisir —</option>
                          <option value="all">Tous les enfants</option>
                          {eleves.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.prenom} {e.nom}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#2d4a3e]/10 pt-3">
                      <span className="text-sm text-[#2d4a3e]/75">Évaluations (Éval 1 à 4) visibles par les enfants :</span>
                      <button
                        type="button"
                        onClick={() => handleToggleEvaluations(son.id)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                          partagesEval[son.id]?.all
                            ? "bg-[#4a7c5a] text-white"
                            : "border border-[#2d4a3e]/30 text-[#2d4a3e]"
                        }`}
                      >
                        {partagesEval[son.id]?.all ? "Oui ✓" : "Non"}
                      </button>
                      <span className="text-xs text-[#2d4a3e]/60">
                        {partagesEval[son.id]?.all
                          ? "Les enfants voient les évaluations pour ce son."
                          : "Seuls les exercices (Phono, Phono images) sont visibles."}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {partie.isLecture && (
              <>
                <p className="mt-1 text-sm text-[#2d4a3e]/75">
                  Exercices de lecture.
                </p>
                <div className="mt-4">
                  <Link
                    href="/enseignant/sons/lecture"
                    className="inline-block rounded-2xl bg-white/95 p-5 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/20"
                  >
                    <p className="font-display text-lg text-[#2d4a3e]">Lecture</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">Tu pourras ajouter des exercices de lecture ici.</p>
                  </Link>
                </div>
              </>
            )}
          </section>
        ))}

        <Link
          href="/enseignant/sons"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour à la Forêt des sons
        </Link>
      </div>
    </main>
  );
}
