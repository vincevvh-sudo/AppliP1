"use client";

import Link from "next/link";
import { ForetMagiqueBackground } from "../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);
const IconUsers = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconBook = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconCalendar = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconMessage = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconTrophy = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const IconClipboard = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const IconMaths = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CARDS = [
  { href: "/enseignant/eleves", icon: IconUsers, title: "Élèves", desc: "Gérer la liste des élèves et leurs codes", color: "bg-[#b8d4e8]/80", hoverColor: "hover:bg-[#b8d4e8]" },
  { href: "/enseignant/bulletin", icon: IconClipboard, title: "Bulletin", desc: "Bulletins et comportement (attendus, commentaires)", color: "bg-[#e8b4d4]/80", hoverColor: "hover:bg-[#e8b4d4]" },
  { href: "/enseignant/sons", icon: IconBook, title: "Forêt des sons", desc: "Partager les sons et exercices aux enfants", color: "bg-[#a8d5ba]/80", hoverColor: "hover:bg-[#a8d5ba]" },
  { href: "/enseignant/maths", icon: IconMaths, title: "L'arbre des mathématiques", desc: "Exercices et progressions en mathématiques", color: "bg-[#c4a8e8]/80", hoverColor: "hover:bg-[#c4a8e8]" },
  { href: "/rendez-vous", icon: IconCalendar, title: "Agenda & Rendez-vous", desc: "Créneaux de rendez-vous parents", color: "bg-[#ffd4a3]/80", hoverColor: "hover:bg-[#ffd4a3]" },
  { href: "/enseignant/resultats", icon: IconTrophy, title: "Résultats", desc: "Voir les résultats des enfants", color: "bg-[#e8b4d4]/80", hoverColor: "hover:bg-[#e8b4d4]" },
  { href: "/enseignant/messagerie", icon: IconMessage, title: "Messagerie", desc: "Échanger avec les élèves", color: "bg-[#b8d4e8]/80", hoverColor: "hover:bg-[#b8d4e8]" },
];

export default function EnseignantPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd4a3]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Royaume des Lettres
          </Link>
          <Link href="/" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-[#2d4a3e]/90 shadow-sm">
            Espace enseignant
          </span>
          <h1 className="font-display text-3xl tracking-wide text-[#2d4a3e] sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-2 text-[#2d4a3e]/85">
            Choisis une section pour commencer
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex flex-col items-center gap-4 rounded-[2rem] bg-white/95 p-6 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:shadow-xl ${card.hoverColor}`}
            >
              <div className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] ${card.color} text-[#2d4a3e] transition group-hover:scale-110`}>
                <card.icon />
              </div>
              <h2 className="font-display text-lg text-[#2d4a3e] text-center">
                {card.title}
              </h2>
              <p className="text-center text-sm text-[#2d4a3e]/75">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-[#2d4a3e]/60">
          Royaume des Lettres · Espace enseignant
        </footer>
      </div>
    </main>
  );
}
