/**
 * Évaluation Lecture global janvier — 4 exercices.
 * À la place de dessiner, l'enfant choisit parmi 4 emojis (ou vrai/faux pour l'exo 5).
 */

export const TITRE_JANVIER = "Janvier";

export type ItemSyllabe = { syllabe: string; emoji: string; mot: string };
export type ItemMot = { mot: string; emoji: string; /** Image pour ce mot (ex. Gulu), servie depuis /images/ */ image?: string };
export type ItemVraiFaux = { phrase: string; correct: boolean };

/** 1. Relie chaque dessin à une syllabe → on affiche la syllabe, l'enfant choisit l'emoji. */
export const JANVIER_EX1_SYLLABES: ItemSyllabe[] = [
  { syllabe: "cha", emoji: "🐫", mot: "chameau" },
  { syllabe: "cho", emoji: "🍫", mot: "chocolat" },
  { syllabe: "chou", emoji: "🥬", mot: "chou" },
  { syllabe: "chè", emoji: "🐐", mot: "chèvre" },
  { syllabe: "chi", emoji: "🏮", mot: "chinois" },
];

/** 2. Ecris "le" ou "la" → on affiche le mot, l'enfant choisit l'emoji qui correspond. */
export const JANVIER_EX2_MOTS: ItemMot[] = [
  { mot: "gare", emoji: "🚂" },
  { mot: "salade", emoji: "🥗" },
  { mot: "gomme", emoji: "🧽" },
  { mot: "niche", emoji: "🏠" },
  { mot: "bidon", emoji: "🛢️" },
  { mot: "départ", emoji: "🏁" },
  { mot: "grue", emoji: "🏗️" },
  { mot: "farde", emoji: "📁" },
  { mot: "radio", emoji: "📻" },
  { mot: "mode", emoji: "👗" },
  { mot: "cloche", emoji: "🔔" },
  { mot: "légume", emoji: "🥕" },
  { mot: "panade", emoji: "🥣" },
  { mot: "bagarre", emoji: "🥊" },
  { mot: "groupe", emoji: "👥" },
  { mot: "chute", emoji: "📉" },
  { mot: "pêche", emoji: "🍑" },
  { mot: "mardi", emoji: "📅" },
  { mot: "corde", emoji: "🪢" },
  { mot: "dragon", emoji: "🐉" },
];

/** 4. Lis le mot puis dessine-le → on affiche le mot, l'enfant choisit l'emoji. */
export const JANVIER_EX3_MOTS: ItemMot[] = [
  { mot: "le cochon", emoji: "🐷" },
  { mot: "le Gulu", emoji: "🍔", image: "/images/gulu.png" },
  { mot: "un bonbon", emoji: "🍬" },
  { mot: "une dame", emoji: "👩" },
  { mot: "la poule", emoji: "🐔" },
];

/** 5. La phrase est-elle vraie ou fausse ? */
export const JANVIER_EX4_VRAI_FAUX: ItemVraiFaux[] = [
  { phrase: "La salade est un légume.", correct: true },
  { phrase: "La fourmi écoute la radio.", correct: false },
  { phrase: "Simon a bu un bonbon.", correct: false },
  { phrase: "Le caméléon est un animal.", correct: true },
  { phrase: "Mon papy a regonflé le vélo.", correct: true },
];

export const JANVIER_EX1_LENGTH = JANVIER_EX1_SYLLABES.length;
export const JANVIER_EX2_LENGTH = JANVIER_EX2_MOTS.length;
export const JANVIER_EX3_LENGTH = JANVIER_EX3_MOTS.length;
export const JANVIER_EX4_LENGTH = JANVIER_EX4_VRAI_FAUX.length;

export const JANVIER_TOTAL_QUESTIONS =
  JANVIER_EX1_LENGTH + JANVIER_EX2_LENGTH + JANVIER_EX3_LENGTH + JANVIER_EX4_LENGTH;

/** Score sur 10 à partir du nombre de bonnes réponses. */
export function janvierScoreSur10(points: number): number {
  if (points <= 0) return 0;
  if (points >= JANVIER_TOTAL_QUESTIONS) return 10;
  return Math.round((points / JANVIER_TOTAL_QUESTIONS) * 10 * 10) / 10;
}

/** Retourne 4 emojis pour un item (syllabe ou mot) : le bon + 3 autres, mélangés. */
function getAutresEmojisEx1(excludeIndex: number): string[] {
  return JANVIER_EX1_SYLLABES.filter((_, i) => i !== excludeIndex).map((x) => x.emoji);
}
function getAutresEmojisEx2(excludeIndex: number): string[] {
  return JANVIER_EX2_MOTS.filter((_, i) => i !== excludeIndex).map((x) => x.emoji);
}
function getAutresEmojisEx3(excludeIndex: number): string[] {
  return JANVIER_EX3_MOTS.filter((_, i) => i !== excludeIndex).map((x) => x.image ?? x.emoji);
}

export function getChoixEmojisEx1(itemIndex: number): string[] {
  const correct = JANVIER_EX1_SYLLABES[itemIndex].emoji;
  const autres = getAutresEmojisEx1(itemIndex).sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...autres].sort(() => Math.random() - 0.5);
}
export function getChoixEmojisEx2(itemIndex: number): string[] {
  const correct = JANVIER_EX2_MOTS[itemIndex].emoji;
  const autres = getAutresEmojisEx2(itemIndex).sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...autres].sort(() => Math.random() - 0.5);
}
export function getChoixEmojisEx3(itemIndex: number): string[] {
  const item = JANVIER_EX3_MOTS[itemIndex];
  const correct = item.image ?? item.emoji;
  const autres = getAutresEmojisEx3(itemIndex).sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...autres].sort(() => Math.random() - 0.5);
}
