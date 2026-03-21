/**
 * Évaluation "Consignes 1" — 10 exercices (écrire, entourer, dessiner, barrer, colorier, encadrer, souligner, recopier, cocher, croix).
 */

export const TITRE_CONSIGNES_1 = "Consignes 1";

export type ConsigneEcrisMot = {
  type: "ecris_mot";
  consigne: string;
  mot: string;
  lignes: number;
};

export type ConsigneEntoureMot = {
  type: "entoure_mot";
  consigne: string;
  mots: string[];
  correctIndex: number;
};

export type ConsigneDessine = {
  type: "dessine";
  consigne: string;
};

export type ConsigneBarre = {
  type: "barre";
  consigne: string;
  items: { label: string; emoji: string; barrer: boolean }[];
};

export type ConsigneColorieDernier = {
  type: "colorie_dernier";
  consigne: string;
  count: number;
  emoji: string;
};

export type ConsigneEncadre = {
  type: "encadre";
  consigne: string;
  emoji: string;
};

export type ConsigneSoulignePrenom = {
  type: "souligne_prenom_fille";
  consigne: string;
  noms: string[];
  correctIndex: number;
};

export type ConsigneRecopieMot = {
  type: "recopie_mot";
  consigne: string;
  mot: string;
  lignes: number;
};

export type ConsigneCoche = {
  type: "coche";
  consigne: string;
  options: { label: string; emoji: string }[];
  correctIndex: number;
};

export type ConsigneCroixSous = {
  type: "croix_sous";
  consigne: string;
  options: { label: string; emoji: string }[];
  correctIndex: number;
};

export type ItemConsigne =
  | ConsigneEcrisMot
  | ConsigneEntoureMot
  | ConsigneDessine
  | ConsigneBarre
  | ConsigneColorieDernier
  | ConsigneEncadre
  | ConsigneSoulignePrenom
  | ConsigneRecopieMot
  | ConsigneCoche
  | ConsigneCroixSous;

export const ITEMS_CONSIGNES_1: ItemConsigne[] = [
  {
    type: "ecris_mot",
    consigne: "Ecris le mot « papa ».",
    mot: "papa",
    lignes: 3,
  },
  {
    type: "entoure_mot",
    consigne: "Entoure le mot « maman ».",
    mots: ["Marie", "mamy", "marmite", "maman", "malin"],
    correctIndex: 3,
  },
  {
    type: "dessine",
    consigne: "Dessine un soleil.",
  },
  {
    type: "barre",
    consigne: "Barre les champignons.",
    items: [
      { label: "fleur", emoji: "🌸", barrer: false },
      { label: "champignon", emoji: "🍄", barrer: true },
      { label: "fleur", emoji: "🌸", barrer: false },
      { label: "herbe", emoji: "🌿", barrer: false },
    ],
  },
  {
    type: "colorie_dernier",
    consigne: "Colorie le dernier cheval.",
    count: 4,
    emoji: "🐴",
  },
  {
    type: "encadre",
    consigne: "Encadre le chat.",
    emoji: "🐱",
  },
  {
    type: "souligne_prenom_fille",
    consigne: "Souligne le prénom d'une fille.",
    noms: ["Simon", "Lucas", "Marie", "Tom"],
    correctIndex: 2,
  },
  {
    type: "recopie_mot",
    consigne: "Recopie le mot.",
    mot: "ami",
    lignes: 3,
  },
  {
    type: "coche",
    consigne: "Coche la coccinelle.",
    options: [
      { label: "abeille", emoji: "🐝" },
      { label: "coccinelle", emoji: "🐞" },
      { label: "mouche", emoji: "🪰" },
    ],
    correctIndex: 1,
  },
  {
    type: "croix_sous",
    consigne: "Fais une croix sous l'araignée.",
    options: [
      { label: "escargot", emoji: "🐌" },
      { label: "araignée", emoji: "🕷️" },
      { label: "papillon", emoji: "🦋" },
    ],
    correctIndex: 1,
  },
];
