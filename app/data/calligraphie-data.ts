/**
 * Évaluation de calligraphie (période 1, tableau papier).
 * Smileys : 😊 = maximum de la ligne, 😐 = moitié, 😠 = 0.
 * Total sur 10. N’entre pas dans la synthèse du bulletin.
 */

export const SON_ID_CALLIGRAPHIE = "eval-calligraphie";
export const NIVEAU_ID_CALLIGRAPHIE = "eval-calligraphie";
export const DETAIL_TYPE_TITRE_CALLIGRAPHIE = "titre-calligraphie";
export const DETAIL_TYPE_CRITERE_CALLIGRAPHIE = "critere-calligraphie";

export type CritereCalligraphie = {
  titre: string;
  pointsMax: number;
};

export const CRITERES_CALLIGRAPHIE: readonly CritereCalligraphie[] = [
  { titre: "Je tiens correctement mon crayon.", pointsMax: 1 },
  { titre: "Je pose mon poignet sous la ligne d’écriture.", pointsMax: 1 },
  { titre: "J’écris entre les lignes.", pointsMax: 2 },
  { titre: "Je gère l’espace de ma feuille.", pointsMax: 1 },
  { titre: "J’écris en exerçant une pression correcte sur mon crayon.", pointsMax: 1 },
  { titre: "J’écris mes lettres dans le bon sens d’écriture.", pointsMax: 1 },
  { titre: "J’écris en respectant la hauteur des lettres.", pointsMax: 1 },
  { titre: "Mon enseignant reconnaît la lettre.", pointsMax: 1 },
  { titre: "J’ai rendu un travail soigneux.", pointsMax: 1 },
];

export const CALLIGRAPHIE_POINTS_MAX = CRITERES_CALLIGRAPHIE.reduce(
  (acc, c) => acc + c.pointsMax,
  0
);

/** 😊 = max, 😐 = moitié, 😠 = 0 */
export function faceToCalligraphiePoints(faceIndex: number, pointsMax: number): number {
  if (faceIndex === 0) return pointsMax;
  if (faceIndex === 1) return pointsMax / 2;
  return 0;
}

export function calligraphiePointsToFace(points: number, pointsMax: number): number {
  if (points >= pointsMax) return 0;
  if (points > 0) return 1;
  return 2;
}

export function formatPointsCalligraphie(n: number): string {
  if (Number.isInteger(n)) return String(n);
  if (Math.abs(n - 0.5) < 0.001) return "½";
  if (Math.abs(n % 1 - 0.5) < 0.001) return `${Math.floor(n)}½`;
  return String(n).replace(".", ",");
}

export function sommePointsCalligraphie(points: (number | null)[]): number {
  return points.reduce<number>((acc, p) => acc + (p ?? 0), 0);
}
