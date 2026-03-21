/**
 * Partage des sons aux élèves via Supabase
 * eleve_id = 0 => partagé à tous les élèves
 */

import { supabase } from "../../utils/supabase";

export type PartageRow = {
  son_id: string;
  eleve_id: number;
};

export async function isSonSharedToAll(sonId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .eq("eleve_id", 0)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getElevesForSon(sonId: string): Promise<number[]> {
  try {
    const { data } = await supabase
      .from("sons_partages")
      .select("eleve_id")
      .eq("son_id", sonId)
      .neq("eleve_id", 0);
    return (data ?? []).map((r) => r.eleve_id);
  } catch {
    return [];
  }
}

export async function shareToAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").upsert(
    [{ son_id: sonId, eleve_id: 0 }],
    { onConflict: "son_id,eleve_id" }
  );
}

export async function shareToEleves(sonId: string, eleveIds: number[]): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).neq("eleve_id", 0);
  if (eleveIds.length > 0) {
    await supabase
      .from("sons_partages")
      .insert(eleveIds.map((id) => ({ son_id: sonId, eleve_id: id })));
  }
}

export async function unshareFromAll(sonId: string): Promise<void> {
  await supabase.from("sons_partages").delete().eq("son_id", sonId).eq("eleve_id", 0);
}

export async function getSharedSonsForEleve(eleveId: number): Promise<string[]> {
  try {
    const { data: all } = await supabase
      .from("sons_partages")
      .select("son_id")
      .eq("eleve_id", 0);
    const { data: indiv } = await supabase
      .from("sons_partages")
      .select("son_id")
      .eq("eleve_id", eleveId);
    const ids = new Set<string>();
    (all ?? []).forEach((r) => ids.add(r.son_id));
    (indiv ?? []).forEach((r) => ids.add(r.son_id));
    return Array.from(ids);
  } catch {
    return [];
  }
}
