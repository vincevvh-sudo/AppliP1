/**
 * Évaluation "Lecture de syllabes" — 10 questions : le professeur dit un son, l'élève choisit parmi 5 options.
 */

export const TITRE_LECTURE_SYLLABES = "Lecture de syllabes";

/**
 * Texte à envoyer au TTS pour une prononciation en une seule syllabe (liaison R+O = "RO").
 * On utilise un mot qui commence par "ro" (ex. "roc") pour que la synthèse prononce bien la syllabe d'un bloc.
 */
export const PRONONCIATION_TTS_LECTURE: Record<string, string> = {
  ro: "roc",
};

export function getSonPourTTS(son: string): string {
  return PRONONCIATION_TTS_LECTURE[son.toLowerCase().trim()] ?? son;
}

export type QuestionSyllabe = {
  /** Son ou syllabe à dire (affiché + TTS) */
  son: string;
  /** 5 options proposées */
  options: [string, string, string, string, string];
  /** Index de la bonne réponse (0 à 4) */
  correctIndex: number;
};

export const QUESTIONS_LECTURE_SYLLABES: QuestionSyllabe[] = [
  { son: "mi", options: ["li", "le", "mi", "se", "si"], correctIndex: 2 },
  { son: "ro", options: ["mo", "lo", "so", "ro", "or"], correctIndex: 3 },
  { son: "sé", options: ["mé", "ré", "sé", "mè", "rè"], correctIndex: 2 },
  { son: "lu", options: ["lu", "su", "ru", "ro", "so"], correctIndex: 0 },
  { son: "ar", options: ["ra", "sa", "ar", "or", "os"], correctIndex: 2 },
  { son: "pé", options: ["pa", "pu", "pe", "pé", "pè"], correctIndex: 3 },
  { son: "il", options: ["il", "al", "ol", "la", "li"], correctIndex: 0 },
  { son: "li", options: ["mu", "su", "pi", "li", "ri"], correctIndex: 3 },
  { son: "mur", options: ["mal", "sol", "Pol", "mur", "sur"], correctIndex: 3 },
  { son: "rame", options: ["rime", "rame", "mare", "papa", "pape"], correctIndex: 1 },
];
