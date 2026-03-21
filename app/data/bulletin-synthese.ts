/**
 * Synthèse des points d'évaluations pour le bulletin.
 * Agrège les résultats exercice_resultats par catégorie bulletin et par période (P1, P2, P3).
 * P1 = août, sept, oct — P2 = nov, déc, jan, fév — P3 = mars, avr, mai, juin.
 */

import type { ResultatRow } from "./resultats-storage";
import { getCategorieForEvalExercice } from "./bulletin-exercice-categories";
import type { ManualEvalCategoryId } from "./manual-evaluations";

const EVAL_EXO_NIVEAU_REGEX = /-eval-\d+-\d+$/;

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

/** Type d'exercice (eval-data / JeuxSons) -> catégorie bulletin (sons = français uniquement pour l'instant) */
function getCategorieFromExerciseType(
  type: string,
  niveauType?: string
): BulletinCategorieId | null {
  const t = (type ?? "").toLowerCase();
  // Détaillé (évaluations avec detail_exercices)
  if (t === "image-deux-mots" || t === "entoure-son" || t === "entoure-lettre" || t === "entoure-lettre-dans-mot" || t === "entoure-syllabe" || t === "phrases-vrai-faux" || t === "fluence-chrono") return "francais-lire";
  if (t === "ecris-syllabe" || t === "relie-ecritures") return "francais-ecrire";
  if (t === "repere-son") return "francais-ecouter";
  if (t === "article-le-la") return "francais-parler";
  // Niveau entier (sans détail) : type de niveau
  const n = (niveauType ?? "").toLowerCase();
  if (n === "phono" || n === "phono-image") return "francais-lire";
  if (n === "relie") return "francais-ecrire";
  if (n === "article") return "francais-parler";
  if (n === "phrases-vrai-faux") return "francais-lire";
  if (n === "ecrire-syllabe") return "francais-ecrire";
  if (n === "eval") return null; // on utilise le détail
  return null;
}

function getManualCategorieFromNiveauId(niveauId: string | undefined): BulletinCategorieId | null {
  if (!niveauId) return null;
  if (!niveauId.startsWith("manuel-")) return null;
  const category = niveauId.replace(/^manuel-/, "") as ManualEvalCategoryId;
  return (
    [
      "francais-lire",
      "francais-ecrire",
      "francais-ecouter",
      "francais-parler",
      "maths-arithmetique",
      "maths-grandeur",
      "maths-espace-geo",
      "maths-traitement-donnees",
      "eveil",
    ] as const
  ).includes(category)
    ? category
    : null;
}

function getCategorieFromResultIdentifiers(row: ResultatRow): BulletinCategorieId | null {
  const sonId = (row.son_id ?? "").toLowerCase();
  const niveauId = (row.niveau_id ?? "").toLowerCase();

  // Lectures globales (syllabes / mots / janvier)
  if (sonId === "lecture" || niveauId.startsWith("lecture-")) return "francais-lire";

  // Dictées (syllabes et mots)
  if (sonId === "dictee" || sonId === "dictee-mots" || niveauId.startsWith("dictee-")) {
    return "francais-ecrire";
  }

  // Maths : solides
  if (sonId === "maths-solides" || niveauId === "maths-solides") return "maths-espace-geo";

  // Français : Parler (grilles poésie / famille ; son_id historique savoir-parler-*)
  if (sonId === "savoir-parler-poesie" || sonId === "savoir-parler-famille") return "francais-parler";
  if (niveauId === "savoir-parler-poesie" || niveauId === "savoir-parler-famille") return "francais-parler";

  return null;
}

export type SynthesePeriod = { points: number; pointsMax: number };
export type SyntheseCategorie = Record<PeriodId, SynthesePeriod>;
export type SyntheseBulletin = Record<BulletinCategorieId, SyntheseCategorie>;

const PERIODS: PeriodId[] = ["P1", "P2", "P3"];

function emptySynthese(): SyntheseBulletin {
  const out = {} as SyntheseBulletin;
  for (const cat of BULLETIN_SYNTHESE_CATEGORIES) {
    out[cat.id] = { P1: { points: 0, pointsMax: 0 }, P2: { points: 0, pointsMax: 0 }, P3: { points: 0, pointsMax: 0 } };
  }
  return out;
}

/** Répartition des dictées de syllabes (Évaluation 5) par période bulletin — Français écrire. */
const DICTEES_PAR_PERIODE = {
  P1: [1, 2] as const,       // Dictées 1 et 2 → Période 1
  P2: [3, 4, 5] as const,     // Dictées 3, 4, 5 → Période 2
  P3: [6, 7, 8, 9, 10] as const, // Dictées 6 à 10 → Période 3 (emplacements prévus)
};

const POINTS_MAX_PAR_DICTEE = 5;

/** Scores dictées (dictee_1..dictee_N). Utilisé pour répartir par période dans français écrire. */
export type DicteeScoresForBulletin = Record<string, number | null>;

function addDicteeScoresToSynthese(
  synthese: SyntheseBulletin,
  scores: DicteeScoresForBulletin
): void {
  for (const period of ["P1", "P2", "P3"] as const) {
    const indices = DICTEES_PAR_PERIODE[period];
    let points = 0;
    for (const i of indices) {
      const v = scores[`dictee_${i}`];
      points += v != null ? v : 0;
    }
    const pointsMax = indices.length * POINTS_MAX_PAR_DICTEE;
    if (pointsMax > 0) {
      synthese["francais-ecrire"][period].points += points;
      synthese["francais-ecrire"][period].pointsMax += pointsMax;
    }
  }
}

/** Construit la synthèse bulletin pour un élève à partir de ses résultats.
 * Les scores des dictées (Évaluation 5) sont optionnellement répartis en Français écrire :
 * - P1 : dictées 1 et 2 (sur 10) ; P2 : dictées 3, 4, 5 (sur 15) ; P3 : dictées 6 à 10 (sur 25). */
export function computeSyntheseBulletin(
  resultats: ResultatRow[],
  dicteeScores?: DicteeScoresForBulletin | null
): SyntheseBulletin {
  const synthese = emptySynthese();
  for (const r of resultats) {
    const period = getPeriodFromDate(r.created_at);
    const niveauType = r.niveau_id?.split("-")?.[1] ?? ""; // e.g. "eval" from "m-eval-1"
    const manualCat = getManualCategorieFromNiveauId(r.niveau_id);
    const idCat = getCategorieFromResultIdentifiers(r);

    if (r.detail_exercices && r.detail_exercices.length > 0) {
      const isEvalExoNiveau = r.niveau_id != null && EVAL_EXO_NIVEAU_REGEX.test(r.niveau_id);
      for (const ex of r.detail_exercices) {
        const cat =
          manualCat ??
          idCat ??
          (isEvalExoNiveau && r.niveau_id ? getCategorieForEvalExercice(r.niveau_id) : null) ??
          getCategorieFromExerciseType(ex.type, undefined);
        if (!cat) continue;
        const points = ex.points ?? 0;
        const pointsMax = Math.max(1, ex.pointsMax ?? 0);
        synthese[cat][period].points += points;
        synthese[cat][period].pointsMax += pointsMax;
      }
    } else {
      const cat = manualCat ?? idCat ?? getCategorieFromExerciseType("", niveauType);
      if (!cat) continue;
      synthese[cat][period].points += r.points ?? 0;
      synthese[cat][period].pointsMax += Math.max(1, r.points_max ?? 0);
    }
  }
  if (dicteeScores && typeof dicteeScores === "object") {
    addDicteeScoresToSynthese(synthese, dicteeScores);
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
