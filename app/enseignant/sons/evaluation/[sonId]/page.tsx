"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { getSonById, getNiveauById, type Niveau } from "../../../../data/sons-data";
import { getExercicesEval } from "../../../../data/eval-data";
import { setPartageEvalNiveau } from "../../../../data/sons-partages";
import {
  getCategorieForEvalExercice,
  setCategorieForEvalExercice,
  BULLETIN_CATEGORIES_EVAL,
} from "../../../../data/bulletin-exercice-categories";
import type { BulletinCategorieId } from "../../../../data/bulletin-synthese";
import { supabase } from "../../../../../utils/supabase";
import type { EleveRow } from "../../../../../utils/supabase";

const TITRES_EXO_EVAL: Record<string, string> = {
  "entoure-son": "Entoure le son dans le mot",
  "repere-son": "Repère le son",
  "entoure-syllabe": "Entoure la syllabe",
  "ecris-syllabe": "Écris la syllabe",
  "entoure-lettre": "Entoure la lettre",
  "entoure-lettre-dans-mot": "Entoure la lettre dans le mot",
  "relie-ecritures": "Relie les écritures",
  "article-le-la": "Le ou la devant le mot",
  "image-deux-mots": "Choisis le mot qui correspond à l'image",
};

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantEvaluationSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [modalNiveau, setModalNiveau] = useState<Niveau | null>(null);
  const [partagerTous, setPartagerTous] = useState(true);
  const [selectedEleveId, setSelectedEleveId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [categories, setCategories] = useState<Record<string, BulletinCategorieId>>({});

  const subExercicesByEval = useMemo(() => {
    if (!son) return {} as Record<number, { niveauId: string; titre: string; type: string }[]>;
    const out: Record<number, { niveauId: string; titre: string; type: string }[]> = {};
    for (let i = 1; i <= 4; i++) {
      const series = getExercicesEval(son, i, i);
      out[i] = series.map((s, j) => ({
        niveauId: `${son.id}-eval-${i}-${j}`,
        titre: TITRES_EXO_EVAL[s.type] ?? s.type,
        type: s.type,
      }));
    }
    return out;
  }, [son]);

  useEffect(() => {
    const next: Record<string, BulletinCategorieId> = {};
    for (const list of Object.values(subExercicesByEval)) {
      for (const { niveauId } of list) {
        const cat = getCategorieForEvalExercice(niveauId);
        if (cat) next[niveauId] = cat;
      }
    }
    setCategories((prev) => (Object.keys(next).length === 0 ? prev : { ...prev, ...next }));
  }, [son?.id, subExercicesByEval]);

  const fetchEleves = useCallback(async () => {
    const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
    setEleves((data ?? []) as EleveRow[]);
  }, []);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  const openPartager = (niveau: Niveau) => {
    setModalNiveau(niveau);
    setPartagerTous(true);
    setSelectedEleveId("");
    setMessage(null);
  };

  const handlePartager = async () => {
    if (!son || !modalNiveau) return;
    setSaving(true);
    setMessage(null);
    const toAll = partagerTous;
    const eleveIds = toAll ? [] : selectedEleveId === "" ? [] : [selectedEleveId as number];
    if (!toAll && eleveIds.length === 0) {
      setMessage({ type: "error", text: "Choisis un élève." });
      setSaving(false);
      return;
    }
    const { ok, error } = await setPartageEvalNiveau(son.id, modalNiveau.id, toAll, eleveIds);
    setSaving(false);
    if (ok) {
      setMessage({ type: "ok", text: toAll ? "Partagé à tous les élèves." : "Partagé à l'élève choisi." });
      setTimeout(() => {
        setModalNiveau(null);
      }, 1500);
    } else {
      setMessage({ type: "error", text: error ?? "Erreur lors du partage." });
    }
  };

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Son introuvable.</p>
          <Link href="/enseignant/sons/evaluation" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour
          </Link>
        </div>
      </main>
    );
  }

  const evalNiveaux = son.niveaux.filter((n) => n.type === "eval" && n.numero >= 1 && n.numero <= 4);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/evaluation"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Évaluations — {son.grapheme}
          </Link>
          <Link
            href="/enseignant/sons/evaluation"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">
          Évaluation 1, 2, 3 ou 4 — {son.grapheme}
        </h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Choisir une évaluation à tester ou à partager aux élèves (tous ou un seul).
        </p>

        <div className="mt-10 space-y-8">
          {evalNiveaux.map((niveau) => {
            const subList = subExercicesByEval[niveau.numero] ?? [];
            return (
              <div
                key={niveau.id}
                className="rounded-2xl bg-white/95 p-6 shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d4a3e]/10 pb-4">
                  <Link
                    href={`/enseignant/sons/jeu/${son.id}/${niveau.id}`}
                    className="block flex-1"
                  >
                    <p className="font-display text-lg text-[#2d4a3e]">{niveau.titre}</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">Toute l'évaluation (chronométrée)</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openPartager(niveau)}
                    className="rounded-xl bg-[#4a7c5a]/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4a7c5a]"
                  >
                    Partager toute l'évaluation
                  </button>
                </div>
                <p className="mt-4 mb-2 text-sm font-medium text-[#2d4a3e]/80">
                  Ou partager un exercice (branche bulletin puis partager) :
                </p>
                <ul className="space-y-3">
                  {subList.map(({ niveauId, titre }) => (
                    <li
                      key={niveauId}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-[#fef9f3]/80 py-2 px-3"
                    >
                      <span className="min-w-0 flex-1 text-sm text-[#2d4a3e]">{titre}</span>
                      <select
                        value={categories[niveauId] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value as BulletinCategorieId | "";
                          const cat = v || null;
                          setCategorieForEvalExercice(niveauId, cat);
                          setCategories((prev) =>
                            cat ? { ...prev, [niveauId]: cat } : (() => { const p = { ...prev }; delete p[niveauId]; return p; })()
                          );
                        }}
                        className="rounded-lg border border-[#2d4a3e]/20 bg-white px-2 py-1.5 text-sm text-[#2d4a3e]"
                        title="Branche du bulletin pour cet exercice"
                      >
                        <option value="">— Branche —</option>
                        {BULLETIN_CATEGORIES_EVAL.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <Link
                        href={`/enseignant/sons/jeu/${son.id}/${niveauId}`}
                        className="rounded-lg border border-[#2d4a3e]/30 px-3 py-1.5 text-sm text-[#2d4a3e] transition hover:bg-[#a8d5ba]/30"
                      >
                        Tester
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const n = getNiveauById(son.id, niveauId);
                          if (n) openPartager(n);
                        }}
                        className="rounded-lg bg-[#4a7c5a]/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#4a7c5a]"
                      >
                        Partager
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {modalNiveau && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !saving && setModalNiveau(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg text-[#2d4a3e]">
                Partager « {modalNiveau.titre} » — {son.grapheme}
              </h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                À qui partager cette évaluation ?
              </p>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="partager-cible"
                    checked={partagerTous}
                    onChange={() => setPartagerTous(true)}
                    className="h-4 w-4 text-[#4a7c5a]"
                  />
                  <span className="text-[#2d4a3e]">Tous les élèves</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="partager-cible"
                    checked={!partagerTous}
                    onChange={() => setPartagerTous(false)}
                    className="h-4 w-4 text-[#4a7c5a]"
                  />
                  <span className="text-[#2d4a3e]">Un seul élève</span>
                </label>
                {!partagerTous && (
                  <select
                    value={selectedEleveId}
                    onChange={(e) => setSelectedEleveId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-[#2d4a3e]/20 px-4 py-2 text-[#2d4a3e]"
                  >
                    <option value="">— Choisir un élève —</option>
                    {eleves.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {message && (
                <p
                  className={`mt-3 text-sm ${message.type === "ok" ? "text-[#4a7c5a]" : "text-red-600"}`}
                >
                  {message.text}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handlePartager}
                  disabled={saving || (!partagerTous && selectedEleveId === "")}
                  className="rounded-xl bg-[#4a7c5a] px-5 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Partage…" : "Partager"}
                </button>
                <button
                  type="button"
                  onClick={() => !saving && setModalNiveau(null)}
                  className="rounded-xl border border-[#2d4a3e]/30 px-5 py-2 text-[#2d4a3e]"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/enseignant/sons/evaluation"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour aux sons
        </Link>
      </div>
    </main>
  );
}
