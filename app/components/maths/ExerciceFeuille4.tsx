"use client";

import { useState, useCallback } from "react";

/** Positions des points sur une face de dé (grille 3x3 : indices 0-8). 1 à 5 points. */
const DICE_PATTERNS: number[][] = [
  [4], // 1 : centre
  [0, 8], // 2 : coins
  [0, 4, 8], // 3
  [0, 2, 6, 8], // 4
  [0, 2, 4, 6, 8], // 5
];

function FaceDe({ valeur }: { valeur: number }) {
  const indices = DICE_PATTERNS[valeur - 1] ?? [];
  return (
    <div className="grid h-14 w-14 grid-cols-3 grid-rows-3 gap-0.5 rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] p-1">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="flex items-center justify-center">
          {indices.includes(i) ? (
            <span className="h-2 w-2 rounded-full bg-[#2d4a3e]" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Exercice 1 : Écrire le nombre indiqué par chaque face du dé. */
function ExerciceDes({ onComplete }: { onComplete: () => void }) {
  const values = [2, 4, 1, 3, 5];
  const [reponses, setReponses] = useState<(number | null)[]>([null, null, null, null, null]);
  const [showBravo, setShowBravo] = useState(false);

  const handleChange = useCallback((index: number, n: number) => {
    setReponses((prev) => {
      const next = [...prev];
      next[index] = n;
      return next;
    });
  }, []);

  const allOk = reponses.every((r, i) => r === values[i]);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        1. Écris le nombre indiqué par chaque face du dé.
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <FaceDe valeur={v} />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleChange(i, n)}
                  className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95"
                  style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {complete && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleValider}
            className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] active:scale-98"
          >
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

/** Exercice 2 : Colorier le nombre de cases. */
function ExerciceColorier({ onComplete }: { onComplete: () => void }) {
  const config = [4, 3, 5, 1, 2];
  const [colored, setColored] = useState<boolean[][]>(config.map((n) => Array(5).fill(false)));
  const [showBravo, setShowBravo] = useState(false);

  const toggle = useCallback((col: number, row: number) => {
    setColored((prev) => {
      const next = prev.map((c) => [...c]);
      next[col][row] = !next[col][row];
      return next;
    });
  }, []);

  const counts = colored.map((c) => c.filter(Boolean).length);
  const allOk = config.every((n, i) => counts[i] === n);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        2. Colorie le nombre de cases.
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {config.map((n, col) => (
          <div key={col} className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2d4a3e]/20 text-2xl font-bold text-[#2d4a3e]">
              {n}
            </div>
            <div className="flex flex-col gap-1">
              {[0, 1, 2, 3, 4].map((row) => (
                <button
                  key={row}
                  type="button"
                  onClick={() => toggle(col, row)}
                  className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 transition focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95"
                  style={{
                    backgroundColor: colored[col][row] ? "#c4a8e8" : "#fef9f3",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleValider}
          disabled={!allOk}
          className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50 active:scale-98"
        >
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

/** Fruits pour l'exercice 3 : 3 oranges, 2 poires, 1 raisin, 5 bananes, 4 citrons, 2 citrouilles. */
const FRUITS_DATA: { type: string; emoji: string; count: number }[] = [
  { type: "orange", emoji: "🍊", count: 3 },
  { type: "poire", emoji: "🍐", count: 2 },
  { type: "raisin", emoji: "🍇", count: 1 },
  { type: "banane", emoji: "🍌", count: 5 },
  { type: "citron", emoji: "🍋", count: 4 },
  { type: "citrouille", emoji: "🎃", count: 2 },
];

/** Exercice 3 : Compter le nombre de fruits. */
function ExerciceFruits({ onComplete }: { onComplete: () => void }) {
  const [reponses, setReponses] = useState<(number | null)[]>(FRUITS_DATA.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleChange = useCallback((index: number, n: number) => {
    setReponses((prev) => {
      const next = [...prev];
      next[index] = n;
      return next;
    });
  }, []);

  const allOk = reponses.every((r, i) => r === FRUITS_DATA[i].count);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        3. Compte le nombre de chaque fruit et écris le nombre.
      </h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Regarde l&apos;image ci-dessous : compte combien il y a de chaque fruit, puis choisis le bon nombre à droite.
      </p>
      <div className="mt-4 rounded-xl border-2 border-[#4a7c5a]/30 bg-[#fef9f3] p-4">
        <p className="mb-3 text-sm font-medium text-[#2d4a3e]/80">Image à compter :</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {FRUITS_DATA.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-2xl" aria-label={`${f.count} ${f.type}`}>
              {Array.from({ length: f.count }, (_, k) => (
                <span key={k} role="img">{f.emoji}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-[#2d4a3e]/70">Maintenant écris combien tu en as compté pour chaque fruit :</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {FRUITS_DATA.map((f, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border-2 border-[#2d4a3e]/20 bg-[#fef9f3] p-3">
            <span className="text-3xl" role="img" aria-label={f.type}>
              {f.emoji}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleChange(i, n)}
                  className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-white text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/20 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95"
                  style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {complete && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleValider}
            className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] active:scale-98"
          >
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

export default function ExerciceFeuille4() {
  const [etape, setEtape] = useState(0);

  return (
    <div className="space-y-8">
      <ExerciceDes onComplete={() => setEtape(1)} />
      {etape >= 1 && <ExerciceColorier onComplete={() => setEtape(2)} />}
      {etape >= 2 && <ExerciceFruits onComplete={() => setEtape(3)} />}
      {etape >= 3 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 4.</p>
        </div>
      )}
    </div>
  );
}
