"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getChronoFluenceItems } from "../data/eval-data";
import { isConsonne, type Son } from "../data/sons-data";
import { getFluenceDisplayLabel } from "../data/fluence-partage";

type Props = {
  son: Son;
  /** Texte d’aide avant le Start (enseignant vs élève). */
  intro?: string;
};

export function FluenceLectureView({ son, intro }: Props) {
  const { items, perLine, lineLengths } = useMemo(() => getChronoFluenceItems(son), [son]);
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

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white/90 p-6 text-center text-[#2d4a3e]">
        Aucun contenu de fluence pour ce son pour l&apos;instant.
      </p>
    );
  }

  const labelType = isConsonne(son) ? "syllabe" : "lettre";
  const displayLabel = getFluenceDisplayLabel(son);
  const defaultIntro = `Lis les ${labelType}s à voix haute. Clique sur Start pour démarrer le chronomètre, puis sur Stop quand tu as terminé.`;

  return (
    <div>
      <h1 className="text-center font-display text-2xl text-[#2d4a3e]">Fluence — {displayLabel}</h1>
      <p className="mt-1 text-center text-sm text-[#2d4a3e]/75">
        Lecture rapide : {items.length} {labelType}s à lire. Start pour lancer le chrono, Stop pour arrêter.
      </p>

      {!started ? (
        <div className="mt-8 rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-8 text-center">
          <p className="mb-6 text-[#2d4a3e]">{intro ?? defaultIntro}</p>
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
                Lecture terminée — {Math.floor(elapsedSeconds / 60)}:
                {(elapsedSeconds % 60).toString().padStart(2, "0")}
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
                      <span
                        className="ml-1 flex h-8 min-w-[2rem] items-center justify-center rounded bg-[#2d4a3e]/15 text-base font-bold text-[#2d4a3e]"
                        aria-label={`Après cette ligne : ${lineNum} éléments lus`}
                      >
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
    </div>
  );
}
