/**
 * Messagerie : conversations et messages
 */

import { supabase } from "../../utils/supabase";

export type Conversation = {
  id: number;
  type: "groupe" | "direct";
  eleve_id: number | string | null;
  created_at?: string;
};

export type Message = {
  id: number;
  conversation_id: number;
  author_type: "enseignant" | "eleve";
  eleve_id: number | string | null;
  content: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  created_at?: string;
};

/** Récupère ou crée la conversation groupe. */
export async function getConversationGroupe(): Promise<Conversation | null> {
  let { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("type", "groupe")
    .is("eleve_id", null)
    .maybeSingle();
  if (error) return null;
  if (data) return data as Conversation;
  const { data: inserted, error: errInsert } = await supabase
    .from("conversations")
    .insert({ type: "groupe", eleve_id: null })
    .select()
    .single();
  if (errInsert || !inserted) return null;
  return inserted as Conversation;
}

/** Récupère ou crée la conversation directe entre enseignant et un élève. */
export async function getConversationDirecte(eleveId: number | string): Promise<Conversation | null> {
  let { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("type", "direct")
    .eq("eleve_id", eleveId)
    .maybeSingle();
  if (error) return null;
  if (data) return data as Conversation;
  const { data: inserted, error: errInsert } = await supabase
    .from("conversations")
    .insert({ type: "direct", eleve_id: eleveId })
    .select()
    .single();
  if (errInsert || !inserted) return null;
  return inserted as Conversation;
}

/** Crée les conversations directes pour tous les élèves (si pas encore fait). */
export async function ensureConversationsPourTousEleves(): Promise<void> {
  const { data: eleves } = await supabase.from("eleves").select("id");
  if (!eleves?.length) return;
  for (const e of eleves as { id: number }[]) {
    await getConversationDirecte(e.id);
  }
}

/** Supprime les conversations directes dont l'élève n'existe plus (orphelines). */
export async function deleteConversationsOrphelines(): Promise<void> {
  const { data: eleves } = await supabase.from("eleves").select("id");
  const ids = new Set(
    ((eleves ?? []) as { id: number | string }[]).map((e) => String(e.id))
  );
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, eleve_id")
    .eq("type", "direct");
  for (const c of (convs ?? []) as { id: number; eleve_id: number | string | null }[]) {
    if (c.eleve_id != null && !ids.has(String(c.eleve_id))) {
      await supabase.from("messages").delete().eq("conversation_id", c.id);
      await supabase.from("conversations").delete().eq("id", c.id);
    }
  }
}

/** Liste des conversations pour l'enseignant : groupe + une par élève (uniquement élèves encore présents). */
export async function getConversationsEnseignant(): Promise<
  { conversation: Conversation; eleve?: { id: number | string; prenom: string; nom: string } }[]
> {
  await deleteConversationsOrphelines();
  await ensureConversationsPourTousEleves();

  const { data: convs, error: errConvs } = await supabase
    .from("conversations")
    .select("*")
    .order("id", { ascending: true });
  if (errConvs) return [];

  const { data: eleves } = await supabase.from("eleves").select("id, prenom, nom").order("nom").order("prenom");
  const elevesById = Object.fromEntries(
    ((eleves ?? []) as { id: number | string; prenom: string; nom: string }[]).map((e) => [String(e.id), e])
  );

  const result: { conversation: Conversation; eleve?: { id: number | string; prenom: string; nom: string } }[] = [];
  for (const c of (convs ?? []) as Conversation[]) {
    const eleve = c.eleve_id ? elevesById[String(c.eleve_id)] : undefined;
    if (c.type === "groupe" || eleve) {
      result.push({ conversation: c, eleve });
    }
  }
  result.sort((a, b) => {
    if (a.conversation.type === "groupe" && b.conversation.type !== "groupe") return -1;
    if (a.conversation.type !== "groupe" && b.conversation.type === "groupe") return 1;
    const nomA = a.eleve ? `${a.eleve.nom} ${a.eleve.prenom}` : "";
    const nomB = b.eleve ? `${b.eleve.nom} ${b.eleve.prenom}` : "";
    return nomA.localeCompare(nomB);
  });
  return result;
}

/** Récupère les messages d'une conversation. */
export async function getMessages(conversationId: number): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) {
    if (typeof console !== "undefined") console.warn("[messagerie] getMessages error:", error.message);
    return [];
  }
  return (data ?? []) as Message[];
}

/**
 * S'abonne aux nouveaux messages d'une conversation (Realtime).
 * Pour que ça fonctionne, exécuter dans Supabase : alter publication supabase_realtime add table messages;
 * Retourne une fonction pour se désabonner.
 */
export function subscribeToMessages(
  conversationId: number,
  onNewMessage: () => void
): () => void {
  const channelName = `messages:${conversationId}`;
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => onNewMessage()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** Envoie un message (texte et/ou pièce jointe). */
export async function sendMessage(row: {
  conversation_id: number;
  author_type: "enseignant" | "eleve";
  eleve_id?: number | string | null;
  content: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}): Promise<Message | null> {
  const payload: Record<string, unknown> = {
    conversation_id: row.conversation_id,
    author_type: row.author_type,
    eleve_id: row.eleve_id ?? null,
    content: row.content ?? "",
  };
  if (row.attachment_url != null) payload.attachment_url = row.attachment_url;
  if (row.attachment_type != null) payload.attachment_type = row.attachment_type;
  if (row.attachment_name != null) payload.attachment_name = row.attachment_name;

  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[messagerie] Erreur insert message:", error.message, error.details, error.code);
    return null;
  }
  return data as Message;
}

const BUCKET_MESSAGERIE = "messagerie";

/** Upload un fichier et retourne l'URL publique. */
export async function uploadFileMessagerie(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET_MESSAGERIE)
    .upload(name, file, { upsert: false });
  if (error) return null;
  const { data: urlData } = supabase.storage.from(BUCKET_MESSAGERIE).getPublicUrl(data.path);
  return urlData?.publicUrl ?? null;
}
