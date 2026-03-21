"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../../../components/MiyazakiDecor";
import { TITRE_CONSIGNES_1, ITEMS_CONSIGNES_1 } from "../../../../../../data/consignes-1";

export default function EnseignantConsignes1Page() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_CONSIGNES_1}</span>
          <Link
            href="/enseignant/sons/evaluation/ecouter-lire/ecouter"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluation écouter
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_CONSIGNES_1}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/80">
          10 exercices pour travailler les consignes : écrire, entourer, dessiner, barrer, colorier, encadrer, souligner, recopier, cocher, croix.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/enfant/ecouter-lire/consignes-1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
          >
            Ouvrir l&apos;évaluation (vue élève) ↗
          </a>
        </div>

        <div className="mt-10 rounded-xl border-2 border-[#2d4a3e]/20 bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Liste des 10 exercices</h2>
          <ul className="mt-4 space-y-3">
            {ITEMS_CONSIGNES_1.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d4a3e]/10 font-medium text-[#2d4a3e]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[#2d4a3e]/90">{item.consigne}</p>
                  {item.type === "entoure_mot" && (
                    <p className="mt-0.5 text-[#4a7c5a]">Réponse : « {item.mots[item.correctIndex]} »</p>
                  )}
                  {item.type === "souligne_prenom_fille" && (
                    <p className="mt-0.5 text-[#4a7c5a]">Réponse : « {item.noms[item.correctIndex]} »</p>
                  )}
                  {item.type === "coche" && (
                    <p className="mt-0.5 text-[#4a7c5a]">Réponse : {item.options[item.correctIndex].label}</p>
                  )}
                  {item.type === "croix_sous" && (
                    <p className="mt-0.5 text-[#4a7c5a]">Réponse : {item.options[item.correctIndex].label}</p>
                  )}
                  {(item.type === "ecris_mot" || item.type === "recopie_mot") && (
                    <p className="mt-0.5 text-[#4a7c5a]">Mot attendu : « {item.mot} »</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/enseignant/sons/evaluation/ecouter-lire/ecouter"
          className="mt-8 inline-block rounded-xl bg-[#2d4a3e]/10 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
        >
          ← Retour à Évaluation écouter
        </Link>
      </div>
    </main>
  );
}
