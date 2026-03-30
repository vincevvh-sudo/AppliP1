export type QuadrilateresShape = "carre" | "rectangle" | "triangle" | "disque";

export type QuadrilateresItem = {
  id: string;
  shape: QuadrilateresShape;
  /** Réponse attendue (1..4). */
  correctValue: 1 | 2 | 3 | 4;
};

export const TITRE_QUADRILATERES = "Quadrilatères";

// 10 formes au total (fixes) pour que l’exercice soit identique pour chaque enfant.
export const QUADRILATERES_ITEMS: QuadrilateresItem[] = [
  { id: "q1", shape: "carre", correctValue: 1 },
  { id: "q2", shape: "rectangle", correctValue: 2 },
  { id: "q3", shape: "triangle", correctValue: 3 },
  { id: "q4", shape: "disque", correctValue: 4 },
  { id: "q5", shape: "rectangle", correctValue: 2 },
  { id: "q6", shape: "carre", correctValue: 1 },
  { id: "q7", shape: "triangle", correctValue: 3 },
  { id: "q8", shape: "disque", correctValue: 4 },
  { id: "q9", shape: "rectangle", correctValue: 2 },
  { id: "q10", shape: "carre", correctValue: 1 },
];

