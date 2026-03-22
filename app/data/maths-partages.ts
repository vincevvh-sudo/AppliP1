/**
 * Partage des exercices et évaluations maths aux élèves (localStorage, comme complément au français/Supabase).
 * Thème "nombres-1-5" : partage exercices et/ou évaluations à tous.
 * Séries "Opérations 1" à "15" : partage indépendant par série (clés "1" … "15").
 * Modules hors nombres : partage principal via Supabase (maths-modules-partages-storage.ts).
 * Sans table Supabase : localStorage avec liste d’élèves par module (exercicesModulesEleves),
 * comme l’espace/géométrie — quelques élèves ou tous (bouton « Tous »). Ancien booléen exercicesModules = toute la classe.
 */

import type { MathsExerciceModuleId } from "./maths-exercices-modules";
import { MATHS_EXERCICES_MODULES } from "./maths-exercices-modules";

const STORAGE_KEY = "maths-partages";

/** Séries d'opérations gérées dans l'UI élève (voir maths-operations / enfant/maths/operations). */
export const OPERATIONS_SERIE_IDS_PARTAGEABLES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
] as const;

/** Thèmes « nombres » (exercices / évaluations) — sans les séries d'opérations. */
export type MathsThemePartageKey = "nombres-1-5" | "nombres-6-10";

export type MathsPartageState = {
  "nombres-1-5": { exercices: boolean; evaluations: boolean };
  "nombres-6-10": { exercices: boolean; evaluations: boolean };
  /** Partage par série d'opérations (clés "1" … "15"). */
  operations: Record<string, boolean>;
  /** Exercices interactifs (grandeur, espace, traitement de données) — par id de module (legacy, secours). */
  exercicesModules: Record<string, boolean>;
  /** Sans Supabase : pour chaque module, ids élèves (UUID) ayant accès. */
  exercicesModulesEleves: Record<string, string[]>;
};

const defaultState: MathsPartageState = {
  "nombres-1-5": { exercices: false, evaluations: false },
  "nombres-6-10": { exercices: false, evaluations: false },
  operations: {},
  exercicesModules: {},
  exercicesModulesEleves: {},
};

/** Comportement historique : opérations 1 et 2 étaient visibles sans mécanisme de partage. */
function defaultOperationsLegacy(): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  for (const id of OPERATIONS_SERIE_IDS_PARTAGEABLES) {
    o[id] = id === "1" || id === "2";
  }
  return o;
}

function load(): MathsPartageState {
  if (typeof window === "undefined")
    return { ...defaultState, operations: defaultOperationsLegacy(), exercicesModules: {}, exercicesModulesEleves: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState, operations: defaultOperationsLegacy(), exercicesModules: {}, exercicesModulesEleves: {} };
    const parsed = JSON.parse(raw) as Partial<MathsPartageState>;
    const hasStoredOps = parsed.operations && typeof parsed.operations === "object";
    const operations = hasStoredOps
      ? { ...defaultOperationsLegacy(), ...parsed.operations }
      : defaultOperationsLegacy();
    const exercicesModules =
      parsed.exercicesModules && typeof parsed.exercicesModules === "object"
        ? { ...parsed.exercicesModules }
        : {};
    const exercicesModulesEleves =
      parsed.exercicesModulesEleves && typeof parsed.exercicesModulesEleves === "object"
        ? { ...parsed.exercicesModulesEleves }
        : {};
    return { ...defaultState, ...parsed, operations, exercicesModules, exercicesModulesEleves };
  } catch {
    return { ...defaultState, operations: defaultOperationsLegacy(), exercicesModules: {}, exercicesModulesEleves: {} };
  }
}

function save(state: MathsPartageState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function isMathsExercicesShared(themeId: MathsThemePartageKey): boolean {
  return load()[themeId]?.exercices ?? false;
}

export function isMathsEvaluationsShared(themeId: MathsThemePartageKey): boolean {
  return load()[themeId]?.evaluations ?? false;
}

export function setMathsExercicesShared(themeId: MathsThemePartageKey, partager: boolean): void {
  const state = load();
  if (!state[themeId]) state[themeId] = { exercices: false, evaluations: false };
  state[themeId].exercices = partager;
  save(state);
}

export function setMathsEvaluationsShared(themeId: MathsThemePartageKey, partager: boolean): void {
  const state = load();
  if (!state[themeId]) state[themeId] = { exercices: false, evaluations: false };
  state[themeId].evaluations = partager;
  save(state);
}

/** Pour l'enfant : quels thèmes ont les exercices partagés ? */
export function getMathsThemesExercicesPartages(): string[] {
  const state = load();
  const ids: string[] = [];
  if (state["nombres-1-5"]?.exercices) ids.push("nombres-1-5");
  if (state["nombres-6-10"]?.exercices) ids.push("nombres-6-10");
  return ids;
}

/** Pour l'enfant : quels thèmes ont les évaluations partagées ? */
export function getMathsThemesEvaluationsPartages(): string[] {
  const state = load();
  const ids: string[] = [];
  if (state["nombres-1-5"]?.evaluations) ids.push("nombres-1-5");
  if (state["nombres-6-10"]?.evaluations) ids.push("nombres-6-10");
  return ids;
}

export function isOperationSerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.operations?.[serieId]);
}

export function setOperationSerieShared(serieId: string, partager: boolean): void {
  if (!OPERATIONS_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof OPERATIONS_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.operations) state.operations = {};
  state.operations[serieId] = partager;
  save(state);
}

/** Pour l'enfant : numéros de séries d'opérations accessibles (ex. ["1","3","10"]). */
export function getOperationsSeriesPartages(): string[] {
  const state = load();
  return OPERATIONS_SERIE_IDS_PARTAGEABLES.filter((id) => state.operations?.[id]);
}

/** Partager ou retirer toutes les séries d'un coup. */
export function setAllOperationsSeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.operations ?? {}) };
  for (const id of OPERATIONS_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.operations = next;
  save(state);
}

const MODULE_IDS = new Set(MATHS_EXERCICES_MODULES.map((m) => m.id));

export function isExerciceModuleShared(moduleId: MathsExerciceModuleId | string): boolean {
  const state = load();
  return Boolean(state.exercicesModules?.[moduleId]);
}

export function setExerciceModuleShared(moduleId: MathsExerciceModuleId, partager: boolean): void {
  if (!MODULE_IDS.has(moduleId)) return;
  const state = load();
  if (!state.exercicesModules) state.exercicesModules = {};
  state.exercicesModules[moduleId] = partager;
  if (!partager) {
    if (!state.exercicesModulesEleves) state.exercicesModulesEleves = {};
    delete state.exercicesModulesEleves[moduleId];
  }
  save(state);
}

/** Liste d’élèves (UUID) pour un module — mode local sans Supabase. */
export function getExerciceModuleEleveIds(moduleId: MathsExerciceModuleId | string): string[] {
  const state = load();
  const list = state.exercicesModulesEleves?.[moduleId];
  if (Array.isArray(list) && list.length > 0) return [...list];
  return [];
}

/** Enregistre le partage par élève (navigateur local si pas de table Supabase). */
export function setExerciceModuleEleveIds(moduleId: MathsExerciceModuleId, eleveIds: string[]): void {
  if (!MODULE_IDS.has(moduleId)) return;
  const state = load();
  if (!state.exercicesModulesEleves) state.exercicesModulesEleves = {};
  const uniq = [...new Set(eleveIds.map(String))];
  state.exercicesModulesEleves[moduleId] = uniq;
  if (!state.exercicesModules) state.exercicesModules = {};
  state.exercicesModules[moduleId] = uniq.length > 0;
  save(state);
}

/** Pour l'enfant : ids des modules d'exercices accessibles (legacy : booléen seul = toute la classe). */
export function getExercicesModulesPartages(): MathsExerciceModuleId[] {
  const state = load();
  return MATHS_EXERCICES_MODULES.filter((m) => state.exercicesModules?.[m.id]).map((m) => m.id);
}

/** Pour l'enfant : modules accessibles pour cet élève (liste par élève ou legacy « toute la classe »). */
export function getExercicesModulesPartagesPourEleve(eleveId: string | number): MathsExerciceModuleId[] {
  const eid = String(eleveId);
  const state = load();
  return MATHS_EXERCICES_MODULES.filter((m) => {
    const list = state.exercicesModulesEleves?.[m.id];
    if (Array.isArray(list) && list.length > 0) {
      return list.includes(eid);
    }
    return Boolean(state.exercicesModules?.[m.id]);
  }).map((m) => m.id);
}
