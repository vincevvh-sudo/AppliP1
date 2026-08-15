"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { getBulletinEnvoyeById } from "../../../../data/bulletin-envoye-storage";
import type {
  BulletinEnvoyeRow,
  BulletinEnvoyeSyntheseRow,
  BulletinEnvoyeLigne,
} from "../../../../data/bulletin-envoye-storage";
import { formatNoteSurBarème } from "../../../../data/bulletin-synthese";
import { getEnfantSession } from "../../../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function faceLabel(v: string | null | undefined): string {
  if (v === "acquis") return "😊";
  if (v === "en_cours") return "😐";
  if (v === "non_acquis") return "😞";
  return "—";
}

export default function EnfantBulletinViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? Number(params.id) : NaN;
  const [bulletin, setBulletin] = useState<BulletinEnvoyeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getEnfantSession();
    if (!session) {
      router.replace("/enfant");
      return;
    }
    if (!Number.isFinite(id)) {
      setLoading(false);
      return;
    }
    getBulletinEnvoyeById(id)
      .then((row) => {
        if (row && String(row.eleve_id) === String(session.id)) {
          setBulletin(row);
        } else {
          setBulletin(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setBulletin(null);
        setLoading(false);
      });
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        </div>
      </main>
    );
  }

  if (!bulletin) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link
              href="/enfant/resultats"
              className="flex items-center gap-2 font-display text-xl text-[#2d4a3e]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
                <IconLeaf />
              </span>
              Bulletin
            </Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12 text-center">
          <p className="text-[#2d4a3e]/70">Bulletin introuvable.</p>
          <Link
            href="/enfant/resultats"
            className="mt-4 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
          >
            ← Retour aux résultats
          </Link>
        </div>
      </main>
    );
  }

  const rawData = bulletin.data;
  let data: Record<string, unknown> = {};
  try {
    data = typeof rawData === "string" ? JSON.parse(rawData) : (rawData ?? {});
  } catch {
    data = {};
  }
  if (typeof data !== "object" || data === null) data = {};

  const comportement = (
    Array.isArray(data.comportement) ? data.comportement : []
  ) as BulletinEnvoyeLigne[];
  const attendus = (Array.isArray(data.attendus) ? data.attendus : []) as BulletinEnvoyeLigne[];
  const synthese = (
    Array.isArray(data.synthese) ? data.synthese : []
  ) as BulletinEnvoyeSyntheseRow[];
  const sectionTitle =
    (data.sectionTitle as string) ?? bulletin.section_title ?? "Bulletin";
  const commentaireMois = (data.commentaireMois as string) ?? "";
  const commentaireSynthese = (data.commentaireSynthese as string) ?? "";
  const hasPage1 = synthese.length > 0 || commentaireSynthese.trim() !== "";

  const sentDate = new Date(bulletin.sent_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <div className="no-print">
        <ForetMagiqueBackground />
      </div>

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md no-print">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant/resultats"
            className="flex items-center gap-2 font-display text-xl text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Bulletin — {sectionTitle}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-full bg-[#4a7c5a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d6b4d]"
            >
              Imprimer / Enregistrer en PDF
            </button>
            <Link
              href="/enfant/resultats"
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      <div
        id="bulletin-print-area"
        className="relative z-10 mx-auto max-w-4xl bg-white/95 px-6 py-8 shadow-lg print:bg-white print:shadow-none"
      >
        <h1 className="font-display text-2xl text-[#2d4a3e]">
          Bulletin — {sectionTitle}
        </h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/60">Envoyé le {sentDate}</p>

        {/* Page 1 : résultats scolaires (synthèse + commentaire) */}
        {hasPage1 && (
          <div className="bulletin-page-synthese mt-6">
            {synthese.length > 0 && (
              <section className="bulletin-synthese rounded-xl border border-[#2d4a3e]/10 bg-white/50 overflow-hidden">
                <h2 className="border-b border-[#2d4a3e]/10 px-4 py-3 font-display text-lg text-[#2d4a3e] print:border-0 print:px-0 print:py-1 print:text-sm">
                  Synthèse des évaluations
                </h2>
                <div className="overflow-x-auto px-4 pb-4 print:px-0">
                  <table className="mt-2 w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#2d4a3e]/20">
                        <th className="pb-2 pr-4 text-left font-medium text-[#2d4a3e]">
                          Partie
                        </th>
                        <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                          P1
                        </th>
                        <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                          P2
                        </th>
                        <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                          P3
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {synthese.map((row, i) => (
                        <tr key={i} className="border-b border-[#2d4a3e]/10">
                          <td className="py-2 pr-4 text-[#2d4a3e]">{row.label}</td>
                          <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                            {formatNoteSurBarème(row.P1, row.maxPoints)}
                          </td>
                          <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                            {formatNoteSurBarème(row.P2, row.maxPoints)}
                          </td>
                          <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                            {formatNoteSurBarème(row.P3, row.maxPoints)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {commentaireSynthese.trim() !== "" && (
              <section className="bulletin-commentaire-synthese mt-6">
                <h2 className="font-display text-lg text-[#2d4a3e]">Commentaire</h2>
                <p className="mt-2 whitespace-pre-wrap text-[#2d4a3e]/90">
                  {commentaireSynthese}
                </p>
              </section>
            )}
          </div>
        )}

        {/* Page 2+ : attendus scolaires */}
        <div className={hasPage1 ? "bulletin-page-attendus" : "mt-6"}>
          {comportement.length > 0 && (
            <section className="mt-2">
              <h2 className="font-display text-lg text-[#2d4a3e]">Mon comportement</h2>
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#2d4a3e]/20">
                    <th className="pb-2 pr-4 text-left font-medium text-[#2d4a3e]">
                      Comportement
                    </th>
                    <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                      Enfant
                    </th>
                    <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                      Enseignant
                    </th>
                    <th className="pb-2 pl-4 text-left font-medium text-[#2d4a3e]">
                      Commentaire
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comportement.map((line, i) => (
                    <tr key={i} className="border-b border-[#2d4a3e]/10 align-top">
                      <td className="py-2 pr-4 text-[#2d4a3e]">{line.libelle}</td>
                      <td className="py-2 px-2 text-center">{faceLabel(line.enfant)}</td>
                      <td className="py-2 px-2 text-center">
                        {faceLabel(line.enseignant)}
                      </td>
                      <td className="py-2 pl-4 text-[#2d4a3e]/90">
                        {line.commentaire || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {attendus.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-lg text-[#2d4a3e]">
                Attendus — {sectionTitle}
              </h2>
              <table className="mt-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#2d4a3e]/20">
                    <th className="pb-2 pr-4 text-left font-medium text-[#2d4a3e]">
                      Attendu
                    </th>
                    <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                      Enseignant
                    </th>
                    <th className="pb-2 pl-4 text-left font-medium text-[#2d4a3e]">
                      Commentaire
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendus.map((line, i) => (
                    <tr key={i} className="border-b border-[#2d4a3e]/10 align-top">
                      <td className="py-2 pr-4 text-[#2d4a3e]">{line.libelle}</td>
                      <td className="py-2 px-2 text-center">
                        {faceLabel(line.enseignant)}
                      </td>
                      <td className="py-2 pl-4 text-[#2d4a3e]/90">
                        {line.commentaire || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {commentaireMois && (
            <section className="mt-8">
              <h2 className="font-display text-lg text-[#2d4a3e]">Commentaire du mois</h2>
              <p className="mt-2 whitespace-pre-wrap text-[#2d4a3e]/90">
                {commentaireMois}
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
