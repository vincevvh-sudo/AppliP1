"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";

const btnClass =
  "min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95";

/** Positions dans l’image sprite (3 en haut ; 2 en bas, centrées chacune dans sa moitié). */
const MAIN_SPRITE_POSITIONS: Record<number, string> = {
  1: "0% 0%",
  2: "50% 0%",
  3: "100% 0%",
  4: "25% 100%",   /* main 4 : centre de la moitié gauche du bas */
  5: "75% 100%",   /* main 5 : centre de la moitié droite du bas */
};

/** Affiche une des 5 mains depuis l’image sprite (1 à 5 doigts). */
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

/** Mélange Fisher-Yates pour un ordre désordonné fixe (sans 0, on utilise 1 à 5). */
function melangeDoigts(): number[] {
  const arr = [1, 2, 3, 4, 5];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 1. Compte les doigts : une main avec 1 à 5 doigts (ordre désordonné), cliquer sur le bon nombre. */
function ExerciceChiffres({ onComplete }: { onComplete: () => void }) {
  const valeursDoigts = useMemo(() => melangeDoigts(), []); // 5 cases en désordre
  const [reponses, setReponses] = useState<(number | null)[]>(valeursDoigts.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback((slot: number, n: number) => {
    setReponses((prev) => {
      const next = [...prev];
      next[slot] = n;
      return next;
    });
  }, []);

  const allOk = reponses.every((r, i) => r === valeursDoigts[i]);
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
        1. Compte les doigts et clique sur le bon nombre.
      </h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">Chaque main montre un nombre de doigts. Choisis le bon chiffre pour chaque main.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {valeursDoigts.map((nbDoigts, slot) => (
          <div key={slot} className="flex flex-col items-center gap-2">
            <div className="rounded-xl border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] px-4 py-3 flex items-center justify-center min-h-[80px]" aria-label={`${nbDoigts} doigt${nbDoigts > 1 ? "s" : ""}`}>
              <MainSprite doigts={nbDoigts} className="h-16 w-16 min-h-[64px] min-w-[64px]" />
            </div>
            <div className="text-sm text-[#2d4a3e]/60">Choisis le nombre</div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => handleSelect(slot, n)} className={btnClass} style={{ backgroundColor: reponses[slot] === n ? "#c4a8e8" : undefined }}>
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

/** 2. Compter et entourer le nombre. Mains avec 2, 5, 3, 4, 1 doigts. */
function ExerciceMains({ onComplete }: { onComplete: () => void }) {
  const valeurs = [2, 5, 3, 4, 1];
  const options: number[][] = [[1, 2, 4], [1, 3, 5], [2, 3, 5], [1, 3, 4], [1, 2, 4]];
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
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {valeurs.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex min-h-[72px] items-center justify-center" aria-label={`${v} doigts`}>
              <MainSprite doigts={v} className="h-16 w-16 min-h-[64px] min-w-[64px]" />
            </div>
            <div className="flex gap-1">
              {options[i].map((n) => (
                <button key={n} type="button" onClick={() => handleSelect(i, n)} className={btnClass} style={{ backgroundColor: reponses[i] === n ? "#c4a8e8" : undefined }}>
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

const NOMBRE_MOUTONS = 15;
const TAILLE_GROUPE = 3;

/** 3. Grouper par trois : 15 moutons, l’enfant fait des paquets de 3 en les entourant. Les 15 moutons restent toujours affichés (pas de doublon). */
function ExerciceGrouper({ onComplete }: { onComplete: () => void }) {
  const [groups, setGroups] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reponse, setReponse] = useState<number | null>(null);
  const [showBravo, setShowBravo] = useState(false);
  const correct = NOMBRE_MOUTONS / TAILLE_GROUPE; // 5

  const inAnyGroup = new Set(groups.flat());
  const groupByMinIndex = new Map<number, number[]>(
    groups.map((g) => [Math.min(...g), g])
  );

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
    if (reponse === correct) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [reponse, onComplete]);

  const items: ReactNode[] = [];
  const rendered = new Set<number>();
  for (let i = 0; i < NOMBRE_MOUTONS; i++) {
    if (rendered.has(i)) continue;
    const group = groupByMinIndex.get(i);
    if (group) {
      group.forEach((idx) => rendered.add(idx));
      items.push(
        <div
          key={`g-${group[0]}`}
          className="inline-flex items-center justify-center rounded-full border-2 border-[#4a7c5a] bg-[#a8d5ba]/20 px-3 py-1"
          aria-label={`Paquet de 3 moutons`}
        >
          {group.map((idx) => (
            <span key={idx} className="text-2xl" role="img" aria-hidden>🐑</span>
          ))}
        </div>
      );
    } else {
      rendered.add(i);
      const idx = i;
      items.push(
        <button
          key={idx}
          type="button"
          onClick={() => toggleSheep(idx)}
          className={`rounded-lg p-1 transition focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] ${selected.includes(idx) ? "ring-2 ring-[#4a7c5a] bg-[#a8d5ba]/30" : "hover:bg-[#2d4a3e]/10"}`}
          aria-label={`Mouton ${idx + 1}`}
        >
          <span className="text-2xl" role="img">🐑</span>
        </button>
      );
    }
  }

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">3. Grouper par trois.</h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Il y a {NOMBRE_MOUTONS} moutons. Clique sur 3 moutons pour faire un paquet (ils seront entourés). Les 15 moutons restent toujours là.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {items}
      </div>
      <p className="mt-3 text-sm text-[#2d4a3e]/60">
        {selected.length > 0 && `Sélectionné : ${selected.length} mouton${selected.length > 1 ? "s" : ""}. Clique encore pour en ajouter ou enlever.`}
        {groups.length === correct && selected.length === 0 && " Tu as fait 5 paquets. Choisis combien de paquets ci-dessous puis valide."}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[3, 4, 5, 6].map((n) => (
          <button key={n} type="button" onClick={() => setReponse(n)} className={btnClass} style={{ backgroundColor: reponse === n ? "#c4a8e8" : undefined }}>
            {n}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={handleValider} disabled={reponse === null} className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white disabled:opacity-50">
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

/** 4. Coller les gommettes : 3 cercles avec 2, 5, 3. */
function ExerciceGommettes({ onComplete }: { onComplete: () => void }) {
  const cibles = [2, 5, 3];
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const [showBravo, setShowBravo] = useState(false);

  const add = useCallback((i: number) => {
    setCounts((prev) => { const next = [...prev]; if (next[i] < 5) next[i]++; return next; });
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
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">4. Mets le bon nombre de gommettes dans chaque cercle (clique pour ajouter, reclique pour enlever).</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {cibles.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-xl font-bold text-[#2d4a3e]">{c}</div>
            <button
              type="button"
              onClick={() => add(i)}
              className="flex min-h-[100px] min-w-[100px] flex-wrap items-center justify-center gap-1 rounded-full border-2 border-[#2d4a3e]/30 bg-[#fef9f3] p-2"
            >
              {Array.from({ length: counts[i] }, (_, k) => (
                <span key={k} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); remove(i); }} className="h-4 w-4 rounded-full bg-[#e8b4d4]" />
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

export default function ExerciceFeuille2() {
  const [etape, setEtape] = useState(0);
  return (
    <div className="space-y-8">
      <ExerciceChiffres onComplete={() => setEtape(1)} />
      {etape >= 1 && <ExerciceMains onComplete={() => setEtape(2)} />}
      {etape >= 2 && <ExerciceGrouper onComplete={() => setEtape(3)} />}
      {etape >= 3 && <ExerciceGommettes onComplete={() => setEtape(4)} />}
      {etape >= 4 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 2.</p>
        </div>
      )}
    </div>
  );
}
