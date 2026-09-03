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
  let { error } = await supabase.from("exercice_resultats").insert(payload);
  // Si la colonne detail_exercices n'existe pas encore, réessaie sans
  if (
    error &&
    payload.detail_exercices != null &&
    /detail_exercices|column|schema/i.test(error.message)
  ) {
    delete payload.detail_exercices;
    const retry = await supabase.from("exercice_resultats").insert(payload);
    error = retry.error;
  }
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[resultats-storage] Erreur sauvegarde:",
        error.message,
        "→ Vérifiez que la table exercice_resultats existe et que RLS autorise l'insert."
      );
    }
    throw new Error(error.message || "Impossible d'enregistrer le résultat.");
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

/** Résultats maths historiques encore stockés dans des tables dédiées (ex. centimetre_metre). */
async function getLegacyMathsResultats(eleveId?: string | number): Promise<ResultatRow[]> {
  const extras: ResultatRow[] = [];
  try {
    let q = supabase
      .from("centimetre_metre")
      .select("eleve_id, points_obtenus, score_sur_10, updated_at");
    if (eleveId != null) q = q.eq("eleve_id", String(eleveId));
    const { data, error } = await q;
    if (!error && data) {
      for (const row of data as {
        eleve_id: string;
        points_obtenus: number;
        updated_at?: string;
      }[]) {
        const points = Number(row.points_obtenus ?? 0);
        const pointsMax = 20;
        extras.push({
          eleve_id: String(row.eleve_id),
          son_id: "maths-centimetre-metre",
          niveau_id: "maths-centimetre-metre",
          points,
          points_max: pointsMax,
          reussi: points >= Math.ceil(pointsMax * 0.6),
          detail_exercices: [
            {
              type: "centimetre-metre",
              titre: "Centimètre ou mètre",
              points,
              pointsMax,
            },
          ],
          created_at: row.updated_at,
        });
      }
    }
  } catch {
    /* table absente : ignorer */
  }
  return extras;
}

function mergeWithLegacy(main: ResultatRow[], legacy: ResultatRow[]): ResultatRow[] {
  const has = (eleveId: string, sonId: string) =>
    main.some((r) => String(r.eleve_id) === eleveId && r.son_id === sonId);
  const extras = legacy.filter((r) => !has(String(r.eleve_id), r.son_id));
  return [...extras, ...main].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
}

export async function getResultatsByEleve(eleveId: string | number): Promise<ResultatRow[]> {
  try {
    const { data, error } = await supabase
      .from("exercice_resultats")
      .select("id, eleve_id, son_id, niveau_id, points, points_max, reussi, created_at, detail_exercices")
      .eq("eleve_id", String(eleveId))
      .order("created_at", { ascending: false });
    if (error) throw error;
    const main = ((data ?? []) as Record<string, unknown>[]).map(normalizeResultatRow);
    const legacy = await getLegacyMathsResultats(eleveId);
    return mergeWithLegacy(main, legacy);
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
  const main = ((data ?? []) as Record<string, unknown>[]).map(normalizeResultatRow);
  const legacy = await getLegacyMathsResultats();
  return mergeWithLegacy(main, legacy);
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
