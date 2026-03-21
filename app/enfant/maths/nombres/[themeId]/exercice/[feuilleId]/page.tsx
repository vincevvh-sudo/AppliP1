"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../../../components/MiyazakiDecor";
import { FEUILLES_NOMBRES_1_5, FEUILLES_NOMBRES_6_10 } from "../../../../../../data/maths-data";
import ExerciceFeuille1 from "../../../../../../components/maths/ExerciceFeuille1";
import ExerciceFeuille2 from "../../../../../../components/maths/ExerciceFeuille2";
import ExerciceFeuille3 from "../../../../../../components/maths/ExerciceFeuille3";
import ExerciceFeuille4 from "../../../../../../components/maths/ExerciceFeuille4";
import ExerciceFeuille1_610 from "../../../../../../components/maths/ExerciceFeuille1_610";
import ExerciceFeuille2_610 from "../../../../../../components/maths/ExerciceFeuille2_610";
import ExerciceFeuille3_610 from "../../../../../../components/maths/ExerciceFeuille3_610";
import ExerciceFeuille4_610 from "../../../../../../components/maths/ExerciceFeuille4_610";
import ExerciceFeuille5_610 from "../../../../../../components/maths/ExerciceFeuille5_610";

const FEUILLES_INTERACTIVES = ["feuille-1", "feuille-2", "feuille-3", "feuille-4", "feuille-5"] as const;

export default function EnfantMathsNombresFeuillePage() {
  const params = useParams();
  const themeId = params?.themeId as string;
  const feuilleId = params?.feuilleId as string;
  const is610 = themeId === "6-10";
  const feuilles = is610 ? FEUILLES_NOMBRES_6_10 : FEUILLES_NOMBRES_1_5;
  const feuille = feuilles.find((f) => f.id === feuilleId);
  const isInteractif = FEUILLES_INTERACTIVES.includes(feuilleId as (typeof FEUILLES_INTERACTIVES)[number]);

  if (!feuille) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
          <p>Feuille introuvable.</p>
          <Link href={`/enfant/maths/nombres/${themeId}/exercice`} className="mt-4 inline-block text-[#4a7c5a]">← Exercices</Link>
        </div>
      </main>
    );
  }

  const exercices = feuille.description.split("·").map((s) => s.trim()).filter(Boolean);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{feuille.titre}</span>
          <Link
            href={`/enfant/maths/nombres/${themeId}/exercice`}
            className="min-h-[44px] min-w-[44px] rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8]"
          >
            ← Retour aux feuilles
          </Link>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8 pb-16">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{feuille.titre}</h1>

        {isInteractif ? (
          <>
            <p className="mt-2 text-sm text-[#2d4a3e]/75">
              Fais les exercices sur l&apos;écran. Tu peux cliquer ou toucher (PC, Mac, tablette).
            </p>
            <div className="mt-6">
              {is610 ? (
                <>
                  {feuilleId === "feuille-1" && <ExerciceFeuille1_610 />}
                  {feuilleId === "feuille-2" && <ExerciceFeuille2_610 />}
                  {feuilleId === "feuille-3" && <ExerciceFeuille3_610 />}
                  {feuilleId === "feuille-4" && <ExerciceFeuille4_610 />}
                  {feuilleId === "feuille-5" && <ExerciceFeuille5_610 />}
                </>
              ) : (
                <>
                  {feuilleId === "feuille-1" && <ExerciceFeuille1 />}
                  {feuilleId === "feuille-2" && <ExerciceFeuille2 />}
                  {feuilleId === "feuille-3" && <ExerciceFeuille3 />}
                  {feuilleId === "feuille-4" && <ExerciceFeuille4 />}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
              <ul className="list-inside list-decimal space-y-2 text-[#2d4a3e]">
                {exercices.map((exo, i) => (
                  <li key={i}>{exo}</li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[#2d4a3e]/60">
                Demande à ton maître ou ta maîtresse la feuille à faire, ou imprime cette page.
              </p>
            </div>
          </>
        )}

        <Link
          href={`/enfant/maths/nombres/${themeId}/exercice`}
          className="mt-8 inline-block min-h-[48px] rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8] focus:outline-none focus:ring-2 focus:ring-[#c4a8e8]"
        >
          ← Retour aux feuilles
        </Link>
      </div>
    </main>
  );
}
