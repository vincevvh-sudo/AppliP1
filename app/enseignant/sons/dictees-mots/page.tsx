"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { DICTEE_MOTS, NOM_DICTEE_MOTS } from "../../../data/dictee-mots-data";
import {
  getDicteeMotsScoresByEleves,
  setDicteeMotsScores,
  NOMBRE_DICTEES_MOTS,
  type DicteeMotsScores,
} from "../../../data/dictee-mots-scores-storage";
import {
  getDicteeMotsPartageInfo,
  setDicteeMotsPartageePourTous,
} from "../../../data/dictee-mots-partages";
import { supabase } from "../../../../utils/supabase";
import type { EleveRow } from "../../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

const MAX_POINTS = 5;

function clampInput(v: string): number | null {
  if (v === "" || v === "-") return null;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(MAX_POINTS, Math.max(0, n));
}

function emptyRow(): Record<`mot_${number}`, number | null> {
  const row = {} as Record<`mot_${number}`, number | null>;
  for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
    row[`mot_${i}` as `mot_${number}`] = null;
  }
  return row;
}

export default function EnseignantDicteesMotsPage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [scores, setScores] = useState<Record<string, DicteeMotsScores>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [partageInfo, setPartageInfo] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) init[i] = false;
    return init;
  });
  const [partageLoading, setPartageLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      const list = (data ?? []) as EleveRow[];
      setEleves(list);
      const byEleve = await getDicteeMotsScoresByEleves();
      const next: Record<string, DicteeMotsScores> = {};
      for (const e of list) {
        const id = String(e.id);
        const row = byEleve[id];
        const base = emptyRow();
        if (row) {
          for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
            const key = `mot_${i}` as `mot_${number}`;
            (base as Record<string, number | null>)[key] =
              (row as Record<string, number | null>)[key] ?? null;
          }
        }
        next[id] = { eleve_id: id, ...base } as DicteeMotsScores;
      }
      setScores(next);

      // Charger l'état de partage (pour tous les élèves) pour chaque dictée de mots
      const infos = await Promise.all(
        Array.from({ length: NOMBRE_DICTEES_MOTS }, (_, i) => getDicteeMotsPartageInfo(i + 1))
      );
      const partage: Record<number, boolean> = {};
      infos.forEach((info, i) => {
        partage[i + 1] = info.partageTous;
      });
      setPartageInfo(partage);
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

  const handleChange = (eleveId: string, index: number, value: string) => {
    const n = clampInput(value);
    const key = `mot_${index}` as `mot_${number}`;
    setScores((prev) => {
      const cur = prev[eleveId];
      const base = cur ?? ({ eleve_id: eleveId, ...emptyRow() } as DicteeMotsScores);
      const next: DicteeMotsScores = { ...base };
      (next as Record<string, number | null>)[key] = n;
      return { ...prev, [eleveId]: next };
    });
  };

  const handleBlur = async (eleveId: string) => {
    const row = scores[eleveId];
    if (!row) return;
    setSaving(eleveId);
    try {
      const payload: Partial<Record<`mot_${number}`, number | null>> = {};
      for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
        const key = `mot_${i}` as `mot_${number}`;
        (payload as Record<string, number | null>)[key] =
          (row as Record<string, number | null>)[key] ?? null;
      }
      await setDicteeMotsScores(eleveId, payload);
    } finally {
      setSaving(null);
    }
  };

  const refreshPartage = useCallback(async (dicteeNum: number) => {
    const info = await getDicteeMotsPartageInfo(dicteeNum);
    setPartageInfo((prev) => ({ ...prev, [dicteeNum]: info.partageTous }));
  }, []);

  const handlePartagerTous = async (dicteeNum: number) => {
    setPartageLoading(dicteeNum);
    const { ok, error } = await setDicteeMotsPartageePourTous(dicteeNum, true);
    setPartageLoading(null);
    if (ok) await refreshPartage(dicteeNum);
    else if (error) alert(error);
  };

  const handleNePlusPartager = async (dicteeNum: number) => {
    setPartageLoading(dicteeNum);
    const { ok, error } = await setDicteeMotsPartageePourTous(dicteeNum, false);
    setPartageLoading(null);
    if (ok) await refreshPartage(dicteeNum);
    else if (error) alert(error);
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
            Dictées de mots
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">Dictées de mots</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          16 dictées de mots. Chaque dictée contient 5 mots ou petites phrases. Dictez-les aux
          élèves sur feuille, corrigez et attribuez un score sur 5, comme pour les dictées de
          syllabes.
        </p>

        <div className="mt-8 space-y-5">
          {DICTEE_MOTS.map((liste, index) => {
            const num = index + 1;
            const partageTous = partageInfo[num] ?? false;
            const loadingPartage = partageLoading === num;
            return (
            <section
              key={NOM_DICTEE_MOTS[index] ?? index}
              className="rounded-2xl bg-white/95 p-5 shadow-md"
            >
              <h2 className="font-display text-lg text-[#2d4a3e]">
                {NOM_DICTEE_MOTS[index] ?? `Dictée de mots ${index + 1}`}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#2d4a3e]/60">
                <p>5 mots / phrases à dicter — score conseillé : /5.</p>
                <Link
                  href={`/enseignant/sons/dictees-mots/test/${num}`}
                  className="inline-flex items-center rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-xs font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
                >
                  Tester la dictée
                </Link>
                <span className="text-[#2d4a3e]/50">|</span>
                {!partageTous ? (
                  <button
                    type="button"
                    onClick={() => handlePartagerTous(num)}
                    disabled={!!partageLoading}
                    className="inline-flex items-center rounded-lg bg-[#4a7c5a] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
                  >
                    {loadingPartage ? "…" : "Partager avec tous les enfants"}
                  </button>
                ) : (
                  <>
                    <span className="text-xs font-medium text-[#2d4a3e]">
                      Partagée avec tous les enfants
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNePlusPartager(num)}
                      disabled={!!partageLoading}
                      className="inline-flex items-center rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-xs font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20 disabled:opacity-50"
                    >
                      {loadingPartage ? "…" : "Ne plus partager"}
                    </button>
                  </>
                )}
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#2d4a3e]/90">
                {liste.map((mot, i) => (
                  <li key={i}>{mot}</li>
                ))}
              </ul>
            </section>
          );})}
        </div>

        <div className="mt-10 rounded-2xl border-2 border-[#2d4a3e]/15 bg-white/95 p-4 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">
            Points par élève (Dictées de mots 1 à {NOMBRE_DICTEES_MOTS})
          </h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/70">
            Note chaque dictée sur 5 pour chaque élève. Les valeurs sont enregistrées
            automatiquement.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-[#2d4a3e]/70">Chargement…</p>
          ) : eleves.length === 0 ? (
            <p className="mt-4 text-sm text-[#2d4a3e]/70">
              Aucun élève. Ajoute des élèves depuis l&apos;onglet Élèves.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#2d4a3e]/20 bg-[#a8d5ba]/30">
                    <th className="sticky left-0 z-10 min-w-[140px] bg-[#a8d5ba]/30 p-3 font-display text-[#2d4a3e]">
                      Élève
                    </th>
                    {Array.from({ length: NOMBRE_DICTEES_MOTS }, (_, i) => i + 1).map((num) => (
                      <th key={num} className="p-2 text-center text-xs text-[#2d4a3e]/80">
                        {NOM_DICTEE_MOTS[num - 1] ?? `Dictée de mots ${num}`}
                        <span className="block text-[11px] text-[#2d4a3e]/70">/5</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eleves.map((e) => {
                    const idStr = String(e.id);
                    const row = scores[idStr];
                    const savingRow = saving === idStr;
                    const values = row ?? ({ eleve_id: idStr, ...emptyRow() } as DicteeMotsScores);
                    return (
                      <tr
                        key={e.id}
                        className="border-b border-[#2d4a3e]/10 hover:bg-[#a8d5ba]/10"
                      >
                        <td className="sticky left-0 z-10 min-w-[140px] bg-white/95 p-3 font-medium text-[#2d4a3e]">
                          {e.prenom} {e.nom}
                          {savingRow && (
                            <span className="ml-2 text-xs text-[#2d4a3e]/60">Enregistrement…</span>
                          )}
                        </td>
                        {Array.from({ length: NOMBRE_DICTEES_MOTS }, (_, i) => i + 1).map((num) => {
                          const key = `mot_${num}` as `mot_${number}`;
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
                                aria-label={`Dictée de mots ${num} sur 5`}
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
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/enseignant/sons/evaluation-5"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            ← Retour aux dictées de syllabes
          </Link>
          <Link
            href="/enseignant/sons/evaluations"
            className="inline-block rounded-xl bg-[#a8d5ba]/80 px-6 py-3 font-semibold text-[#2d4a3e] transition hover:bg-[#a8d5ba]"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </div>
    </main>
  );
}

