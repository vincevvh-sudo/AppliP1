/**
 * Évaluation "Centimètre ou mètre" (Grandeur).
 * 20 questions : pour chaque objet, l'enfant choisit mètre ou centimètre.
 * Cotation sur 20, score affiché sur 10 : (points / 20) * 10.
 */

export const TITRE_CENTIMETRE_METRE = "Centimètre ou mètre";

export type Unite = "mètre" | "centimètre";

export type QuestionCentimetreMetre = {
  id: string;
  nomObjet: string;
  uniteCorrecte: Unite;
  emoji: string;
};

export const QUESTIONS_CENTIMETRE_METRE: QuestionCentimetreMetre[] = [
  { id: "1", nomObjet: "fourmi", uniteCorrecte: "centimètre", emoji: "🐜" },
  { id: "2", nomObjet: "bus", uniteCorrecte: "mètre", emoji: "🚌" },
  { id: "3", nomObjet: "crayon", uniteCorrecte: "centimètre", emoji: "✏️" },
  { id: "4", nomObjet: "école", uniteCorrecte: "mètre", emoji: "🏫" },
  { id: "5", nomObjet: "lit", uniteCorrecte: "mètre", emoji: "🛏️" },
  { id: "6", nomObjet: "girafe", uniteCorrecte: "mètre", emoji: "🦒" },
  { id: "7", nomObjet: "sucette", uniteCorrecte: "centimètre", emoji: "🍭" },
  { id: "8", nomObjet: "éléphant", uniteCorrecte: "mètre", emoji: "🐘" },
  { id: "9", nomObjet: "escargot", uniteCorrecte: "centimètre", emoji: "🐌" },
  { id: "10", nomObjet: "serpent", uniteCorrecte: "mètre", emoji: "🐍" },
  { id: "11", nomObjet: "gomme", uniteCorrecte: "centimètre", emoji: "🧽" },
  { id: "12", nomObjet: "arbre", uniteCorrecte: "mètre", emoji: "🌳" },
  { id: "13", nomObjet: "coccinelle", uniteCorrecte: "centimètre", emoji: "🐞" },
  { id: "14", nomObjet: "voiture", uniteCorrecte: "mètre", emoji: "🚗" },
  { id: "15", nomObjet: "clé", uniteCorrecte: "centimètre", emoji: "🔑" },
  { id: "16", nomObjet: "ballon", uniteCorrecte: "centimètre", emoji: "⚽" },
  { id: "17", nomObjet: "banane", uniteCorrecte: "centimètre", emoji: "🍌" },
  { id: "18", nomObjet: "baleine", uniteCorrecte: "mètre", emoji: "🐋" },
  { id: "19", nomObjet: "pile de crêpes", uniteCorrecte: "centimètre", emoji: "🥞" },
  { id: "20", nomObjet: "fusée", uniteCorrecte: "mètre", emoji: "🚀" },
];

export const NOMBRE_QUESTIONS = QUESTIONS_CENTIMETRE_METRE.length;

/** Score sur 10 à partir des points obtenus sur 20. */
export function scoreSur10CentimetreMetre(pointsObtenus: number): number {
  if (pointsObtenus <= 0) return 0;
  if (pointsObtenus >= NOMBRE_QUESTIONS) return 10;
  return Math.round((pointsObtenus / NOMBRE_QUESTIONS) * 10 * 10) / 10;
}
