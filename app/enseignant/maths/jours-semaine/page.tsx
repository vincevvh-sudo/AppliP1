"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PartageMathsModuleForm } from "../../../components/PartageMathsModuleForm";
import { JOURS_SEMAINE, TITRE_JOURS_SEMAINE } from "../../../data/jours-semaine-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantJoursSemainePage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/maths/exercice/grandeur"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_JOURS_SEMAINE}
          </Link>
          <Link
            href="/enseignant/maths/exercice/grandeur"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Grandeur
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_JOURS_SEMAINE}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Les 7 jours sont affichés dans un ordre aléatoire : l&apos;enfant écrit le numéro (1 à 7) correspondant à
          chaque jour. Score sur 7.
        </p>

        <div className="mt-6">
          <PartageMathsModuleForm
            moduleId="jours-semaine"
            moduleIdsGroup={["centimetre-metre", "euros-monnaie", "jours-semaine", "instruments-mesure"]}
            compact
            titreAide="Même liste d&apos;élèves que les autres exercices de grandeur. SQL Supabase si besoin."
          />
        </div>

        <div className="mt-8">
          <Link
            href="/enfant/maths/jours-semaine"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;exercice (enfant)
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Correspondance attendue</h2>
          <ul className="mt-3 space-y-1 text-sm text-[#2d4a3e]/85">
            {JOURS_SEMAINE.map((j) => (
              <li key={j.id}>
                <span className="font-semibold">{j.label}</span> = {j.numero}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/maths/exercice/grandeur"
          className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}
