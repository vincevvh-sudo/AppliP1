"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { TITRE_CENTIMETRE_METRE } from "../../../data/centimetre-metre-data";
import { QUESTIONS_CENTIMETRE_METRE } from "../../../data/centimetre-metre-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantCentimetreMetrePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/evaluation/grandeur" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_CENTIMETRE_METRE}
          </Link>
          <Link href="/enseignant/maths/evaluation/grandeur" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Grandeur
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_CENTIMETRE_METRE}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          20 questions : pour chaque objet, l&apos;enfant choisit « mètre » ou « centimètre ». Cotation sur 20, score sur 10 envoyé automatiquement à l&apos;enfant à la fin.
        </p>

        <div className="mt-6">
          <Link
            href="/enfant/maths/centimetre-metre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;exercice (enfant)
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Les 20 objets</h2>
          <ul className="mt-3 space-y-1 text-sm text-[#2d4a3e]/85">
            {QUESTIONS_CENTIMETRE_METRE.map((q) => (
              <li key={q.id}>
                <span className="mr-2">{q.emoji}</span>
                <span className="capitalize">{q.nomObjet}</span>
                <span className="text-[#2d4a3e]/60"> → {q.uniteCorrecte}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/enseignant/maths/evaluation/grandeur" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
