/**
 * Partage des exercices maths (modules hors arithmétique) par élève — Supabase.
 * Table : maths_exercices_modules_partages (voir supabase-maths-exercices-modules-partages.sql)
 * Fallback : localStorage (maths-partages.exercicesModules) si la table est absente ou erreur réseau.
 */

import { supabase } from "../../utils/supabase";
import { MATHS_EXERCICES_MODULES, type MathsExerciceModuleId } from "./maths-exercices-modules";
import { getExercicesModulesPartages as getExercicesModulesPartagesLocal } from "./maths-partages";

const TABLE = "maths_exercices_modules_partages";

function isTableMissingError(err: { message?: string; code?: string } | null): boolean {
  if (!err?.message) return false;
  const m = err.message.toLowerCase();
  return m.includes("does not exist") || m.includes("42p01") || m.includes("schema cache");
}

export async function getEleveIdsPourModule(moduleId: string): Promise<string[]> {
  const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("module_id", moduleId);
  if (error) {
    if (isTableMissingError(error)) return [];
    if (process.env.NODE_ENV === "development") console.warn("[maths-modules-partages]", error.message);
    return [];
  }
  return [...new Set((data ?? []).map((r: { eleve_id: string }) => String(r.eleve_id)))];
}

/** Remplace tout le partage pour un module (liste d’ids élèves, peut être vide). */
export async function remplacerPartagesModule(
  moduleId: MathsExerciceModuleId,
  eleveIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const { error: delErr } = await supabase.from(TABLE).delete().eq("module_id", moduleId);
  if (delErr) {
    if (isTableMissingError(delErr)) {
      return { ok: false, error: "Table Supabase manquante. Exécute supabase-maths-exercices-modules-partages.sql dans le SQL Editor." };
    }
    return { ok: false, error: delErr.message };
  }
  if (eleveIds.length === 0) return { ok: true };
  const rows = eleveIds.map((eleve_id) => ({ module_id: moduleId, eleve_id }));
  const { error: insErr } = await supabase.from(TABLE).insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}

/** Même partage pour plusieurs modules (ex. les deux tests espace / géométrie). */
export async function remplacerPartagesModules(
  moduleIds: MathsExerciceModuleId[],
  eleveIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  if (moduleIds.length === 0) return { ok: true };
  const { error: delErr } = await supabase.from(TABLE).delete().in("module_id", moduleIds);
  if (delErr) {
    if (isTableMissingError(delErr)) {
      return { ok: false, error: "Table Supabase manquante. Exécute supabase-maths-exercices-modules-partages.sql dans le SQL Editor." };
    }
    return { ok: false, error: delErr.message };
  }
  if (eleveIds.length === 0) return { ok: true };
  const rows: { module_id: string; eleve_id: string }[] = [];
  for (const moduleId of moduleIds) {
    for (const eleve_id of eleveIds) {
      rows.push({ module_id: moduleId, eleve_id });
    }
  }
  const { error: insErr } = await supabase.from(TABLE).insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}

/**
 * Modules accessibles pour un élève (pour affichage / garde d’accès).
 */
export async function getModulesAccessiblesPourEleve(
  eleveId: string | number
): Promise<MathsExerciceModuleId[]> {
  const eid = String(eleveId);
  const { data, error } = await supabase.from(TABLE).select("module_id").eq("eleve_id", eid);
  if (!error && data != null) {
    const set = new Set((data as { module_id: string }[]).map((r) => r.module_id));
    return MATHS_EXERCICES_MODULES.filter((m) => set.has(m.id)).map((m) => m.id);
  }
  if (error && !isTableMissingError(error) && process.env.NODE_ENV === "development") {
    console.warn("[maths-modules-partages] fallback localStorage:", error.message);
  }
  return getExercicesModulesPartagesLocal();
}

export async function moduleEstAccessiblePourEleve(
  moduleId: MathsExerciceModuleId,
  eleveId: string | number
): Promise<boolean> {
  const list = await getModulesAccessiblesPourEleve(eleveId);
  return list.includes(moduleId);
}
