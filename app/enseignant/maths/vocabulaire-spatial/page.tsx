"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getElevesBulletin, type EleveBulletin } from "../../../data/bulletin-storage";
import {
  getScoresVocabulaireSpatial,
  setScoresVocabulaireSpatial,
  type ScoresVocabulaireSpatial,
} from "../../../data/vocabulaire-spatial-storage";
import {
  PHRASES_VOCABULAIRE_SPATIAL,
  NOMBRE_PHRASES,
  TITRE_VOCABULAIRE_SPATIAL,
  scoreSur10,
} from "../../../data/vocabulaire-spatial-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const defaultScores: ScoresVocabulaireSpatial = Array(NOMBRE_PHRASES).fill(0) as ScoresVocabulaireSpatial;

export default function EnseignantVocabulaireSpatialPage() {
  const [eleves, setEleves] = useState<EleveBulletin[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoresVocabulaireSpatial>(defaultScores);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEleves(getElevesBulletin());
  }, []);

  const selectedEleve = eleves.find((e) => e.id === selectedId);

  useEffect(() => {
    if (!selectedId) {
      setScores(defaultScores);
      return;
    }
    const stored = getScoresVocabulaireSpatial(selectedId);
    if (stored) {
      const padded = [...stored];
      while (padded.length < NOMBRE_PHRASES) padded.push(0);
      setScores(padded as ScoresVocabulaireSpatial);
    } else {
      setScores(defaultScores);
    }
  }, [selectedId]);

  const setOne = useCallback((index: number, value: 0 | 1) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next as ScoresVocabulaireSpatial;
    });
  }, []);

  const save = useCallback(() => {
    if (!selectedId) return;
    setSaving(true);
    setScoresVocabulaireSpatial(
      selectedId,
      scores,
      selectedEleve?.supabaseEleveId ?? null
    );
    setSaving(false);
  }, [selectedId, scores, selectedEleve?.supabaseEleveId]);

  const points = scores.reduce((a, b) => a + b, 0);
  const sur10 = scoreSur10(points);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/evaluation/solide-figure" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_VOCABULAIRE_SPATIAL}
          </Link>
          <Link href="/enseignant/maths/evaluation/solide-figure" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Espace et géométrie
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_VOCABULAIRE_SPATIAL}</h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/75">
          Choisis un élève, saisis 0 ou 1 par phrase (1 point par phrase). L&apos;évaluation est sur 10. Si l&apos;élève est lié à l&apos;app, il reçoit son score directement.
        </p>

        {/* Liste des élèves */}
        <div className="mt-6">
          <h2 className="font-display text-lg text-[#2d4a3e]">Élèves</h2>
          {eleves.length === 0 ? (
            <p className="mt-2 text-sm text-[#2d4a3e]/70">
              Aucun élève. Ajoute des élèves dans le <Link href="/enseignant/bulletin" className="underline">bulletin</Link>.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {eleves.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    selectedId === e.id
                      ? "bg-[#c4a8e8] text-[#2d4a3e]"
                      : "bg-white/95 text-[#2d4a3e]/80 shadow hover:bg-[#c4a8e8]/30"
                  }`}
                >
                  {e.prenom}
                  {e.supabaseEleveId != null ? " ✓" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille des phrases pour l'élève sélectionné */}
        {selectedEleve && (
          <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-lg text-[#2d4a3e]">{selectedEleve.prenom}</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#2d4a3e]/70">
                  {points} / 14 → <strong>{sur10} / 10</strong>
                </span>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3d6b4d] disabled:opacity-60"
                >
                  Enregistrer
                </button>
              </div>
            </div>
            <p className="mb-4 text-xs text-[#2d4a3e]/60">
              Cote 0 ou 1 pour chaque phrase. Enregistrer envoie le résultat à l&apos;enfant si l&apos;élève est lié à l&apos;app.
            </p>
            <div className="space-y-3">
              {PHRASES_VOCABULAIRE_SPATIAL.map((phrase, index) => (
                <div
                  key={phrase.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2d4a3e]/10 bg-[#fef9f3]/50 p-3"
                >
                  <span className="w-6 text-sm font-medium text-[#2d4a3e]/70">{phrase.id}.</span>
                  <span className="min-w-0 flex-1 text-sm text-[#2d4a3e]">{phrase.texte}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOne(index, 0)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                        scores[index] === 0 ? "bg-[#2d4a3e] text-white" : "bg-[#2d4a3e]/10 text-[#2d4a3e]/70 hover:bg-[#2d4a3e]/20"
                      }`}
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => setOne(index, 1)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                        scores[index] === 1 ? "bg-[#4a7c5a] text-white" : "bg-[#2d4a3e]/10 text-[#2d4a3e]/70 hover:bg-[#4a7c5a]/20"
                      }`}
                    >
                      1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/enseignant/maths/evaluation/solide-figure" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
