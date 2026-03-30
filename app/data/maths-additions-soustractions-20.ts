/**
 * Additions et soustractions jusque 20 : 10 séries de 10 calculs.
 * - Additions de type DU + U ou U + DU (comme additions jusque 20)
 * - Soustractions avec départ entre 10 et 20
 * - Résultats toujours entre 10 et 20
 */

export const TITRE_ADDITIONS_SOUSTRACTIONS_JUSQUE_20 = "Additions et soustractions jusque 20";

export type AdditionSoustraction20Question = {
  id: string;
  a: number;
  b: number;
  op: "+" | "-";
  result: number;
};

export type AdditionSoustraction20SerieId =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";

type RawItem = [number, "+" | "-", number];

const SERIES: Record<AdditionSoustraction20SerieId, RawItem[]> = {
  "1": [
    [11, "+", 2], [20, "-", 9], [6, "+", 12], [19, "-", 8], [13, "+", 3],
    [18, "-", 7], [4, "+", 14], [17, "-", 6], [15, "+", 2], [16, "-", 5],
  ],
  "2": [
    [9, "+", 10], [20, "-", 8], [7, "+", 11], [19, "-", 7], [8, "+", 12],
    [18, "-", 6], [5, "+", 13], [17, "-", 5], [6, "+", 14], [16, "-", 4],
  ],
  "3": [
    [3, "+", 15], [20, "-", 7], [2, "+", 16], [19, "-", 6], [1, "+", 17],
    [18, "-", 5], [4, "+", 13], [17, "-", 4], [5, "+", 12], [16, "-", 3],
  ],
  "4": [
    [8, "+", 11], [20, "-", 6], [7, "+", 12], [19, "-", 5], [6, "+", 13],
    [18, "-", 4], [5, "+", 14], [17, "-", 3], [4, "+", 15], [16, "-", 2],
  ],
  "5": [
    [10, "+", 8], [20, "-", 5], [9, "+", 9], [19, "-", 4], [8, "+", 10],
    [18, "-", 3], [7, "+", 11], [17, "-", 2], [6, "+", 12], [16, "-", 1],
  ],
  "6": [
    [11, "+", 4], [20, "-", 10], [12, "+", 3], [19, "-", 9], [13, "+", 2],
    [18, "-", 8], [14, "+", 1], [17, "-", 7], [15, "+", 0], [16, "-", 6],
  ],
  "7": [
    [2, "+", 18], [20, "-", 4], [3, "+", 17], [19, "-", 3], [4, "+", 16],
    [18, "-", 2], [5, "+", 15], [17, "-", 1], [6, "+", 14], [16, "-", 0],
  ],
  "8": [
    [1, "+", 19], [20, "-", 3], [2, "+", 18], [19, "-", 2], [3, "+", 17],
    [18, "-", 1], [4, "+", 16], [17, "-", 0], [5, "+", 15], [16, "-", 6],
  ],
  "9": [
    [12, "+", 6], [20, "-", 2], [11, "+", 7], [19, "-", 1], [10, "+", 8],
    [18, "-", 0], [9, "+", 9], [17, "-", 6], [8, "+", 10], [16, "-", 5],
  ],
  "10": [
    [15, "+", 5], [20, "-", 1], [14, "+", 6], [19, "-", 0], [13, "+", 7],
    [18, "-", 6], [12, "+", 8], [17, "-", 5], [11, "+", 9], [16, "-", 4],
  ],
};

export function getAdditionsSoustractions20Serie(id: AdditionSoustraction20SerieId): {
  titre: string;
  questions: AdditionSoustraction20Question[];
} {
  const raw = SERIES[id] ?? SERIES["1"];
  return {
    titre: `Additions/Soustractions 20 - ${id}`,
    questions: raw.map(([a, op, b], i) => ({
      id: String(i + 1),
      a,
      op,
      b,
      result: op === "+" ? a + b : a - b,
    })),
  };
}
