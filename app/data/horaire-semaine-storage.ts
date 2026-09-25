/**
 * Horaire de la semaine — partagé (Supabase) + cache local.
 * Table dédiée : horaire_semaine (supabase-horaire-semaine.sql).
 * Si elle n’existe pas encore : repli dans semainier_semaine (ligne sentinelle).
 */

import { supabase } from "../../utils/supabase";
import {
  emptyHoraireSemaine,
  horaireHasContent,
  HORAIRE_JOURS,
  TOUS_CRENEAUX,
  type HoraireCreneau,
  type HoraireJour,
  type HoraireSemaineData,
} from "./horaire-semaine";

const STORAGE_KEY = "horaire-classe";
const TABLE = "horaire_semaine";
const FALLBACK_TABLE = "semainier_semaine";
const FALLBACK_WEEK = "1900-01-01";
const FALLBACK_TYPE = "horaire-classe";

type Store = Record<string, HoraireSemaineData>;

function isTableMissingError(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "").toUpperCase();
  if (code === "42P01" || code === "PGRST205") return true;
  const msg = (err.message ?? "").toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table") ||
    msg.includes("undefined table")
  );
}

function readLocalStore(): Store {
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

function writeLocalStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function normalizeWeek(data: HoraireSemaineData | undefined): HoraireSemaineData {
  const empty = emptyHoraireSemaine();
  if (!data || typeof data !== "object") return empty;
  for (const jour of HORAIRE_JOURS) {
    const day = data[jour];
    if (!day || typeof day !== "object") continue;
    const next: Partial<Record<HoraireCreneau, string>> = {};
    for (const creneau of TOUS_CRENEAUX) {
      const val = day[creneau];
      if (typeof val === "string" && val.trim()) next[creneau] = val;
    }
    empty[jour] = next;
  }
  return empty;
}

function saveLocalWeek(weekStart: string, data: HoraireSemaineData): void {
  const store = readLocalStore();
  store[weekStart] = data;
  writeLocalStore(store);
}

/** Lecture cache navigateur (SSR / affichage immédiat). */
export function loadHoraireSemaine(weekStart: string): HoraireSemaineData {
  return normalizeWeek(readLocalStore()[weekStart]);
}

let backend: "dedicated" | "fallback" | null = null;

async function detectBackend(): Promise<"dedicated" | "fallback"> {
  if (backend) return backend;
  const { error } = await supabase.from(TABLE).select("week_start").limit(1);
  if (error && isTableMissingError(error)) {
    backend = "fallback";
    return backend;
  }
  backend = "dedicated";
  return backend;
}

async function loadFallbackStore(): Promise<Store> {
  const { data, error } = await supabase
    .from(FALLBACK_TABLE)
    .select("data")
    .eq("week_start", FALLBACK_WEEK)
    .maybeSingle();
  if (error || !data?.data || typeof data.data !== "object") return {};
  const raw = data.data as { _type?: string; weeks?: Store };
  if (raw._type !== FALLBACK_TYPE || !raw.weeks || typeof raw.weeks !== "object") return {};
  const out: Store = {};
  for (const [week, value] of Object.entries(raw.weeks)) {
    out[week] = normalizeWeek(value);
  }
  return out;
}

async function saveFallbackStore(store: Store): Promise<{ ok: boolean; error?: string }> {
  const payload = {
    week_start: FALLBACK_WEEK,
    data: { _type: FALLBACK_TYPE, weeks: store },
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from(FALLBACK_TABLE).upsert(payload, { onConflict: "week_start" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getHoraireSemaine(weekStart: string): Promise<HoraireSemaineData> {
  const local = loadHoraireSemaine(weekStart);
  const mode = await detectBackend();

  if (mode === "dedicated") {
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("week_start", weekStart)
      .maybeSingle();
    if (!error && data?.data) {
      const cloud = normalizeWeek(data.data as HoraireSemaineData);
      saveLocalWeek(weekStart, cloud);
      return cloud;
    }
    if (horaireHasContent(local)) {
      await saveHoraireSemaineCloud(weekStart, local);
    }
    return local;
  }

  const all = await loadFallbackStore();
  const cloud = normalizeWeek(all[weekStart]);
  if (horaireHasContent(cloud)) {
    saveLocalWeek(weekStart, cloud);
    return cloud;
  }
  if (horaireHasContent(local)) {
    all[weekStart] = local;
    await saveFallbackStore(all);
  }
  return local;
}

async function saveHoraireSemaineCloud(weekStart: string, data: HoraireSemaineData): Promise<void> {
  const mode = await detectBackend();
  if (mode === "dedicated") {
    await supabase.from(TABLE).upsert(
      {
        week_start: weekStart,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "week_start" }
    );
    return;
  }
  const all = await loadFallbackStore();
  all[weekStart] = data;
  await saveFallbackStore(all);
}

export async function saveHoraireSemaine(
  weekStart: string,
  data: HoraireSemaineData
): Promise<HoraireSemaineData> {
  const next = normalizeWeek(data);
  saveLocalWeek(weekStart, next);
  await saveHoraireSemaineCloud(weekStart, next);
  return next;
}

export async function setHoraireCase(
  weekStart: string,
  jour: HoraireJour,
  creneau: HoraireCreneau,
  texte: string
): Promise<HoraireSemaineData> {
  const data = await getHoraireSemaine(weekStart);
  const next: HoraireSemaineData = {
    ...data,
    [jour]: { ...data[jour], [creneau]: texte },
  };
  return saveHoraireSemaine(weekStart, next);
}

export async function setHoraireCaseSurSemaines(
  weekStarts: string[],
  jour: HoraireJour,
  creneau: HoraireCreneau,
  texte: string
): Promise<void> {
  if (weekStarts.length === 0) return;
  const mode = await detectBackend();
  if (mode === "fallback") {
    const all = await loadFallbackStore();
    const local = readLocalStore();
    for (const week of weekStarts) {
      const data = normalizeWeek(all[week] ?? local[week]);
      all[week] = {
        ...data,
        [jour]: { ...data[jour], [creneau]: texte },
      };
      saveLocalWeek(week, all[week]);
    }
    await saveFallbackStore(all);
    return;
  }
  for (const week of weekStarts) {
    await setHoraireCase(week, jour, creneau, texte);
  }
}

/** Envoie le semainier déjà tapé sur cet ordinateur vers le site (une fois). */
export async function pushLocalHoraireToCloud(): Promise<number> {
  const local = readLocalStore();
  const weeks = Object.keys(local).filter((week) => horaireHasContent(local[week]));
  if (weeks.length === 0) return 0;
  const mode = await detectBackend();
  let uploaded = 0;
  if (mode === "fallback") {
    const all = await loadFallbackStore();
    for (const week of weeks) {
      if (!horaireHasContent(all[week])) {
        all[week] = normalizeWeek(local[week]);
        uploaded += 1;
      }
    }
    if (uploaded > 0) await saveFallbackStore(all);
    return uploaded;
  }
  for (const week of weeks) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("week_start", week)
      .maybeSingle();
    const cloud = !error && data?.data ? normalizeWeek(data.data as HoraireSemaineData) : emptyHoraireSemaine();
    if (!horaireHasContent(cloud)) {
      await saveHoraireSemaineCloud(week, normalizeWeek(local[week]));
      uploaded += 1;
    }
  }
  return uploaded;
}
