/**
 * Partage des sons aux élèves via Supabase (Forêt des sons / « rivière de sons »).
 * - sons_partages : partage des EXERCICES (Phono 1, 2, Phono Image 1, 2)
 * - sons_partages_evaluations : partage des ÉVALUATIONS (Éval 1, 2, 3, 4) — séparé, à activer par l'enseignant
 * eleve_id = 0 => partagé à tous les élèves
 *
 * Nouvelle évaluation côté français : voir docs/PARTAGE-EVALUATIONS.md (section Forêt des sons).
 */

import { supabase } from "../../utils/supabase";

export type PartageRow = {
  son_id: string;
  eleve_id: number;
};

// ——— Exercices (sons_partages) ———

export async function isSonSharedToAll(sonId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("eleve_id", 0)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getElevesForSon(sonId: string): Promise<number[]> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .neq("eleve_id", 0);
    return (data ?? []).map((r) => r.eleve_id);
  } catch {
    return [];
  }
}

export async function shareToAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").upsert(
    [{ son_id: sonId, eleve_id: 0 }],
    { onConflict: "son_id,eleve_id" }
  );
}

export async function shareToEleves(sonId: string, eleveIds: number[]): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).neq("eleve_id", 0);
  if (eleveIds.length > 0) {
    await supabase
      .from("sons_partages")
      .insert(eleveIds.map((id) => ({ son_id: sonId, eleve_id: id })));
  }
}

export async function unshareFromAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).eq("eleve_id", 0);
}

export async function getSharedSonsForEleve(eleveId: number | string): Promise<string[]> {
  try {
    const eleveIdNumber = typeof eleveId === "number" ? eleveId : Number(eleveId);
    const { data: all } = await supabase
      .from("sons_partages")
      .select("son_id")
      .eq("eleve_id", 0);
    const { data: indiv } = Number.isFinite(eleveIdNumber)
      ? await supabase.from("sons_partages").select("son_id").eq("eleve_id", eleveIdNumber)
      : { data: null as any };
    const ids = new Set<string>();
    (all ?? []).forEach((r: any) => ids.add(String(r.son_id)));
    (indiv ?? []).forEach((r: any) => ids.add(String(r.son_id)));
    return Array.from(ids);
  } catch {
    return [];
  }
}

// ——— Évaluations (sons_partages_evaluations) ———

export async function isEvaluationsSharedToAll(sonId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("sons_partages_evaluations")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("eleve_id", 0)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function getElevesEvaluationsForSon(sonId: string): Promise<number[]> {
  try {
    const { data } = await supabase
      .from("sons_partages_evaluations")
      .select("eleve_id")
      .eq("son_id", sonId)
      .neq("eleve_id", 0);
    return (data ?? []).map((r) => r.eleve_id);
  } catch {
    return [];
  }
}

export async function setPartageEvaluationsToAll(sonId: string, partager: boolean): Promise<{ ok: boolean; error?: string }> {
  if (partager) {
    const { error } = await supabase.from("sons_partages_evaluations").upsert(
      [{ son_id: sonId, eleve_id: 0 }],
      { onConflict: "son_id,eleve_id" }
    );
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("sons_partages_evaluations")
      .delete()
      .eq("son_id", sonId)
      .eq("eleve_id", 0);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setPartageEvaluationsToEleves(sonId: string, eleveIds: number[]): Promise<void> {
  await supabase.from("sons_partages_evaluations").delete().eq("son_id", sonId).neq("eleve_id", 0);
  if (eleveIds.length > 0) {
    await supabase
      .from("sons_partages_evaluations")
      .insert(eleveIds.map((id) => ({ son_id: sonId, eleve_id: id })));
  }
}

/** Pour un élève, renvoie les son_id pour lesquels les évaluations sont partagées (ancienne table = toutes les évals 1-4 pour ce son). */
export async function getSonsAvecEvaluationsPartagees(eleveId: number): Promise<string[]> {
  try {
    const { data: all } = await supabase
      .from("sons_partages_evaluations")
      .select("son_id")
      .eq("eleve_id", 0);
    const { data: indiv } = await supabase
      .from("sons_partages_evaluations")
      .select("son_id")
      .eq("eleve_id", eleveId);
    const ids = new Set<string>();
    (all ?? []).forEach((r) => ids.add(r.son_id));
    (indiv ?? []).forEach((r) => ids.add(r.son_id));
    return Array.from(ids);
  } catch {
    return [];
  }
}

// ——— Partage par évaluation (1 à la fois : Éval 1, 2, 3 ou 4) ———
// Table : sons_partages_eval_niveaux (son_id, niveau_id, eleve_id). eleve_id = 0 => tous les élèves.

export type PartageEvalNiveauRow = {
  son_id: string;
  niveau_id: string;
  eleve_id: number;
};

/** Partage une évaluation (ex: Éval 1) pour un son : à tous les élèves (eleve_id=0) ou à des élèves précis. */
export async function setPartageEvalNiveau(
  sonId: string,
  niveauId: string,
  toAll: boolean,
  eleveIds: number[] = []
): Promise<{ ok: boolean; error?: string }> {
  try {
    const table = "sons_partages_eval_niveaux";
    if (toAll) {
      await supabase.from(table).delete().eq("son_id", sonId).eq("niveau_id", niveauId);
      const { error } = await supabase.from(table).upsert(
        [{ son_id: sonId, niveau_id: niveauId, eleve_id: 0 }],
        { onConflict: "son_id,niveau_id,eleve_id" }
      );
      if (error) return { ok: false, error: error.message };
    } else {
      await supabase.from(table).delete().eq("son_id", sonId).eq("niveau_id", niveauId).eq("eleve_id", 0);
      if (eleveIds.length > 0) {
        const rows = eleveIds.map((id) => ({ son_id: sonId, niveau_id: niveauId, eleve_id: id }));
        const { error } = await supabase.from(table).upsert(rows, { onConflict: "son_id,niveau_id,eleve_id" });
        if (error) return { ok: false, error: error.message };
      } else {
        await supabase.from(table).delete().eq("son_id", sonId).eq("niveau_id", niveauId).neq("eleve_id", 0);
      }
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** État actuel du partage pour un (son_id, niveau_id) : tous les élèves, ou liste d’élèves précis. */
export async function getPartageEvalNiveauState(
  sonId: string,
  niveauId: string
): Promise<{ toAll: boolean; eleveIds: number[] }> {
  try {
    const { data } = await supabase
      .from("sons_partages_eval_niveaux")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("niveau_id", niveauId);
    const rows = data ?? [];
    if (rows.some((r: { eleve_id: number }) => r.eleve_id === 0)) {
      return { toAll: true, eleveIds: [] };
    }
    return {
      toAll: false,
      eleveIds: rows.map((r: { eleve_id: number }) => r.eleve_id).filter((id: number) => id !== 0),
    };
  } catch {
    return { toAll: false, eleveIds: [] };
  }
}

/** Pour un élève : (son_id, niveau_id) des évaluations partagées (table par niveau). Inclut aussi les sons de l’ancienne table = tous les niveaux eval pour ce son. */
export async function getNiveauxEvalPartagesPourEleve(eleveId: number | string): Promise<{ son_id: string; niveau_id: string }[]> {
  const result: { son_id: string; niveau_id: string }[] = [];
  try {
    const table = "sons_partages_eval_niveaux";
    const eleveIdNumber = typeof eleveId === "number" ? eleveId : Number(eleveId);
    const { data: all } = await supabase.from(table).select("son_id, niveau_id").eq("eleve_id", 0);
    const { data: indiv } = Number.isFinite(eleveIdNumber)
      ? await supabase.from(table).select("son_id, niveau_id").eq("eleve_id", eleveIdNumber)
      : { data: null as any };
    const seen = new Set<string>();
    for (const r of all ?? []) {
      const key = `${r.son_id}:${r.niveau_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ son_id: r.son_id, niveau_id: r.niveau_id });
      }
    }
    for (const r of indiv ?? []) {
      const key = `${r.son_id}:${r.niveau_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ son_id: r.son_id, niveau_id: r.niveau_id });
      }
    }
    const legacySons = await getSonsAvecEvaluationsPartagees(Number.isFinite(eleveIdNumber) ? eleveIdNumber : 0);
    for (const sonId of legacySons) {
      for (const num of [1, 2, 3, 4]) {
        const niveau_id = `${sonId}-eval-${num}`;
        const key = `${sonId}:${niveau_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ son_id: sonId, niveau_id });
        }
      }
    }
  } catch {
    // table may not exist yet
  }
  return result;
}
