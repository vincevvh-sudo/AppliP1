"use client";

import { LECTURE_SON_ID, type LectureEvalNiveauId } from "../data/lecture-eval-partage";
import { useEvalNiveauAccess, type EvalNiveauAccessState } from "./useEvalNiveauAccess";

export type LectureAccessState = EvalNiveauAccessState;

/** @deprecated préférer useEvalNiveauAccess(LECTURE_SON_ID, niveauId) */
export function useLectureEvalAccess(niveauId: LectureEvalNiveauId): LectureAccessState {
  return useEvalNiveauAccess(LECTURE_SON_ID, niveauId);
}
