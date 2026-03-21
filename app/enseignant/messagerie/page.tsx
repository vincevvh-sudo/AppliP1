"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { ChatMessagerie } from "../../components/ChatMessagerie";
import {
  getConversationsEnseignant,
  getMessages,
  sendMessage,
  getConversationGroupe,
  uploadFileMessagerie,
  subscribeToMessages,
} from "../../data/messagerie-storage";
import type { Conversation, Message } from "../../data/messagerie-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantMessageriePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convIdParam = searchParams.get("conv");
  const conversationId = convIdParam ? parseInt(convIdParam, 10) : null;

  const [conversations, setConversations] = useState<
    { conversation: Conversation; eleve?: { id: string | number; prenom: string; nom: string } }[]
  >([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConv, setCurrentConv] = useState<{
    conversation: Conversation;
    eleve?: { id: string | number; prenom: string; nom: string };
  } | null>(null);

  const fetchConversations = useCallback(async () => {
    await getConversationGroupe();
    const convs = await getConversationsEnseignant();
    setConversations(convs);
    if (convs.length > 0 && !conversationId) {
      setCurrentConv(convs[0]);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  }, [conversationId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const conversationIds = conversations.map((c) => c.conversation.id).join(",");

  useEffect(() => {
    if (conversations.length > 0 && !conversationId) {
      router.replace(`/enseignant/messagerie?conv=${conversations[0].conversation.id}`);
    }
  }, [conversationIds, conversationId, router]);

  useEffect(() => {
    const conv = conversations.find((c) => c.conversation.id === conversationId);
    if (conversationId && !conv && conversations.length > 0) {
      router.replace(`/enseignant/messagerie?conv=${conversations[0].conversation.id}`);
      return;
    }
    if (conversationId) {
      setLoading(true);
      setCurrentConv(conv ?? null);
      const load = () =>
        getMessages(conversationId).then((msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      load();
      const unsub = subscribeToMessages(conversationId, load);
      const interval = setInterval(load, 3000);
      return () => {
        clearInterval(interval);
        unsub();
      };
    } else {
      setCurrentConv(conversations[0] ?? null);
      setMessages([]);
      setLoading(false);
    }
  }, [conversationId, conversationIds, router]);

  const handleSend = async (content: string) => {
    if (!conversationId) return;
    const txt = (content || "").trim();
    if (!txt) return;
    const newMsg: Message = {
      id: -Date.now(),
      conversation_id: conversationId,
      author_type: "enseignant",
      eleve_id: null,
      content: txt,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    const saved = await sendMessage({
      conversation_id: conversationId,
      author_type: "enseignant",
      content: txt,
    });
    if (!saved) {
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
      await handleRefresh();
      alert("Impossible d'enregistrer le message. Exécutez le script supabase-messagerie-fix.sql dans Supabase.");
      return;
    }
    setMessages((prev) => {
      const withoutOptimistic = prev.filter((m) => m.id !== newMsg.id);
      const merged = [...withoutOptimistic, saved];
      merged.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      return merged;
    });
    // Ne pas appeler handleRefresh() ici : il remplaçait la liste et pouvait masquer le message venant d’être envoyé.
  };

  const handleSendFile = async (file: File) => {
    if (!conversationId) return;
    const url = await uploadFileMessagerie(file);
    if (!url) throw new Error("Erreur upload");
    const saved = await sendMessage({
      conversation_id: conversationId,
      author_type: "enseignant",
      content: "",
      attachment_url: url,
      attachment_type: file.type,
      attachment_name: file.name,
    });
    if (saved) {
      setMessages((prev) => {
        const merged = [...prev, saved];
        merged.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        return merged;
      });
    }
  };

  const handleRefresh = useCallback(async () => {
    if (conversationId) {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    }
  }, [conversationId]);

  const elevesById: Record<string, { prenom: string; nom: string }> = {};
  conversations.forEach((c) => {
    if (c.eleve) elevesById[String(c.eleve.id)] = { prenom: c.eleve.prenom, nom: c.eleve.nom };
  });

  const titre =
    currentConv?.conversation.type === "groupe"
      ? "Groupe classe"
      : currentConv?.eleve
        ? `${currentConv.eleve.prenom} ${currentConv.eleve.nom}`
        : "Messagerie";

  return (
    <main className="relative min-h-screen text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Messagerie
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-6">
        <div className="flex gap-4">
          <aside className="w-56 shrink-0 space-y-1 rounded-2xl border border-[#2d4a3e]/20 bg-white/95 p-3">
            <p className="mb-2 text-sm font-medium text-[#2d4a3e]/80">Conversations</p>
            <p className="text-xs text-[#2d4a3e]/60 mb-2">Groupe classe ou message à un élève :</p>
            {conversations.map(({ conversation, eleve }) => (
              <Link
                key={conversation.id}
                href={`/enseignant/messagerie?conv=${conversation.id}`}
                className={`block rounded-xl px-3 py-2 text-sm transition ${
                  conversationId === conversation.id
                    ? "bg-[#4a7c5a] text-white"
                    : "text-[#2d4a3e] hover:bg-[#2d4a3e]/10"
                }`}
              >
                {conversation.type === "groupe"
                  ? "Groupe classe"
                  : eleve
                    ? `${eleve.prenom} ${eleve.nom}`
                    : `Élève #${conversation.eleve_id}`}
              </Link>
            ))}
          </aside>

          <div className="flex-1 min-w-0">
            {!conversationId ? (
              <p className="rounded-2xl bg-white/95 p-8 text-center text-[#2d4a3e]/70">
                Choisis une conversation dans la liste.
              </p>
            ) : loading ? (
              <p className="text-[#2d4a3e]/70">Chargement…</p>
            ) : (
              <ChatMessagerie
                messages={messages}
                authorType="enseignant"
                elevesById={elevesById}
                onSend={handleSend}
                onSendFile={handleSendFile}
                canSendPdf
                onRefresh={handleRefresh}
                titreConversation={titre}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
