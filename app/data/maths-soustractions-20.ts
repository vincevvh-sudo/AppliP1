/**
 * Soustractions jusque 20 : 5 séries de 10 calculs.
 * Chaque calcul commence à 20 ou un nombre entre 10 et 20,
 * et la réponse reste entre 10 et 20.
 */

export const TITRE_SOUSTRACTIONS_JUSQUE_20 = "Soustraction jusque 20";

export type Soustraction20Question = {
  id: string;
  a: number;
  b: number;
  result: number;
};

export type Soustraction20SerieId = "1" | "2" | "3" | "4" | "5";

const SERIES: Record<Soustraction20SerieId, Array<[number, number]>> = {
  "1": [
    [20, 1], [19, 1], [18, 1], [17, 1], [16, 1],
    [20, 2], [19, 2], [18, 2], [17, 2], [16, 2],
  ],
  "2": [
    [20, 3], [19, 3], [18, 3], [17, 3], [16, 3],
    [15, 2], [14, 2], [13, 2], [12, 1], [11, 1],
  ],
  "3": [
    [20, 4], [19, 4], [18, 4], [17, 4], [16, 4],
    [15, 3], [14, 3], [13, 3], [12, 2], [11, 1],
  ],
  "4": [
    [20, 5], [19, 5], [18, 5], [17, 5], [16, 5],
    [15, 4], [14, 4], [13, 3], [12, 2], [11, 1],
  ],
  "5": [
    [20, 10], [19, 9], [18, 8], [17, 7], [16, 6],
    [15, 5], [14, 4], [13, 3], [12, 2], [11, 1],
  ],
};

export function getSoustraction20Serie(id: Soustraction20SerieId): {
  titre: string;
  questions: Soustraction20Question[];
} {
  const pairs = SERIES[id] ?? SERIES["1"];
  return {
    titre: `Soustractions 20 - ${id}`,
    questions: pairs.map(([a, b], i) => ({
      id: String(i + 1),
      a,
      b,
      result: a - b,
    })),
  };
}
