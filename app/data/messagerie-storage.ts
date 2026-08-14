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
  reply_to_message_id?: number | null;
  created_at?: string;
};

export type Poll = {
  id: number;
  message_id: number;
  conversation_id: number;
  question: string;
  closes_at?: string | null;
  created_at?: string;
};

export type PollOption = {
  id: number;
  poll_id: number;
  label: string;
  position: number;
};

export type PollVote = {
  id: number;
  poll_id: number;
  option_id: number;
  voter_type: "enseignant" | "eleve";
  voter_eleve_id?: number | string | null;
  created_at?: string;
};

export type PollWithDetails = Poll & {
  options: PollOption[];
  votes: PollVote[];
};

export type MessagerieViewer =
  | { role: "enseignant" }
  | { role: "eleve"; eleveId: number | string };

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
  const id = String(eleveId);
  let { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("type", "direct")
    .eq("eleve_id", id)
    .maybeSingle();
  if (error) {
    console.error("[messagerie] getConversationDirecte select:", error.message, error.code);
    return null;
  }
  if (data) return data as Conversation;
  const { data: inserted, error: errInsert } = await supabase
    .from("conversations")
    .insert({ type: "direct", eleve_id: id })
    .select()
    .single();
  if (errInsert || !inserted) {
    console.error(
      "[messagerie] getConversationDirecte insert:",
      errInsert?.message,
      errInsert?.code,
      errInsert?.details
    );
    return null;
  }
  return inserted as Conversation;
}

/** Crée les conversations directes pour tous les élèves (si pas encore fait). */
export async function ensureConversationsPourTousEleves(): Promise<void> {
  const { data: eleves } = await supabase.from("eleves").select("id");
  if (!eleves?.length) return;
  for (const e of eleves as { id: number | string }[]) {
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
    .on(
      "postgres_changes",
      {
        event: "DELETE",
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
  reply_to_message_id?: number | null;
}): Promise<Message | null> {
  const payload: Record<string, unknown> = {
    conversation_id: row.conversation_id,
    author_type: row.author_type,
    eleve_id: row.eleve_id != null ? String(row.eleve_id) : null,
    content: row.content ?? "",
  };
  if (row.attachment_url != null) payload.attachment_url = row.attachment_url;
  if (row.attachment_type != null) payload.attachment_type = row.attachment_type;
  if (row.attachment_name != null) payload.attachment_name = row.attachment_name;
  if (row.reply_to_message_id != null) payload.reply_to_message_id = row.reply_to_message_id;

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

/** Supprime un message (et le sondage lié via CASCADE si présent). */
export async function deleteMessage(messageId: number): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .select("id");
  if (error) {
    console.error("[messagerie] Erreur delete message:", error.message, error.details, error.code);
    return { ok: false, error: error.message };
  }
  if (!data?.length) {
    return {
      ok: false,
      error:
        "Suppression refusée par la base. Vérifie que le script SQL supabase-messagerie-repondre-supprimer.sql a bien été exécuté.",
    };
  }
  return { ok: true };
}

/**
 * Efface tous les messages de toutes les conversations (fin d'année).
 * Les conversations (groupe + élèves) sont conservées, vides.
 */
export async function deleteAllMessages(): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.from("messages").delete().neq("id", 0).select("id");
  if (error) {
    console.error("[messagerie] Erreur delete all messages:", error.message, error.details, error.code);
    return { ok: false, error: error.message };
  }
  return { ok: true, error: data?.length ? undefined : "Aucun message à effacer." };
}

export async function createPollMessage(row: {
  conversation_id: number;
  author_type: "enseignant" | "eleve";
  eleve_id?: number | string | null;
  question: string;
  options: string[];
  closes_at?: string | null;
}): Promise<PollWithDetails | null> {
  const question = (row.question || "").trim();
  const cleanedOptions = row.options
    .map((opt) => opt.trim())
    .filter(Boolean)
    .slice(0, 10);
  if (!question || cleanedOptions.length < 2) return null;

  const message = await sendMessage({
    conversation_id: row.conversation_id,
    author_type: row.author_type,
    eleve_id: row.eleve_id ?? null,
    content: `📊 ${question}`,
  });
  if (!message) return null;

  const { data: pollData, error: pollError } = await supabase
    .from("polls")
    .insert({
      message_id: message.id,
      conversation_id: row.conversation_id,
      question,
      closes_at: row.closes_at ?? null,
    })
    .select()
    .single();
  if (pollError || !pollData) return null;

  const optionsPayload = cleanedOptions.map((label, idx) => ({
    poll_id: pollData.id,
    label,
    position: idx,
  }));
  const { data: optionsData, error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionsPayload)
    .select("*")
    .order("position", { ascending: true });
  if (optionsError) return null;

  return {
    ...(pollData as Poll),
    options: (optionsData ?? []) as PollOption[],
    votes: [],
  };
}

export async function getPollsByMessageIds(
  messageIds: number[]
): Promise<Record<number, PollWithDetails>> {
  if (!messageIds.length) return {};
  const { data: pollsData, error: pollsError } = await supabase
    .from("polls")
    .select("*")
    .in("message_id", messageIds);
  if (pollsError || !pollsData?.length) return {};

  const polls = pollsData as Poll[];
  const pollIds = polls.map((p) => p.id);

  const [{ data: optionsData }, { data: votesData }] = await Promise.all([
    supabase
      .from("poll_options")
      .select("*")
      .in("poll_id", pollIds)
      .order("position", { ascending: true }),
    supabase.from("poll_votes").select("*").in("poll_id", pollIds),
  ]);

  const optionsByPollId: Record<number, PollOption[]> = {};
  for (const option of (optionsData ?? []) as PollOption[]) {
    optionsByPollId[option.poll_id] = optionsByPollId[option.poll_id] ?? [];
    optionsByPollId[option.poll_id].push(option);
  }

  const votesByPollId: Record<number, PollVote[]> = {};
  for (const vote of (votesData ?? []) as PollVote[]) {
    votesByPollId[vote.poll_id] = votesByPollId[vote.poll_id] ?? [];
    votesByPollId[vote.poll_id].push(vote);
  }

  const byMessageId: Record<number, PollWithDetails> = {};
  for (const poll of polls) {
    byMessageId[poll.message_id] = {
      ...poll,
      options: optionsByPollId[poll.id] ?? [],
      votes: votesByPollId[poll.id] ?? [],
    };
  }
  return byMessageId;
}

export async function votePoll(row: {
  pollId: number;
  optionId: number;
  voterType: "enseignant" | "eleve";
  voterEleveId?: number | string | null;
}): Promise<boolean> {
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, closes_at")
    .eq("id", row.pollId)
    .maybeSingle();
  if (pollError) {
    console.error("[poll-debug] votePoll poll read error", pollError.message, pollError.details, pollError.code);
    return false;
  }
  if (!poll) {
    console.warn("[poll-debug] votePoll poll not found", { pollId: row.pollId });
    return false;
  }
  if (poll.closes_at && new Date(poll.closes_at).getTime() <= Date.now()) {
    console.warn("[poll-debug] votePoll blocked by closes_at", {
      pollId: row.pollId,
      closesAt: poll.closes_at,
      nowIso: new Date().toISOString(),
      closesAtMs: new Date(poll.closes_at).getTime(),
      nowMs: Date.now(),
    });
    return false;
  }

  const deleteQuery = supabase
    .from("poll_votes")
    .delete()
    .eq("poll_id", row.pollId)
    .eq("voter_type", row.voterType);
  const { error: deleteError } =
    row.voterType === "eleve"
      ? await deleteQuery.eq("voter_eleve_id", row.voterEleveId ?? null)
      : await deleteQuery.is("voter_eleve_id", null);
  if (deleteError) {
    console.error("[poll-debug] votePoll delete previous vote error", deleteError.message, deleteError.details, deleteError.code);
    return false;
  }

  const { error: insertError } = await supabase.from("poll_votes").insert({
    poll_id: row.pollId,
    option_id: row.optionId,
    voter_type: row.voterType,
    voter_eleve_id: row.voterType === "eleve" ? row.voterEleveId ?? null : null,
  });
  if (insertError) {
    console.error("[poll-debug] votePoll insert error", insertError.message, insertError.details, insertError.code);
    return false;
  }
  console.log("[poll-debug] votePoll success", {
    pollId: row.pollId,
    optionId: row.optionId,
    voterType: row.voterType,
    voterEleveId: row.voterEleveId ?? null,
    nowIso: new Date().toISOString(),
  });
  return true;
}

const LAST_READ_KEY = "messagerie-last-read-v1";

function loadLastReadMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLastReadMap(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function getViewerKey(viewer: MessagerieViewer): string {
  if (viewer.role === "enseignant") return "enseignant";
  return `eleve:${String(viewer.eleveId)}`;
}

function getLastReadEntryKey(conversationId: number, viewer: MessagerieViewer): string {
  return `${getViewerKey(viewer)}:${conversationId}`;
}

export function markConversationAsRead(
  conversationId: number,
  viewer: MessagerieViewer,
  atIso?: string
): void {
  const map = loadLastReadMap();
  map[getLastReadEntryKey(conversationId, viewer)] = atIso ?? new Date().toISOString();
  saveLastReadMap(map);
}

export function getConversationLastReadAt(
  conversationId: number,
  viewer: MessagerieViewer
): string | null {
  const map = loadLastReadMap();
  return map[getLastReadEntryKey(conversationId, viewer)] ?? null;
}

function isOwnMessage(message: Message, viewer: MessagerieViewer): boolean {
  if (viewer.role === "enseignant") return message.author_type === "enseignant";
  return (
    message.author_type === "eleve" &&
    message.eleve_id != null &&
    String(message.eleve_id) === String(viewer.eleveId)
  );
}

export function countUnreadMessages(
  messages: Message[],
  conversationId: number,
  viewer: MessagerieViewer
): number {
  const lastRead = getConversationLastReadAt(conversationId, viewer);
  const lastReadMs = lastRead ? new Date(lastRead).getTime() : 0;
  return messages.reduce((count, m) => {
    if (isOwnMessage(m, viewer)) return count;
    const msgMs = m.created_at ? new Date(m.created_at).getTime() : 0;
    if (msgMs > lastReadMs) return count + 1;
    return count;
  }, 0);
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
