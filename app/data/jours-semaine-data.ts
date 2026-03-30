/**
 * Numéros des jours : lundi = 1 … dimanche = 7.
 */

export const TITRE_JOURS_SEMAINE = "Les jours de la semaine";

export type JourSemaineId =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi"
  | "dimanche";

export type JourSemaineItem = {
  id: JourSemaineId;
  /** Affichage avec majuscule */
  label: string;
  /** 1 = lundi … 7 = dimanche */
  numero: number;
};

/** Ordre pédagogique (référence) — l’exercice mélange l’affichage. */
export const JOURS_SEMAINE: JourSemaineItem[] = [
  { id: "lundi", label: "Lundi", numero: 1 },
  { id: "mardi", label: "Mardi", numero: 2 },
  { id: "mercredi", label: "Mercredi", numero: 3 },
  { id: "jeudi", label: "Jeudi", numero: 4 },
  { id: "vendredi", label: "Vendredi", numero: 5 },
  { id: "samedi", label: "Samedi", numero: 6 },
  { id: "dimanche", label: "Dimanche", numero: 7 },
];

/** Mélange Fisher–Yates (copie). */
export function melangerJours(items: JourSemaineItem[]): JourSemaineItem[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
