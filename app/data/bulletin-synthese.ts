/**
 * Synthèse des points d'évaluations pour le bulletin.
 * Pour l’instant : uniquement les grilles Savoir-parler encodées par l’enseignant
 * (poésie et présentation). Pas de phono, pas de tests papier, pas de dictées,
 * pas d’exercices faits à la maison.
 * P1 = août, sept, oct — P2 = nov, déc, jan, fév — P3 = mars, avr, mai, juin.
 */

import type { ResultatRow } from "./resultats-storage";

const PARLER_IDS = new Set([
  "savoir-parler-poesie",
  "savoir-parler-famille",
  "savoir-parler-doudou",
]);

/** Uniquement poésie et présentation Savoir-parler. Jamais la phono ni les tests papier. */
export function isTeacherEncodedResultat(r: ResultatRow): boolean {
  const sonId = (r.son_id ?? "").toLowerCase();
  const niveauId = (r.niveau_id ?? "").toLowerCase();
  return PARLER_IDS.has(sonId) || PARLER_IDS.has(niveauId);
}

export type BulletinCategorieId =
  | "francais-lire"
  | "francais-ecrire"
  | "francais-ecouter"
  | "francais-parler"
  | "maths-arithmetique"
  | "maths-grandeur"
  | "maths-espace-geo"
  | "maths-traitement-donnees"
  | "eveil";

export type PeriodId = "P1" | "P2" | "P3";

export const BULLETIN_SYNTHESE_CATEGORIES: {
  id: BulletinCategorieId;
  label: string;
  maxPoints: number;
}[] = [
  { id: "francais-lire", label: "Français : lire", maxPoints: 40 },
  { id: "francais-ecrire", label: "Français : écrire", maxPoints: 40 },
  { id: "francais-ecouter", label: "Français : écouter", maxPoints: 10 },
  { id: "francais-parler", label: "Français : parler", maxPoints: 10 },
  { id: "maths-arithmetique", label: "Math : arithmétique", maxPoints: 40 },
  { id: "maths-grandeur", label: "Math : grandeurs", maxPoints: 20 },
  { id: "maths-espace-geo", label: "Math : espace/géométrie", maxPoints: 20 },
  { id: "maths-traitement-donnees", label: "Math : traitement de données", maxPoints: 20 },
  { id: "eveil", label: "Éveil", maxPoints: 20 },
];

/** Mois (1–12) -> P1, P2 ou P3. Année scolaire : P1 = 8,9,10 ; P2 = 11,12,1,2 ; P3 = 3,4,5,6 */
export function getPeriodFromDate(createdAt: string | undefined): PeriodId {
  if (!createdAt) return "P1";
  const d = new Date(createdAt);
  const month = d.getMonth() + 1; // 1–12
  if ([8, 9, 10].includes(month)) return "P1";
  if ([11, 12, 1, 2].includes(month)) return "P2";
  if ([3, 4, 5, 6].includes(month)) return "P3";
  return "P1"; // juillet = P1 par défaut
}

export type SynthesePeriod = { points: number; pointsMax: number };
export type SyntheseCategorie = Record<PeriodId, SynthesePeriod>;
export type SyntheseBulletin = Record<BulletinCategorieId, SyntheseCategorie>;

function emptySynthese(): SyntheseBulletin {
  const out = {} as SyntheseBulletin;
  for (const cat of BULLETIN_SYNTHESE_CATEGORIES) {
    out[cat.id] = { P1: { points: 0, pointsMax: 0 }, P2: { points: 0, pointsMax: 0 }, P3: { points: 0, pointsMax: 0 } };
  }
  return out;
}

/** Construit la synthèse bulletin pour un élève.
 * Pour l’instant : seulement Savoir-parler (poésie / présentation),
 * toujours en Français parler — jamais en lecture / phono / autre matière. */
export function computeSyntheseBulletin(resultats: ResultatRow[]): SyntheseBulletin {
  const synthese = emptySynthese();
  for (const r of resultats.filter(isTeacherEncodedResultat)) {
    const period = getPeriodFromDate(r.created_at);
    const points = r.points ?? 0;
    const pointsMax = Math.max(1, r.points_max ?? 10);
    synthese["francais-parler"][period].points += points;
    synthese["francais-parler"][period].pointsMax += pointsMax;
  }
  return synthese;
}

/** Pour affichage : note ramenée au barème (ex. 32/40). Arrondi à l'entier. */
export function formatNoteSurBarème(
  periodData: SynthesePeriod,
  maxPoints: number
): string {
  if (periodData.pointsMax <= 0) return "—";
  const note = Math.round((periodData.points / periodData.pointsMax) * maxPoints);
  return `${Math.min(note, maxPoints)} / ${maxPoints}`;
}
