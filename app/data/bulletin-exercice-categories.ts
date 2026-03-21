/**
 * Stockage (localStorage) de la branche bulletin choisie par l'enseignant
 * pour chaque exercice d'évaluation partagé (niveau_id = sonId-eval-N-j).
 * Permet d'affecter un exercice à Français lire / écrire / écouter / parler.
 */

import type { BulletinCategorieId } from "./bulletin-synthese";

const STORAGE_KEY = "bulletin-exercice-categories";

/** Catégories proposées pour les évals (Français uniquement). */
export const BULLETIN_CATEGORIES_EVAL: { id: BulletinCategorieId; label: string }[] = [
  { id: "francais-lire", label: "Français : lire" },
  { id: "francais-ecrire", label: "Français : écrire" },
  { id: "francais-ecouter", label: "Français : écouter" },
  { id: "francais-parler", label: "Français : parler" },
];

function load(): Record<string, BulletinCategorieId> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, BulletinCategorieId> = {};
    const valid = new Set<string>([
      "francais-lire", "francais-ecrire", "francais-ecouter", "francais-parler",
      "maths-arithmetique", "maths-grandeur", "maths-espace-geo", "maths-traitement-donnees", "eveil",
    ]);
    for (const [k, v] of Object.entries(parsed)) {
      if (valid.has(v)) out[k] = v as BulletinCategorieId;
    }
    return out;
  } catch {
    return {};
  }
}

function save(data: Record<string, BulletinCategorieId>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getCategorieForEvalExercice(niveauId: string): BulletinCategorieId | null {
  const data = load();
  return data[niveauId] ?? null;
}

export function setCategorieForEvalExercice(niveauId: string, categorieId: BulletinCategorieId | null): void {
  const data = load();
  if (categorieId === null) {
    delete data[niveauId];
  } else {
    data[niveauId] = categorieId;
  }
  save(data);
}
