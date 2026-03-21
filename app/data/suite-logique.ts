/**
 * Test "Suite logique" — Traitement de données (Arbre des maths).
 * Une ligne de formes/symboles, l'enfant clique sur la forme qui continue la suite.
 */

export const TITRE_SUITE_LOGIQUE = "Suite logique";

export type ShapeId =
  | "star"
  | "square"
  | "circle"
  | "triangle"
  | "arrowUp"
  | "arrowDown"
  | "arrowLeft"
  | "diamond"
  | "oval"
  | "rectVert"
  | "plus";

export type QuestionFormes = {
  type: "formes";
  sequence: ShapeId[];
  options: [ShapeId, ShapeId];
  correctIndex: 0 | 1;
};

/** Groupe de 3 glaces (variant A, B ou C pour les suites). */
export type QuestionGlaces = {
  type: "glaces";
  /** Séquence de groupes (A, B, A, B, A = indices 0,1,0,1,0). */
  sequence: number[];
  /** Index du bon groupe parmi les 3 options (0, 1 ou 2). */
  correctIndex: number;
};

/** Rectangle avec boule : position de la boule. */
export type QuestionRectangle = {
  type: "rectangle";
  /** 0 = bas gauche (bonne réponse), 1 = haut droite */
  correctIndex: 0 | 1;
};

/** Cercle : avec ou sans lignes. */
export type QuestionCercle = {
  type: "cercle";
  /** 0 = sans ligne, 1 = avec 4 lignes (bonne réponse) */
  correctIndex: 0 | 1;
};

/** Smiley : sourire vers la gauche ou vers le bas. */
export type QuestionSmiley = {
  type: "smiley";
  /** 0 = sourire vers la gauche, 1 = sourire vers le bas (bonne réponse, comme le premier de la suite) */
  correctIndex: 0 | 1;
};

export type ItemSuiteLogique =
  | QuestionFormes
  | QuestionGlaces
  | QuestionRectangle
  | QuestionCercle
  | QuestionSmiley;

export const ITEMS_SUITE_LOGIQUE: ItemSuiteLogique[] = [
  {
    type: "formes",
    sequence: ["star", "square", "star", "square", "star", "square"],
    options: ["star", "square"],
    correctIndex: 0,
  },
  {
    type: "formes",
    sequence: ["circle", "triangle", "circle", "triangle", "circle", "triangle"],
    options: ["triangle", "circle"],
    correctIndex: 1,
  },
  {
    type: "formes",
    sequence: ["arrowUp", "arrowDown", "arrowUp", "arrowDown", "arrowUp", "arrowDown"],
    options: ["arrowUp", "arrowDown"],
    correctIndex: 0,
  },
  {
    type: "formes",
    sequence: ["diamond", "oval", "diamond", "oval", "diamond", "oval"],
    options: ["oval", "diamond"],
    correctIndex: 0,
  },
  {
    type: "formes",
    sequence: ["rectVert", "plus", "rectVert", "plus", "rectVert", "plus"],
    options: ["square", "rectVert"],
    correctIndex: 1,
  },
  {
    type: "glaces",
    sequence: [0, 1, 0, 1, 0],
    correctIndex: 2,
  },
  {
    type: "glaces",
    sequence: [0, 1, 2, 0, 1],
    correctIndex: 2,
  },
  {
    type: "glaces",
    sequence: [1, 0, 1, 0, 1],
    correctIndex: 1,
  },
  {
    type: "rectangle",
    correctIndex: 0,
  },
  {
    type: "cercle",
    correctIndex: 1,
  },
  {
    type: "smiley",
    correctIndex: 1,
  },
];
