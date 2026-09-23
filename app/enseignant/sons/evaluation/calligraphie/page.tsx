"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { CommentaireAvecGemini } from "../../../../components/bulletin/CommentaireAvecGemini";
import type { NiveauAcquisition } from "../../../../data/bulletin-storage";
import { getOrCreateEleveBulletinFromClasse } from "../../../../data/bulletin-storage";
import {
  CALLIGRAPHIE_POINTS_MAX,
  CRITERES_CALLIGRAPHIE,
  DETAIL_TYPE_CRITERE_CALLIGRAPHIE,
  DETAIL_TYPE_TITRE_CALLIGRAPHIE,
  NIVEAU_ID_CALLIGRAPHIE,
  SON_ID_CALLIGRAPHIE,
  calligraphiePointsToFace,
  faceToCalligraphiePoints,
  formatPointsCalligraphie,
  sommePointsCalligraphie,
} from "../../../../data/calligraphie-data";
import {
  loadCalligraphieDraft,
  saveCalligraphieDraft,
  type CalligraphieGrilleDraft,
} from "../../../../data/calligraphie-storage";
import {
  saveResultat,
  deleteResultatsParlerByTitre,
  type DetailExerciceEval,
} from "../../../../data/resultats-storage";
import { supabase } from "../../../../../utils/supabase";
import type { EleveRow } from "../../../../../utils/supabase";

const FACES = ["😊", "😐", "😠"] as const;
const INDEX_TO_NIVEAU: NiveauAcquisition[] = ["acquis", "en_cours", "non_acquis"];

const n = CRITERES_CALLIGRAPHIE.length;

function syncDraft(draft: CalligraphieGrilleDraft): CalligraphieGrilleDraft {
  const pointsParCritere = CRITERES_CALLIGRAPHIE.map((c, i) => {
    const face = draft.enseignantSelections[i];
    if (face != null) return faceToCalligraphiePoints(face, c.pointsMax);
    const pts = draft.pointsParCritere[i];
    return typeof pts === "number" ? pts : null;
  });
  const enseignantSelections = CRITERES_CALLIGRAPHIE.map((c, i) => {
    const pts = pointsParCritere[i];
    if (pts != null) return calligraphiePointsToFace(pts, c.pointsMax);
    return draft.enseignantSelections[i] ?? null;
  });
  return { ...draft, pointsParCritere, enseignantSelections };
}

function pointsComplets(draft: CalligraphieGrilleDraft): boolean {
  return draft.pointsParCritere.every((p) => typeof p === "number");
}

function TableauCalligraphie({
  bulletinEleveId,
  supabaseEleveId,
  prenom,
}: {
  bulletinEleveId: string;
  supabaseEleveId: string | null | undefined;
  prenom: string;
}) {
  const [draft, setDraft] = useState<CalligraphieGrilleDraft>(() =>
    loadCalligraphieDraft(bulletinEleveId, n)
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const loaded = syncDraft(loadCalligraphieDraft(bulletinEleveId, n));
    setDraft(loaded);
    saveCalligraphieDraft(bulletinEleveId, loaded);
    setSaveMsg(null);
  }, [bulletinEleveId]);

  const persistDraft = useCallback(
    (updater: (prev: CalligraphieGrilleDraft) => CalligraphieGrilleDraft) => {
      setDraft((prev) => {
        const next = syncDraft(updater(prev));
        saveCalligraphieDraft(bulletinEleveId, next);
        return next;
      });
    },
    [bulletinEleveId]
  );

  const onTitreChange = useCallback(
    (value: string) => {
      persistDraft((prev) => ({ ...prev, titreEvaluation: value }));
    },
    [persistDraft]
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
        const pointsMax = CRITERES_CALLIGRAPHIE[idx].pointsMax;
        return {
          ...prev,
          enseignantSelections: prev.enseignantSelections.map((v, i) =>
            i === idx ? (clearing ? null : faceIndex) : v
          ),
          pointsParCritere: prev.pointsParCritere.map((v, i) =>
            i === idx ? (clearing ? null : faceToCalligraphiePoints(faceIndex, pointsMax)) : v
          ),
        };
      });
    },
    [persistDraft]
  );

  const somme = sommePointsCalligraphie(draft.pointsParCritere);
  const tousPointsSaisis = pointsComplets(draft);
  const manquants = draft.pointsParCritere.filter((p) => p == null).length;

  const handleSave = useCallback(async () => {
    const current = syncDraft(draftRef.current);
    setDraft(current);
    saveCalligraphieDraft(bulletinEleveId, current);

    if (!supabaseEleveId) {
      setSaveMsg("Impossible d'envoyer : élève non trouvé. Rechoisis l'élève dans la liste.");
      return;
    }
    const titreEval = (current.titreEvaluation ?? "").trim() || "Période 1";
    if (!pointsComplets(current)) {
      setSaveMsg("Clique un smiley pour CHAQUE critère (ligne), puis réessaie.");
      return;
    }

    const sum = sommePointsCalligraphie(current.pointsParCritere);

    setSaving(true);
    setSaveMsg(null);
    try {
      await deleteResultatsParlerByTitre(supabaseEleveId, SON_ID_CALLIGRAPHIE, titreEval);
      const details: DetailExerciceEval[] = [
        {
          type: DETAIL_TYPE_TITRE_CALLIGRAPHIE,
          titre: titreEval,
          points: sum,
          pointsMax: CALLIGRAPHIE_POINTS_MAX,
        },
      ];
      for (let i = 0; i < CRITERES_CALLIGRAPHIE.length; i++) {
        const c = CRITERES_CALLIGRAPHIE[i];
        details.push({
          type: DETAIL_TYPE_CRITERE_CALLIGRAPHIE,
          titre: c.titre,
          points: current.pointsParCritere[i] ?? 0,
          pointsMax: c.pointsMax,
        });
      }
      await saveResultat({
        eleve_id: String(supabaseEleveId),
        son_id: SON_ID_CALLIGRAPHIE,
        niveau_id: NIVEAU_ID_CALLIGRAPHIE,
        points: sum,
        points_max: CALLIGRAPHIE_POINTS_MAX,
        reussi: sum >= CALLIGRAPHIE_POINTS_MAX / 2,
        detail_exercices: details,
      });
      setSaveMsg(
        `✓ Cote ${formatPointsCalligraphie(sum)}/${CALLIGRAPHIE_POINTS_MAX} enregistrée pour ${prenom} (${titreEval}). L'enfant et les parents la voient dans Mes résultats — pas dans le bulletin.`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur d'enregistrement";
      setSaveMsg(`Erreur : ${msg}.`);
    } finally {
      setSaving(false);
    }
  }, [bulletinEleveId, supabaseEleveId, prenom]);

  return (
    <section className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <h2 className="font-display text-xl font-semibold text-[#2d4a3e] shrink-0">
          Évaluation de calligraphie
        </h2>
        <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
          <span className="text-xs font-medium text-[#2d4a3e]/70">Période / titre</span>
          <input
            type="text"
            value={draft.titreEvaluation}
            onChange={(e) => onTitreChange(e.target.value)}
            placeholder="Période 1"
            className="w-full rounded-xl border border-[#2d4a3e]/25 bg-white px-3 py-2 text-sm text-[#2d4a3e] placeholder:text-[#2d4a3e]/40 focus:border-[#4a7c5a] focus:outline-none focus:ring-2 focus:ring-[#4a7c5a]/30"
          />
        </label>
      </div>
      <p className="mt-2 text-sm text-[#2d4a3e]/75">
        Pour chaque ligne, clique un smiley : 😊 = le maximum de la ligne, 😐 = la moitié, 😠 = 0.
        Les points s&apos;affichent tout seuls. Ensuite{" "}
        <strong>Enregistrer et envoyer à l&apos;enfant</strong>. Cette cote va dans Mes résultats,
        pas dans les points du bulletin.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#4a7c5a]/25 bg-[#e8f5e9]/50 px-4 py-3">
        <span className="text-sm font-medium text-[#2d4a3e]">
          Total :{" "}
          <strong className="text-lg text-[#2d6b3e]">
            {formatPointsCalligraphie(somme)} / {CALLIGRAPHIE_POINTS_MAX}
          </strong>
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
        <div className="min-w-[720px] rounded-2xl border-2 border-[#2d4a3e]/20 overflow-hidden">
          <div className="grid grid-cols-[2.4fr,1.2fr,0.9fr,2fr] text-sm font-semibold text-[#2d4a3e]">
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#e8f0e9] px-3 py-2">
              Critère
            </div>
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#fff5e6] px-2 py-2 text-center">
              Évaluation
            </div>
            <div className="border-r-2 border-b-2 border-[#2d4a3e]/20 bg-[#e8f4ff] px-2 py-2 text-center">
              Points
            </div>
            <div className="border-b-2 border-[#2d4a3e]/20 bg-[#f0f4ff] px-2 py-2">Commentaire</div>
          </div>
          {CRITERES_CALLIGRAPHIE.map((c, idx) => {
            const pts = draft.pointsParCritere[idx];
            return (
              <div
                key={idx}
                className="grid grid-cols-[2.4fr,1.2fr,0.9fr,2fr] items-start border-b border-[#2d4a3e]/10 last:border-b-0"
              >
                <div className="border-r-2 border-[#2d4a3e]/15 bg-[#fafdfa] px-3 py-2">
                  <span className="mr-2 font-semibold text-[#2d4a3e]">{idx + 1}.</span>
                  <span className="text-sm text-[#2d4a3e]">{c.titre}</span>
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
                      title={
                        i === 0
                          ? `Acquis — ${formatPointsCalligraphie(c.pointsMax)}/${c.pointsMax}`
                          : i === 1
                            ? `En cours — ${formatPointsCalligraphie(c.pointsMax / 2)}/${c.pointsMax}`
                            : `À travailler — 0/${c.pointsMax}`
                      }
                    >
                      {face}
                    </button>
                  ))}
                </div>
                <div className="border-r-2 border-[#2d4a3e]/15 bg-[#f5fbff] px-2 py-2 flex items-center justify-center">
                  <span className="text-sm font-bold tabular-nums text-[#1e3d28]">
                    {pts == null
                      ? "—"
                      : `${formatPointsCalligraphie(pts)} / ${c.pointsMax}`}
                  </span>
                </div>
                <div className="bg-[#f8fafc] px-2 py-2 min-w-0">
                  <CommentaireAvecGemini
                    libelle={c.titre}
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
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#2d4a3e]/60">
        Tu peux imprimer cette page (Ctrl+P) pour garder une trace.
      </p>
    </section>
  );
}

export default function EnseignantCalligraphiePage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEleveId, setSelectedEleveId] = useState<string | null>(null);

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
          <span className="font-display text-xl text-[#2d4a3e]">Évaluation de calligraphie</span>
          <Link
            href="/enseignant/sons/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour aux évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation de calligraphie</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          1) Choisis un élève → 2) Clique un smiley sur chaque ligne → 3) Enregistre. L&apos;enfant
          voit sa cote dans Mes résultats. Elle n&apos;entre pas dans les points du bulletin.
        </p>

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
                    onClick={() => setSelectedEleveId(id)}
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

        {bulletinEleve && selectedEleve && (
          <TableauCalligraphie
            bulletinEleveId={bulletinEleve.id}
            supabaseEleveId={String(selectedEleve.id)}
            prenom={selectedEleve.prenom}
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
