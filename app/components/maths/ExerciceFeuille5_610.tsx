"use client";

import { useState, useCallback, useMemo } from "react";

const btnClass =
  "min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95";

const NUMBERS_0_10 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** 1. Nombre avant et après (4 fois) avec un nombre entre 6 et 9 au centre. */
function ExerciceAvantApres610({ onComplete }: { onComplete: () => void }) {
  // On mélange l'ordre des nombres au milieu (6, 7, 8, 9) pour que les perles ne soient pas toujours dans le même ordre.
  const milieux = useMemo(() => {
    const arr = [6, 7, 8, 9];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  // 4 lignes × 2 cases à remplir (avant / après) = 8 cases
  const [reponses, setReponses] = useState<(number | null)[]>(Array(8).fill(null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showBravo, setShowBravo] = useState(false);

  const expectedForSlot = (slot: number): number => {
    const ligne = Math.floor(slot / 2);
    const isAvant = slot % 2 === 0;
    const m = milieux[ligne];
    return isAvant ? m - 1 : m + 1;
  };

  const handleSelectSlot = useCallback((slot: number) => {
    setSelectedSlot(slot);
  }, []);

  const handleChooseNumber = useCallback(
    (n: number) => {
      if (selectedSlot === null) return;
      setReponses((prev) => {
        const next = [...prev];
        next[selectedSlot] = n;
        return next;
      });
    },
    [selectedSlot],
  );

  const allOk = reponses.every((r, i) => r === expectedForSlot(i));
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
        1. Écris le nombre avant et après.
      </h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Clique dans une boule blanche puis choisis le bon nombre (0 à 10). Le nombre du milieu est toujours entre 6 et 9.
      </p>
      <div className="mt-4 space-y-4">
        {milieux.map((m, i) => {
          const avantIndex = i * 2;
          const apresIndex = i * 2 + 1;
          return (
            <div key={i} className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSelectSlot(avantIndex)}
                className={`h-12 w-12 rounded-full border-2 text-lg font-bold transition ${
                  reponses[avantIndex] === null
                    ? "border-dashed border-[#2d4a3e]/30 bg-[#fef9f3]"
                    : "border-[#2d4a3e]/40 bg-[#e8f0e9]"
                } ${selectedSlot === avantIndex ? "ring-2 ring-[#c4a8e8]" : ""}`}
              >
                {reponses[avantIndex] ?? "?"}
              </button>
              <div className="h-12 w-12 rounded-full border-2 border-[#2d4a3e]/60 bg-[#dcdcf5] text-lg font-bold text-[#2d4a3e] flex items-center justify-center">
                {m}
              </div>
              <button
                type="button"
                onClick={() => handleSelectSlot(apresIndex)}
                className={`h-12 w-12 rounded-full border-2 text-lg font-bold transition ${
                  reponses[apresIndex] === null
                    ? "border-dashed border-[#2d4a3e]/30 bg-[#fef9f3]"
                    : "border-[#2d4a3e]/40 bg-[#e8f0e9]"
                } ${selectedSlot === apresIndex ? "ring-2 ring-[#c4a8e8]" : ""}`}
              >
                {reponses[apresIndex] ?? "?"}
              </button>
            </div>
          );
        })}
      </div>
      {selectedSlot !== null && (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          {NUMBERS_0_10.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleChooseNumber(n)}
              className={btnClass}
              style={{ backgroundColor: reponses[selectedSlot] === n ? "#c4a8e8" : undefined }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      {complete && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleValider}
            className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
          >
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

/** 2. Choisir la part du gâteau qui contient le plus grand nombre. */
function ExerciceGateaux610({ onComplete }: { onComplete: () => void }) {
  const gateaux = [
    [5, 8, 4, 10],
    [7, 4, 3, 9],
    [6, 2, 10, 5],
    [3, 7, 8, 4],
  ];
  const [selection, setSelection] = useState<(number | null)[]>(gateaux.map(() => null));
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback((gIndex: number, partIndex: number) => {
    setSelection((prev) => {
      const next = [...prev];
      next[gIndex] = partIndex;
      return next;
    });
  }, []);

  const allOk = selection.every((sel, i) => {
    if (sel === null) return false;
    const max = Math.max(...gateaux[i]);
    return gateaux[i][sel] === max;
  });

  const complete = selection.every((s) => s !== null);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        2. Clique sur la part du gâteau qui contient le plus grand nombre.
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {gateaux.map((parts, gIndex) => (
          <div key={gIndex} className="flex flex-col items-center gap-2">
            <div className="grid h-32 w-32 grid-cols-2 grid-rows-2 rounded-full border-4 border-[#2d4a3e]/40 bg-[#fef9f3] overflow-hidden">
              {parts.map((n, partIndex) => {
                const selected = selection[gIndex] === partIndex;
                return (
                  <button
                    key={partIndex}
                    type="button"
                    onClick={() => handleSelect(gIndex, partIndex)}
                    className={`flex items-center justify-center border border-white text-xl font-bold transition ${
                      selected ? "bg-[#c4a8e8]/80 text-[#2d4a3e]" : "bg-transparent text-[#2d4a3e]"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {complete && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleValider}
            className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
          >
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

/** 3. Ranger 4, 8, 6, 7 et 10 du plus petit au plus grand. */
function ExerciceOrdreCroissant610({ onComplete }: { onComplete: () => void }) {
  const nombres = [4, 8, 6, 7, 10];
  const cible = [...nombres].sort((a, b) => a - b);
  const [choix, setChoix] = useState<number[]>([]);
  const [utilises, setUtilises] = useState<boolean[]>(nombres.map(() => false));
  const [showBravo, setShowBravo] = useState(false);

  const handleChoisir = useCallback(
    (index: number) => {
      if (utilises[index]) return;
      setChoix((prev) => {
        if (prev.length >= nombres.length) return prev;
        return [...prev, nombres[index]];
      });
      setUtilises((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    },
    [nombres, utilises],
  );

  const handleReset = useCallback(() => {
    setChoix([]);
    setUtilises(nombres.map(() => false));
  }, [nombres]);

  const complete = choix.length === nombres.length;
  const allOk = complete && choix.every((n, i) => n === cible[i]);

  const handleValider = useCallback(() => {
    if (allOk) {
      setShowBravo(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">
        3. Écris les nombres du plus petit au plus grand.
      </h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Clique sur les nombres pour les placer dans l&apos;ordre croissant.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {nombres.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleChoisir(i)}
            disabled={utilises[i]}
            className={`min-h-[44px] min-w-[44px] rounded-lg border-2 text-lg font-bold transition ${
              utilises[i]
                ? "border-[#2d4a3e]/20 bg-[#e8e8e8] text-[#2d4a3e]/60"
                : "border-[#2d4a3e]/30 bg-[#fef9f3] text-[#2d4a3e] hover:bg-[#c4a8e8]/20"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {cible.map((_, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e]"
          >
            {choix[i] ?? "?"}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[40px] rounded-xl bg-[#e2e2e2] px-4 py-2 text-sm font-medium text-[#2d4a3e]"
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={handleValider}
          disabled={!complete}
          className="min-h-[40px] rounded-xl bg-[#4a7c5a] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {showBravo ? "Bravo !" : "Valider"}
        </button>
      </div>
    </section>
  );
}

/** 4. Compléter la suite de perles de 1 à 10 (puis 11 et 12 déjà écrits). */
function ExercicePerles610({ onComplete }: { onComplete: () => void }) {
  const total = 12;
  const expected = Array.from({ length: total }, (_, i) => i + 1);
  // 1 au début, 11 et 12 déjà écrits à la fin.
  const indicesDonnes = [0, 10, 11];
  const valeursDonnees = [1, 11, 12];

  const [reponses, setReponses] = useState<(number | null)[]>(
    Array.from({ length: total }, (_, i) => {
      const idx = indicesDonnes.indexOf(i);
      return idx >= 0 ? valeursDonnees[idx] : null;
    }),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showBravo, setShowBravo] = useState(false);

  const handleSelect = useCallback(
    (i: number) => {
      if (indicesDonnes.includes(i)) return;
      setSelectedIndex(i);
    },
    [indicesDonnes],
  );

  const handleChoose = useCallback(
    (n: number) => {
      if (selectedIndex === null) return;
      setReponses((prev) => {
        const next = [...prev];
        next[selectedIndex] = n;
        return next;
      });
    },
    [selectedIndex],
  );

  const allOk = reponses.every((r, i) => r === expected[i]);
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
        4. Replace les perles au bon endroit pour aller de 1 à 10.
      </h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Clique sur une perle vide puis choisis le bon nombre (0 à 10). Après 10, les perles 11 et 12 sont déjà écrites.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {reponses.map((valeur, i) => {
          const estDonnee = indicesDonnes.includes(i);
          const editable = !estDonnee;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={!editable}
              className={`h-12 w-12 rounded-full border-2 text-lg font-bold transition ${
                editable
                  ? "border-[#2d4a3e]/30 bg-[#fef9f3] text-[#2d4a3e] hover:bg-[#c4a8e8]/20"
                  : "border-[#2d4a3e]/40 bg-[#e8e8e8] text-[#2d4a3e]"
              } ${selectedIndex === i ? "ring-2 ring-[#c4a8e8]" : ""}`}
            >
              {valeur ?? "?"}
            </button>
          );
        })}
      </div>
      {selectedIndex !== null && (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          {NUMBERS_0_10.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleChoose(n)}
              className={btnClass}
              style={{ backgroundColor: reponses[selectedIndex] === n ? "#c4a8e8" : undefined }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      {complete && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleValider}
            className="min-h-[48px] rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
          >
            {showBravo ? "Bravo !" : "Valider"}
          </button>
        </div>
      )}
    </section>
  );
}

export default function ExerciceFeuille5_610() {
  const [etape, setEtape] = useState(0);

  return (
    <div className="space-y-8">
      <ExerciceAvantApres610 onComplete={() => setEtape(1)} />
      {etape >= 1 && <ExerciceGateaux610 onComplete={() => setEtape(2)} />}
      {etape >= 2 && <ExerciceOrdreCroissant610 onComplete={() => setEtape(3)} />}
      {etape >= 3 && <ExercicePerles610 onComplete={() => setEtape(4)} />}
      {etape >= 4 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">
            Félicitations ! Tu as terminé la feuille 5 (nombres 6 à 10).
          </p>
        </div>
      )}
    </div>
  );
}

