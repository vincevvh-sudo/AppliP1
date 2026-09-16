/**
 * Évaluations « Parler » (poésie, présentation, doudou).
 * Chaque critère est noté 0, 1 ou 2 sur 2 ; la cote finale est sur 10 (normalisée).
 * Les identifiants son_id / niveau_id restent « savoir-parler-* » pour compatibilité Supabase.
 */

export const CRITERES_POESIE = [
  "Je connais mon texte.",
  "Je parle suffisamment fort.",
  "J’articule lorsque je parle.",
  "Je parle à une vitesse permettant la compréhension du message.",
  "Ma posture est adaptée.",
  "Je regarde les personnes qui écoutent mon message.",
] as const;

export const CRITERES_FAMILLE = [
  "Je sais à qui je parle.",
  "Je sais pourquoi je parle.",
  "Je sais de quoi je parle.",
  "Je m’adapte à mon interlocuteur (enfant, adolescent, adulte).",
  "Je parle suffisamment fort.",
  "J’articule lorsque je parle.",
  "Je parle à une vitesse permettant la compréhension du message.",
  "Ma posture est adaptée.",
  "Je regarde les personnes qui écoutent mon message.",
] as const;

/** Présentation de mon doudou (8 critères). */
export const CRITERES_DOUDOU = [
  "Je sais à qui je parle.",
  "Je sais de quoi je parle.",
  "Je m’adapte à mon interlocuteur (enfant, adolescent, adulte).",
  "Je parle suffisamment fort.",
  "J’articule lorsque je parle.",
  "Je parle à une vitesse permettant la compréhension du message.",
  "Ma posture est adaptée.",
  "Je regarde les personnes qui écoutent mon message.",
] as const;

export type ParlerKind = "poesie" | "famille" | "doudou";

/** Inchangés pour les lignes déjà en base (exercice_resultats). */
export const SON_ID_PARLER_POESIE = "savoir-parler-poesie";
export const SON_ID_PARLER_FAMILLE = "savoir-parler-famille";
export const SON_ID_PARLER_DOUDOU = "savoir-parler-doudou";

export const NIVEAU_ID_POESIE = "savoir-parler-poesie";
export const NIVEAU_ID_FAMILLE = "savoir-parler-famille";
export const NIVEAU_ID_DOUDOU = "savoir-parler-doudou";

/** Type dans detail_exercices pour le titre de la poésie. */
export const DETAIL_TYPE_TITRE_POESIE = "titre-poesie";
/** Type dans detail_exercices pour le sujet de la présentation. */
export const DETAIL_TYPE_TITRE_PRESENTATION = "titre-presentation";
/** Type dans detail_exercices pour la présentation du doudou. */
export const DETAIL_TYPE_TITRE_DOUDOU = "titre-doudou";

export const MAX_BRUT_POESIE = CRITERES_POESIE.length * 2;
export const MAX_BRUT_FAMILLE = CRITERES_FAMILLE.length * 2;
export const MAX_BRUT_DOUDOU = CRITERES_DOUDOU.length * 2;

export function getParlerSonId(kind: ParlerKind): string {
  if (kind === "poesie") return SON_ID_PARLER_POESIE;
  if (kind === "doudou") return SON_ID_PARLER_DOUDOU;
  return SON_ID_PARLER_FAMILLE;
}

export function getParlerNiveauId(kind: ParlerKind): string {
  if (kind === "poesie") return NIVEAU_ID_POESIE;
  if (kind === "doudou") return NIVEAU_ID_DOUDOU;
  return NIVEAU_ID_FAMILLE;
}

export function getParlerMaxBrut(kind: ParlerKind): number {
  if (kind === "poesie") return MAX_BRUT_POESIE;
  if (kind === "doudou") return MAX_BRUT_DOUDOU;
  return MAX_BRUT_FAMILLE;
}

export function getParlerDetailTitreType(kind: ParlerKind): string {
  if (kind === "poesie") return DETAIL_TYPE_TITRE_POESIE;
  if (kind === "doudou") return DETAIL_TYPE_TITRE_DOUDOU;
  return DETAIL_TYPE_TITRE_PRESENTATION;
}

/** Points obtenus sur le total brut (chaque critère 0–2). */
export function sommePointsBruts(points: (number | null)[]): number {
  return points.reduce<number>((acc, p) => {
    if (p == null) return acc;
    return acc + Math.min(2, Math.max(0, p));
  }, 0);
}

/** Cote sur 10 à partir de la somme brute et du maximum possible. */
export function scoreSur10DepuisBrut(somme: number, maxBrut: number): number {
  if (maxBrut <= 0) return 0;
  return Math.round((somme / maxBrut) * 10);
}
