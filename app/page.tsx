"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "./components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);
const IconTeacher = () => (
  <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const IconChild = () => (
  <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 shadow-sm backdrop-blur">
            <IconLeaf />
            <span className="font-display text-lg tracking-wide text-[#2d4a3e]">
              Royaume des premières Primaires
            </span>
          </div>
          <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            Une aventure pour apprendre
          </h1>
          <p className="mt-3 text-white/95">
            Choisis ton espace pour commencer
          </p>
        </header>

        {/* Boutons principaux : Enseignant / Enfant */}
        <section className="mb-16 flex flex-col gap-6 sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href="/enseignant"
            className="group flex flex-col items-center gap-4 rounded-[2rem] bg-white/95 p-8 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:shadow-xl hover:bg-[#ffd4a3]/30"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-[#ffd4a3]/80 text-[#2d4a3e] transition group-hover:scale-110">
              <IconTeacher />
            </div>
            <h2 className="font-display text-xl text-[#2d4a3e]">Enseignant</h2>
            <p className="text-center text-sm text-[#2d4a3e]/80">
              Gérer les élèves, les sons et les exercices
            </p>
          </Link>

          <Link
            href="/enfant"
            className="group flex flex-col items-center gap-4 rounded-[2rem] bg-white/95 p-8 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:shadow-xl hover:bg-[#a8d5ba]/30"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-[#a8d5ba]/80 text-[#2d4a3e] transition group-hover:scale-110">
              <IconChild />
            </div>
            <h2 className="font-display text-xl text-[#2d4a3e]">Enfant</h2>
            <p className="text-center text-sm text-[#2d4a3e]/80">
              Faire les exercices et s&apos;amuser !
            </p>
          </Link>
        </section>

        <footer className="text-center text-sm text-[#2d4a3e]/70">
          Royaume des premières Primaires · CP · Une aventure douce pour les 6 ans
        </footer>
      </div>
    </main>
  );
}
