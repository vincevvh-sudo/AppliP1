/**
 * Semainier scolaire (lun–ven) : leçons, devoirs, à savoir.
 * Table Supabase : semainier_semaine (voir supabase-semainier.sql)
 * Fallback localStorage si la table est absente.
 */

import { supabase } from "../../utils/supabase";

export const SEMAINIER_JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"] as const;
export type SemainierJour = (typeof SEMAINIER_JOURS)[number];

export const SEMAINIER_SECTIONS = [
  { id: "lecons", label: "Leçons" },
  { id: "devoirs", label: "Devoirs" },
  { id: "a_savoir", label: "À savoir" },
] as const;
export type SemainierSectionId = (typeof SEMAINIER_SECTIONS)[number]["id"];

export type SemainierJourData = Record<SemainierSectionId, string>;
export type SemainierData = Record<SemainierJour, SemainierJourData>;

const LOCAL_KEY = "semainier_semaine";
const TABLE = "semainier_semaine";

export const JOUR_LABELS: Record<SemainierJour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
};

export function emptySemainier(): SemainierData {
  const emptyDay = (): SemainierJourData => ({ lecons: "", devoirs: "", a_savoir: "" });
  return {
    lundi: emptyDay(),
    mardi: emptyDay(),
    mercredi: emptyDay(),
    jeudi: emptyDay(),
    vendredi: emptyDay(),
  };
}

/** Lundi (local) de la semaine contenant `date`, au format YYYY-MM-DD. */
export function getWeekStartMonday(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayNum = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dayNum}`;
}

export function addWeeksToWeekStart(weekStart: string, deltaWeeks: number): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaWeeks * 7);
  return getWeekStartMonday(date);
}

export function formatWeekRangeLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startLabel = start.toLocaleDateString("fr-BE", opts);
  const endLabel = end.toLocaleDateString("fr-BE", { ...opts, year: "numeric" });
  return `Semaine du ${startLabel} au ${endLabel}`;
}

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

function normalizeData(raw: unknown): SemainierData {
  const base = emptySemainier();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  for (const jour of SEMAINIER_JOURS) {
    const day = obj[jour];
    if (!day || typeof day !== "object") continue;
    const dayObj = day as Record<string, unknown>;
    for (const section of SEMAINIER_SECTIONS) {
      const val = dayObj[section.id];
      if (typeof val === "string") base[jour][section.id] = val;
    }
  }
  return base;
}

function loadLocal(weekStart: string): SemainierData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, unknown>;
    if (!(weekStart in all)) return null;
    return normalizeData(all[weekStart]);
  } catch {
    return null;
  }
}

function saveLocal(weekStart: string, data: SemainierData): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const all: Record<string, SemainierData> = raw ? JSON.parse(raw) : {};
    all[weekStart] = data;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export async function getSemainier(weekStart: string): Promise<{
  data: SemainierData;
  modeLocal?: boolean;
  error?: string;
}> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    if (isTableMissingError(error)) {
      return { data: loadLocal(weekStart) ?? emptySemainier(), modeLocal: true };
    }
    const local = loadLocal(weekStart);
    return {
      data: local ?? emptySemainier(),
      modeLocal: Boolean(local),
      error: error.message,
    };
  }

  if (data?.data != null) {
    const normalized = normalizeData(data.data);
    saveLocal(weekStart, normalized);
    return { data: normalized };
  }

  const local = loadLocal(weekStart);
  return { data: local ?? emptySemainier(), modeLocal: Boolean(local) };
}

export async function saveSemainier(
  weekStart: string,
  data: SemainierData
): Promise<{ ok: boolean; modeLocal?: boolean; error?: string; info?: string }> {
  saveLocal(weekStart, data);

  const payload = {
    week_start: weekStart,
    data,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "week_start" });
  if (error) {
    if (isTableMissingError(error)) {
      return {
        ok: true,
        modeLocal: true,
        info:
          "Semainier enregistré sur ce navigateur. Pour le partager à tous les appareils et aux enfants, exécute supabase-semainier.sql dans Supabase → SQL Editor.",
      };
    }
    return { ok: false, error: error.message, modeLocal: true };
  }
  return { ok: true };
}

export function semainierHasContent(data: SemainierData): boolean {
  return SEMAINIER_JOURS.some((jour) =>
    SEMAINIER_SECTIONS.some((s) => (data[jour][s.id] ?? "").trim().length > 0)
  );
}
