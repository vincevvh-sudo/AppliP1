"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { ChatMessagerie } from "../../components/ChatMessagerie";
import {
  getConversationGroupe,
  getConversationDirecte,
  getMessages,
  getPollsByMessageIds,
  sendMessage,
  deleteMessage,
  uploadFileMessagerie,
  subscribeToMessages,
  countUnreadMessages,
  markConversationAsRead,
  votePoll,
} from "../../data/messagerie-storage";
import { getEnfantSession } from "../../../utils/enfant-session";
import type { Message, PollWithDetails } from "../../data/messagerie-storage";
import { supabase } from "../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function EnfantMessageriePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const hasOpenChat = typeParam === "groupe" || typeParam === "direct";
  const convType = typeParam === "groupe" ? "groupe" : "direct";

  const [session, setSession] = useState<{ id: number | string; prenom: string } | null>(null);
  const [convGroupeId, setConvGroupeId] = useState<number | null>(null);
  const [convDirecteId, setConvDirecteId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [elevesById, setElevesById] = useState<Record<string, { prenom: string; nom: string }>>({});
  const [unreadCounts, setUnreadCounts] = useState<{ groupe: number; direct: number }>({
    groupe: 0,
    direct: 0,
  });
  const [pollsByMessageId, setPollsByMessageId] = useState<Record<number, PollWithDetails>>({});

  const conversationId = !hasOpenChat
    ? null
    : convType === "direct"
      ? convDirecteId
      : convGroupeId;

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      router.replace("/enfant");
      return;
    }
    setSession(s);
  }, [router]);

  const fetchConversations = useCallback(async () => {
    const groupe = await getConversationGroupe();
    if (groupe) setConvGroupeId(groupe.id);
    if (session) {
      const directe = await getConversationDirecte(session.id);
      if (directe) setConvDirecteId(directe.id);
      else setConvDirecteId(null);
    }
  }, [session]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return [];
    return getMessages(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (session) fetchConversations();
  }, [session, fetchConversations]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("eleves").select("id, prenom, nom");
      const map: Record<string, { prenom: string; nom: string }> = {};
      (data ?? []).forEach((e: { id: number | string; prenom: string; nom: string }) => {
        map[String(e.id)] = { prenom: e.prenom, nom: e.nom };
      });
      setElevesById(map);
    })();
  }, []);

  useEffect(() => {
    if (!hasOpenChat) {
      setMessages([]);
      setLoading(false);
      return;
    }
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const load = () =>
      getMessages(conversationId).then((msgs) => {
        setMessages(msgs);
        void getPollsByMessageIds(msgs.map((m) => m.id)).then(setPollsByMessageId);
        setLoading(false);
      });
    load();
    const unsub = subscribeToMessages(conversationId, load);
    const interval = setInterval(load, 3000);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [hasOpenChat, conversationId]);

  const handleSend = async (content: string, replyToMessageId?: number | null) => {
    if (!session) {
      throw new Error("Session élève manquante.");
    }
    if (!conversationId) {
      alert(
        "Impossible d'ouvrir la conversation. Dans Supabase → SQL Editor, exécute supabase-messagerie-eleve-id-uuid.sql puis réessaie."
      );
      throw new Error("Pas de conversation");
    }
    const txt = (content || "").trim();
    if (!txt) return;
    const newMsg: Message = {
      id: -Date.now(),
      conversation_id: conversationId,
      author_type: "eleve",
      eleve_id: session.id,
      content: txt,
      reply_to_message_id: replyToMessageId ?? null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    const saved = await sendMessage({
      conversation_id: conversationId,
      author_type: "eleve",
      eleve_id: session.id,
      content: txt,
      reply_to_message_id: replyToMessageId ?? null,
    });
    if (!saved) {
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
      alert(
        "Impossible d'enregistrer le message. Vérifie que supabase-messagerie-eleve-id-uuid.sql a bien été exécuté dans Supabase."
      );
      throw new Error("Échec enregistrement message");
    }
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  };

  const handleSendFile = async (file: File, replyToMessageId?: number | null) => {
    if (!conversationId || !session) {
      alert(
        "Impossible d'ouvrir la conversation. Exécute supabase-messagerie-eleve-id-uuid.sql dans Supabase."
      );
      throw new Error("Pas de conversation");
    }
    const url = await uploadFileMessagerie(file);
    if (!url) throw new Error("Erreur upload");
    const saved = await sendMessage({
      conversation_id: conversationId,
      author_type: "eleve",
      eleve_id: session.id,
      content: "",
      attachment_url: url,
      attachment_type: file.type,
      attachment_name: file.name,
      reply_to_message_id: replyToMessageId ?? null,
    });
    if (!saved) {
      alert(
        "Impossible d'enregistrer le fichier. Vérifie supabase-messagerie-eleve-id-uuid.sql dans Supabase."
      );
      throw new Error("Échec enregistrement fichier");
    }
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  };

  const handleDelete = async (messageId: number) => {
    const result = await deleteMessage(messageId);
    if (!result.ok) {
      alert(result.error ?? "Impossible de supprimer ce message.");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setPollsByMessageId((prev) => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  };

  const handleRefresh = useCallback(async () => {
    if (conversationId) {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
      const polls = await getPollsByMessageIds(msgs.map((m) => m.id));
      setPollsByMessageId(polls);
    }
  }, [conversationId]);

  const handleVotePoll = useCallback(
    async (pollId: number, optionId: number) => {
      if (!session) return;
      const ok = await votePoll({
        pollId,
        optionId,
        voterType: "eleve",
        voterEleveId: session.id,
      });
      if (ok) await handleRefresh();
      else alert("Vote impossible : le sondage est peut-être clôturé.");
    },
    [session, handleRefresh]
  );

  const refreshUnreadCounts = useCallback(async () => {
    if (!session) return;
    const viewer = { role: "eleve" as const, eleveId: session.id };
    let groupe = 0;
    let direct = 0;
    if (convGroupeId) {
      const msgs = await getMessages(convGroupeId);
      groupe = countUnreadMessages(msgs, convGroupeId, viewer);
    }
    if (convDirecteId) {
      const msgs = await getMessages(convDirecteId);
      direct = countUnreadMessages(msgs, convDirecteId, viewer);
    }
    setUnreadCounts({ groupe, direct });
  }, [session, convGroupeId, convDirecteId]);

  useEffect(() => {
    if (!session || !conversationId) return;
    markConversationAsRead(conversationId, { role: "eleve", eleveId: session.id });
    void refreshUnreadCounts();
  }, [session, conversationId, messages, refreshUnreadCounts]);

  useEffect(() => {
    if (!session) return;
    void refreshUnreadCounts();
    const interval = setInterval(() => {
      void refreshUnreadCounts();
    }, 5000);
    return () => clearInterval(interval);
  }, [session, refreshUnreadCounts]);

  const titre = convType === "groupe" ? "Groupe classe" : "Messages avec mon maître / ma maîtresse";

  if (!session) return null;

  return (
    <main className="relative min-h-screen text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <Link
            href="/enfant"
            className="flex min-w-0 items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            <span className="truncate">Messagerie</span>
          </Link>
          {hasOpenChat ? (
            <Link
              href="/enfant/messagerie"
              className="shrink-0 rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Conversations
            </Link>
          ) : (
            <Link
              href="/enfant"
              className="shrink-0 rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Retour
            </Link>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-6">
        {!hasOpenChat ? (
          <div className="space-y-3">
            <p className="mb-2 text-sm text-[#2d4a3e]/80">Choisis une conversation :</p>
            <Link
              href="/enfant/messagerie?type=groupe"
              className="flex items-center justify-between rounded-2xl bg-white/95 px-5 py-4 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/30"
            >
              <div>
                <p className="font-display text-lg text-[#2d4a3e]">Groupe classe</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">Messages avec toute la classe</p>
              </div>
              {unreadCounts.groupe > 0 && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {unreadCounts.groupe}
                </span>
              )}
            </Link>
            <Link
              href="/enfant/messagerie?type=direct"
              className="flex items-center justify-between rounded-2xl bg-white/95 px-5 py-4 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/30"
            >
              <div>
                <p className="font-display text-lg text-[#2d4a3e]">Avec mon maître / ma maîtresse</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">Messages privés</p>
              </div>
              {unreadCounts.direct > 0 && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {unreadCounts.direct}
                </span>
              )}
            </Link>
          </div>
        ) : loading ? (
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        ) : !conversationId ? (
          <div className="rounded-2xl bg-white/95 p-6 shadow-lg">
            <p className="font-medium text-[#b45309]">
              Impossible d&apos;ouvrir cette conversation pour le moment.
            </p>
            <p className="mt-2 text-sm text-[#2d4a3e]/80">
              Demande à ton maître ou ta maîtresse de mettre à jour la base (script
              supabase-messagerie-eleve-id-uuid.sql), puis réessaie.
            </p>
            <Link href="/enfant/messagerie" className="mt-4 inline-block text-sm font-medium text-[#4a7c5a]">
              ← Retour aux conversations
            </Link>
          </div>
        ) : (
          <ChatMessagerie
            messages={messages}
            authorType="eleve"
            eleveId={session.id}
            elevesById={elevesById}
            onSend={handleSend}
            onSendFile={handleSendFile}
            onDelete={handleDelete}
            canSendPdf
            onRefresh={handleRefresh}
            titreConversation={titre}
            pollsByMessageId={pollsByMessageId}
            onVotePoll={handleVotePoll}
            compactMobile
          />
        )}
      </div>
    </main>
  );
}

export default function EnfantMessageriePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#2d4a3e]">Chargement…</div>}>
      <EnfantMessageriePageInner />
    </Suspense>
  );
}
