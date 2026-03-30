/**
 * Exercice « Les instruments de mesure » — associer chaque image à un type de mesure.
 * Images : public/instruments-mesure/01.png … 22.png (08 absent).
 */

export const TITRE_INSTRUMENTS_MESURE = "Les instruments de mesure";

export type CategorieInstrumentId =
  | "temps"
  | "masse"
  | "longueurs"
  | "capacite"
  | "prix"
  | "temperature";

export type CategorieInstrument = {
  id: CategorieInstrumentId;
  /** Libellé affiché (boutons) */
  label: string;
};

export const CATEGORIES_INSTRUMENTS: CategorieInstrument[] = [
  { id: "temps", label: "Mesure de temps" },
  { id: "masse", label: "Mesure de masse" },
  { id: "longueurs", label: "Mesure de longueurs" },
  { id: "capacite", label: "Mesure de capacité" },
  { id: "prix", label: "Mesure de prix" },
  { id: "temperature", label: "Mesure de température" },
];

export type InstrumentMesureItem = {
  id: string;
  imageSrc: string;
  correct: CategorieInstrumentId;
};

/** Ordre des images (numérotation fournie) ; 08 manquant. */
export const ITEMS_INSTRUMENTS_MESURE: InstrumentMesureItem[] = [
  { id: "01", imageSrc: "/instruments-mesure/01.png", correct: "temperature" },
  { id: "02", imageSrc: "/instruments-mesure/02.png", correct: "longueurs" },
  { id: "03", imageSrc: "/instruments-mesure/03.png", correct: "masse" },
  { id: "04", imageSrc: "/instruments-mesure/04.png", correct: "capacite" },
  { id: "05", imageSrc: "/instruments-mesure/05.png", correct: "temps" },
  { id: "06", imageSrc: "/instruments-mesure/06.png", correct: "temps" },
  { id: "07", imageSrc: "/instruments-mesure/07.png", correct: "temps" },
  { id: "09", imageSrc: "/instruments-mesure/09.png", correct: "longueurs" },
  { id: "10", imageSrc: "/instruments-mesure/10.png", correct: "temperature" },
  { id: "11", imageSrc: "/instruments-mesure/11.png", correct: "capacite" },
  { id: "12", imageSrc: "/instruments-mesure/12.png", correct: "temperature" },
  { id: "13", imageSrc: "/instruments-mesure/13.png", correct: "longueurs" },
  { id: "14", imageSrc: "/instruments-mesure/14.png", correct: "prix" },
  { id: "15", imageSrc: "/instruments-mesure/15.png", correct: "longueurs" },
  { id: "16", imageSrc: "/instruments-mesure/16.png", correct: "temps" },
  { id: "17", imageSrc: "/instruments-mesure/17.png", correct: "temps" },
  { id: "18", imageSrc: "/instruments-mesure/18.png", correct: "capacite" },
  { id: "19", imageSrc: "/instruments-mesure/19.png", correct: "temps" },
  { id: "20", imageSrc: "/instruments-mesure/20.png", correct: "prix" },
  { id: "21", imageSrc: "/instruments-mesure/21.png", correct: "masse" },
  { id: "22", imageSrc: "/instruments-mesure/22.png", correct: "longueurs" },
];

export function melangerInstruments<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
