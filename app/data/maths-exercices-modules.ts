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
  | "vocabulaire-spatial"
  | "solides"
  | "suite-logique";

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
];

export function getExerciceModulesForPartie(partieId: IdPartieMaths): MathsExerciceModuleDef[] {
  return MATHS_EXERCICES_MODULES.filter((m) => m.partieId === partieId);
}

export function getExerciceModule(id: MathsExerciceModuleId): MathsExerciceModuleDef | undefined {
  return MATHS_EXERCICES_MODULES.find((m) => m.id === id);
}
