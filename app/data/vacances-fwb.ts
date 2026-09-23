/**
 * Vacances scolaires — Fédération Wallonie-Bruxelles (enseignement obligatoire).
 * Sources : arrêtés du Gouvernement CF / enseignement.be
 */

import type { HoraireJour } from "./horaire-semaine";
import { HORAIRE_JOURS } from "./horaire-semaine";

function getWeekStartMonday(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayNum = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dayNum}`;
}

function addWeeksToWeekStart(weekStart: string, deltaWeeks: number): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaWeeks * 7);
  return getWeekStartMonday(date);
}

export type VacancesPeriode = {
  label: string;
  /** Inclusive, YYYY-MM-DD */
  from: string;
  /** Inclusive, YYYY-MM-DD */
  to: string;
};

/** Périodes de vacances (pas les jours fériés isolés : 11 novembre, Ascension…). */
export const VACANCES_FWB: VacancesPeriode[] = [
  // 2025-2026
  { label: "Toussaint", from: "2025-10-20", to: "2025-10-31" },
  { label: "Noël", from: "2025-12-22", to: "2026-01-02" },
  { label: "Carnaval", from: "2026-02-16", to: "2026-02-27" },
  { label: "Pâques", from: "2026-04-27", to: "2026-05-08" },
  { label: "Grandes vacances", from: "2026-07-04", to: "2026-08-23" },
  // 2026-2027 — année jusqu’au vendredi 2 juillet 2027
  { label: "Toussaint", from: "2026-10-19", to: "2026-10-30" },
  { label: "Noël", from: "2026-12-21", to: "2027-01-01" },
  { label: "Carnaval", from: "2027-02-22", to: "2027-03-05" },
  { label: "Pâques", from: "2027-04-26", to: "2027-05-07" },
  { label: "Grandes vacances", from: "2027-07-03", to: "2027-08-29" },
];

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateOfWeekDay(weekStart: string, jour: HoraireJour): Date {
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, m - 1, d + HORAIRE_JOURS.indexOf(jour));
  return date;
}

/** Vendredi 2 juillet de l’année scolaire qui contient cette semaine. */
export function dateFinAnneeScolaire(weekStart: string): Date {
  const [y, month] = weekStart.split("-").map(Number);
  const endYear = month >= 8 ? y + 1 : y;
  return new Date(endYear, 6, 2);
}

export function vacancesPourSemaine(weekStart: string): VacancesPeriode | null {
  const monday = parseYmd(weekStart);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  for (const periode of VACANCES_FWB) {
    const from = parseYmd(periode.from);
    const to = parseYmd(periode.to);
    if (monday <= to && friday >= from) return periode;
  }
  return null;
}

export function isSemaineVacances(weekStart: string): boolean {
  return vacancesPourSemaine(weekStart) != null;
}

/** Lundis de semaines de cours, du lundi affiché jusqu’au 2 juillet (jour inclus). */
export function semainesScolairesJusquaFinAnnee(
  fromWeekStart: string,
  jour: HoraireJour
): string[] {
  const fin = dateFinAnneeScolaire(fromWeekStart);
  const lastWeek = getWeekStartMonday(fin);
  const out: string[] = [];
  let week = fromWeekStart;
  let guard = 0;
  while (week <= lastWeek && guard < 60) {
    guard += 1;
    if (!isSemaineVacances(week)) {
      const jourDate = dateOfWeekDay(week, jour);
      if (jourDate <= fin) out.push(week);
    }
    week = addWeeksToWeekStart(week, 1);
  }
  return out;
}

export function formatFinAnneeLabel(weekStart: string): string {
  const fin = dateFinAnneeScolaire(weekStart);
  return fin.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
}
