"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { moduleEstAccessiblePourEleve } from "../../../data/maths-modules-partages-storage";
import { getEnfantSession } from "../../../../utils/enfant-session";
import {
  TITRE_SUITE_LOGIQUE,
  ITEMS_SUITE_LOGIQUE,
  type ShapeId,
  type ItemSuiteLogique,
} from "../../../data/suite-logique";

function ShapeIcon({ id, className = "h-10 w-10" }: { id: ShapeId; className?: string }) {
  switch (id) {
    case "star":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "square":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      );
    case "circle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "triangle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
    case "arrowUp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 14l5-5 5 5H7z" />
        </svg>
      );
    case "arrowDown":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M15 17l-5-5 5-5v10z" />
        </svg>
      );
    case "diamond":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case "oval":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <ellipse cx="12" cy="12" rx="10" ry="6" />
        </svg>
      );
    case "rectVert":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="7" y="2" width="10" height="20" rx="1" />
        </svg>
      );
    case "plus":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" aria-hidden>
          <path strokeWidth="2" d="M12 5v14M5 12h14" />
        </svg>
      );
    default:
      return null;
  }
}

const GLACE_EMOJIS = ["🍦", "🍨", "🍧"] as const;

function GlaceGroupe({ variant }: { variant: number }) {
  const emoji = GLACE_EMOJIS[variant % 3] ?? "🍦";
  const bg = ["bg-amber-100", "bg-pink-100", "bg-sky-100"][variant % 3] ?? "bg-gray-100";
  return (
    <span className={`inline-flex gap-0.5 rounded px-1.5 py-1 ${bg}`} title="Groupe de 3 glaces">
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <span className="text-xl sm:text-2xl">{emoji}</span>
      <span className="text-xl sm:text-2xl">{emoji}</span>
    </span>
  );
}

export default function EnfantSuiteLogiquePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>(ITEMS_SUITE_LOGIQUE.map(() => null));
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    const s = getEnfantSession();
    if (!s) {
      router.replace("/enfant");
      setAllowed(false);
      return;
    }
    void moduleEstAccessiblePourEleve("suite-logique", s.id).then((ok) => {
      if (!ok) {
        router.replace("/enfant/maths/exercice/traitement-donnees");
        setAllowed(false);
      } else {
        setAllowed(true);
      }
    });
  }, [router]);

  const item = ITEMS_SUITE_LOGIQUE[step] as ItemSuiteLogique;
  const total = ITEMS_SUITE_LOGIQUE.length;
  const isLast = step === total - 1;

  const setReponse = (index: number) => {
    if (reponses[step] !== null) return;
    setReponses((prev) => {
      const next = [...prev];
      next[step] = index;
      return next;
    });
  };

  const handleSuivant = () => {
    if (isLast) setTermine(true);
    else setStep((s) => s + 1);
  };

  const score = termine
    ? reponses.reduce<number>((acc, r, i) => {
        const it = ITEMS_SUITE_LOGIQUE[i] as ItemSuiteLogique;
        const correct = (it as { correctIndex: number }).correctIndex;
        return acc + (r === correct ? 1 : 0);
      }, 0)
    : null;

  if (allowed !== true) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-12 text-center text-[#2d4a3e]/80">
          {allowed === null ? <p>Chargement…</p> : <p>Redirection…</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_SUITE_LOGIQUE}</span>
          <Link
            href="/enfant/maths/evaluation/traitement-donnees"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-8">
        <p className="mb-6 text-sm text-[#2d4a3e]/80">
          Regarde la suite, puis clique sur la forme ou le dessin qui doit venir à la fin.
        </p>

        {!termine ? (
          <>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2 shadow">
              <span className="text-sm font-medium text-[#2d4a3e]/80">
                Question {step + 1} / {total}
              </span>
              <div className="flex gap-1">
                {ITEMS_SUITE_LOGIQUE.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    className={`h-2 w-2 rounded-full transition sm:h-2.5 sm:w-2.5 ${i === step ? "bg-[#c4a8e8]" : reponses[i] !== null ? "bg-[#c4a8e8]/50" : "bg-[#2d4a3e]/20"}`}
                    aria-label={`Question ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-lg sm:p-6">
              <p className="mb-4 font-medium text-[#2d4a3e]">Entoure la forme qui continue la suite.</p>

              {item.type === "formes" && (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {item.sequence.map((s, i) => (
                      <span key={i} className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#2d4a3e]/20 bg-[#fef9f3]">
                        <ShapeIcon id={s} className="h-8 w-8" />
                      </span>
                    ))}
                    <span className="text-[#2d4a3e]/50">→ ?</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {item.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReponse(i)}
                        className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 transition ${
                          reponses[step] === i ? "border-[#c4a8e8] bg-[#c4a8e8]/30" : "border-[#2d4a3e]/25 bg-white hover:border-[#c4a8e8]/50"
                        }`}
                      >
                        <ShapeIcon id={opt} className="h-10 w-10" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {item.type === "glaces" && (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {item.sequence.map((v, i) => (
                      <span key={i} className="rounded border border-[#2d4a3e]/20 bg-[#fef9f3] px-2 py-1">
                        <GlaceGroupe variant={v} />
                      </span>
                    ))}
                    <span className="text-[#2d4a3e]/50">→ ?</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[0, 1, 2].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setReponse(v)}
                        className={`rounded-xl border-2 p-3 transition ${
                          reponses[step] === v ? "border-[#c4a8e8] bg-[#c4a8e8]/30" : "border-[#2d4a3e]/25 bg-white hover:border-[#c4a8e8]/50"
                        }`}
                      >
                        <GlaceGroupe variant={v} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {item.type === "rectangle" && (
                <>
                  <p className="mb-2 text-sm text-[#2d4a3e]/70">Dessine le dernier élément de la suite.</p>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {["top-right", "bottom-left", "top-right", "bottom-left", "top-right", "bottom-left"].map((pos, i) => (
                      <div key={i} className="relative h-14 w-20 rounded border-2 border-[#2d4a3e] bg-[#fef9f3]">
                        <span
                          className="absolute h-4 w-4 rounded-full bg-[#4a7c5a]"
                          style={pos === "bottom-left" ? { bottom: 4, left: 4 } : { top: 4, right: 4 }}
                        />
                      </div>
                    ))}
                    <span className="text-[#2d4a3e]/50">→ ?</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { ball: "bottom-left" as const },
                      { ball: "top-right" as const },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReponse(i)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                          reponses[step] === i ? "border-[#c4a8e8] bg-[#c4a8e8]/30" : "border-[#2d4a3e]/25 bg-white hover:border-[#c4a8e8]/50"
                        }`}
                      >
                        <div className="relative h-20 w-28 rounded border-2 border-[#2d4a3e] bg-[#fef9f3]">
                          <span
                            className="absolute h-6 w-6 rounded-full bg-[#4a7c5a]"
                            style={
                              opt.ball === "bottom-left"
                                ? { bottom: 4, left: 4 }
                                : { top: 4, right: 4 }
                            }
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {item.type === "cercle" && (
                <>
                  <p className="mb-2 text-sm text-[#2d4a3e]/70">Dessine le dernier élément de la suite.</p>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {[0, 1, 2, 0, 1, 2].map((linesCount, i) => (
                      <div key={i} className="flex h-14 w-14 items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-full w-full text-[#4a7c5a]">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                          {linesCount === 1 && <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />}
                          {linesCount === 2 && (
                            <>
                              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
                              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
                            </>
                          )}
                        </svg>
                      </div>
                    ))}
                    <span className="text-[#2d4a3e]/50">→ ?</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { lines: false },
                      { lines: true },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReponse(i)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                          reponses[step] === i ? "border-[#c4a8e8] bg-[#c4a8e8]/30" : "border-[#2d4a3e]/25 bg-white hover:border-[#c4a8e8]/50"
                        }`}
                      >
                        <div className="relative h-20 w-20">
                          <svg viewBox="0 0 24 24" className="h-full w-full text-[#2d4a3e]">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            {opt.lines && (
                              <>
                                <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
                                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
                                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" />
                                <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" />
                              </>
                            )}
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {item.type === "smiley" && (
                <>
                  <p className="mb-2 text-sm text-[#2d4a3e]/70">Dessine le dernier élément de la suite.</p>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {["down", "right", "up", "down", "right", "up"].map((dir, i) => (
                      <svg key={i} viewBox="0 0 24 24" className="h-14 w-14 text-[#2d4a3e]">
                        <circle cx="12" cy="12" r="10" fill="#f5c542" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="9" cy="10" r="1.5" fill="#2d4a3e" />
                        <circle cx="15" cy="10" r="1.5" fill="#2d4a3e" />
                        {dir === "down" && <path d="M9 15 Q12 11 15 15" fill="none" stroke="#2d4a3e" strokeWidth="1.5" strokeLinecap="round" />}
                        {dir === "up" && <path d="M9 9 Q12 13 15 9" fill="none" stroke="#2d4a3e" strokeWidth="1.5" strokeLinecap="round" />}
                        {dir === "right" && <path d="M8 14 Q12 18 16 14" fill="none" stroke="#2d4a3e" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 12 12)" />}
                      </svg>
                    ))}
                    <span className="text-[#2d4a3e]/50">→ ?</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { smile: "left" as const },
                      { smile: "down" as const },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReponse(i)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                          reponses[step] === i ? "border-[#c4a8e8] bg-[#c4a8e8]/30" : "border-[#2d4a3e]/25 bg-white hover:border-[#c4a8e8]/50"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="h-20 w-20 text-[#2d4a3e]">
                          <circle cx="12" cy="12" r="10" fill="#f5c542" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="9" cy="10" r="1.5" fill="#2d4a3e" />
                          <circle cx="15" cy="10" r="1.5" fill="#2d4a3e" />
                          {opt.smile === "left" ? (
                            <path d="M8 14 Q12 18 16 14" fill="none" stroke="#2d4a3e" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 12 12)" />
                          ) : (
                            <path d="M9 15 Q12 11 15 15" fill="none" stroke="#2d4a3e" strokeWidth="1.5" strokeLinecap="round" />
                          )}
                        </svg>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-xl bg-[#2d4a3e]/10 px-5 py-2 font-medium text-[#2d4a3e] disabled:opacity-40"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={handleSuivant}
                  disabled={reponses[step] === null}
                  className="rounded-xl bg-[#c4a8e8] px-6 py-2 font-semibold text-[#2d4a3e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLast ? "Terminer" : "Suivant →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-[#c4a8e8]/20 p-6 text-center">
            <p className="font-display text-xl text-[#2d4a3e]">Bravo !</p>
            <p className="mt-2 text-2xl font-bold text-[#2d4a3e]">{score} / {total}</p>
            <Link
              href="/enfant/maths/evaluation/traitement-donnees"
              className="mt-6 inline-block rounded-xl bg-[#c4a8e8] px-6 py-3 font-semibold text-[#2d4a3e]"
            >
              ← Retour
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
