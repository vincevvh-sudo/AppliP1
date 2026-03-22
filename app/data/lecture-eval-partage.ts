/**
 * Identifiants pour le partage des évaluations « Lecture » (Forêt des sons).
 * Alignés sur resultats-storage (son_id / niveau_id) côté élève.
 */
export const LECTURE_SON_ID = "lecture" as const;

export const LECTURE_EVAL_NIVEAU_SYLLABES = "lecture-syllabes";
export const LECTURE_EVAL_NIVEAU_MOTS = "lecture-mots";
export const LECTURE_EVAL_NIVEAU_JANVIER = "lecture-janvier";
export const LECTURE_EVAL_NIVEAU_PHRASES = "lecture-phrases";

export type LectureEvalNiveauId =
  | typeof LECTURE_EVAL_NIVEAU_SYLLABES
  | typeof LECTURE_EVAL_NIVEAU_MOTS
  | typeof LECTURE_EVAL_NIVEAU_JANVIER
  | typeof LECTURE_EVAL_NIVEAU_PHRASES;

export const LECTURE_EVAL_ROUTES: Record<
  LectureEvalNiveauId,
  { titre: string; href: string }
> = {
  [LECTURE_EVAL_NIVEAU_SYLLABES]: {
    titre: "Lecture de syllabes",
    href: "/enfant/sons/lecture/syllabes",
  },
  [LECTURE_EVAL_NIVEAU_MOTS]: {
    titre: "Lecture de mots",
    href: "/enfant/sons/lecture/mots",
  },
  [LECTURE_EVAL_NIVEAU_JANVIER]: {
    titre: "Janvier",
    href: "/enfant/sons/lecture/janvier",
  },
  [LECTURE_EVAL_NIVEAU_PHRASES]: {
    titre: "Construction de phrases",
    href: "/enfant/sons/lecture/phrases",
  },
};

export function isLectureEvalNiveauId(id: string): id is LectureEvalNiveauId {
  return id in LECTURE_EVAL_ROUTES;
}
