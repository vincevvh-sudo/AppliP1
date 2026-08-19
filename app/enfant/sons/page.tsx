"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { getSonById, PARTIES_FORET, getSonsByPartie } from "../../data/sons-data";
import { getSharedSonsForEleve, getNiveauxEvalPartagesPourEleve } from "../../data/sons-partages";
import { getDicteesPartagesPourEleve } from "../../data/dictee-partages";
import { getDicteesMotsPartagesPourEleve } from "../../data/dictee-mots-partages";
import { NOM_DICTEE } from "../../data/dictee-syllabes";
import {
  getFluenceDisplayLabel,
  isFluenceNiveauId,
  sonIdFromFluenceNiveauId,
} from "../../data/fluence-partage";
import { getEnfantSession } from "../../../utils/enfant-session";
import { useMarkEnfantSectionSeen } from "../../hooks/useMarkEnfantSectionSeen";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantSonsPage() {
  useMarkEnfantSectionSeen("francais");
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const [sharedIds, setSharedIds] = useState<string[]>([]);
  const [dicteesPartagees, setDicteesPartagees] = useState<number[]>([]);
  const [dicteesMotsPartagees, setDicteesMotsPartagees] = useState<number[]>([]);
  const [fluenceSonIds, setFluenceSonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    setReady(true);
    if (!s) {
      setLoading(false);
      return;
    }
    Promise.all([
      getSharedSonsForEleve(s.id),
      getDicteesPartagesPourEleve(s.id),
      getDicteesMotsPartagesPourEleve(s.id as number),
      getNiveauxEvalPartagesPourEleve(s.id),
    ]).then(([ids, dictees, dicteesMots, niveaux]) => {
      setSharedIds(ids);
      setDicteesPartagees(dictees);
      setDicteesMotsPartagees(dicteesMots);
      const fluenceIds = niveaux
        .filter((n) => isFluenceNiveauId(n.niveau_id))
        .map((n) => sonIdFromFluenceNiveauId(n.niveau_id) ?? n.son_id)
        .filter((id, i, arr) => !!getSonById(id) && arr.indexOf(id) === i);
      setFluenceSonIds(fluenceIds);
      setLoading(false);
    });
  }, []);

  const allSonIds = PARTIES_FORET.flatMap((p) => p.sonIds);
  // Uniquement les sons explicitement partagés (jamais « tout » par défaut).
  const idsToShow = sharedIds.filter((id) => allSonIds.includes(id));

  /** Pour une partie avec des sons : uniquement les sons partagés avec cet élève. */
  function getSonsToShowInPartie(partie: (typeof PARTIES_FORET)[0]) {
    if (partie.sonIds.length === 0) return [];
    return getSonsByPartie(partie).filter((s) => idsToShow.includes(s.id));
  }

  if (!ready) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Connecte-toi d&apos;abord.</p>
          <Link href="/enfant" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Français
          </Link>
          <Link
            href="/enfant"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-white sm:text-3xl">Choisis un son</h1>
        <p className="mt-2 text-white/95">Clique sur un son pour faire les exercices.</p>

        {loading ? (
          <p className="mt-12 text-center text-[#2d4a3e]/70">Chargement…</p>
        ) : (
          <>
            {fluenceSonIds.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-lg text-[#2d4a3e]">Fluence</h2>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  Lecture rapide partagée par ton maître ou ta maîtresse.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {fluenceSonIds.map((id) => {
                    const son = getSonById(id);
                    if (!son) return null;
                    const label = getFluenceDisplayLabel(son);
                    return (
                      <Link
                        key={id}
                        href={`/enfant/sons/fluence/${id}`}
                        className="flex min-h-24 min-w-[6rem] flex-col items-center justify-center rounded-2xl bg-white/95 px-4 py-3 shadow-lg transition hover:-translate-y-2 hover:bg-[#a8d5ba]/50 hover:shadow-xl sm:min-w-[8rem]"
                      >
                        <span className="text-center font-display text-base font-semibold text-[#2d4a3e] sm:text-lg">
                          {label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {allSonIds.length > 0 && idsToShow.length === 0 && fluenceSonIds.length === 0 ? (
              <p className="mt-12 text-center text-[#2d4a3e]/80">
                Aucun son partagé pour le moment. Demande à ton maître ou ta maîtresse !
              </p>
            ) : (
              <div className="mt-10 space-y-12">
                {PARTIES_FORET.map((partie) => (
                  <section key={partie.id}>
                    <h2 className="font-display text-lg text-[#2d4a3e]">{partie.titre}</h2>
                    {partie.sonIds.length > 0 && (
                      <>
                        {getSonsToShowInPartie(partie).length === 0 ? (
                          <p className="mt-2 text-sm text-[#2d4a3e]/60">
                            Aucun son dans cette partie pour le moment.
                          </p>
                        ) : (
                          <div className="mt-4 flex flex-wrap justify-center gap-4">
                            {getSonsToShowInPartie(partie).map((son) => (
                              <Link
                                key={son.id}
                                href={`/enfant/sons/${son.id}`}
                                className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white/95 shadow-lg transition hover:-translate-y-2 hover:bg-[#a8d5ba]/50 hover:shadow-xl"
                              >
                                <span className="text-3xl font-bold text-[#2d4a3e]">
                                  {son.grapheme.split(",")[0].trim()}
                                </span>
                                <span className="text-xs text-[#2d4a3e]/70">{son.phoneme}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {partie.isEvaluations && (
                      <p className="mt-2 text-sm text-[#2d4a3e]/80">
                        Les évaluations n&apos;apparaissent que si ton maître ou ta maîtresse les a partagées (espace
                        Évaluations).
                      </p>
                    )}
                    {partie.isLecture && (
                      <div className="mt-4">
                        <Link
                          href="/enfant/sons/lecture"
                          className="inline-block rounded-2xl bg-white/95 p-4 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/30"
                        >
                          <p className="font-display text-lg text-[#2d4a3e]">Lecture</p>
                          <p className="mt-1 text-sm text-[#2d4a3e]/70">Exercices de lecture (à venir).</p>
                        </Link>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {dicteesPartagees.length > 0 && (
              <section className={idsToShow.length > 0 || fluenceSonIds.length > 0 ? "mt-12" : "mt-10"}>
                <h2 className="font-display text-lg text-[#2d4a3e]">Dictées</h2>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  Choisis une dictée : on te dit une syllabe, tu l&apos;écris.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {dicteesPartagees.map((num) => (
                    <Link
                      key={num}
                      href={`/enfant/dictees/${num}`}
                      className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-white/95 shadow-lg transition hover:-translate-y-2 hover:bg-[#a8d5ba]/50 hover:shadow-xl sm:h-28 sm:w-40 sm:min-w-[10rem]"
                    >
                      <span className="text-center font-display text-base font-semibold text-[#2d4a3e] sm:text-lg">
                        {NOM_DICTEE[num - 1]}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {dicteesMotsPartagees.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg text-[#2d4a3e]">Dictées de mots</h2>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  Ton maître ou ta maîtresse a partagé des dictées de mots pour t&apos;entraîner à la maison.
                </p>
                <div className="mt-4">
                  <Link
                    href="/enfant/dictees-mots"
                    className="inline-block rounded-2xl bg-white/95 p-4 shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a8d5ba]/30"
                  >
                    <p className="font-display text-lg text-[#2d4a3e]">Voir les dictées de mots</p>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">
                      {dicteesMotsPartagees.length} dictée(s) de mots sont disponibles.
                    </p>
                  </Link>
                </div>
              </section>
            )}
          </>
        )}

        <Link
          href="/enfant"
          className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}
