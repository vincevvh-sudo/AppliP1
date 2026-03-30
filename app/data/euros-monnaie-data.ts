/**
 * Exercice « Compter des euros » : pièces 1 € et 2 €, billets 5 € et 10 €.
 * Totaux toujours entre 1 et 20 € (inclus).
 */

export const TITRE_EUROS_MONNAIE = "Compter les euros";

export type EuroMonnaieQuestion = {
  id: string;
  /** Nombre de pièces de 1 € */
  n1: number;
  /** Nombre de pièces de 2 € */
  n2: number;
  /** Nombre de billets de 5 € */
  n5: number;
  /** Nombre de billets de 10 € */
  n10: number;
};

export function totalEuros(q: EuroMonnaieQuestion): number {
  return q.n1 + 2 * q.n2 + 5 * q.n5 + 10 * q.n10;
}

/** 20 situations variées (pièces seules, billets, mélanges). */
export const QUESTIONS_EUROS_MONNAIE: EuroMonnaieQuestion[] = [
  { id: "1", n1: 1, n2: 0, n5: 0, n10: 0 },
  { id: "2", n1: 0, n2: 1, n5: 0, n10: 0 },
  { id: "3", n1: 2, n2: 1, n5: 0, n10: 0 },
  { id: "4", n1: 0, n2: 0, n5: 1, n10: 0 },
  { id: "5", n1: 1, n2: 2, n5: 0, n10: 0 },
  { id: "6", n1: 3, n2: 2, n5: 0, n10: 0 },
  { id: "7", n1: 0, n2: 1, n5: 1, n10: 0 },
  { id: "8", n1: 2, n2: 0, n5: 1, n10: 0 },
  { id: "9", n1: 0, n2: 4, n5: 0, n10: 0 },
  { id: "10", n1: 4, n2: 3, n5: 0, n10: 0 },
  { id: "11", n1: 0, n2: 0, n5: 0, n10: 1 },
  { id: "12", n1: 0, n2: 0, n5: 2, n10: 0 },
  { id: "13", n1: 1, n2: 2, n5: 1, n10: 0 },
  { id: "14", n1: 5, n2: 2, n5: 1, n10: 0 },
  { id: "15", n1: 2, n2: 1, n5: 0, n10: 1 },
  { id: "16", n1: 3, n2: 1, n5: 1, n10: 0 },
  { id: "17", n1: 0, n2: 0, n5: 4, n10: 0 },
  { id: "18", n1: 6, n2: 2, n5: 0, n10: 0 },
  { id: "19", n1: 0, n2: 3, n5: 0, n10: 1 },
  { id: "20", n1: 1, n2: 0, n5: 1, n10: 1 },
];
