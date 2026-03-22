"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_JANVIER,
  JANVIER_EX1_SYLLABES,
  JANVIER_EX2_MOTS,
  JANVIER_EX3_MOTS,
  JANVIER_EX4_VRAI_FAUX,
  JANVIER_TOTAL_QUESTIONS,
} from "../../../../data/lecture-janvier-data";
import { PartageLectureEvalForm } from "../../../../components/PartageLectureEvalForm";
import { LECTURE_EVAL_NIVEAU_JANVIER } from "../../../../data/lecture-eval-partage";

export default function EnseignantLectureJanvierPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/sons/lecture"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              📖
            </span>
            Évaluation {TITRE_JANVIER}
          </Link>
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation lecture
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">Évaluation Lecture — {TITRE_JANVIER}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          4 exercices : syllabes (cha, cho, chou, chè, chi), 20 mots, 5 mots, 5 phrases vrai/faux. L&apos;enfant choisit l&apos;emoji qui correspond au mot (ou vrai/faux). {JANVIER_TOTAL_QUESTIONS} questions, score sur 10.
        </p>

        <div className="mt-6">
          <a
            href="/enfant/sons/lecture/janvier"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;évaluation (enfant)
          </a>
        </div>

        <PartageLectureEvalForm niveauId={LECTURE_EVAL_NIVEAU_JANVIER} titre="Janvier" />

        <div className="mt-8 space-y-6 rounded-2xl bg-white/95 p-6 shadow-lg">
          <section>
            <h2 className="font-display text-lg text-[#2d4a3e]">1. Syllabes (5)</h2>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {JANVIER_EX1_SYLLABES.map((x) => (
                <li key={x.syllabe}>
                  <span className="mr-1 text-xl">{x.emoji}</span>
                  {x.syllabe} ({x.mot})
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg text-[#2d4a3e]">2. Mots (20)</h2>
            <p className="mt-1 text-sm text-[#2d4a3e]/70">
              gare, salade, gomme, niche, bidon, départ, grue, farde, radio, mode, cloche, légume, panade, bagarre, groupe, chute, pêche, mardi, corde, dragon
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg text-[#2d4a3e]">3. Mots (5)</h2>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {JANVIER_EX3_MOTS.map((x) => (
                <li key={x.mot}>
                  <span className="mr-1 text-xl">{x.emoji}</span>
                  {x.mot}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg text-[#2d4a3e]">4. Vrai ou faux (5)</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {JANVIER_EX4_VRAI_FAUX.map((x, i) => (
                <li key={i}>
                  {x.phrase} → {x.correct ? "Vrai" : "Faux"}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <Link
          href="/enseignant/sons/lecture"
          className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
        >
          ← Retour à Évaluation lecture
        </Link>
      </div>
    </main>
  );
}
