/**
 * Syllabes pour les dictées (Évaluation 5 — Dictées). 10 emplacements (6-10 à remplir plus tard).
 * L'enseignant dit une syllabe, l'enfant doit l'écrire.
 */

export const DICTEE_SYLLABES: string[][] = [
  ["o", "i", "u", "a", "é", "e", "i", "a", "u", "o"],
  ["é", "a", "u", "i", "o", "e", "u", "o", "i", "m"],
  ["ma", "le", "so", "ri", "mu", "la", "re", "sé", "mi", "lu"],
  ["me", "li", "su", "ra", "lé", "mu", "so", "ru", "lé", "re"],
  ["ra", "se", "mi", "lo", "su", "ri", "sa", "li", "mo", "si"],
  [], // Dictée 6 — à remplir plus tard
  [], // Dictée 7
  [], // Dictée 8
  [], // Dictée 9
  [], // Dictée 10
];

export const NOM_DICTEE: readonly string[] = [
  "Dictée syllabes 1",
  "Dictée syllabes 2",
  "Dictée syllabes 3",
  "Dictée syllabes 4",
  "Dictée syllabes 5",
  "Dictée syllabes 6",
  "Dictée syllabes 7",
  "Dictée syllabes 8",
  "Dictée syllabes 9",
  "Dictée syllabes 10",
];

/**
 * Correction pour la synthèse vocale : syllabes mal prononcées (lue lettre par lettre) → texte pour TTS.
 */
export const PRONONCIATION_TTS: Record<string, string> = {
  lo: "lô",
};

/** Retourne le texte à passer au TTS pour une prononciation correcte de la syllabe. */
export function getSyllabePourTTS(syllabe: string): string {
  return PRONONCIATION_TTS[syllabe.toLowerCase().trim()] ?? syllabe;
}

/** Normalise pour comparaison : minuscules, sans accents. */
export function normaliserSyllabe(s: string): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0307/g, "") // point (i sans point)
    .replace(/[\u0300-\u036f]/g, ""); // accents
}

export function syllabeCorrecte(reponse: string, attendu: string): boolean {
  return normaliserSyllabe(reponse) === normaliserSyllabe(attendu);
}
