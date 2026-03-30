/**
 * Bulletins du mois envoyés aux enfants (Supabase).
 * Table bulletins_envoyes (eleve_id, section_id, section_title, sent_at, data).
 */

import { supabase } from "../../utils/supabase";
import type { NiveauAcquisition } from "./bulletin-storage";

export type BulletinEnvoyeLigne = {
  libelle: string;
  enfant?: NiveauAcquisition | null;
  enseignant?: NiveauAcquisition | null;
  commentaire: string;
};

export type BulletinEnvoyeData = {
  sectionTitle: string;
  commentaireMois: string;
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
