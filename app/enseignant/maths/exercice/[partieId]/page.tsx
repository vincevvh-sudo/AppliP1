"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../../data/maths-data";
import {
  getExerciceModulesForPartie,
  type MathsExerciceModuleId,
} from "../../../../data/maths-exercices-modules";
import { isExerciceModuleShared, setExerciceModuleShared } from "../../../../data/maths-partages";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantMathsExercicePartiePage() {
  const params = useParams();
  const partieId = params?.partieId as string;
  const partie = PARTIES_MATHS.find((p) => p.id === partieId);
  const modules = partie ? getExerciceModulesForPartie(partie.id) : [];
  const [partage, setPartage] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const m of modules) {
      next[m.id] = isExerciceModuleShared(m.id);
    }
    setPartage(next);
    setHydrated(true);
  }, [modules]);

  const toggle = useCallback((id: MathsExerciceModuleId) => {
    setPartage((p) => {
      const next = !p[id];
      setExerciceModuleShared(id, next);
      return { ...p, [id]: next };
    });
  }, []);

  if (!partie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Partie introuvable.</p>
          <Link href="/enseignant/maths/exercice" className="mt-4 inline-block text-[#4a7c5a]">
            ← Exercice
          </Link>
        </div>
      </main>
    );
  }

  const isNombres = partieId === "nombres";

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/exercice" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {partie.titre}
          </Link>
          <Link href="/enseignant/maths/exercice" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Exercice
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{partie.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          {isNombres
            ? "Choisis un thème (feuilles d'exercices), puis partage exercices / évaluations depuis chaque thème."
            : "Coche les exercices que les enfants peuvent ouvrir dans leur arbre (Exercice). Même navigateur : réglages enregistrés sur cet ordinateur."}
        </p>

        {isNombres && partie.themes.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {partie.themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/enseignant/maths/nombres/${theme.id}`}
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">{theme.titre}</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/65">Partager exercices / évaluations sur la page du thème</p>
              </Link>
            ))}
          </div>
        ) : !isNombres && modules.length > 0 ? (
          <div className="mt-6 space-y-4">
            {!hydrated ? (
              <p className="text-sm text-[#2d4a3e]/70">Chargement…</p>
            ) : (
              modules.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-lg text-[#2d4a3e]">{m.titre}</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">{m.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
                      <input
                        type="checkbox"
                        checked={partage[m.id] ?? false}
                        onChange={() => toggle(m.id)}
                        className="h-4 w-4 rounded border-[#2d4a3e]/40"
                      />
                      Partager avec les enfants
                    </label>
                    <Link
                      href={m.hrefEnseignant}
                      className="rounded-xl bg-[#c4a8e8]/80 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]"
                    >
                      Ouvrir (enseignant)
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="mt-6 text-[#2d4a3e]/70">Bientôt disponible.</p>
        )}

        <Link href="/enseignant/maths/exercice" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
