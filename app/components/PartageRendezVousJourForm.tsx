"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import type { EleveRow } from "../../utils/supabase";
import {
  getPartageRendezVousJourState,
  setPartageRendezVousJour,
} from "../data/rendez-vous-partages";

type Props = {
  jour: string;
  /** Nombre de créneaux déjà activés ce jour (pour le message d’aide). */
  nbCreneaux: number;
};

export function PartageRendezVousJourForm({ jour, nbCreneaux }: Props) {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [partagerTous, setPartagerTous] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [hasPartage, setHasPartage] = useState(false);

  const fetchEleves = useCallback(async () => {
    const { data, error } = await supabase.from("eleves").select("*").order("nom").order("prenom");
    if (error) {
      setMessage({ type: "error", text: "Impossible de charger les élèves." });
      setEleves([]);
    } else {
      setEleves((data ?? []) as EleveRow[]);
    }
    setLoading(false);
  }, []);

  const loadPartage = useCallback(async () => {
    const { toAll, eleveIds, error } = await getPartageRendezVousJourState(jour);
    if (error === "table_missing") {
      setMessage({
        type: "error",
        text: "Pour activer le partage, exécute supabase-rendez-vous-partages.sql dans Supabase → SQL Editor.",
      });
      setHasPartage(false);
      return;
    }
    if (error) {
      setMessage({ type: "error", text: error });
    }
    setPartagerTous(toAll);
    setSelected(new Set(toAll ? [] : eleveIds.map(String)));
    setHasPartage(toAll || eleveIds.length > 0);
  }, [jour]);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  useEffect(() => {
    setMessage(null);
    loadPartage();
  }, [loadPartage]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const toAll = partagerTous;
    const eleveIds = toAll ? [] : [...selected];
    if (!toAll && eleveIds.length === 0) {
      setMessage({
        type: "error",
        text: "Choisis « Toute la classe » ou coche au moins un enfant.",
      });
      setSaving(false);
      return;
    }
    if (nbCreneaux === 0) {
      setMessage({
        type: "error",
        text: "Active d’abord au moins un créneau horaire pour ce jour, puis enregistre le partage.",
      });
      setSaving(false);
      return;
    }
    const { ok, error } = await setPartageRendezVousJour(jour, toAll, eleveIds);
    setSaving(false);
    if (ok) {
      setHasPartage(true);
      setMessage({
        type: "ok",
        text: toAll
          ? "Créneaux envoyés à toute la classe — visibles dans Rendez-vous côté enfant."
          : eleveIds.length === 1
            ? "Créneaux envoyés à l’élève sélectionné."
            : `Créneaux envoyés à ${eleveIds.length} élèves.`,
      });
    } else {
      setMessage({ type: "error", text: error ?? "Erreur lors du partage." });
    }
  };

  const handleRetirer = async () => {
    setSaving(true);
    setMessage(null);
    const { ok, error } = await setPartageRendezVousJour(jour, false, []);
    setSaving(false);
    if (ok) {
      setPartagerTous(false);
      setSelected(new Set());
      setHasPartage(false);
      setMessage({
        type: "ok",
        text: "Partage retiré : plus aucun enfant ne voit les créneaux de ce jour.",
      });
    } else {
      setMessage({ type: "error", text: error ?? "Erreur lors du retrait." });
    }
  };

  const dateLabel = jour
    ? new Date(jour + "T12:00:00").toLocaleDateString("fr-BE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="mt-6 rounded-2xl border-2 border-[#4a7c5a]/35 bg-[#f0f7f2]/90 p-5 shadow-md">
      <h2 className="font-display text-lg text-[#2d4a3e]">Envoyer les créneaux aux familles</h2>
      <p className="mt-1 text-sm text-[#2d4a3e]/75">
        Pour le <span className="font-semibold">{dateLabel}</span> ({nbCreneaux} créneau
        {nbCreneaux > 1 ? "x" : ""} activé{nbCreneaux > 1 ? "s" : ""}) : envoie à{" "}
        <span className="font-semibold">toute la classe</span> ou seulement aux enfants dont tu
        veux rencontrer les parents.
      </p>
      {hasPartage ? (
        <p className="mt-2 text-sm font-semibold text-[#4a7c5a]">
          ✓ Ce jour est déjà partagé
          {partagerTous
            ? " (toute la classe)"
            : ` (${selected.size} élève${selected.size > 1 ? "s" : ""})`}
          .
        </p>
      ) : (
        <p className="mt-2 text-sm text-[#b45309]">
          Pas encore partagé — les enfants ne voient pas ces créneaux tant que tu n’enregistres pas
          le partage.
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-[#2d4a3e]/60">Chargement des élèves…</p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
              <input
                type="radio"
                name={`rdv-partage-${jour}`}
                checked={partagerTous}
                onChange={() => setPartagerTous(true)}
                className="h-4 w-4 accent-[#4a7c5a]"
              />
              Toute la classe
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
              <input
                type="radio"
                name={`rdv-partage-${jour}`}
                checked={!partagerTous}
                onChange={() => setPartagerTous(false)}
                className="h-4 w-4 accent-[#4a7c5a]"
              />
              Un ou plusieurs enfants (parents à rencontrer)
            </label>
            {!partagerTous && (
              <div className="mt-2 space-y-3 rounded-xl border border-[#2d4a3e]/15 bg-white/80 p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set(eleves.map((e) => String(e.id))))}
                    className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-xs font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/15"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-xs font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/15"
                  >
                    Aucun
                  </button>
                </div>
                <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {eleves.map((el) => (
                    <li key={el.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
                        <input
                          type="checkbox"
                          checked={selected.has(String(el.id))}
                          onChange={() => toggle(String(el.id))}
                          className="h-4 w-4 rounded accent-[#4a7c5a]"
                        />
                        {el.prenom} {el.nom}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#4a7c5a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-60"
            >
              {saving ? "Envoi…" : "Envoyer / enregistrer le partage"}
            </button>
            <button
              type="button"
              onClick={handleRetirer}
              disabled={saving}
              className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
            >
              Retirer le partage
            </button>
          </div>

          {message && (
            <p
              className={`mt-3 text-sm font-medium ${
                message.type === "ok" ? "text-[#2d6b4a]" : "text-[#b45309]"
              }`}
            >
              {message.text}
            </p>
          )}
        </>
      )}
    </div>
  );
}
