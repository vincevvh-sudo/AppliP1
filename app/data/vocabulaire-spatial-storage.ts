/**
 * Stockage des scores Vocabulaire spatial.
 * - Enseignant : localStorage par élève bulletin (id local).
 * - Enfant : Supabase par eleve_id pour afficher le score reçu.
 */

import { supabase } from "../../utils/supabase";
import { NOMBRE_PHRASES, scoreSur10 } from "./vocabulaire-spatial-data";

const LOCAL_KEY = "vocabulaire-spatial-scores";

/** Pour l'enseignant : scores par élève bulletin (14 valeurs 0 ou 1). */
export type ScoresVocabulaireSpatial = number[];

function loadLocal(): Record<string, ScoresVocabulaireSpatial> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, arr]) => Array.isArray(arr) && arr.length === NOMBRE_PHRASES)
    );
  } catch {
    return {};
  }
}

function saveLocal(data: Record<string, ScoresVocabulaireSpatial>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

/** Scores pour un élève bulletin (14 entiers 0 ou 1). */
export function getScoresVocabulaireSpatial(bulletinEleveId: string): ScoresVocabulaireSpatial | null {
  const data = loadLocal();
  const arr = data[bulletinEleveId];
  if (!arr || arr.length !== NOMBRE_PHRASES) return null;
  return arr;
}

/** Enregistrer les scores pour un élève bulletin ; si supabaseEleveId est fourni, sync Supabase pour l'enfant. */
export function setScoresVocabulaireSpatial(
  bulletinEleveId: string,
  scores: ScoresVocabulaireSpatial,
  supabaseEleveId?: string | number | null
): void {
  const normalized = scores.slice(0, NOMBRE_PHRASES).map((v) => (v === 1 ? 1 : 0));
  while (normalized.length < NOMBRE_PHRASES) normalized.push(0);
  const data = loadLocal();
  data[bulletinEleveId] = normalized;
  saveLocal(data);
  if (supabaseEleveId != null && `${supabaseEleveId}`.trim() !== "") {
    const points = normalized.reduce<number>((a, b) => a + b, 0);
    const sur10 = scoreSur10(points);
    saveVocabulaireSpatialSupabase(supabaseEleveId, points, sur10, normalized).catch(() => {});
  }
}

/** Résultat pour l'enfant (Supabase). */
export type VocabulaireSpatialResult = {
  points_obtenus: number;
  score_sur_10: number;
  phrase_scores: number[];
};

async function saveVocabulaireSpatialSupabase(
  eleveId: string | number,
  pointsObtenus: number,
  scoreSur10Val: number,
  phraseScores: number[]
): Promise<void> {
  const { error } = await supabase.from("vocabulaire_spatial").upsert(
    {
      eleve_id: eleveId,
      points_obtenus: pointsObtenus,
      score_sur_10: scoreSur10Val,
      phrase_scores: phraseScores,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "eleve_id" }
  );
  if (error) throw error;
}

/** Pour l'enfant : récupérer son résultat Vocabulaire spatial (Supabase). */
export async function getVocabulaireSpatialByEleve(eleveId: string | number): Promise<VocabulaireSpatialResult | null> {
  const { data, error } = await supabase
    .from("vocabulaire_spatial")
    .select("points_obtenus, score_sur_10, phrase_scores")
    .eq("eleve_id", eleveId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { points_obtenus: number; score_sur_10: number; phrase_scores: number[] };
  return {
    points_obtenus: row.points_obtenus ?? 0,
    score_sur_10: row.score_sur_10 ?? 0,
    phrase_scores: Array.isArray(row.phrase_scores) ? row.phrase_scores : [],
  };
}
