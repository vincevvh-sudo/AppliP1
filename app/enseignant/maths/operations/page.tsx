"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import {
  OPERATIONS_SERIE_IDS_PARTAGEABLES,
  isOperationSerieShared,
  setAllOperationsSeriesShared,
  setOperationSerieShared,
} from "../../../data/maths-partages";
import {
  TITRE_OPERATIONS,
  OPERATIONS_SERIE_1,
  OPERATIONS_SERIE_2,
  OPERATIONS_SERIE_3,
  OPERATIONS_SERIE_4,
  OPERATIONS_SERIE_5,
  OPERATIONS_SERIE_6,
  OPERATIONS_SERIE_7,
  OPERATIONS_SERIE_8,
  OPERATIONS_SERIE_9,
  OPERATIONS_SERIE_10,
  OPERATIONS_SERIE_11,
  OPERATIONS_SERIE_12,
  OPERATIONS_SERIE_13,
  OPERATIONS_SERIE_14,
  OPERATIONS_SERIE_15,
} from "../../../data/maths-operations";

export default function EnseignantMathsOperationsPage() {
  const [partage, setPartage] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const id of OPERATIONS_SERIE_IDS_PARTAGEABLES) {
      next[id] = isOperationSerieShared(id);
    }
    setPartage(next);
    setHydrated(true);
  }, []);

  const toggleSerie = useCallback((id: string) => {
    setPartage((p) => {
      const next = !p[id];
      setOperationSerieShared(id, next);
      return { ...p, [id]: next };
    });
  }, []);

  const shareAll = useCallback(() => {
    setAllOperationsSeriesShared(true);
    const next: Record<string, boolean> = {};
    for (const id of OPERATIONS_SERIE_IDS_PARTAGEABLES) next[id] = true;
    setPartage(next);
  }, []);

  const shareNone = useCallback(() => {
    setAllOperationsSeriesShared(false);
    const next: Record<string, boolean> = {};
    for (const id of OPERATIONS_SERIE_IDS_PARTAGEABLES) next[id] = false;
    setPartage(next);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#1f2933]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#1f2933]/10 bg-[#fef9ff]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#1f2933]">{TITRE_OPERATIONS}</span>
          <Link
            href="/enseignant/maths/evaluation/nombres"
            className="rounded-full bg-[#1f2933]/10 px-4 py-2 text-sm font-medium text-[#1f2933] transition hover:bg-[#1f2933]/20"
          >
            ← Arithmétique
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl text-[#1f2933]">Opérations (additions, soustractions…)</h1>
        <p className="mt-2 text-sm text-[#1f2933]/80">
          10 calculs par série. Choisis quelles séries sont visibles pour les enfants dans{" "}
          <strong>Évaluation → Arithmétique → Opérations</strong> (même navigateur : le partage est enregistré sur cet
          ordinateur).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={shareAll}
            className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            Tout partager avec les enfants
          </button>
          <button
            type="button"
            onClick={shareNone}
            className="rounded-xl bg-[#1f2933]/10 px-4 py-2 text-sm font-semibold text-[#1f2933] transition hover:bg-[#1f2933]/20"
          >
            Ne plus rien partager
          </button>
        </div>

        <p className="mt-4 text-xs text-[#1f2933]/65">
          Par défaut, les séries 1 et 2 sont partagées (comportement précédent). Active 3 à 15 ci-dessous pour les rendre
          visibles côté élève.
        </p>

        <div className="mt-6 space-y-3">
          {hydrated ? (
            OPERATIONS_SERIE_IDS_PARTAGEABLES.map((id) => (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f2933]/15 bg-white/95 px-4 py-3 shadow-sm"
              >
                <span className="font-medium text-[#1f2933]">Opérations {id}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1f2933]">
                    <input
                      type="checkbox"
                      checked={partage[id] ?? false}
                      onChange={() => toggleSerie(id)}
                      className="h-4 w-4 rounded border-[#1f2933]/40"
                    />
                    Partager avec les enfants
                  </label>
                  <a
                    href={`/enseignant/maths/operations/eleve/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#4a7c5a] underline-offset-2 hover:underline"
                  >
                    Prévisualiser (vue élève) ↗
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1f2933]/70">Chargement…</p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 text-sm text-[#1f2933]/80">
          <span>Aperçu des calculs (enseignant) :</span>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 1</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_1.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 2</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_2.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 3</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_3.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 4</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_4.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 5</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_5.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 6</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_6.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 7</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_7.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow md:col-span-2">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 8</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_8.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 9 (compléter le calcul)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_9.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} ? = {q.result}{" "}
                  <span className="font-semibold">(attendu : {q.b})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 10 (compléter le calcul)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_10.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "+"} ? = {q.result}{" "}
                  <span className="font-semibold">(attendu : {q.b})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 11 (soustractions)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_11.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "-"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 12 (soustractions)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_12.map((q) => (
                <li key={q.id}>
                  {q.a} {q.op ?? "-"} {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 13 (10 − …)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_13.map((q) => (
                <li key={q.id}>
                  10 - {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 14 (10 − …)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_14.map((q) => (
                <li key={q.id}>
                  10 - {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-2 border-[#1f2933]/15 bg-white/95 p-5 shadow">
            <h2 className="font-display text-lg text-[#1f2933]">Opérations 15 (10 − …)</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#1f2933]/85">
              {OPERATIONS_SERIE_15.map((q) => (
                <li key={q.id}>
                  10 - {q.b} = <span className="font-semibold">{q.result}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/enseignant/maths/evaluation/nombres"
          className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#1f2933] transition hover:bg-[#c4a8e8]"
        >
          ← Retour à Arithmétique
        </Link>
      </div>
    </main>
  );
}
