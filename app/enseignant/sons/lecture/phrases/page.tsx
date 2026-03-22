"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_LECTURE_PHRASES,
  QUESTIONS_LECTURE_PHRASES,
} from "../../../../data/lecture-phrases";
import { PartageLectureEvalForm } from "../../../../components/PartageLectureEvalForm";
import { LECTURE_EVAL_NIVEAU_PHRASES } from "../../../../data/lecture-eval-partage";

export default function EnseignantLecturePhrasesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_PHRASES}</span>
          <Link
            href="/enseignant/sons/lecture"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation lecture
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_LECTURE_PHRASES}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          L&apos;élève doit remettre les parties de la phrase dans l&apos;ordre (sujet, verbe, complément du verbe,
          complément de phrase). Les majuscules et la ponctuation l&apos;aident à reconstruire la phrase.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/enfant/sons/lecture/phrases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            Ouvrir l&apos;exercice (vue élève) ↗
          </a>
        </div>

        <PartageLectureEvalForm niveauId={LECTURE_EVAL_NIVEAU_PHRASES} titre="Construction de phrases" />

        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Phrases et découpage</h2>
          <ul className="mt-4 space-y-4 text-sm text-[#2d4a3e]/85">
            {QUESTIONS_LECTURE_PHRASES.map((q, idx) => (
              <li key={q.id} className="space-y-1">
                <p className="font-medium text-[#2d4a3e]">
                  {idx + 1}. {q.phraseComplete}
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.segments.map((seg) => (
                    <span
                      key={seg.id}
                      className="inline-flex items-center gap-1 rounded-full bg-[#a8d5ba]/40 px-3 py-1"
                    >
                      <span className="text-[0.7rem] uppercase tracking-wide text-[#2d4a3e]/70">
                        {seg.role === "sujet"
                          ? "Sujet"
                          : seg.role === "verbe"
                          ? "Verbe"
                          : seg.role === "cv"
                          ? "Complément du verbe"
                          : "Complément de phrase"}
                      </span>
                      <span className="font-semibold text-[#2d4a3e]">{seg.text}</span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/lecture"
          className="mt-8 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour à Évaluation lecture
        </Link>
      </div>
    </main>
  );
}

