"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../components/MiyazakiDecor";
import { supabase } from "../../utils/supabase";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

type Creneau = {
  id: number;
  jour: string;
  start_time: string;
  end_time: string;
  max_eleves: number;
  reservations: number;
};

export default function RendezVousPage() {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultMax, setDefaultMax] = useState("1");

  const fetchCreneaux = useCallback(async (jour: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("rendez_vous_creneaux")
        .select("id, jour, start_time, end_time, max_eleves, rendez_vous_reservations ( id )")
        .eq("jour", jour)
        .order("start_time");
      if (err) {
        console.error("Supabase rendez_vous_creneaux select error:", err);
        setError(
          `Erreur lors du chargement des créneaux : ${"message" in err && typeof err.message === "string" ? err.message : "vérifie que les tables rendez_vous_creneaux et rendez_vous_reservations existent bien dans Supabase."}`
        );
        setCreneaux([]);
        return;
      }
      const list =
        (data as any[] | null)?.map((row) => ({
          id: row.id as number,
          jour: row.jour as string,
          start_time: row.start_time as string,
          end_time: row.end_time as string,
          max_eleves: row.max_eleves as number,
          reservations: Array.isArray(row.rendez_vous_reservations)
            ? row.rendez_vous_reservations.length
            : 0,
        })) ?? [];
      setCreneaux(list);
    } catch {
      setError("Impossible de charger les créneaux pour ce jour.");
      setCreneaux([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (date) fetchCreneaux(date);
  }, [date, fetchCreneaux]);

  const handleToggleSlot = async (startHHmm: string, endHHmm: string, existing?: Creneau) => {
    if (!date) return;
    setSaving(true);
    setError(null);
    if (existing) {
      const { error: err } = await supabase
        .from("rendez_vous_creneaux")
        .delete()
        .eq("id", existing.id);
      if (err) {
        console.error("Supabase rendez_vous_creneaux delete error:", err);
        const message =
          "message" in err && typeof err.message === "string"
            ? err.message
            : "Erreur inconnue (supprimer). Vérifie les tables et les politiques RLS dans Supabase.";
        setError(`Erreur lors de la mise à jour du créneau : ${message}`);
        setSaving(false);
        return;
      }
    } else {
      const max = Math.max(1, Number.parseInt(defaultMax || "1", 10));
      const { error: err } = await supabase
        .from("rendez_vous_creneaux")
        .insert({
          jour: date,
          start_time: `${startHHmm}:00`,
          end_time: `${endHHmm}:00`,
          max_eleves: max,
        });
      if (err) {
        console.error("Supabase rendez_vous_creneaux insert error:", err);
        const message =
          "message" in err && typeof err.message === "string"
            ? err.message
            : "Erreur inconnue (création). Vérifie que les tables rendez_vous_creneaux et rendez_vous_reservations existent (script SQL) et les droits RLS.";
        setError(`Erreur lors de la mise à jour du créneau : ${message}`);
        setSaving(false);
        return;
      }
    }
    await fetchCreneaux(date);
    try {
      // nothing
    } finally {
      setSaving(false);
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
            Agenda & Rendez-vous
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl text-center">
          Rendez-vous parents
        </h1>
        <p className="mt-2 text-center text-[#2d4a3e]/80">
          Choisis un jour puis définis les créneaux que les familles pourront réserver.
        </p>

        <section className="mt-8 rounded-2xl bg-white/95 p-5 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Jour</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm text-[#2d4a3e]/80">
              Date du rendez-vous
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e]"
              />
            </label>
            <span className="text-sm text-[#2d4a3e]/70">
              {date ? new Date(date).toLocaleDateString("fr-BE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white/95 p-5 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e]">Créneaux de la journée</h2>
          <p className="mt-2 text-sm text-[#2d4a3e]/75">
            Les cases ci-dessous représentent tous les créneaux de{" "}
            <span className="font-semibold">7h00 à 21h00</span> par pas de{" "}
            <span className="font-semibold">10 minutes</span>. Clique pour{" "}
            <span className="font-semibold">activer</span> ou{" "}
            <span className="font-semibold">désactiver</span> un créneau.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm text-[#2d4a3e]/80">
              Places max par créneau
              <input
                type="number"
                min={1}
                value={defaultMax}
                onChange={(e) => setDefaultMax(e.target.value)}
                className="mt-1 block w-20 rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e]"
              />
            </label>
          </div>

          {loading ? (
            <p className="mt-4 text-[#2d4a3e]/70">Chargement…</p>
          ) : (
            <div className="mt-4 max-h-[480px] overflow-y-auto rounded-2xl border border-[#2d4a3e]/10 bg-white/90 p-3">
              <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-4 md:grid-cols-6">
                {(() => {
                  const items: ReactElement[] = [];
                  const startMinutes = 7 * 60;
                  const endMinutes = 21 * 60;
                  const map = new Map<string, Creneau>();
                  for (const c of creneaux) {
                    const key = `${c.start_time.slice(0, 5)}-${c.end_time.slice(0, 5)}`;
                    map.set(key, c);
                  }
                  for (let m = startMinutes; m < endMinutes; m += 10) {
                    const h = Math.floor(m / 60);
                    const mm = m % 60;
                    const h2 = Math.floor((m + 10) / 60);
                    const mm2 = (m + 10) % 60;
                    const startHHmm = `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
                    const endHHmm = `${String(h2).padStart(2, "0")}:${String(mm2).padStart(2, "0")}`;
                    const key = `${startHHmm}-${endHHmm}`;
                    const existing = map.get(key);
                    const placesRestantes =
                      existing ? Math.max(0, existing.max_eleves - existing.reservations) : Number.parseInt(defaultMax || "1", 10);
                    items.push(
                      <button
                        key={key}
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleSlot(startHHmm, endHHmm, existing)}
                        className={`flex flex-col rounded-xl border px-2 py-1 text-left transition ${
                          existing
                            ? placesRestantes === 0
                              ? "border-[#2d4a3e]/60 bg-[#2d4a3e]/10"
                              : "border-[#4a7c5a]/60 bg-[#4a7c5a]/10"
                            : "border-dashed border-[#2d4a3e]/20 hover:border-[#4a7c5a]/40 hover:bg-[#4a7c5a]/5"
                        }`}
                        title={
                          existing
                            ? `${startHHmm} – ${endHHmm} · ${existing.reservations}/${existing.max_eleves} inscrits`
                            : `${startHHmm} – ${endHHmm} · cliquez pour proposer ce créneau`
                        }
                      >
                        <span className="font-semibold text-[#2d4a3e]">
                          {startHHmm} – {endHHmm}
                        </span>
                        {existing ? (
                          <span className="text-[10px] text-[#2d4a3e]/75">
                            {existing.reservations}/{existing.max_eleves} inscrits ·{" "}
                            {placesRestantes === 0 ? "Complet" : `${placesRestantes} place(s) restantes`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#2d4a3e]/50">Libre</span>
                        )}
                      </button>
                    );
                  }
                  return items;
                })()}
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </main>
  );
}
