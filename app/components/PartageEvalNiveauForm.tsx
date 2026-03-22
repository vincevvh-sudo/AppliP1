"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import type { EleveRow } from "../../utils/supabase";
import { getPartageEvalNiveauState, setPartageEvalNiveau } from "../data/sons-partages";

type Props = {
  sonId: string;
  niveauId: string;
  titre: string;
  /** Texte sous le titre (contexte pédagogique). */
  description?: string;
};

/**
 * Partage d’une évaluation identifiée par (son_id, niveau_id) dans `sons_partages_eval_niveaux` :
 * tous les élèves, ou une sélection d’élèves.
 */
export function PartageEvalNiveauForm({ sonId, niveauId, titre, description }: Props) {
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [partagerTous, setPartagerTous] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

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

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { toAll, eleveIds } = await getPartageEvalNiveauState(sonId, niveauId);
      if (cancelled) return;
      setPartagerTous(toAll);
      if (!toAll && eleveIds.length > 0) {
        setSelected(new Set(eleveIds.map((id) => String(id))));
      } else {
        setSelected(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sonId, niveauId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toutSelectionner = () => {
    setSelected(new Set(eleves.map((e) => String(e.id))));
  };

  const rienSelectionner = () => {
    setSelected(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const toAll = partagerTous;
    const eleveIds = toAll
      ? []
      : [...selected]
          .map((id) => Number(id))
          .filter((n) => Number.isFinite(n));
    if (!toAll && eleveIds.length === 0) {
      setMessage({
        type: "error",
        text: "Coche « Tous les élèves » ou sélectionne au moins un élève.",
      });
      setSaving(false);
      return;
    }
    const { ok, error } = await setPartageEvalNiveau(sonId, niveauId, toAll, eleveIds);
    setSaving(false);
    if (ok) {
      setMessage({
        type: "ok",
        text: toAll
          ? "Partagé à tous les élèves."
          : eleveIds.length === 1
            ? "Partagé à l'élève sélectionné."
            : `Partagé à ${eleveIds.length} élèves.`,
      });
    } else {
      setMessage({ type: "error", text: error ?? "Erreur lors du partage." });
    }
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-[#4a7c5a]/35 bg-[#f0f7f2]/90 p-5 shadow-md">
      <h2 className="font-display text-lg text-[#2d4a3e]">Partager aux élèves</h2>
      <p className="mt-1 text-sm text-[#2d4a3e]/75">
        {description ??
          `« ${titre} » n'apparaît dans l'espace élève que si tu le partages ici (à tous ou aux enfants choisis).`}
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-[#2d4a3e]/60">Chargement des élèves…</p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
              <input
                type="radio"
                name={`partage-${sonId}-${niveauId}`}
                checked={partagerTous}
                onChange={() => setPartagerTous(true)}
                className="h-4 w-4 accent-[#4a7c5a]"
              />
              Tous les élèves
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
              <input
                type="radio"
                name={`partage-${sonId}-${niveauId}`}
                checked={!partagerTous}
                onChange={() => setPartagerTous(false)}
                className="h-4 w-4 accent-[#4a7c5a]"
              />
              Un ou plusieurs élèves
            </label>
            {!partagerTous && (
              <div className="mt-2 space-y-3 rounded-xl border border-[#2d4a3e]/15 bg-white/80 p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toutSelectionner}
                    className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-xs font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/15"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={rienSelectionner}
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

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-5 rounded-xl bg-[#4a7c5a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer le partage"}
          </button>

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
