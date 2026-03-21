"use client";

import { useState, useRef, useEffect } from "react";
import type { NiveauAcquisition } from "../../data/bulletin-storage";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(i: number): SpeechRecognitionResult;
  [i: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  length: number;
  item(i: number): SpeechRecognitionAlternative;
  [i: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

type Props = {
  libelle: string;
  niveauEnseignant: NiveauAcquisition;
  value: string;
  onChange: (commentaire: string) => void;
};

export function CommentaireAvecGemini({
  libelle,
  niveauEnseignant,
  value,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingReformulate, setLoadingReformulate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const canDictate =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!canDictate) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor() as SpeechRecognitionInstance;
    rec.continuous = true;
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const transcript = last[0]?.transcript ?? "";
      if (transcript) {
        const current = valueRef.current;
        onChange(current ? `${current} ${transcript}` : transcript);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [canDictate, onChange]);

  useEffect(() => {
    if (!listening) return;
    try {
      recognitionRef.current?.start();
    } catch {
      setListening(false);
    }
  }, [listening]);

  const handleToggleMic = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
    }
  };

  const handleSuggest = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bulletin/suggest-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libelle,
          niveau: niveauEnseignant ?? "non_acquis",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      if (data.suggestion) onChange(data.suggestion);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleReformulate = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setError(null);
    setLoadingReformulate(true);
    try {
      const res = await fetch("/api/bulletin/reformulate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          libelle,
          niveau: niveauEnseignant ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      if (data.suggestion) onChange(data.suggestion);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoadingReformulate(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-start gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Commentaire… (parlez ou tapez, puis reformulez avec Gemini)"
          rows={2}
          className="min-w-0 flex-1 rounded-lg border border-[#2d4a3e]/20 bg-white/90 px-3 py-2 text-sm text-[#2d4a3e] placeholder:text-[#2d4a3e]/50 min-w-[200px]"
        />
        <div className="no-print flex shrink-0 flex-wrap items-center gap-1">
          {canDictate && (
            <button
              type="button"
              onClick={handleToggleMic}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                listening
                  ? "bg-red-500 text-white"
                  : "bg-[#2d4a3e]/15 text-[#2d4a3e] hover:bg-[#2d4a3e]/25"
              }`}
              title={listening ? "Arrêter la dictée" : "Parler (dictée vocale)"}
            >
              {listening ? "⏹️" : "🎤"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSuggest}
            disabled={loading}
            className="rounded-lg bg-[#4a7c5a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
            title="Suggérer un commentaire à partir de l'attendu et du niveau"
          >
            {loading ? "…" : "✨ Suggérer"}
          </button>
          <button
            type="button"
            onClick={handleReformulate}
            disabled={loadingReformulate || !value.trim()}
            className="rounded-lg bg-[#2d4a3e] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#1e3a2e] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reformuler le commentaire avec Gemini (à partir de vos mots)"
          >
            {loadingReformulate ? "…" : "Reformuler"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
