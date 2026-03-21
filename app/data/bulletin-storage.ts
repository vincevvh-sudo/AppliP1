/**
 * Données et stockage pour l'application Bulletin.
 * Stockage local (localStorage) pour élèves, attendus et évaluations.
 */

export type NiveauAcquisition = "acquis" | "en_cours" | "non_acquis" | null;

export interface EleveBulletin {
  id: string;
  prenom: string;
  photoDataUrl: string | null; // base64 ou null
  /** Id de l'élève dans Supabase (table eleves), pour envoyer le bulletin à l'enfant */
  supabaseEleveId?: string | null;
}

export interface Attendu {
  id: string;
  libelle: string;
}

export interface SectionAttendus {
  id: string;
  titre: string;
  attendus: Attendu[];
}

export interface EvaluationLigne {
  attenduId: string;
  enfant: NiveauAcquisition;
  enseignant: NiveauAcquisition;
  commentaire: string;
}

export interface BulletinEleve {
  eleveId: string;
  sections: Record<string, Record<string, EvaluationLigne>>; // sectionId -> attenduId -> EvaluationLigne
}

const STORAGE_KEYS = {
  ELEVES: "bulletin-eleves",
  SECTIONS: "bulletin-sections",
  BULLETINS: "bulletin-evaluations",
  SECTION_COMMENTS: "bulletin-section-comments",
} as const;

import { PROGRAMMATION_SECTIONS } from "./programmation-par-mois";

const DEFAULT_SECTION_COMPORTEMENT: SectionAttendus = {
  id: "comportement",
  titre: "Mon comportement",
  attendus: [
    { id: "c1", libelle: "Je suis ordonné." },
    { id: "c2", libelle: "Je travaille dans le temps accordé." },
    { id: "c3", libelle: "Je m'applique dans mon travail." },
    { id: "c4", libelle: "Je participe aux activités de la classe." },
    { id: "c5", libelle: "J'ose m'exprimer pour poser une question intéressante et pour donner mon avis." },
    { id: "c6", libelle: "Je respecte les règles." },
    { id: "c7", libelle: "Je sais jouer et travailler avec les copains." },
    { id: "c8", libelle: "Je travaille régulièrement à la maison." },
    { id: "c9", libelle: "Autonomie." },
    { id: "c10", libelle: "Soin donné aux travaux." },
  ],
};

const DEFAULT_SECTIONS: SectionAttendus[] = [
  DEFAULT_SECTION_COMPORTEMENT,
  ...PROGRAMMATION_SECTIONS,
];

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getElevesBulletin(): EleveBulletin[] {
  return loadJson<EleveBulletin[]>(STORAGE_KEYS.ELEVES, []);
}

export function setElevesBulletin(eleves: EleveBulletin[]): void {
  saveJson(STORAGE_KEYS.ELEVES, eleves);
}

export function addEleveBulletin(prenom: string, photoDataUrl?: string | null): EleveBulletin {
  const eleves = getElevesBulletin();
  const eleve: EleveBulletin = {
    id: genId(),
    prenom: prenom.trim(),
    photoDataUrl: photoDataUrl ?? null,
  };
  eleves.push(eleve);
  setElevesBulletin(eleves);
  return eleve;
}

export function updateEleveBulletin(
  id: string,
  updates: Partial<Pick<EleveBulletin, "prenom" | "photoDataUrl" | "supabaseEleveId">>
): void {
  const eleves = getElevesBulletin();
  const i = eleves.findIndex((e) => e.id === id);
  if (i === -1) return;
  eleves[i] = { ...eleves[i], ...updates };
  setElevesBulletin(eleves);
}

export function removeEleveBulletin(id: string): void {
  const eleves = getElevesBulletin().filter((e) => e.id !== id);
  setElevesBulletin(eleves);
  const bulletins = getBulletins();
  delete bulletins[id];
  saveJson(STORAGE_KEYS.BULLETINS, bulletins);
}

export function getSections(): SectionAttendus[] {
  const stored = loadJson<SectionAttendus[]>(STORAGE_KEYS.SECTIONS, []);

  // Migration douce : si l'ancien format est encore présent (pas de sections mois-*-francais-lire),
  // on remplace par la nouvelle structure complète.
  const hasNewStructure = stored.some((s) =>
    s.id.startsWith("mois-aout-sept-francais-lire")
  );

  if (stored.length === 0 || !hasNewStructure) {
    saveJson(STORAGE_KEYS.SECTIONS, DEFAULT_SECTIONS);
    return DEFAULT_SECTIONS;
  }

  return stored;
}

/** Ajoute les sections « Programmation par mois » si elles ne sont pas déjà présentes (pour les utilisateurs existants). */
export function addProgrammationSectionsIfMissing(): boolean {
  const stored = getSections();
  const existingIds = new Set(stored.map((s) => s.id));
  const toAdd = PROGRAMMATION_SECTIONS.filter((s) => !existingIds.has(s.id));
  if (toAdd.length === 0) return false;
  setSections([...stored, ...toAdd]);
  return true;
}

export function setSections(sections: SectionAttendus[]): void {
  saveJson(STORAGE_KEYS.SECTIONS, sections);
}

export function updateSection(sectionId: string, updates: Partial<SectionAttendus>): void {
  const sections = getSections().map((s) =>
    s.id === sectionId ? { ...s, ...updates } : s
  );
  setSections(sections);
}

export function addAttendu(sectionId: string, libelle: string): Attendu {
  const sections = getSections();
  const att: Attendu = { id: genId(), libelle: libelle.trim() };
  const next = sections.map((s) =>
    s.id === sectionId ? { ...s, attendus: [...s.attendus, att] } : s
  );
  setSections(next);
  return att;
}

export function updateAttendu(
  sectionId: string,
  attenduId: string,
  libelle: string
): void {
  const sections = getSections();
  const next = sections.map((s) =>
    s.id === sectionId
      ? {
          ...s,
          attendus: s.attendus.map((a) =>
            a.id === attenduId ? { ...a, libelle: libelle.trim() } : a
          ),
        }
      : s
  );
  setSections(next);
}

export function removeAttendu(sectionId: string, attenduId: string): void {
  const sections = getSections();
  const next = sections.map((s) =>
    s.id === sectionId
      ? { ...s, attendus: s.attendus.filter((a) => a.id !== attenduId) }
      : s
  );
  setSections(next);
  const bulletins = getBulletins();
  for (const bid of Object.keys(bulletins)) {
    const sec = bulletins[bid].sections[sectionId];
    if (sec) delete sec[attenduId];
  }
  saveJson(STORAGE_KEYS.BULLETINS, bulletins);
}

export function moveAttendu(
  sectionId: string,
  attenduId: string,
  direction: "up" | "down"
): void {
  const sections = getSections();
  const next = sections.map((s) => {
    if (s.id !== sectionId) return s;
    const idx = s.attendus.findIndex((a) => a.id === attenduId);
    if (idx === -1) return s;
    const targetIndex = direction === "up" ? idx - 1 : idx + 1;
    if (targetIndex < 0 || targetIndex >= s.attendus.length) return s;
    const reordered = [...s.attendus];
    const [item] = reordered.splice(idx, 1);
    reordered.splice(targetIndex, 0, item);
    return { ...s, attendus: reordered };
  });
  setSections(next);
}

function getBulletins(): Record<string, BulletinEleve> {
  return loadJson<Record<string, BulletinEleve>>(STORAGE_KEYS.BULLETINS, {});
}

export function getBulletinEleve(eleveId: string): BulletinEleve {
  const all = getBulletins();
  if (!all[eleveId]) {
    all[eleveId] = { eleveId, sections: {} };
    saveJson(STORAGE_KEYS.BULLETINS, all);
  }
  return all[eleveId];
}

export function setEvaluation(
  eleveId: string,
  sectionId: string,
  attenduId: string,
  role: "enfant" | "enseignant",
  niveau: NiveauAcquisition
): void {
  const bulletins = getBulletins();
  let b = bulletins[eleveId];
  if (!b) {
    b = { eleveId, sections: {} };
    bulletins[eleveId] = b;
  }
  if (!b.sections[sectionId]) b.sections[sectionId] = {};
  let line = b.sections[sectionId][attenduId];
  if (!line) {
    line = { attenduId, enfant: null, enseignant: null, commentaire: "" };
    b.sections[sectionId][attenduId] = line;
  }
  line[role] = niveau;
  saveJson(STORAGE_KEYS.BULLETINS, bulletins);
}

export function setCommentaire(
  eleveId: string,
  sectionId: string,
  attenduId: string,
  commentaire: string
): void {
  const bulletins = getBulletins();
  let b = bulletins[eleveId];
  if (!b) {
    b = { eleveId, sections: {} };
    bulletins[eleveId] = b;
  }
  if (!b.sections[sectionId]) b.sections[sectionId] = {};
  let line = b.sections[sectionId][attenduId];
  if (!line) {
    line = { attenduId, enfant: null, enseignant: null, commentaire: "" };
    b.sections[sectionId][attenduId] = line;
  }
  line.commentaire = commentaire;
  saveJson(STORAGE_KEYS.BULLETINS, bulletins);
}

export function getEvaluation(
  eleveId: string,
  sectionId: string,
  attenduId: string
): EvaluationLigne | undefined {
  const b = getBulletinEleve(eleveId);
  return b.sections[sectionId]?.[attenduId];
}

/** Commentaire global de la section (ex. commentaire du mois) — par élève et par section */
function getSectionComments(): Record<string, Record<string, string>> {
  return loadJson<Record<string, Record<string, string>>>(
    STORAGE_KEYS.SECTION_COMMENTS,
    {}
  );
}

export function getSectionComment(eleveId: string, sectionId: string): string {
  return getSectionComments()[eleveId]?.[sectionId] ?? "";
}

export function setSectionComment(
  eleveId: string,
  sectionId: string,
  comment: string
): void {
  const all = getSectionComments();
  if (!all[eleveId]) all[eleveId] = {};
  all[eleveId][sectionId] = comment;
  saveJson(STORAGE_KEYS.SECTION_COMMENTS, all);
}
