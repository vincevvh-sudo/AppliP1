/**
 * Brouillon local des grilles « Parler » (par élève bulletin).
 */

const PREFIX = "parler-grille";
/** Ancien préfixe — lecture de secours pour ne pas perdre les brouillons. */
const LEGACY_PREFIX = "savoir-parler-grille";

export type FaceSelection = number | null;

export type ParlerGrilleDraft = {
  enfantSelections: FaceSelection[];
  enseignantSelections: FaceSelection[];
  /** 0, 1 ou 2 par critère (null = non encore saisi) */
  pointsParCritere: (0 | 1 | 2 | null)[];
  commentaires: string[];
};

function key(prefix: string, bulletinEleveId: string, kind: "poesie" | "famille"): string {
  return `${prefix}:${kind}:${bulletinEleveId}`;
}

function parseDraft(raw: string, n: number): ParlerGrilleDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ParlerGrilleDraft>;
    if (!parsed || !Array.isArray(parsed.pointsParCritere)) return null;
    const enfant = Array.isArray(parsed.enfantSelections) ? parsed.enfantSelections : Array(n).fill(null);
    const ens = Array.isArray(parsed.enseignantSelections) ? parsed.enseignantSelections : Array(n).fill(null);
    const pts = [...parsed.pointsParCritere];
    while (enfant.length < n) enfant.push(null);
    while (ens.length < n) ens.push(null);
    while (pts.length < n) pts.push(null);
    const commentaires = Array.isArray(parsed.commentaires) ? [...parsed.commentaires] : Array(n).fill("");
    while (commentaires.length < n) commentaires.push("");
    return {
      enfantSelections: enfant.slice(0, n) as FaceSelection[],
      enseignantSelections: ens.slice(0, n) as FaceSelection[],
      pointsParCritere: pts.slice(0, n) as (0 | 1 | 2 | null)[],
      commentaires: commentaires.slice(0, n),
    };
  } catch {
    return null;
  }
}

export function loadParlerDraft(
  bulletinEleveId: string,
  kind: "poesie" | "famille",
  n: number
): ParlerGrilleDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const primary = localStorage.getItem(key(PREFIX, bulletinEleveId, kind));
    if (primary) {
      const d = parseDraft(primary, n);
      if (d) return d;
    }
    const legacy = localStorage.getItem(key(LEGACY_PREFIX, bulletinEleveId, kind));
    if (legacy) return parseDraft(legacy, n);
    return null;
  } catch {
    return null;
  }
}

export function saveParlerDraft(bulletinEleveId: string, kind: "poesie" | "famille", draft: ParlerGrilleDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(PREFIX, bulletinEleveId, kind), JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}
