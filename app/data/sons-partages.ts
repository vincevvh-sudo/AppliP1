/**
 * Partage des sons aux élèves via Supabase (Forêt des sons / « rivière de sons »).
 * - sons_partages : partage des EXERCICES (Phono 1, 2, Phono Image 1, 2)
 * - sons_partages_evaluations : partage des ÉVALUATIONS (Éval 1, 2, 3, 4) — séparé
 * - sons_partages_eval_niveaux : partage par évaluation (Éval 1–4, lecture, fluence…)
 * eleve_id = "0" => partagé à tous les élèves (UUID élèves supportés en TEXT)
 */

import { supabase } from "../../utils/supabase";

/** Marqueur « toute la classe » (compatible INT historique et TEXT). */
export const PARTAGE_TOUS_ELEVES = "0";

function isTousMarker(id: unknown): boolean {
  return id === 0 || id === "0" || String(id) === "0";
}

function normalizeEleveId(id: string | number): string {
  return String(id);
}

export type PartageRow = {
  son_id: string;
  eleve_id: string | number;
};

// ——— Exercices (sons_partages) ———

export async function isSonSharedToAll(sonId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("eleve_id", PARTAGE_TOUS_ELEVES)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getElevesForSon(sonId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .neq("eleve_id", PARTAGE_TOUS_ELEVES);
    return (data ?? [])
      .map((r: { eleve_id: string | number }) => String(r.eleve_id))
      .filter((id) => !isTousMarker(id));
  } catch {
    return [];
  }
}

export async function shareToAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").upsert(
    [{ son_id: sonId, eleve_id: PARTAGE_TOUS_ELEVES }],
    { onConflict: "son_id,eleve_id" }
  );
}

export async function shareToEleves(sonId: string, eleveIds: Array<string | number>): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).neq("eleve_id", PARTAGE_TOUS_ELEVES);
  const unique = [...new Set(eleveIds.map(normalizeEleveId).filter((id) => id && !isTousMarker(id)))];
  if (unique.length > 0) {
    await supabase.from("sons_partages").insert(unique.map((eleve_id) => ({ son_id: sonId, eleve_id })));
  }
}

export async function unshareFromAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).eq("eleve_id", PARTAGE_TOUS_ELEVES);
}

export async function getSharedSonsForEleve(eleveId: number | string): Promise<string[]> {
  try {
    const id = normalizeEleveId(eleveId);
    const { data: all } = await supabase
      .from("sons_partages")
      .select("son_id")
      .eq("eleve_id", PARTAGE_TOUS_ELEVES);
    const { data: indiv } = await supabase.from("sons_partages").select("son_id").eq("eleve_id", id);
    const ids = new Set<string>();
    (all ?? []).forEach((r: { son_id: string }) => ids.add(String(r.son_id)));
    (indiv ?? []).forEach((r: { son_id: string }) => ids.add(String(r.son_id)));
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
      .eq("eleve_id", PARTAGE_TOUS_ELEVES)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function getElevesEvaluationsForSon(sonId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("sons_partages_evaluations")
      .select("eleve_id")
      .eq("son_id", sonId)
      .neq("eleve_id", PARTAGE_TOUS_ELEVES);
    return (data ?? [])
      .map((r: { eleve_id: string | number }) => String(r.eleve_id))
      .filter((id) => !isTousMarker(id));
  } catch {
    return [];
  }
}

export async function setPartageEvaluationsToAll(
  sonId: string,
  partager: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (partager) {
    const { error } = await supabase.from("sons_partages_evaluations").upsert(
      [{ son_id: sonId, eleve_id: PARTAGE_TOUS_ELEVES }],
      { onConflict: "son_id,eleve_id" }
    );
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("sons_partages_evaluations")
      .delete()
      .eq("son_id", sonId)
      .eq("eleve_id", PARTAGE_TOUS_ELEVES);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setPartageEvaluationsToEleves(
  sonId: string,
  eleveIds: Array<string | number>
): Promise<void> {
  await supabase
    .from("sons_partages_evaluations")
    .delete()
    .eq("son_id", sonId)
    .neq("eleve_id", PARTAGE_TOUS_ELEVES);
  const unique = [...new Set(eleveIds.map(normalizeEleveId).filter((id) => id && !isTousMarker(id)))];
  if (unique.length > 0) {
    await supabase
      .from("sons_partages_evaluations")
      .insert(unique.map((eleve_id) => ({ son_id: sonId, eleve_id })));
  }
}

export async function isEvaluationsSharedForEleve(
  sonId: string,
  eleveId: number | string
): Promise<boolean> {
  try {
    const id = normalizeEleveId(eleveId);
    const { data: all } = await supabase
      .from("sons_partages_evaluations")
      .select("son_id")
      .eq("son_id", sonId)
      .eq("eleve_id", PARTAGE_TOUS_ELEVES)
      .maybeSingle();
    if (all) return true;
    const { data: indiv } = await supabase
      .from("sons_partages_evaluations")
      .select("son_id")
      .eq("son_id", sonId)
      .eq("eleve_id", id)
      .maybeSingle();
    return !!indiv;
  } catch {
    return false;
  }
}

// ——— Partage par évaluation (Éval 1–4, lecture, fluence…) ———

export type PartageEvalNiveauRow = {
  son_id: string;
  niveau_id: string;
  eleve_id: string | number;
};

export async function setPartageEvalNiveau(
  sonId: string,
  niveauId: string,
  toAll: boolean,
  eleveIds: Array<string | number> = []
): Promise<{ ok: boolean; error?: string }> {
  try {
    const table = "sons_partages_eval_niveaux";
    const { error: delError } = await supabase
      .from(table)
      .delete()
      .eq("son_id", sonId)
      .eq("niveau_id", niveauId);
    if (delError) return { ok: false, error: delError.message };

    if (toAll) {
      const { error } = await supabase.from(table).upsert(
        [{ son_id: sonId, niveau_id: niveauId, eleve_id: PARTAGE_TOUS_ELEVES }],
        { onConflict: "son_id,niveau_id,eleve_id" }
      );
      if (error) return { ok: false, error: error.message };
    } else if (eleveIds.length > 0) {
      const unique = [
        ...new Set(eleveIds.map(normalizeEleveId).filter((id) => id && !isTousMarker(id))),
      ];
      if (unique.length === 0) return { ok: true };
      const rows = unique.map((eleve_id) => ({ son_id: sonId, niveau_id: niveauId, eleve_id }));
      const { error } = await supabase.from(table).upsert(rows, { onConflict: "son_id,niveau_id,eleve_id" });
      if (error) {
        if (/invalid input syntax|integer|uuid/i.test(error.message)) {
          return {
            ok: false,
            error:
              "La base n'accepte pas encore les identifiants élèves (UUID). Exécute supabase-sons-partages-eleve-id-text.sql dans Supabase → SQL Editor, puis réessaie.",
          };
        }
        return { ok: false, error: error.message };
      }
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getPartageEvalNiveauState(
  sonId: string,
  niveauId: string
): Promise<{ toAll: boolean; eleveIds: string[] }> {
  try {
    const { data } = await supabase
      .from("sons_partages_eval_niveaux")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("niveau_id", niveauId);
    const rows = data ?? [];
    if (rows.some((r: { eleve_id: string | number }) => isTousMarker(r.eleve_id))) {
      return { toAll: true, eleveIds: [] };
    }
    return {
      toAll: false,
      eleveIds: rows
        .map((r: { eleve_id: string | number }) => String(r.eleve_id))
        .filter((id) => !isTousMarker(id)),
    };
  } catch {
    return { toAll: false, eleveIds: [] };
  }
}

export async function getNiveauxEvalPartagesPourEleve(
  eleveId: number | string
): Promise<{ son_id: string; niveau_id: string }[]> {
  const result: { son_id: string; niveau_id: string }[] = [];
  try {
    const table = "sons_partages_eval_niveaux";
    const id = normalizeEleveId(eleveId);
    const { data: all } = await supabase
      .from(table)
      .select("son_id, niveau_id")
      .eq("eleve_id", PARTAGE_TOUS_ELEVES);
    const { data: indiv } = await supabase.from(table).select("son_id, niveau_id").eq("eleve_id", id);
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
  } catch {
    // table may not exist yet
  }
  return result;
}
