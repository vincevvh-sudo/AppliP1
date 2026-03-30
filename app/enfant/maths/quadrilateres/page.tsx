"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { getEnfantSession } from "../../../../utils/enfant-session";
import { saveResultat } from "../../../data/resultats-storage";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";
import {
  QUADRILATERES_ITEMS,
  TITRE_QUADRILATERES,
  type QuadrilateresShape,
} from "../../../data/quadrilateres-data";

const IconMaths = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

function shapeLabel(shape: QuadrilateresShape): string {
  switch (shape) {
    case "carre":
      return "carré";
    case "rectangle":
      return "rectangle";
    case "triangle":
      return "triangle";
    case "disque":
      return "disque";
    default:
      return shape;
  }
}

function FormeIcon({ shape }: { shape: QuadrilateresShape }) {
  // SVG simple pour être lisible sur écran tactile.
  // Même taille pour tous les types.
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden>
      {shape === "carre" && (
        <rect x="14" y="14" width="36" height="36" fill="#a8d5ba" stroke="#2d4a3e" strokeOpacity={0.25} />
      )}
      {shape === "rectangle" && (
        <rect x="16" y="18" width="32" height="28" fill="#a8d5ba" stroke="#2d4a3e" strokeOpacity={0.25} />
      )}
      {shape === "triangle" && (
        <polygon points="32,12 52,50 12,50" fill="#a8d5ba" stroke="#2d4a3e" strokeOpacity={0.25} />
      )}
      {shape === "disque" && <circle cx="32" cy="32" r="18" fill="#a8d5ba" stroke="#2d4a3e" strokeOpacity={0.25} />}
    </svg>
  );
}

export default function EnfantQuadrilateresPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getEnfantSession>>(null);
  const total = QUADRILATERES_ITEMS.length;

  const [answers, setAnswers] = useState<(1 | 2 | 3 | 4 | null)[]>(() => Array(total).fill(null));
  const allAnswered = useMemo(() => answers.every((a) => a !== null), [answers]);

  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const setAnswer = useCallback((index: number, value: 1 | 2 | 3 | 4) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  useEffect(() => {
    const s = getEnfantSession();
    setSession(s);
    if (!s) router.replace("/enfant");
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void moduleEstAccessiblePourEleve("quadrilateres", session.id).then((ok) => {
      if (!ok) router.replace("/enfant/maths/exercice/solide-figure");
    });
  }, [session, router]);

  const handleTerminer = useCallback(async () => {
    if (!session) return;
    if (!allAnswered || saving || finished) return;

    setSaving(true);
    setSaveError(null);

    const correct = QUADRILATERES_ITEMS.reduce<number>((acc, item, i) => {
      const ans = answers[i];
      return acc + (ans === item.correctValue ? 1 : 0);
    }, 0);

    setPoints(correct);
    setFinished(true);

    try {
      await saveResultat({
        eleve_id: String(session.id),
        son_id: "maths-quadrilateres",
        niveau_id: "maths-quadrilateres",
        points: correct,
        points_max: total,
        reussi: correct >= Math.ceil(total * 0.6),
        detail_exercices: [
          {
            type: "quadrilateres",
            titre: TITRE_QUADRILATERES,
            points: correct,
            pointsMax: total,
          },
        ],
      });
      setResultSaved(true);
    } catch (err: any) {
      setSaveError(err?.message ?? "Erreur enregistrement");
    } finally {
      setSaving(false);
    }
  }, [allAnswered, answers, finished, saving, session, total]);

  useEffect(() => {
    if (!finished || !resultSaved || saveError) return;
    const t = setTimeout(() => {
      router.replace("/enfant/resultats");
    }, 1200);
    return () => clearTimeout(t);
  }, [finished, resultSaved, saveError, router]);

  if (!session) return null;

  const reussi = points != null ? points >= Math.ceil(total * 0.6) : false;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant/maths/evaluation/solide-figure"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8d4e8]/80 text-[#2d4a3e]">
              <IconMaths />
            </span>
            {TITRE_QUADRILATERES}
          </Link>
          <Link
            href="/enfant/maths/evaluation/solide-figure"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Espace/géométrie
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        <h1 className="font-display text-2xl text-white">{TITRE_QUADRILATERES}</h1>
        <p className="mt-1 text-sm text-white/95">
          Ecris le bon nombre : carré=1, rectangle=2, triangle=3, disque=4. 10 formes au total.
        </p>

        {!finished ? (
          <>
            <div className="mt-6 space-y-4">
              {QUADRILATERES_ITEMS.map((item, i) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2d4a3e]/10 bg-white/95 p-4 shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#a8d5ba]/20">
                    <FormeIcon shape={item.shape} />
                  </div>
                  <div className="flex-1 min-w-[10rem]">
                    <p className="text-sm font-medium text-[#2d4a3e]">Forme {i + 1}</p>
                    <p className="mt-1 text-xs text-[#2d4a3e]/70">
                      Choisis 1 / 2 / 3 / 4
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {[1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAnswer(i, v as 1 | 2 | 3 | 4)}
                        className={`h-10 w-10 rounded-xl text-base font-semibold transition ${
                          answers[i] === v
                            ? "bg-[#4a7c5a] text-white"
                            : "bg-[#2d4a3e]/10 text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
                        }`}
                        aria-label={`Choisir ${v}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleTerminer}
                disabled={!allAnswered || saving}
                className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Enregistrement…" : "Terminer"}
              </button>
              {!allAnswered && <p className="text-sm text-[#2d4a3e]/60">Réponds à toutes les formes pour terminer.</p>}
              {saveError && <p className="text-sm text-[#c45a5a]">{saveError}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 rounded-2xl bg-white/95 p-6 shadow-lg">
              <p className="text-lg text-[#2d4a3e]">
                Tu as obtenu <strong>{points}</strong> point{points === 1 ? "" : "s"} sur 10.
              </p>
              <p className="mt-2 text-sm text-[#2d4a3e]/80">
                {points != null && points >= Math.ceil(total * 0.6)
                  ? "Bravo !"
                  : "Tu peux recommencer quand tu veux."}
              </p>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {QUADRILATERES_ITEMS.map((item, i) => {
                const ans = answers[i];
                const ok = ans === item.correctValue;
                return (
                  <li key={item.id} className={`rounded-xl border px-4 py-3 ${ok ? "border-[#4a7c5a]/20 bg-[#a8d5ba]/20" : "border-[#c45a5a]/20 bg-[#f0d0d0]/25"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#2d4a3e]">
                        Forme {i + 1} : {shapeLabel(item.shape)}
                      </span>
                      <span className={`font-semibold ${ok ? "text-[#4a7c5a]" : "text-[#c45a5a]"}`}>
                        {ok ? "✓" : "✗"} {ans ?? "—"} (attendu {item.correctValue})
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/enfant/resultats"
              className="mt-8 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
            >
              Vers mes résultats
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

