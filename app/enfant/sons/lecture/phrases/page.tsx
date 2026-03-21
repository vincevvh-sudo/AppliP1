"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../../components/MiyazakiDecor";
import {
  TITRE_LECTURE_PHRASES,
  QUESTIONS_LECTURE_PHRASES,
  PhraseConstructionSegment,
} from "../../../../data/lecture-phrases";

type SegmentWithIndex = PhraseConstructionSegment & { index: number };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function EnfantLecturePhrasesPage() {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<number[]>([]);
  const [validated, setValidated] = useState(false);

  const question = QUESTIONS_LECTURE_PHRASES[step];
  const total = QUESTIONS_LECTURE_PHRASES.length;
  const isLast = step === total - 1;

  const shuffledSegments: SegmentWithIndex[] = useMemo(
    () =>
      shuffle(
        question.segments.map((seg, idx) => ({
          ...seg,
          index: idx,
        }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id]
  );

  const expectedOrder = question.segments.map((_, idx) => idx);

  const handleChoose = (segIndex: number) => {
    if (validated) return;
    if (chosen.includes(segIndex)) return;
    if (chosen.length >= question.segments.length) return;
    setChosen((prev) => [...prev, segIndex]);
  };

  const handleRemoveLast = () => {
    if (validated) return;
    setChosen((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setChosen([]);
    setValidated(false);
  };

  const handleValidate = () => {
    if (chosen.length !== question.segments.length) return;
    setValidated(true);
  };

  const isCorrect =
    validated &&
    chosen.length === expectedOrder.length &&
    chosen.every((c, idx) => c === expectedOrder[idx]);

  const goNext = () => {
    if (!isLast) {
      setStep((s) => s + 1);
      setChosen([]);
      setValidated(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_LECTURE_PHRASES}</span>
          <Link
            href="/enfant/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-8">
        <p className="mb-6 text-sm text-[#2d4a3e]/80">
          Remets les parties de la phrase dans l&apos;ordre. Utilise la majuscule du début et le point à la fin pour
          t&apos;aider.
        </p>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2 shadow">
          <span className="text-sm font-medium text-[#2d4a3e]/80">
            Phrase {step + 1} / {total}
          </span>
        </div>

        <div className="rounded-2xl bg-white/95 p-6 shadow-lg">
          <h2 className="font-display text-lg text-[#2d4a3e] mb-3">Ta phrase</h2>
          <div className="flex flex-wrap gap-2 rounded-xl border-2 border-dashed border-[#2d4a3e]/25 bg-[#fef9f3] px-4 py-4">
            {question.segments.map((seg, slotIndex) => {
              const chosenIndex = chosen[slotIndex];
              const chosenSeg =
                typeof chosenIndex === "number"
                  ? shuffledSegments.find((s) => s.index === chosenIndex)
                  : undefined;
              return (
                <div
                  key={slotIndex}
                  className="min-h-[3rem] min-w-[5rem] rounded-xl border-2 border-[#2d4a3e]/25 bg-white/80 px-3 py-2"
                >
                  <p className="text-base font-semibold text-[#2d4a3e]">
                    {chosenSeg ? chosenSeg.text : "…"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {shuffledSegments.map((seg) => {
              const alreadyChosen = chosen.includes(seg.index);
              return (
                <button
                  key={seg.id}
                  type="button"
                  disabled={alreadyChosen || validated}
                  onClick={() => handleChoose(seg.index)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                    alreadyChosen || validated
                      ? "border-[#2d4a3e]/10 bg-[#2d4a3e]/5 text-[#2d4a3e]/50"
                      : "border-[#2d4a3e]/20 bg-white text-[#2d4a3e] hover:border-[#4a7c5a]/60"
                  }`}
                >
                  {seg.text}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRemoveLast}
                disabled={chosen.length === 0 || validated}
                className="rounded-xl bg-[#2d4a3e]/5 px-4 py-2 text-xs font-medium text-[#2d4a3e] disabled:opacity-40"
              >
                Effacer le dernier
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={chosen.length === 0 && !validated}
                className="rounded-xl bg-[#2d4a3e]/5 px-4 py-2 text-xs font-medium text-[#2d4a3e] disabled:opacity-40"
              >
                Recommencer
              </button>
            </div>

            {!validated ? (
              <button
                type="button"
                onClick={handleValidate}
                disabled={chosen.length !== question.segments.length}
                className="rounded-xl bg-[#4a7c5a] px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Valider la phrase
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    isCorrect ? "text-[#4a7c5a]" : "text-[#c45a5a]"
                  }`}
                >
                  {isCorrect ? "Bravo, la phrase est correcte !" : "Ce n'est pas tout à fait ça. Regarde bien la phrase."}
                </span>
                {!isLast && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-[#4a7c5a] px-5 py-2 text-sm font-semibold text-white"
                  >
                    Phrase suivante →
                  </button>
                )}
                {isLast && (
                  <Link
                    href="/enfant/evaluations"
                    className="rounded-xl bg-[#4a7c5a] px-5 py-2 text-sm font-semibold text-white"
                  >
                    Terminer
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

