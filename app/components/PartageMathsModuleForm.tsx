"use client";

/**
 * Partage par élève pour les modules maths (Grandeur, Espace, TdD, …).
 * @see docs/PARTAGE-EVALUATIONS.md — checklist pour toute nouvelle évaluation dans l’arbre des maths.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabase";
import type { EleveRow } from "../../utils/supabase";
import type { MathsExerciceModuleId } from "../data/maths-exercices-modules";
import { isExerciceModuleShared } from "../data/maths-partages";
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
  /**
   * Référence stable obligatoire : `[moduleId]` recréé à chaque rendu cassait useCallback / useEffect
   * (rechargement en boucle → skeleton « Chargement des élèves… » sans fin).
   */
  const groupKey = moduleIdsGroup?.length
    ? [...moduleIdsGroup].sort().join(",")
    : "__one__";
  /** Toujours une copie : ne jamais réutiliser la ref du parent (sinon ids change à chaque rendu → boucle de chargement). */
  const ids = useMemo<MathsExerciceModuleId[]>(() => {
    return moduleIdsGroup?.length ? [...moduleIdsGroup] : [moduleId];
  }, [moduleId, groupKey]);
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const moduleIds = moduleIdsGroup?.length ? [...moduleIdsGroup] : [moduleId];

    (async () => {
      setLoading(true);
      setMessage(null);
      try {
        const { data, error } = await supabase.from("eleves").select("*").order("nom").order("prenom");
        if (cancelled) return;
        if (error) {
          setMessage({ type: "error", text: `Liste des élèves : ${error.message}` });
          setEleves([]);
          setSelected(new Set());
          return;
        }
        const list = (data ?? []) as EleveRow[];
        setEleves(list);
        const merged = new Set<string>();
        for (const mid of moduleIds) {
          const partages = await getEleveIdsPourModule(mid);
          partages.forEach((id) => merged.add(id));
        }
        if (merged.size === 0 && list.length > 0 && moduleIds.some((mid) => isExerciceModuleShared(mid))) {
          list.forEach((e) => merged.add(String(e.id)));
        }
        setSelected(merged);
      } catch (e) {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: e instanceof Error ? e.message : "Erreur lors du chargement des élèves.",
          });
          setEleves([]);
          setSelected(new Set());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // groupKey résume le groupe ; ne pas dépendre de moduleIdsGroup (nouvelle ref à chaque rendu parent).
  }, [moduleId, groupKey]);

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
      if ("info" in result && result.info) {
        setMessage({ type: "info", text: result.info });
      } else {
        setMessage({ type: "ok", text: "Partage enregistré." });
      }
    } else {
      setMessage({ type: "error", text: result.error ?? "Erreur d'enregistrement." });
    }
  };

  /** Carte avec hauteur proche du formulaire final → évite le saut du fond quand les élèves arrivent. */
  if (loading) {
    const skeletonClass = compact
      ? "rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-sm"
      : "rounded-2xl border border-[#2d4a3e]/15 bg-white/95 p-4 shadow";
    return (
      <div
        className={`${skeletonClass} min-h-[260px] animate-pulse`}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-4 w-3/4 max-w-xs rounded bg-[#2d4a3e]/10" />
        <div className="mt-2 h-3 w-full rounded bg-[#2d4a3e]/10" />
        <div className="mt-4 flex gap-2">
          <div className="h-8 w-14 rounded bg-[#2d4a3e]/10" />
          <div className="h-8 w-16 rounded bg-[#2d4a3e]/10" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-9 rounded bg-[#2d4a3e]/10" />
          <div className="h-9 rounded bg-[#2d4a3e]/10" />
          <div className="h-9 rounded bg-[#2d4a3e]/10" />
        </div>
        <div className="mt-5 h-10 rounded-xl bg-[#2d4a3e]/10" />
        <p className="mt-3 text-xs text-[#2d4a3e]/55">Chargement des élèves…</p>
      </div>
    );
  }

  if (eleves.length === 0) {
    return (
      <p className="text-sm text-[#2d4a3e]/70">
        Aucun élève dans la base. Ajoute des élèves depuis l&apos;espace enseignant.
      </p>
    );
  }

  /** Même rendu « carte blanche » que Vocabulaire spatial (compact). */
  const wrapClass = compact
    ? "rounded-2xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-sm"
    : "rounded-2xl border border-[#2d4a3e]/15 bg-white/95 p-4 shadow";

  return (
    <div className={wrapClass}>
      <p className={`font-medium text-[#2d4a3e] ${compact ? "text-sm" : ""}`}>
        {ids.length > 1
          ? "Partager les deux tests avec les élèves sélectionnés"
          : "Partager avec les élèves sélectionnés"}
      </p>
      {!compact ? (
        <p className="mt-1 text-xs text-[#2d4a3e]/60">
          Utilise <strong>Tous</strong> / <strong>Aucun</strong> ou coche les prénoms — tu peux partager avec toute la
          classe ou seulement quelques élèves.
        </p>
      ) : null}
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
          className={`mt-2 text-sm ${
            message.type === "ok"
              ? "text-[#2d6a4f]"
              : message.type === "info"
                ? "text-[#92400e]"
                : "text-[#b91c1c]"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
