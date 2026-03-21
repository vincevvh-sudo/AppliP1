"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { getNiveauxEvalPartagesPourEleve } from "../../data/sons-partages";
import { getDicteesMotsPartagesPourEleve } from "../../data/dictee-mots-partages";
import { NOM_DICTEE_MOTS } from "../../data/dictee-mots-data";
import { getMathsThemesEvaluationsPartages } from "../../data/maths-partages";
import { getSonById, getNiveauById } from "../../data/sons-data";
import { PARTIES_MATHS } from "../../data/maths-data";
import { getEnfantSession } from "../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);
const IconFrancais = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const IconEveil = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconEcouterLire = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);
const IconLecture = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

type EvalFrancais = { son_id: string; niveau_id: string; titre: string; grapheme: string };
type EvalDicteeMots = { num: number; titre: string };
type EvalMaths = { themeId: string; titre: string };

export default function EnfantEvaluationsPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const [evalFrancais, setEvalFrancais] = useState<EvalFrancais[]>([]);
  const [evalDicteesMots, setEvalDicteesMots] = useState<EvalDicteeMots[]>([]);
  const [evalMaths, setEvalMaths] = useState<EvalMaths[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) {
      router.replace("/enfant");
      return;
    }
    Promise.all([
      getNiveauxEvalPartagesPourEleve(s.id),
      getDicteesMotsPartagesPourEleve(s.id as number),
      Promise.resolve(getMathsThemesEvaluationsPartages()),
    ]).then(([pairs, dicteesMotsNums, mathsIds]) => {
      const francais: EvalFrancais[] = [];
      for (const p of pairs) {
        const son = getSonById(p.son_id);
        const niveau = son ? getNiveauById(p.son_id, p.niveau_id) : undefined;
        if (son && niveau) {
          francais.push({
            son_id: p.son_id,
            niveau_id: p.niveau_id,
            titre: niveau.titre,
            grapheme: son.grapheme,
          });
        }
      }
      setEvalFrancais(francais);

      const dicteesMots: EvalDicteeMots[] = [];
      for (const num of dicteesMotsNums) {
        const index = num - 1;
        const titre = NOM_DICTEE_MOTS[index] ?? `Dictée de mots ${num}`;
        dicteesMots.push({ num, titre });
      }
      setEvalDicteesMots(dicteesMots);

      const partie = PARTIES_MATHS.find((x) => x.id === "nombres");
      const maths: EvalMaths[] = [];
      for (const id of mathsIds) {
        const themeId = id === "nombres-1-5" ? "1-5" : id === "nombres-6-10" ? "6-10" : null;
        const theme = partie?.themes.find((t) => t.id === themeId);
        if (themeId && theme) maths.push({ themeId, titre: theme.titre });
      }
      setEvalMaths(maths);
      setLoading(false);
    });
  }, [router]);

  if (!session) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Espace Évaluation
          </Link>
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Mes évaluations
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Les évaluations que ton maître ou ta maîtresse a partagées apparaissent ici, par matière.
        </p>

        {loading ? (
          <p className="mt-10 text-center text-[#2d4a3e]/70">Chargement…</p>
        ) : (
          <div className="mt-10 space-y-10">
            {/* Français — Forêt des sons */}
            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#a8d5ba]/60 text-[#2d4a3e]">
                  <IconFrancais />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#2d4a3e]">Français</h2>
                  <p className="text-sm text-[#2d4a3e]/70">Forêt des sons — évaluations partagées</p>
                </div>
              </div>
              {evalFrancais.length === 0 && evalDicteesMots.length === 0 ? (
                <p className="mt-4 text-sm text-[#2d4a3e]/60">Aucune évaluation français partagée pour le moment.</p>
              ) : (
                <>
                  {evalFrancais.length > 0 && (
                    <>
                      <h3 className="mt-4 font-display text-lg text-[#2d4a3e]">Évaluations 1 à 4</h3>
                      <ul className="mt-2 flex flex-col gap-2">
                        {evalFrancais.map((e) => (
                          <li key={`${e.son_id}-${e.niveau_id}`}>
                            <Link
                              href={`/enfant/sons/${e.son_id}/jeu/${e.niveau_id}`}
                              className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                            >
                              <span className="font-semibold text-[#2d4a3e]">{e.titre}</span>
                              <span className="ml-2 text-[#2d4a3e]/70">— son {e.grapheme}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {evalDicteesMots.length > 0 && (
                    <>
                      <h3 className="mt-6 font-display text-lg text-[#2d4a3e]">Dictées de mots</h3>
                      <ul className="mt-2 flex flex-col gap-2">
                        {evalDicteesMots.map((d) => (
                          <li key={d.num}>
                            <Link
                              href={`/enfant/dictees-mots/${d.num}`}
                              className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                            >
                              <span className="font-semibold text-[#2d4a3e]">{d.titre}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </section>

            {/* Écouter-lire */}
            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#b8d4e8]/60 text-[#2d4a3e]">
                  <IconEcouterLire />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#2d4a3e]">Écouter-lire</h2>
                  <p className="text-sm text-[#2d4a3e]/70">Écoute l&apos;histoire puis réponds Vrai ou Faux</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                <li>
                  <Link
                    href="/enfant/ecouter-lire/chevalier-de-la-nuit"
                    className="block rounded-xl bg-[#b8d4e8]/20 px-4 py-3 transition hover:bg-[#b8d4e8]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Le chevalier de la nuit</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enfant/ecouter-lire/consignes-1"
                    className="block rounded-xl bg-[#b8d4e8]/20 px-4 py-3 transition hover:bg-[#b8d4e8]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Consignes 1</span>
                  </Link>
                </li>
              </ul>
            </section>

            {/* Lecture — Évaluation lecture */}
              <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#a8d5ba]/60 text-[#2d4a3e]">
                  <IconLecture />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#2d4a3e]">Lecture</h2>
                  <p className="text-sm text-[#2d4a3e]/70">
                    Exercices de lecture : sons, syllabes et construction de phrases.
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                <li>
                  <Link
                    href="/enfant/sons/lecture/syllabes"
                    className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Lecture de syllabes</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enfant/sons/lecture/mots"
                    className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Lecture de mots</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enfant/sons/lecture/janvier"
                    className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Janvier</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enfant/sons/lecture/phrases"
                    className="block rounded-xl bg-[#a8d5ba]/20 px-4 py-3 transition hover:bg-[#a8d5ba]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Construction de phrases</span>
                  </Link>
                </li>
              </ul>
            </section>

            {/* Mathématiques — Arbre des mathématiques */}
            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c4a8e8]/60 text-[#2d4a3e]">
                  <IconMaths />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#2d4a3e]">Mathématiques</h2>
                  <p className="text-sm text-[#2d4a3e]/70">L&apos;arbre des mathématiques — évaluations partagées</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                <li>
                  <Link
                    href="/enfant/maths/centimetre-metre"
                    className="block rounded-xl bg-[#c4a8e8]/20 px-4 py-3 transition hover:bg-[#c4a8e8]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Centimètre ou mètre</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/enfant/maths/vocabulaire-spatial"
                    className="block rounded-xl bg-[#c4a8e8]/20 px-4 py-3 transition hover:bg-[#c4a8e8]/40"
                  >
                    <span className="font-semibold text-[#2d4a3e]">Vocabulaire spatial</span>
                  </Link>
                </li>
                {evalMaths.map((e) => (
                  <li key={e.themeId}>
                    <Link
                      href={`/enfant/maths/nombres/${e.themeId}/evaluation`}
                      className="block rounded-xl bg-[#c4a8e8]/20 px-4 py-3 transition hover:bg-[#c4a8e8]/40"
                    >
                      <span className="font-semibold text-[#2d4a3e]">Évaluation — {e.titre}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {evalMaths.length === 0 && (
                <p className="mt-2 text-sm text-[#2d4a3e]/60">Aucune autre évaluation mathématiques partagée pour le moment.</p>
              )}
            </section>

            {/* Éveil */}
            <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#ffd4a3]/60 text-[#2d4a3e]">
                  <IconEveil />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#2d4a3e]">Éveil</h2>
                  <p className="text-sm text-[#2d4a3e]/70">Évaluations à venir</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#2d4a3e]/60">Aucune évaluation éveil pour le moment.</p>
            </section>
          </div>
        )}

        <Link href="/enfant" className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
