"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, PollWithDetails } from "../data/messagerie-storage";

const EMOJIS = ["😊", "😂", "🎉", "👍", "❤️", "🌟", "⭐", "😀", "🎈", "📚", "✏️", "🏠", "🌈", "☀️", "🐱", "🐶", "🌸", "🎵", "🤔", "👋"];

function formatHeure(s: string | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

function parseLocalDateTimeToIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day ||
    d.getHours() !== hour ||
    d.getMinutes() !== minute
  ) {
    return null;
  }
  return d.toISOString();
}

function nowAsLocalInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function messagePreview(
  m: Message | undefined,
  pollsByMessageId: Record<number, PollWithDetails>
): string {
  if (!m) return "Message supprimé";
  if (pollsByMessageId[m.id]) return `📊 ${pollsByMessageId[m.id].question}`;
  if (m.content?.trim()) {
    const t = m.content.trim();
    return t.length > 80 ? `${t.slice(0, 80)}…` : t;
  }
  if (m.attachment_type?.startsWith("image/")) return "📷 Photo";
  if (m.attachment_url) return `📎 ${m.attachment_name || "Fichier"}`;
  return "Message";
}

function authorLabel(
  m: Message,
  elevesById: Record<string, { prenom: string; nom: string }>
): string {
  if (m.author_type === "enseignant") return "Enseignant";
  if (m.eleve_id && elevesById[String(m.eleve_id)]) {
    return elevesById[String(m.eleve_id)].prenom;
  }
  return "Élève";
}

type ContextMenuState = {
  message: Message;
  x: number;
  y: number;
  canDelete: boolean;
};

type Props = {
  messages: Message[];
  authorType: "enseignant" | "eleve";
  eleveId?: number | string | null;
  elevesById?: Record<string, { prenom: string; nom: string }>;
  onSend: (content: string, replyToMessageId?: number | null) => Promise<void>;
  onSendFile?: (file: File, replyToMessageId?: number | null) => Promise<void>;
  onDelete?: (messageId: number) => Promise<void>;
  canSendPdf?: boolean;
  onRefresh: () => void;
  titreConversation: string;
  pollsByMessageId?: Record<number, PollWithDetails>;
  canCreatePoll?: boolean;
  onCreatePoll?: (payload: { question: string; options: string[]; closesAt?: string | null }) => Promise<void>;
  onVotePoll?: (pollId: number, optionId: number) => Promise<void>;
  /** Sur mobile : zone de messages plus haute (plein écran). */
  compactMobile?: boolean;
};

export function ChatMessagerie({
  messages,
  authorType,
  eleveId,
  elevesById = {},
  onSend,
  onSendFile,
  onDelete,
  canSendPdf = false,
  onRefresh,
  titreConversation,
  pollsByMessageId = {},
  canCreatePoll = false,
  onCreatePoll,
  onVotePoll,
  compactMobile = false,
}: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [pollOption3, setPollOption3] = useState("");
  const [pollDeadline, setPollDeadline] = useState("");
  const [selectedPoll, setSelectedPoll] = useState<PollWithDetails | null>(null);
  const [nowLocalMin, setNowLocalMin] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesById = Object.fromEntries(messages.map((m) => [m.id, m]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setNowLocalMin(nowAsLocalInputValue());
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  const isMineMessage = (m: Message) =>
    (m.author_type === "enseignant" && authorType === "enseignant") ||
    (m.author_type === "eleve" &&
      eleveId != null &&
      m.eleve_id != null &&
      String(m.eleve_id) === String(eleveId));

  const canDeleteMessage = (m: Message) => {
    if (!onDelete) return false;
    if (authorType === "enseignant") return true;
    return isMineMessage(m);
  };

  const openContextMenu = (e: { clientX: number; clientY: number; preventDefault: () => void }, m: Message) => {
    e.preventDefault();
    const pad = 8;
    const menuW = 180;
    const menuH = canDeleteMessage(m) ? 96 : 52;
    const x = Math.min(e.clientX, window.innerWidth - menuW - pad);
    const y = Math.min(e.clientY, window.innerHeight - menuH - pad);
    setContextMenu({
      message: m,
      x: Math.max(pad, x),
      y: Math.max(pad, y),
      canDelete: canDeleteMessage(m),
    });
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = input.trim();
    if (!txt || sending) return;
    setSending(true);
    try {
      await onSend(txt, replyTo?.id ?? null);
      setInput("");
      setReplyTo(null);
      await onRefresh();
    } catch {
      // garde le texte saisi pour pouvoir réessayer
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
      await onSendFile(file, replyTo?.id ?? null);
      setReplyTo(null);
      await onRefresh();
    } finally {
      setUploading(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleDelete = async (m: Message) => {
    if (!onDelete || deletingId != null) return;
    if (confirmDeleteId !== m.id) {
      setConfirmDeleteId(m.id);
      return;
    }
    setDeletingId(m.id);
    setConfirmDeleteId(null);
    try {
      await onDelete(m.id);
      if (replyTo?.id === m.id) setReplyTo(null);
      await onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const acceptFiles = canSendPdf ? "image/*,application/pdf" : "image/*";

  const handleCreatePoll = async () => {
    if (!onCreatePoll || creatingPoll) return;
    const question = pollQuestion.trim();
    const options = [pollOption1, pollOption2, pollOption3].map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2) {
      alert("Ajoute une question et au moins 2 options.");
      return;
    }
    setCreatingPoll(true);
    try {
      const closesAt = pollDeadline ? parseLocalDateTimeToIso(pollDeadline) : null;
      if (typeof window !== "undefined") {
        console.log("[poll-debug] create", {
          pollDeadlineInput: pollDeadline,
          closesAtIso: closesAt,
          nowIso: new Date().toISOString(),
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        });
      }
      if (pollDeadline && !closesAt) {
        alert("Date limite invalide. Utilise le sélecteur de date.");
        return;
      }
      if (closesAt && new Date(closesAt).getTime() <= Date.now()) {
        alert("La date limite doit être dans le futur.");
        return;
      }
      await onCreatePoll({ question, options, closesAt });
      setPollQuestion("");
      setPollOption1("");
      setPollOption2("");
      setPollOption3("");
      setPollDeadline("");
      setShowPollForm(false);
      await onRefresh();
    } finally {
      setCreatingPoll(false);
    }
  };

  const getMyVoteOptionId = (poll: PollWithDetails): number | null => {
    const mine = poll.votes.find((v) =>
      authorType === "enseignant"
        ? v.voter_type === "enseignant"
        : v.voter_type === "eleve" && eleveId != null && String(v.voter_eleve_id) === String(eleveId)
    );
    return mine?.option_id ?? null;
  };

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

      <div
        className={`flex-1 overflow-y-auto rounded-xl border border-[#2d4a3e]/15 bg-white/80 p-4 space-y-3 mb-4 ${
          compactMobile
            ? "min-h-[40vh] max-h-[min(70vh,calc(100dvh-14rem))] sm:min-h-[200px] sm:max-h-[50vh]"
            : "min-h-[200px] max-h-[50vh]"
        }`}
      >
        {messages.length === 0 ? (
          <p className="text-center text-[#2d4a3e]/60 py-6">Aucun message. Écris le premier !</p>
        ) : (
          messages.map((m) => {
            const isMine = isMineMessage(m);
            const auteur = authorLabel(m, elevesById);
            const replied = m.reply_to_message_id != null ? messagesById[m.reply_to_message_id] : undefined;
            const showDelete = canDeleteMessage(m);
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <span className={`text-xs text-[#2d4a3e]/60 ${isMine ? "mr-2" : "ml-2"}`}>
                  {auteur} · {formatHeure(m.created_at)}
                </span>
                <div
                  onContextMenu={(e) => openContextMenu(e, m)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    if (!touch) return;
                    clearLongPress();
                    const { clientX, clientY } = touch;
                    longPressTimer.current = setTimeout(() => {
                      openContextMenu(
                        { clientX, clientY, preventDefault: () => undefined },
                        m
                      );
                    }, 500);
                  }}
                  onTouchEnd={clearLongPress}
                  onTouchMove={clearLongPress}
                  onTouchCancel={clearLongPress}
                  className={`rounded-2xl px-4 py-2 max-w-[85%] select-none ${
                    isMine
                      ? "bg-[#4a7c5a] text-white"
                      : "bg-[#e8b4d4]/60 text-[#2d4a3e]"
                  } ${deletingId === m.id ? "opacity-50" : ""}`}
                >
                  {m.reply_to_message_id != null && (
                    <div
                      className={`mb-2 rounded-lg border-l-4 px-2 py-1 text-xs ${
                        isMine
                          ? "border-white/70 bg-black/15 text-white/90"
                          : "border-[#4a7c5a] bg-[#2d4a3e]/8 text-[#2d4a3e]/80"
                      }`}
                    >
                      <p className="font-semibold">
                        {replied ? authorLabel(replied, elevesById) : "Message"}
                      </p>
                      <p className="truncate">{messagePreview(replied, pollsByMessageId)}</p>
                    </div>
                  )}
                  {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                  {pollsByMessageId[m.id] && (() => {
                    const poll = pollsByMessageId[m.id];
                    const totalVotes = poll.votes.length;
                    const isClosed = !!(poll.closes_at && new Date(poll.closes_at).getTime() <= Date.now());
                    const myVoteOptionId = getMyVoteOptionId(poll);
                    return (
                      <div className="mt-2 rounded-xl border border-[#2d4a3e]/20 bg-white/90 p-3 text-[#2d4a3e]">
                        <p className="font-semibold">📊 {poll.question}</p>
                        <p className="mt-1 text-xs text-[#2d4a3e]/70">
                          {isClosed
                            ? "Sondage clôturé"
                            : poll.closes_at
                              ? `Ouvert jusqu'au ${new Date(poll.closes_at).toLocaleString("fr-BE")}`
                              : "Pas de date limite"}
                        </p>
                        <p className="mt-1 text-[10px] text-[#2d4a3e]/50">
                          debug: closes_at={poll.closes_at ?? "null"} | now={new Date().toISOString()}
                        </p>
                        <div className="mt-2 space-y-2">
                          {poll.options.map((opt) => {
                            const count = poll.votes.filter((v) => v.option_id === opt.id).length;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => !isClosed && onVotePoll ? onVotePoll(poll.id, opt.id) : undefined}
                                disabled={isClosed || !onVotePoll}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                                  myVoteOptionId === opt.id
                                    ? "border-[#4a7c5a] bg-[#4a7c5a]/10"
                                    : "border-[#2d4a3e]/20 bg-white"
                                } disabled:opacity-70`}
                              >
                                {opt.label} ({count})
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPoll(poll)}
                          className="mt-2 text-xs underline"
                        >
                          Voir le récapitulatif ({totalVotes} réponse{totalVotes > 1 ? "s" : ""})
                        </button>
                      </div>
                    );
                  })()}
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
                <div className={`mt-1 flex flex-wrap items-center gap-2 ${isMine ? "mr-1 justify-end" : "ml-1 justify-start"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setReplyTo(m);
                    }}
                    className="rounded-lg border border-[#2d4a3e]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#2d4a3e] shadow-sm hover:bg-[#2d4a3e]/5"
                  >
                    Répondre
                  </button>
                  {showDelete && (
                    confirmDeleteId === m.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleDelete(m)}
                          disabled={deletingId === m.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                        >
                          {deletingId === m.id ? "Suppression…" : "Oui, supprimer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-[#2d4a3e]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#2d4a3e] shadow-sm"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleDelete(m)}
                        disabled={deletingId === m.id}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 shadow-sm hover:bg-red-200 disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-[#4a7c5a]/30 bg-[#4a7c5a]/10 px-3 py-2">
          <div className="min-w-0 flex-1 border-l-4 border-[#4a7c5a] pl-2">
            <p className="text-xs font-semibold text-[#2d4a3e]">
              Répondre à {authorLabel(replyTo, elevesById)}
            </p>
            <p className="truncate text-sm text-[#2d4a3e]/80">
              {messagePreview(replyTo, pollsByMessageId)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="rounded-lg px-2 py-1 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/10"
            aria-label="Annuler la réponse"
          >
            ✕
          </button>
        </div>
      )}

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
          {canCreatePoll && onCreatePoll && (
            <button
              type="button"
              onClick={() => setShowPollForm((v) => !v)}
              className="rounded-xl border-2 border-[#2d4a3e]/30 px-4 py-3 text-[#2d4a3e] hover:bg-[#2d4a3e]/5 shrink-0"
            >
              📊 Sondage
            </button>
          )}
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
            placeholder={replyTo ? "Écris ta réponse..." : "Écris ton message..."}
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
        {showPollForm && canCreatePoll && onCreatePoll && (
          <div className="mt-2 rounded-xl border border-[#2d4a3e]/20 bg-[#fef9f3] p-3 space-y-2">
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Question du sondage"
              maxLength={200}
              className="w-full rounded-lg border border-[#2d4a3e]/20 px-3 py-2"
            />
            <input
              type="text"
              value={pollOption1}
              onChange={(e) => setPollOption1(e.target.value)}
              placeholder="Option 1"
              maxLength={120}
              className="w-full rounded-lg border border-[#2d4a3e]/20 px-3 py-2"
            />
            <input
              type="text"
              value={pollOption2}
              onChange={(e) => setPollOption2(e.target.value)}
              placeholder="Option 2"
              maxLength={120}
              className="w-full rounded-lg border border-[#2d4a3e]/20 px-3 py-2"
            />
            <input
              type="text"
              value={pollOption3}
              onChange={(e) => setPollOption3(e.target.value)}
              placeholder="Option 3 (optionnel)"
              maxLength={120}
              className="w-full rounded-lg border border-[#2d4a3e]/20 px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#2d4a3e]/80">Date limite :</label>
              <input
                type="datetime-local"
                value={pollDeadline}
                onChange={(e) => setPollDeadline(e.target.value)}
                min={nowLocalMin || undefined}
                className="rounded-lg border border-[#2d4a3e]/20 px-2 py-1 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleCreatePoll}
              disabled={creatingPoll}
              className="rounded-lg bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {creatingPoll ? "Création..." : "Créer le sondage"}
            </button>
          </div>
        )}
      </form>

      {contextMenu && (
        <div
          className="fixed z-[60] min-w-[160px] overflow-hidden rounded-xl border border-[#2d4a3e]/20 bg-white shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="block w-full px-4 py-2.5 text-left text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/8"
            onClick={() => {
              setReplyTo(contextMenu.message);
              setContextMenu(null);
            }}
          >
            Répondre
          </button>
          {contextMenu.canDelete && (
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
              onClick={() => {
                const target = contextMenu.message;
                setContextMenu(null);
                setConfirmDeleteId(target.id);
              }}
            >
              Supprimer
            </button>
          )}
        </div>
      )}

      {selectedPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#2d4a3e]">Récapitulatif: {selectedPoll.question}</h3>
              <button type="button" onClick={() => setSelectedPoll(null)} className="rounded px-2 py-1 text-sm hover:bg-gray-100">
                Fermer
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left">Option</th>
                    <th className="px-2 py-1 text-left">Élèves</th>
                    <th className="px-2 py-1 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPoll.options.map((opt) => {
                    const votes = selectedPoll.votes.filter((v) => v.option_id === opt.id);
                    const names = votes
                      .map((v) => {
                        if (v.voter_type === "enseignant") return "Enseignant";
                        if (v.voter_eleve_id == null) return "Élève";
                        const eleve = elevesById[String(v.voter_eleve_id)];
                        return eleve ? `${eleve.prenom} ${eleve.nom}` : `Élève #${v.voter_eleve_id}`;
                      })
                      .join(", ");
                    return (
                      <tr key={opt.id} className="border-b align-top">
                        <td className="px-2 py-2">{opt.label}</td>
                        <td className="px-2 py-2">{names || "Aucune réponse"}</td>
                        <td className="px-2 py-2">{votes.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
