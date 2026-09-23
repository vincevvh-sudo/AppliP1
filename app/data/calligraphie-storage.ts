/**
 * Brouillon local de la grille calligraphie (par élève bulletin).
 */

export type FaceSelection = number | null;

export type CalligraphieGrilleDraft = {
  enseignantSelections: FaceSelection[];
  pointsParCritere: (number | null)[];
  commentaires: string[];
  titreEvaluation: string;
};

const PREFIX = "calligraphie-grille";

function key(bulletinEleveId: string): string {
  return `${PREFIX}:${bulletinEleveId}`;
}

function emptyDraft(n: number): CalligraphieGrilleDraft {
  return {
    enseignantSelections: Array(n).fill(null),
    pointsParCritere: Array(n).fill(null),
    commentaires: Array(n).fill(""),
    titreEvaluation: "Période 1",
  };
}

function parseDraft(raw: string, n: number): CalligraphieGrilleDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CalligraphieGrilleDraft>;
    if (!parsed || !Array.isArray(parsed.pointsParCritere)) return null;
    const ens = Array.isArray(parsed.enseignantSelections)
      ? [...parsed.enseignantSelections]
      : Array(n).fill(null);
    const pts = [...parsed.pointsParCritere];
    const commentaires = Array.isArray(parsed.commentaires)
      ? [...parsed.commentaires]
      : Array(n).fill("");
    while (ens.length < n) ens.push(null);
    while (pts.length < n) pts.push(null);
    while (commentaires.length < n) commentaires.push("");
    return {
      enseignantSelections: ens.slice(0, n) as FaceSelection[],
      pointsParCritere: pts.slice(0, n),
      commentaires: commentaires.slice(0, n),
      titreEvaluation:
        typeof parsed.titreEvaluation === "string" && parsed.titreEvaluation.trim()
          ? parsed.titreEvaluation
          : "Période 1",
    };
  } catch {
    return null;
  }
}

export function loadCalligraphieDraft(
  bulletinEleveId: string,
  n: number
): CalligraphieGrilleDraft {
  if (typeof window === "undefined") return emptyDraft(n);
  try {
    const raw = localStorage.getItem(key(bulletinEleveId));
    if (raw) {
      const d = parseDraft(raw, n);
      if (d) return d;
    }
  } catch {
    /* ignore */
  }
  return emptyDraft(n);
}

export function saveCalligraphieDraft(
  bulletinEleveId: string,
  draft: CalligraphieGrilleDraft
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(bulletinEleveId), JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}
