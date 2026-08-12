"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChronoFluenceItems } from "../data/eval-data";
import { isConsonne, type Son } from "../data/sons-data";
import { getFluenceDisplayLabel } from "../data/fluence-partage";

export type FluenceEssaiResult = {
  points: number;
  pointsMax: number;
  dureeSecondes: number;
};

type Props = {
  son: Son;
  /** Texte d’aide avant le Start (enseignant vs élève). */
  intro?: string;
  /**
   * practice = aperçu enseignant (sans score enregistré).
   * record = élève : 1 minute, clic sur le dernier item, essai enregistré, possibilité de recommencer.
   */
  mode?: "practice" | "record";
  /** Meilleur score déjà réalisé (affiché pour motiver à battre le record). */
  meilleurScore?: number | null;
  /** Appelé quand l’élève a cliqué le dernier item lu (mode record). */
  onEssaiTermine?: (result: FluenceEssaiResult) => Promise<void>;
};

export function FluenceLectureView({
  son,
  intro,
  mode = "practice",
  meilleurScore = null,
  onEssaiTermine,
}: Props) {
  const { items, perLine, lineLengths } = useMemo(() => getChronoFluenceItems(son), [son]);
  const isRecord = mode === "record";

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recordLocalBest, setRecordLocalBest] = useState<number | null>(meilleurScore);
  const dureeSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    setRecordLocalBest(meilleurScore);
  }, [meilleurScore]);

  useEffect(() => {
    if (!started || finished) return;
    if (isRecord) {
      const t = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setFinished(true);
            dureeSecondsRef.current = 60;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
    const t = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished, isRecord]);

  const resetRun = useCallback(() => {
    setStarted(false);
    setFinished(false);
    setTimeLeft(60);
    setElapsedSeconds(0);
    setScore(null);
    setSaving(false);
    setSaveError(null);
    dureeSecondsRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    setFinished(false);
    setTimeLeft(60);
    setElapsedSeconds(0);
    setScore(null);
    setSaveError(null);
    dureeSecondsRef.current = null;
  }, []);

  const handleStop = useCallback(() => {
    if (!started || finished) return;
    setFinished(true);
    if (isRecord) {
      dureeSecondsRef.current = 60 - timeLeft;
    }
  }, [started, finished, isRecord, timeLeft]);

  const handleClickItem = useCallback(
    async (index: number) => {
      if (!isRecord || !finished || score !== null || saving) return;
      const points = index + 1;
      const pointsMax = items.length;
      const duree = dureeSecondsRef.current ?? 60;
      setScore(points);
      setSaving(true);
      setSaveError(null);
      try {
        if (onEssaiTermine) {
          await onEssaiTermine({ points, pointsMax, dureeSecondes: duree });
        }
        setRecordLocalBest((prev) => (prev == null ? points : Math.max(prev, points)));
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Erreur enregistrement");
      } finally {
        setSaving(false);
      }
    },
    [isRecord, finished, score, saving, items.length, onEssaiTermine]
  );

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white/90 p-6 text-center text-[#2d4a3e]">
        Aucun contenu de fluence pour ce son pour l&apos;instant.
      </p>
    );
  }

  const labelType = isConsonne(son) ? "syllabe" : "lettre";
  const displayLabel = getFluenceDisplayLabel(son);
  const defaultIntro = isRecord
    ? `Lis les ${labelType}s à voix haute pendant 1 minute. Quand le chrono s’arrête (ou quand tu cliques Stop), clique sur la dernière ${labelType} que tu as lue. Tu pourras recommencer pour battre ton record.`
    : `Lis les ${labelType}s à voix haute. Clique sur Start pour démarrer le chronomètre, puis sur Stop quand tu as terminé.`;

  const timerDisplay = isRecord
    ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
    : `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const renderItems = (clickable: boolean) => {
    const renderItem = (item: string, index: number) => {
      const className = `rounded-lg border-2 px-3 py-2 text-lg font-medium transition ${
        score !== null && index < score
          ? "border-[#4a7c5a] bg-[#a8d5ba]/50 text-[#2d4a3e]"
          : score !== null && index === score - 1
            ? "border-[#4a7c5a] bg-[#4a7c5a] text-white"
            : clickable
              ? "cursor-pointer border-[#2d4a3e]/30 bg-white text-[#2d4a3e] hover:bg-[#a8d5ba]/30"
              : "border-[#2d4a3e]/20 bg-white/90 text-[#2d4a3e]"
      }`;
      if (clickable) {
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClickItem(index)}
            disabled={score !== null || saving}
            className={className}
          >
            {item}
          </button>
        );
      }
      return (
        <span key={index} className={className}>
          {item}
        </span>
      );
    };

    if (lineLengths && lineLengths.length > 0) {
      let offset = 0;
      let cumul = 0;
      return lineLengths.map((len, lineIndex) => {
        const lineItems = items.slice(offset, offset + len);
        cumul += len;
        const lineNum = cumul;
        const startIndex = offset;
        offset += len;
        return (
          <div key={lineIndex} className="flex flex-wrap items-center justify-center gap-2">
            {lineItems.map((item, i) => renderItem(item, startIndex + i))}
            <span
              className="ml-1 flex h-8 min-w-[2rem] items-center justify-center rounded bg-[#2d4a3e]/15 text-base font-bold text-[#2d4a3e]"
              aria-label={`Après cette ligne : ${lineNum} éléments lus`}
            >
              {lineNum}
            </span>
          </div>
        );
      });
    }

    if (perLine && perLine > 0) {
      return Array.from({ length: Math.ceil(items.length / perLine) }, (_, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap justify-center gap-2">
          {items
            .slice(lineIndex * perLine, lineIndex * perLine + perLine)
            .map((item, i) => renderItem(item, lineIndex * perLine + i))}
        </div>
      ));
    }

    return <div className="flex flex-wrap justify-center gap-2">{items.map((item, index) => renderItem(item, index))}</div>;
  };

  return (
    <div>
      <h1 className="text-center font-display text-2xl text-[#2d4a3e]">Fluence — {displayLabel}</h1>
      <p className="mt-1 text-center text-sm text-[#2d4a3e]/75">
        {isRecord
          ? `Lecture rapide : 1 minute — ${items.length} ${labelType}s. Clique sur la dernière ${labelType} lue à la fin.`
          : `Lecture rapide : ${items.length} ${labelType}s à lire. Start pour lancer le chrono, Stop pour arrêter.`}
      </p>

      {isRecord && recordLocalBest != null && recordLocalBest > 0 && (
        <p className="mt-3 text-center text-sm font-semibold text-[#4a7c5a]">
          Ton record : {recordLocalBest} {labelType}
          {recordLocalBest > 1 ? "s" : ""}
        </p>
      )}

      {!started ? (
        <div className="mt-8 rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-8 text-center">
          <p className="mb-6 text-[#2d4a3e]">{intro ?? defaultIntro}</p>
          <button
            type="button"
            onClick={handleStart}
            className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
          >
            {isRecord ? "Démarrer (1 minute)" : "Start"}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-[#fef9f3]/80 px-4 py-4">
            <span className="text-3xl font-mono font-bold text-[#2d4a3e]">{timerDisplay}</span>
            {!finished && (
              <button
                type="button"
                onClick={handleStop}
                className="rounded-xl border-2 border-[#c45c4a]/60 bg-white px-8 py-3 text-lg font-bold text-[#c45c4a] shadow-md transition hover:bg-[#c45c4a]/10"
              >
                Stop
              </button>
            )}
            {finished && isRecord && score === null && (
              <span className="text-lg font-semibold text-[#4a7c5a]">
                C&apos;est fini ! Clique sur la dernière {labelType} que tu as lue.
              </span>
            )}
            {finished && !isRecord && (
              <span className="text-lg font-semibold text-[#4a7c5a]">
                Lecture terminée — {timerDisplay}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            {renderItems(isRecord && finished && score === null)}
          </div>

          {score !== null && (
            <div className="mt-8 space-y-4 rounded-xl bg-[#fef9f3]/80 px-6 py-6 text-center">
              <p className="text-lg font-semibold text-[#4a7c5a]">
                Résultat : {score} {labelType}
                {score > 1 ? "s" : ""} lu
                {score > 1 ? "s" : ""}
                {dureeSecondsRef.current != null && dureeSecondsRef.current < 60
                  ? ` en ${dureeSecondsRef.current} s`
                  : " en 1 minute"}
                .
              </p>
              {saving && <p className="text-sm text-[#2d4a3e]/70">Enregistrement…</p>}
              {saveError && <p className="text-sm text-[#c45c4a]">{saveError}</p>}
              {!saving && !saveError && (
                <p className="text-sm text-[#2d4a3e]/80">Essai enregistré pour ton enseignant.</p>
              )}
              <button
                type="button"
                onClick={resetRun}
                disabled={saving}
                className="rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
              >
                Réessayer pour battre ton record
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
