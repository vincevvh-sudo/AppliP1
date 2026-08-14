"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { SemainierClasse } from "../../components/SemainierClasse";
import { supabase } from "../../../utils/supabase";
import { getEnfantSession, type EnfantSession } from "../../../utils/enfant-session";
import { getJoursRendezVousPartagesPourEleve } from "../../data/rendez-vous-partages";

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

type VueMobile = "menu" | "rdv" | "semaine";

function formatJourLabel(jour: string) {
  // jour = YYYY-MM-DD → midi local pour éviter le décalage UTC
  const d = new Date(`${jour}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EnfantDatesPage() {
  const router = useRouter();
  const [session, setSession] = useState<EnfantSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creneaux, setCreneaux] = useState<CreneauEnfant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vueMobile, setVueMobile] = useState<VueMobile>("menu");

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      router.replace("/enfant");
      return;
    }
    setSession(s);
  }, [router]);

  const fetchCreneaux = useCallback(async (eleveId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const joursPartages = await getJoursRendezVousPartagesPourEleve(eleveId);
      if (joursPartages.length === 0) {
        setCreneaux([]);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const joursFuturs = joursPartages.filter((j) => j >= today);
      if (joursFuturs.length === 0) {
        setCreneaux([]);
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from("rendez_vous_creneaux")
        .select("id, jour, start_time, end_time, max_eleves, rendez_vous_reservations ( id, eleve_id )")
        .in("jour", joursFuturs)
        .order("jour", { ascending: true })
        .order("start_time", { ascending: true });
      if (err) throw err;

      const list: CreneauEnfant[] =
        (
          data as
            | {
                id: number;
                jour: string;
                start_time: string;
                end_time: string;
                max_eleves: number;
                rendez_vous_reservations?: Array<{ id: number; eleve_id: string | number }>;
              }[]
            | null
        )?.map((row) => {
          const reservationsArr = Array.isArray(row.rendez_vous_reservations)
            ? row.rendez_vous_reservations
            : [];
          const reservationsCount = reservationsArr.length;
          const dejaInscrit = reservationsArr.some((r) => String(r.eleve_id) === String(eleveId));
          return {
            id: row.id,
            jour: row.jour,
            start_time: row.start_time,
            end_time: row.end_time,
            max_eleves: row.max_eleves,
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
  }, []);

  useEffect(() => {
    if (session) {
      fetchCreneaux(session.id);
    }
  }, [session, fetchCreneaux]);

  const creneauxParJour = useMemo(() => {
    const map = new Map<string, CreneauEnfant[]>();
    for (const c of creneaux) {
      const list = map.get(c.jour) ?? [];
      list.push(c);
      map.set(c.jour, list);
    }
    return [...map.entries()];
  }, [creneaux]);

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

  const listeCreneaux = (
    <div>
      {loading ? (
        <p className="text-[#2d4a3e]/70">Chargement…</p>
      ) : creneaux.length === 0 ? (
        <p className="text-[#2d4a3e]/75">
          Ton enseignant ne t&apos;a pas encore proposé de créneau. Reviens voir plus tard.
        </p>
      ) : (
        <div className="space-y-6">
          {creneauxParJour.map(([jour, slots]) => (
            <div key={jour}>
              <h3 className="mb-3 font-display text-base capitalize text-[#2d4a3e]">
                {formatJourLabel(jour)}
              </h3>
              <ul className="space-y-3">
                {slots.map((c) => {
                  const placesRestantes = Math.max(0, c.max_eleves - c.reservations);
                  return (
                    <li
                      key={c.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#2d4a3e]/15 bg-white px-4 py-4 shadow-sm"
                    >
                      <div>
                        <p className="font-display text-xl font-semibold text-[#2d4a3e]">
                          {c.start_time.slice(0, 5)} – {c.end_time.slice(0, 5)}
                        </p>
                        <p className="mt-1 text-sm text-[#2d4a3e]/70">
                          {c.reservations}/{c.max_eleves} inscrits ·{" "}
                          {placesRestantes === 0
                            ? "Complet"
                            : `${placesRestantes} place(s) restante(s)`}
                        </p>
                      </div>
                      {c.dejaInscrit ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <span className="text-sm font-semibold text-[#4a7c5a]">
                            Tu es inscrit à ce créneau
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAnnuler(c)}
                            disabled={saving}
                            className="min-h-12 w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 sm:w-auto"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleChoisir(c)}
                          disabled={saving || placesRestantes === 0}
                          className="min-h-12 w-full rounded-xl bg-[#4a7c5a] px-4 py-3 text-base font-semibold text-white hover:bg-[#3d6b4d] disabled:opacity-50"
                        >
                          {placesRestantes === 0 ? "Complet" : "Je choisis ce créneau"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <Link
            href="/enfant"
            className="flex min-w-0 items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4a6b8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            <span className="truncate">Rendez-vous</span>
          </Link>
          {vueMobile !== "menu" ? (
            <button
              type="button"
              onClick={() => setVueMobile("menu")}
              className="shrink-0 rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20 lg:hidden"
            >
              ← Menu
            </button>
          ) : (
            <Link
              href="/enfant"
              className="shrink-0 rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Retour
            </Link>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-14">
        <h1 className="text-center font-display text-2xl text-white sm:text-3xl">Rendez-vous</h1>
        <p className="mt-2 hidden text-center text-white/95 lg:block">
          À gauche : rendez-vous avec ton enseignant. À droite : leçons, devoirs et infos de la
          semaine.
        </p>
        <p className="mt-2 text-center text-white/95 lg:hidden">
          Choisis une section, puis un créneau en plein écran.
        </p>

        {/* Mobile : menu → une section à la fois */}
        <div className="mt-8 lg:hidden">
          {vueMobile === "menu" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setVueMobile("rdv")}
                className="flex w-full flex-col items-start rounded-2xl bg-white/95 px-5 py-5 text-left shadow-lg transition active:scale-[0.99]"
              >
                <span className="font-display text-lg text-[#2d4a3e]">Choisir un créneau</span>
                <span className="mt-1 text-sm text-[#2d4a3e]/70">
                  Rendez-vous avec l&apos;enseignant
                  {creneaux.length > 0 ? ` · ${creneaux.length} proposé(s)` : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVueMobile("semaine")}
                className="flex w-full flex-col items-start rounded-2xl bg-white/95 px-5 py-5 text-left shadow-lg transition active:scale-[0.99]"
              >
                <span className="font-display text-lg text-[#2d4a3e]">Semaine de classe</span>
                <span className="mt-1 text-sm text-[#2d4a3e]/70">
                  Leçons, devoirs et infos à savoir
                </span>
              </button>
            </div>
          )}

          {vueMobile === "rdv" && (
            <section className="rounded-2xl bg-white/95 p-4 shadow-lg sm:p-5">
              <h2 className="font-display text-lg text-[#2d4a3e]">Créneaux disponibles</h2>
              <p className="mt-1 text-sm text-[#2d4a3e]/75">
                Appuie sur le créneau qui te convient.
              </p>
              <div className="mt-4">{listeCreneaux}</div>
            </section>
          )}

          {vueMobile === "semaine" && (
            <div>
              <SemainierClasse mode="read" />
            </div>
          )}
        </div>

        {/* Desktop : deux colonnes */}
        <div className="mt-8 hidden gap-6 lg:grid lg:grid-cols-2">
          <section className="rounded-2xl bg-white/95 p-5 shadow-lg">
            <h2 className="font-display text-lg text-[#2d4a3e]">Rendez-vous</h2>
            <p className="mt-1 text-sm text-[#2d4a3e]/75">
              Choisis un créneau pour venir avec ta famille.
            </p>
            <div className="mt-4">{listeCreneaux}</div>
          </section>
          <div>
            <SemainierClasse mode="read" />
          </div>
        </div>
      </div>
    </main>
  );
}
