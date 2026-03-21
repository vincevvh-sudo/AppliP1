/**
 * Arbre des mathématiques : 4 parties (Arithmétique, Grandeur, Espace/géométrie, Traitement de données).
 * Sous "Arithmétique" : Les nombres de 1 à 5 → Exercices (4 feuilles) et Évaluations, partageables aux enfants.
 */

export type IdPartieMaths = "nombres" | "grandeur" | "solide-figure" | "traitement-donnees";

export type PartieMaths = {
  id: IdPartieMaths;
  titre: string;
  /** Thèmes ou sous-parties (ex. "nombres-1-5" sous Nombres). */
  themes: { id: string; titre: string }[];
};

export const PARTIES_MATHS: PartieMaths[] = [
  {
    id: "nombres",
    titre: "Arithmétique",
    themes: [
      { id: "1-5", titre: "Les nombres de 1 à 5" },
      { id: "6-10", titre: "Les nombres de 6 à 10" },
    ],
  },
  {
    id: "grandeur",
    titre: "Grandeur",
    themes: [],
  },
  {
    id: "solide-figure",
    titre: "Espace/géométrie",
    themes: [],
  },
  {
    id: "traitement-donnees",
    titre: "Traitement de données",
    themes: [],
  },
];

/** 4 feuilles d'exercices pour "Les nombres de 1 à 5" (une partie par feuille). */
export const FEUILLES_NOMBRES_1_5 = [
  {
    id: "feuille-1",
    titre: "Feuille 1",
    description: "Relier chaque collection à son étiquette · Dessiner les billes dans chaque sac · Barrer les objets en trop · Compléter les jetons manquants (ten-frames).",
  },
  {
    id: "feuille-2",
    titre: "Feuille 2",
    description: "Repasser les chiffres (0 à 5) · Compter et entourer le nombre (mains) · Grouper par trois · Coller les gommettes.",
  },
  {
    id: "feuille-3",
    titre: "Feuille 3",
    description: "Écrire la suite des nombres de 0 à 5 · Dessiner des pommes dans chaque panier · Colorier le nombre d'objets · Barrer les billes en trop.",
  },
  {
    id: "feuille-4",
    titre: "Feuille 4",
    description: "Écrire le nombre indiqué par chaque face du dé · Colorier le nombre de cases · Compter le nombre de fruits.",
  },
] as const;

export type IdFeuilleNombres15 = (typeof FEUILLES_NOMBRES_1_5)[number]["id"];

/** 5 feuilles d'exercices pour "Les nombres de 6 à 10" (même structure que 1-5, nombres 6 à 10). */
export const FEUILLES_NOMBRES_6_10 = [
  {
    id: "feuille-1",
    titre: "Feuille 1",
    description: "Relier chaque collection à son étiquette (6 à 10) · Dessiner les billes dans chaque sac · Barrer les objets en trop · Compléter les jetons manquants (ten-frames).",
  },
  {
    id: "feuille-2",
    titre: "Feuille 2",
    description: "Chiffres 6 à 10 · Compter et entourer le nombre · Grouper par trois · Coller les gommettes (6 à 10).",
  },
  {
    id: "feuille-3",
    titre: "Feuille 3",
    description: "Écrire la suite des nombres de 6 à 10 · Dessiner des pommes dans chaque panier · Colorier le nombre d'objets · Barrer les billes en trop.",
  },
  {
    id: "feuille-4",
    titre: "Feuille 4",
    description: "Écrire le nombre (6 à 10) · Colorier le nombre de cases · Compter le nombre de fruits.",
  },
  {
    id: "feuille-5",
    titre: "Feuille 5",
    description:
      "Écrire le nombre avant et après (6 à 9) · Choisir la part du gâteau avec le plus grand nombre · Ranger des nombres de 4 à 10 du plus petit au plus grand · Compléter la suite de perles de 1 à 10.",
  },
] as const;
