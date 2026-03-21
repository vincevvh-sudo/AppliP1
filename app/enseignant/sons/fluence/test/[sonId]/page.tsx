"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { ForetMagiqueBackground } from "../../../../../components/MiyazakiDecor";
import { getSonById, isConsonne } from "../../../../../data/sons-data";
import { getChronoFluenceItems } from "../../../../../data/eval-data";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function EnseignantFluenceTestSonPage() {
  const params = useParams();
  const sonId = params.sonId as string;
  const son = getSonById(sonId);

  const { items, perLine, lineLengths } = useMemo(() => {
    if (!son) return { items: [] as string[], perLine: undefined as number | undefined, lineLengths: undefined as number[] | undefined };
    return getChronoFluenceItems(son);
  }, [son]);

  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!started || stopped) return;
    const t = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, stopped]);

  const handleStart = useCallback(() => {
    setStarted(true);
    setStopped(false);
    setElapsedSeconds(0);
  }, []);

  const handleStop = useCallback(() => {
    if (started) setStopped(true);
  }, [started]);

  if (!son) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Son introuvable.</p>
          <Link href="/enseignant/sons/fluence" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour à Fluence
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Aucun contenu de fluence pour ce son pour l&apos;instant.</p>
          <Link href="/enseignant/sons/fluence" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour à Fluence
          </Link>
        </div>
      </main>
    );
  }

  const labelType = isConsonne(son) ? "syllabe" : "lettre";
  const grapheme = son.grapheme.split(",")[0].trim();
  /** Voyelle 1, 2, 3 pour o, u, e ; sinon le graphème. */
  const FLUENCE_VOYELLE_LABEL: Record<string, string> = {
    o: "Voyelle 1",
    u: "Voyelle 2",
    e: "Voyelle 3",
  };
  const displayLabel = FLUENCE_VOYELLE_LABEL[son.id] ?? grapheme;

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/enseignant/sons/fluence" className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
                <IconLeaf />
              </span>
              Fluence — {displayLabel}
            </Link>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Test (vue élève)
            </span>
          </div>
          <Link href="/enseignant/sons/fluence" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            ← Retour à Fluence
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-center font-display text-2xl text-[#2d4a3e]">
          Fluence — {displayLabel}
        </h1>
        <p className="mt-1 text-center text-sm text-[#2d4a3e]/75">
          Lecture rapide : {items.length} {labelType}s à lire. Start pour lancer le chrono, Stop pour arrêter.
        </p>

        {!started ? (
          <div className="mt-8 rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-8 text-center">
            <p className="mb-6 text-[#2d4a3e]">
              L&apos;élève lit les {labelType}s à voix haute. Clique sur <strong>Start</strong> pour démarrer le chronomètre, puis sur <strong>Stop</strong> quand il a terminé (ou pour arrêter le chrono).
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
            >
              Start
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-[#fef9f3]/80 px-4 py-4">
              <span className="text-3xl font-mono font-bold text-[#2d4a3e]">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
              </span>
              {stopped && (
                <span className="text-lg font-semibold text-[#4a7c5a]">
                  Lecture terminée — {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              {lineLengths && lineLengths.length > 0 ? (
                (() => {
                  let offset = 0;
                  let cumul = 0;
                  return lineLengths.map((len, lineIndex) => {
                    const lineItems = items.slice(offset, offset + len);
                    cumul += len;
                    const lineNum = cumul;
                    offset += len;
                    return (
                      <div key={lineIndex} className="flex flex-wrap items-center justify-center gap-2">
                        {lineItems.map((item, i) => (
                          <span
                            key={`${lineIndex}-${i}`}
                            className="rounded-lg border-2 border-[#2d4a3e]/20 bg-white/90 px-3 py-2 text-lg font-medium text-[#2d4a3e]"
                          >
                            {item}
                          </span>
                        ))}
                        <span className="ml-1 flex h-8 min-w-[2rem] items-center justify-center rounded bg-[#2d4a3e]/15 text-base font-bold text-[#2d4a3e]" aria-label={`Après cette ligne : ${lineNum} éléments lus`}>
                          {lineNum}
                        </span>
                      </div>
                    );
                  });
                })()
              ) : perLine && perLine > 0 ? (
                Array.from({ length: Math.ceil(items.length / perLine) }, (_, lineIndex) => (
                  <div key={lineIndex} className="flex flex-wrap justify-center gap-2">
                    {items.slice(lineIndex * perLine, lineIndex * perLine + perLine).map((item, index) => (
                      <span
                        key={lineIndex * perLine + index}
                        className="rounded-lg border-2 border-[#2d4a3e]/20 bg-white/90 px-3 py-2 text-lg font-medium text-[#2d4a3e]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {items.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-lg border-2 border-[#2d4a3e]/20 bg-white/90 px-3 py-2 text-lg font-medium text-[#2d4a3e]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-[#fef9f3]/80 px-6 py-6">
              {!stopped ? (
                <p className="text-center text-sm text-[#2d4a3e]/80">Quand tu as fini de lire, clique sur Stop.</p>
              ) : null}
              {!stopped && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="rounded-xl border-2 border-[#c45c4a]/60 bg-white px-8 py-4 text-lg font-bold text-[#c45c4a] shadow-md transition hover:bg-[#c45c4a]/10"
                >
                  Stop
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <Link href="/enseignant/sons/fluence" className="inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]">
            ← Retour à Fluence
          </Link>
        </div>
      </div>
    </main>
  );
}
