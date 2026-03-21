/**
 * Stockage du résultat "Centimètre ou mètre".
 * Essaie Supabase ; si la table est absente ou erreur (schema cache), sauvegarde en localStorage pour que l'app fonctionne.
 */

import { supabase } from "../../utils/supabase";
import { scoreSur10CentimetreMetre } from "./centimetre-metre-data";

const LOCAL_KEY = "centimetre_metre_result";

export type CentimetreMetreResult = {
  points_obtenus: number;
  score_sur_10: number;
  updated_at?: string;
};

function saveLocal(eleveId: number | string, pointsObtenus: number): void {
  if (typeof window === "undefined") return;
  try {
    const scoreSur10 = scoreSur10CentimetreMetre(pointsObtenus);
    const data: Record<string, CentimetreMetreResult> = {};
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        Object.assign(data, JSON.parse(raw));
      } catch {}
    }
    data[String(eleveId)] = {
      points_obtenus: pointsObtenus,
      score_sur_10: scoreSur10,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

function loadLocal(eleveId: number | string): CentimetreMetreResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, CentimetreMetreResult>;
    return data[String(eleveId)] ?? null;
  } catch {
    return null;
  }
}

/** Enregistrer le résultat (Supabase si possible, sinon localStorage). */
export async function saveCentimetreMetreResult(
  eleveId: number | string,
  pointsObtenus: number
): Promise<void> {
  const scoreSur10 = scoreSur10CentimetreMetre(pointsObtenus);
  const { error } = await supabase.from("centimetre_metre").upsert(
    {
      eleve_id: eleveId,
      points_obtenus: pointsObtenus,
      score_sur_10: scoreSur10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "eleve_id" }
  );
  if (error) {
    saveLocal(eleveId, pointsObtenus);
    return;
  }
  saveLocal(eleveId, pointsObtenus);
}

/** Récupérer le dernier résultat (Supabase puis localStorage en secours). */
export async function getCentimetreMetreResultByEleve(
  eleveId: number | string
): Promise<CentimetreMetreResult | null> {
  const { data, error } = await supabase
    .from("centimetre_metre")
    .select("points_obtenus, score_sur_10, updated_at")
    .eq("eleve_id", eleveId)
    .maybeSingle();
  if (!error && data) {
    const row = data as { points_obtenus: number; score_sur_10: number; updated_at?: string };
    return {
      points_obtenus: row.points_obtenus ?? 0,
      score_sur_10: row.score_sur_10 ?? 0,
      updated_at: row.updated_at,
    };
  }
  return loadLocal(eleveId);
}
