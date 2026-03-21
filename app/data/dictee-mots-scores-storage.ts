/**
 * Scores des dictées de mots : 16 dictées sur 5 points chacune.
 * Table Supabase : dictee_mots_scores (eleve_id, mot_1 … mot_16).
 * Voir supabase-dictee-mots-scores.sql.
 */

import { supabase } from "../../utils/supabase";

export const NOMBRE_DICTEES_MOTS = 16;

export type DicteeMotsScores = {
  eleve_id: string | number;
} & Record<`mot_${number}`, number | null>;

const clamp = (v: number) => Math.min(5, Math.max(0, Math.round(v)));

function emptyRow(eleveId: string | number): DicteeMotsScores {
  const row: DicteeMotsScores = { eleve_id: eleveId };
  for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
    (row as Record<string, number | null>)[`mot_${i}`] = null;
  }
  return row;
}

export async function getDicteeMotsScoresByEleves(): Promise<Record<string, DicteeMotsScores>> {
  const cols =
    "eleve_id," +
    Array.from({ length: NOMBRE_DICTEES_MOTS }, (_, i) => `mot_${i + 1}`).join(",");
  const { data, error } = await supabase.from("dictee_mots_scores").select(cols);
  if (error) return {};
  const out: Record<string, DicteeMotsScores> = {};
  for (const row of (data ?? []) as any[]) {
    const rec = emptyRow(row.eleve_id);
    for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
      const key = `mot_${i}`;
      (rec as Record<string, number | null>)[key] =
        (row as Record<string, number | null>)[key] ?? null;
    }
    out[String(row.eleve_id)] = rec;
  }
  return out;
}

export type DicteeMotsScoresInput = Partial<Record<`mot_${number}`, number | null>>;

export async function setDicteeMotsScores(
  eleveId: string | number,
  scores: DicteeMotsScoresInput
): Promise<void> {
  const payload: Record<string, unknown> = { eleve_id: eleveId };
  for (let i = 1; i <= NOMBRE_DICTEES_MOTS; i++) {
    const key = `mot_${i}`;
    const v = (scores as Record<string, number | null | undefined>)[key];
    payload[key] = v != null ? clamp(v) : null;
  }
  await supabase.from("dictee_mots_scores").upsert(payload, { onConflict: "eleve_id" });
}

