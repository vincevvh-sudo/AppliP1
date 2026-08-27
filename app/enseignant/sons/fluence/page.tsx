"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PARTIES_FORET, getSonsByPartie, type Son } from "../../../data/sons-data";
import {
  FLUENCE_VOYELLE_LABEL,
  fluenceNiveauId,
  getFluenceDisplayLabel,
} from "../../../data/fluence-partage";
import {
  getPartageEvalNiveauState,
  setPartageEvalNiveau,
} from "../../../data/sons-partages";
import { supabase } from "../../../../utils/supabase";
import type { EleveRow } from "../../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Mêmes parties que les exercices de sons : Voyelles, Consonnes, Sons. */
const PARTIES_FLUENCE = PARTIES_FORET.filter((p) => p.sonIds.length > 0);

type FluenceItem = {
  son: Son;
  label: string;
  isVoyelleNum: boolean;
  niveauId: string;
};

function buildFluenceItems(): FluenceItem[] {
  const items: FluenceItem[] = [];
  for (const partie of PARTIES_FLUENCE) {
    const sons = getSonsByPartie(partie).filter((s) => s.id !== "et");
    sons.forEach((son, index) => {
      const isVoyelleNum = partie.id === "voyelles" && index < 3;
      const label =
        isVoyelleNum
          ? FLUENCE_VOYELLE_LABEL[son.id] ?? `Voyelle ${index + 1}`
          : getFluenceDisplayLabel(son);
      items.push({
        son,
        label,
        isVoyelleNum,
        niveauId: fluenceNiveauId(son.id),
      });
    });
  }
  return items;
}

const FLUENCE_ITEMS = buildFluenceItems();

type PartageInfo = { partageTous: boolean; eleveIds: string[] };

export default function EnseignantFluencePage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [partageInfo, setPartageInfo] = useState<Record<string, PartageInfo>>({});
  const [partageLoading, setPartageLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ sonId: string; type: "ok" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      setEleves((data ?? []) as EleveRow[]);
    })();
  }, []);

  const refreshPartage = useCallback(async (sonId: string, niveauId: string) => {
    const state = await getPartageEvalNiveauState(sonId, niveauId);
    setPartageInfo((prev) => ({
      ...prev,
      [sonId]: { partageTous: state.toAll, eleveIds: state.eleveIds },
    }));
  }, []);

  useEffect(() => {
    void (async () => {
      const entries = await Promise.all(
        FLUENCE_ITEMS.map(async (item) => {
          const state = await getPartageEvalNiveauState(item.son.id, item.niveauId);
          return [item.son.id, { partageTous: state.toAll, eleveIds: state.eleveIds }] as const;
        })
      );
      setPartageInfo(Object.fromEntries(entries));
    })();
  }, []);

  const handlePartagerTous = async (sonId: string, niveauId: string) => {
    setPartageLoading(sonId);
    setMessage(null);
    const { ok, error } = await setPartageEvalNiveau(sonId, niveauId, true, []);
    setPartageLoading(null);
    if (ok) {
      await refreshPartage(sonId, niveauId);
      setMessage({ sonId, type: "ok", text: "Partagé à tous les élèves." });
    } else {
      setMessage({ sonId, type: "error", text: error ?? "Erreur lors du partage." });
    }
  };

  const handlePartagerAvecEleve = async (sonId: string, niveauId: string, eleveId: string) => {
    setPartageLoading(sonId);
    setMessage(null);
    const { ok, error } = await setPartageEvalNiveau(sonId, niveauId, false, [eleveId]);
    setPartageLoading(null);
    if (ok) {
      await refreshPartage(sonId, niveauId);
      const el = eleves.find((e) => String(e.id) === eleveId);
      setMessage({
        sonId,
        type: "ok",
        text: el ? `Partagé à ${el.prenom} ${el.nom}.` : "Partagé à l'élève choisi.",
      });
    } else {
      setMessage({ sonId, type: "error", text: error ?? "Erreur lors du partage." });
    }
  };

  const handleNePlusPartager = async (sonId: string, niveauId: string) => {
    setPartageLoading(sonId);
    setMessage(null);
    const { ok, error } = await setPartageEvalNiveau(sonId, niveauId, false, []);
    setPartageLoading(null);
    if (ok) {
      await refreshPartage(sonId, niveauId);
      setMessage({ sonId, type: "ok", text: "Partage retiré." });
    } else {
      setMessage({ sonId, type: "error", text: error ?? "Erreur lors du retrait." });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/evaluations"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Fluence
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Choisir un test de Fluence</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Comme pour les dictées : <strong>Tester</strong>, puis partager{" "}
          <strong>avec tous</strong> ou choisir un élève dans le menu déroulant. Les enfants le voient dans{" "}
          <strong>Français → Fluence</strong>.
        </p>

        <div className="mt-8 space-y-8">
          {PARTIES_FLUENCE.map((partie) => {
            const items = FLUENCE_ITEMS.filter((it) => {
              const sons = getSonsByPartie(partie).map((s) => s.id);
              return sons.includes(it.son.id);
            });
            if (items.length === 0) return null;
            return (
              <section key={partie.id}>
                <h2 className="font-display text-lg font-semibold text-[#2d4a3e]">{partie.titre}</h2>
                <div className="mt-3 space-y-4">
                  {items.map((item) => {
                    const info = partageInfo[item.son.id] ?? { partageTous: false, eleveIds: [] };
                    const loading = partageLoading === item.son.id;
                    const partagee = info.partageTous || info.eleveIds.length > 0;
                    const elevesPartages = info.eleveIds
                      .map((id) => eleves.find((e) => String(e.id) === id))
                      .filter(Boolean) as EleveRow[];
                    const msg = message?.sonId === item.son.id ? message : null;

                    return (
                      <div
                        key={item.son.id}
                        className="rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-lg"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg text-[#2d4a3e]">{item.label}</p>
                            {!item.isVoyelleNum && (
                              <p className="text-sm text-[#2d4a3e]/70">{item.son.phoneme}</p>
                            )}
                          </div>
                          <Link
                            href={`/enseignant/sons/fluence/test/${item.son.id}`}
                            className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
                          >
                            Tester
                          </Link>
                          <span className="text-[#2d4a3e]/40">|</span>
                          <span className="text-sm font-medium text-[#2d4a3e]/80">Partager :</span>
                          {!partagee ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePartagerTous(item.son.id, item.niveauId)}
                                disabled={!!partageLoading}
                                className="rounded-lg bg-[#4a7c5a] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
                              >
                                {loading ? "…" : "Avec tous"}
                              </button>
                              <span className="text-sm text-[#2d4a3e]/70">ou un élève</span>
                              <select
                                value=""
                                onChange={(ev) => {
                                  const id = ev.target.value;
                                  if (id) void handlePartagerAvecEleve(item.son.id, item.niveauId, id);
                                  ev.target.value = "";
                                }}
                                disabled={!!partageLoading || eleves.length === 0}
                                className="rounded-lg border border-[#2d4a3e]/25 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] disabled:opacity-50"
                              >
                                <option value="">— Choisir —</option>
                                {eleves.map((e) => (
                                  <option key={e.id} value={String(e.id)}>
                                    {e.prenom} {e.nom}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <>
                              <span className="rounded-lg bg-[#a8d5ba]/50 px-3 py-1.5 text-sm font-medium text-[#2d4a3e]">
                                {info.partageTous
                                  ? "Partagé avec tous"
                                  : elevesPartages.length === 1
                                    ? `Partagé avec ${elevesPartages[0].prenom}`
                                    : `Partagé avec ${elevesPartages.length} élèves`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleNePlusPartager(item.son.id, item.niveauId)}
                                disabled={!!partageLoading}
                                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {loading ? "…" : "Ne plus partager"}
                              </button>
                              {!info.partageTous && (
                                <select
                                  value=""
                                  onChange={(ev) => {
                                    const id = ev.target.value;
                                    if (id) void handlePartagerAvecEleve(item.son.id, item.niveauId, id);
                                    ev.target.value = "";
                                  }}
                                  disabled={!!partageLoading || eleves.length === 0}
                                  className="rounded-lg border border-[#2d4a3e]/25 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] disabled:opacity-50"
                                  title="Changer d'élève"
                                >
                                  <option value="">— Autre élève —</option>
                                  {eleves.map((e) => (
                                    <option key={e.id} value={String(e.id)}>
                                      {e.prenom} {e.nom}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </>
                          )}
                        </div>
                        {msg && (
                          <p
                            className={`mt-2 text-sm font-medium ${
                              msg.type === "ok" ? "text-[#2d6b4a]" : "text-[#b45309]"
                            }`}
                          >
                            {msg.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <Link
          href="/enseignant/sons/evaluations"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux Évaluations
        </Link>
      </div>
    </main>
  );
}
