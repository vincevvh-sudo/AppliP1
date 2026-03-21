/**
 * Stockage des résultats d'exercices (Supabase)
 * Table requise : exercice_resultats (eleve_id, son_id, niveau_id, points, points_max, reussi, created_at, detail_exercices)
 * detail_exercices (jsonb, optionnel) : pour les évaluations, tableau [{ type, titre, points, pointsMax }]
 * Si la colonne detail_exercices n'existe pas : exécuter supabase-exercice-resultats-detail-exercices.sql dans le SQL Editor Supabase.
 */

import { supabase } from "../../utils/supabase";

export type DetailExerciceEval = { type: string; titre: string; points: number; pointsMax: number; duree_secondes?: number };

export type ResultatRow = {
  id?: string;
  eleve_id: string | number;
  son_id: string;
  niveau_id: string;
  points: number;
  points_max: number;
  reussi: boolean;
  /** Pour les évaluations : détail par exercice (1, 2, 3, 4…) */
  detail_exercices?: DetailExerciceEval[] | null;
  created_at?: string;
};

export async function saveResultat(row: Omit<ResultatRow, "id" | "created_at">): Promise<void> {
  const payload: Record<string, unknown> = {
    eleve_id: String(row.eleve_id),
    son_id: row.son_id,
    niveau_id: row.niveau_id,
    points: row.points,
    points_max: row.points_max,
    reussi: row.reussi,
  };
  if (row.detail_exercices != null && Array.isArray(row.detail_exercices)) {
    payload.detail_exercices = row.detail_exercices;
  }
  const { error } = await supabase.from("exercice_resultats").insert(payload);
  if (error && process.env.NODE_ENV === "development") {
    console.warn("[resultats-storage] Erreur sauvegarde:", error.message, "→ Vérifiez que la table exercice_resultats existe avec une colonne detail_exercices (jsonb) et que RLS autorise l'insert.");
  }
}

function normalizeResultatRow(raw: Record<string, unknown>): ResultatRow {
  const detail = raw.detail_exercices ?? (raw as Record<string, unknown>).detailExercices;
  const detailArray: DetailExerciceEval[] | undefined = Array.isArray(detail)
    ? detail
        .filter((ex) => ex != null && typeof ex === "object" && "titre" in ex && "points" in ex)
        .map((ex) => {
          const o = ex as Record<string, unknown>;
          return {
            type: String(o.type ?? ""),
            titre: String(o.titre ?? ""),
            points: Number(o.points ?? 0),
            pointsMax: Number(o.pointsMax ?? o.points_max ?? 0),
            duree_secondes: typeof o.duree_secondes === "number" ? o.duree_secondes : undefined,
          };
        })
    : undefined;
  return {
    id: raw.id as string | undefined,
    eleve_id: String(raw.eleve_id),
    son_id: String(raw.son_id ?? ""),
    niveau_id: String(raw.niveau_id ?? ""),
    points: Number(raw.points),
    points_max: Number(raw.points_max),
    reussi: Boolean(raw.reussi),
    detail_exercices: detailArray?.length ? detailArray : undefined,
    created_at: raw.created_at as string | undefined,
  };
}

export async function getResultatsByEleve(eleveId: string | number): Promise<ResultatRow[]> {
  try {
    const { data, error } = await supabase
      .from("exercice_resultats")
      .select("id, eleve_id, son_id, niveau_id, points, points_max, reussi, created_at, detail_exercices")
      .eq("eleve_id", String(eleveId))
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeResultatRow);
  } catch {
    return [];
  }
}

export async function getResultatsAll(): Promise<ResultatRow[]> {
  const { data, error } = await supabase
    .from("exercice_resultats")
    .select("id, eleve_id, son_id, niveau_id, points, points_max, reussi, created_at, detail_exercices")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeResultatRow);
}

/** Supprime un résultat (pour permettre à l'élève de refaire l'évaluation). */
export async function deleteResultat(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("exercice_resultats").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

/** Supprime tous les résultats d'un élève pour un son donné (ex. avant ré-enregistrement). */
export async function deleteResultatsByEleveAndSon(eleveId: string | number, sonId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("exercice_resultats")
      .delete()
      .eq("eleve_id", String(eleveId))
      .eq("son_id", sonId);
    if (error && process.env.NODE_ENV === "development") {
      console.warn("[resultats-storage] deleteResultatsByEleveAndSon:", error.message);
    }
  } catch {
    /* ignore */
  }
}
