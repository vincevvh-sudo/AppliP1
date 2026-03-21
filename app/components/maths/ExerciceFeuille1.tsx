"use client";

import { useState, useCallback } from "react";

const btnClass =
  "min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95";

/** 1. Relier chaque collection à son étiquette. Collections avec 0,1,2,3,4,5 éléments. */
function ExerciceRelier({ onComplete }: { onComplete: () => void }) {
  const counts = [0, 1, 2, 3, 4, 5];
  const [reponses, setReponses] = useState<(number | null)[]>(counts.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback((colIndex: number, num: number) => {
    setReponses((prev) => {
      const next = [...prev];
      next[colIndex] = num;
      return next;
    });
  }, []);

  const allOk = reponses.every((r, i) => r === counts[i]);
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
        1. Relie chaque collection à son étiquette (clique sur le bon nombre).
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {counts.map((count, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 flex-wrap items-center justify-center gap-0.5 rounded-xl border-2 border-[#2d4a3e]/20 bg-[#fef9f3] p-1">
              {Array.from({ length: count }, (_, k) => (
                <span key={k} className="h-2 w-2 rounded-full bg-[#4a7c5a]" />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelect(i, n)}
                  className={btnClass}
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
          <button type="button" onClick={handleValider} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white">
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

/** 2. Dessiner les billes dans chaque sac. Cibles : 5, 3, 2, 1, 4. */
function ExerciceBilles({ onComplete }: { onComplete: () => void }) {
  const cibles = [5, 3, 2, 1, 4];
  const [counts, setCounts] = useState<number[]>(cibles.map(() => 0));
  const [showBravo, setShowBravo] = useState(false);

  const add = useCallback((i: number) => {
    setCounts((prev) => {
      const next = [...prev];
      if (next[i] < 5) next[i]++;
      return next;
    });
  }, []);

  const remove = useCallback((i: number) => {
    setCounts((prev) => {
      const next = [...prev];
      if (next[i] > 0) next[i]--;
      return next;
    });
  }, []);

  const allOk = counts.every((c, i) => c === cibles[i]);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        2. Mets le bon nombre de billes dans chaque sac (clique pour ajouter, clique sur la bille pour enlever).
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {cibles.map((cible, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-center text-2xl font-bold text-[#2d4a3e]">{cible}</div>
            <button
              type="button"
              onClick={() => add(i)}
              className="flex min-h-[80px] min-w-[70px] flex-wrap items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] p-2 transition hover:bg-[#c4a8e8]/20"
            >
              {Array.from({ length: counts[i] }, (_, k) => (
                <span
                  key={k}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); remove(i); } }}
                  className="h-4 w-4 rounded-full bg-[#4a7c5a]"
                />
              ))}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={!allOk} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

/** 3. Barrer les objets en trop. 5→3, 6→5, 3→2. */
function ExerciceBarrer({ onComplete }: { onComplete: () => void }) {
  const config = [
    { total: 5, cible: 3 },
    { total: 6, cible: 5 },
    { total: 3, cible: 2 },
  ];
  const [barres, setBarres] = useState<boolean[][]>(config.map((c) => Array(c.total).fill(false)));
  const [showBravo, setShowBravo] = useState(false);

  const toggle = useCallback((setIndex: number, objIndex: number) => {
    setBarres((prev) => {
      const next = prev.map((s) => [...s]);
      next[setIndex][objIndex] = !next[setIndex][objIndex];
      return next;
    });
  }, []);

  const restants = barres.map((b) => b.filter((x) => !x).length);
  const allOk = config.every((c, i) => restants[i] === c.cible);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        3. Barre les objets en trop pour qu&apos;il en reste le nombre indiqué (clique pour barrer / débarrer).
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-8">
        {config.map((c, setIndex) => (
          <div key={setIndex} className="flex flex-col items-center gap-2">
            <div className="text-lg font-bold text-[#2d4a3e]">Il doit en rester : {c.cible}</div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: c.total }, (_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(setIndex, k)}
                  className={`min-h-[44px] min-w-[44px] rounded-lg border-2 transition ${barres[setIndex][k] ? "border-red-400 bg-red-100 line-through" : "border-[#2d4a3e]/30 bg-[#c4a8e8]/30"}`}
                >
                  ●
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={!allOk} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

/** 4. Compléter les jetons manquants (ten-frames). (5,3), (3,1), (4,2), (2,1) déjà remplis. */
function ExerciceTenFrames({ onComplete }: { onComplete: () => void }) {
  const config = [
    { cible: 5, deja: 3 },
    { cible: 3, deja: 1 },
    { cible: 4, deja: 2 },
    { cible: 2, deja: 1 },
  ];
  const [filled, setFilled] = useState<number[][]>(config.map((c) => Array(c.deja).fill(1).concat(Array(5 - c.deja).fill(0))));
  const [showBravo, setShowBravo] = useState(false);

  const toggle = useCallback((frameIndex: number, cellIndex: number) => {
    setFilled((prev) => {
      const next = prev.map((f) => [...f]);
      next[frameIndex][cellIndex] = next[frameIndex][cellIndex] ? 0 : 1;
      return next;
    });
  }, []);

  const totals = filled.map((f) => f.reduce((a, b) => a + b, 0));
  const allOk = config.every((c, i) => totals[i] === c.cible);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        4. Complète en cliquant pour ajouter les jetons manquants (il faut le nombre indiqué).
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {config.map((c, fi) => (
          <div key={fi} className="flex flex-col items-center gap-2">
            <div className="text-xl font-bold text-[#2d4a3e]">{c.cible}</div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 1, 2, 3, 4].map((ci) => (
                <button
                  key={ci}
                  type="button"
                  onClick={() => toggle(fi, ci)}
                  className="min-h-[40px] min-w-[40px] rounded border-2 border-[#2d4a3e]/30 bg-[#fef9f3] transition hover:bg-[#c4a8e8]/20"
                >
                  {filled[fi][ci] ? <span className="inline-block h-3 w-3 rounded-full bg-[#2d4a3e]" /> : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={!allOk} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

export default function ExerciceFeuille1() {
  const [etape, setEtape] = useState(0);
  return (
    <div className="space-y-8">
      <ExerciceRelier onComplete={() => setEtape(1)} />
      {etape >= 1 && <ExerciceBilles onComplete={() => setEtape(2)} />}
      {etape >= 2 && <ExerciceBarrer onComplete={() => setEtape(3)} />}
      {etape >= 3 && <ExerciceTenFrames onComplete={() => setEtape(4)} />}
      {etape >= 4 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 1.</p>
        </div>
      )}
    </div>
  );
}
