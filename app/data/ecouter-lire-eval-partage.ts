/**
 * Partage des évaluations « Écouter » (section écouter-lire).
 * Table : sons_partages_eval_niveaux — son_id + niveau_id + eleve_id.
 */
export const ECOUTER_LIRE_SON_ID = "ecouter-lire" as const;

export const ECOUTER_EVAL_NIVEAU_CHEVALIER = "ecouter-chevalier-de-la-nuit";
export const ECOUTER_EVAL_NIVEAU_CONSIGNES_1 = "ecouter-consignes-1";

export type EcouterEvalNiveauId =
  | typeof ECOUTER_EVAL_NIVEAU_CHEVALIER
  | typeof ECOUTER_EVAL_NIVEAU_CONSIGNES_1;

export const ECOUTER_EVAL_ROUTES: Record<
  EcouterEvalNiveauId,
  { titre: string; href: string }
> = {
  [ECOUTER_EVAL_NIVEAU_CHEVALIER]: {
    titre: "Le chevalier de la nuit",
    href: "/enfant/ecouter-lire/chevalier-de-la-nuit",
  },
  [ECOUTER_EVAL_NIVEAU_CONSIGNES_1]: {
    titre: "Consignes 1",
    href: "/enfant/ecouter-lire/consignes-1",
  },
};

export function isEcouterEvalNiveauId(id: string): id is EcouterEvalNiveauId {
  return id in ECOUTER_EVAL_ROUTES;
}
