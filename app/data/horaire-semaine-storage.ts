/**
 * Horaire de la semaine — stockage local (journal de classe de l’enseignant).
 */

import {
  emptyHoraireSemaine,
  type HoraireCreneau,
  type HoraireJour,
  type HoraireSemaineData,
} from "./horaire-semaine";

const STORAGE_KEY = "horaire-classe";

type Store = Record<string, HoraireSemaineData>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

function normalizeWeek(data: HoraireSemaineData | undefined): HoraireSemaineData {
  const empty = emptyHoraireSemaine();
  if (!data || typeof data !== "object") return empty;
  for (const jour of Object.keys(empty) as HoraireJour[]) {
    const day = data[jour];
    empty[jour] = day && typeof day === "object" ? { ...day } : {};
  }
  return empty;
}

export function loadHoraireSemaine(weekStart: string): HoraireSemaineData {
  return normalizeWeek(readStore()[weekStart]);
}

export function saveHoraireSemaine(weekStart: string, data: HoraireSemaineData): void {
  const store = readStore();
  store[weekStart] = data;
  writeStore(store);
}

export function setHoraireCase(
  weekStart: string,
  jour: HoraireJour,
  creneau: HoraireCreneau,
  texte: string
): HoraireSemaineData {
  const data = loadHoraireSemaine(weekStart);
  const next: HoraireSemaineData = {
    ...data,
    [jour]: { ...data[jour], [creneau]: texte },
  };
  saveHoraireSemaine(weekStart, next);
  return next;
}

/** Remplit la même case sur plusieurs semaines (une seule écriture localStorage). */
export function setHoraireCaseSurSemaines(
  weekStarts: string[],
  jour: HoraireJour,
  creneau: HoraireCreneau,
  texte: string
): void {
  if (weekStarts.length === 0) return;
  const store = readStore();
  for (const week of weekStarts) {
    const data = normalizeWeek(store[week]);
    store[week] = {
      ...data,
      [jour]: { ...data[jour], [creneau]: texte },
    };
  }
  writeStore(store);
}
