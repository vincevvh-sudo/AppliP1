"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { getResultatsByEleve } from "../../data/resultats-storage";
import { getBulletinsByEleve } from "../../data/bulletin-envoye-storage";
import { getSonById } from "../../data/sons-data";
import { getEnfantSession } from "../../../utils/enfant-session";
import type { ResultatRow } from "../../data/resultats-storage";
import type { BulletinEnvoyeRow } from "../../data/bulletin-envoye-storage";
import { getManualCategoryLabel } from "../../data/manual-evaluations";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function formatDate(s: string | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

function getResultTitle(r: ResultatRow): string {
  if (r.son_id === "manuel") {
    const testTitle = r.detail_exercices?.[0]?.titre ?? "Test papier";
    return `${getManualCategoryLabel(r.niveau_id?.replace(/^manuel-/, ""))} — ${testTitle}`;
  }
  if (r.son_id === "savoir-parler-poesie") return "Parler — Je dis ma poésie";
  if (r.son_id === "savoir-parler-famille") return "Parler — Présentation de ma famille";
  const son = getSonById(r.son_id ?? "");
  return `${son ? son.grapheme : (r.son_id || "?")} — ${r.niveau_id.replace(/-/g, " ")}`;
}

export default function EnfantResultatsPage() {
  const router = useRouter();
  const [resultats, setResultats] = useState<ResultatRow[]>([]);
  const [bulletins, setBulletins] = useState<BulletinEnvoyeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getEnfantSession();
    if (!session) {
      router.replace("/enfant");
      return;
    }
    const sid = String(session.id);
    Promise.all([
      getResultatsByEleve(sid),
      getBulletinsByEleve(sid),
    ]).then(([resData, bullData]) => {
      // Filtre défensif : n'afficher que les lignes de l'élève connecté (même si la requête ou le RLS renvoyaient autre chose).
      setResultats(resData.filter((r) => String(r.eleve_id) === sid));
      setBulletins((bullData ?? []).filter((b) => String(b.eleve_id) === sid));
      setLoading(false);
    });
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Mes résultats
          </Link>
          <Link href="/enfant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-display text-2xl text-[#2d4a3e] sm:text-3xl">
          Mes évaluations
        </h1>
        <p className="mt-2 text-[#2d4a3e]/85">
          Voici tes scores (points obtenus / points max).
        </p>

        {/* Mes bulletins */}
        {!loading && bulletins.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-xl text-[#2d4a3e]">
              Mes bulletins
            </h2>
            <p className="mt-1 text-[#2d4a3e]/85">
              Bulletins du mois envoyés par ton enseignant (comportement, attendus et commentaire). Tu peux les ouvrir et les enregistrer en PDF.
            </p>
            <ul className="mt-4 space-y-3">
              {bulletins.map((b) => {
                const sentDate = new Date(b.sent_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-lg"
                  >
                    <div>
                      <span className="font-medium text-[#2d4a3e]">
                        {b.section_title}
                      </span>
                      <span className="ml-2 text-xs text-[#2d4a3e]/60">
                        {sentDate}
                      </span>
                    </div>
                    <Link
                      href={`/enfant/resultats/bulletin/${b.id}`}
                      className="rounded-xl bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4d]"
                    >
                      Voir / Imprimer PDF
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {loading ? (
          <p className="mt-8 text-[#2d4a3e]/70">Chargement…</p>
        ) : resultats.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white/95 p-8 text-center shadow-lg">
            <p className="text-[#2d4a3e]/70">
              Tu n&apos;as pas encore fait d&apos;évaluations. Continue à t&apos;entraîner dans la Forêt des sons !
            </p>
            <Link
              href="/enfant/sons"
              className="mt-4 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
            >
              Aller à la Forêt des sons
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {resultats.map((r) => {
              const hasDetail = r.detail_exercices && r.detail_exercices.length > 0;
              return (
                <li
                  key={r.id ?? `${r.eleve_id}-${r.son_id}-${r.niveau_id}-${r.created_at}`}
                  className="rounded-2xl bg-white/95 px-5 py-4 shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="font-medium text-[#2d4a3e]">
                        {getResultTitle(r)}
                      </span>
                      <span className="ml-2 text-xs text-[#2d4a3e]/60">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${r.reussi ? "text-[#4a7c5a]" : "text-[#c45c4a]"}`}>
                      {r.points} / {r.points_max}
                    </span>
                  </div>
                  {hasDetail ? (
                    <ul className="mt-3 space-y-1 border-l-2 border-[#2d4a3e]/25 pl-3 text-sm text-[#2d4a3e]/90">
                      {r.detail_exercices!.map((ex, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span>{ex.titre}</span>
                          <span className="font-medium tabular-nums text-[#2d4a3e]">
                            {ex.points} / {ex.pointsMax}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <Link href="/enfant" className="mt-12 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}
