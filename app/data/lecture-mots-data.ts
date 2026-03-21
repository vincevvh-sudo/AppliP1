/**
 * Lecture de mots : associer chaque mot à la bonne image (emoji).
 * 10 mots, score sur 10.
 */

export const TITRE_LECTURE_MOTS = "Lecture de mots";

export type MotImageItem = {
  id: string;
  mot: string;
  emoji: string;
};

/** Les 10 mots de l'exercice "Colle le dessin à côté du mot" (ordre de la fiche). */
export const LECTURE_MOTS_ITEMS: MotImageItem[] = [
  { id: "1", mot: "le vélo", emoji: "🚲" },
  { id: "2", mot: "le tapis", emoji: "🟫" },
  { id: "3", mot: "la pêche", emoji: "🍑" },
  { id: "4", mot: "la note", emoji: "📝" },
  { id: "5", mot: "un renard", emoji: "🦊" },
  { id: "6", mot: "l'ananas", emoji: "🍍" },
  { id: "7", mot: "la moto", emoji: "🏍️" },
  { id: "8", mot: "le piano", emoji: "🎹" },
  { id: "9", mot: "une tulipe", emoji: "🌷" },
  { id: "10", mot: "la tarte", emoji: "🥧" },
];

export const NOMBRE_MOTS = LECTURE_MOTS_ITEMS.length;

/** Retourne 4 emojis pour un mot : le bon + 3 autres tirés au hasard, mélangés. */
export function getChoixEmojis(itemIndex: number): string[] {
  const correct = LECTURE_MOTS_ITEMS[itemIndex].emoji;
  const autres = LECTURE_MOTS_ITEMS.filter((_, i) => i !== itemIndex).map((x) => x.emoji);
  const melange = [...autres].sort(() => Math.random() - 0.5);
  const choix = [correct, melange[0], melange[1], melange[2]];
  return choix.sort(() => Math.random() - 0.5);
}
