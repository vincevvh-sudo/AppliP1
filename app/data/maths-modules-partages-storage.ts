/**
 * Partage des exercices maths par élève — Supabase.
 * Table : maths_exercices_modules_partages (voir supabase-maths-exercices-modules-partages.sql)
 * - Modules hors arithmétique : module_id = id du module
 * - Thèmes nombres : module_id = "nombres-1-5" (exercices) ou "nombres-1-5-eval" (évaluations)
 * Fallback : localStorage si la table est absente ou erreur réseau.
 */

import { supabase } from "../../utils/supabase";
import { MATHS_EXERCICES_MODULES, type MathsExerciceModuleId } from "./maths-exercices-modules";
import {
  getExerciceModuleEleveIds,
  getExercicesModulesPartagesPourEleve,
  getMathsThemeEvaluationsEleveIds,
  getMathsThemeExercicesEleveIds,
  getMathsThemesEvaluationsPartagesPourEleve,
  getMathsThemesExercicesPartagesPourEleve,
  MATHS_THEMES_NOMBRES,
  setExerciceModuleEleveIds,
  setMathsThemeEvaluationsEleveIds,
  setMathsThemeExercicesEleveIds,
  type MathsThemePartageKey,
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

/** Clé table Supabase pour les évaluations d’un thème nombres. */
export function moduleIdThemeNombresEvaluations(themeId: MathsThemePartageKey): string {
  return `${themeId}-eval`;
}

async function getEleveIdsPourCle(moduleId: string, fallback: () => string[]): Promise<string[]> {
  const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("module_id", moduleId);
  if (error) {
    if (isTableMissingError(error)) return fallback();
    if (process.env.NODE_ENV === "development") console.warn("[maths-modules-partages]", error.message);
    return fallback();
  }
  const cloud = [...new Set((data ?? []).map((r: { eleve_id: string }) => String(r.eleve_id)))];
  if (cloud.length > 0) return cloud;
  return fallback();
}

async function remplacerPartagesCle(
  moduleId: string,
  eleveIds: string[],
  fallbackLocal: (ids: string[]) => void
): Promise<{ ok: boolean; error?: string; info?: string }> {
  const uniq = [...new Set(eleveIds.map(String))];
  fallbackLocal(uniq);
  const { error: delErr } = await supabase.from(TABLE).delete().eq("module_id", moduleId);
  if (delErr) {
    if (isTableMissingError(delErr)) {
      return {
        ok: true,
        info:
          "Partage enregistré sur ce navigateur. Pour le même partage sur tous les appareils, exécute supabase-maths-exercices-modules-partages.sql dans Supabase → SQL Editor.",
      };
    }
    return { ok: false, error: delErr.message };
  }
  if (uniq.length === 0) return { ok: true };
  const rows = uniq.map((eleve_id) => ({ module_id: moduleId, eleve_id }));
  const { error: insErr } = await supabase.from(TABLE).insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}

export async function getEleveIdsPourThemeNombresExercices(
  themeId: MathsThemePartageKey
): Promise<string[]> {
  return getEleveIdsPourCle(themeId, () => getMathsThemeExercicesEleveIds(themeId));
}

export async function getEleveIdsPourThemeNombresEvaluations(
  themeId: MathsThemePartageKey
): Promise<string[]> {
  return getEleveIdsPourCle(moduleIdThemeNombresEvaluations(themeId), () =>
    getMathsThemeEvaluationsEleveIds(themeId)
  );
}

export async function remplacerPartageThemeNombresExercices(
  themeId: MathsThemePartageKey,
  eleveIds: string[]
): Promise<{ ok: boolean; error?: string; info?: string }> {
  return remplacerPartagesCle(themeId, eleveIds, (ids) => setMathsThemeExercicesEleveIds(themeId, ids));
}

export async function remplacerPartageThemeNombresEvaluations(
  themeId: MathsThemePartageKey,
  eleveIds: string[]
): Promise<{ ok: boolean; error?: string; info?: string }> {
  return remplacerPartagesCle(moduleIdThemeNombresEvaluations(themeId), eleveIds, (ids) =>
    setMathsThemeEvaluationsEleveIds(themeId, ids)
  );
}

/**
 * Thèmes nombres (exercices) visibles pour cet élève.
 * Uniquement les thèmes explicitement cochés — jamais toute l’arithmétique par défaut.
 */
export async function getMathsThemesExercicesAccessiblesPourEleve(
  eleveId: string | number
): Promise<MathsThemePartageKey[]> {
  const eid = String(eleveId);
  const local = getMathsThemesExercicesPartagesPourEleve(eid) as MathsThemePartageKey[];
  const { data, error } = await supabase.from(TABLE).select("module_id").eq("eleve_id", eid);
  if (error || data == null) return local;
  const set = new Set((data as { module_id: string }[]).map((r) => r.module_id));
  const cloud = MATHS_THEMES_NOMBRES.filter((id) => set.has(id));
  return [...new Set([...cloud, ...local])];
}

export async function getMathsThemesEvaluationsAccessiblesPourEleve(
  eleveId: string | number
): Promise<MathsThemePartageKey[]> {
  const eid = String(eleveId);
  const local = getMathsThemesEvaluationsPartagesPourEleve(eid) as MathsThemePartageKey[];
  const { data, error } = await supabase.from(TABLE).select("module_id").eq("eleve_id", eid);
  if (error || data == null) return local;
  const set = new Set((data as { module_id: string }[]).map((r) => r.module_id));
  const cloud = MATHS_THEMES_NOMBRES.filter((id) => set.has(moduleIdThemeNombresEvaluations(id)));
  return [...new Set([...cloud, ...local])];
}

/**
 * Si un thème nombres a déjà des élèves en local mais pas encore dans Supabase,
 * on pousse ce partage pour que les enfants le voient sur tous les appareils.
 */
export async function synchroniserPartagesNombresLocauxVersSupabase(): Promise<void> {
  for (const themeId of MATHS_THEMES_NOMBRES) {
    const localEx = getMathsThemeExercicesEleveIds(themeId);
    if (localEx.length > 0) {
      const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("module_id", themeId);
      if (!error && (data ?? []).length === 0) {
        await remplacerPartageThemeNombresExercices(themeId, localEx);
      }
    }
    const localEv = getMathsThemeEvaluationsEleveIds(themeId);
    if (localEv.length > 0) {
      const evalId = moduleIdThemeNombresEvaluations(themeId);
      const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("module_id", evalId);
      if (!error && (data ?? []).length === 0) {
        await remplacerPartageThemeNombresEvaluations(themeId, localEv);
      }
    }
  }
}
