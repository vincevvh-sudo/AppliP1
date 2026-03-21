/**
 * Évaluations "Opérations" : petites additions à une ou deux séries.
 */

export const TITRE_OPERATIONS = "Opérations";

export type OperationQuestion = {
  id: string;
  a: number;
  b: number;
  /**
   * Résultat attendu. Par défaut, l'élève doit trouver ce résultat.
   * Pour les séries 9 et 10 (compléter le second terme), on utilise result comme "total"
   * et on marque mode: "missingSecond".
   */
  result: number;
  mode?: "missingResult" | "missingSecond";
  /** Type d'opération : par défaut addition. */
  op?: "+" | "-";
};

export type OperationSerieId =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17";

export const OPERATIONS_SERIE_1: OperationQuestion[] = [
  { id: "1", a: 2, b: 2, result: 4 },
  { id: "2", a: 2, b: 3, result: 5 },
  { id: "3", a: 1, b: 2, result: 3 },
  { id: "4", a: 2, b: 0, result: 2 },
  { id: "5", a: 1, b: 1, result: 2 },
  { id: "6", a: 1, b: 0, result: 1 },
  { id: "7", a: 3, b: 1, result: 4 },
  { id: "8", a: 3, b: 2, result: 5 },
  { id: "9", a: 3, b: 0, result: 3 },
  { id: "10", a: 2, b: 1, result: 3 },
];

export const OPERATIONS_SERIE_2: OperationQuestion[] = [
  { id: "1", a: 4, b: 2, result: 6 },
  { id: "2", a: 1, b: 4, result: 5 },
  { id: "3", a: 2, b: 3, result: 5 },
  { id: "4", a: 2, b: 4, result: 6 },
  { id: "5", a: 5, b: 2, result: 7 },
  { id: "6", a: 4, b: 3, result: 7 },
  { id: "7", a: 5, b: 0, result: 5 },
  { id: "8", a: 3, b: 4, result: 7 },
  { id: "9", a: 0, b: 5, result: 5 },
  { id: "10", a: 1, b: 5, result: 6 },
];

// Opérations 3, 4, 5 : additions avec résultats toujours ≤ 9

// Séries 3, 4, 5 : additions avec résultats mélangés (6, 7, 8 ou 9), toujours < 10.

export const OPERATIONS_SERIE_3: OperationQuestion[] = [
  { id: "1", a: 4, b: 2, result: 6 },
  { id: "2", a: 3, b: 3, result: 6 },
  { id: "3", a: 2, b: 5, result: 7 },
  { id: "4", a: 4, b: 3, result: 7 },
  { id: "5", a: 5, b: 3, result: 8 },
  { id: "6", a: 2, b: 6, result: 8 },
  { id: "7", a: 4, b: 5, result: 9 },
  { id: "8", a: 1, b: 8, result: 9 },
  { id: "9", a: 3, b: 4, result: 7 },
  { id: "10", a: 5, b: 1, result: 6 },
];

export const OPERATIONS_SERIE_4: OperationQuestion[] = [
  { id: "1", a: 6, b: 2, result: 8 },
  { id: "2", a: 7, b: 1, result: 8 },
  { id: "3", a: 5, b: 2, result: 7 },
  { id: "4", a: 3, b: 3, result: 6 },
  { id: "5", a: 4, b: 4, result: 8 },
  { id: "6", a: 2, b: 4, result: 6 },
  { id: "7", a: 5, b: 4, result: 9 },
  { id: "8", a: 3, b: 5, result: 8 },
  { id: "9", a: 1, b: 6, result: 7 },
  { id: "10", a: 0, b: 9, result: 9 },
];

export const OPERATIONS_SERIE_5: OperationQuestion[] = [
  { id: "1", a: 2, b: 4, result: 6 },
  { id: "2", a: 1, b: 5, result: 6 },
  { id: "3", a: 3, b: 4, result: 7 },
  { id: "4", a: 2, b: 6, result: 8 },
  { id: "5", a: 4, b: 5, result: 9 },
  { id: "6", a: 0, b: 7, result: 7 },
  { id: "7", a: 3, b: 5, result: 8 },
  { id: "8", a: 1, b: 8, result: 9 },
  { id: "9", a: 4, b: 2, result: 6 },
  { id: "10", a: 5, b: 3, result: 8 },
];

// Séries 6, 7, 8 : résultats mélangés 6, 7, 8, 9 ou 10 (toujours ≤ 10).

export const OPERATIONS_SERIE_6: OperationQuestion[] = [
  { id: "1", a: 3, b: 3, result: 6 },
  { id: "2", a: 2, b: 4, result: 6 },
  { id: "3", a: 5, b: 2, result: 7 },
  { id: "4", a: 4, b: 3, result: 7 },
  { id: "5", a: 4, b: 4, result: 8 },
  { id: "6", a: 5, b: 3, result: 8 },
  { id: "7", a: 4, b: 5, result: 9 },
  { id: "8", a: 3, b: 6, result: 9 },
  { id: "9", a: 5, b: 5, result: 10 },
  { id: "10", a: 6, b: 4, result: 10 },
];

export const OPERATIONS_SERIE_7: OperationQuestion[] = [
  { id: "1", a: 1, b: 5, result: 6 },
  { id: "2", a: 2, b: 5, result: 7 },
  { id: "3", a: 3, b: 4, result: 7 },
  { id: "4", a: 2, b: 6, result: 8 },
  { id: "5", a: 1, b: 7, result: 8 },
  { id: "6", a: 4, b: 5, result: 9 },
  { id: "7", a: 3, b: 6, result: 9 },
  { id: "8", a: 4, b: 6, result: 10 },
  { id: "9", a: 2, b: 8, result: 10 },
  { id: "10", a: 5, b: 1, result: 6 },
];

export const OPERATIONS_SERIE_8: OperationQuestion[] = [
  { id: "1", a: 0, b: 6, result: 6 },
  { id: "2", a: 4, b: 2, result: 6 },
  { id: "3", a: 0, b: 7, result: 7 },
  { id: "4", a: 5, b: 2, result: 7 },
  { id: "5", a: 0, b: 8, result: 8 },
  { id: "6", a: 3, b: 5, result: 8 },
  { id: "7", a: 1, b: 8, result: 9 },
  { id: "8", a: 4, b: 5, result: 9 },
  { id: "9", a: 5, b: 5, result: 10 },
  { id: "10", a: 6, b: 4, result: 10 },
];

// Séries 9 et 10 : compléter le second terme (a + ? = total).

export const OPERATIONS_SERIE_9: OperationQuestion[] = [
  { id: "1", a: 5, b: 5, result: 10, mode: "missingSecond" }, // 5 + ? = 10
  { id: "2", a: 4, b: 4, result: 8, mode: "missingSecond" },  // 4 + ? = 8
  { id: "3", a: 3, b: 7, result: 10, mode: "missingSecond" }, // 3 + ? = 10
  { id: "4", a: 2, b: 7, result: 9, mode: "missingSecond" },  // 2 + ? = 9
  { id: "5", a: 6, b: 2, result: 8, mode: "missingSecond" },  // 6 + ? = 8
  { id: "6", a: 7, b: 2, result: 9, mode: "missingSecond" },  // 7 + ? = 9
  { id: "7", a: 1, b: 7, result: 8, mode: "missingSecond" },  // 1 + ? = 8
  { id: "8", a: 0, b: 9, result: 9, mode: "missingSecond" },  // 0 + ? = 9
  { id: "9", a: 2, b: 8, result: 10, mode: "missingSecond" }, // 2 + ? = 10
  { id: "10", a: 5, b: 3, result: 8, mode: "missingSecond" }, // 5 + ? = 8
];

export const OPERATIONS_SERIE_10: OperationQuestion[] = [
  { id: "1", a: 4, b: 2, result: 6, mode: "missingSecond" },  // 4 + ? = 6
  { id: "2", a: 5, b: 1, result: 6, mode: "missingSecond" },  // 5 + ? = 6
  { id: "3", a: 3, b: 4, result: 7, mode: "missingSecond" },  // 3 + ? = 7
  { id: "4", a: 2, b: 5, result: 7, mode: "missingSecond" },  // 2 + ? = 7
  { id: "5", a: 4, b: 4, result: 8, mode: "missingSecond" },  // 4 + ? = 8
  { id: "6", a: 5, b: 3, result: 8, mode: "missingSecond" },  // 5 + ? = 8
  { id: "7", a: 6, b: 3, result: 9, mode: "missingSecond" },  // 6 + ? = 9
  { id: "8", a: 1, b: 8, result: 9, mode: "missingSecond" },  // 1 + ? = 9
  { id: "9", a: 2, b: 8, result: 10, mode: "missingSecond" }, // 2 + ? = 10
  { id: "10", a: 4, b: 6, result: 10, mode: "missingSecond" }, // 4 + ? = 10
];

// Séries 11 et 12 : soustractions simples (a - b = résultat), résultats mélangés 0–10.

export const OPERATIONS_SERIE_11: OperationQuestion[] = [
  { id: "1", a: 5, b: 3, result: 2, op: "-" },
  { id: "2", a: 5, b: 0, result: 5, op: "-" },
  { id: "3", a: 4, b: 3, result: 1, op: "-" },
  { id: "4", a: 3, b: 2, result: 1, op: "-" },
  { id: "5", a: 2, b: 1, result: 1, op: "-" },
  { id: "6", a: 4, b: 4, result: 0, op: "-" },
  { id: "7", a: 3, b: 1, result: 2, op: "-" },
  { id: "8", a: 4, b: 2, result: 2, op: "-" },
  { id: "9", a: 5, b: 1, result: 4, op: "-" },
  { id: "10", a: 3, b: 2, result: 1, op: "-" },
];

export const OPERATIONS_SERIE_12: OperationQuestion[] = [
  { id: "1", a: 8, b: 1, result: 7, op: "-" },
  { id: "2", a: 7, b: 2, result: 5, op: "-" },
  { id: "3", a: 9, b: 3, result: 6, op: "-" },
  { id: "4", a: 7, b: 1, result: 6, op: "-" },
  { id: "5", a: 8, b: 2, result: 6, op: "-" },
  { id: "6", a: 9, b: 4, result: 5, op: "-" },
  { id: "7", a: 7, b: 3, result: 4, op: "-" },
  { id: "8", a: 8, b: 3, result: 5, op: "-" },
  { id: "9", a: 9, b: 2, result: 7, op: "-" },
  { id: "10", a: 9, b: 9, result: 0, op: "-" },
];

// Séries 13, 14, 15 : "10 - … = …" (soustractions à partir de 10).

export const OPERATIONS_SERIE_13: OperationQuestion[] = [
  { id: "1", a: 10, b: 9, result: 1, op: "-" },  // 10 - 9 = 1
  { id: "2", a: 10, b: 8, result: 2, op: "-" },
  { id: "3", a: 10, b: 7, result: 3, op: "-" },
  { id: "4", a: 10, b: 6, result: 4, op: "-" },
  { id: "5", a: 10, b: 5, result: 5, op: "-" },
  { id: "6", a: 10, b: 4, result: 6, op: "-" },
  { id: "7", a: 10, b: 3, result: 7, op: "-" },
  { id: "8", a: 10, b: 2, result: 8, op: "-" },
  { id: "9", a: 10, b: 1, result: 9, op: "-" },
  { id: "10", a: 10, b: 0, result: 10, op: "-" },
];

export const OPERATIONS_SERIE_14: OperationQuestion[] = [
  { id: "1", a: 10, b: 1, result: 9, op: "-" },
  { id: "2", a: 10, b: 4, result: 6, op: "-" },
  { id: "3", a: 10, b: 7, result: 3, op: "-" },
  { id: "4", a: 10, b: 2, result: 8, op: "-" },
  { id: "5", a: 10, b: 5, result: 5, op: "-" },
  { id: "6", a: 10, b: 9, result: 1, op: "-" },
  { id: "7", a: 10, b: 6, result: 4, op: "-" },
  { id: "8", a: 10, b: 3, result: 7, op: "-" },
  { id: "9", a: 10, b: 8, result: 2, op: "-" },
  { id: "10", a: 10, b: 0, result: 10, op: "-" },
];

export const OPERATIONS_SERIE_15: OperationQuestion[] = [
  { id: "1", a: 10, b: 2, result: 8, op: "-" },
  { id: "2", a: 10, b: 5, result: 5, op: "-" },
  { id: "3", a: 10, b: 8, result: 2, op: "-" },
  { id: "4", a: 10, b: 3, result: 7, op: "-" },
  { id: "5", a: 10, b: 7, result: 3, op: "-" },
  { id: "6", a: 10, b: 1, result: 9, op: "-" },
  { id: "7", a: 10, b: 6, result: 4, op: "-" },
  { id: "8", a: 10, b: 9, result: 1, op: "-" },
  { id: "9", a: 10, b: 4, result: 6, op: "-" },
  { id: "10", a: 10, b: 0, result: 10, op: "-" },
];

// Séries 16 et 17 : "10 + …" (additions à partir de 10).

export const OPERATIONS_SERIE_16: OperationQuestion[] = [
  { id: "1", a: 10, b: 1, result: 11, op: "+" },
  { id: "2", a: 10, b: 2, result: 12, op: "+" },
  { id: "3", a: 10, b: 3, result: 13, op: "+" },
  { id: "4", a: 10, b: 4, result: 14, op: "+" },
  { id: "5", a: 10, b: 5, result: 15, op: "+" },
  { id: "6", a: 10, b: 6, result: 16, op: "+" },
  { id: "7", a: 10, b: 7, result: 17, op: "+" },
  { id: "8", a: 10, b: 8, result: 18, op: "+" },
  { id: "9", a: 10, b: 9, result: 19, op: "+" },
  { id: "10", a: 10, b: 10, result: 20, op: "+" },
];

export const OPERATIONS_SERIE_17: OperationQuestion[] = [
  { id: "1", a: 10, b: 5, result: 15, op: "+" },
  { id: "2", a: 10, b: 1, result: 11, op: "+" },
  { id: "3", a: 10, b: 8, result: 18, op: "+" },
  { id: "4", a: 10, b: 3, result: 13, op: "+" },
  { id: "5", a: 10, b: 7, result: 17, op: "+" },
  { id: "6", a: 10, b: 2, result: 12, op: "+" },
  { id: "7", a: 10, b: 9, result: 19, op: "+" },
  { id: "8", a: 10, b: 4, result: 14, op: "+" },
  { id: "9", a: 10, b: 6, result: 16, op: "+" },
  { id: "10", a: 10, b: 10, result: 20, op: "+" },
];

export function getOperationsSerie(id: OperationSerieId): {
  titre: string;
  questions: OperationQuestion[];
} {
  switch (id) {
    case "1":
      return { titre: "Opérations 1", questions: OPERATIONS_SERIE_1 };
    case "2":
      return { titre: "Opérations 2", questions: OPERATIONS_SERIE_2 };
    case "3":
      return { titre: "Opérations 3", questions: OPERATIONS_SERIE_3 };
    case "4":
      return { titre: "Opérations 4", questions: OPERATIONS_SERIE_4 };
    case "5":
      return { titre: "Opérations 5", questions: OPERATIONS_SERIE_5 };
    case "6":
      return { titre: "Opérations 6", questions: OPERATIONS_SERIE_6 };
    case "7":
      return { titre: "Opérations 7", questions: OPERATIONS_SERIE_7 };
    case "8":
      return { titre: "Opérations 8", questions: OPERATIONS_SERIE_8 };
    case "9":
      return { titre: "Opérations 9", questions: OPERATIONS_SERIE_9 };
    case "10":
      return { titre: "Opérations 10", questions: OPERATIONS_SERIE_10 };
    case "11":
      return { titre: "Opérations 11", questions: OPERATIONS_SERIE_11 };
    case "12":
      return { titre: "Opérations 12", questions: OPERATIONS_SERIE_12 };
    case "13":
      return { titre: "Opérations 13", questions: OPERATIONS_SERIE_13 };
    case "14":
      return { titre: "Opérations 14", questions: OPERATIONS_SERIE_14 };
    case "15":
      return { titre: "Opérations 15", questions: OPERATIONS_SERIE_15 };
    case "16":
      return { titre: "Opérations 16", questions: OPERATIONS_SERIE_16 };
    case "17":
      return { titre: "Opérations 17", questions: OPERATIONS_SERIE_17 };
    default:
      return { titre: "Opérations 1", questions: OPERATIONS_SERIE_1 };
  }
}

