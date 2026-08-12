"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PartageEvalNiveauForm } from "../../../../components/PartageEvalNiveauForm";
import { getSonById } from "../../../../data/sons-data";
import { getExercicesEval } from "../../../../data/eval-data";
import {
  getCategorieForEvalExercice,
  setCategorieForEvalExercice,
  BULLETIN_CATEGORIES_EVAL,
} from "../../../../data/bulletin-exercice-categories";
import type { BulletinCategorieId } from "../../../../data/bulletin-synthese";

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
  const [categories, setCategories] = useState<Record<string, BulletinCategorieId>>({});
  const [partageOuvertId, setPartageOuvertId] = useState<string | null>(null);

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
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation 1, 2, 3 ou 4 — {son.grapheme}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Les enfants <strong>ne voient pas</strong> ces évaluations tant que tu ne les partages pas. Pour chaque
          évaluation : teste, puis partage à <strong>tous</strong> les élèves ou à <strong>certains</strong> élèves.
        </p>

        <div className="mt-10 space-y-8">
          {evalNiveaux.map((niveau) => {
            const subList = subExercicesByEval[niveau.numero] ?? [];
            const ouvert = partageOuvertId === niveau.id;
            return (
              <div key={niveau.id} className="rounded-2xl bg-white/95 p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d4a3e]/10 pb-4">
                  <Link href={`/enseignant/sons/jeu/${son.id}/${niveau.id}`} className="block flex-1">
                    <p className="font-display text-lg text-[#2d4a3e]">{niveau.titre}</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">Toute l&apos;évaluation (chronométrée)</p>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/enseignant/sons/jeu/${son.id}/${niveau.id}`}
                      className="rounded-xl border border-[#2d4a3e]/30 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#a8d5ba]/30"
                    >
                      Tester
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPartageOuvertId(ouvert ? null : niveau.id)}
                      className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d]"
                    >
                      {ouvert ? "Fermer le partage" : "Partager"}
                    </button>
                  </div>
                </div>

                {ouvert && (
                  <PartageEvalNiveauForm
                    sonId={son.id}
                    niveauId={niveau.id}
                    titre={niveau.titre}
                    description={`Partage « ${niveau.titre} » (son ${son.grapheme}) : tous les élèves, ou coche ceux que tu veux. Sans partage, les enfants n'y ont pas accès.`}
                  />
                )}

                <p className="mt-4 mb-2 text-sm font-medium text-[#2d4a3e]/80">
                  Exercices de cette évaluation (branche bulletin) :
                </p>
                <ul className="space-y-3">
                  {subList.map(({ niveauId, titre }) => (
                    <li
                      key={niveauId}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-[#fef9f3]/80 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 text-sm text-[#2d4a3e]">{titre}</span>
                      <select
                        value={categories[niveauId] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value as BulletinCategorieId | "";
                          const cat = v || null;
                          setCategorieForEvalExercice(niveauId, cat);
                          setCategories((prev) =>
                            cat
                              ? { ...prev, [niveauId]: cat }
                              : (() => {
                                  const p = { ...prev };
                                  delete p[niveauId];
                                  return p;
                                })()
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
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

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
