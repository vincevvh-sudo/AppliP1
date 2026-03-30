"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";

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
      <div className={`flex flex-wrap items-center justify-center gap-0.5 ${className ?? ""}`} aria-label={`${nombre} points`}>
        {Array.from({ length: nombre }, (_, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#4a7c5a]" />
        ))}
      </div>
    );
  }
  const reste = nombre - 5;
  return (
    <div className={`flex items-center justify-center gap-1 ${className ?? ""}`} aria-label={`${nombre} doigts : 5 et ${reste}`}>
      <MainSprite doigts={5} className="h-14 w-14 min-h-[56px] min-w-[56px]" />
      <MainSprite doigts={reste} className="h-14 w-14 min-h-[56px] min-w-[56px]" />
    </div>
  );
}

function melange610(): number[] {
  const arr = [6, 7, 8, 9, 10];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 1. Compter les points et choisir le bon nombre (6 à 10) en désordre. */
function ExerciceChiffres610({ onComplete, start, end }: { onComplete: () => void; start: number; end: number }) {
  const valeurs = useMemo(() => melange610().map((n) => n + (start - 6)), [start]);
  const [reponses, setReponses] = useState<(number | null)[]>(valeurs.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback((slot: number, n: number) => {
    setReponses((prev) => { const next = [...prev]; next[slot] = n; return next; });
  }, []);

  const allOk = reponses.every((r, i) => r === valeurs[i]);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">1. Compte les points et choisis le bon nombre ({start} à {end}).</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {valeurs.map((v, slot) => (
          <div key={slot} className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 flex-wrap items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] p-1">
              {Array.from({ length: v }, (_, k) => (
                <span key={k} className="h-2 w-2 rounded-full bg-[#4a7c5a]" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
                <button key={n} type="button" onClick={() => handleSelect(slot, n)} className={btnClass} style={{ backgroundColor: reponses[slot] === n ? "#c4a8e8" : undefined }}>{n}</button>
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

/** 2. Entourer le nombre. Valeurs 7, 10, 8, 9, 6 avec 3 options chacune. */
function ExerciceEntourer610({ onComplete, start, end }: { onComplete: () => void; start: number; end: number }) {
  const d = start - 6;
  const valeurs = [7 + d, 10 + d, 8 + d, 9 + d, 6 + d];
  const options: number[][] = [[6 + d, 7 + d, 9 + d], [8 + d, 9 + d, 10 + d], [7 + d, 8 + d, 10 + d], [6 + d, 9 + d, 10 + d], [6 + d, 7 + d, 8 + d]];
  const [reponses, setReponses] = useState<(number | null)[]>(valeurs.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback((i: number, n: number) => {
    setReponses((prev) => { const next = [...prev]; next[i] = n; return next; });
  }, []);

  const allOk = reponses.every((r, i) => r === valeurs[i]);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">2. Compte les doigts et entoure le bon nombre.</h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">Choisis le bon nombre ({start} à {end}) pour chaque case.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {valeurs.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex min-h-[72px] items-center justify-center rounded-xl border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] px-3 py-2">
              <Mains6a10 nombre={v} />
            </div>
            <div className="flex gap-1">
              {options[i].map((n) => (
                <button key={n} type="button" onClick={() => handleSelect(i, n)} className={btnClass} style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}>{n}</button>
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

const NOMBRE_MOUTONS_610 = 30;
const TAILLE_GROUPE = 3;

/** 3. Grouper par trois : 30 moutons → 10 paquets. */
function ExerciceGrouper610({ onComplete, start }: { onComplete: () => void; start: number }) {
  const [groups, setGroups] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reponse, setReponse] = useState<number | null>(null);
  const [showBravo, setShowBravo] = useState(false);
  const correct = NOMBRE_MOUTONS_610 / TAILLE_GROUPE;

  const inAnyGroup = new Set(groups.flat());
  const groupByMinIndex = new Map<number, number[]>(groups.map((g) => [Math.min(...g), g]));

  const toggleSheep = useCallback((i: number) => {
    if (inAnyGroup.has(i)) return;
    setSelected((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= TAILLE_GROUPE) return prev;
      const next = [...prev, i];
      if (next.length === TAILLE_GROUPE) {
        setGroups((g) => [...g, next].sort((a, b) => a[0] - b[0]));
        return [];
      }
      return next;
    });
  }, [groups]);

  const handleValider = useCallback(() => {
    if (reponse === correct) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [reponse, onComplete]);
  const d = start - 6;

  const items: ReactNode[] = [];
  const rendered = new Set<number>();
  for (let i = 0; i < NOMBRE_MOUTONS_610; i++) {
    if (rendered.has(i)) continue;
    const group = groupByMinIndex.get(i);
    if (group) {
      group.forEach((idx) => rendered.add(idx));
      items.push(
        <div key={`g-${group[0]}`} className="inline-flex items-center justify-center rounded-full border-2 border-[#4a7c5a] bg-[#a8d5ba]/20 px-2 py-0.5" aria-label="Paquet de 3 moutons">
          {group.map((idx) => (
            <span key={idx} className="text-xl" role="img" aria-hidden>🐑</span>
          ))}
        </div>
      );
    } else {
      rendered.add(i);
      items.push(
        <button key={i} type="button" onClick={() => toggleSheep(i)} className={`rounded-lg p-0.5 text-xl transition ${selected.includes(i) ? "ring-2 ring-[#4a7c5a] bg-[#a8d5ba]/30" : "hover:bg-[#2d4a3e]/10"}`} aria-label={`Mouton ${i + 1}`}>🐑</button>
      );
    }
  }

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">3. Grouper par trois (30 moutons → combien de paquets de 3 ?).</h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">Clique sur 3 moutons pour faire un paquet.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">{items}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[8 + d, 9 + d, 10 + d, 11 + d].map((n) => (
          <button key={n} type="button" onClick={() => setReponse(n)} className={btnClass} style={{ backgroundColor: reponse === n ? "#c4a8e8" : undefined }}>{n}</button>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={reponse === null} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">{showBravo ? "Bravo !" : "Valider"}</button>
      </div>
    </section>
  );
}

/** 4. Gommettes : 7, 10, 8. */
function ExerciceGommettes610({ onComplete, start }: { onComplete: () => void; start: number }) {
  const d = start - 6;
  const cibles = [7 + d, 10 + d, 8 + d];
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const [showBravo, setShowBravo] = useState(false);

  const add = useCallback((i: number) => {
    setCounts((prev) => { const next = [...prev]; if (next[i] < 20) next[i]++; return next; });
  }, []);
  const remove = useCallback((i: number) => {
    setCounts((prev) => { const next = [...prev]; if (next[i] > 0) next[i]--; return next; });
  }, []);

  const allOk = counts.every((c, i) => c === cibles[i]);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">4. Mets le bon nombre de gommettes dans chaque cercle (7, 10, 8).</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {cibles.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-xl font-bold text-[#2d4a3e]">{c}</div>
            <button type="button" onClick={() => add(i)} className="flex min-h-[100px] min-w-[100px] flex-wrap items-center justify-center gap-0.5 rounded-full border-2 border-[#2d4a3e]/30 bg-[#fef9f3] p-2">
              {Array.from({ length: counts[i] }, (_, k) => (
                <span key={k} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); remove(i); }} className="h-3 w-3 rounded-full bg-[#e8b4d4]" />
              ))}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={!allOk} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">{showBravo ? "Bravo !" : "Valider"}</button>
      </div>
    </section>
  );
}

export default function ExerciceFeuille2_610({ start = 6, end = 10 }: FeuilleRangeProps) {
  const [etape, setEtape] = useState(0);
  return (
    <div className="space-y-8">
      <ExerciceChiffres610 onComplete={() => setEtape(1)} start={start} end={end} />
      {etape >= 1 && <ExerciceEntourer610 onComplete={() => setEtape(2)} start={start} end={end} />}
      {etape >= 2 && <ExerciceGrouper610 onComplete={() => setEtape(3)} start={start} />}
      {etape >= 3 && <ExerciceGommettes610 onComplete={() => setEtape(4)} start={start} />}
      {etape >= 4 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 2 (nombres {start} à {end}).</p>
        </div>
      )}
    </div>
  );
}
