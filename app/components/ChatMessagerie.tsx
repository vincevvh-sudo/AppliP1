"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "../data/messagerie-storage";

const EMOJIS = ["😊", "😂", "🎉", "👍", "❤️", "🌟", "⭐", "😀", "🎈", "📚", "✏️", "🏠", "🌈", "☀️", "🐱", "🐶", "🌸", "🎵", "🤔", "👋"];

function formatHeure(s: string | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  messages: Message[];
  authorType: "enseignant" | "eleve";
  eleveId?: number | string | null;
  elevesById?: Record<string, { prenom: string; nom: string }>;
  onSend: (content: string) => Promise<void>;
  onSendFile?: (file: File) => Promise<void>;
  canSendPdf?: boolean;
  onRefresh: () => void;
  titreConversation: string;
};

export function ChatMessagerie({
  messages,
  authorType,
  eleveId,
  elevesById = {},
  onSend,
  onSendFile,
  canSendPdf = false,
  onRefresh,
  titreConversation,
}: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = input.trim();
    if (!txt || sending) return;
    setSending(true);
    try {
      await onSend(txt);
      setInput("");
      await onRefresh();
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendFile || uploading) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = canSendPdf && file.type === "application/pdf";
    if (!isImage && !isPdf) {
      alert(canSendPdf ? "Envoie une photo (jpg, png...) ou un PDF." : "Envoie une photo (jpg, png...).");
      return;
    }
    setUploading(true);
    e.target.value = "";
    try {
      await onSendFile(file);
      await onRefresh();
    } finally {
      setUploading(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const acceptFiles = canSendPdf ? "image/*,application/pdf" : "image/*";

  return (
    <div className="flex flex-col rounded-2xl border border-[#2d4a3e]/20 bg-white/95 p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="font-display text-lg text-[#2d4a3e]">{titreConversation}</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
        >
          Rafraîchir
        </button>
      </div>

      <div className="flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto rounded-xl border border-[#2d4a3e]/15 bg-white/80 p-4 space-y-3 mb-4">
        {messages.length === 0 ? (
          <p className="text-center text-[#2d4a3e]/60 py-6">Aucun message. Écris le premier !</p>
        ) : (
          messages.map((m) => {
            const isMine =
              (m.author_type === "enseignant" && authorType === "enseignant") ||
              (m.author_type === "eleve" && eleveId != null && m.eleve_id != null && String(m.eleve_id) === String(eleveId));
            const auteur =
              m.author_type === "enseignant"
                ? "Enseignant"
                : m.eleve_id && elevesById[String(m.eleve_id)]
                  ? `${elevesById[String(m.eleve_id)].prenom}`
                  : "Élève";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <span className={`text-xs text-[#2d4a3e]/60 ${isMine ? "mr-2" : "ml-2"}`}>
                  {auteur} · {formatHeure(m.created_at)}
                </span>
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                    isMine
                      ? "bg-[#4a7c5a] text-white"
                      : "bg-[#e8b4d4]/60 text-[#2d4a3e]"
                  }`}
                >
                  {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                  {m.attachment_url && (
                    <div className="mt-2">
                      {m.attachment_type?.startsWith("image/") ? (
                        <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={m.attachment_url} alt="Pièce jointe" className="max-w-full max-h-48 rounded-lg" />
                        </a>
                      ) : (
                        <a
                          href={m.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-sm"
                        >
                          📎 {m.attachment_name || "Fichier"}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          {onSendFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptFiles}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-xl border-2 border-[#2d4a3e]/30 px-4 py-3 text-[#2d4a3e] hover:bg-[#2d4a3e]/5 disabled:opacity-50 shrink-0"
              >
                {uploading ? "…" : canSendPdf ? "📎 Photo ou PDF" : "📷 Photo"}
              </button>
            </>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écris ton message..."
            maxLength={500}
            className="flex-1 min-w-[150px] rounded-xl border-2 border-[#2d4a3e]/20 px-4 py-3 text-[#2d4a3e] placeholder:text-[#2d4a3e]/50 bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50 shrink-0"
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
