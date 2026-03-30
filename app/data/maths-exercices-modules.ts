/**
 * Exercices interactifs de l'arbre des maths (hors thèmes « nombres » avec feuilles).
 * Chaque module peut être partagé ou non avec les enfants (voir maths-partages).
 *
 * Nouvelle évaluation / module : checklist dans docs/PARTAGE-EVALUATIONS.md
 * (PartageMathsModuleForm, table maths_exercices_modules_partages, page enfant).
 */

import type { IdPartieMaths } from "./maths-data";

export type MathsExerciceModuleId =
  | "centimetre-metre"
  | "euros-monnaie"
  | "jours-semaine"
  | "instruments-mesure"
  | "vocabulaire-spatial"
  | "solides"
  | "suite-logique"
  | "quadrilateres";

export type MathsExerciceModuleDef = {
  id: MathsExerciceModuleId;
  titre: string;
  description: string;
  partieId: IdPartieMaths;
  hrefEnfant: string;
  hrefEnseignant: string;
};

export const MATHS_EXERCICES_MODULES: MathsExerciceModuleDef[] = [
  {
    id: "centimetre-metre",
    titre: "Centimètre ou mètre",
    description: "20 questions : choisir l’unité adaptée (cm ou m).",
    partieId: "grandeur",
    hrefEnfant: "/enfant/maths/centimetre-metre",
    hrefEnseignant: "/enseignant/maths/centimetre-metre",
  },
  {
    id: "euros-monnaie",
    titre: "Compter les euros",
    description: "20 questions : pièces 1 € et 2 €, billets 5 € et 10 € — total entre 1 et 20 €.",
    partieId: "grandeur",
    hrefEnfant: "/enfant/maths/euros-monnaie",
    hrefEnseignant: "/enseignant/maths/euros-monnaie",
  },
  {
    id: "jours-semaine",
    titre: "Les jours de la semaine",
    description: "7 jours mélangés : écrire le numéro (lundi = 1 … dimanche = 7).",
    partieId: "grandeur",
    hrefEnfant: "/enfant/maths/jours-semaine",
    hrefEnseignant: "/enseignant/maths/jours-semaine",
  },
  {
    id: "instruments-mesure",
    titre: "Les instruments de mesure",
    description: "21 images : choisir le type de mesure (temps, masse, longueurs, capacité, prix, température).",
    partieId: "grandeur",
    hrefEnfant: "/enfant/maths/instruments-mesure",
    hrefEnseignant: "/enseignant/maths/instruments-mesure",
  },
  {
    id: "vocabulaire-spatial",
    titre: "Vocabulaire spatial",
    description: "14 phrases : au-dessus, à côté, dans, entre…",
    partieId: "solide-figure",
    hrefEnfant: "/enfant/maths/vocabulaire-spatial",
    hrefEnseignant: "/enseignant/maths/vocabulaire-spatial",
  },
  {
    id: "solides",
    titre: "Solides",
    description: "Relier des objets aux solides, puis Vrai / Faux.",
    partieId: "solide-figure",
    hrefEnfant: "/enfant/maths/solides",
    hrefEnseignant: "/enseignant/maths/solides",
  },
  {
    id: "suite-logique",
    titre: "Suite logique",
    description: "Suites de formes, glaces, rectangles, cercles, smileys…",
    partieId: "traitement-donnees",
    hrefEnfant: "/enfant/maths/suite-logique",
    hrefEnseignant: "/enseignant/maths/suite-logique",
  },
  {
    id: "quadrilateres",
    titre: "Quadrilatères",
    description: "Ecris le bon nombre : carré=1, rectangle=2, triangle=3, disque=4. 10 formes.",
    partieId: "solide-figure",
    hrefEnfant: "/enfant/maths/quadrilateres",
    hrefEnseignant: "/enseignant/maths/quadrilateres",
  },
];

export function getExerciceModulesForPartie(partieId: IdPartieMaths): MathsExerciceModuleDef[] {
  return MATHS_EXERCICES_MODULES.filter((m) => m.partieId === partieId);
}

export function getExerciceModule(id: MathsExerciceModuleId): MathsExerciceModuleDef | undefined {
  return MATHS_EXERCICES_MODULES.find((m) => m.id === id);
}
