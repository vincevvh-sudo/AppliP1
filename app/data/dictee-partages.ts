/**
 * Partage des dictées de syllabes aux élèves (1 dictée à la fois).
 * Table Supabase : dictee_partages (eleve_id, dictee_num).
 * eleve_id = 0 => partagé à tous pour la dictée dictee_num (1 à 5).
 * Créer la table avec supabase-dictee-partages.sql
 */

import { supabase } from "../../utils/supabase";
import { NOMBRE_DICTEES } from "./dictee-scores-storage";

const ELEVE_ID_TOUS = 0;
/** Numéros de dictées (1 à 10 ; emplacements 6-10 prévus pour plus tard). */
export const DICTEE_NUMS = Array.from({ length: NOMBRE_DICTEES }, (_, i) => i + 1) as number[];

/** Liste des numéros de dictées (1, 2, 3) partagées avec tous les élèves. */
export async function getDicteesPartageesPourTous(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from("dictee_partages")
      .select("dictee_num")
      .eq("eleve_id", ELEVE_ID_TOUS);
    if (error) return [];
    const nums = (data ?? []).map((r: { dictee_num: number }) => r.dictee_num).filter((n) => n >= 1 && n <= NOMBRE_DICTEES);
    return [...new Set(nums)].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/** Partage ou retire une dictée pour tous les élèves (dicteeNum = 1, 2 ou 3). Si partager=true, supprime d’abord tout partage ciblé pour cette dictée. */
export async function setDicteePartageePourTous(
  dicteeNum: number,
  partager: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES) return { ok: false, error: `Dictée 1 à ${NOMBRE_DICTEES}` };
  try {
    const { error: delErr } = await supabase
      .from("dictee_partages")
      .delete()
      .eq("dictee_num", dicteeNum);
    if (delErr) return { ok: false, error: delErr.message };
    if (partager) {
      const { error } = await supabase
        .from("dictee_partages")
        .insert([{ eleve_id: ELEVE_ID_TOUS, dictee_num: dicteeNum }]);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** True si au moins une dictée est partagée avec tous (rétrocompatibilité). */
export async function isDicteesSharedToAll(): Promise<boolean> {
  const list = await getDicteesPartageesPourTous();
  return list.length > 0;
}

/** Ancienne API : partager toutes les dictées ou aucune. On garde pour compat. */
export async function setDicteesSharedToAll(partager: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    if (partager) {
      for (const num of DICTEE_NUMS) {
        const r = await setDicteePartageePourTous(num, true);
        if (!r.ok) return r;
      }
    } else {
      const { error } = await supabase.from("dictee_partages").delete().eq("eleve_id", ELEVE_ID_TOUS);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Numéros des dictées (1, 2, 3) visibles pour cet élève (partage à tous OU partage à cet élève). */
export async function getDicteesPartagesPourEleve(eleveId: number | string): Promise<number[]> {
  try {
    const eleveIdNumber = typeof eleveId === "number" ? eleveId : Number(eleveId);
    if (!Number.isFinite(eleveIdNumber)) {
      return await getDicteesPartageesPourTous();
    }
    const { data, error } = await supabase
      .from("dictee_partages")
      .select("dictee_num")
      .in("eleve_id", [ELEVE_ID_TOUS, eleveIdNumber]);
    if (error) return [];
    const nums = (data ?? []).map((r: { dictee_num: number }) => r.dictee_num).filter((n) => n >= 1 && n <= NOMBRE_DICTEES);
    return [...new Set(nums)].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/** Pour l’enseignant : état du partage d’une dictée (tous ou un élève). */
export async function getDicteePartageInfo(dicteeNum: number): Promise<{
  partageTous: boolean;
  eleveId: string | number | null;
}> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES) return { partageTous: false, eleveId: null };
  try {
    const { data, error } = await supabase
      .from("dictee_partages")
      .select("eleve_id")
      .eq("dictee_num", dicteeNum);
    if (error) return { partageTous: false, eleveId: null };
    const rows = (data ?? []) as { eleve_id: number }[];
    const tous = rows.some((r) => r.eleve_id === ELEVE_ID_TOUS);
    const eleveRow = rows.find((r) => r.eleve_id !== ELEVE_ID_TOUS);
    return {
      partageTous: tous,
      eleveId: eleveRow ? eleveRow.eleve_id : null,
    };
  } catch {
    return { partageTous: false, eleveId: null };
  }
}

/** Partager une dictée avec un seul élève (retire le partage « tous » pour cette dictée). */
export async function setDicteePartageePourEleve(
  dicteeNum: number,
  eleveId: string | number | null
): Promise<{ ok: boolean; error?: string }> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES) return { ok: false, error: `Dictée 1 à ${NOMBRE_DICTEES}` };
  try {
    const { error: delErr } = await supabase
      .from("dictee_partages")
      .delete()
      .eq("dictee_num", dicteeNum);
    if (delErr) return { ok: false, error: delErr.message };
    if (eleveId != null) {
      const { error: insErr } = await supabase
        .from("dictee_partages")
        .insert([{ eleve_id: eleveId, dictee_num: dicteeNum }]);
      if (insErr) return { ok: false, error: insErr.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Alias pour compatibilité. */
export const getDicteesPartagePourEleve = getDicteesPartagesPourEleve;
