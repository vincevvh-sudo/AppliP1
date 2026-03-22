/**
 * Partage des exercices maths (modules hors arithmétique) par élève — Supabase.
 * Table : maths_exercices_modules_partages (voir supabase-maths-exercices-modules-partages.sql)
 * Fallback : localStorage (liste d’élèves par module) si la table est absente ou erreur réseau.
 */

import { supabase } from "../../utils/supabase";
import { MATHS_EXERCICES_MODULES, type MathsExerciceModuleId } from "./maths-exercices-modules";
import {
  getExerciceModuleEleveIds,
  getExercicesModulesPartagesPourEleve,
  setExerciceModuleEleveIds,
} from "./maths-partages";

const TABLE = "maths_exercices_modules_partages";

/** PostgREST / Postgres : table absente ou pas encore dans le cache du schéma. */
function isTableMissingError(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "").toUpperCase();
  if (code === "42P01" || code === "PGRST205") return true;
  const m = (err.message ?? "").toLowerCase();
  return (
    m.includes("does not exist") ||
    m.includes("schema cache") ||
    m.includes("could not find the table") ||
    m.includes("undefined table")
  );
}

/**
 * Sans table Supabase : une entrée par élève coché (localStorage), comme avec la table SQL.
 */
function sauvegarderPartageLocal(
  moduleIds: MathsExerciceModuleId[],
  eleveIds: string[]
): { ok: true; modeLocal: true } {
  for (const id of moduleIds) {
    setExerciceModuleEleveIds(id, eleveIds);
  }
  return { ok: true, modeLocal: true };
}

export async function getEleveIdsPourModule(moduleId: string): Promise<string[]> {
  const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("module_id", moduleId);
  if (error) {
    if (isTableMissingError(error)) return getExerciceModuleEleveIds(moduleId);
    if (process.env.NODE_ENV === "development") console.warn("[maths-modules-partages]", error.message);
    return [];
  }
  return [...new Set((data ?? []).map((r: { eleve_id: string }) => String(r.eleve_id)))];
}

/** Remplace tout le partage pour un module (liste d’ids élèves, peut être vide). */
export async function remplacerPartagesModule(
  moduleId: MathsExerciceModuleId,
  eleveIds: string[]
): Promise<{ ok: boolean; error?: string; info?: string }> {
  const { error: delErr } = await supabase.from(TABLE).delete().eq("module_id", moduleId);
  if (delErr) {
    if (isTableMissingError(delErr)) {
      sauvegarderPartageLocal([moduleId], eleveIds);
      return {
        ok: true,
        info:
          "Partage enregistré sur ce navigateur (élèves cochés enregistrés localement). Pour le même partage sur tous tes appareils et tous les postes, exécute supabase-maths-exercices-modules-partages.sql dans Supabase → SQL Editor.",
      };
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
): Promise<{ ok: boolean; error?: string; info?: string }> {
  if (moduleIds.length === 0) return { ok: true };
  const { error: delErr } = await supabase.from(TABLE).delete().in("module_id", moduleIds);
  if (delErr) {
    if (isTableMissingError(delErr)) {
      sauvegarderPartageLocal(moduleIds, eleveIds);
      return {
        ok: true,
        info:
          "Partage enregistré sur ce navigateur (élèves cochés en local). Pour synchroniser via Supabase sur tous les appareils, exécute supabase-maths-exercices-modules-partages.sql dans Supabase → SQL Editor.",
      };
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
  return getExercicesModulesPartagesPourEleve(eid);
}

export async function moduleEstAccessiblePourEleve(
  moduleId: MathsExerciceModuleId,
  eleveId: string | number
): Promise<boolean> {
  const list = await getModulesAccessiblesPourEleve(eleveId);
  return list.includes(moduleId);
}
