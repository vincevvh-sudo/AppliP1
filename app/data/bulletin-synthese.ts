/**
 * Synthèse des points d'évaluations pour le bulletin.
 * Uniquement les notes encodées par l’enseignant (grilles Savoir-parler,
 * tests papier, futures évaluations). Pas d’exercices faits à la maison,
 * pas de calligraphie.
 * P1 = août, sept, oct — P2 = nov, déc, jan, fév — P3 = mars, avr, mai, juin.
 */

import type { ResultatRow } from "./resultats-storage";
import { isAbsenceResultat } from "./resultats-labels";

const PARLER_IDS = new Set([
  "savoir-parler-poesie",
  "savoir-parler-famille",
  "savoir-parler-doudou",
]);

const HORS_BULLETIN = new Set(["eval-calligraphie"]);

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

const CATEGORIE_IDS = new Set<string>(BULLETIN_SYNTHESE_CATEGORIES.map((c) => c.id));

/** Notes saisies par l’enseignant — jamais les exercices faits à la maison. */
export function isTeacherEncodedResultat(r: ResultatRow): boolean {
  const sonId = (r.son_id ?? "").toLowerCase();
  const niveauId = (r.niveau_id ?? "").toLowerCase();
  if (HORS_BULLETIN.has(sonId) || HORS_BULLETIN.has(niveauId)) return false;
  if (sonId === "manuel" || niveauId.startsWith("manuel-")) return true;
  if ((r.detail_exercices ?? []).some((ex) => ex.type === "manuel-note" || ex.type === "manuel-absent")) return true;
  if (PARLER_IDS.has(sonId) || PARLER_IDS.has(niveauId)) return true;
  if ((r.detail_exercices ?? []).some((ex) => ex.type === "critere-parler")) return true;
  if (sonId.startsWith("eval-") || niveauId.startsWith("eval-")) return true;
  return false;
}

export function getResultatSourceLabel(r: ResultatRow): string {
  const sonId = (r.son_id ?? "").toLowerCase();
  const niveauId = (r.niveau_id ?? "").toLowerCase();
  if (isAbsenceResultat(r)) return "Absent";
  if (sonId === "manuel" || niveauId.startsWith("manuel-")) return "Test encodé";
  if (PARLER_IDS.has(sonId) || PARLER_IDS.has(niveauId)) return "Savoir-parler";
  return "Encodé";
}

function categoriePourResultat(r: ResultatRow): BulletinCategorieId | null {
  const sonId = (r.son_id ?? "").toLowerCase();
  const niveauId = (r.niveau_id ?? "").toLowerCase();
  if (PARLER_IDS.has(sonId) || PARLER_IDS.has(niveauId)) return "francais-parler";
  if ((r.detail_exercices ?? []).some((ex) => ex.type === "critere-parler")) return "francais-parler";
  if (sonId === "manuel" || niveauId.startsWith("manuel-")) {
    const cat = niveauId.replace(/^manuel-/, "");
    if (CATEGORIE_IDS.has(cat)) return cat as BulletinCategorieId;
  }
  for (const id of CATEGORIE_IDS) {
    if (niveauId === id || niveauId.endsWith(`-${id}`)) return id as BulletinCategorieId;
  }
  return null;
}

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

/** Construit la synthèse bulletin : seulement tes notes encodées, dans la bonne matière. */
export function computeSyntheseBulletin(resultats: ResultatRow[]): SyntheseBulletin {
  const synthese = emptySynthese();
  for (const r of resultats.filter(isTeacherEncodedResultat)) {
    if (isAbsenceResultat(r)) continue;
    const cat = categoriePourResultat(r);
    if (!cat) continue;
    const period = getPeriodFromDate(r.created_at);
    const points = r.points ?? 0;
    const pointsMax = Math.max(1, r.points_max ?? 10);
    synthese[cat][period].points += points;
    synthese[cat][period].pointsMax += pointsMax;
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
