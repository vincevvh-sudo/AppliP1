"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PARTIES_MATHS } from "../../../../data/maths-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantMathsEvaluationPartiePage() {
  const params = useParams();
  const partieId = params?.partieId as string;
  const partie = PARTIES_MATHS.find((p) => p.id === partieId);

  if (!partie) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Partie introuvable.</p>
          <Link href="/enseignant/maths/evaluation" className="mt-4 inline-block text-[#4a7c5a]">← Évaluation</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/evaluation" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {partie.titre}
          </Link>
          <Link href="/enseignant/maths/evaluation" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Évaluation
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{partie.titre}</h1>
        {partieId === "traitement-donnees" ? (
          <>
            <p className="mt-2 text-sm text-[#2d4a3e]/75">Choisis un test à faire passer ou à partager.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/enseignant/maths/suite-logique"
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">Suite logique</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">Suite de formes, glaces, rectangle, cercle, smiley.</p>
              </Link>
            </div>
          </>
        ) : partieId === "nombres" ? (
          <>
            <p className="mt-2 text-sm text-[#2d4a3e]/75">
              Tests d&apos;arithmétique : opérations simples et, plus tard, évaluations partagées sur les nombres.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/enseignant/maths/operations"
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">Opérations</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  Séries 1 à 15 : choisir lesquelles partager avec les enfants (cases à cocher), puis prévisualisation
                  vue élève.
                </p>
              </Link>
            </div>
          </>
        ) : partieId === "grandeur" ? (
          <>
            <p className="mt-2 text-sm text-[#2d4a3e]/75">
              Évaluations en grandeur et mesures.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/enseignant/maths/centimetre-metre"
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">Centimètre ou mètre</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  20 questions : choisir mètre ou centimètre pour chaque objet. Cotation sur 20, score sur 10 envoyé à l&apos;enfant.
                </p>
              </Link>
            </div>
          </>
        ) : partieId === "solide-figure" ? (
          <>
            <p className="mt-2 text-sm text-[#2d4a3e]/75">
              Évaluations en espace et géométrie.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/enseignant/maths/vocabulaire-spatial"
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">Vocabulaire spatial</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  14 phrases à coter (1 point chacune). Score sur 10. Les enfants reçoivent leur résultat.
                </p>
              </Link>
              <Link
                href="/enseignant/maths/solides"
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">Solides</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/70">
                  2 parties : relier des objets au bon solide, puis Vrai/Faux. Score sur 10 envoyé à l&apos;enfant.
                </p>
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-6 text-[#2d4a3e]/70">Bientôt disponible.</p>
        )}
        <Link href="/enseignant/maths/evaluation" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
