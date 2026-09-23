"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import {
  CRENEAUX_PAR_JOUR,
  CRENEAU_LABEL,
  HORAIRE_JOURS,
  JOUR_LABELS,
  parseHoraireDictee,
  formatJourColonne,
  type HoraireCreneau,
  type HoraireJour,
  type HoraireSemaineData,
} from "../../data/horaire-semaine";
import { loadHoraireSemaine, setHoraireCase } from "../../data/horaire-semaine-storage";
import {
  addWeeksToWeekStart,
  formatWeekRangeLabel,
  getWeekStartMonday,
} from "../../data/semainier-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

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

type EditKey = { jour: HoraireJour; creneau: HoraireCreneau };

export default function EnseignantSemainePage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartMonday());
  const [data, setData] = useState<HoraireSemaineData>(() => emptySafe(weekStart));
  const [editing, setEditing] = useState<EditKey | null>(null);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [canSpeech, setCanSpeech] = useState(false);
  const [entendu, setEntendu] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const weekStartRef = useRef(weekStart);
  weekStartRef.current = weekStart;

  useEffect(() => {
    setData(loadHoraireSemaine(weekStart));
    setEditing(null);
  }, [weekStart]);

  const applyDictee = useCallback((transcript: string) => {
    const heard = transcript.trim();
    if (!heard) return;
    setEntendu(heard);
    const parsed = parseHoraireDictee(heard);
    if (parsed.ok.length === 0) {
      setErreur(parsed.erreurs[0] ?? "Je n’ai pas compris. Réessaie : « mardi 9h20 chrono ».");
      setMessage(null);
      return;
    }
    let next = loadHoraireSemaine(weekStartRef.current);
    const recap: string[] = [];
    for (const item of parsed.ok) {
      next = setHoraireCase(weekStartRef.current, item.jour, item.creneau, item.texte);
      recap.push(
        `${JOUR_LABELS[item.jour]} ${CRENEAU_LABEL[item.creneau]} → ${item.texte}`
      );
    }
    setData(next);
    setMessage(recap.join(" · "));
    setErreur(parsed.erreurs[0] ?? null);
  }, []);

  useEffect(() => {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setCanSpeech(!!Ctor);
    if (!Ctor) return;
    const rec = new Ctor() as SpeechRecognitionInstance;
    rec.continuous = true;
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const transcript = last[0]?.transcript ?? "";
      if (transcript) applyDictee(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [applyDictee]);

  useEffect(() => {
    if (!listening) return;
    try {
      recognitionRef.current?.start();
    } catch {
      setListening(false);
    }
  }, [listening]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setErreur("Le micro n’est pas disponible sur ce navigateur. Écris dans les cases.");
      return;
    }
    if (listening) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      return;
    }
    setErreur(null);
    setMessage(null);
    setListening(true);
  };

  const openEdit = (jour: HoraireJour, creneau: HoraireCreneau) => {
    setEditing({ jour, creneau });
    setDraft(data[jour][creneau] ?? "");
  };

  const confirmEdit = () => {
    if (!editing) return;
    const next = setHoraireCase(weekStart, editing.jour, editing.creneau, draft);
    setData(next);
    setEditing(null);
    setDraft("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8e0d4]/90 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Semaine
          </Link>
          <Link
            href="/enseignant"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">Semaine</h1>
            <p className="mt-1 text-sm text-[#2d4a3e]/80">
              Clique une case pour écrire, ou appuie sur le micro : « mardi 9h20 chrono »,
              « mercredi 10h40 science ».
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((w) => addWeeksToWeekStart(w, -1))}
              className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
            >
              ← Semaine préc.
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(getWeekStartMonday())}
              className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((w) => addWeeksToWeekStart(w, 1))}
              className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
            >
              Semaine suiv. →
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm font-semibold text-[#4a7c5a]">{formatWeekRangeLabel(weekStart)}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow">
          <button
            type="button"
            onClick={toggleMic}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow transition ${
              listening ? "bg-[#c45c4a] hover:bg-[#a84c3d]" : "bg-[#4a7c5a] hover:bg-[#3d6b4d]"
            }`}
          >
            <span aria-hidden className="text-lg">
              🎤
            </span>
            {listening ? "J’écoute… (clique pour arrêter)" : "Parler"}
          </button>
          <p className="text-sm text-[#2d4a3e]/75">
            {canSpeech
              ? "Dis le jour, l’heure, puis l’activité."
              : "Le micro n’est pas disponible ici : clique une case pour écrire."}
          </p>
        </div>
        {entendu && (
          <p className="mt-2 text-xs text-[#2d4a3e]/60">J’ai entendu : « {entendu} »</p>
        )}
        {message && <p className="mt-2 text-sm font-medium text-[#2d6b4a]">{message}</p>}
        {erreur && <p className="mt-2 text-sm text-[#b45309]">{erreur}</p>}

        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-5 gap-2">
            {HORAIRE_JOURS.map((jour) => (
              <div key={jour} className="rounded-xl border border-[#2d4a3e]/15 bg-[#fef9f3]/90 p-2">
                <h2 className="mb-2 text-center font-display text-sm font-semibold text-[#2d4a3e]">
                  {formatJourColonne(weekStart, jour)}
                </h2>
                <div className="space-y-2">
                  {CRENEAUX_PAR_JOUR[jour].map((creneau) => {
                    const value = data[jour][creneau] ?? "";
                    return (
                      <button
                        key={creneau}
                        type="button"
                        onClick={() => openEdit(jour, creneau)}
                        className="block w-full rounded-lg border border-[#2d4a3e]/15 bg-white px-2 py-2 text-left transition hover:border-[#4a7c5a]/50 hover:bg-[#a8d5ba]/15"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-[#2d4a3e]/55">
                          {CRENEAU_LABEL[creneau]}
                        </span>
                        <span
                          className={`mt-0.5 block min-h-[1.25rem] whitespace-pre-wrap text-xs leading-snug ${
                            value.trim() ? "text-[#2d4a3e]" : "text-[#2d4a3e]/40"
                          }`}
                        >
                          {value.trim() || "Cliquer ou dicter…"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d4a3e]/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-display text-lg text-[#2d4a3e]">
              {formatJourColonne(weekStart, editing.jour)} — {CRENEAU_LABEL[editing.creneau]}
            </h3>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Ex. : Chrono, sciences…"
              className="mt-3 w-full rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-sm text-[#2d4a3e] outline-none focus:border-[#4a7c5a]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDraft("");
                }}
                className="rounded-xl border border-[#2d4a3e]/20 px-4 py-2 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d6b4d]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function emptySafe(weekStart: string): HoraireSemaineData {
  if (typeof window === "undefined") {
    return {
      lundi: {},
      mardi: {},
      mercredi: {},
      jeudi: {},
      vendredi: {},
    };
  }
  return loadHoraireSemaine(weekStart);
}
