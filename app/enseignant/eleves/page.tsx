"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { supabase } from "../../../utils/supabase";
import type { EleveRow } from "../../../utils/supabase";
import { deleteConversationsOrphelines } from "../../data/messagerie-storage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function genCode(): string {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export default function EnseignantElevesPage() {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ prenom: string; nom: string; code: string } | null>(null);

  const fetchEleves = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("eleves")
        .select("*")
        .order("nom")
        .order("prenom");
      if (err) throw err;
      setEleves((data ?? []) as EleveRow[]);
    } catch {
      setEleves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  useEffect(() => {
    deleteConversationsOrphelines().catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLastCreated(null);
    const p = prenom.trim();
    const n = nom.trim();
    if (!p || !n) {
      setError("Prénom et nom requis");
      return;
    }
    setAdding(true);
    try {
      // Génère un code à 4 chiffres. En cas de doublon en base (contrainte unique),
      // on réessaie quelques fois.
      let ok = false;
      let code = genCode();
      for (let i = 0; i < 8; i++) {
        code = genCode();
        const { error: err } = await supabase.from("eleves").insert({
          prenom: p,
          nom: n,
          code,
        });
        if (!err) {
          ok = true;
          break;
        }
        const msg = typeof err.message === "string" ? err.message.toLowerCase() : "";
        const seemsDuplicate = msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists");
        if (!seemsDuplicate) throw err;
      }
      if (!ok) throw new Error("Impossible de générer un code unique. Réessaie.");
      setPrenom("");
      setNom("");
      setLastCreated({ prenom: p, nom: n, code });
      await fetchEleves();
    } catch {
      setError("Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteOne = async (eleve: EleveRow) => {
    if (!window.confirm(`Supprimer ${eleve.prenom} ${eleve.nom} ? Sa conversation en messagerie sera aussi supprimée.`)) return;
    setDeletingId(eleve.id);
    setError("");
    try {
      const { data: convs } = await supabase.from("conversations").select("id").eq("type", "direct").eq("eleve_id", eleve.id);
      for (const c of convs ?? []) {
        const convId = (c as { id: number }).id;
        await supabase.from("messages").delete().eq("conversation_id", convId);
      }
      await supabase.from("conversations").delete().eq("type", "direct").eq("eleve_id", eleve.id);
      const { error: err } = await supabase.from("eleves").delete().eq("id", eleve.id);
      if (err) throw err;
      setEleves((prev) => prev.filter((e) => e.id !== eleve.id));
      await deleteConversationsOrphelines();
    } catch {
      setError("Erreur lors de la suppression de l'élève.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Supprimer toute la liste des élèves ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      await supabase.from("exercice_resultats").delete().neq("id", 0);
    } catch {
      // Ignore if table doesn't exist
    }
    try {
      await supabase.from("sons_partages").delete().neq("eleve_id", -999);
    } catch {
      // Ignore
    }
    try {
      const { data: directConvs } = await supabase.from("conversations").select("id").eq("type", "direct");
      for (const c of directConvs ?? []) {
        const convId = (c as { id: number }).id;
        await supabase.from("messages").delete().eq("conversation_id", convId);
      }
      await supabase.from("conversations").delete().eq("type", "direct");
    } catch {
      // Ignore (CASCADE peut déjà supprimer si FK configurée)
    }
    try {
      const { error: err } = await supabase.from("eleves").delete().neq("id", 0);
      if (err) throw err;
      setEleves([]);
      await deleteConversationsOrphelines();
    } catch {
      setError("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd4a3]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Élèves
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Gestion des élèves
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Ajoute des élèves, consulte leurs codes et leurs résultats.
        </p>

        <section className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Ajouter un élève</h2>
          <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-3">
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prénom"
              className="flex-1 min-w-[120px] rounded-xl border border-[#2d4a3e]/20 px-4 py-2 text-[#2d4a3e]"
            />
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom"
              className="flex-1 min-w-[120px] rounded-xl border border-[#2d4a3e]/20 px-4 py-2 text-[#2d4a3e]"
            />
            <button
              type="submit"
              disabled={adding || !prenom.trim() || !nom.trim()}
              className="rounded-xl bg-[#4a7c5a] px-6 py-2 font-semibold text-white disabled:opacity-50"
            >
              {adding ? "Ajout…" : "Ajouter"}
            </button>
          </form>
          {lastCreated && (
            <div className="mt-4 rounded-xl border border-[#4a7c5a]/30 bg-[#a8d5ba]/20 px-4 py-3 text-sm text-[#2d4a3e]">
              <p className="font-semibold">
                Code de connexion pour {lastCreated.prenom} {lastCreated.nom} :{" "}
                <span className="font-mono text-base">{lastCreated.code}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#4a7c5a] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4d]"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(lastCreated.code);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Copier le code
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
                  onClick={() => setLastCreated(null)}
                >
                  OK
                </button>
              </div>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>

        <section className="mt-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[#2d4a3e]">Liste des élèves</h2>
            <Link
              href="/enseignant/resultats"
              className="rounded-lg bg-[#e8b4d4]/80 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#e8b4d4]"
            >
              Voir les résultats
            </Link>
          </div>

          {loading ? (
            <p className="mt-4 text-[#2d4a3e]/70">Chargement…</p>
          ) : eleves.length === 0 ? (
            <p className="mt-4 text-[#2d4a3e]/70">Aucun élève. Ajoute-en pour commencer.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {eleves.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2d4a3e]/10 bg-white/80 px-4 py-3"
                >
                  <span className="font-medium text-[#2d4a3e]">
                    {e.prenom} {e.nom}
                  </span>
                  <span className="font-mono text-sm text-[#2d4a3e]/80">
                    Code : {e.code}
                  </span>
                  <span className="flex items-center gap-2">
                    <Link
                      href={`/enseignant/resultats?eleve=${e.id}`}
                      className="text-sm text-[#4a7c5a] underline hover:no-underline"
                    >
                      Résultats
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(e)}
                      disabled={deletingId === e.id}
                      className="rounded-lg border border-[#c45c4a]/50 px-2 py-1 text-xs text-[#c45c4a] hover:bg-[#c45c4a]/10 disabled:opacity-50"
                    >
                      {deletingId === e.id ? "…" : "Supprimer"}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {eleves.length > 0 && (
          <section className="mt-8">
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={deleting}
              className="rounded-xl border-2 border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? "Suppression…" : "Supprimer toute la liste (fin d'année)"}
            </button>
            <p className="mt-2 text-xs text-[#2d4a3e]/60">
              Supprime tous les élèves et leurs résultats. À utiliser en fin d&apos;année scolaire.
            </p>
          </section>
        )}

        <Link href="/enseignant" className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
