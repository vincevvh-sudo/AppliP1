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
  sendMessage,
  uploadFileMessagerie,
  subscribeToMessages,
} from "../../data/messagerie-storage";
import { getEnfantSession } from "../../../utils/enfant-session";
import type { Message } from "../../data/messagerie-storage";
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
  const convType = typeParam === "groupe" ? "groupe" : "direct";

  const [session, setSession] = useState<{ id: number | string; prenom: string } | null>(null);
  const [convGroupeId, setConvGroupeId] = useState<number | null>(null);
  const [convDirecteId, setConvDirecteId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [elevesById, setElevesById] = useState<Record<string, { prenom: string; nom: string }>>({});

  const conversationId = convType === "direct" ? convDirecteId : convGroupeId;

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
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
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
  }, [conversationId]);

  const handleSend = async (content: string) => {
    if (!conversationId || !session) return;
    const txt = (content || "").trim();
    if (!txt) return;
    const newMsg: Message = {
      id: -Date.now(),
      conversation_id: conversationId,
      author_type: "eleve",
      eleve_id: session.id,
      content: txt,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    const saved = await sendMessage({
      conversation_id: conversationId,
      author_type: "eleve",
      eleve_id: session.id,
      content: txt,
    });
    if (!saved) {
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
      alert("Impossible d'enregistrer le message.");
      return;
    }
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  };

  const handleSendFile = async (file: File) => {
    if (!conversationId || !session) return;
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
    });
    if (saved) {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (conversationId) {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    }
  }, [conversationId]);

  const titre = convType === "groupe" ? "Groupe classe" : "Messages avec mon maître / ma maîtresse";

  if (!session) return null;

  return (
    <main className="relative min-h-screen text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Messagerie
          </Link>
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-6">
        <div className="mb-4 flex gap-2">
          <Link
            href="/enfant/messagerie?type=groupe"
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              convType === "groupe"
                ? "bg-[#4a7c5a] text-white"
                : "bg-white/80 text-[#2d4a3e]"
            }`}
          >
            Groupe classe
          </Link>
          <Link
            href="/enfant/messagerie?type=direct"
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              convType === "direct"
                ? "bg-[#4a7c5a] text-white"
                : "bg-white/80 text-[#2d4a3e]"
            }`}
          >
            Avec mon maître / ma maîtresse
          </Link>
        </div>

        {loading ? (
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        ) : (
          <ChatMessagerie
            messages={messages}
            authorType="eleve"
            eleveId={session.id}
            elevesById={elevesById}
            onSend={handleSend}
            onSendFile={handleSendFile}
            canSendPdf
            onRefresh={handleRefresh}
            titreConversation={titre}
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
