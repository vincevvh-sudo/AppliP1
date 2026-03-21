"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import AvatarCreator, { parseAvatarData, stringifyAvatarData } from "../../components/AvatarCreator";
import { supabase } from "../../../utils/supabase";
import { getEnfantSession } from "../../../utils/enfant-session";
import { getAvatarFromStorage, setAvatarInStorage } from "../../data/avatar-storage";
import type { AvatarData } from "../../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnfantAvatarPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string | number } | null>(null);
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [canChange, setCanChange] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchEleve = useCallback(async () => {
    const s = getEnfantSession();
    if (!s) return;
    setSession({ id: s.id });
    try {
      const { data, error } = await supabase
        .from("eleves")
        .select("avatar_json, avatar_can_change")
        .eq("id", s.id)
        .single();
      if (error) throw error;
      const parsed = parseAvatarData(data?.avatar_json ?? null);
      setAvatarData(parsed);
      setCanChange(data?.avatar_can_change ?? true);
      setIsEdit(!!parsed && (data?.avatar_can_change ?? false));
    } catch {
      const stored = getAvatarFromStorage(s.id);
      const parsed = parseAvatarData(stored);
      setAvatarData(parsed);
      setCanChange(false);
      setIsEdit(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      router.replace("/enfant");
      return;
    }
    setSession({ id: s.id });
    fetchEleve();
  }, [router, fetchEleve]);

  const [draft, setDraft] = useState<AvatarData>({
    hairColor: 0,
    hairCut: 0,
    eyeShape: 0,
    eyebrows: 0,
    skinColor: 0,
    nose: 0,
    mouth: 0,
    shirtColor: 0,
  });

  useEffect(() => {
    if (avatarData) setDraft(avatarData);
  }, [avatarData]);

  // Avatar existant et verrouillé : redirection dans un effet, pas pendant le rendu
  useEffect(() => {
    if (loading) return;
    if (avatarData && !canChange && !isEdit) {
      router.replace("/enfant");
    }
  }, [loading, avatarData, canChange, isEdit, router]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    const json = stringifyAvatarData(draft);
    try {
      const { error } = await supabase
        .from("eleves")
        .update({ avatar_json: json })
        .eq("id", session.id);
      if (error) throw error;
      setAvatarInStorage(session.id, json);
      if (typeof window !== "undefined") sessionStorage.setItem("rdl-avatar-updated", "1");
      router.replace("/enfant");
    } catch {
      setAvatarInStorage(session.id, json);
      if (typeof window !== "undefined") sessionStorage.setItem("rdl-avatar-updated", "1");
      router.replace("/enfant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        </div>
      </main>
    );
  }

  // Avatar existant et verrouillé : on affiche rien pendant la redirection (gérée par useEffect)
  if (avatarData && !canChange && !isEdit) {
    return null;
  }

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
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-5 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
            {isEdit ? "Modifier mon avatar" : "Crée ton avatar"}
          </h1>
          <p className="mt-2 text-[#2d4a3e]/85">
            {isEdit
              ? "Tu peux le changer car ton maître ou ta maîtresse t'a autorisé."
              : "Choisis comment tu veux te représenter. Tu ne pourras plus le modifier ensuite (sauf si ton maître ou ta maîtresse t'y autorise)."}
          </p>
        </div>

        <div className="rounded-2xl bg-white/95 p-8 shadow-lg">
          <AvatarCreator value={draft} onChange={setDraft} readOnly={false} />
          <div className="mt-8 flex gap-3">
            <Link
              href="/enfant"
              className="flex-1 rounded-xl border border-[#2d4a3e]/20 py-3 text-center font-semibold text-[#2d4a3e] transition hover:bg-[#2d4a3e]/5"
            >
              {isEdit ? "Annuler" : "Plus tard"}
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-[#4a7c5a] py-3 font-bold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "C'est moi !"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
