/**
 * Partage des exercices et évaluations maths aux élèves (localStorage, comme complément au français/Supabase).
 * Thème "nombres-1-5" : partage exercices et/ou évaluations à tous.
 */

const STORAGE_KEY = "maths-partages";

export type MathsPartageState = {
  "nombres-1-5": { exercices: boolean; evaluations: boolean };
  "nombres-6-10": { exercices: boolean; evaluations: boolean };
};

const defaultState: MathsPartageState = {
  "nombres-1-5": { exercices: false, evaluations: false },
  "nombres-6-10": { exercices: false, evaluations: false },
};

function load(): MathsPartageState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<MathsPartageState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function save(state: MathsPartageState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function isMathsExercicesShared(themeId: keyof MathsPartageState): boolean {
  return load()[themeId]?.exercices ?? false;
}

export function isMathsEvaluationsShared(themeId: keyof MathsPartageState): boolean {
  return load()[themeId]?.evaluations ?? false;
}

export function setMathsExercicesShared(themeId: keyof MathsPartageState, partager: boolean): void {
  const state = load();
  if (!state[themeId]) (state as Record<string, { exercices: boolean; evaluations: boolean }>)[themeId] = { exercices: false, evaluations: false };
  state[themeId].exercices = partager;
  save(state);
}

export function setMathsEvaluationsShared(themeId: keyof MathsPartageState, partager: boolean): void {
  const state = load();
  if (!state[themeId]) (state as Record<string, { exercices: boolean; evaluations: boolean }>)[themeId] = { exercices: false, evaluations: false };
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
