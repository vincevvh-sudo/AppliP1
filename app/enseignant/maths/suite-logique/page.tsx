"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PartageMathsModuleForm } from "../../../components/PartageMathsModuleForm";
import { TITRE_SUITE_LOGIQUE, ITEMS_SUITE_LOGIQUE } from "../../../data/suite-logique";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantSuiteLogiquePage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/maths/evaluation/traitement-donnees"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_SUITE_LOGIQUE}
          </Link>
          <Link
            href="/enseignant/maths/evaluation/traitement-donnees"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Traitement de données
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_SUITE_LOGIQUE}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          Formes, glaces (3 groupes de 3), puis rectangle / cercle / smiley : l&apos;élève choisit la suite logique.
        </p>

        <div className="mt-6">
          <PartageMathsModuleForm
            moduleId="suite-logique"
            compact
            titreAide="Partage aux élèves de l'app. Exécute le SQL Supabase si besoin."
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/enfant/maths/suite-logique"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#c4a8e8] px-6 py-3 font-semibold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/90"
          >
            Ouvrir l&apos;exercice (vue élève) ↗
          </a>
        </div>

        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Réponses attendues</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#2d4a3e]/80">
            {ITEMS_SUITE_LOGIQUE.map((it, i) => {
              const correct = "correctIndex" in it ? it.correctIndex : null;
              const label =
                it.type === "formes" ? `Formes : option ${correct! + 1}` :
                it.type === "glaces" ? `Glaces : groupe ${correct! + 1} (sur 3)` :
                it.type === "rectangle" ? "Rectangle : boule en bas à gauche" :
                it.type === "cercle" ? "Cercle : avec 4 lignes" :
                it.type === "smiley" ? "Smiley : sourire vers le bas" : "";
              return (
                <li key={i}>
                  <span className="font-medium text-[#2d4a3e]/70">{i + 1}.</span> {label}
                </li>
              );
            })}
          </ul>
        </div>

        <Link
          href="/enseignant/maths/evaluation/traitement-donnees"
          className="mt-8 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour à Traitement de données
        </Link>
      </div>
    </main>
  );
}
