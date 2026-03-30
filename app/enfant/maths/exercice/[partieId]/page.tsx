"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../../data/maths-data";
import { getExerciceModulesForPartie } from "../../../../data/maths-exercices-modules";
import { getModulesAccessiblesPourEleve } from "../../../../data/maths-modules-partages-storage";
import {
  getAdditions20SeriesPartages,
  getAdditionsSeriesPartages,
  getMathsThemesExercicesPartagesPourEleve,
  getSoustractionsSeriesPartages,
  getSoustractions20SeriesPartages,
  getAdditionsSoustractions20SeriesPartages,
} from "../../../../data/maths-partages";
import { getAdditionsSerie, type AdditionSerieId } from "../../../../data/maths-additions";
import { getAdditions20Serie, type Addition20SerieId } from "../../../../data/maths-additions-20";
import { getSoustractionSerie, type SoustractionSerieId } from "../../../../data/maths-soustractions";
import { getSoustraction20Serie, type Soustraction20SerieId } from "../../../../data/maths-soustractions-20";
import {
  getAdditionsSoustractions20Serie,
  type AdditionSoustraction20SerieId,
} from "../../../../data/maths-additions-soustractions-20";
import { getEnfantSession } from "../../../../../utils/enfant-session";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnfantMathsExercicePartiePage() {
  const params = useParams();
  const partieId = params?.partieId as string;
  const [exercicesPartages, setExercicesPartages] = useState<string[]>([]);
  const [additionsPartagees, setAdditionsPartagees] = useState<string[]>([]);
  const [additions20Partagees, setAdditions20Partagees] = useState<string[]>([]);
  const [soustractionsPartagees, setSoustractionsPartagees] = useState<string[]>([]);
  const [soustractions20Partagees, setSoustractions20Partagees] = useState<string[]>([]);
  const [additionsSoustractions20Partagees, setAdditionsSoustractions20Partagees] = useState<string[]>([]);
  const [modulesPartages, setModulesPartages] = useState<string[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const partie = PARTIES_MATHS.find((p) => p.id === partieId);
  const modulesDef = partie ? getExerciceModulesForPartie(partie.id) : [];

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      setExercicesPartages([]);
      setAdditionsPartagees([]);
      setAdditions20Partagees([]);
      setSoustractionsPartagees([]);
      setSoustractions20Partagees([]);
      setAdditionsSoustractions20Partagees([]);
      setModulesPartages([]);
      setModulesLoading(false);
      return;
    }
    setExercicesPartages(getMathsThemesExercicesPartagesPourEleve(s.id));
    setAdditionsPartagees(getAdditionsSeriesPartages());
    setAdditions20Partagees(getAdditions20SeriesPartages());
    setSoustractionsPartagees(getSoustractionsSeriesPartages());
    setSoustractions20Partagees(getSoustractions20SeriesPartages());
    setAdditionsSoustractions20Partagees(getAdditionsSoustractions20SeriesPartages());
    getModulesAccessiblesPourEleve(s.id).then((ids) => {
      setModulesPartages(ids);
      setModulesLoading(false);
    });
  }, []);

  const isNombres = partieId === "nombres";
  const hasNombres15 = exercicesPartages.includes("nombres-1-5");
  const hasNombres610 = exercicesPartages.includes("nombres-6-10");
  const hasNombres1015 = exercicesPartages.includes("nombres-10-15");
  const hasNombres1520 = exercicesPartages.includes("nombres-15-20");
  const themesToShow =
    isNombres && partie
      ? partie.themes.filter(
          (t) =>
            (t.id === "1-5" && hasNombres15) ||
            (t.id === "6-10" && hasNombres610) ||
            (t.id === "10-15" && hasNombres1015) ||
            (t.id === "15-20" && hasNombres1520)
        )
      : partie?.themes ?? [];

  const modulesVisibles = modulesDef.filter((m) => modulesPartages.includes(m.id));

  if (!partie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Partie introuvable.</p>
          <Link href="/enfant/maths/exercice" className="mt-4 inline-block text-[#4a7c5a]">
            ← Exercice
          </Link>
        </div>
      </main>
    );
  }

  const emptyNombres = isNombres && themesToShow.length === 0;
  const emptyModules = !isNombres && modulesDef.length > 0 && modulesVisibles.length === 0;
  const empty = isNombres ? emptyNombres : modulesDef.length === 0 ? true : emptyModules;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/maths/exercice" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {partie.titre}
          </Link>
          <Link href="/enfant/maths/exercice" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Exercice
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-white">{partie.titre}</h1>
        <p className="mt-2 text-sm text-white/95">
          {isNombres
            ? "Choisis un thème (exercices partagés par ton maître ou ta maîtresse)."
            : "Exercices partagés par ton maître ou ta maîtresse depuis son espace."}
        </p>

        {!isNombres && modulesLoading ? (
          <p className="mt-6 text-[#2d4a3e]/70">Chargement…</p>
        ) : empty ? (
          <p className="mt-6 text-[#2d4a3e]/70">
            {isNombres
              ? "Aucun exercice partagé pour le moment. Demande à ton maître ou ta maîtresse."
              : "Aucun exercice de cette partie n’est partagé pour toi pour le moment. Demande à ton maître ou ta maîtresse de te sélectionner dans le partage (Exercice → cette partie)."}
          </p>
        ) : isNombres ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {themesToShow.map((theme) => (
                <Link
                  key={theme.id}
                  href={`/enfant/maths/nombres/${theme.id}/exercice`}
                  className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
                >
                  <p className="font-display text-lg text-[#2d4a3e]">{theme.titre}</p>
                  <p className="mt-1 text-sm text-[#2d4a3e]/70">Exercices</p>
                </Link>
              ))}
            </div>

            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-lg text-[#2d4a3e]">Additions jusque 10</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                10 séries de 10 additions, avec une réponse toujours jusqu&apos;à 10.
              </p>
              {additionsPartagees.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/70">
                  Aucune série d&apos;additions partagée pour le moment. Demande à ton maître ou ta maîtresse.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {additionsPartagees.map((sid) => {
                    const { titre } = getAdditionsSerie(sid as AdditionSerieId);
                    return (
                      <Link
                        key={`add-${sid}`}
                        href={`/enfant/maths/additions/${sid}`}
                        className="rounded-2xl bg-[#c4a8e8]/10 px-4 py-3 transition hover:bg-[#c4a8e8]/30"
                      >
                        <span className="font-semibold text-[#2d4a3e]">{titre}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-lg text-[#2d4a3e]">Additions jusque 20</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                10 séries de 10 additions DU + U ou U + DU, avec des réponses entre 10 et 20.
              </p>
              {additions20Partagees.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/70">
                  Aucune série d&apos;additions jusque 20 partagée pour le moment. Demande à ton maître ou ta maîtresse.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {additions20Partagees.map((sid) => {
                    const { titre } = getAdditions20Serie(sid as Addition20SerieId);
                    return (
                      <Link
                        key={`add20-${sid}`}
                        href={`/enfant/maths/additions-20/${sid}`}
                        className="rounded-2xl bg-[#c4a8e8]/10 px-4 py-3 transition hover:bg-[#c4a8e8]/30"
                      >
                        <span className="font-semibold text-[#2d4a3e]">{titre}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-lg text-[#2d4a3e]">Soustraction jusque 10</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                5 séries de 10 soustractions, avec un départ à 10 ou un nombre plus petit que 10.
              </p>
              {soustractionsPartagees.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/70">
                  Aucune série de soustractions partagée pour le moment. Demande à ton maître ou ta maîtresse.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {soustractionsPartagees.map((sid) => {
                    const { titre } = getSoustractionSerie(sid as SoustractionSerieId);
                    return (
                      <Link
                        key={`sub-${sid}`}
                        href={`/enfant/maths/soustractions/${sid}`}
                        className="rounded-2xl bg-[#c4a8e8]/10 px-4 py-3 transition hover:bg-[#c4a8e8]/30"
                      >
                        <span className="font-semibold text-[#2d4a3e]">{titre}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-lg text-[#2d4a3e]">Soustraction jusque 20</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                5 séries de 10 soustractions, avec un départ entre 10 et 20 et des réponses entre 10 et 20.
              </p>
              {soustractions20Partagees.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/70">
                  Aucune série de soustractions jusque 20 partagée pour le moment. Demande à ton maître ou ta maîtresse.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {soustractions20Partagees.map((sid) => {
                    const { titre } = getSoustraction20Serie(sid as Soustraction20SerieId);
                    return (
                      <Link
                        key={`sub20-${sid}`}
                        href={`/enfant/maths/soustractions-20/${sid}`}
                        className="rounded-2xl bg-[#c4a8e8]/10 px-4 py-3 transition hover:bg-[#c4a8e8]/30"
                      >
                        <span className="font-semibold text-[#2d4a3e]">{titre}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-lg text-[#2d4a3e]">Additions et soustractions jusque 20</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/70">
                10 séries de 10 calculs mélangés (additions comme dans la partie additions jusque 20 et soustractions 10–20).
              </p>
              {additionsSoustractions20Partagees.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/70">
                  Aucune série d&apos;additions/soustractions partagée pour le moment. Demande à ton maître ou ta maîtresse.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {additionsSoustractions20Partagees.map((sid) => {
                    const { titre } = getAdditionsSoustractions20Serie(sid as AdditionSoustraction20SerieId);
                    return (
                      <Link
                        key={`mix20-${sid}`}
                        href={`/enfant/maths/additions-soustractions-20/${sid}`}
                        className="rounded-2xl bg-[#c4a8e8]/10 px-4 py-3 transition hover:bg-[#c4a8e8]/30"
                      >
                        <span className="font-semibold text-[#2d4a3e]">{titre}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {modulesVisibles.map((m) => (
              <Link
                key={m.id}
                href={m.hrefEnfant}
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">{m.titre}</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">{m.description}</p>
              </Link>
            ))}
          </div>
        )}

        <Link href="/enfant/maths/exercice" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
