export const ATTENDUS_COMPORTEMENT = [
  { id: "ordonne", texte: "Je suis ordonné.", icone: "/comportement/icon-1.png" },
  { id: "temps", texte: "Je travaille dans le temps accordé.", icone: "/comportement/icon-2.png" },
  { id: "applique", texte: "Je m’applique dans mon travail.", icone: "/comportement/icon-3.png" },
  { id: "participe", texte: "Je participe aux activités de la classe.", icone: "/comportement/icon-4.png" },
  {
    id: "exprime",
    texte: "J’ose m’exprimer pour poser une question intéressante et pour donner mon avis.",
    icone: "/comportement/icon-5.png",
  },
  { id: "regles", texte: "Je respecte les règles.", icone: "/comportement/icon-6.png" },
  {
    id: "copains",
    texte: "Je sais jouer et travailler avec les copains.",
    icone: "/comportement/icon-7.png",
  },
  { id: "maison", texte: "Je travaille régulièrement à la maison.", icone: "/comportement/icon-8.png" },
] as const;

export type TeinteComportement = "vert" | "jaune" | "rouge";

export type FeuilleComportement = {
  id: string;
  prenom: string;
  notes: TeinteComportement[];
};

export const TEINTES_COMPORTEMENT: { id: TeinteComportement; label: string; couleur: string }[] = [
  { id: "vert", label: "Sourire", couleur: "#43c46a" },
  { id: "jaune", label: "Neutre", couleur: "#f5c518" },
  { id: "rouge", label: "Pas content", couleur: "#f25d5d" },
];

export function notesComportementVertes(): TeinteComportement[] {
  return ATTENDUS_COMPORTEMENT.map(() => "vert");
}
