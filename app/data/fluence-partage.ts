/**
 * Partage Fluence (Forêt des sons) — une unité = un son (ex. Voyelle 1 = o).
 * Table : sons_partages_eval_niveaux (son_id, niveau_id = `${sonId}-fluence`).
 */

export const FLUENCE_VOYELLE_LABEL: Record<string, string> = {
  o: "Voyelle 1",
  u: "Voyelle 2",
  e: "Voyelle 3",
};

export function fluenceNiveauId(sonId: string): string {
  return `${sonId}-fluence`;
}

export function isFluenceNiveauId(niveauId: string): boolean {
  return niveauId.endsWith("-fluence");
}

export function sonIdFromFluenceNiveauId(niveauId: string): string | null {
  if (!isFluenceNiveauId(niveauId)) return null;
  return niveauId.slice(0, -"-fluence".length) || null;
}

export function getFluenceDisplayLabel(son: { id: string; grapheme: string }): string {
  return FLUENCE_VOYELLE_LABEL[son.id] ?? son.grapheme.split(",")[0].trim();
}
