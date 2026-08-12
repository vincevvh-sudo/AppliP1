/**
 * Partage des jours de rendez-vous parents → élèves.
 * Table : rendez_vous_partages (jour, eleve_id)
 * eleve_id = "0" => toute la classe.
 */

import { supabase } from "../../utils/supabase";

const TABLE = "rendez_vous_partages";
export const RDV_PARTAGE_TOUS = "0";

function isTableMissingError(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "").toUpperCase();
  if (code === "42P01" || code === "PGRST205") return true;
  const msg = (err.message ?? "").toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table")
  );
}

export async function getPartageRendezVousJourState(
  jour: string
): Promise<{ toAll: boolean; eleveIds: string[]; error?: string }> {
  const { data, error } = await supabase.from(TABLE).select("eleve_id").eq("jour", jour);
  if (error) {
    if (isTableMissingError(error)) {
      return { toAll: false, eleveIds: [], error: "table_missing" };
    }
    return { toAll: false, eleveIds: [], error: error.message };
  }
  const rows = (data ?? []) as { eleve_id: string | number }[];
  if (rows.some((r) => String(r.eleve_id) === RDV_PARTAGE_TOUS)) {
    return { toAll: true, eleveIds: [] };
  }
  return {
    toAll: false,
    eleveIds: rows.map((r) => String(r.eleve_id)).filter((id) => id !== RDV_PARTAGE_TOUS),
  };
}

/** Remplace le partage d’un jour : toute la classe, une liste d’élèves, ou aucun (retirer). */
export async function setPartageRendezVousJour(
  jour: string,
  toAll: boolean,
  eleveIds: string[] = []
): Promise<{ ok: boolean; error?: string; info?: string }> {
  const { error: delError } = await supabase.from(TABLE).delete().eq("jour", jour);
  if (delError) {
    if (isTableMissingError(delError)) {
      return {
        ok: false,
        error:
          "Table manquante : exécute supabase-rendez-vous-partages.sql dans Supabase → SQL Editor.",
      };
    }
    return { ok: false, error: delError.message };
  }

  if (toAll) {
    const { error } = await supabase.from(TABLE).insert({ jour, eleve_id: RDV_PARTAGE_TOUS });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const unique = [...new Set(eleveIds.map(String).filter((id) => id && id !== RDV_PARTAGE_TOUS))];
  if (unique.length === 0) return { ok: true }; // partage retiré

  const { error } = await supabase
    .from(TABLE)
    .insert(unique.map((eleve_id) => ({ jour, eleve_id })));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Jours (YYYY-MM-DD) pour lesquels l’élève (ou toute la classe) a accès aux créneaux. */
export async function getJoursRendezVousPartagesPourEleve(
  eleveId: string | number
): Promise<string[]> {
  const id = String(eleveId);
  const { data: all, error: errAll } = await supabase
    .from(TABLE)
    .select("jour")
    .eq("eleve_id", RDV_PARTAGE_TOUS);
  if (errAll) {
    if (isTableMissingError(errAll)) return [];
    return [];
  }
  const { data: indiv } = await supabase.from(TABLE).select("jour").eq("eleve_id", id);
  const set = new Set<string>();
  for (const r of all ?? []) {
    if (r.jour) set.add(String(r.jour));
  }
  for (const r of indiv ?? []) {
    if (r.jour) set.add(String(r.jour));
  }
  return [...set];
}
