"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { CommentaireAvecGemini } from "../../../../components/bulletin/CommentaireAvecGemini";
import type { NiveauAcquisition } from "../../../../data/bulletin-storage";
import { getOrCreateEleveBulletinFromClasse } from "../../../../data/bulletin-storage";
import {
  CRITERES_POESIE,
  CRITERES_FAMILLE,
  SON_ID_PARLER_POESIE,
  SON_ID_PARLER_FAMILLE,
  NIVEAU_ID_POESIE,
  NIVEAU_ID_FAMILLE,
  MAX_BRUT_POESIE,
  MAX_BRUT_FAMILLE,
  sommePointsBruts,
  scoreSur10DepuisBrut,
} from "../../../../data/parler-data";
import { loadParlerDraft, saveParlerDraft, type ParlerGrilleDraft } from "../../../../data/parler-storage";
import { saveResultat, deleteResultatsByEleveAndSon, type DetailExerciceEval } from "../../../../data/resultats-storage";
import { supabase } from "../../../../../utils/supabase";
import type { EleveRow } from "../../../../../utils/supabase";

const FACES = ["😊", "😐", "😠"] as const;
const INDEX_TO_NIVEAU: NiveauAcquisition[] = ["acquis", "en_cours", "non_acquis"];

type Selection = number | null;

/** 😊 acquis = 2, 😐 en cours = 1, 😠 à travailler = 0 */
function faceToPoints(faceIndex: number): 0 | 1 | 2 {
  if (faceIndex === 0) return 2;
  if (faceIndex === 1) return 1;
  return 0;
}
function pointsToFace(pts: 0 | 1 | 2): number {
  if (pts === 2) return 0;
  if (pts === 1) return 1;
  return 2;
}

function emptyDraft(n: number): ParlerGrilleDraft {
  return {
    enfantSelections: Array(n).fill(null) as Selection[],
    enseignantSelections: Array(n).fill(null) as Selection[],
    pointsParCritere: Array(n).fill(null) as (0 | 1 | 2 | null)[],
    commentaires: Array(n).fill(""),
  };
}

/** Aligne les points sur les smileys (brouillons anciens ou incomplets). */
function syncPointsFromFaces(draft: ParlerGrilleDraft, n: number): ParlerGrilleDraft {
  const pointsParCritere = Array.from({ length: n }, (_, i) => {
    const face = draft.enseignantSelections[i];
    if (face != null) return faceToPoints(face);
    const pts = draft.pointsParCritere[i];
    return pts === 0 || pts === 1 || pts === 2 ? pts : null;
  });
  const enseignantSelections = Array.from({ length: n }, (_, i) => {
    const pts = pointsParCritere[i];
    if (pts != null) return pointsToFace(pts);
    return draft.enseignantSelections[i] ?? null;
  });
  return { ...draft, pointsParCritere, enseignantSelections };
}

function pointsComplets(draft: ParlerGrilleDraft): boolean {
  return draft.pointsParCritere.every((p) => p === 0 || p === 1 || p === 2);
}

type GrilleKind = "poesie" | "famille";

function TableauEvaluation({
  titre,
  criteres,
  kind,
  bulletinEleveId,
  supabaseEleveId,
}: {
  titre: string;
  criteres: readonly string[];
  kind: GrilleKind;
  bulletinEleveId: string;
  supabaseEleveId: string | null | undefined;
}) {
  const n = criteres.length;
  const maxBrut = kind === "poesie" ? MAX_BRUT_POESIE : MAX_BRUT_FAMILLE;
  const sonId = kind === "poesie" ? SON_ID_PARLER_POESIE : SON_ID_PARLER_FAMILLE;
  const niveauId = kind === "poesie" ? NIVEAU_ID_POESIE : NIVEAU_ID_FAMILLE;

  const [draft, setDraft] = useState<ParlerGrilleDraft>(() => emptyDraft(n));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const loaded = loadParlerDraft(bulletinEleveId, kind, n);
    const synced = syncPointsFromFaces(loaded ?? emptyDraft(n), n);
    setDraft(synced);
    saveParlerDraft(bulletinEleveId, kind, synced);
    setSaveMsg(null);
  }, [bulletinEleveId, kind, n]);

  const persistDraft = useCallback(
    (updater: (prev: ParlerGrilleDraft) => ParlerGrilleDraft) => {
      setDraft((prev) => {
        const next = syncPointsFromFaces(updater(prev), n);
        saveParlerDraft(bulletinEleveId, kind, next);
        return next;
      });
    },
    [bulletinEleveId, kind, n]
  );

  const onCommentaireChange = useCallback(
    (idx: number, commentaire: string) => {
      persistDraft((prev) => ({
        ...prev,
        commentaires: prev.commentaires.map((c, i) => (i === idx ? commentaire : c)),
      }));
    },
    [persistDraft]
  );

  const onEnseignantSelect = useCallback(
    (idx: number, faceIndex: number) => {
      persistDraft((prev) => {
        const clearing = prev.enseignantSelections[idx] === faceIndex;
        return {
          ...prev,
          enseignantSelections: prev.enseignantSelections.map((v, i) =>
            i === idx ? (clearing ? null : faceIndex) : v
          ),
          pointsParCritere: prev.pointsParCritere.map((v, i) =>
            i === idx ? (clearing ? null : faceToPoints(faceIndex)) : v
          ),
        };
      });
    },
    [persistDraft]
  );

  const onPointsSelect = useCallback(
    (idx: number, pts: 0 | 1 | 2) => {
      persistDraft((prev) => {
        const clearing = prev.pointsParCritere[idx] === pts;
        return {
          ...prev,
          pointsParCritere: prev.pointsParCritere.map((v, i) => (i === idx ? (clearing ? null : pts) : v)),
          enseignantSelections: prev.enseignantSelections.map((v, i) =>
            i === idx ? (clearing ? null : pointsToFace(pts)) : v
          ),
        };
      });
    },
    [persistDraft]
  );

  const somme = sommePointsBruts(draft.pointsParCritere);
  const sur10 = scoreSur10DepuisBrut(somme, maxBrut);
  const tousPointsSaisis = pointsComplets(draft);
  const manquants = draft.pointsParCritere.filter((p) => p == null).length;

  const handleSave = useCallback(async () => {
    const current = syncPointsFromFaces(draftRef.current, n);
    setDraft(current);
    saveParlerDraft(bulletinEleveId, kind, current);

    if (!supabaseEleveId) {
      setSaveMsg("Impossible d'envoyer : élève non trouvé. Rechoisis l'élève dans la liste.");
      return;
    }
    if (!pointsComplets(current)) {
      setSaveMsg("Clique un smiley pour CHAQUE critère (ligne), puis réessaie.");
      return;
    }

    const sum = sommePointsBruts(current.pointsParCritere);
    const score = scoreSur10DepuisBrut(sum, maxBrut);

    setSaving(true);
    setSaveMsg(null);
    try {
      await deleteResultatsByEleveAndSon(supabaseEleveId, sonId);
      const details: DetailExerciceEval[] = criteres.map((libelle, i) => ({
        type: "critere-parler",
        titre: libelle,
        points: current.pointsParCritere[i] ?? 0,
        pointsMax: 2,
      }));
      await saveResultat({
        eleve_id: String(supabaseEleveId),
        son_id: sonId,
        niveau_id: niveauId,
        points: score,
        points_max: 10,
        reussi: score >= 5,
        detail_exercices: details,
      });
      setSaveMsg(
        `✓ Cote ${score}/10 enregistrée pour « ${titre} ». L'enfant la voit dans Mes résultats.`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur d'enregistrement";
      setSaveMsg(
        `Erreur : ${msg}. Si ça continue, exécute supabase-exercice-resultats.sql dans Supabase.`
      );
    } finally {
      setSaving(false);
    }
  }, [bulletinEleveId, kind, n, supabaseEleveId, sonId, niveauId, criteres, maxBrut, titre]);

  return (
    <section className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
      <h2 className="font-display text-xl font-semibold text-[#2d4a3e]">{titre}</h2>
      <p className="mt-2 text-sm text-[#2d4a3e]/75">
        Pour chaque ligne, clique un smiley : 😊 = 2/2, 😐 = 1/2, 😠 = 0/2. Quand toutes les lignes sont
        remplies, clique <strong>Enregistrer et envoyer à l&apos;enfant</strong>.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#4a7c5a]/25 bg-[#e8f5e9]/50 px-4 py-3">
        <span className="text-sm font-medium text-[#2d4a3e]">
          Total : <strong>{somme}</strong> / {maxBrut} →{" "}
          <strong className="text-lg text-[#2d6b3e]">{sur10} / 10</strong>
        </span>
        {!tousPointsSaisis && (
          <span className="text-xs text-amber-800">Encore {manquants} ligne(s) sans smiley.</span>
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="ml-auto rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer et envoyer à l'enfant"}
        </button>
      </div>
      {saveMsg && (
        <p
          className={`mt-2 text-sm font-medium ${
            saveMsg.startsWith("✓") ? "text-[#2d6b4a]" : "text-[#b45309]"
          }`}
        >
          {saveMsg}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[820px] rounded-2xl border-2 border-[#2d4a3e]/20 overflow-hidden">
          <div className="grid grid-cols-[2.2fr,1.15fr,1.35fr,2fr] text-sm font-semibold text-[#2d4a3e]">
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#e8f0e9] px-3 py-2">Attendues</div>
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#fff5e6] px-2 py-2 text-center">Enseignant</div>
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#e8f4ff] px-2 py-2 text-center">Points /2</div>
            <div className="border-b-2 border-[#2d4a3e]/20 bg-[#f0f4ff] px-2 py-2">Commentaire</div>
          </div>
          {criteres.map((c, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[2.2fr,1.15fr,1.35fr,2fr] items-start border-b border-[#2d4a3e]/10 last:border-b-0"
            >
              <div className="border-r-2 border-[#2d4a3e]/15 bg-[#fafdfa] px-3 py-2">
                <span className="mr-2 font-semibold text-[#2d4a3e]">{idx + 1}.</span>
                <span className="text-sm text-[#2d4a3e]">{c}</span>
              </div>
              <div className="border-r-2 border-[#2d4a3e]/15 bg-[#fffbf5] px-1 py-2 flex items-center justify-center gap-0.5">
                {FACES.map((face, i) => (
                  <button
                    key={`p-${idx}-${i}`}
                    type="button"
                    onClick={() => onEnseignantSelect(idx, i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] ${
                      draft.enseignantSelections[idx] === i
                        ? "border-[#4a7c5a] bg-[#a8d5ba]/40"
                        : "border-[#2d4a3e]/25 bg-white hover:bg-[#e8f0e9]"
                    }`}
                    title={i === 0 ? "Acquis" : i === 1 ? "En cours" : "À travailler"}
                  >
                    {face}
                  </button>
                ))}
              </div>
              <div className="border-r-2 border-[#2d4a3e]/15 bg-[#f5fbff] px-1 py-2 flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  {([0, 1, 2] as const).map((pts) => (
                    <button
                      key={`pts-${idx}-${pts}`}
                      type="button"
                      onClick={() => onPointsSelect(idx, pts)}
                      className={`min-w-[2.25rem] rounded-lg border-2 px-2 py-1 text-xs font-bold tabular-nums transition ${
                        draft.pointsParCritere[idx] === pts
                          ? "border-[#4a7c5a] bg-[#a8d5ba]/50 text-[#1e3d28]"
                          : "border-[#2d4a3e]/20 bg-white text-[#2d4a3e] hover:bg-[#e8f4ff]"
                      }`}
                    >
                      {pts}/2
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#2d4a3e]/55">
                  {draft.pointsParCritere[idx] == null ? "—" : `${draft.pointsParCritere[idx]}/2`}
                </span>
              </div>
              <div className="bg-[#f8fafc] px-2 py-2 min-w-0">
                <CommentaireAvecGemini
                  libelle={c}
                  niveauEnseignant={
                    draft.enseignantSelections[idx] != null
                      ? INDEX_TO_NIVEAU[draft.enseignantSelections[idx]!]
                      : null
                  }
                  value={draft.commentaires[idx] ?? ""}
                  onChange={(commentaire) => onCommentaireChange(idx, commentaire)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#2d4a3e]/60">Tu peux imprimer cette page (Ctrl+P) pour garder une trace.</p>
    </section>
  );
}

export default function EnseignantParlerPage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEleveId, setSelectedEleveId] = useState<string | null>(null);
  const [kind, setKind] = useState<GrilleKind | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
        setEleves((data ?? []) as EleveRow[]);
      } catch {
        setEleves([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedEleve = eleves.find((e) => String(e.id) === selectedEleveId) ?? null;
  const bulletinEleve = selectedEleve
    ? getOrCreateEleveBulletinFromClasse({
        id: selectedEleve.id,
        prenom: selectedEleve.prenom,
        nom: selectedEleve.nom,
      })
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">Parler</span>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Parler</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          1) Choisis un élève → 2) Choisis l&apos;évaluation (poésie ou présentation) → 3) Remplis la grille et
          enregistre la cote pour l&apos;enfant.
        </p>

        {/* Étape 1 : liste des élèves */}
        <div className="mt-8">
          <h2 className="font-display text-lg text-[#2d4a3e]">1. Élève</h2>
          {loading ? (
            <p className="mt-2 text-sm text-[#2d4a3e]/70">Chargement de la classe…</p>
          ) : eleves.length === 0 ? (
            <p className="mt-2 text-sm text-[#2d4a3e]/70">
              Aucun élève dans la classe. Ajoute-les dans{" "}
              <Link href="/enseignant/eleves" className="underline">
                Élèves
              </Link>
              .
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {eleves.map((e) => {
                const id = String(e.id);
                const actif = selectedEleveId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedEleveId(id);
                      setKind(null);
                    }}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-medium shadow transition ${
                      actif
                        ? "bg-[#c4a8e8] text-[#2d4a3e] ring-2 ring-[#2d4a3e]/30"
                        : "bg-white/95 text-[#2d4a3e] hover:bg-[#c4a8e8]/25"
                    }`}
                  >
                    <span className="font-display text-base">{e.prenom}</span>
                    {e.nom ? <span className="ml-1 text-[#2d4a3e]/70">{e.nom}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Étape 2 : type d'évaluation */}
        {selectedEleve && (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg text-[#2d4a3e]">
                2. Évaluation pour {selectedEleve.prenom}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedEleveId(null);
                  setKind(null);
                }}
                className="text-sm text-[#2d4a3e]/70 underline hover:text-[#2d4a3e]"
              >
                Changer d&apos;élève
              </button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setKind("poesie")}
                className={`rounded-2xl p-5 text-left shadow-lg transition ${
                  kind === "poesie"
                    ? "bg-[#a8d5ba]/90 ring-2 ring-[#4a7c5a]"
                    : "bg-white/95 hover:bg-[#a8d5ba]/30"
                }`}
              >
                <p className="font-display text-lg text-[#2d4a3e]">Poésie</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/75">Je dis ma poésie</p>
              </button>
              <button
                type="button"
                onClick={() => setKind("famille")}
                className={`rounded-2xl p-5 text-left shadow-lg transition ${
                  kind === "famille"
                    ? "bg-[#a8d5ba]/90 ring-2 ring-[#4a7c5a]"
                    : "bg-white/95 hover:bg-[#a8d5ba]/30"
                }`}
              >
                <p className="font-display text-lg text-[#2d4a3e]">Présentation</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/75">Présentation de ma famille</p>
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : grille */}
        {bulletinEleve && kind === "poesie" && (
          <TableauEvaluation
            titre="Poésie — Je dis ma poésie"
            criteres={CRITERES_POESIE}
            kind="poesie"
            bulletinEleveId={bulletinEleve.id}
            supabaseEleveId={String(selectedEleve!.id)}
          />
        )}
        {bulletinEleve && kind === "famille" && (
          <TableauEvaluation
            titre="Présentation de ma famille"
            criteres={CRITERES_FAMILLE}
            kind="famille"
            bulletinEleveId={bulletinEleve.id}
            supabaseEleveId={String(selectedEleve!.id)}
          />
        )}

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
