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

/** Séries d'additions jusque 10 partageables (1 à 10). */
export const ADDITIONS_SERIE_IDS_PARTAGEABLES = [
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
] as const;

/** Séries d'additions jusque 20 partageables (1 à 10). */
export const ADDITIONS20_SERIE_IDS_PARTAGEABLES = [
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
] as const;

/** Séries de soustractions jusque 10 partageables (1 à 5). */
export const SOUSTRACTIONS_SERIE_IDS_PARTAGEABLES = [
  "1",
  "2",
  "3",
  "4",
  "5",
] as const;

/** Séries de soustractions jusque 20 partageables (1 à 5). */
export const SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES = [
  "1",
  "2",
  "3",
  "4",
  "5",
] as const;

/** Séries additions & soustractions jusque 20 partageables (1 à 10). */
export const ADDITIONS_SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES = [
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
] as const;

/** Thèmes « nombres » (exercices / évaluations) — sans les séries d'opérations. */
export type MathsThemePartageKey =
  | "nombres-1-5"
  | "nombres-6-10"
  | "nombres-10-15"
  | "nombres-15-20";

export type MathsPartageState = {
  "nombres-1-5": { exercices: boolean; evaluations: boolean };
  "nombres-6-10": { exercices: boolean; evaluations: boolean };
  "nombres-10-15": { exercices: boolean; evaluations: boolean };
  "nombres-15-20": { exercices: boolean; evaluations: boolean };
  /** Partage par série d'opérations (clés "1" … "15"). */
  operations: Record<string, boolean>;
  /** Partage par série d'additions jusque 10 (clés "1" … "10"). */
  additions: Record<string, boolean>;
  /** Partage par série d'additions jusque 20 (clés "1" … "10"). */
  additions20: Record<string, boolean>;
  /** Partage par série de soustractions jusque 10 (clés "1" … "5"). */
  soustractions: Record<string, boolean>;
  /** Partage par série de soustractions jusque 20 (clés "1" … "5"). */
  soustractions20: Record<string, boolean>;
  /** Partage par série additions/soustractions jusque 20 (clés "1" … "10"). */
  additionsSoustractions20: Record<string, boolean>;
  /** Partage des thèmes nombres (exercices) par élève UUID. */
  mathsThemesExercicesEleves: Record<string, string[]>;
  /** Partage des thèmes nombres (évaluations) par élève UUID. */
  mathsThemesEvaluationsEleves: Record<string, string[]>;
  /** Exercices interactifs (grandeur, espace, traitement de données) — par id de module (legacy, secours). */
  exercicesModules: Record<string, boolean>;
  /** Sans Supabase : pour chaque module, ids élèves (UUID) ayant accès. */
  exercicesModulesEleves: Record<string, string[]>;
};

const defaultState: MathsPartageState = {
  "nombres-1-5": { exercices: false, evaluations: false },
  "nombres-6-10": { exercices: false, evaluations: false },
  "nombres-10-15": { exercices: true, evaluations: false },
  "nombres-15-20": { exercices: true, evaluations: false },
  operations: {},
  additions: {},
  additions20: {},
  soustractions: {},
  soustractions20: {},
  additionsSoustractions20: {},
  mathsThemesExercicesEleves: {},
  mathsThemesEvaluationsEleves: {},
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
    return {
      ...defaultState,
      operations: defaultOperationsLegacy(),
      additions: {},
      additions20: {},
      soustractions: {},
      soustractions20: {},
      additionsSoustractions20: {},
      mathsThemesExercicesEleves: {},
      mathsThemesEvaluationsEleves: {},
      exercicesModules: {},
      exercicesModulesEleves: {},
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        ...defaultState,
        operations: defaultOperationsLegacy(),
        additions: {},
        additions20: {},
        soustractions: {},
        soustractions20: {},
        additionsSoustractions20: {},
        mathsThemesExercicesEleves: {},
        mathsThemesEvaluationsEleves: {},
        exercicesModules: {},
        exercicesModulesEleves: {},
      };
    const parsed = JSON.parse(raw) as Partial<MathsPartageState>;
    const hasStoredOps = parsed.operations && typeof parsed.operations === "object";
    const operations = hasStoredOps
      ? { ...defaultOperationsLegacy(), ...parsed.operations }
      : defaultOperationsLegacy();
    const exercicesModules =
      parsed.exercicesModules && typeof parsed.exercicesModules === "object"
        ? { ...parsed.exercicesModules }
        : {};
    const additions =
      parsed.additions && typeof parsed.additions === "object"
        ? { ...parsed.additions }
        : {};
    const additions20 =
      parsed.additions20 && typeof parsed.additions20 === "object"
        ? { ...parsed.additions20 }
        : {};
    const soustractions =
      parsed.soustractions && typeof parsed.soustractions === "object"
        ? { ...parsed.soustractions }
        : {};
    const soustractions20 =
      parsed.soustractions20 && typeof parsed.soustractions20 === "object"
        ? { ...parsed.soustractions20 }
        : {};
    const additionsSoustractions20 =
      parsed.additionsSoustractions20 && typeof parsed.additionsSoustractions20 === "object"
        ? { ...parsed.additionsSoustractions20 }
        : {};
    const exercicesModulesEleves =
      parsed.exercicesModulesEleves && typeof parsed.exercicesModulesEleves === "object"
        ? { ...parsed.exercicesModulesEleves }
        : {};
    const mathsThemesExercicesEleves =
      parsed.mathsThemesExercicesEleves && typeof parsed.mathsThemesExercicesEleves === "object"
        ? { ...parsed.mathsThemesExercicesEleves }
        : {};
    const mathsThemesEvaluationsEleves =
      parsed.mathsThemesEvaluationsEleves && typeof parsed.mathsThemesEvaluationsEleves === "object"
        ? { ...parsed.mathsThemesEvaluationsEleves }
        : {};
    return {
      ...defaultState,
      ...parsed,
      operations,
      additions,
      additions20,
      soustractions,
      soustractions20,
      additionsSoustractions20,
      mathsThemesExercicesEleves,
      mathsThemesEvaluationsEleves,
      exercicesModules,
      exercicesModulesEleves,
    };
  } catch {
    return {
      ...defaultState,
      operations: defaultOperationsLegacy(),
      additions: {},
      additions20: {},
      soustractions: {},
      soustractions20: {},
      additionsSoustractions20: {},
      mathsThemesExercicesEleves: {},
      mathsThemesEvaluationsEleves: {},
      exercicesModules: {},
      exercicesModulesEleves: {},
    };
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
  if (!partager) {
    if (!state.mathsThemesExercicesEleves) state.mathsThemesExercicesEleves = {};
    delete state.mathsThemesExercicesEleves[themeId];
  }
  save(state);
}

export function setMathsEvaluationsShared(themeId: MathsThemePartageKey, partager: boolean): void {
  const state = load();
  if (!state[themeId]) state[themeId] = { exercices: false, evaluations: false };
  state[themeId].evaluations = partager;
  if (!partager) {
    if (!state.mathsThemesEvaluationsEleves) state.mathsThemesEvaluationsEleves = {};
    delete state.mathsThemesEvaluationsEleves[themeId];
  }
  save(state);
}

export function getMathsThemeExercicesEleveIds(themeId: MathsThemePartageKey): string[] {
  const state = load();
  const list = state.mathsThemesExercicesEleves?.[themeId];
  return Array.isArray(list) ? [...list] : [];
}

export function getMathsThemeEvaluationsEleveIds(themeId: MathsThemePartageKey): string[] {
  const state = load();
  const list = state.mathsThemesEvaluationsEleves?.[themeId];
  return Array.isArray(list) ? [...list] : [];
}

export function setMathsThemeExercicesEleveIds(themeId: MathsThemePartageKey, eleveIds: string[]): void {
  const state = load();
  if (!state.mathsThemesExercicesEleves) state.mathsThemesExercicesEleves = {};
  const uniq = [...new Set(eleveIds.map(String))];
  state.mathsThemesExercicesEleves[themeId] = uniq;
  if (!state[themeId]) state[themeId] = { exercices: false, evaluations: false };
  state[themeId].exercices = uniq.length > 0;
  save(state);
}

export function setMathsThemeEvaluationsEleveIds(themeId: MathsThemePartageKey, eleveIds: string[]): void {
  const state = load();
  if (!state.mathsThemesEvaluationsEleves) state.mathsThemesEvaluationsEleves = {};
  const uniq = [...new Set(eleveIds.map(String))];
  state.mathsThemesEvaluationsEleves[themeId] = uniq;
  if (!state[themeId]) state[themeId] = { exercices: false, evaluations: false };
  state[themeId].evaluations = uniq.length > 0;
  save(state);
}

/** Pour l'enfant : quels thèmes ont les exercices partagés ? */
export function getMathsThemesExercicesPartages(): string[] {
  const state = load();
  const ids: string[] = [];
  if (state["nombres-1-5"]?.exercices) ids.push("nombres-1-5");
  if (state["nombres-6-10"]?.exercices) ids.push("nombres-6-10");
  if (state["nombres-10-15"]?.exercices) ids.push("nombres-10-15");
  if (state["nombres-15-20"]?.exercices) ids.push("nombres-15-20");
  return ids;
}

export function getMathsThemesExercicesPartagesPourEleve(eleveId: string | number): string[] {
  const eid = String(eleveId);
  const state = load();
  const ids: string[] = [];
  const allThemes: MathsThemePartageKey[] = ["nombres-1-5", "nombres-6-10", "nombres-10-15", "nombres-15-20"];
  for (const id of allThemes) {
    const list = state.mathsThemesExercicesEleves?.[id];
    if (Array.isArray(list) && list.length > 0) {
      if (list.includes(eid)) ids.push(id);
    } else if (state[id]?.exercices) {
      ids.push(id);
    }
  }
  return ids;
}

/** Pour l'enfant : quels thèmes ont les évaluations partagées ? */
export function getMathsThemesEvaluationsPartages(): string[] {
  const state = load();
  const ids: string[] = [];
  if (state["nombres-1-5"]?.evaluations) ids.push("nombres-1-5");
  if (state["nombres-6-10"]?.evaluations) ids.push("nombres-6-10");
  if (state["nombres-10-15"]?.evaluations) ids.push("nombres-10-15");
  if (state["nombres-15-20"]?.evaluations) ids.push("nombres-15-20");
  return ids;
}

export function getMathsThemesEvaluationsPartagesPourEleve(eleveId: string | number): string[] {
  const eid = String(eleveId);
  const state = load();
  const ids: string[] = [];
  const allThemes: MathsThemePartageKey[] = ["nombres-1-5", "nombres-6-10", "nombres-10-15", "nombres-15-20"];
  for (const id of allThemes) {
    const list = state.mathsThemesEvaluationsEleves?.[id];
    if (Array.isArray(list) && list.length > 0) {
      if (list.includes(eid)) ids.push(id);
    } else if (state[id]?.evaluations) {
      ids.push(id);
    }
  }
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

export function isAdditionSerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.additions?.[serieId]);
}

export function setAdditionSerieShared(serieId: string, partager: boolean): void {
  if (!ADDITIONS_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof ADDITIONS_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.additions) state.additions = {};
  state.additions[serieId] = partager;
  save(state);
}

/** Pour l'enfant : numéros de séries d'additions accessibles (ex. ["1","3","10"]). */
export function getAdditionsSeriesPartages(): string[] {
  const state = load();
  return ADDITIONS_SERIE_IDS_PARTAGEABLES.filter((id) => state.additions?.[id]);
}

/** Partager ou retirer toutes les séries d'additions d'un coup. */
export function setAllAdditionsSeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.additions ?? {}) };
  for (const id of ADDITIONS_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.additions = next;
  save(state);
}

export function isAddition20SerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.additions20?.[serieId]);
}

export function setAddition20SerieShared(serieId: string, partager: boolean): void {
  if (!ADDITIONS20_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof ADDITIONS20_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.additions20) state.additions20 = {};
  state.additions20[serieId] = partager;
  save(state);
}

export function getAdditions20SeriesPartages(): string[] {
  const state = load();
  return ADDITIONS20_SERIE_IDS_PARTAGEABLES.filter((id) => state.additions20?.[id]);
}

export function setAllAdditions20SeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.additions20 ?? {}) };
  for (const id of ADDITIONS20_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.additions20 = next;
  save(state);
}

export function isSoustractionSerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.soustractions?.[serieId]);
}

export function setSoustractionSerieShared(serieId: string, partager: boolean): void {
  if (!SOUSTRACTIONS_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof SOUSTRACTIONS_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.soustractions) state.soustractions = {};
  state.soustractions[serieId] = partager;
  save(state);
}

export function getSoustractionsSeriesPartages(): string[] {
  const state = load();
  return SOUSTRACTIONS_SERIE_IDS_PARTAGEABLES.filter((id) => state.soustractions?.[id]);
}

export function setAllSoustractionsSeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.soustractions ?? {}) };
  for (const id of SOUSTRACTIONS_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.soustractions = next;
  save(state);
}

export function isSoustraction20SerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.soustractions20?.[serieId]);
}

export function setSoustraction20SerieShared(serieId: string, partager: boolean): void {
  if (!SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.soustractions20) state.soustractions20 = {};
  state.soustractions20[serieId] = partager;
  save(state);
}

export function getSoustractions20SeriesPartages(): string[] {
  const state = load();
  return SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.filter((id) => state.soustractions20?.[id]);
}

export function setAllSoustractions20SeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.soustractions20 ?? {}) };
  for (const id of SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.soustractions20 = next;
  save(state);
}

export function isAdditionSoustraction20SerieShared(serieId: string): boolean {
  const state = load();
  return Boolean(state.additionsSoustractions20?.[serieId]);
}

export function setAdditionSoustraction20SerieShared(serieId: string, partager: boolean): void {
  if (!ADDITIONS_SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.includes(serieId as (typeof ADDITIONS_SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES)[number])) {
    return;
  }
  const state = load();
  if (!state.additionsSoustractions20) state.additionsSoustractions20 = {};
  state.additionsSoustractions20[serieId] = partager;
  save(state);
}

export function getAdditionsSoustractions20SeriesPartages(): string[] {
  const state = load();
  return ADDITIONS_SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES.filter((id) => state.additionsSoustractions20?.[id]);
}

export function setAllAdditionsSoustractions20SeriesShared(partager: boolean): void {
  const state = load();
  const next: Record<string, boolean> = { ...(state.additionsSoustractions20 ?? {}) };
  for (const id of ADDITIONS_SOUSTRACTIONS20_SERIE_IDS_PARTAGEABLES) {
    next[id] = partager;
  }
  state.additionsSoustractions20 = next;
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
