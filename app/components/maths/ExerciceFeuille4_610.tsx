"use client";

import { useState, useCallback } from "react";

const btnClass =
  "min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95";

type FeuilleRangeProps = { start?: number; end?: number };

/** Positions dans l’image sprite mains 1-5 (réutilisée pour 6-10 = main 5 + main 1..5). */
const MAIN_SPRITE_POSITIONS: Record<number, string> = {
  1: "0% 0%",
  2: "50% 0%",
  3: "100% 0%",
  4: "25% 100%",
  5: "75% 100%",
};

function MainSprite({ doigts, className = "h-16 w-16" }: { doigts: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: "url(/images/mains-1-5.png)",
        backgroundSize: "300% 200%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: MAIN_SPRITE_POSITIONS[doigts],
      }}
      aria-hidden
    />
  );
}

/** Pour 6 à 10 : toujours la main 5 + la main du reste (5+1, 5+2, … 5+5). */
function Mains6a10({ nombre, className }: { nombre: number; className?: string }) {
  if (nombre > 10) {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-0.5 ${className ?? ""}`}
        aria-label={`${nombre} points`}
      >
        {Array.from({ length: nombre }, (_, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#4a7c5a]" />
        ))}
      </div>
    );
  }
  const reste = nombre - 5;
  return (
    <div
      className={`flex items-center justify-center gap-1 ${className ?? ""}`}
      aria-label={`${nombre} doigts : 5 et ${reste}`}
    >
      <MainSprite doigts={5} className="h-14 w-14 min-h-[56px] min-w-[56px]" />
      <MainSprite doigts={reste} className="h-14 w-14 min-h-[56px] min-w-[56px]" />
    </div>
  );
}

/** 1. Compter les doigts (6 à 10) et choisir le bon nombre. */
function ExerciceNombre610({ onComplete, start, end }: { onComplete: () => void; start: number; end: number }) {
  const d = start - 6;
  const values = [8, 6, 10, 7, 9].map((n) => n + d);
  const [reponses, setReponses] = useState<(number | null)[]>(values.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleChange = useCallback((index: number, n: number) => {
    setReponses((prev) => { const next = [...prev]; next[index] = n; return next; });
  }, []);

  const allOk = reponses.every((r, i) => r === values[i]);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        1. Compte et choisis le bon nombre ({start} à {end}).
      </h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex min-h-[80px] min-w-[80px] items-center justify-center rounded-xl border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] px-3 py-2">
              <Mains6a10 nombre={v} />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
                <button key={n} type="button" onClick={() => handleChange(i, n)} className={btnClass} style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {complete && (
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={handleValider} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white">{showBravo ? "Bravo !" : "Valider"}</button>
        </div>
      )}
    </section>
  );
}

/** 2. Colorier le nombre de cases (6 à 10). Grille de 10 cases. */
function ExerciceColorier610({ onComplete, start, end }: { onComplete: () => void; start: number; end: number }) {
  const d = start - 6;
  const config = [8 + d, 7 + d, 10 + d, 6 + d, 9 + d];
  const [colored, setColored] = useState<boolean[][]>(config.map(() => Array(10).fill(false)));
  const [showBravo, setShowBravo] = useState(false);

  const toggle = useCallback((col: number, row: number) => {
    setColored((prev) => { const next = prev.map((c) => [...c]); next[col][row] = !next[col][row]; return next; });
  }, []);

  const counts = colored.map((c) => c.filter(Boolean).length);
  const allOk = config.every((n, i) => counts[i] === n);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">2. Colorie le nombre de cases ({start} à {end}).</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {config.map((n, col) => (
          <div key={col} className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2d4a3e]/20 text-xl font-bold text-[#2d4a3e]">{n}</div>
            <div className="grid grid-cols-5 gap-0.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                <button key={row} type="button" onClick={() => toggle(col, row)} className="min-h-[36px] min-w-[36px] rounded border-2 border-[#2d4a3e]/30 transition focus:outline-none focus:ring-2 focus:ring-[#c4a8e8]" style={{ backgroundColor: colored[col][row] ? "#c4a8e8" : "#fef9f3" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={!allOk} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">{showBravo ? "Bravo !" : "Valider"}</button>
      </div>
    </section>
  );
}

const FRUITS_DATA_610: { type: string; emoji: string; count: number }[] = [
  { type: "orange", emoji: "🍊", count: 8 },
  { type: "poire", emoji: "🍐", count: 7 },
  { type: "raisin", emoji: "🍇", count: 9 },
  { type: "banane", emoji: "🍌", count: 10 },
  { type: "citron", emoji: "🍋", count: 6 },
  { type: "citrouille", emoji: "🎃", count: 8 },
];

/** 3. Compter les fruits (6 à 10). */
function ExerciceFruits610({ onComplete, start, end }: { onComplete: () => void; start: number; end: number }) {
  const d = start - 6;
  const fruits = FRUITS_DATA_610.map((f) => ({ ...f, count: f.count + d }));
  const [reponses, setReponses] = useState<(number | null)[]>(FRUITS_DATA_610.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleChange = useCallback((index: number, n: number) => {
    setReponses((prev) => { const next = [...prev]; next[index] = n; return next; });
  }, []);

  const allOk = reponses.every((r, i) => r === fruits[i].count);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">3. Compte le nombre de chaque fruit et écris le nombre ({start} à {end}).</h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">Regarde l&apos;image ci-dessous, compte chaque fruit, puis choisis le bon nombre.</p>
      <div className="mt-4 rounded-xl border-2 border-[#4a7c5a]/30 bg-[#fef9f3] p-4">
        <p className="mb-3 text-sm font-medium text-[#2d4a3e]/80">Image à compter :</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {fruits.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-0.5 text-xl" aria-label={`${f.count} ${f.type}`}>
              {Array.from({ length: Math.min(f.count, 10) }, (_, k) => (
                <span key={k} role="img">{f.emoji}</span>
              ))}
              {f.count > 10 && <span className="text-sm">+{f.count - 10}</span>}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-[#2d4a3e]/70">Écris combien tu as compté pour chaque fruit :</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {fruits.map((f, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border-2 border-[#2d4a3e]/20 bg-[#fef9f3] p-3">
            <span className="text-2xl" role="img" aria-label={f.type}>{f.emoji}</span>
            <div className="flex gap-1">
              {Array.from({ length: end - start + 1 }, (_, idx) => start + idx).map((n) => (
                <button key={n} type="button" onClick={() => handleChange(i, n)} className={btnClass} style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {complete && (
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={handleValider} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white">{showBravo ? "Bravo !" : "Valider"}</button>
        </div>
      )}
    </section>
  );
}

export default function ExerciceFeuille4_610({ start = 6, end = 10 }: FeuilleRangeProps) {
  const [etape, setEtape] = useState(0);
  return (
    <div className="space-y-8">
      <ExerciceNombre610 onComplete={() => setEtape(1)} start={start} end={end} />
      {etape >= 1 && <ExerciceColorier610 onComplete={() => setEtape(2)} start={start} end={end} />}
      {etape >= 2 && <ExerciceFruits610 onComplete={() => setEtape(3)} start={start} end={end} />}
      {etape >= 3 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 4 (nombres {start} à {end}).</p>
        </div>
      )}
    </div>
  );
}
