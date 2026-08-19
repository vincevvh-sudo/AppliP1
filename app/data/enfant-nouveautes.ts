/**
 * Pastilles « nouveauté » sur l’accueil enfant.
 * On compare un « snapshot » de ce qui est partagé / disponible
 * avec ce que l’enfant a déjà vu (localStorage).
 */

import { getNiveauxEvalPartagesPourEleve, getSharedSonsForEleve } from "./sons-partages";
import { getDicteesPartagesPourEleve } from "./dictee-partages";
import { getDicteesMotsPartagesPourEleve } from "./dictee-mots-partages";
import { getJoursRendezVousPartagesPourEleve } from "./rendez-vous-partages";
import { getModulesAccessiblesPourEleve } from "./maths-modules-partages-storage";
import {
  getMathsThemesEvaluationsPartagesPourEleve,
  getMathsThemesExercicesPartagesPourEleve,
  getOperationsSeriesPartages,
} from "./maths-partages";
import { getBulletinsByEleve } from "./bulletin-envoye-storage";
import { getResultatsByEleve } from "./resultats-storage";
import {
  getConversationDirecte,
  getConversationGroupe,
  getMessages,
  countUnreadMessages,
} from "./messagerie-storage";
import { supabase } from "../../utils/supabase";
import { isFluenceNiveauId } from "./fluence-partage";

export type EnfantSectionKey =
  | "evaluations"
  | "resultats"
  | "rendezvous"
  | "francais"
  | "maths"
  | "messagerie";

export type EnfantNouveautes = Record<EnfantSectionKey, boolean>;

const STORAGE_KEY = "enfant-nouveautes-seen-v1";

type SeenMap = Record<string, Partial<Record<EnfantSectionKey, string>>>;

function loadSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SeenMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSeen(map: SeenMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function fingerprint(parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((p) => p != null && String(p).length > 0)
    .map(String)
    .sort()
    .join("|");
}

export async function computeEvaluationsSnapshot(eleveId: string | number): Promise<string> {
  const [pairs, dicteesMots, mathsThemes, modules] = await Promise.all([
    getNiveauxEvalPartagesPourEleve(eleveId),
    getDicteesMotsPartagesPourEleve(eleveId as number),
    Promise.resolve(getMathsThemesEvaluationsPartagesPourEleve(eleveId)),
    getModulesAccessiblesPourEleve(eleveId),
  ]);
  const ops = getOperationsSeriesPartages();
  const evalPairs = pairs
    .filter((p) => !isFluenceNiveauId(p.niveau_id))
    .map((p) => `${p.son_id}:${p.niveau_id}`);
  return fingerprint([
    ...evalPairs,
    ...dicteesMots.map((n) => `dm:${n}`),
    ...mathsThemes.map((id) => `mt:${id}`),
    ...modules.map((id) => `mm:${id}`),
    ...ops.map((id) => `op:${id}`),
  ]);
}

export async function computeResultatsSnapshot(eleveId: string | number): Promise<string> {
  const [bulletins, resultats] = await Promise.all([
    getBulletinsByEleve(String(eleveId)),
    getResultatsByEleve(eleveId),
  ]);
  return fingerprint([
    ...bulletins.map((b) => `b:${b.id}`),
    ...resultats.map((r) => `r:${r.id ?? `${r.son_id}-${r.niveau_id}-${r.created_at}`}`),
  ]);
}

export async function computeRendezvousSnapshot(eleveId: string | number): Promise<string> {
  const jours = await getJoursRendezVousPartagesPourEleve(eleveId);
  const today = new Date().toISOString().slice(0, 10);
  const joursFuturs = jours.filter((j) => j >= today);
  if (joursFuturs.length === 0) return "";

  const { data } = await supabase
    .from("rendez_vous_creneaux")
    .select("id, jour, start_time")
    .in("jour", joursFuturs)
    .order("jour")
    .order("start_time");
  const creneaux = (data ?? []) as Array<{ id: number; jour: string; start_time: string }>;
  return fingerprint([
    ...joursFuturs.map((j) => `j:${j}`),
    ...creneaux.map((c) => `c:${c.id}`),
  ]);
}

export async function computeFrancaisSnapshot(eleveId: string | number): Promise<string> {
  const [sons, dictees, pairs] = await Promise.all([
    getSharedSonsForEleve(eleveId),
    getDicteesPartagesPourEleve(eleveId),
    getNiveauxEvalPartagesPourEleve(eleveId),
  ]);
  const fluence = pairs.filter((p) => isFluenceNiveauId(p.niveau_id)).map((p) => p.niveau_id);
  return fingerprint([
    ...sons.map((id) => `s:${id}`),
    ...dictees.map((n) => `d:${n}`),
    ...fluence.map((id) => `f:${id}`),
  ]);
}

export async function computeMathsSnapshot(eleveId: string | number): Promise<string> {
  const [modules, exercicesThemes] = await Promise.all([
    getModulesAccessiblesPourEleve(eleveId),
    Promise.resolve(getMathsThemesExercicesPartagesPourEleve(eleveId)),
  ]);
  const evals = getMathsThemesEvaluationsPartagesPourEleve(eleveId);
  const ops = getOperationsSeriesPartages();
  return fingerprint([
    ...modules.map((id) => `m:${id}`),
    ...exercicesThemes.map((id) => `e:${id}`),
    ...evals.map((id) => `v:${id}`),
    ...ops.map((id) => `o:${id}`),
  ]);
}

export async function computeMessagerieSnapshot(eleveId: string | number): Promise<string> {
  const [groupe, directe] = await Promise.all([
    getConversationGroupe(),
    getConversationDirecte(eleveId),
  ]);
  const viewer = { role: "eleve" as const, eleveId };
  let unread = 0;
  if (groupe) {
    const msgs = await getMessages(groupe.id);
    unread += countUnreadMessages(msgs, groupe.id, viewer);
  }
  if (directe) {
    const msgs = await getMessages(directe.id);
    unread += countUnreadMessages(msgs, directe.id, viewer);
  }
  // Snapshot = nombre de non lus (badge si > 0). On ne stocke pas comme « vu » via fingerprint
  // classique : la messagerie utilise déjà markConversationAsRead.
  return unread > 0 ? `unread:${unread}` : "";
}

export async function computeSectionSnapshot(
  eleveId: string | number,
  section: EnfantSectionKey
): Promise<string> {
  switch (section) {
    case "evaluations":
      return computeEvaluationsSnapshot(eleveId);
    case "resultats":
      return computeResultatsSnapshot(eleveId);
    case "rendezvous":
      return computeRendezvousSnapshot(eleveId);
    case "francais":
      return computeFrancaisSnapshot(eleveId);
    case "maths":
      return computeMathsSnapshot(eleveId);
    case "messagerie":
      return computeMessagerieSnapshot(eleveId);
  }
}

export function getSeenSnapshot(eleveId: string | number, section: EnfantSectionKey): string {
  return loadSeen()[String(eleveId)]?.[section] ?? "";
}

export function markEnfantSectionSeen(
  eleveId: string | number,
  section: EnfantSectionKey,
  snapshot: string
): void {
  const map = loadSeen();
  const key = String(eleveId);
  if (!map[key]) map[key] = {};
  map[key][section] = snapshot;
  saveSeen(map);
}

/** Marque la section comme vue avec le snapshot actuel. */
export async function markEnfantSectionSeenNow(
  eleveId: string | number,
  section: EnfantSectionKey
): Promise<void> {
  const snap = await computeSectionSnapshot(eleveId, section);
  // Pour la messagerie, le « vu » est géré par markConversationAsRead ;
  // on enregistre quand même un snapshot vide une fois lu.
  if (section === "messagerie") {
    markEnfantSectionSeen(eleveId, section, "");
    return;
  }
  markEnfantSectionSeen(eleveId, section, snap);
}

export async function getEnfantNouveautes(
  eleveId: string | number
): Promise<EnfantNouveautes> {
  const sections: EnfantSectionKey[] = [
    "evaluations",
    "resultats",
    "rendezvous",
    "francais",
    "maths",
    "messagerie",
  ];
  const snaps = await Promise.all(sections.map((s) => computeSectionSnapshot(eleveId, s)));
  const out = {} as EnfantNouveautes;
  sections.forEach((section, i) => {
    const current = snaps[i];
    if (!current) {
      out[section] = false;
      return;
    }
    if (section === "messagerie") {
      out[section] = current.startsWith("unread:");
      return;
    }
    const seen = getSeenSnapshot(eleveId, section);
    out[section] = current !== seen;
  });
  return out;
}
