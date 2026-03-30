/**
 * Additions jusque 20 : 10 séries de 10 calculs.
 * Toutes les réponses sont entre 10 et 20,
 * avec des opérations de type DU + U ou U + DU.
 */

export const TITRE_ADDITIONS_JUSQUE_20 = "Additions jusque 20";

export type Addition20Question = {
  id: string;
  a: number;
  b: number;
  result: number;
};

export type Addition20SerieId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

const SERIES: Record<Addition20SerieId, Array<[number, number]>> = {
  "1": [
    [11, 2], [3, 12], [10, 4], [5, 11], [12, 1],
    [2, 13], [14, 0], [6, 10], [15, 2], [1, 14],
  ],
  "2": [
    [16, 1], [2, 16], [13, 4], [5, 12], [17, 2],
    [3, 15], [18, 1], [4, 14], [19, 0], [6, 13],
  ],
  "3": [
    [10, 7], [8, 10], [11, 6], [7, 12], [12, 5],
    [4, 13], [13, 4], [3, 14], [14, 3], [2, 15],
  ],
  "4": [
    [15, 5], [6, 14], [16, 4], [5, 15], [17, 3],
    [4, 16], [18, 2], [3, 17], [19, 1], [2, 18],
  ],
  "5": [
    [12, 7], [8, 11], [13, 6], [7, 13], [14, 5],
    [6, 12], [15, 4], [5, 14], [16, 3], [4, 15],
  ],
  "6": [
    [10, 9], [9, 10], [11, 8], [8, 11], [12, 7],
    [7, 12], [13, 6], [6, 13], [14, 5], [5, 14],
  ],
  "7": [
    [18, 1], [1, 18], [17, 2], [2, 17], [16, 3],
    [3, 16], [15, 4], [4, 15], [14, 5], [5, 14],
  ],
  "8": [
    [19, 1], [1, 19], [18, 2], [2, 18], [17, 3],
    [3, 17], [16, 4], [4, 16], [15, 5], [5, 15],
  ],
  "9": [
    [20, 0], [0, 20], [19, 1], [1, 19], [18, 2],
    [2, 18], [17, 3], [3, 17], [16, 4], [4, 16],
  ],
  "10": [
    [11, 9], [9, 11], [12, 8], [8, 12], [13, 7],
    [7, 13], [14, 6], [6, 14], [15, 5], [5, 15],
  ],
};

export function getAdditions20Serie(id: Addition20SerieId): {
  titre: string;
  questions: Addition20Question[];
} {
  const pairs = SERIES[id] ?? SERIES["1"];
  return {
    titre: `Additions 20 - ${id}`,
    questions: pairs.map(([a, b], i) => ({
      id: String(i + 1),
      a,
      b,
      result: a + b,
    })),
  };
}
