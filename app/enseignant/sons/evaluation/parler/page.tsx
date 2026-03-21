"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { CommentaireAvecGemini } from "../../../../components/bulletin/CommentaireAvecGemini";
import type { NiveauAcquisition } from "../../../../data/bulletin-storage";
import { getElevesBulletin, type EleveBulletin } from "../../../../data/bulletin-storage";
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

const FACES = ["😊", "😐", "😠"] as const;
const INDEX_TO_NIVEAU: NiveauAcquisition[] = ["acquis", "en_cours", "non_acquis"];

type Selection = number | null;

function emptyDraft(n: number): ParlerGrilleDraft {
  return {
    enfantSelections: Array(n).fill(null) as Selection[],
    enseignantSelections: Array(n).fill(null) as Selection[],
    pointsParCritere: Array(n).fill(null) as (0 | 1 | 2 | null)[],
    commentaires: Array(n).fill(""),
  };
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

  useEffect(() => {
    const loaded = loadParlerDraft(bulletinEleveId, kind, n);
    setDraft(loaded ?? emptyDraft(n));
    setSaveMsg(null);
  }, [bulletinEleveId, kind, n]);

  const persistDraft = useCallback(
    (next: ParlerGrilleDraft) => {
      setDraft(next);
      saveParlerDraft(bulletinEleveId, kind, next);
    },
    [bulletinEleveId, kind]
  );

  const onCommentaireChange = useCallback(
    (idx: number, commentaire: string) => {
      persistDraft({
        ...draft,
        commentaires: draft.commentaires.map((c, i) => (i === idx ? commentaire : c)),
      });
    },
    [draft, persistDraft]
  );

  const onEnseignantSelect = useCallback(
    (idx: number, faceIndex: number) => {
      persistDraft({
        ...draft,
        enseignantSelections: draft.enseignantSelections.map((v, i) =>
          i === idx ? (v === faceIndex ? null : faceIndex) : v
        ),
      });
    },
    [draft, persistDraft]
  );

  const onPointsSelect = useCallback(
    (idx: number, pts: 0 | 1 | 2) => {
      persistDraft({
        ...draft,
        pointsParCritere: draft.pointsParCritere.map((v, i) => (i === idx ? (v === pts ? null : pts) : v)),
      });
    },
    [draft, persistDraft]
  );

  const somme = sommePointsBruts(draft.pointsParCritere);
  const sur10 = scoreSur10DepuisBrut(somme, maxBrut);
  const tousPointsSaisis = draft.pointsParCritere.every((p) => p !== null && p !== undefined);

  const handleSave = useCallback(async () => {
    if (!supabaseEleveId) {
      setSaveMsg("Lie cet élève à Supabase (bulletin) pour envoyer la cote à l'enfant.");
      return;
    }
    if (!tousPointsSaisis) {
      setSaveMsg("Indique 0, 1 ou 2 points pour chaque critère avant d'enregistrer.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      await deleteResultatsByEleveAndSon(supabaseEleveId, sonId);
      const details: DetailExerciceEval[] = criteres.map((libelle, i) => ({
        type: "critere-parler",
        titre: libelle,
        points: draft.pointsParCritere[i] ?? 0,
        pointsMax: 2,
      }));
      await saveResultat({
        eleve_id: supabaseEleveId,
        son_id: sonId,
        niveau_id: niveauId,
        points: sur10,
        points_max: 10,
        reussi: sur10 >= 5,
        detail_exercices: details,
      });
      setSaveMsg("Cote enregistrée : l'enfant la voit dans Mes résultats.");
    } catch {
      setSaveMsg("Erreur d'enregistrement. Vérifie Supabase (exercice_resultats).");
    } finally {
      setSaving(false);
    }
  }, [supabaseEleveId, tousPointsSaisis, sonId, niveauId, criteres, draft.pointsParCritere, sur10]);

  return (
    <section className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
      <h2 className="font-display text-xl font-semibold text-[#2d4a3e]">{titre}</h2>
      <p className="mt-2 text-sm text-[#2d4a3e]/75">
        <strong>Enseignant</strong> : visages (😊 acquis, 😐 en cours, 😠 à travailler). <strong>Points</strong> : 0, 1 ou 2 sur 2 par critère.
        La cote sur 10 est calculée automatiquement.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#4a7c5a]/25 bg-[#e8f5e9]/50 px-4 py-3">
        <span className="text-sm font-medium text-[#2d4a3e]">
          Total points bruts : <strong>{somme}</strong> / {maxBrut} → <strong className="text-lg text-[#2d6b3e]">{sur10} / 10</strong>
        </span>
        {!tousPointsSaisis && (
          <span className="text-xs text-amber-800">Complète les {n} critères (0, 1 ou 2) pour enregistrer.</span>
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !tousPointsSaisis}
          className="ml-auto rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer et envoyer à l'enfant"}
        </button>
      </div>
      {saveMsg && <p className="mt-2 text-sm text-[#2d4a3e]/85">{saveMsg}</p>}

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
  const [eleves, setEleves] = useState<EleveBulletin[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setEleves(getElevesBulletin());
  }, []);

  const selected = eleves.find((e) => e.id === selectedId);

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
          Grilles d&apos;évaluation pour la poésie et la présentation de la famille. Choisis un élève : visages enseignant,
          <strong> points sur 2</strong> par critère, puis une <strong>cote sur 10</strong> envoyée à l&apos;enfant.
        </p>

        <div className="mt-6">
          <h2 className="font-display text-lg text-[#2d4a3e]">Élève</h2>
          {eleves.length === 0 ? (
            <p className="mt-2 text-sm text-[#2d4a3e]/70">
              Aucun élève. Ajoute des élèves dans le{" "}
              <Link href="/enseignant/bulletin" className="underline">
                bulletin
              </Link>{" "}
              et lie-les à Supabase pour leur envoyer les résultats.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {eleves.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    selectedId === e.id ? "bg-[#c4a8e8] text-[#2d4a3e]" : "bg-white/95 text-[#2d4a3e]/80 shadow hover:bg-[#c4a8e8]/30"
                  }`}
                >
                  {e.prenom}
                  {e.supabaseEleveId != null ? " ✓" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <>
            <TableauEvaluation
              titre="Poésie — Je dis ma poésie"
              criteres={CRITERES_POESIE}
              kind="poesie"
              bulletinEleveId={selected.id}
              supabaseEleveId={selected.supabaseEleveId ?? null}
            />
            <TableauEvaluation
              titre="Présentation de ma famille"
              criteres={CRITERES_FAMILLE}
              kind="famille"
              bulletinEleveId={selected.id}
              supabaseEleveId={selected.supabaseEleveId ?? null}
            />
          </>
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
