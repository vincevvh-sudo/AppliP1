import { supabase } from "../../utils/supabase";
import { NOMBRE_DICTEES_MOTS } from "./dictee-mots-scores-storage";

const ELEVE_ID_TOUS = 0;
export const DICTEE_MOTS_NUMS = Array.from(
  { length: NOMBRE_DICTEES_MOTS },
  (_, i) => i + 1
) as number[];

// Dictées de mots partagées à tous
export async function getDicteesMotsPartageesPourTous(): Promise<number[]> {
  const { data, error } = await supabase
    .from("dictee_mots_partages")
    .select("dictee_num")
    .eq("eleve_id", ELEVE_ID_TOUS);
  if (error) return [];
  const nums = (data ?? []).map((r: { dictee_num: number }) => r.dictee_num);
  return [...new Set(nums)]
    .filter((n) => n >= 1 && n <= NOMBRE_DICTEES_MOTS)
    .sort((a, b) => a - b);
}

// Partager / retirer pour tous
export async function setDicteeMotsPartageePourTous(
  dicteeNum: number,
  partager: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES_MOTS) {
    return { ok: false, error: `Dictée de mots 1 à ${NOMBRE_DICTEES_MOTS}` };
  }
  const { error: delErr } = await supabase
    .from("dictee_mots_partages")
    .delete()
    .eq("dictee_num", dicteeNum);
  if (delErr) return { ok: false, error: delErr.message };
  if (partager) {
    const { error } = await supabase.from("dictee_mots_partages").insert({
      eleve_id: ELEVE_ID_TOUS,
      dictee_num: dicteeNum,
    });
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

// Dictées de mots visibles pour un élève
export async function getDicteesMotsPartagesPourEleve(
  eleveId: number
): Promise<number[]> {
  // Attention : dans cette table, eleve_id est un entier, alors que l'id des élèves
  // dans d'autres tables est un UUID. Pour éviter les erreurs de cast (22P02),
  // on ne filtre ici que sur 0 (partagé à tous) et, si possible, sur un id numérique.
  const possibleIds: number[] = [ELEVE_ID_TOUS];
  if (typeof eleveId === "number" && Number.isFinite(eleveId)) {
    possibleIds.push(eleveId);
  }
  const { data, error } = await supabase
    .from("dictee_mots_partages")
    .select("dictee_num")
    .in("eleve_id", possibleIds);
  if (error) return [];
  const nums = (data ?? []).map((r: { dictee_num: number }) => r.dictee_num);
  return [...new Set(nums)]
    .filter((n) => n >= 1 && n <= NOMBRE_DICTEES_MOTS)
    .sort((a, b) => a - b);
}

// Info enseignant : partagé à tous / élève
export async function getDicteeMotsPartageInfo(dicteeNum: number): Promise<{
  partageTous: boolean;
  eleveId: number | null;
}> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES_MOTS) {
    return { partageTous: false, eleveId: null };
  }
  const { data, error } = await supabase
    .from("dictee_mots_partages")
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
}

// Partager avec un seul élève
export async function setDicteeMotsPartageePourEleve(
  dicteeNum: number,
  eleveId: number | null
): Promise<{ ok: boolean; error?: string }> {
  if (dicteeNum < 1 || dicteeNum > NOMBRE_DICTEES_MOTS) {
    return { ok: false, error: `Dictée de mots 1 à ${NOMBRE_DICTEES_MOTS}` };
  }
  const { error: delErr } = await supabase
    .from("dictee_mots_partages")
    .delete()
    .eq("dictee_num", dicteeNum);
  if (delErr) return { ok: false, error: delErr.message };
  if (eleveId != null) {
    const { error: insErr } = await supabase
      .from("dictee_mots_partages")
      .insert({ eleve_id: eleveId, dictee_num: dicteeNum });
    if (insErr) return { ok: false, error: insErr.message };
  }
  return { ok: true };
}