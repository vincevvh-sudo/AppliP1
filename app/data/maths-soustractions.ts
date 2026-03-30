/**
 * Soustractions jusque 10 : 5 séries de 10 calculs.
 * Chaque calcul commence à 10 ou un nombre plus petit que 10.
 */

export const TITRE_SOUSTRACTIONS_JUSQUE_10 = "Soustraction jusque 10";

export type SoustractionQuestion = {
  id: string;
  a: number;
  b: number;
  result: number;
};

export type SoustractionSerieId = "1" | "2" | "3" | "4" | "5";

const SERIES: Record<SoustractionSerieId, Array<[number, number]>> = {
  "1": [
    [10, 1], [9, 1], [8, 1], [7, 1], [6, 1],
    [10, 2], [9, 2], [8, 2], [7, 2], [6, 2],
  ],
  "2": [
    [10, 3], [9, 3], [8, 3], [7, 3], [6, 3],
    [10, 4], [9, 4], [8, 4], [7, 4], [6, 4],
  ],
  "3": [
    [10, 5], [9, 5], [8, 5], [7, 5], [6, 5],
    [10, 6], [9, 6], [8, 6], [7, 6], [10, 7],
  ],
  "4": [
    [10, 8], [9, 7], [8, 7], [10, 9], [9, 8],
    [10, 0], [9, 0], [8, 0], [7, 0], [6, 0],
  ],
  "5": [
    [10, 10], [10, 7], [10, 5], [10, 3], [10, 1],
    [9, 8], [8, 6], [7, 4], [6, 2], [5, 5],
  ],
};

export function getSoustractionSerie(id: SoustractionSerieId): {
  titre: string;
  questions: SoustractionQuestion[];
} {
  const pairs = SERIES[id] ?? SERIES["1"];
  return {
    titre: `Soustractions ${id}`,
    questions: pairs.map(([a, b], i) => ({
      id: String(i + 1),
      a,
      b,
      result: a - b,
    })),
  };
}
