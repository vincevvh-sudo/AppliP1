"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import {
  OBJETS_A_RELier,
  SOLIDES,
  SOLIDES_VRAI_FAUX,
  TITRE_SOLIDES_EVALUATION,
} from "../../../data/solides-evaluation-data";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

export default function EnseignantSolidesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enseignant/maths/evaluation/solide-figure"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_SOLIDES_EVALUATION}
          </Link>
          <Link
            href="/enseignant/maths/evaluation/solide-figure"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Espace/géométrie
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_SOLIDES_EVALUATION}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          Évaluation en 2 parties : relier des objets au bon solide (8 items) puis répondre Vrai/Faux (8 phrases).
          La cotation est sur 10, et le résultat est enregistré dans <code>exercice_resultats</code>.
        </p>

        <div className="mt-6">
          <Link
            href="/enfant/maths/solides"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-medium text-white transition hover:bg-[#3d6b4d]"
          >
            Voir l&apos;évaluation (enfant)
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Partie 1 · Relier</h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/75">
            8 objets à relier à l&apos;un des 4 solides (2 objets par solide).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SOLIDES.map((s) => (
              <div key={s.id} className="rounded-xl border border-[#2d4a3e]/10 bg-white p-4">
                <p className="font-medium">
                  <span className="mr-2">{s.emoji}</span>
                  {s.label}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[#2d4a3e]/80">
                  {OBJETS_A_RELier.filter((o) => o.solide === s.id).map((o) => (
                    <li key={o.id}>
                      {o.image ? (
                        <img src={o.image} alt={o.label} className="mr-2 inline h-8 w-10 rounded object-cover" />
                      ) : (
                        <span className="mr-2">{o.emoji}</span>
                      )}
                      {o.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Partie 2 · Vrai/Faux</h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/75">8 phrases sur le fait que les solides roulent ou non.</p>
          <ul className="mt-4 space-y-2 text-sm text-[#2d4a3e]/85">
            {SOLIDES_VRAI_FAUX.map((q) => (
              <li key={q.id} className="rounded-xl border border-[#2d4a3e]/10 bg-white p-3">
                {q.phrase} <span className="text-[#2d4a3e]/60">→ {q.correct ? "Vrai" : "Faux"}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/maths/evaluation/solide-figure"
          className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}

