"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import {
  getDicteeScoresByEleves,
  setDicteeScores,
  NOMBRE_DICTEES,
  type DicteeScores,
} from "../../../data/dictee-scores-storage";
import { DICTEE_SYLLABES, NOM_DICTEE } from "../../../data/dictee-syllabes";
import {
  getDicteePartageInfo,
  setDicteePartageePourTous,
  setDicteePartageePourEleve,
} from "../../../data/dictee-partages";
import { supabase } from "../../../../utils/supabase";
import type { EleveRow } from "../../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

/** Icône crayon / dictée pour chaque colonne */
const IconDictee = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const MAX_POINTS = 5;

function clampInput(v: string): number | null {
  if (v === "" || v === "-") return null;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(MAX_POINTS, Math.max(0, n));
}

function emptyRow(): Record<`dictee_${number}`, number | null> {
  const row = {} as Record<`dictee_${number}`, number | null>;
  for (let i = 1; i <= NOMBRE_DICTEES; i++) {
    row[`dictee_${i}` as `dictee_${number}`] = null;
  }
  return row;
}

export default function EnseignantEvaluation5Page() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [scores, setScores] = useState<Record<string, DicteeScores>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [partageInfo, setPartageInfo] = useState<
    Record<number, { partageTous: boolean; eleveId: string | number | null }>
  >(() => {
    const init: Record<number, { partageTous: boolean; eleveId: string | number | null }> = {};
    for (let i = 1; i <= NOMBRE_DICTEES; i++) init[i] = { partageTous: false, eleveId: null };
    return init;
  });
  const [partageLoading, setPartageLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      setEleves((data ?? []) as EleveRow[]);
      const byEleves = await getDicteeScoresByEleves();
      const next: Record<string, DicteeScores> = {};
      for (const e of data ?? []) {
        const id = String((e as EleveRow).id);
        const row = byEleves[id];
        const base = emptyRow();
        if (row) {
          for (let i = 1; i <= NOMBRE_DICTEES; i++) {
            const key = `dictee_${i}` as `dictee_${number}`;
            (base as Record<string, number | null>)[key] = (row as Record<string, number | null>)[key] ?? null;
          }
        }
        next[id] = { eleve_id: id, ...base };
      }
      setScores(next);
    } catch {
      setEleves([]);
      setScores({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Promise.all(
      Array.from({ length: NOMBRE_DICTEES }, (_, i) => getDicteePartageInfo(i + 1))
    ).then((infos) => {
      const next: Record<number, { partageTous: boolean; eleveId: string | number | null }> = {};
      infos.forEach((info, i) => {
        next[i + 1] = info;
      });
      setPartageInfo(next);
    });
  }, []);

  const refreshPartageInfo = useCallback(async (dicteeNum: number) => {
    const info = await getDicteePartageInfo(dicteeNum);
    setPartageInfo((prev) => ({ ...prev, [dicteeNum]: info }));
  }, []);

  const handlePartagerTous = async (dicteeNum: number) => {
    setPartageLoading(dicteeNum);
    const { ok, error } = await setDicteePartageePourTous(dicteeNum, true);
    setPartageLoading(null);
    if (ok) await refreshPartageInfo(dicteeNum);
    else if (error) alert(error);
  };

  const handleNePlusPartager = async (dicteeNum: number) => {
    setPartageLoading(dicteeNum);
    const { ok: ok1 } = await setDicteePartageePourTous(dicteeNum, false);
    const { ok: ok2 } = await setDicteePartageePourEleve(dicteeNum, null);
    setPartageLoading(null);
    if (ok1 || ok2) await refreshPartageInfo(dicteeNum);
  };

  const handlePartagerAvecEleve = async (dicteeNum: number, eleveId: string | number) => {
    setPartageLoading(dicteeNum);
    const { ok, error } = await setDicteePartageePourEleve(dicteeNum, eleveId);
    setPartageLoading(null);
    if (ok) await refreshPartageInfo(dicteeNum);
    else if (error) alert(error);
  };

  const handleChange = (eleveId: string, index: number, value: string) => {
    const n = clampInput(value);
    const key = `dictee_${index}` as `dictee_${number}`;
    setScores((prev) => {
      const cur = prev[eleveId];
      if (!cur) return prev;
      return {
        ...prev,
        [eleveId]: { ...cur, [key]: n },
      };
    });
  };

  const handleBlur = async (eleveId: string) => {
    const row = scores[eleveId];
    if (!row) return;
    setSaving(eleveId);
    try {
      await setDicteeScores(eleveId, row);
    } finally {
      setSaving(null);
    }
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
            Évaluation 5 — Dictées
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-full px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation 5 — Dictées de syllabes</h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/75">
          Saisissez les points sur 5 pour chaque élève (5 dictées). Les valeurs sont enregistrées automatiquement.
        </p>

        <div className="mt-6 rounded-2xl border-2 border-[#4a7c5a]/40 bg-[#a8d5ba]/20 p-4">
          <p className="font-display text-[#2d4a3e]">Tester et partager</p>
          <p className="mt-1 text-sm text-[#2d4a3e]/70">
            Teste chaque dictée comme un élève, puis partage-la avec tous les enfants ou avec un seul élève (Forêt des sons → Dictées).
          </p>
          <div className="mt-6 space-y-6">
            {[1, 2, 3, 4, 5].map((num) => {
              const info = partageInfo[num] ?? { partageTous: false, eleveId: null };
              const loading = partageLoading === num;
              const partagee = info.partageTous || info.eleveId != null;
              const eleve =
                info.eleveId != null ? eleves.find((e) => String(e.id) === String(info.eleveId)) : null;
              return (
                <div
                  key={num}
                  className="rounded-xl border border-[#2d4a3e]/15 bg-white/90 p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display font-semibold text-[#2d4a3e]">
                      {NOM_DICTEE[num - 1]}
                    </span>
                    <Link
                      href={`/enseignant/sons/evaluation-5/test/${num}`}
                      className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
                    >
                      Tester
                    </Link>
                    <span className="text-[#2d4a3e]/60">|</span>
                    <span className="text-sm text-[#2d4a3e]/80">Partager :</span>
                    {!partagee ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePartagerTous(num)}
                          disabled={!!partageLoading}
                          className="rounded-lg bg-[#4a7c5a] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
                        >
                          {loading ? "…" : "Avec tous"}
                        </button>
                        <span className="text-sm text-[#2d4a3e]/70">ou avec un élève</span>
                        <select
                          value={""}
                          onChange={(ev) => {
                            const id = ev.target.value;
                            if (id) handlePartagerAvecEleve(num, id);
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
                        {info.partageTous ? (
                          <span className="text-sm font-medium text-[#2d4a3e]">Partagé avec tous</span>
                        ) : eleve ? (
                          <span className="text-sm font-medium text-[#2d4a3e]">
                            Partagé avec {eleve.prenom} {eleve.nom}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleNePlusPartager(num)}
                          disabled={!!partageLoading}
                          className="rounded-lg bg-[#2d4a3e]/15 px-3 py-1.5 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/25 disabled:opacity-50"
                        >
                          {loading ? "…" : "Ne plus partager"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-[#2d4a3e]/15 bg-[#fef9f3]/80 p-4">
          <h2 className="font-display text-lg text-[#2d4a3e]">Les dictées (syllabes à dicter — 1 à {NOMBRE_DICTEES})</h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/70">
            L&apos;enfant écoute chaque syllabe et l&apos;écrit. Tu peux noter sur 5 après chaque dictée.
          </p>
          <ul className="mt-4 space-y-3">
            {DICTEE_SYLLABES.map((syllabes, i) => (
              <li key={i} className="rounded-xl bg-white/80 px-4 py-3">
                <span className="font-semibold text-[#2d4a3e]">{NOM_DICTEE[i]} : </span>
                <span className="text-[#2d4a3e]/90">{syllabes.length > 0 ? syllabes.join(", ") : "— (à remplir plus tard)"}</span>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <p className="mt-8 text-[#2d4a3e]/70">Chargement…</p>
        ) : eleves.length === 0 ? (
          <p className="mt-8 text-[#2d4a3e]/70">Aucun élève. Ajoutez des élèves depuis l’onglet Élèves.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border-2 border-[#2d4a3e]/15 bg-white/95 shadow-lg">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#2d4a3e]/20 bg-[#a8d5ba]/30">
                  <th className="sticky left-0 z-10 min-w-[140px] bg-[#a8d5ba]/30 p-3 font-display text-[#2d4a3e]">
                    Élève
                  </th>
                  {Array.from({ length: NOMBRE_DICTEES }, (_, i) => i + 1).map((num) => (
                    <th key={num} className="p-2 text-center">
                      <span className="flex items-center justify-center gap-1 font-display text-[#2d4a3e]">
                        <IconDictee />
                        <span className="text-sm">{NOM_DICTEE[num - 1]}</span>
                        <span className="sr-only">Dictée {num}</span>
                      </span>
                      <span className="block text-xs font-normal text-[#2d4a3e]/70">/5</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eleves.map((e) => {
                  const idStr = String(e.id);
                  const row = scores[idStr];
                  const savingRow = saving === idStr;
                  const values = row ?? { eleve_id: idStr, ...emptyRow() };
                  return (
                    <tr key={e.id} className="border-b border-[#2d4a3e]/10 hover:bg-[#a8d5ba]/10">
                      <td className="sticky left-0 z-10 min-w-[140px] bg-white/95 p-3 font-medium text-[#2d4a3e]">
                        {e.prenom} {e.nom}
                        {savingRow && <span className="ml-2 text-xs text-[#2d4a3e]/60">Enregistrement…</span>}
                      </td>
                      {Array.from({ length: NOMBRE_DICTEES }, (_, i) => i + 1).map((num) => {
                        const key = `dictee_${num}` as `dictee_${number}`;
                        const val = (values as Record<string, number | null>)[key] ?? null;
                        return (
                          <td key={num} className="p-1">
                            <input
                              type="number"
                              min={0}
                              max={MAX_POINTS}
                              step={1}
                              className="w-12 rounded-lg border border-[#2d4a3e]/25 px-1 py-1 text-center text-sm text-[#2d4a3e]"
                              value={val ?? ""}
                              onChange={(ev) => handleChange(idStr, num, ev.target.value)}
                              onBlur={() => handleBlur(idStr)}
                              placeholder="—"
                              aria-label={`Dictée ${num} sur 5`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href="/enseignant/sons/evaluations"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux Évaluations
        </Link>
      </div>
    </main>
  );
}
