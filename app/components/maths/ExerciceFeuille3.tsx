"use client";

import { useState, useCallback } from "react";

const btnClass =
  "min-h-[44px] min-w-[44px] rounded-lg border-2 border-[#2d4a3e]/30 bg-[#fef9f3] text-lg font-bold text-[#2d4a3e] transition hover:bg-[#c4a8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#c4a8e8] active:scale-95";

/** 1. Écrire la suite des nombres de 0 à 5 dans la grille (3 lignes x 6 colonnes). Après 5 on recommence à 0. */
function ExerciceSuite({ onComplete }: { onComplete: () => void }) {
  const sequence = [0, 1, 2, 3, 4, 5];
  const totalCells = 18;
  const indicesDonnes = [0, 3, 10, 14]; // 14 = 3e position dernière ligne (au milieu)
  const valeursDonnees = [0, 3, 4, 2]; // valeurs attendues (suite 0-5 répétée)
  const [reponses, setReponses] = useState<(number | null)[]>(
    Array.from({ length: totalCells }, (_, i) => {
      const idx = indicesDonnes.indexOf(i);
      return idx >= 0 ? valeursDonnees[idx] : null;
    })
  );
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [showBravo, setShowBravo] = useState(false);

  const handleSelectCell = useCallback((pos: number) => {
    if (indicesDonnes.includes(pos)) return;
    setSelectedCell(pos);
  }, []);

  const handleSetValue = useCallback((n: number) => {
    if (selectedCell === null) return;
    setReponses((prev) => { const next = [...prev]; next[selectedCell] = n; return next; });
  }, [selectedCell]);

  const expectedSequence = Array.from({ length: totalCells }, (_, i) => sequence[i % 6]);
  const allOk = reponses.every((r, i) => r === expectedSequence[i]);
  const complete = reponses.every((r) => r !== null);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">1. Complète la suite des nombres de 0 à 5.</h3>
      <p className="mt-2 text-sm text-[#2d4a3e]/70">
        Après 5, on recommence à 0. À droite, choisis un chiffre entre 0 et 5 pour chaque case vide.
      </p>
      <div className="mt-4 grid grid-cols-6 gap-1">
        {Array.from({ length: totalCells }, (_, pos) => {
          const idxDonne = indicesDonnes.indexOf(pos);
          const valeurDonnee = idxDonne >= 0 ? valeursDonnees[idxDonne] : null;
          const valeur = valeurDonnee ?? reponses[pos];
          const editable = valeurDonnee === null;
          return (
            <button
              key={pos}
              type="button"
              onClick={() => handleSelectCell(pos)}
              disabled={!editable}
              className={`min-h-[44px] rounded-lg border-2 text-xl font-bold transition ${
                editable ? "border-[#2d4a3e]/30 bg-[#fef9f3] text-[#2d4a3e] hover:bg-[#c4a8e8]/20" : "border-[#2d4a3e]/20 bg-[#e8e8e8] text-[#2d4a3e]/80"
              } ${selectedCell === pos ? "ring-2 ring-[#c4a8e8]" : ""}`}
            >
              {valeur ?? "?"}
            </button>
          );
        })}
      </div>
      {selectedCell !== null && (
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => handleSetValue(n)} className={btnClass} style={{ backgroundColor: reponses[selectedCell] === n ? "#c4a8e8" : undefined }}>
              {n}
            </button>
          ))}
        </div>
      )}
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

/** 2. Dessiner des pommes dans chaque panier. Cibles : 5, 3, 0, 1, 4, 2. */
function ExercicePaniers({ onComplete }: { onComplete: () => void }) {
  const cibles = [5, 3, 0, 1, 4, 2];
  const [counts, setCounts] = useState<number[]>(cibles.map(() => 0));
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
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">2. Mets le bon nombre de pommes dans chaque panier (clique pour ajouter, reclique une pomme pour enlever).</h3>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {cibles.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="text-lg font-bold text-[#2d4a3e]">{c}</div>
            <button type="button" onClick={() => add(i)} className="flex min-h-[80px] min-w-[80px] flex-wrap items-center justify-center gap-0.5 rounded-xl border-2 border-[#2d4a3e]/30 bg-[#fef9f3] p-2">
              {Array.from({ length: counts[i] }, (_, k) => (
                <span key={k} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-2xl">🍎</span>
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

/** 3. Colorier le nombre d'objets présents. 5 collections (1 à 5 objets), 3 options chacune. */
function ExerciceColorier({ onComplete }: { onComplete: () => void }) {
  const valeurs = [1, 2, 3, 4, 5];
  const options: number[][] = [[1, 2, 3], [2, 4, 5], [2, 5, 3], [0, 4, 1], [5, 3, 4]];
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
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">3. Compte les objets et choisis le bon nombre.</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {valeurs.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: v }, (_, k) => (
                <span key={k} className="text-2xl">🍭</span>
              ))}
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

/** 4. Barrer les billes en trop : 7→3, 8→5, 9→2. */
function ExerciceBarrerBilles({ onComplete }: { onComplete: () => void }) {
  const configs: { total: number; cible: number }[] = [{ total: 7, cible: 3 }, { total: 8, cible: 5 }, { total: 9, cible: 2 }];
  const [barrees, setBarrees] = useState<boolean[][]>(configs.map((c) => Array.from({ length: c.total }, () => false)));
  const [showBravo, setShowBravo] = useState(false);

  const toggle = useCallback((fi: number, bi: number) => {
    setBarrees((prev) => {
      const next = prev.map((row, i) => (i === fi ? [...row] : row));
      next[fi][bi] = !next[fi][bi];
      return next;
    });
  }, []);

  const restants = barrees.map((row, fi) => configs[fi].total - row.filter(Boolean).length);
  const allOk = restants.every((r, i) => r === configs[i].cible);

  const handleValider = useCallback(() => {
    if (allOk) { setShowBravo(true); setTimeout(() => onComplete(), 1200); }
  }, [allOk, onComplete]);

  return (
    <section className="rounded-2xl bg-white/95 p-6 shadow-lg">
      <h3 className="font-display text-lg font-semibold text-[#2d4a3e]">4. Barre les billes en trop pour qu’il en reste le nombre indiqué.</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {configs.map((cfg, fi) => (
          <div key={fi} className="flex flex-col items-center gap-2">
            <div className="text-xl font-bold text-[#2d4a3e]">Il doit en rester : {cfg.cible}</div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: cfg.total }, (_, bi) => (
                <button
                  key={bi}
                  type="button"
                  onClick={() => toggle(fi, bi)}
                  className={`h-10 w-10 rounded-full border-2 transition ${barrees[fi][bi] ? "border-red-400 bg-red-200 line-through" : "border-[#2d4a3e]/30 bg-[#e8b4d4]"}`}
                />
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

export default function ExerciceFeuille3() {
  const [etape, setEtape] = useState(0);
  return (
    <div className="space-y-8">
      <ExerciceSuite onComplete={() => setEtape(1)} />
      {etape >= 1 && <ExercicePaniers onComplete={() => setEtape(2)} />}
      {etape >= 2 && <ExerciceColorier onComplete={() => setEtape(3)} />}
      {etape >= 3 && <ExerciceBarrerBilles onComplete={() => setEtape(4)} />}
      {etape >= 4 && (
        <div className="rounded-2xl bg-[#a8d5ba]/40 p-6 text-center">
          <p className="font-display text-xl font-semibold text-[#2d4a3e]">Félicitations ! Tu as terminé la feuille 3.</p>
        </div>
      )}
    </div>
  );
}
