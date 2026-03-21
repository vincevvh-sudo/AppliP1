/**
 * Évaluation "Construction de phrases" — remettre les segments dans l'ordre
 * (sujet, verbe, complément du verbe, complément de phrase).
 */

export const TITRE_LECTURE_PHRASES = "Construction de phrases";

export type PhraseSegmentRole = "sujet" | "verbe" | "cv" | "cp";

export type PhraseConstructionSegment = {
  id: string;
  text: string;
  role: PhraseSegmentRole;
};

export type PhraseConstructionQuestion = {
  /** Identifiant unique (utile si on veut tracer plus tard) */
  id: string;
  /** Phrase complète (pour affichage enseignant éventuel) */
  phraseComplete: string;
  /** Segments dans le bon ordre (S, V, CV, CP — certains rôles peuvent manquer) */
  segments: PhraseConstructionSegment[];
};

/** Liste de phrases pour l'exercice de construction de phrases. */
export const QUESTIONS_LECTURE_PHRASES: PhraseConstructionQuestion[] = [
  {
    id: "1-chat-leche-pattes-panier",
    phraseComplete: "Le chat lèche ses pattes dans son panier.",
    segments: [
      { id: "s", text: "Le chat", role: "sujet" },
      { id: "v", text: "lèche", role: "verbe" },
      { id: "cv", text: "ses pattes", role: "cv" },
      { id: "cp", text: "dans son panier.", role: "cp" }, // point dans la dernière partie
    ],
  },
  {
    id: "2-martine-joue-ballon-jardin",
    phraseComplete: "Martine joue au ballon dans le jardin.",
    segments: [
      { id: "s", text: "Martine", role: "sujet" },
      { id: "v", text: "joue", role: "verbe" },
      { id: "cv", text: "au ballon", role: "cv" },
      { id: "cp", text: "dans le jardin.", role: "cp" },
    ],
  },
  {
    id: "3-enfants-travaillent-classe",
    phraseComplete: "Les enfants travaillent en classe.",
    segments: [
      { id: "s", text: "Les enfants", role: "sujet" },
      { id: "v", text: "travaillent", role: "verbe" },
      { id: "cp", text: "en classe.", role: "cp" }, // pas de complément du verbe
    ],
  },
  {
    id: "4-papa-repare-velo-garage",
    phraseComplete: "Papa répare le vélo dans le garage.",
    segments: [
      { id: "s", text: "Papa", role: "sujet" },
      { id: "v", text: "répare", role: "verbe" },
      { id: "cv", text: "le vélo", role: "cv" },
      { id: "cp", text: "dans le garage.", role: "cp" },
    ],
  },
  {
    id: "5-lily-regarde-film-soir",
    phraseComplete: "Lily regarde un film ce soir.",
    segments: [
      { id: "s", text: "Lily", role: "sujet" },
      { id: "v", text: "regarde", role: "verbe" },
      { id: "cv", text: "un film", role: "cv" },
      { id: "cp", text: "ce soir.", role: "cp" },
    ],
  },
  {
    id: "6-mvincent-regarde-enfants-classe",
    phraseComplete: "M. Vincent regarde les enfants en classe.",
    segments: [
      { id: "s", text: "M. Vincent", role: "sujet" },
      { id: "v", text: "regarde", role: "verbe" },
      { id: "cv", text: "les enfants", role: "cv" },
      { id: "cp", text: "en classe.", role: "cp" },
    ],
  },
  {
    id: "7-vous-portez-jupes-ete",
    phraseComplete: "Vous portez des jupes rouges en été.",
    segments: [
      { id: "s", text: "Vous", role: "sujet" },
      { id: "v", text: "portez", role: "verbe" },
      { id: "cv", text: "des jupes rouges", role: "cv" },
      { id: "cp", text: "en été.", role: "cp" },
    ],
  },
  {
    id: "8-il-porte-chemise-noir-travail",
    phraseComplete: "Il porte une chemise noir pour son travail.",
    segments: [
      { id: "s", text: "Il", role: "sujet" },
      { id: "v", text: "porte", role: "verbe" },
      { id: "cv", text: "une chemise noir", role: "cv" },
      { id: "cp", text: "pour son travail.", role: "cp" },
    ],
  },
  {
    id: "9-ordinateur-est-gris",
    phraseComplete: "L'ordinateur est gris.",
    segments: [
      { id: "s", text: "L'ordinateur", role: "sujet" },
      { id: "v", text: "est", role: "verbe" },
      { id: "cv", text: "gris.", role: "cv" }, // point ici car pas de complément de phrase
    ],
  },
  {
    id: "10-blanche-neige-pomme-sorciere",
    phraseComplete: "Blanche Neige a mangé une pomme donnée par la sorcière.",
    segments: [
      { id: "s", text: "Blanche Neige", role: "sujet" },
      { id: "v", text: "a mangé", role: "verbe" },
      { id: "cv", text: "une pomme", role: "cv" },
      { id: "cp", text: "donnée par la sorcière.", role: "cp" },
    ],
  },
];

