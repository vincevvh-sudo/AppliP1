"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SEMAINIER_JOURS,
  SEMAINIER_SECTIONS,
  JOUR_LABELS,
  addWeeksToWeekStart,
  emptySemainier,
  formatWeekRangeLabel,
  getSemainier,
  getWeekStartMonday,
  saveSemainier,
  semainierHasContent,
  type SemainierData,
  type SemainierJour,
  type SemainierSectionId,
} from "../data/semainier-storage";

type Props = {
  /** Édition enseignant ou lecture seule enfant. */
  mode: "edit" | "read";
};

export function SemainierClasse({ mode }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStartMonday());
  const [data, setData] = useState<SemainierData>(() => emptySemainier());
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ jour: SemainierJour; section: SemainierSectionId } | null>(
    null
  );
  const [draft, setDraft] = useState("");

  const load = useCallback(async (ws: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await getSemainier(ws);
      setData(res.data);
      if (res.modeLocal && mode === "edit") {
        setMessage(
          "Mode local : exécute supabase-semainier.sql dans Supabase pour synchroniser avec les enfants sur tous les appareils."
        );
      }
      if (res.error) setError(res.error);
    } catch {
      setData(emptySemainier());
      setError("Impossible de charger le semainier.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load(weekStart);
  }, [weekStart, load]);

  const openEdit = (jour: SemainierJour, section: SemainierSectionId) => {
    if (mode !== "edit") return;
    setEditing({ jour, section });
    setDraft(data[jour][section] ?? "");
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
  };

  const confirmEdit = async () => {
    if (!editing) return;
    const { jour, section } = editing;
    const next: SemainierData = {
      ...data,
      [jour]: { ...data[jour], [section]: draft },
    };
    setData(next);
    setEditing(null);
    setSavingKey(`${jour}-${section}`);
    setError(null);
    const res = await saveSemainier(weekStart, next);
    setSavingKey(null);
    if (!res.ok) {
      setError(res.error ?? "Erreur d'enregistrement.");
      return;
    }
    if (res.info) setMessage(res.info);
    else if (res.modeLocal) {
      setMessage(
        "Enregistré sur ce navigateur. Pour synchroniser partout, exécute supabase-semainier.sql dans Supabase."
      );
    } else {
      setMessage("Semainier enregistré — visible chez les enfants.");
    }
  };

  const isEmpty = !semainierHasContent(data);

  return (
    <section className="rounded-2xl bg-white/95 p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-[#2d4a3e]">
            {mode === "edit" ? "Semainier de la classe" : "Cette semaine"}
          </h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/75">
            {mode === "edit"
              ? "Clique sur une case pour écrire les leçons, devoirs ou « à savoir ». Les enfants le voient dans Rendez-vous."
              : "Leçons, devoirs et infos à retenir pour chaque jour."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeksToWeekStart(w, -1))}
            className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
          >
            ← Semaine préc.
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getWeekStartMonday())}
            className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeksToWeekStart(w, 1))}
            className="rounded-lg border border-[#2d4a3e]/20 bg-white px-3 py-1.5 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
          >
            Semaine suiv. →
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-[#4a7c5a]">{formatWeekRangeLabel(weekStart)}</p>

      {loading ? (
        <p className="mt-4 text-[#2d4a3e]/70">Chargement…</p>
      ) : mode === "read" && isEmpty ? (
        <p className="mt-4 text-sm text-[#2d4a3e]/70">
          Pas encore de leçons ni de devoirs pour cette semaine.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-5 gap-2">
            {SEMAINIER_JOURS.map((jour) => (
              <div key={jour} className="rounded-xl border border-[#2d4a3e]/15 bg-[#fef9f3]/90 p-2">
                <h3 className="mb-2 text-center font-display text-sm font-semibold text-[#2d4a3e]">
                  {JOUR_LABELS[jour]}
                </h3>
                <div className="space-y-2">
                  {SEMAINIER_SECTIONS.map((section) => {
                    const value = data[jour][section.id] ?? "";
                    const key = `${jour}-${section.id}`;
                    const isSaving = savingKey === key;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        disabled={mode === "read"}
                        onClick={() => openEdit(jour, section.id)}
                        className={`block w-full rounded-lg border px-2 py-2 text-left transition ${
                          mode === "edit"
                            ? "cursor-pointer border-[#2d4a3e]/15 bg-white hover:border-[#4a7c5a]/50 hover:bg-[#a8d5ba]/15"
                            : "cursor-default border-[#2d4a3e]/10 bg-white/80"
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-[#2d4a3e]/55">
                          {section.label}
                          {isSaving ? "…" : ""}
                        </span>
                        <span
                          className={`mt-0.5 block whitespace-pre-wrap text-xs leading-snug ${
                            value.trim() ? "text-[#2d4a3e]" : "text-[#2d4a3e]/40"
                          }`}
                        >
                          {value.trim()
                            ? value
                            : mode === "edit"
                              ? "Cliquer pour écrire…"
                              : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && mode === "edit" && (
        <p className="mt-3 text-sm text-[#4a7c5a]">{message}</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {editing && mode === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d4a3e]/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-display text-lg text-[#2d4a3e]">
              {JOUR_LABELS[editing.jour]} —{" "}
              {SEMAINIER_SECTIONS.find((s) => s.id === editing.section)?.label}
            </h3>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              autoFocus
              placeholder="Écris ici…"
              className="mt-3 w-full rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-sm text-[#2d4a3e] outline-none focus:border-[#4a7c5a]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-[#2d4a3e]/20 px-4 py-2 text-sm text-[#2d4a3e] hover:bg-[#2d4a3e]/5"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d6b4d]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
