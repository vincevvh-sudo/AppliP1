"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PartageMathsModuleForm } from "../../../components/PartageMathsModuleForm";
import { EuroMonnaiePile } from "../../../components/maths/EuroMonnaieGraphics";
import {
  QUESTIONS_EUROS_MONNAIE,
  TITRE_EUROS_MONNAIE,
  totalEuros,
} from "../../../data/euros-monnaie-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantEurosMonnaiePage() {
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
            {TITRE_EUROS_MONNAIE}
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
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_EUROS_MONNAIE}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          20 questions : pièces de 1 € et 2 €, billets de 5 € et 10 € (images dans{" "}
          <code className="rounded bg-[#2d4a3e]/10 px-1">public/monnaie/</code>). Totaux entre 1 € et 20 €.
        </p>

        <div className="mt-6">
          <PartageMathsModuleForm
            moduleId="euros-monnaie"
            moduleIdsGroup={["centimetre-metre", "euros-monnaie", "jours-semaine", "instruments-mesure"]}
            compact
            titreAide="Même liste d&apos;élèves que « Centimètre ou mètre » pour les exercices de grandeur. SQL Supabase si besoin."
          />
        </div>

        <div className="mt-8">
          <Link
            href="/enfant/maths/euros-monnaie"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;exercice (enfant)
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Aperçu des 20 situations (réponses attendues)</h2>
          <ul className="mt-4 space-y-4 text-sm text-[#2d4a3e]/85">
            {QUESTIONS_EUROS_MONNAIE.map((q) => (
              <li key={q.id} className="rounded-xl border border-[#2d4a3e]/10 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#2d4a3e]">#{q.id}</span>
                  <span className="text-[#4a7c5a]">→ {totalEuros(q)} €</span>
                </div>
                <EuroMonnaiePile n1={q.n1} n2={q.n2} n5={q.n5} n10={q.n10} />
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
