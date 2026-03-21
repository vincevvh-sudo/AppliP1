"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { CommentaireAvecGemini } from "../../../../components/bulletin/CommentaireAvecGemini";
import type { NiveauAcquisition } from "../../../../data/bulletin-storage";
import { getConversationDirecte, sendMessage } from "../../../../data/messagerie-storage";
import { supabase } from "../../../../../utils/supabase";
import type { EleveRow } from "../../../../../utils/supabase";

const FACES = ["😊", "😐", "😠"] as const;
const INDEX_TO_NIVEAU: NiveauAcquisition[] = ["acquis", "en_cours", "non_acquis"];
const LIBELLE_NIVEAU = ["Acquis", "En cours", "À travailler"] as const;

const CRITERES_CALLIGRAPHIE = [
  "Je tiens correctement mon crayon.",
  "Je pose mon poignet sous la ligne d'écriture.",
  "J'écris entre les lignes.",
  "Je gère l'espace de ma feuille.",
  "J'écris en exerçant une pression correcte sur mon crayon.",
  "J'écris mes lettres dans le bon sens d'écriture.",
  "J'écris en respectant la hauteur des lettres.",
  "Mon enseignant reconnaît la lettre.",
  "J'ai rendu un travail soigneux.",
] as const;

type Selection = number | null;

function buildMessageCalligraphie(
  selections: Selection[],
  commentaires: string[]
): string {
  const lines = CRITERES_CALLIGRAPHIE.map((c, idx) => {
    const face = selections[idx] != null ? FACES[selections[idx]!] : "—";
    const niveau = selections[idx] != null ? LIBELLE_NIVEAU[selections[idx]!] : "";
    const com = (commentaires[idx] ?? "").trim();
    let line = `${idx + 1}. ${c} — ${face} ${niveau}`;
    if (com) line += `\n   Commentaire : ${com}`;
    return line;
  });
  return "📝 Évaluation calligraphie\n\n" + lines.join("\n\n");
}

export default function EnseignantEvaluationEcriturePage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [selectedEleveId, setSelectedEleveId] = useState<number | "">("");
  const [selections, setSelections] = useState<Selection[]>(() =>
    Array(CRITERES_CALLIGRAPHIE.length).fill(null)
  );
  const [commentaires, setCommentaires] = useState<string[]>(() =>
    Array(CRITERES_CALLIGRAPHIE.length).fill("")
  );
  const [sending, setSending] = useState(false);
  const [sendMessageResult, setSendMessageResult] = useState<"ok" | "error" | null>(null);

  useEffect(() => {
    supabase
      .from("eleves")
      .select("*")
      .order("nom")
      .order("prenom")
      .then(({ data }) => setEleves((data ?? []) as EleveRow[]));
  }, []);

  const onEnseignantSelect = useCallback((idx: number, faceIndex: number) => {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = prev[idx] === faceIndex ? null : faceIndex;
      return next;
    });
  }, []);

  const onCommentaireChange = useCallback((idx: number, commentaire: string) => {
    setCommentaires((prev) => {
      const next = [...prev];
      next[idx] = commentaire;
      return next;
    });
  }, []);

  const handleEnvoyer = useCallback(async () => {
    if (selectedEleveId === "") {
      setSendMessageResult("error");
      return;
    }
    setSending(true);
    setSendMessageResult(null);
    try {
      const conv = await getConversationDirecte(selectedEleveId);
      if (!conv) {
        setSendMessageResult("error");
        setSending(false);
        return;
      }
      const content = buildMessageCalligraphie(selections, commentaires);
      const sent = await sendMessage({
        conversation_id: conv.id,
        author_type: "enseignant",
        eleve_id: null,
        content,
      });
      setSendMessageResult(sent ? "ok" : "error");
    } catch {
      setSendMessageResult("error");
    } finally {
      setSending(false);
    }
  }, [selectedEleveId, selections, commentaires]);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation écriture</span>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation écriture</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Grilles et exercices d&apos;évaluation de l&apos;écriture.
        </p>

        <section className="mt-10 rounded-2xl border-2 border-[#2d4a3e]/15 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-xl font-semibold text-[#2d4a3e]">Calligraphie</h2>
          <p className="mt-2 text-sm text-[#2d4a3e]/75">
            Pour chaque critère, clique sur un visage (😊 acquis, 😐 en cours, 😠 à travailler) et ajoute un commentaire si tu veux (tu peux dicter à l&apos;ordinateur). Envoie les résultats à l&apos;enfant lorsqu&apos;il a terminé.
          </p>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[640px] rounded-2xl border-2 border-[#2d4a3e]/20 overflow-hidden">
              <div className="grid grid-cols-[2.5fr,1.2fr,2.2fr] text-sm font-semibold text-[#2d4a3e]">
                <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#e8f0e9] px-4 py-3">
                  Critère
                </div>
                <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#fff5e6] px-4 py-3 text-center">
                  Évaluation
                </div>
                <div className="border-b-2 border-[#2d4a3e]/20 bg-[#f0f4ff] px-4 py-3">
                  Commentaire
                </div>
              </div>
              {CRITERES_CALLIGRAPHIE.map((c, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2.5fr,1.2fr,2.2fr] items-start border-b border-[#2d4a3e]/10 last:border-b-0"
                >
                  <div className="border-r-2 border-[#2d4a3e]/15 bg-[#fafdfa] px-4 py-3">
                    <span className="mr-2 font-semibold text-[#2d4a3e]">{idx + 1}.</span>
                    <span className="text-sm text-[#2d4a3e]">{c}</span>
                  </div>
                  <div className="border-r-2 border-[#2d4a3e]/15 bg-[#fffbf5] px-3 py-3 flex items-center justify-center gap-1">
                    {FACES.map((face, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onEnseignantSelect(idx, i)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] ${
                          selections[idx] === i
                            ? "border-[#4a7c5a] bg-[#a8d5ba]/40"
                            : "border-[#2d4a3e]/25 bg-white hover:bg-[#e8f0e9]"
                        }`}
                        title={LIBELLE_NIVEAU[i]}
                      >
                        {face}
                      </button>
                    ))}
                  </div>
                  <div className="bg-[#f8fafc] px-4 py-3 min-w-0">
                    <CommentaireAvecGemini
                      libelle={c}
                      niveauEnseignant={
                        selections[idx] != null
                          ? INDEX_TO_NIVEAU[selections[idx]!]
                          : null
                      }
                      value={commentaires[idx] ?? ""}
                      onChange={(commentaire) => onCommentaireChange(idx, commentaire)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#2d4a3e]/15 bg-[#fef9f3] p-4">
            <p className="text-sm font-medium text-[#2d4a3e]">Envoyer les résultats à l&apos;enfant</p>
            <p className="mt-1 text-xs text-[#2d4a3e]/70">
              Choisis un élève puis clique sur Envoyer. Les résultats seront envoyés dans la messagerie de l&apos;enfant.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                value={selectedEleveId === "" ? "" : String(selectedEleveId)}
                onChange={(e) =>
                  setSelectedEleveId(e.target.value ? Number(e.target.value) : "")
                }
                className="rounded-lg border border-[#2d4a3e]/25 bg-white px-3 py-2 text-sm text-[#2d4a3e]"
              >
                <option value="">— Choisir un élève —</option>
                {eleves.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleEnvoyer}
                disabled={sending || selectedEleveId === ""}
                className="rounded-lg bg-[#4a7c5a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Envoi…" : "Envoyer les résultats à l'enfant"}
              </button>
              {sendMessageResult === "ok" && (
                <span className="text-sm font-medium text-[#4a7c5a]">Résultats envoyés !</span>
              )}
              {sendMessageResult === "error" && (
                <span className="text-sm text-red-600">
                  {selectedEleveId === "" ? "Choisis un élève." : "Erreur lors de l'envoi."}
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-[#2d4a3e]/60">
            Tu peux imprimer cette page (Ctrl+P) pour garder une trace.
          </p>
        </section>

        <Link
          href="/enseignant/sons/evaluations"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux évaluations
        </Link>
      </div>
    </main>
  );
}
