/**
 * Bulletins du mois envoyés aux enfants (Supabase).
 * Table bulletins_envoyes (eleve_id, section_id, section_title, sent_at, data).
 */

import { supabase } from "../../utils/supabase";
import type { NiveauAcquisition } from "./bulletin-storage";
import { getResultatsByEleve } from "./resultats-storage";
import {
  BULLETIN_SYNTHESE_CATEGORIES,
  computeSyntheseBulletin,
  isTeacherEncodedResultat,
  type SyntheseBulletin,
} from "./bulletin-synthese";

export type BulletinEnvoyeLigne = {
  libelle: string;
  enfant?: NiveauAcquisition | null;
  enseignant?: NiveauAcquisition | null;
  commentaire: string;
};

/** Snapshot de la synthèse des évaluations (page 1 du bulletin). */
export type BulletinEnvoyeSyntheseRow = {
  label: string;
  maxPoints: number;
  P1: { points: number; pointsMax: number };
  P2: { points: number; pointsMax: number };
  P3: { points: number; pointsMax: number };
};

export type BulletinEnvoyeData = {
  sectionTitle: string;
  commentaireMois: string;
  /** Commentaire global sous la synthèse des évaluations. */
  commentaireSynthese?: string;
  /** Tableau de synthèse (points par période) au moment de l'envoi. */
  synthese?: BulletinEnvoyeSyntheseRow[];
  comportement: BulletinEnvoyeLigne[];
  attendus: BulletinEnvoyeLigne[];
};

export type BulletinEnvoyeRow = {
  id: number;
  eleve_id: string;
  section_id: string;
  section_title: string;
  sent_at: string;
  data: BulletinEnvoyeData;
};

function formatSupabaseError(error: unknown): string {
  const e = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  } | null;
  if (!e) return "Erreur inconnue Supabase";
  const parts = [
    e.code ? `code=${e.code}` : null,
    e.message ?? null,
    e.details ? `details=${e.details}` : null,
    e.hint ? `hint=${e.hint}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" | ") : "Erreur inconnue Supabase";
}

export async function saveBulletinEnvoye(
  eleveId: string,
  sectionId: string,
  sectionTitle: string,
  data: BulletinEnvoyeData
): Promise<void> {
  const { error } = await supabase.from("bulletins_envoyes").insert({
    eleve_id: String(eleveId),
    section_id: sectionId,
    section_title: sectionTitle,
    data,
  });
  if (error) {
    throw new Error(formatSupabaseError(error));
  }
}

export async function getBulletinsByEleve(
  eleveId: string
): Promise<BulletinEnvoyeRow[]> {
  const { data, error } = await supabase
    .from("bulletins_envoyes")
    .select("*")
    .eq("eleve_id", String(eleveId))
    .order("sent_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as BulletinEnvoyeRow[];
}

export async function getBulletinEnvoyeById(
  id: number
): Promise<BulletinEnvoyeRow | null> {
  const { data, error } = await supabase
    .from("bulletins_envoyes")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as BulletinEnvoyeRow;
}

export async function getAllBulletinsEnvoyes(): Promise<BulletinEnvoyeRow[]> {
  const { data, error } = await supabase.from("bulletins_envoyes").select("*");
  if (error || !data) return [];
  return data as BulletinEnvoyeRow[];
}

export function syntheseToEnvoyeRows(synthese: SyntheseBulletin): BulletinEnvoyeSyntheseRow[] {
  return BULLETIN_SYNTHESE_CATEGORIES.map((cat) => ({
    label: cat.label,
    maxPoints: cat.maxPoints,
    P1: synthese[cat.id].P1,
    P2: synthese[cat.id].P2,
    P3: synthese[cat.id].P3,
  }));
}

/** Synthèse calculée seulement à partir des notes encodées par l’enseignant. */
export async function chargerSyntheseEncodéePourEleve(
  eleveId: string
): Promise<SyntheseBulletin> {
  const rows = await getResultatsByEleve(eleveId);
  return computeSyntheseBulletin(rows.filter(isTeacherEncodedResultat));
}

/**
 * Réécrit la synthèse des bulletins déjà envoyés : on garde les attendus / commentaires,
 * on remplace les points par ceux encodés seulement (pas les exercices à la maison).
 */
export async function nettoyerSynthesesBulletinsEnvoyes(): Promise<{ ok: number; fail: number }> {
  const bulletins = await getAllBulletinsEnvoyes();
  const cache = new Map<string, BulletinEnvoyeSyntheseRow[]>();
  let ok = 0;
  let fail = 0;

  for (const row of bulletins) {
    const eleveId = String(row.eleve_id);
    if (!cache.has(eleveId)) {
      const rows = await getResultatsByEleve(eleveId);
      const synthese = computeSyntheseBulletin(rows.filter(isTeacherEncodedResultat));
      cache.set(eleveId, syntheseToEnvoyeRows(synthese));
    }

    let data: Record<string, unknown> = {};
    try {
      data =
        typeof row.data === "string"
          ? (JSON.parse(row.data) as Record<string, unknown>)
          : { ...((row.data as Record<string, unknown> | null) ?? {}) };
    } catch {
      data = {};
    }
    data.synthese = cache.get(eleveId);

    const { error } = await supabase.from("bulletins_envoyes").update({ data }).eq("id", row.id);
    if (error) fail += 1;
    else ok += 1;
  }

  return { ok, fail };
}
