/**
 * Partage des exercices et évaluations maths aux élèves (localStorage, comme complément au français/Supabase).
 * Thème "nombres-1-5" : partage exercices et/ou évaluations à tous.
 * Séries "Opérations 1" à "15" : partage indépendant par série (clés "1" … "15").
 */

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
};

const defaultState: MathsPartageState = {
  "nombres-1-5": { exercices: false, evaluations: false },
  "nombres-6-10": { exercices: false, evaluations: false },
  operations: {},
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
  if (typeof window === "undefined") return { ...defaultState, operations: defaultOperationsLegacy() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState, operations: defaultOperationsLegacy() };
    const parsed = JSON.parse(raw) as Partial<MathsPartageState>;
    const hasStoredOps = parsed.operations && typeof parsed.operations === "object";
    const operations = hasStoredOps
      ? { ...defaultOperationsLegacy(), ...parsed.operations }
      : defaultOperationsLegacy();
    return { ...defaultState, ...parsed, operations };
  } catch {
    return { ...defaultState, operations: defaultOperationsLegacy() };
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
