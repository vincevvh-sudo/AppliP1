"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { getResultatsAll, deleteResultat, saveResultat } from "../../data/resultats-storage";
import { supabase } from "../../../utils/supabase";
import type { EleveRow } from "../../../utils/supabase";
import type { ResultatRow } from "../../data/resultats-storage";
import { getSonById, isConsonne } from "../../data/sons-data";
import { MANUAL_EVAL_CATEGORIES, getManualCategoryLabel, type ManualEvalCategoryId } from "../../data/manual-evaluations";
import {
  getFluenceDisplayLabel,
  isFluenceNiveauId,
  sonIdFromFluenceNiveauId,
} from "../../data/fluence-partage";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function formatDate(s: string | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(s: string | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MATHS_RESULT_LABELS: Record<string, string> = {
  "maths-centimetre-metre": "Maths — Centimètre ou mètre",
  "maths-euros-monnaie": "Maths — Compter les euros",
  "maths-jours-semaine": "Maths — Jours de la semaine",
  "maths-instruments-mesure": "Maths — Instruments de mesure",
  "maths-solides": "Maths — Solides",
  "maths-quadrilateres": "Maths — Quadrilatères",
};

function isFluenceResultat(r: ResultatRow): boolean {
  if (isFluenceNiveauId(r.niveau_id ?? "")) return true;
  return (r.detail_exercices ?? []).some((ex) => ex.type === "fluence-maison" || ex.type === "fluence-chrono");
}

function getFluenceLabel(r: ResultatRow): string {
  const son = getSonById(r.son_id ?? "");
  if (son) return `Fluence — ${getFluenceDisplayLabel(son)}`;
  const fromNiveau = sonIdFromFluenceNiveauId(r.niveau_id ?? "");
  const son2 = fromNiveau ? getSonById(fromNiveau) : null;
  if (son2) return `Fluence — ${getFluenceDisplayLabel(son2)}`;
  return "Fluence";
}

function getFluenceUnite(r: ResultatRow): string {
  const sonId = r.son_id || sonIdFromFluenceNiveauId(r.niveau_id ?? "") || "";
  const son = getSonById(sonId);
  if (!son) return "élément";
  return isConsonne(son) ? "syllabe" : "lettre";
}

function getResultLabel(r: ResultatRow): string {
  if (r.son_id === "manuel") {
    const titre = r.detail_exercices?.[0]?.titre ?? "Test papier";
    const cat = r.niveau_id?.replace(/^manuel-/, "");
    return `${getManualCategoryLabel(cat)} — ${titre}`;
  }
  if (r.son_id === "savoir-parler-poesie") return "Parler — Je dis ma poésie";
  if (r.son_id === "savoir-parler-famille") return "Parler — Présentation de ma famille";
  if (isFluenceResultat(r)) return getFluenceLabel(r);
  const mathsLabel = MATHS_RESULT_LABELS[r.son_id ?? ""];
  if (mathsLabel) return mathsLabel;
  const son = getSonById(r.son_id ?? "");
  return `${son ? son.grapheme : (r.son_id || "?")} — ${(r.niveau_id ?? "").replace(/-/g, " ")}`;
}

function getGroupTitle(sonId: string): string {
  if (sonId === "manuel") return "Tests papier (encodés enseignant)";
  if (MATHS_RESULT_LABELS[sonId]) return MATHS_RESULT_LABELS[sonId];
  const son = getSonById(sonId);
  return `Lettre ${son ? son.grapheme : sonId}`;
}

type DisplayBlock =
  | { kind: "single"; row: ResultatRow }
  | { kind: "fluence"; key: string; label: string; unite: string; attempts: ResultatRow[] };

/** Regroupe les essais fluence (même élève + même son) pour afficher l’évolution. */
function buildDisplayBlocks(rows: ResultatRow[]): DisplayBlock[] {
  const sorted = [...rows].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  const fluenceByKey = new Map<string, ResultatRow[]>();
  const order: Array<{ kind: "single"; row: ResultatRow } | { kind: "fluence"; key: string }> = [];
  const seenFluence = new Set<string>();

  for (const r of sorted) {
    if (isFluenceResultat(r) && isFluenceNiveauId(r.niveau_id ?? "")) {
      const key = `${r.eleve_id}|${r.son_id}|${r.niveau_id}`;
      if (!fluenceByKey.has(key)) fluenceByKey.set(key, []);
      fluenceByKey.get(key)!.push(r);
      if (!seenFluence.has(key)) {
        seenFluence.add(key);
        order.push({ kind: "fluence", key });
      }
    } else {
      order.push({ kind: "single", row: r });
    }
  }

  return order.map((item) => {
    if (item.kind === "single") return item;
    const attempts = [...(fluenceByKey.get(item.key) ?? [])].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });
    const first = attempts[0];
    return {
      kind: "fluence" as const,
      key: item.key,
      label: first ? getFluenceLabel(first) : "Fluence",
      unite: first ? getFluenceUnite(first) : "élément",
      attempts,
    };
  });
}

function FluenceEvolutionCard({
  label,
  unite,
  attempts,
  showEleve,
  elevesById,
  deletingId,
  onDelete,
}: {
  label: string;
  unite: string;
  attempts: ResultatRow[];
  showEleve?: boolean;
  elevesById: Record<string, EleveRow>;
  deletingId: string | null;
  onDelete: (r: ResultatRow) => void;
}) {
  const best = Math.max(...attempts.map((a) => a.points), 0);
  const eleve = attempts[0] ? elevesById[String(attempts[0].eleve_id)] : undefined;

  return (
    <li className="rounded-xl bg-[#fef9f3]/80 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showEleve ? (
          <span className="font-medium text-[#2d4a3e]">
            {eleve ? `${eleve.prenom} ${eleve.nom}` : `Élève`}
          </span>
        ) : null}
        <span className="font-medium text-[#2d4a3e]">{label}</span>
        <span className="text-sm font-semibold text-[#4a7c5a]">
          Record : {best} {unite}
          {best > 1 ? "s" : ""} / min
        </span>
        <span className="text-xs text-[#2d4a3e]/60">
          {attempts.length} essai{attempts.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm text-[#2d4a3e]">
          <thead>
            <tr className="border-b border-[#2d4a3e]/15 text-[#2d4a3e]/70">
              <th className="py-1.5 pr-3 font-medium">Essai</th>
              <th className="py-1.5 pr-3 font-medium">Score</th>
              <th className="py-1.5 pr-3 font-medium">Durée</th>
              <th className="py-1.5 pr-3 font-medium">Date</th>
              <th className="py-1.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {attempts.map((r, i) => {
              const duree = r.detail_exercices?.[0]?.duree_secondes;
              const isBest = r.points === best;
              return (
                <tr key={r.id ?? `${r.created_at}-${i}`} className="border-b border-[#2d4a3e]/8 last:border-0">
                  <td className="py-2 pr-3">Essai {i + 1}</td>
                  <td className={`py-2 pr-3 font-semibold tabular-nums ${isBest ? "text-[#4a7c5a]" : ""}`}>
                    {r.points} {unite}
                    {r.points > 1 ? "s" : ""}
                    {isBest ? " ★" : ""}
                  </td>
                  <td className="py-2 pr-3 text-[#2d4a3e]/80">
                    {duree != null ? (duree >= 60 ? "1 min" : `${duree} s`) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-xs text-[#2d4a3e]/60">{formatDateTime(r.created_at)}</td>
                  <td className="py-2 text-right">
                    {r.id != null && (
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
                        disabled={deletingId === r.id}
                        className="rounded-lg border border-[#c45c4a]/40 bg-white px-2 py-1 text-xs text-[#c45c4a] transition hover:bg-[#c45c4a]/10 disabled:opacity-50"
                      >
                        {deletingId === r.id ? "…" : "Effacer"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </li>
  );
}

function ResultatSingleCard({
  r,
  showEleve,
  elevesById,
  deletingId,
  onDelete,
}: {
  r: ResultatRow;
  showEleve?: boolean;
  elevesById: Record<string, EleveRow>;
  deletingId: string | null;
  onDelete: (r: ResultatRow) => void;
}) {
  const eleve = elevesById[String(r.eleve_id)];
  const hasDetail = r.detail_exercices && r.detail_exercices.length > 0;
  return (
    <li
      key={r.id ?? `${r.eleve_id}-${r.son_id}-${r.niveau_id}-${r.created_at}`}
      className="rounded-xl bg-[#fef9f3]/80 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showEleve ? (
          <span className="font-medium text-[#2d4a3e]">
            {eleve ? `${eleve.prenom} ${eleve.nom}` : `Élève #${r.eleve_id}`}
          </span>
        ) : null}
        <span className="text-[#2d4a3e]/80">{getResultLabel(r)}</span>
        <span className={`font-semibold ${r.reussi ? "text-[#4a7c5a]" : "text-[#c45c4a]"}`}>
          {r.points} / {r.points_max}
        </span>
        <span className="text-xs text-[#2d4a3e]/60">{formatDate(r.created_at)}</span>
      </div>
      {hasDetail ? (
        <ul className="mt-3 space-y-1 border-l-2 border-[#2d4a3e]/25 pl-3 text-sm text-[#2d4a3e]/90">
          {r.detail_exercices!.map((ex, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>{ex.titre}</span>
              <span className="font-medium tabular-nums text-[#2d4a3e]">
                {ex.points} / {ex.pointsMax}
                {ex.duree_secondes != null && (
                  <span className="ml-1 text-[#2d4a3e]/70">(en {ex.duree_secondes} s)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : !showEleve ? (
        <p className="mt-2 text-xs text-[#2d4a3e]/60">
          Détail des exercices non disponible pour cette évaluation.
        </p>
      ) : null}
      {r.id != null && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onDelete(r)}
            disabled={deletingId === r.id}
            className="rounded-lg border border-[#c45c4a]/50 bg-white px-3 py-1.5 text-sm text-[#c45c4a] transition hover:bg-[#c45c4a]/10 disabled:opacity-50"
          >
            {deletingId === r.id ? "Suppression…" : "Effacer définitivement"}
          </button>
        </div>
      )}
    </li>
  );
}

function EnseignantResultatsContent() {
  const searchParams = useSearchParams();
  const eleveFilter = searchParams.get("eleve");

  const [resultats, setResultats] = useState<ResultatRow[]>([]);
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualCategory, setManualCategory] = useState<ManualEvalCategoryId>("francais-lire");
  const [manualScores, setManualScores] = useState<Record<string, string>>({});
  const [savingManual, setSavingManual] = useState(false);
  const [manualMessage, setManualMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [res, { data: elevesData, error: elevesError }] = await Promise.all([
        getResultatsAll(),
        supabase.from("eleves").select("*").order("nom").order("prenom"),
      ]);
      setResultats(res);
      setEleves((elevesData ?? []) as EleveRow[]);
      if (elevesError) setLoadError(`Élèves : ${elevesError.message}`);
    } catch (err) {
      setResultats([]);
      setEleves([]);
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement des résultats.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [vueMode, setVueMode] = useState<"eleve" | "lettre">("eleve");

  const elevesById = Object.fromEntries(eleves.map((e) => [e.id, e]));
  const filtered = eleveFilter
    ? resultats.filter((r) => r.eleve_id === eleveFilter)
    : resultats;

  const byEleve = filtered.reduce<Record<string, ResultatRow[]>>((acc, r) => {
    if (!acc[r.eleve_id]) acc[r.eleve_id] = [];
    acc[r.eleve_id].push(r);
    return acc;
  }, {});

  /** Regroupe par lettre (son_id), trié par ordre du son dans la forêt. */
  const byLettre = filtered.reduce<Record<string, ResultatRow[]>>((acc, r) => {
    const raw = r.son_id ?? "";
    const sid = raw ? String(raw).toLowerCase() : "?";
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(r);
    return acc;
  }, {});
  const lettresAvecResultats = Object.keys(byLettre).sort((a, b) => {
    if (a === "manuel") return -1;
    if (b === "manuel") return 1;
    const aMaths = a.startsWith("maths-");
    const bMaths = b.startsWith("maths-");
    if (aMaths && !bMaths) return -1;
    if (!aMaths && bMaths) return 1;
    if (aMaths && bMaths) return a.localeCompare(b, "fr");
    if (a === "?") return 1;
    if (b === "?") return -1;
    const sonA = getSonById(a);
    const sonB = getSonById(b);
    return (sonA?.ordre ?? 999) - (sonB?.ordre ?? 999);
  });

  const baseUrl = "/enseignant/resultats";

  const handleSupprimer = async (r: ResultatRow) => {
    if (r.id == null) return;
    setDeleteError(null);
    setDeletingId(r.id);
    const ok = await deleteResultat(r.id);
    setDeletingId(null);
    if (ok) {
      setResultats((prev) => prev.filter((x) => x.id !== r.id));
    } else {
      setDeleteError(
        "Impossible de supprimer. Exécutez le fichier supabase-exercice-resultats-allow-delete.sql dans le SQL Editor de Supabase (Dashboard > SQL Editor)."
      );
    }
  };

  const handleSaveManual = async () => {
    const title = manualTitle.trim();
    if (!title) {
      setManualMessage("Indique le titre du test.");
      return;
    }
    const entries = Object.entries(manualScores)
      .map(([eleveId, raw]) => ({ eleveId, value: raw.trim() }))
      .filter((x) => x.value !== "");
    if (entries.length === 0) {
      setManualMessage("Ajoute au moins une note.");
      return;
    }
    const parsed = entries
      .map(({ eleveId, value }) => ({ eleveId, score: Number(value.replace(",", ".")) }))
      .filter((x) => Number.isFinite(x.score) && x.score >= 0 && x.score <= 10);
    if (parsed.length === 0) {
      setManualMessage("Aucune note valide. Utilise des notes entre 0 et 10.");
      return;
    }

    setSavingManual(true);
    setManualMessage(null);
    try {
      for (const row of parsed) {
        const normalized = Math.round(row.score * 10) / 10;
        // Supprimer une éventuelle note manuelle existante pour ce même test / élève / matière
        const existing = resultats.find(
          (r) =>
            r.son_id === "manuel" &&
            r.niveau_id === `manuel-${manualCategory}` &&
            String(r.eleve_id) === String(row.eleveId) &&
            r.detail_exercices &&
            r.detail_exercices[0]?.titre === title
        );
        if (existing?.id) {
          await deleteResultat(existing.id);
        }

        await saveResultat({
          eleve_id: row.eleveId,
          son_id: "manuel",
          niveau_id: `manuel-${manualCategory}`,
          points: normalized,
          points_max: 10,
          reussi: normalized >= 5,
          detail_exercices: [
            {
              type: "manuel-note",
              titre: title,
              points: normalized,
              pointsMax: 10,
            },
          ],
        });
      }
      setManualMessage(`Résultats enregistrés pour ${parsed.length} élève(s).`);
      setManualScores({});
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'enregistrement.";
      setManualMessage(msg);
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8b4d4]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Résultats des élèves
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Résultats des élèves
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Résultats des exercices (tous types : Phono, Évaluations, Cursives-imprimés, etc.).
        </p>

        <section className="mt-6 rounded-2xl bg-white/95 p-5 shadow-lg">
          <h2 className="font-display text-xl text-[#2d4a3e]">Encoder un test papier (sur 10)</h2>
          <p className="mt-1 text-sm text-[#2d4a3e]/75">
            Saisis le titre du test, choisis la matière, puis encode les notes. Ces résultats apparaîtront chez l&apos;enfant et dans la synthèse du bulletin.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Titre du test (ex: Dictée mars)"
              className="rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e]"
            />
            <select
              value={manualCategory}
              onChange={(e) => setManualCategory(e.target.value as ManualEvalCategoryId)}
              className="rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e]"
            >
              {MANUAL_EVAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#2d4a3e]/10 bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2d4a3e]/10 bg-[#fef9f3]/80">
                  <th className="px-3 py-2 text-left font-medium text-[#2d4a3e]">Élève</th>
                  <th className="px-3 py-2 text-right font-medium text-[#2d4a3e]">Note /10</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((e) => (
                  <tr key={e.id} className="border-b border-[#2d4a3e]/10 last:border-b-0">
                    <td className="px-3 py-2 text-[#2d4a3e]">{e.prenom} {e.nom}</td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="/10"
                        value={manualScores[e.id] ?? ""}
                        onChange={(ev) => setManualScores((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        className="w-24 rounded-md border border-[#2d4a3e]/20 px-2 py-1 text-right text-[#2d4a3e]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveManual}
              disabled={savingManual}
              className="rounded-xl bg-[#4a7c5a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
            >
              {savingManual ? "Enregistrement..." : "Enregistrer les notes"}
            </button>
            {manualMessage && <p className="text-sm text-[#2d4a3e]/80">{manualMessage}</p>}
          </div>
        </section>

        {loadError && (
          <div className="mt-4 rounded-xl border border-[#c45c4a]/50 bg-[#c45c4a]/10 px-4 py-3 text-sm text-[#c45c4a]" role="alert">
            Erreur : {loadError}
            <br />
            <span className="text-[#2d4a3e]/80">Vérifiez que la table Supabase &quot;exercice_resultats&quot; existe et que les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies.</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => { setDeleteError(null); setLoadError(null); fetchData(); }}
            className="rounded-lg bg-[#2d4a3e]/10 px-3 py-1.5 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            Rafraîchir
          </button>
          {deleteError && (
            <p className="max-w-md text-sm text-[#c45c4a]" role="alert">
              {deleteError}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={baseUrl}
            className={`rounded-lg px-3 py-1.5 text-sm ${!eleveFilter ? "bg-[#4a7c5a] text-white" : "bg-white/80 text-[#2d4a3e]"}`}
          >
            Tous
          </Link>
          {eleves.map((e) => (
            <Link
              key={e.id}
              href={`${baseUrl}?eleve=${e.id}`}
              className={`rounded-lg px-3 py-1.5 text-sm ${eleveFilter === e.id ? "bg-[#4a7c5a] text-white" : "bg-white/80 text-[#2d4a3e]"}`}
            >
              {e.prenom} {e.nom}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center text-sm text-[#2d4a3e]/80">Vue :</span>
          <button
            type="button"
            onClick={() => setVueMode("eleve")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${vueMode === "eleve" ? "bg-[#4a7c5a] text-white" : "bg-white/80 text-[#2d4a3e] hover:bg-[#2d4a3e]/10"}`}
          >
            Par élève
          </button>
          <button
            type="button"
            onClick={() => setVueMode("lettre")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${vueMode === "lettre" ? "bg-[#4a7c5a] text-white" : "bg-white/80 text-[#2d4a3e] hover:bg-[#2d4a3e]/10"}`}
          >
            Par lettre
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-[#2d4a3e]/70">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white/95 p-8 text-center text-[#2d4a3e]/70 shadow-lg">
            Aucun résultat pour le moment. Les évaluations des élèves apparaîtront ici après qu&apos;ils aient terminé une évaluation (Français, mathématiques, etc.).
          </p>
        ) : vueMode === "lettre" ? (
          <div className="mt-8 space-y-8">
            {lettresAvecResultats.map((sonId) => {
              const rows = byLettre[sonId] ?? [];
              return (
                <section
                  key={sonId}
                  className="rounded-2xl bg-white/95 p-6 shadow-lg"
                >
                  <h2 className="font-display text-xl text-[#2d4a3e]">
                    {getGroupTitle(sonId)}
                  </h2>
                  <p className="mt-1 text-sm text-[#2d4a3e]/70">
                    {rows.length} résultat{rows.length > 1 ? "s" : ""} — tu peux effacer définitivement un résultat après l&apos;avoir vu.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {buildDisplayBlocks(rows).map((block) =>
                      block.kind === "fluence" ? (
                        <FluenceEvolutionCard
                          key={block.key}
                          label={block.label}
                          unite={block.unite}
                          attempts={block.attempts}
                          showEleve
                          elevesById={elevesById}
                          deletingId={deletingId}
                          onDelete={handleSupprimer}
                        />
                      ) : (
                        <ResultatSingleCard
                          key={block.row.id ?? `${block.row.eleve_id}-${block.row.son_id}-${block.row.niveau_id}-${block.row.created_at}`}
                          r={block.row}
                          showEleve
                          elevesById={elevesById}
                          deletingId={deletingId}
                          onDelete={handleSupprimer}
                        />
                      )
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {Object.entries(byEleve).map(([eleveIdStr, rows]) => {
              const eleveId = eleveIdStr;
              const eleve = elevesById[eleveId];
              return (
                <section
                  key={eleveId}
                  className="rounded-2xl bg-white/95 p-6 shadow-lg"
                >
                  <h2 className="font-display text-lg text-[#2d4a3e]">
                    {eleve ? `${eleve.prenom} ${eleve.nom}` : `Élève`}
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {buildDisplayBlocks(rows).map((block) =>
                      block.kind === "fluence" ? (
                        <FluenceEvolutionCard
                          key={block.key}
                          label={block.label}
                          unite={block.unite}
                          attempts={block.attempts}
                          elevesById={elevesById}
                          deletingId={deletingId}
                          onDelete={handleSupprimer}
                        />
                      ) : (
                        <ResultatSingleCard
                          key={block.row.id ?? `${block.row.eleve_id}-${block.row.son_id}-${block.row.niveau_id}-${block.row.created_at}`}
                          r={block.row}
                          elevesById={elevesById}
                          deletingId={deletingId}
                          onDelete={handleSupprimer}
                        />
                      )
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <Link href="/enseignant" className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}

export default function EnseignantResultatsPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
          <p className="text-[#2d4a3e]/70">Chargement des résultats…</p>
        </div>
      </main>
    }>
      <EnseignantResultatsContent />
    </Suspense>
  );
}
