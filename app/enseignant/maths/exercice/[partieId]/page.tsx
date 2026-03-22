"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { PartageMathsModuleForm } from "../../../../components/PartageMathsModuleForm";
import { PARTIES_MATHS } from "../../../../data/maths-data";
import { getExerciceModulesForPartie } from "../../../../data/maths-exercices-modules";

const IconMaths = () => (
  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function EnseignantMathsExercicePartiePage() {
  const params = useParams();
  const partieId = params?.partieId as string;
  const partie = PARTIES_MATHS.find((p) => p.id === partieId);
  const modules = partie ? getExerciceModulesForPartie(partie.id) : [];

  if (!partie) {
    return (
      <main className="relative min-h-[100dvh] overflow-x-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
          <p>Partie introuvable.</p>
          <Link href="/enseignant/maths/exercice" className="mt-4 inline-block text-[#4a7c5a]">
            ← Exercice
          </Link>
        </div>
      </main>
    );
  }

  const isNombres = partieId === "nombres";
  const isSolide = partieId === "solide-figure";

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant/maths/exercice" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a8e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {partie.titre}
          </Link>
          <Link href="/enseignant/maths/exercice" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Exercice
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{partie.titre}</h1>
        <p className="mt-2 text-sm text-[#2d4a3e]/75">
          {isNombres
            ? "Choisis un thème (feuilles d'exercices), puis partage exercices / évaluations depuis chaque thème."
            : "Choisis les élèves qui peuvent accéder à chaque exercice dans l'arbre des mathématiques (côté enfant). Si la table Supabase n'est pas créée, exécute le fichier SQL indiqué dans les messages d'erreur."}
        </p>

        {isNombres && partie.themes.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {partie.themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/enseignant/maths/nombres/${theme.id}`}
                className="rounded-2xl bg-white/95 p-6 shadow-lg transition hover:-translate-y-1 hover:bg-[#c4a8e8]/20"
              >
                <p className="font-display text-lg text-[#2d4a3e]">{theme.titre}</p>
                <p className="mt-1 text-sm text-[#2d4a3e]/65">Partager exercices / évaluations sur la page du thème</p>
              </Link>
            ))}
          </div>
        ) : !isNombres && modules.length > 0 ? (
          <div className="mt-8 space-y-8">
            {isSolide ? (
              <>
                <div>
                  <PartageMathsModuleForm
                    moduleId="vocabulaire-spatial"
                    moduleIdsGroup={["vocabulaire-spatial", "solides"]}
                    compact
                    titreAide="Partage aux élèves de l'app (même liste pour les deux tests espace / géométrie). Exécute le SQL Supabase si besoin."
                  />
                </div>
                {modules.map((m) => (
                  <section key={m.id} className="rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-5 shadow-lg">
                    <h2 className="font-display text-lg text-[#2d4a3e]">{m.titre}</h2>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">{m.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={m.hrefEnseignant}
                        className="rounded-xl bg-[#c4a8e8]/80 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]"
                      >
                        Ouvrir (enseignant)
                      </Link>
                      <Link
                        href={m.hrefEnfant}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
                      >
                        Voir côté enfant ↗
                      </Link>
                    </div>
                  </section>
                ))}
              </>
            ) : (
              modules.map((m) => (
                <div key={m.id} className="space-y-6">
                  <PartageMathsModuleForm
                    moduleId={m.id}
                    compact
                    titreAide="Partage aux élèves de l'app. Exécute le SQL Supabase si besoin."
                  />
                  <section className="rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-5 shadow-lg">
                    <h2 className="font-display text-lg text-[#2d4a3e]">{m.titre}</h2>
                    <p className="mt-1 text-sm text-[#2d4a3e]/70">{m.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={m.hrefEnseignant}
                        className="rounded-xl bg-[#c4a8e8]/80 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]"
                      >
                        Ouvrir (enseignant)
                      </Link>
                      <Link
                        href={m.hrefEnfant}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
                      >
                        Voir côté enfant ↗
                      </Link>
                    </div>
                  </section>
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="mt-6 text-[#2d4a3e]/70">Bientôt disponible.</p>
        )}

        <Link href="/enseignant/maths/exercice" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
