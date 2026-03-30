"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { PartageMathsModuleForm } from "../../../components/PartageMathsModuleForm";
import {
  QUADRILATERES_ITEMS,
  TITRE_QUADRILATERES,
  type QuadrilateresShape,
} from "../../../data/quadrilateres-data";

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

function shapeLabel(shape: QuadrilateresShape): string {
  switch (shape) {
    case "carre":
      return "carré";
    case "rectangle":
      return "rectangle";
    case "triangle":
      return "triangle";
    case "disque":
      return "disque";
    default:
      return shape;
  }
}

export default function EnseignantQuadrilateresPage() {
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
            {TITRE_QUADRILATERES}
          </Link>
          <Link
            href="/enseignant/maths/evaluation/solide-figure"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Espace/géométrie
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_QUADRILATERES}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          L&apos;enfant associe chaque forme à un nombre : carré=1, rectangle=2, triangle=3, disque=4.
          10 formes au total. (Score sur 10 envoyé à l&apos;enfant à la fin.)
        </p>

        <div className="mt-6">
          <PartageMathsModuleForm
            moduleId="quadrilateres"
            compact
            titreAide="Partage aux élèves de l'app (carré=1, rectangle=2, triangle=3, disque=4)."
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/enfant/maths/quadrilateres"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a]/20 px-6 py-3 font-semibold text-[#2d4a3e] transition hover:bg-[#4a7c5a]/30"
          >
            Voir l&apos;exercice (vue élève) ↗
          </Link>
        </div>

        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Réponses attendues</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#2d4a3e]/85">
            <li>
              carré → <span className="font-semibold text-[#4a7c5a]">1</span>
            </li>
            <li>
              rectangle → <span className="font-semibold text-[#4a7c5a]">2</span>
            </li>
            <li>
              triangle → <span className="font-semibold text-[#4a7c5a]">3</span>
            </li>
            <li>
              disque → <span className="font-semibold text-[#4a7c5a]">4</span>
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUADRILATERES_ITEMS.map((it) => (
              <span
                key={it.id}
                className="rounded-xl border border-[#2d4a3e]/15 bg-[#fef9f3] px-3 py-1 text-xs text-[#2d4a3e]/80"
                title={it.id}
              >
                {shapeLabel(it.shape)}→{it.correctValue}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/enseignant/maths/evaluation/solide-figure"
          className="mt-10 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}

