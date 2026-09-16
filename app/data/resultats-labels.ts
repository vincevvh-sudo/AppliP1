/**
 * Libellés d’affichage pour les lignes exercice_resultats (bulletin, résultats…).
 */

import type { ResultatRow } from "./resultats-storage";
import { getSonById, isConsonne } from "./sons-data";
import { getManualCategoryLabel } from "./manual-evaluations";
import {
  getFluenceDisplayLabel,
  isFluenceNiveauId,
  sonIdFromFluenceNiveauId,
} from "./fluence-partage";

const MATHS_RESULT_LABELS: Record<string, string> = {
  "maths-centimetre-metre": "Maths — Centimètre ou mètre",
  "maths-euros-monnaie": "Maths — Compter les euros",
  "maths-jours-semaine": "Maths — Jours de la semaine",
  "maths-instruments-mesure": "Maths — Instruments de mesure",
  "maths-solides": "Maths — Solides",
  "maths-quadrilateres": "Maths — Quadrilatères",
};

export function isFluenceResultat(r: ResultatRow): boolean {
  if (isFluenceNiveauId(r.niveau_id ?? "")) return true;
  return (r.detail_exercices ?? []).some(
    (ex) => ex.type === "fluence-maison" || ex.type === "fluence-chrono"
  );
}

export function getTitrePoesieLabel(r: ResultatRow): string | null {
  const meta = (r.detail_exercices ?? []).find(
    (ex) =>
      ex.type === "titre-poesie" ||
      ex.type === "titre-presentation" ||
      ex.type === "titre-doudou"
  );
  const t = meta?.titre?.trim();
  return t || null;
}

export function getResultatTitre(r: ResultatRow): string {
  if (r.son_id === "manuel") {
    return r.detail_exercices?.[0]?.titre ?? "Test papier";
  }
  if (r.son_id === "savoir-parler-poesie") {
    const titre = getTitrePoesieLabel(r);
    return titre ? `Poésie — ${titre}` : "Je dis ma poésie";
  }
  if (r.son_id === "savoir-parler-doudou") {
    return "Présentation de mon doudou";
  }
  if (r.son_id === "savoir-parler-famille") {
    const titre = getTitrePoesieLabel(r);
    return titre ? `Présentation de ${titre}` : "Présentation";
  }
  if (isFluenceResultat(r)) {
    const son = getSonById(r.son_id ?? "");
    if (son) return `Fluence — ${getFluenceDisplayLabel(son)}`;
    const fromNiveau = sonIdFromFluenceNiveauId(r.niveau_id ?? "");
    const son2 = fromNiveau ? getSonById(fromNiveau) : null;
    if (son2) return `Fluence — ${getFluenceDisplayLabel(son2)}`;
    return "Fluence";
  }
  const mathsLabel = MATHS_RESULT_LABELS[r.son_id ?? ""];
  if (mathsLabel) return mathsLabel;
  const son = getSonById(r.son_id ?? "");
  const niveau = (r.niveau_id ?? "").replace(/-/g, " ");
  return `${son ? son.grapheme : r.son_id || "?"} — ${niveau}`;
}

/** Matière / catégorie pour le bulletin « Par contrôle ». */
export function getResultatMatiere(r: ResultatRow): string {
  if (r.son_id === "manuel") {
    const cat = r.niveau_id?.replace(/^manuel-/, "");
    return getManualCategoryLabel(cat);
  }
  if (
    r.son_id === "savoir-parler-poesie" ||
    r.son_id === "savoir-parler-famille" ||
    r.son_id === "savoir-parler-doudou"
  ) {
    return "Français : parler";
  }
  if (isFluenceResultat(r) || (r.son_id && getSonById(r.son_id))) {
    return "Français : lire";
  }
  if (r.son_id && MATHS_RESULT_LABELS[r.son_id]) return "Mathématiques";
  if (r.son_id?.startsWith("maths-") || r.niveau_id?.includes("maths")) return "Mathématiques";
  return "Évaluation";
}

export function getResultatLabelComplet(r: ResultatRow): string {
  if (r.son_id === "manuel") {
    return `${getResultatMatiere(r)} — ${getResultatTitre(r)}`;
  }
  if (r.son_id === "savoir-parler-poesie") {
    const titre = getTitrePoesieLabel(r);
    return titre ? `Parler — Poésie : ${titre}` : "Parler — Je dis ma poésie";
  }
  if (r.son_id === "savoir-parler-doudou") {
    return "Parler — Présentation de mon doudou";
  }
  if (r.son_id === "savoir-parler-famille") {
    const titre = getTitrePoesieLabel(r);
    return titre ? `Parler — Présentation de ${titre}` : "Parler — Présentation";
  }
  return getResultatTitre(r);
}

export function formatResultatDate(s: string | undefined): string {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" });
}

export function getFluenceUnite(r: ResultatRow): string {
  const sonId = r.son_id || sonIdFromFluenceNiveauId(r.niveau_id ?? "") || "";
  const son = getSonById(sonId);
  if (!son) return "élément";
  return isConsonne(son) ? "syllabe" : "lettre";
}
