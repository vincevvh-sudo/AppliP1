/**
 * Évaluation Vocabulaire spatial (Espace et géométrie).
 * 14 phrases, chaque phrase = 1 point. Score affiché sur 10 : (points / 14) * 10.
 */

export const TITRE_VOCABULAIRE_SPATIAL = "Vocabulaire spatial";

export type PhraseVocabulaireSpatial = {
  id: string;
  texte: string;
};

export const PHRASES_VOCABULAIRE_SPATIAL: PhraseVocabulaireSpatial[] = [
  { id: "1", texte: "Dessine une échelle contre l'arbre." },
  { id: "2", texte: "Dessine un chat sous la table." },
  { id: "3", texte: "Dessine une plante à côté de la chaise." },
  { id: "4", texte: "Dessine-toi entre les deux héros." },
  { id: "5", texte: "Dessine un caillou à l'extérieur de l'aquarium." },
  { id: "6", texte: "Dessine un ballon sur le banc." },
  { id: "7", texte: "Colorie les arbres qui sont à gauche des deux crocodiles." },
  { id: "8", texte: "Colorie les maisons qui sont à droite de la route." },
  { id: "9", texte: "Colorie les objets qui sont près de lui." },
  { id: "10", texte: "Colorie les deux balles qui sont les plus loin de lui." },
  { id: "11", texte: "Colorie le chat qui est le plus proche de la fenêtre." },
  { id: "12", texte: "La souche est à gauche de l'arbre." },
  { id: "13", texte: "Le champignon est près de la flaque." },
  { id: "14", texte: "Pierre est loin de la souche." },
];

export const NOMBRE_PHRASES = PHRASES_VOCABULAIRE_SPATIAL.length;

/** Score sur 10 à partir des points obtenus sur 14. */
export function scoreSur10(pointsObtenus: number): number {
  if (pointsObtenus <= 0) return 0;
  if (pointsObtenus >= NOMBRE_PHRASES) return 10;
  return Math.round((pointsObtenus / NOMBRE_PHRASES) * 10 * 10) / 10;
}

/** Libellé de maîtrise pour l'enfant. */
export function libelleMaitrise(scoreSur10: number): string {
  if (scoreSur10 >= 9) return "Très bien maîtrisé";
  if (scoreSur10 >= 7) return "Bien maîtrisé";
  if (scoreSur10 >= 5) return "En cours d'acquisition";
  return "À retravailler";
}
