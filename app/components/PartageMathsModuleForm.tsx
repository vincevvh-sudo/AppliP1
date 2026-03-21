"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import type { EleveRow } from "../../utils/supabase";
import type { MathsExerciceModuleId } from "../data/maths-exercices-modules";
import {
  getEleveIdsPourModule,
  remplacerPartagesModule,
  remplacerPartagesModules,
} from "../data/maths-modules-partages-storage";

type Props = {
  moduleId: MathsExerciceModuleId;
  /** Si défini, un seul bouton applique le même partage à plusieurs modules (ex. espace / géométrie). */
  moduleIdsGroup?: MathsExerciceModuleId[];
  titreAide?: string;
  compact?: boolean;
};

export function PartageMathsModuleForm({
  moduleId,
  moduleIdsGroup,
  titreAide,
  compact,
}: Props) {
  const ids = moduleIdsGroup?.length ? moduleIdsGroup : [moduleId];
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      const list = (data ?? []) as EleveRow[];
      setEleves(list);
      const merged = new Set<string>();
      for (const mid of ids) {
        const partages = await getEleveIdsPourModule(mid);
        partages.forEach((id) => merged.add(id));
      }
      setSelected(merged);
    } catch {
      setEleves([]);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const enregistrer = async () => {
    setSaving(true);
    setMessage(null);
    const eleveIds = [...selected];
    const result =
      ids.length > 1
        ? await remplacerPartagesModules(ids, eleveIds)
        : await remplacerPartagesModule(moduleId, eleveIds);
    setSaving(false);
    if (result.ok) {
      setMessage({ type: "ok", text: "Partage enregistré." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Erreur d'enregistrement." });
    }
  };

  if (loading) {
    return <p className={compact ? "text-xs text-[#2d4a3e]/70" : "text-sm text-[#2d4a3e]/70"}>Chargement des élèves…</p>;
  }

  if (eleves.length === 0) {
    return (
      <p className="text-sm text-[#2d4a3e]/70">
        Aucun élève dans la base. Ajoute des élèves depuis l&apos;espace enseignant.
      </p>
    );
  }

  const wrapClass = compact
    ? "rounded-xl border border-[#2d4a3e]/15 bg-[#fef9f3]/90 p-3"
    : "rounded-2xl border border-[#2d4a3e]/15 bg-white/95 p-4 shadow";

  return (
    <div className={wrapClass}>
      <p className={`font-medium text-[#2d4a3e] ${compact ? "text-sm" : ""}`}>
        {ids.length > 1 ? "Partager les deux tests avec les élèves sélectionnés" : "Partager avec un ou plusieurs élèves"}
      </p>
      {titreAide ? <p className="mt-1 text-xs text-[#2d4a3e]/65">{titreAide}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toutSelectionner}
          className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1 text-xs font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
        >
          Tous
        </button>
        <button
          type="button"
          onClick={rienSelectionner}
          className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1 text-xs font-medium text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
        >
          Aucun
        </button>
      </div>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {eleves.map((e) => {
          const id = String(e.id);
          const checked = selected.has(id);
          return (
            <li key={id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#2d4a3e]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(id)}
                  className="h-4 w-4 rounded border-[#2d4a3e]/40"
                />
                <span>
                  {e.prenom} {e.nom}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => void enregistrer()}
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer le partage"}
      </button>
      {message ? (
        <p
          className={`mt-2 text-sm ${message.type === "ok" ? "text-[#2d6a4f]" : "text-[#b91c1c]"}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
