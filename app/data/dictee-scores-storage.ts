/**
 * Scores des dictées (Évaluation 5) : Dictées de syllabes — 10 emplacements (dictées 1 à 10), sur 5 points chacune.
 * Table Supabase : dictee_scores (eleve_id, dictee_1 … dictee_10, et jusqu'à dictee_20 selon schéma).
 * Voir supabase-dictee-scores.sql / supabase-dictee-scores-20-colonnes.sql.
 */

import { supabase } from "../../utils/supabase";

/** Nombre d'emplacements de dictées (1 à 10 utilisés ; 6-10 prévus pour plus tard). */
export const NOMBRE_DICTEES = 10;

export type DicteeScores = {
  eleve_id: string | number;
} & Record<`dictee_${number}`, number | null>;

const clamp = (v: number) => Math.min(5, Math.max(0, Math.round(v)));

function emptyRow(eleveId: string | number): DicteeScores {
  const row: DicteeScores = { eleve_id: eleveId };
  for (let i = 1; i <= NOMBRE_DICTEES; i++) {
    (row as Record<string, number | null>)[`dictee_${i}`] = null;
  }
  return row;
}

export async function getDicteeScoresByEleves(): Promise<Record<string, DicteeScores>> {
  const cols = "eleve_id," + Array.from({ length: NOMBRE_DICTEES }, (_, i) => `dictee_${i + 1}`).join(",");
  const { data, error } = await supabase.from("dictee_scores").select(cols);
  if (error) return {};
  const out: Record<string, DicteeScores> = {};
  const rows = (data ?? []) as any[];
  for (const row of rows) {
    const rawId = row?.eleve_id;
    if (rawId === null || rawId === undefined) continue;
    const key = String(rawId);
    const rec = emptyRow(key);
    for (let i = 1; i <= NOMBRE_DICTEES; i++) {
      const k = `dictee_${i}`;
      (rec as Record<string, number | null>)[k] = (row as Record<string, number | null>)[k] ?? null;
    }
    out[key] = rec;
  }
  return out;
}

export type DicteeScoresInput = Partial<Record<`dictee_${number}`, number | null>>;

export async function setDicteeScores(eleveId: string | number, scores: DicteeScoresInput): Promise<void> {
  const payload: Record<string, unknown> = { eleve_id: eleveId };
  for (let i = 1; i <= NOMBRE_DICTEES; i++) {
    const key = `dictee_${i}`;
    const v = (scores as Record<string, number | null | undefined>)[key];
    payload[key] = v != null ? clamp(v) : null;
  }
  await supabase.from("dictee_scores").upsert(payload, { onConflict: "eleve_id" });
}
