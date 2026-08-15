"use client";

import { PartageEvalNiveauForm } from "./PartageEvalNiveauForm";
import { LECTURE_SON_ID, type LectureEvalNiveauId } from "../data/lecture-eval-partage";

type Props = {
  niveauId: LectureEvalNiveauId;
  titre: string;
};

/** Partage des évaluations lecture (Français). */
export function PartageLectureEvalForm({ niveauId, titre }: Props) {
  return (
    <PartageEvalNiveauForm
      sonId={LECTURE_SON_ID}
      niveauId={niveauId}
      titre={titre}
      description={`Comme pour les autres évaluations de Français : « ${titre} » n'apparaît dans l'espace élève que si tu le partages ici (à tous ou aux enfants choisis).`}
    />
  );
}
