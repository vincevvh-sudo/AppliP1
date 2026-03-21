"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { saveResultat } from "../../../data/resultats-storage";
import {
  OBJETS_A_RELier,
  SOLIDES,
  SOLIDES_VRAI_FAUX,
  type SolideId,
  TITRE_SOLIDES_EVALUATION,
} from "../../../data/solides-evaluation-data";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";

const IconMaths = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm2 5h6v2H9V7zm0 4h6v2H9v-2zm0 4h3v2H9v-2z" />
  </svg>
);

type Part = 1 | 2 | 3;

function scoreSur10(points: number, total: number) {
  if (total <= 0) return 0;
  const raw = (points / total) * 10;
  return Math.round(raw * 10) / 10;
}

export default function EnfantSolidesPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const [part, setPart] = useState<Part>(1);

  const [reponsesRelier, setReponsesRelier] = useState<Record<string, SolideId | null>>(() => {
    const initial: Record<string, SolideId | null> = {};
    OBJETS_A_RELier.forEach((o) => {
      initial[o.id] = null;
    });
    return initial;
  });
  const [reponsesVF, setReponsesVF] = useState<Record<string, boolean | null>>(() => {
    const initial: Record<string, boolean | null> = {};
    SOLIDES_VRAI_FAUX.forEach((q) => {
      initial[q.id] = null;
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) router.replace("/enfant");
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void moduleEstAccessiblePourEleve("solides", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/solide-figure");
    });
  }, [session, router]);

  const allRelierDone = useMemo(
    () => OBJETS_A_RELier.every((o) => reponsesRelier[o.id] !== null),
    [reponsesRelier]
  );
  const allVfDone = useMemo(
    () => SOLIDES_VRAI_FAUX.every((q) => reponsesVF[q.id] !== null),
    [reponsesVF]
  );

  const setRelier = useCallback((objetId: string, solide: SolideId) => {
    setReponsesRelier((prev) => ({ ...prev, [objetId]: solide }));
  }, []);

  const setVF = useCallback((questionId: string, value: boolean) => {
    setReponsesVF((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const pointsRelier = useMemo(() => {
    let ok = 0;
    OBJETS_A_RELier.forEach((o) => {
      if (reponsesRelier[o.id] === o.solide) ok++;
    });
    return ok;
  }, [reponsesRelier]);

  const pointsVF = useMemo(() => {
    let ok = 0;
    SOLIDES_VRAI_FAUX.forEach((q) => {
      if (reponsesVF[q.id] === q.correct) ok++;
    });
    return ok;
  }, [reponsesVF]);

  const totalPointsMax = OBJETS_A_RELier.length + SOLIDES_VRAI_FAUX.length; // 16
  const pointsTotal = pointsRelier + pointsVF;
  const score10 = scoreSur10(pointsTotal, totalPointsMax);

  const terminerEtSauver = useCallback(async () => {
    if (!session || !allVfDone) return;
    if (saving || resultSaved) return;

    setSaving(true);
    setSaveError(null);

    try {
      await saveResultat({
        eleve_id: String(session.id),
        son_id: "maths-solides",
        niveau_id: "maths-solides",
        points: pointsTotal,
        points_max: totalPointsMax,
        reussi: pointsTotal >= Math.ceil(totalPointsMax * 0.6),
        detail_exercices: [
          { type: "relier", titre: "Relier des objets", points: pointsRelier, pointsMax: OBJETS_A_RELier.length },
          { type: "vrai-faux", titre: "Vrai / Faux", points: pointsVF, pointsMax: SOLIDES_VRAI_FAUX.length },
        ],
      });
      setResultSaved(true);
    } catch (err: any) {
      setSaveError(err?.message ?? "Erreur enregistrement");
    } finally {
      setSaving(false);
    }
  }, [
    session,
    allVfDone,
    saving,
    resultSaved,
    pointsTotal,
    totalPointsMax,
    reponsesRelier,
    reponsesVF,
  ]);

  useEffect(() => {
    if (part === 3) {
      void terminerEtSauver();
    }
  }, [part, terminerEtSauver]);

  if (!session) return null;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enfant/maths/evaluation/solide-figure" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_SOLIDES_EVALUATION}
          </Link>
          <Link href="/enfant/maths/evaluation/solide-figure" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Espace/géométrie
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-[#2d4a3e]">{TITRE_SOLIDES_EVALUATION}</h1>
        <p className="mt-1 text-sm text-[#2d4a3e]/75">
          Partie {part === 3 ? 2 : part} / 2
        </p>

        {part === 1 ? (
          <section className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-lg text-[#2d4a3e]">Partie 1 · Relie</h2>
            <p className="mt-1 text-sm text-[#2d4a3e]/75">
              Pour chaque objet, choisis le solide qui correspond.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SOLIDES.map((s) => (
                <div key={s.id} className="rounded-xl border border-[#2d4a3e]/10 bg-[#c4a8e8]/10 px-4 py-3">
                  <span className="mr-2 text-xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="font-medium">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {OBJETS_A_RELier.map((o, idx) => (
                <div key={o.id} className="rounded-xl border border-[#2d4a3e]/10 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-6 font-medium text-[#2d4a3e]/70">{idx + 1}.</span>
                    {o.image ? (
                      <img src={o.image} alt={o.label} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <span className="text-2xl" aria-hidden>
                        {o.emoji}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 font-medium text-[#2d4a3e]">{o.label}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SOLIDES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setRelier(o.id, s.id)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                          reponsesRelier[o.id] === s.id
                            ? "bg-[#4a7c5a] text-white"
                            : "bg-[#2d4a3e]/10 text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/20"
                        }`}
                      >
                        {s.emoji} {s.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!allRelierDone}
                onClick={() => setPart(2)}
                className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer
              </button>
              {!allRelierDone && <p className="text-sm text-[#2d4a3e]/60">Réponds à tout pour continuer.</p>}
            </div>
          </section>
        ) : part === 2 ? (
          <section className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-lg text-[#2d4a3e]">Partie 2 · Vrai / Faux</h2>
            <p className="mt-1 text-sm text-[#2d4a3e]/75">Lis chaque phrase et choisis Vrai ou Faux.</p>

            <div className="mt-6 space-y-3">
              {SOLIDES_VRAI_FAUX.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-[#2d4a3e]/10 bg-white p-4">
                  <p className="font-medium text-[#2d4a3e]">
                    <span className="mr-2 text-[#2d4a3e]/60">{idx + 1}.</span>
                    {q.phrase}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVF(q.id, true)}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        reponsesVF[q.id] === true
                          ? "bg-[#4a7c5a] text-white"
                          : "bg-[#2d4a3e]/10 text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/20"
                      }`}
                    >
                      Vrai
                    </button>
                    <button
                      type="button"
                      onClick={() => setVF(q.id, false)}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        reponsesVF[q.id] === false
                          ? "bg-[#4a7c5a] text-white"
                          : "bg-[#2d4a3e]/10 text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/20"
                      }`}
                    >
                      Faux
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!allVfDone}
                onClick={() => setPart(3)}
                className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Terminer
              </button>
              {!allVfDone && <p className="text-sm text-[#2d4a3e]/60">Réponds à tout pour terminer.</p>}
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-lg text-[#2d4a3e]">Résultat</h2>
            <p className="mt-2 text-[#2d4a3e]">
              Tu as obtenu <strong>{pointsTotal}</strong> point{pointsTotal > 1 ? "s" : ""} sur{" "}
              {totalPointsMax}.
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#2d4a3e]">Score : {score10} / 10</p>
            {saving && <p className="mt-2 text-sm text-[#2d4a3e]/70">Enregistrement…</p>}
            {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
            {resultSaved && !saveError && !saving && (
              <p className="mt-2 text-sm text-[#2d4a3e]/70">Résultat enregistré.</p>
            )}
          </section>
        )}

        <Link href="/enfant/maths/evaluation/solide-figure" className="mt-10 inline-block rounded-xl bg-[#c4a8e8]/80 px-6 py-3 font-medium text-[#2d4a3e] transition hover:bg-[#c4a8e8]">
          ← Retour
        </Link>
      </div>
    </main>
  );
}

