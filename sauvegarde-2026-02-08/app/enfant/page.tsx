"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../components/MiyazakiDecor";
import { parseAvatarData } from "../components/AvatarCreator";
import AvatarSelector from "../components/AvatarSelector";
import { getAvatarFromStorage, getAvatarPhotoFromStorage, setAvatarPhotoInStorage } from "../data/avatar-storage";
import { supabase } from "../../utils/supabase";
import type { EleveRow } from "../../utils/supabase";
import { getEnfantSession, setEnfantSession, clearEnfantSession } from "../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);
const IconResult = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconExercise = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CARDS = [
  { href: "/enfant/resultats", icon: IconResult, title: "Mes résultats", desc: "Voir mes étoiles et mes progrès", color: "bg-[#b8d4e8]/80", hoverColor: "hover:bg-[#b8d4e8]" },
  { href: "/enfant/dates", icon: IconCalendar, title: "Les dates", desc: "Voir quand il y a école et les rendez-vous", color: "bg-[#ffd4a3]/80", hoverColor: "hover:bg-[#ffd4a3]" },
  { href: "/enfant/sons", icon: IconExercise, title: "Forêt des sons", desc: "Exercices de lecture et de sons", color: "bg-[#a8d5ba]/80", hoverColor: "hover:bg-[#a8d5ba]" },
];

export default function EnfantPage() {
  const router = useRouter();
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ id: number; prenom: string; nom: string } | null>(null);
  const [avatarData, setAvatarData] = useState<ReturnType<typeof parseAvatarData>>(null);
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string | null>(null);
  const [avatarCanChange, setAvatarCanChange] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<EleveRow | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  const fetchEleves = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      if (error) throw error;
      setEleves((data ?? []) as EleveRow[]);
    } catch {
      setEleves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (s) {
      const stored = getAvatarFromStorage(s.id);
      const parsed = parseAvatarData(stored);
      if (parsed) {
        setAvatarData(parsed);
        setAvatarPhotoUrl(getAvatarPhotoFromStorage(s.id));
      }
    }
  }, []);

  useEffect(() => {
    if (!session) fetchEleves();
  }, [session, fetchEleves]);

  const fetchAvatar = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await supabase
        .from("eleves")
        .select("avatar_json, avatar_can_change, avatar_photo_url")
        .eq("id", session.id)
        .single();
      const parsedFromSupabase = parseAvatarData(data?.avatar_json ?? null);
      const storedJson = getAvatarFromStorage(session.id);
      const parsedFromStorage = parseAvatarData(storedJson);
      setAvatarData(parsedFromSupabase ?? parsedFromStorage);
      setAvatarCanChange(!!data?.avatar_can_change);
      setAvatarPhotoUrl(data?.avatar_photo_url ?? getAvatarPhotoFromStorage(session.id));
    } catch {
      const stored = getAvatarFromStorage(session.id);
      setAvatarData(parseAvatarData(stored));
      setAvatarCanChange(false);
      setAvatarPhotoUrl(getAvatarPhotoFromStorage(session.id));
    }
  }, [session]);

  const persistPhoto = useCallback(async (url: string | null) => {
    if (!session) return;
    try {
      await supabase.from("eleves").update({ avatar_photo_url: url }).eq("id", session.id);
    } catch {
      setAvatarPhotoInStorage(session.id, url);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchAvatar();
      if (typeof window !== "undefined" && sessionStorage.getItem("rdl-avatar-updated")) {
        sessionStorage.removeItem("rdl-avatar-updated");
        fetchAvatar();
      }
    }
  }, [session, fetchAvatar]);

  const handleSelectEleve = (e: EleveRow) => {
    setSelectedEleve(e);
    setCodeInput("");
    setCodeError(false);
  };

  const handleSubmitCode = () => {
    if (!selectedEleve) return;
    if (codeInput.trim() === selectedEleve.code) {
      setEnfantSession({ id: selectedEleve.id, prenom: selectedEleve.prenom, nom: selectedEleve.nom });
      setSession({ id: selectedEleve.id, prenom: selectedEleve.prenom, nom: selectedEleve.nom });
      setSelectedEleve(null);
      setCodeInput("");
      setCodeError(false);
      router.replace("/enfant/avatar");
    } else {
      setCodeError(true);
    }
  };

  const handleLogout = () => {
    clearEnfantSession();
    setSession(null);
  };

  // Enfant connecté : afficher le tableau de bord
  if (session) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />

        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/enfant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4a6b8]/80 text-[#2d4a3e]">
                <IconLeaf />
              </span>
              Royaume des Lettres
            </Link>
            <div className="flex items-center gap-3">
              <AvatarSelector
                eleveId={session.id}
                avatarData={avatarData}
                photoUrl={avatarPhotoUrl}
                onPhotoChange={setAvatarPhotoUrl}
                onPersist={persistPhoto}
                canChange
                size={52}
                className="shrink-0"
              />
              <span className="text-sm text-[#2d4a3e]/80">Bonjour {session.prenom} !</span>
              {avatarCanChange && (
                <Link
                  href="/enfant/avatar"
                  className="rounded-full bg-[#4a7c5a]/20 px-3 py-1.5 text-xs font-medium text-[#4a7c5a] transition hover:bg-[#4a7c5a]/30"
                >
                  Modifier mon avatar
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
              >
                Changer d&apos;enfant
              </button>
              <Link href="/" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
                Retour
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-3 inline-block rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-[#2d4a3e]/90 shadow-sm">
              Espace enfant
            </span>
            <AvatarSelector
              eleveId={session.id}
              avatarData={avatarData}
              photoUrl={avatarPhotoUrl}
              onPhotoChange={setAvatarPhotoUrl}
              onPersist={persistPhoto}
              canChange
              size={80}
              className="mb-4"
            />
            <h1 className="font-display text-3xl tracking-wide text-[#2d4a3e] sm:text-4xl">
              Bonjour {session.prenom} ! 👋
            </h1>
            <p className="mt-2 text-[#2d4a3e]/85">
              Choisis où tu veux aller…
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex flex-col items-center gap-5 rounded-[2rem] bg-white/95 p-8 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:shadow-xl ${card.hoverColor}`}
              >
                <div className={`flex h-24 w-24 items-center justify-center rounded-[1.5rem] ${card.color} text-[#2d4a3e] transition group-hover:scale-110`}>
                  <card.icon />
                </div>
                <h2 className="font-display text-xl text-[#2d4a3e] text-center">
                  {card.title}
                </h2>
                <p className="text-center text-sm text-[#2d4a3e]/75">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>

          <footer className="mt-16 text-center text-sm text-[#2d4a3e]/60">
            Royaume des Lettres · Pour les 6 ans
          </footer>
        </div>
      </main>
    );
  }

  // Pas connecté : liste des noms ou saisie du code
  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4a6b8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Royaume des Lettres
          </Link>
          <Link href="/" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
            {selectedEleve ? "Entre ton code" : "Qui es-tu ?"}
          </h1>
          <p className="mt-2 text-[#2d4a3e]/85">
            {selectedEleve
              ? `Code à 4 chiffres pour ${selectedEleve.prenom} ${selectedEleve.nom}`
              : "Clique sur ton nom"}
          </p>
        </div>

        {selectedEleve ? (
          <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.replace(/\D/g, ""));
                  setCodeError(false);
                }}
                placeholder="1234"
                className="w-full rounded-xl border border-[#2d4a3e]/20 bg-white px-6 py-4 text-center text-2xl font-mono tracking-[0.5em] text-[#2d4a3e]"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitCode()}
              />
              {codeError && (
                <p className="text-center text-sm text-red-600">Code incorrect. Réessaie.</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedEleve(null); setCodeInput(""); setCodeError(false); }}
                  className="flex-1 rounded-xl border border-[#2d4a3e]/20 py-3 font-semibold text-[#2d4a3e]"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  disabled={codeInput.length !== 4}
                  className="flex-1 rounded-xl bg-[#4a7c5a] py-3 font-bold text-white disabled:opacity-50"
                >
                  Entrer
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <p className="text-center text-[#2d4a3e]/70">Chargement…</p>
        ) : eleves.length === 0 ? (
          <p className="text-center text-[#2d4a3e]/80">
            Aucun élève pour le moment. Demande à ton maître ou ta maîtresse de t&apos;ajouter.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {eleves.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => handleSelectEleve(e)}
                className="rounded-2xl bg-white/95 px-8 py-4 shadow-lg transition hover:-translate-y-1 hover:shadow-xl hover:bg-[#f4a6b8]/30"
              >
                <span className="font-display text-lg text-[#2d4a3e]">
                  {e.prenom} {e.nom}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
