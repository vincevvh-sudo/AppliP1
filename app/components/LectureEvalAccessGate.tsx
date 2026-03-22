"use client";

import { EvalNiveauAccessGate } from "./EvalNiveauAccessGate";
import { LECTURE_SON_ID, type LectureEvalNiveauId } from "../data/lecture-eval-partage";

type Props = {
  niveauId: LectureEvalNiveauId;
  children: React.ReactNode;
};

export function LectureEvalAccessGate({ niveauId, children }: Props) {
  return (
    <EvalNiveauAccessGate sonId={LECTURE_SON_ID} niveauId={niveauId} matiereLabel="Lecture">
      {children}
    </EvalNiveauAccessGate>
  );
}
