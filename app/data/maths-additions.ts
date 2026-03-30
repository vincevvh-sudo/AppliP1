/**
 * Additions jusque 10 : 10 séries de 10 calculs.
 * Toutes les réponses restent <= 10.
 */

export const TITRE_ADDITIONS_JUSQUE_10 = "Additions jusque 10";

export type AdditionQuestion = {
  id: string;
  a: number;
  b: number;
  result: number;
};

export type AdditionSerieId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

const S1: AdditionQuestion[] = [
  { id: "1", a: 0, b: 1, result: 1 },
  { id: "2", a: 1, b: 1, result: 2 },
  { id: "3", a: 1, b: 2, result: 3 },
  { id: "4", a: 2, b: 1, result: 3 },
  { id: "5", a: 2, b: 2, result: 4 },
  { id: "6", a: 3, b: 1, result: 4 },
  { id: "7", a: 3, b: 2, result: 5 },
  { id: "8", a: 4, b: 1, result: 5 },
  { id: "9", a: 4, b: 2, result: 6 },
  { id: "10", a: 5, b: 1, result: 6 },
];

const S2: AdditionQuestion[] = [
  { id: "1", a: 2, b: 3, result: 5 },
  { id: "2", a: 1, b: 4, result: 5 },
  { id: "3", a: 3, b: 3, result: 6 },
  { id: "4", a: 2, b: 4, result: 6 },
  { id: "5", a: 4, b: 3, result: 7 },
  { id: "6", a: 5, b: 2, result: 7 },
  { id: "7", a: 4, b: 4, result: 8 },
  { id: "8", a: 5, b: 3, result: 8 },
  { id: "9", a: 6, b: 2, result: 8 },
  { id: "10", a: 6, b: 3, result: 9 },
];

const S3: AdditionQuestion[] = [
  { id: "1", a: 7, b: 0, result: 7 },
  { id: "2", a: 6, b: 1, result: 7 },
  { id: "3", a: 7, b: 1, result: 8 },
  { id: "4", a: 8, b: 0, result: 8 },
  { id: "5", a: 7, b: 2, result: 9 },
  { id: "6", a: 8, b: 1, result: 9 },
  { id: "7", a: 9, b: 0, result: 9 },
  { id: "8", a: 8, b: 2, result: 10 },
  { id: "9", a: 9, b: 1, result: 10 },
  { id: "10", a: 6, b: 4, result: 10 },
];

const S4: AdditionQuestion[] = [
  { id: "1", a: 0, b: 5, result: 5 },
  { id: "2", a: 0, b: 6, result: 6 },
  { id: "3", a: 0, b: 7, result: 7 },
  { id: "4", a: 0, b: 8, result: 8 },
  { id: "5", a: 0, b: 9, result: 9 },
  { id: "6", a: 0, b: 10, result: 10 },
  { id: "7", a: 1, b: 6, result: 7 },
  { id: "8", a: 1, b: 7, result: 8 },
  { id: "9", a: 1, b: 8, result: 9 },
  { id: "10", a: 1, b: 9, result: 10 },
];

const S5: AdditionQuestion[] = [
  { id: "1", a: 2, b: 5, result: 7 },
  { id: "2", a: 3, b: 4, result: 7 },
  { id: "3", a: 2, b: 6, result: 8 },
  { id: "4", a: 3, b: 5, result: 8 },
  { id: "5", a: 4, b: 4, result: 8 },
  { id: "6", a: 2, b: 7, result: 9 },
  { id: "7", a: 3, b: 6, result: 9 },
  { id: "8", a: 4, b: 5, result: 9 },
  { id: "9", a: 3, b: 7, result: 10 },
  { id: "10", a: 4, b: 6, result: 10 },
];

const S6: AdditionQuestion[] = [
  { id: "1", a: 5, b: 0, result: 5 },
  { id: "2", a: 5, b: 1, result: 6 },
  { id: "3", a: 5, b: 2, result: 7 },
  { id: "4", a: 5, b: 3, result: 8 },
  { id: "5", a: 5, b: 4, result: 9 },
  { id: "6", a: 5, b: 5, result: 10 },
  { id: "7", a: 6, b: 0, result: 6 },
  { id: "8", a: 6, b: 1, result: 7 },
  { id: "9", a: 6, b: 2, result: 8 },
  { id: "10", a: 6, b: 3, result: 9 },
];

const S7: AdditionQuestion[] = [
  { id: "1", a: 7, b: 3, result: 10 },
  { id: "2", a: 7, b: 2, result: 9 },
  { id: "3", a: 7, b: 1, result: 8 },
  { id: "4", a: 7, b: 0, result: 7 },
  { id: "5", a: 8, b: 2, result: 10 },
  { id: "6", a: 8, b: 1, result: 9 },
  { id: "7", a: 8, b: 0, result: 8 },
  { id: "8", a: 9, b: 1, result: 10 },
  { id: "9", a: 9, b: 0, result: 9 },
  { id: "10", a: 10, b: 0, result: 10 },
];

const S8: AdditionQuestion[] = [
  { id: "1", a: 2, b: 8, result: 10 },
  { id: "2", a: 8, b: 2, result: 10 },
  { id: "3", a: 1, b: 9, result: 10 },
  { id: "4", a: 9, b: 1, result: 10 },
  { id: "5", a: 3, b: 7, result: 10 },
  { id: "6", a: 7, b: 3, result: 10 },
  { id: "7", a: 4, b: 6, result: 10 },
  { id: "8", a: 6, b: 4, result: 10 },
  { id: "9", a: 5, b: 5, result: 10 },
  { id: "10", a: 0, b: 10, result: 10 },
];

const S9: AdditionQuestion[] = [
  { id: "1", a: 3, b: 2, result: 5 },
  { id: "2", a: 4, b: 2, result: 6 },
  { id: "3", a: 5, b: 2, result: 7 },
  { id: "4", a: 6, b: 2, result: 8 },
  { id: "5", a: 7, b: 2, result: 9 },
  { id: "6", a: 8, b: 2, result: 10 },
  { id: "7", a: 3, b: 3, result: 6 },
  { id: "8", a: 4, b: 3, result: 7 },
  { id: "9", a: 5, b: 3, result: 8 },
  { id: "10", a: 6, b: 3, result: 9 },
];

const S10: AdditionQuestion[] = [
  { id: "1", a: 4, b: 1, result: 5 },
  { id: "2", a: 4, b: 4, result: 8 },
  { id: "3", a: 2, b: 2, result: 4 },
  { id: "4", a: 7, b: 1, result: 8 },
  { id: "5", a: 1, b: 6, result: 7 },
  { id: "6", a: 3, b: 5, result: 8 },
  { id: "7", a: 2, b: 7, result: 9 },
  { id: "8", a: 5, b: 4, result: 9 },
  { id: "9", a: 6, b: 4, result: 10 },
  { id: "10", a: 8, b: 1, result: 9 },
];

export function getAdditionsSerie(id: AdditionSerieId): {
  titre: string;
  questions: AdditionQuestion[];
} {
  switch (id) {
    case "1":
      return { titre: "Additions 1", questions: S1 };
    case "2":
      return { titre: "Additions 2", questions: S2 };
    case "3":
      return { titre: "Additions 3", questions: S3 };
    case "4":
      return { titre: "Additions 4", questions: S4 };
    case "5":
      return { titre: "Additions 5", questions: S5 };
    case "6":
      return { titre: "Additions 6", questions: S6 };
    case "7":
      return { titre: "Additions 7", questions: S7 };
    case "8":
      return { titre: "Additions 8", questions: S8 };
    case "9":
      return { titre: "Additions 9", questions: S9 };
    case "10":
      return { titre: "Additions 10", questions: S10 };
    default:
      return { titre: "Additions 1", questions: S1 };
  }
}
