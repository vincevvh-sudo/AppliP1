/**
 * Programmation P1 par mois — attendus issus du document "Programmation par mois.pdf".
 * Chaque item est proposé avec les 3 visages (enfant/enseignant) et la partie commentaire dans le bulletin.
 */

import type { SectionAttendus } from "./bulletin-storage";

/**
 * Nouvelle structure pour la programmation par mois.
 *
 * - On garde uniquement les 10 premiers attendus historiques
 *   (ceux d'août / septembre), qui sont répétés chaque mois.
 * - On réorganise par mois puis par matière :
 *   - Français (4 sous-parties : lire, écrire, écouter, parler)
 *   - Maths (4 sous-parties : arithmétique et algèbre, grandeur, espace et géométrie, traitement de données)
 *   - Sciences
 *   - FMTTN
 *   - Éveil historique
 *   - Éveil géographique
 *   - Formation éco. et sociale
 */

type BaseAttendu = { id: string; libelle: string };

const BASE_ATTENDUS: BaseAttendu[] = [
  {
    id: "base-1",
    libelle:
      "3.2.1 et 3.2.2 Lire avec exactitude et rapidité: sons a, e, i, o, u, é, ê, è, m et l (fluence); lecture des prénoms de la classe.",
  },
  {
    id: "base-2",
    libelle:
      "3.3.3 Faire des hypothèses et les vérifier: 1º et 4º de couverture, les textes narratifs.",
  },
  {
    id: "base-3",
    libelle:
      "4.2.1 et 4.7.1 Correspondances graphophonétiques et lettres correctes: sons calligraphie a, e, i, o, u, é, ê, è, m et l; calligraphie des chiffres; calligraphie du prénom; dictée des voyelles, m et l.",
  },
  {
    id: "base-4",
    libelle:
      "2.2.1 Identifier et discriminer des phonèmes: la conscience phono des voyelles.",
  },
  {
    id: "base-5",
    libelle:
      "2.2.1 Identifier et discriminer des phonèmes: la conscience phono m et l.",
  },
  {
    id: "base-6",
    libelle:
      "2.5.1 Connaître et comprendre les mots usuels et le vocabulaire scolaire.",
  },
  {
    id: "base-7",
    libelle:
      "2.3.2, 2.3.3, 2.3.6 et 2.3.9 Représentation mentale, hypothèses, sens global, impressions — textes narratifs.",
  },
  {
    id: "base-8",
    libelle:
      "2.3.4 Formuler une info explicite: Trop de bruit! (activité 1).",
  },
  {
    id: "base-9",
    libelle:
      "2.1.1 Citer les paramètres de la communication: Qui fait quoi et où? (activité 2).",
  },
  {
    id: "base-10",
    libelle: "1.7.1 Respecter les règles de prise de parole.",
  },
];

export type BulletinMonthId =
  | "aout-sept"
  | "octobre"
  | "novembre"
  | "decembre"
  | "janvier"
  | "fevrier"
  | "mars"
  | "avril"
  | "mai"
  | "juin";

export const BULLETIN_MONTHS: { id: BulletinMonthId; label: string }[] = [
  { id: "aout-sept", label: "Août et septembre" },
  { id: "octobre", label: "Octobre" },
  { id: "novembre", label: "Novembre" },
  { id: "decembre", label: "Décembre" },
  { id: "janvier", label: "Janvier" },
  { id: "fevrier", label: "Février" },
  { id: "mars", label: "Mars" },
  { id: "avril", label: "Avril" },
  { id: "mai", label: "Mai" },
  { id: "juin", label: "Juin" },
];

type SubjectId =
  | "francais"
  | "maths"
  | "sciences"
  | "fmttn"
  | "eveil-histo"
  | "eveil-geo"
  | "formation-eco-sociale";

type SubpartId =
  | "lire"
  | "ecrire"
  | "ecouter"
  | "parler"
  | "arithmetique-algebre"
  | "grandeur"
  | "espace-geo"
  | "traitement-donnees";

export const BULLETIN_SUBJECTS: Array<
  | {
      id: SubjectId;
      label: string;
      subparts?: never;
    }
  | {
      id: SubjectId;
      label: string;
      subparts: { id: SubpartId; label: string }[];
    }
> = [
  {
    id: "francais",
    label: "Français",
    subparts: [
      { id: "lire", label: "Lire" },
      { id: "ecrire", label: "Écrire" },
      { id: "ecouter", label: "Écouter" },
      { id: "parler", label: "Parler" },
    ],
  },
  {
    id: "maths",
    label: "Maths",
    subparts: [
      { id: "arithmetique-algebre", label: "Arithmétique et algèbre" },
      { id: "grandeur", label: "Grandeur" },
      { id: "espace-geo", label: "Espace et géométrie" },
      { id: "traitement-donnees", label: "Traitement de données" },
    ],
  },
  { id: "sciences", label: "Sciences" },
  { id: "fmttn", label: "FMTTN" },
  { id: "eveil-histo", label: "Éveil historique" },
  { id: "eveil-geo", label: "Éveil géographique" },
  { id: "formation-eco-sociale", label: "Formation éco. et sociale" },
];

function makeSectionId(
  monthId: BulletinMonthId,
  subjectId: SubjectId,
  subpartId?: SubpartId
): string {
  return subpartId
    ? `mois-${monthId}-${subjectId}-${subpartId}`
    : `mois-${monthId}-${subjectId}`;
}

function makeSectionTitle(
  monthLabel: string,
  subjectLabel: string,
  subpartLabel?: string
): string {
  if (subpartLabel) {
    return `${monthLabel} — ${subjectLabel} — ${subpartLabel}`;
  }
  return `${monthLabel} — ${subjectLabel}`;
}

function cloneBaseAttendus(): { id: string; libelle: string }[] {
  // On garde les mêmes IDs pour que les évaluations restent cohérentes
  return BASE_ATTENDUS.map((a) => ({ id: a.id, libelle: a.libelle }));
}

function buildSections(): SectionAttendus[] {
  const sections: SectionAttendus[] = [];

  for (const month of BULLETIN_MONTHS) {
    for (const subject of BULLETIN_SUBJECTS) {
      if ("subparts" in subject && subject.subparts) {
        for (const sub of subject.subparts) {
          const id = makeSectionId(month.id, subject.id, sub.id);
          const titre = makeSectionTitle(month.label, subject.label, sub.label);

          // On ne pré-remplit les 10 attendus de base que dans Français > Lire.
          const attendus =
            subject.id === "francais" && sub.id === "lire"
              ? cloneBaseAttendus()
              : [];

          sections.push({ id, titre, attendus });
        }
      } else {
        const id = makeSectionId(month.id, subject.id);
        const titre = makeSectionTitle(month.label, subject.label);
        sections.push({ id, titre, attendus: [] });
      }
    }
  }

  return sections;
}

export const PROGRAMMATION_SECTIONS: SectionAttendus[] = buildSections();

