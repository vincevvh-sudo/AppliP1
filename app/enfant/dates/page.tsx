"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { supabase, type EleveRow } from "../../../utils/supabase";
import { getEnfantSession, type EnfantSession } from "../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

type CreneauEnfant = {
  id: number;
  jour: string;
  start_time: string;
  end_time: string;
  max_eleves: number;
  reservations: number;
  dejaInscrit: boolean;
};

export default function EnfantDatesPage() {
  const router = useRouter();
  const [session, setSession] = useState<EnfantSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creneaux, setCreneaux] = useState<CreneauEnfant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      router.replace("/enfant");
      return;
    }
    setSession(s);
  }, [router]);

  const fetchCreneaux = useCallback(
    async (eleveId: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error: err } = await supabase
          .from("rendez_vous_creneaux")
          .select("id, jour, start_time, end_time, max_eleves, rendez_vous_reservations ( id, eleve_id )")
          .gte("jour", today)
          .order("jour", { ascending: true })
          .order("start_time", { ascending: true });
        if (err) throw err;

        const list: CreneauEnfant[] =
          (data as any[] | null)?.map((row) => {
            const reservationsArr: Array<{ id: number; eleve_id: string | number }> =
              Array.isArray(row.rendez_vous_reservations) ? row.rendez_vous_reservations : [];
            const reservationsCount = reservationsArr.length;
            const dejaInscrit = reservationsArr.some((r) => String(r.eleve_id) === String(eleveId));
            return {
              id: row.id as number,
              jour: row.jour as string,
              start_time: row.start_time as string,
              end_time: row.end_time as string,
              max_eleves: row.max_eleves as number,
              reservations: reservationsCount,
              dejaInscrit,
            };
          }) ?? [];

        setCreneaux(list);
      } catch {
        setError("Impossible de charger les créneaux.");
        setCreneaux([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (session) {
      fetchCreneaux(session.id);
    }
  }, [session, fetchCreneaux]);

  const handleChoisir = async (creneau: CreneauEnfant) => {
    if (!session) return;
    if (creneau.dejaInscrit) return;
    const placesRestantes = creneau.max_eleves - creneau.reservations;
    if (placesRestantes <= 0) {
      setError("Ce créneau est déjà complet.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase.from("rendez_vous_reservations").insert({
        creneau_id: creneau.id,
        eleve_id: session.id,
      });
      if (err) throw err;
      await fetchCreneaux(session.id);
    } catch {
      setError("Erreur lors de l'inscription. Réessaie plus tard.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async (creneau: CreneauEnfant) => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("rendez_vous_reservations")
        .delete()
        .eq("creneau_id", creneau.id)
        .eq("eleve_id", session.id);
      if (err) throw err;
      await fetchCreneaux(session.id);
    } catch {
      setError("Erreur lors de l'annulation. Réessaie plus tard.");
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
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
            Les dates
          </Link>
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <h1 className="font-display text-2xl text-white sm:text-3xl text-center">
          Mes rendez-vous
        </h1>
        <p className="mt-2 text-center text-white/95">
          Choisis un créneau proposé par ton enseignant pour venir avec ta famille.
        </p>

        <section className="mt-8 rounded-2xl bg-white/95 p-5 shadow-lg">
          {loading ? (
            <p className="text-[#2d4a3e]/70">Chargement…</p>
          ) : creneaux.length === 0 ? (
            <p className="text-[#2d4a3e]/75">
              Il n&apos;y a pas encore de rendez-vous prévus. Reviens voir plus tard.
            </p>
          ) : (
            <ul className="space-y-4">
              {creneaux.map((c) => {
                const placesRestantes = Math.max(0, c.max_eleves - c.reservations);
                const dateLabel = new Date(c.jour).toLocaleDateString("fr-BE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2d4a3e]/10 bg-white/90 px-4 py-3"
                  >
                    <div>
                      <p className="font-display text-sm text-[#2d4a3e]/80">{dateLabel}</p>
                      <p className="font-medium text-[#2d4a3e]">
                        {c.start_time.slice(0, 5)} – {c.end_time.slice(0, 5)}
                      </p>
                      <p className="text-xs text-[#2d4a3e]/70">
                        {c.reservations}/{c.max_eleves} inscrits ·{" "}
                        {placesRestantes === 0 ? "Complet" : `${placesRestantes} place(s) restante(s)`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.dejaInscrit ? (
                        <>
                          <span className="text-xs font-semibold text-[#4a7c5a]">Tu es inscrit à ce créneau</span>
                          <button
                            type="button"
                            onClick={() => handleAnnuler(c)}
                            disabled={saving}
                            className="rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleChoisir(c)}
                          disabled={saving || placesRestantes === 0}
                          className="rounded-xl bg-[#4a7c5a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3d6b4d] disabled:opacity-50"
                        >
                          Je choisis ce créneau
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </main>
  );
}

