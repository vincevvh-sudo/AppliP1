"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import { getBulletinEnvoyeById } from "../../../../data/bulletin-envoye-storage";
import type { BulletinEnvoyeRow } from "../../../../data/bulletin-envoye-storage";
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
    getBulletinEnvoyeById(id).then((row) => {
      // Comparaison insensible au type (Supabase peut renvoyer eleve_id en string)
      if (row && Number(row.eleve_id) === Number(session.id)) {
        setBulletin(row);
      } else {
        setBulletin(null);
      }
      setLoading(false);
    }).catch(() => {
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
            <Link href="/enfant/resultats" className="flex items-center gap-2 font-display text-xl text-[#2d4a3e]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
                <IconLeaf />
              </span>
              Bulletin
            </Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12 text-center">
          <p className="text-[#2d4a3e]/70">Bulletin introuvable.</p>
          <Link href="/enfant/resultats" className="mt-4 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white">
            ← Retour aux résultats
          </Link>
        </div>
      </main>
    );
  }

  // S'assurer que data est un objet (Supabase JSONB peut parfois être une chaîne)
  const rawData = bulletin.data;
  let data: Record<string, unknown> = {};
  try {
    data = typeof rawData === "string" ? JSON.parse(rawData) : (rawData ?? {});
  } catch {
    data = {};
  }
  if (typeof data !== "object" || data === null) data = {};
  const comportement = Array.isArray(data.comportement) ? data.comportement : [];
  const attendus = Array.isArray(data.attendus) ? data.attendus : [];
  const sectionTitle = (data.sectionTitle as string) ?? bulletin.section_title ?? "Bulletin";
  const commentaireMois = (data.commentaireMois as string) ?? "";

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
          <Link href="/enfant/resultats" className="flex items-center gap-2 font-display text-xl text-[#2d4a3e]">
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

      <div id="bulletin-print-area" className="relative z-10 mx-auto max-w-4xl bg-white/95 px-6 py-8 shadow-lg print:bg-white print:shadow-none">
        <h1 className="font-display text-2xl text-[#2d4a3e]">
          Bulletin — {sectionTitle}
        </h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/60">Envoyé le {sentDate}</p>

        {/* Comportement */}
        {comportement.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg text-[#2d4a3e]">
              Mon comportement
            </h2>
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
                  <tr
                    key={i}
                    className="border-b border-[#2d4a3e]/10 align-top"
                  >
                    <td className="py-2 pr-4 text-[#2d4a3e]">{line.libelle}</td>
                    <td className="py-2 px-2 text-center">
                      {faceLabel(line.enfant)}
                    </td>
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

        {/* Attendus du mois */}
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
                  <tr
                    key={i}
                    className="border-b border-[#2d4a3e]/10 align-top"
                  >
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

        {/* Commentaire du mois */}
        {commentaireMois && (
          <section className="mt-8">
            <h2 className="font-display text-lg text-[#2d4a3e]">
              Commentaire du mois
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-[#2d4a3e]/90">
              {commentaireMois}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
