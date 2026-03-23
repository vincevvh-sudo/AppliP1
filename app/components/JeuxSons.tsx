"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Son, Niveau } from "../data/sons-data";
import {
  SONS,
  getSonById,
  getDistracteurs,
  getDistracteursFromPool,
  getDistracteursSyllabes,
  getDistracteursSyllabesCV,
  getSyllabes,
  getSyllabesCV,
  getSyllabesCVAutresConsonnes,
  getSyllabeCibleDansMot,
  isConsonne,
  getSonsMelangesPourExercice,
  getSonsDejaVus,
} from "../data/sons-data";
import { getMotsPhono, getMotAleatoire, getMotPourNiveau } from "../data/mots-phono";
import { getMotsPhonoImagePourSerie, getMotsPhonoImageFixesPourM, getMotsPhonoImageFixesPourL, getMotsPhonoImageFixesPourJ, getMotsPhonoImageFixesPourD, getMotsPhonoImageFixesPourG, capSeriePourMotsDistincts, getEcouteCliqueItemsPourSon, getSonsImagesItemsPourSon, type ItemEcouteClique } from "../data/mots-phono-image";
import { getTextePourGrapheme, getTextePourSyllabe, getTextePourMot } from "../data/syllabe-prononciation";
import { getExercicesEval, getChronoFluenceItems, getRelieEcrituresItemsPourPhono, getArticlePhonoItems, getPhrasesVraiFaux, getEcrireSyllabeItems, type SerieExoEval, type ItemEntoureLettreDansMot, type ItemRelieEcritures, type ItemArticleLeLa, type ItemArticlePhono, type ItemPhraseVraiFaux, type ItemImageDeuxMots } from "../data/eval-data";

export type DetailExerciceEval = { type: string; titre: string; points: number; pointsMax: number; duree_secondes?: number };
export type OnTermineDetail = {
  points: number;
  pointsMax: number;
  /** Pour les évaluations : score de chaque exercice (1, 2, 3, 4…) */
  exercices?: DetailExerciceEval[];
};

type PropsJeu = {
  son: Son;
  niveau: Niveau;
  onTermine: (reussi: boolean, detail?: OnTermineDetail) => void;
};

function speak(text: string, lang = "fr-FR") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

const EXERCICES_PAR_SERIE = 8;
const TOTAL_EXERCICES = 8; // Affiché à l'enfant : "X sur 8"

const SEUIL_SUCCES = 0.8;

/** Message et boutons de fin de partie (hors éval) : Bravo 8/8, Très bien 6-7/8, Recommence <6. */
function ResultatPartie({
  score,
  total,
  onContinuer,
  onRecommencer,
}: {
  score: number;
  total: number;
  onContinuer: () => void;
  onRecommencer: () => void;
}) {
  const message =
    score === total
      ? "Bravo !"
      : score >= 6
        ? "Très bien !"
        : "Recommence l'exercice.";
  const reussi = score >= 6;
  return (
    <div className="space-y-6 text-center">
      <p className="text-2xl font-display font-bold text-[#2d4a3e]">
        Score : {score} sur {total}
      </p>
      <p className="text-xl text-[#2d4a3e]">{message}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {reussi ? (
          <button
            type="button"
            onClick={onContinuer}
            className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
          >
            Continuer
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRecommencer}
              className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={onContinuer}
              className="rounded-xl border-2 border-[#2d4a3e]/30 px-8 py-4 text-lg font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/10"
            >
              Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Exercice "écoute et clique si tu entends le son" : grille d'emojis+mots, l'enfant sélectionne ceux qui contiennent le son. */
function EcouteCliqueSon({
  son,
  items,
  onValide,
}: {
  son: Son;
  items: ItemEcouteClique[];
  onValide: (success: boolean) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const totalCorrect = items.filter((i) => i.contientSon).length;

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const playWord = (mot: string) => {
    speak(getTextePourMot(mot), "fr-FR");
  };

  const handleValider = () => {
    let correct = 0;
    let wrong = 0;
    selected.forEach((idx) => {
      if (items[idx].contientSon) correct++;
      else wrong++;
    });
    const score = Math.max(0, correct - wrong);
    onValide(score >= 5);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-lg text-[#2d4a3e]">
        Clique sur les images dont le mot contient le son <strong>{son.grapheme}</strong>. Tu peux cliquer sur 🔊 pour entendre le mot.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item, idx) => (
          <div
            key={`${item.mot}-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => toggle(idx)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(idx); } }}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition cursor-pointer ${
              selected.has(idx) ? "border-[#4a7c5a] bg-[#a8d5ba]/40" : "border-[#2d4a3e]/20 bg-white/95 hover:bg-[#a8d5ba]/20"
            }`}
          >
            {item.image ? (
              <img src={item.image} alt={item.mot} className="h-14 w-auto object-contain" />
            ) : (
              <span className="text-4xl" role="img" aria-hidden>{item.emoji}</span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); playWord(item.mot); }}
              className="mt-1 rounded-full bg-[#2d4a3e]/10 p-1.5 text-[#2d4a3e] hover:bg-[#2d4a3e]/20"
              title="Écouter le mot"
            >
              <span className="text-lg">🔊</span>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleValider}
          className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
        >
          Valider
        </button>
      </div>
    </div>
  );
}

// Pour Phono 1 et Phono 2 : I, A, O, et toujours la lettre du son courant (ex. E) pour qu'elle soit visible
const OPTIONS_PHONO_BASE = ["i", "a", "o"];
// Pour le son E uniquement : toujours 4 lettres A, I, O, E
const OPTIONS_PHONO_SON_E = ["a", "i", "o", "e"];
// Pour le son U uniquement : toujours 4 lettres U, I, A, E (U toujours présent car on apprend le U)
const OPTIONS_PHONO_SON_U = ["u", "i", "a", "e"];
// Pour le son é, è, ê : jamais è et ê ensemble (même son), on alterne. La bonne réponse est toujours dans le pool.
const VARIANTES_E_ACCENT_PHONO = ["é", "è", "ê"];
function getPoolEAccent(bon: string, index: number): string[] {
  const base = ["é", "e", "i", "a"];
  const accent = bon === "è" ? "è" : bon === "ê" ? "ê" : index % 2 === 0 ? "è" : "ê";
  return [...base, accent];
}
// Pour le son « et » : et, est, e (toujours visibles pour pouvoir cliquer), 4e option = è ou ê en alternance
const CIBLES_PHONO_ET: string[] = ["et", "est", "e", "et", "est", "e", "et", "est"];
function getOptionsPhonoEt(index: number): string[] {
  const quatrieme = index % 2 === 0 ? "è" : "ê";
  return ["et", "est", "e", quatrieme].sort(() => Math.random() - 0.5);
}

function JeuPhono({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => {
    if (son.id === "e") {
      const sonE = son;
      const sonI = getSonById("i");
      const sonA = getSonById("a");
      const sonO = getSonById("o");
      if (!sonE || !sonI || !sonA || !sonO) {
        const s = getSonsMelangesPourExercice(son, TOTAL_EXERCICES, niveau.numero).filter(Boolean);
        return padToLength(s, TOTAL_EXERCICES);
      }
      const seed = (niveau.numero * 7 + 1) % 100;
      const autres = [sonI, sonI, sonA, sonO].sort(() => (seed + 1) * 0.1 - 0.5);
      const melange: Son[] = [];
      let ie = 0;
      let io = 0;
      for (let k = 0; k < 8; k++) {
        if (k % 2 === 0 && ie < 4) {
          melange.push(sonE);
          ie++;
        } else if (io < 4) {
          melange.push(autres[io++]);
        } else {
          melange.push(sonE);
          ie++;
        }
      }
      return melange.sort(() => Math.random() - 0.5);
    }
    if (son.id === "u") {
      const sonU = son;
      const sonI = getSonById("i");
      const sonA = getSonById("a");
      const sonE = getSonById("e");
      if (!sonU || !sonI || !sonA || !sonE) {
        const s = getSonsMelangesPourExercice(son, TOTAL_EXERCICES, niveau.numero).filter(Boolean);
        return padToLength(s, TOTAL_EXERCICES);
      }
      const seed = (niveau.numero * 11 + 3) % 100;
      const autres = [sonI, sonI, sonA, sonE].sort(() => (seed + 1) * 0.1 - 0.5);
      const melange: Son[] = [];
      let iu = 0;
      let io = 0;
      for (let k = 0; k < 8; k++) {
        if (k % 2 === 0 && iu < 4) {
          melange.push(sonU);
          iu++;
        } else if (io < 4) {
          melange.push(autres[io++]);
        } else {
          melange.push(sonU);
          iu++;
        }
      }
      return melange.sort(() => Math.random() - 0.5);
    }
    if (son.id === "e-accent") {
      const sonEAccent = son;
      const sonI = getSonById("i");
      const sonA = getSonById("a");
      const sonE = getSonById("e");
      if (!sonEAccent || !sonI || !sonA || !sonE) {
        const s = getSonsMelangesPourExercice(son, TOTAL_EXERCICES, niveau.numero).filter(Boolean);
        return padToLength(s, TOTAL_EXERCICES);
      }
      // 4× é + 4× (I, I, A, E) pour que les bonnes réponses restent dans les options [é, i, a, e]
      const autres = [sonI, sonI, sonA, sonE];
      const melange: Son[] = [];
      let ie = 0;
      let io = 0;
      for (let k = 0; k < 8; k++) {
        if (k % 2 === 0 && ie < 4) {
          melange.push(sonEAccent);
          ie++;
        } else if (io < 4) {
          melange.push(autres[io++]);
        } else {
          melange.push(sonEAccent);
          ie++;
        }
      }
      return melange.sort(() => Math.random() - 0.5);
    }
    // Son « et » : exercice uniquement sur "et" (8 fois), pas de mélange avec est/es
    if (son.id === "et") {
      return Array(8)
        .fill(son)
        .sort(() => Math.random() - 0.5);
    }
    // À partir de M : Phono 1/2 en syllabes CV (ma, me, mi, mo, mu…). Série = N× son + (8-N)× autres consonnes.
    // Pour la lettre t : 5 syllabes avec le son t et 3 sans.
    if (isConsonne(son)) {
      const autresConsonnes = getSonsDejaVus(son).filter(isConsonne);
      const avecSon = son.id === "t" ? 5 : 4;
      const sansSon = TOTAL_EXERCICES - avecSon;
      const autres = autresConsonnes.slice(0, sansSon);
      const melange: Son[] = [...Array(avecSon).fill(son), ...autres];
      const padded = padToLength(melange, TOTAL_EXERCICES);
      return padded.sort(() => Math.random() - 0.5);
    }
    const s = getSonsMelangesPourExercice(son, TOTAL_EXERCICES, niveau.numero).filter(Boolean);
    return padToLength(s, TOTAL_EXERCICES);
  });
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [erreur, setErreur] = useState(false);
  const [fini, setFini] = useState<{ score: number; total: number } | null>(null);
  const [ecouteCliqueItems] = useState(() => getEcouteCliqueItemsPourSon(son.id));
  const hasEcouteClique = ecouteCliqueItems.length > 0 && niveau.type === "phono" && niveau.numero === 1;
  const total = hasEcouteClique ? 1 : TOTAL_EXERCICES;
  const cible = hasEcouteClique && index === 0 ? undefined : serie[hasEcouteClique ? index - 1 : index];

  useEffect(() => {
    if (!cible) return;
    if (son.id === "e") {
      setOptions([...OPTIONS_PHONO_SON_E].sort(() => Math.random() - 0.5));
      return;
    }
    if (son.id === "u") {
      setOptions([...OPTIONS_PHONO_SON_U].sort(() => Math.random() - 0.5));
      return;
    }
    if (son.id === "e-accent") {
      const bon =
        cible.id === "e-accent"
          ? VARIANTES_E_ACCENT_PHONO[index % VARIANTES_E_ACCENT_PHONO.length]
          : cible.grapheme.split(",")[0].trim();
      const pool = getPoolEAccent(bon, index);
      const autres = pool.filter((l) => l !== bon);
      const troisAutres = [...autres].sort(() => Math.random() - 0.5).slice(0, 3);
      setOptions([bon, ...troisAutres].sort(() => Math.random() - 0.5));
      return;
    }
    if (son.id === "et") {
      setOptions(getOptionsPhonoEt(index));
      return;
    }
    // Consonnes (M, L, R…) : options = 4 syllabes CV (cible + 3 distracteurs). Pour g en Phono 2 : uniquement ga, go, gu.
    if (isConsonne(son) && isConsonne(cible)) {
      const syllabesCV = (niveau.numero === 2 && cible.id === "g") ? ["ga", "go", "gu"] : getSyllabesCV(cible);
      if (syllabesCV.length) {
        const cibleSyllabe = syllabesCV[(niveau.numero * 7 + index) % syllabesCV.length];
        const distracteurs = getDistracteursSyllabesCV(son, 3, cibleSyllabe);
        setOptions([cibleSyllabe, ...distracteurs].sort(() => Math.random() - 0.5));
        return;
      }
    }
    const lettreCible = cible.grapheme.split(",")[0].trim();
    const optionsBase = OPTIONS_PHONO_BASE.includes(lettreCible)
      ? OPTIONS_PHONO_BASE
      : [...OPTIONS_PHONO_BASE, lettreCible];
    setOptions([...optionsBase].sort(() => Math.random() - 0.5));
  }, [cible, index, son.id, niveau.numero]);

  useEffect(() => {
    if (cible && options.length) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      let texte: string;
      if (cible.id === "e-accent") {
        texte = VARIANTES_E_ACCENT_PHONO[index % VARIANTES_E_ACCENT_PHONO.length];
      } else if (cible.id === "et") {
        texte = CIBLES_PHONO_ET[index];
      } else if (isConsonne(son) && isConsonne(cible)) {
        const syllabesCV = (niveau.numero === 2 && cible.id === "g") ? ["ga", "go", "gu"] : getSyllabesCV(cible);
        const cibleSyllabe = syllabesCV.length ? syllabesCV[(niveau.numero * 7 + index) % syllabesCV.length] : "";
        const motPourSyllabe = (niveau.numero === 2 && cible.id === "g") ? getTextePourSyllabe(cibleSyllabe, index) : getTextePourSyllabe(cibleSyllabe);
        texte = cibleSyllabe ? motPourSyllabe : getTextePourGrapheme(cible);
      } else {
        texte = getTextePourGrapheme(cible);
      }
      setTimeout(() => speak(texte, "fr-FR"), 150);
    }
  }, [index, cible, options, son.id, niveau.numero]);

  const reecouter = useCallback(() => {
    if (cible) {
      let texte: string;
      if (cible.id === "e-accent") {
        texte = VARIANTES_E_ACCENT_PHONO[index % VARIANTES_E_ACCENT_PHONO.length];
      } else if (cible.id === "et") {
        texte = CIBLES_PHONO_ET[index];
      } else if (isConsonne(son) && isConsonne(cible)) {
        const syllabesCV = (niveau.numero === 2 && cible.id === "g") ? ["ga", "go", "gu"] : getSyllabesCV(cible);
        const cibleSyllabe = syllabesCV.length ? syllabesCV[(niveau.numero * 7 + index) % syllabesCV.length] : "";
        const motPourSyllabe = (niveau.numero === 2 && cible.id === "g") ? getTextePourSyllabe(cibleSyllabe, index) : getTextePourSyllabe(cibleSyllabe);
        texte = cibleSyllabe ? motPourSyllabe : getTextePourGrapheme(cible);
      } else {
        texte = getTextePourGrapheme(cible);
      }
      speak(texte, "fr-FR");
    }
  }, [cible, index, son.id, niveau.numero]);

  const handleClick = useCallback(
    (g: string) => {
      if (!cible) return;
      let bon: string;
      if (cible.id === "e-accent") {
        bon = VARIANTES_E_ACCENT_PHONO[index % VARIANTES_E_ACCENT_PHONO.length];
      } else if (cible.id === "et") {
        bon = CIBLES_PHONO_ET[index];
      } else if (isConsonne(son) && isConsonne(cible)) {
        const syllabesCV = (niveau.numero === 2 && cible.id === "g") ? ["ga", "go", "gu"] : getSyllabesCV(cible);
        bon = syllabesCV.length ? syllabesCV[(niveau.numero * 7 + index) % syllabesCV.length] : cible.grapheme.split(",")[0].trim();
      } else {
        bon = cible.grapheme.split(",")[0].trim();
      }
      if (g === bon) {
        setErreur(false);
        const newSucces = succes + 1;
        setSucces(newSucces);
        if (index + 1 >= total) {
          setFini({ score: newSucces, total });
          return;
        }
        setIndex((i) => i + 1);
      } else {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
      }
    },
    [cible, succes, index, total, onTermine]
  );

  const handleContinuer = useCallback(() => {
    if (fini) onTermine(fini.score >= Math.ceil(fini.total * 0.6));
  }, [fini, onTermine]);

  const handleRecommencer = useCallback(() => {
    setFini(null);
    setIndex(0);
    setSucces(0);
  }, []);

  if (fini) {
    return (
      <ResultatPartie
        score={fini.score}
        total={fini.total}
        onContinuer={handleContinuer}
        onRecommencer={handleRecommencer}
      />
    );
  }

  if (hasEcouteClique && index === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl bg-[#a8d5ba]/30 px-4 py-2 text-center">
          <p className="text-sm text-[#2d4a3e]/80">Points</p>
          <p className="text-2xl font-bold text-[#2d4a3e]">{succes} sur {total}</p>
          <p className="text-sm text-[#2d4a3e]/70">Question 1 sur {total}</p>
        </div>
        <EcouteCliqueSon
          son={son}
          items={ecouteCliqueItems}
          onValide={(success) => {
            if (total === 1) {
              setSucces(success ? 1 : 0);
              setFini({ score: success ? 1 : 0, total: 1 });
            } else {
              setSucces(success ? 1 : 0);
              setIndex(1);
            }
          }}
        />
      </div>
    );
  }

  if (!cible || !options.length) return null;

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-[#2d4a3e]">
        {isConsonne(son) ? "Écoute la syllabe et clique sur la bonne syllabe." : "Écoute le son et clique sur la bonne lettre."}
      </p>
      <div className="rounded-xl bg-[#a8d5ba]/30 px-4 py-2 text-center">
        <p className="text-sm text-[#2d4a3e]/80">Points</p>
        <p className="text-2xl font-bold text-[#2d4a3e]">{succes} sur {total}</p>
        <p className="text-sm text-[#2d4a3e]/70">Question {index + 1} sur {total}</p>
      </div>
      <button
        type="button"
        onClick={reecouter}
        className="mx-auto flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#a8d5ba]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((g, i) => (
          <button
            key={`option-${index}-${i}`}
            type="button"
            onClick={() => handleClick(g)}
            className={`rounded-2xl bg-white/95 px-8 py-4 text-3xl font-bold text-[#2d4a3e] shadow-lg transition hover:scale-105 hover:bg-[#a8d5ba]/50 ${erreur ? "animate-shake bg-red-100" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
      {erreur && (
        <p className="text-center text-red-600 font-medium">Non, réessaie !</p>
      )}
    </div>
  );
}

function padToLength<T>(arr: T[], length: number): T[] {
  if (arr.length >= length) return arr.slice(0, length);
  if (arr.length === 0) return arr;
  const out = [...arr];
  while (out.length < length) out.push(arr[out.length % arr.length]);
  return out;
}

function JeuPhonoImage({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => {
    if (son.id === "et") {
      return Array(8)
        .fill(son)
        .sort(() => Math.random() - 0.5);
    }
    // Consonnes (M, L, R…) : uniquement des mots de ce son, pour proposer ma/me/mi/mo/mu (pas des lettres)
    if (isConsonne(son)) {
      return Array(8)
        .fill(son)
        .sort(() => Math.random() - 0.5);
    }
    // Lettre U : 4 mots avec U et 4 sans U, entrelacés (pas l'un à la suite de l'autre)
    if (son.id === "u") {
      const prev = getSonsDejaVus(son).filter((s): s is Son => s != null && s.id != null);
      const others = prev.slice(0, 4);
      while (others.length < 4 && prev.length > 0) others.push(prev[others.length % prev.length]);
      const interleaved: Son[] = [];
      for (let i = 0; i < 4; i++) {
        interleaved.push(son, others[i] ?? son);
      }
      return capSeriePourMotsDistincts(interleaved.slice(0, TOTAL_EXERCICES));
    }
    // Lettre E : 4 mots avec E et 4 sans E, entrelacés (éviter e et i dans le même exercice)
    if (son.id === "e") {
      const prev = getSonsDejaVus(son).filter((s): s is Son => s != null && s.id != null);
      const others = prev.slice(0, 4);
      while (others.length < 4 && prev.length > 0) others.push(prev[others.length % prev.length]);
      const interleaved: Son[] = [];
      for (let i = 0; i < 4; i++) {
        interleaved.push(son, others[i] ?? son);
      }
      return capSeriePourMotsDistincts(interleaved.slice(0, TOTAL_EXERCICES));
    }
    // Son é/è/ê : 4 mots avec é et 4 sans (i, a, e…), entrelacés — pour que la Phono Image propose bien des mots "eh eh"
    if (son.id === "e-accent") {
      const prev = getSonsDejaVus(son).filter((s): s is Son => s != null && s.id != null);
      const others = prev.slice(0, 4);
      while (others.length < 4 && prev.length > 0) others.push(prev[others.length % prev.length]);
      const interleaved: Son[] = [];
      for (let i = 0; i < 4; i++) {
        interleaved.push(son, others[i] ?? son);
      }
      return capSeriePourMotsDistincts(interleaved.slice(0, TOTAL_EXERCICES));
    }
    const raw = getSonsMelangesPourExercice(son, TOTAL_EXERCICES, niveau.numero).slice(0, TOTAL_EXERCICES);
    return capSeriePourMotsDistincts(raw);
  });
  const [motsSerie] = useState(() => {
    // Lettre M : série fixe (toujours les mêmes 8 mots par niveau, seul l'ordre change)
    if (son.id === "m") {
      return padToLength(getMotsPhonoImageFixesPourM(son, niveau.numero), TOTAL_EXERCICES);
    }
    // Lettre L : série fixe (toujours les mêmes 8 mots par niveau, seul l'ordre change)
    if (son.id === "l") {
      return padToLength(getMotsPhonoImageFixesPourL(son, niveau.numero), TOTAL_EXERCICES);
    }
    // Lettre J : série fixe pour Phono image 1 uniquement (jaguar, jument, judoka, juste)
    if (son.id === "j" && niveau.numero === 1) {
      const fixesJ = getMotsPhonoImageFixesPourJ(son, niveau.numero);
      return fixesJ.length ? padToLength(fixesJ, TOTAL_EXERCICES) : padToLength(getMotsPhonoImagePourSerie(serie, niveau.numero).filter((x) => x.mot), TOTAL_EXERCICES);
    }
    // Lettre D : uniquement les 8 mots fixés pour Phono image 1 (aucun mot de la liste générale)
    if (son.id === "d" && niveau.numero === 1) {
      return padToLength(getMotsPhonoImageFixesPourD(son, niveau.numero), TOTAL_EXERCICES);
    }
    // Lettre G : uniquement les 8 mots fixés pour Phono image 1 (mygale, gare, légume, légo, escargot, gobelet, gourde, kangourou)
    if (son.id === "g" && niveau.numero === 1) {
      return padToLength(getMotsPhonoImageFixesPourG(son, niveau.numero), TOTAL_EXERCICES);
    }
    let base = getMotsPhonoImagePourSerie(serie, niveau.numero).filter((x) => x.mot);
    // Pour le son U : réordonner pour que les 4 mots avec U ne se suivent pas (entrelacer avec les 4 autres)
    if (son.id === "u" && base.length === TOTAL_EXERCICES) {
      const avecU = base.filter((x) => x.sonCible.id === "u");
      const sansU = base.filter((x) => x.sonCible.id !== "u");
      if (avecU.length === 4 && sansU.length === 4) {
        const interleaved: typeof base = [];
        for (let i = 0; i < 4; i++) interleaved.push(avecU[i], sansU[i]);
        base = interleaved;
      }
    }
    // Pour le son E : idem — 4 mots avec E et 4 sans E, entrelacés
    if (son.id === "e" && base.length === TOTAL_EXERCICES) {
      const avecE = base.filter((x) => x.sonCible.id === "e");
      const sansE = base.filter((x) => x.sonCible.id !== "e");
      if (avecE.length === 4 && sansE.length === 4) {
        const interleaved: typeof base = [];
        for (let i = 0; i < 4; i++) interleaved.push(avecE[i], sansE[i]);
        base = interleaved;
      }
    }
    // Pour le son é/è/ê : 4 mots avec é et 4 sans, entrelacés (lézard, bébé, fusée, etc.)
    if (son.id === "e-accent" && base.length === TOTAL_EXERCICES) {
      const avecEAccent = base.filter((x) => x.sonCible.id === "e-accent");
      const sansEAccent = base.filter((x) => x.sonCible.id !== "e-accent");
      if (avecEAccent.length === 4 && sansEAccent.length === 4) {
        const interleaved: typeof base = [];
        for (let i = 0; i < 4; i++) interleaved.push(avecEAccent[i], sansEAccent[i]);
        base = interleaved;
      }
    }
    return padToLength(base, TOTAL_EXERCICES);
  });
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [erreur, setErreur] = useState(false);
  const [fini, setFini] = useState<{ score: number; total: number } | null>(null);
  const [ecouteCliqueItems] = useState(() => getEcouteCliqueItemsPourSon(son.id));
  const hasEcouteClique = false;
  const total = TOTAL_EXERCICES;
  const item = hasEcouteClique && index === 0 ? undefined : motsSerie[hasEcouteClique ? index - 1 : index];
  const optionsLettres = useMemo(
    () => {
      const lettres = SONS.filter((s) => s.ordre <= son.ordre).flatMap((s) =>
        s.grapheme.split(",").map((g) => g.trim()).filter(Boolean)
      );
      const uniques = [...new Set(lettres)];
      const lettreSonCourant = son.grapheme.split(",")[0].trim();
      const avecSonCourant = lettreSonCourant ? [...new Set([...uniques, lettreSonCourant])] : uniques;
      return avecSonCourant.length >= 2 ? avecSonCourant : ["i", "a", "o", "e", "é", "è"];
    },
    [son.ordre, son.grapheme]
  );
  const optionsSyllabes = useMemo(() => {
    if (!isConsonne(son)) return [];
    return [...getSyllabesCV(son), ...getSyllabesCVAutresConsonnes(son)];
  }, [son]);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (hasEcouteClique && index === 0) return;
    const effectiveIndex = hasEcouteClique ? index - 1 : index;
    const current = motsSerie[effectiveIndex];
    if (!current) return;
    const motLower = current.mot.toLowerCase();

    // Consonnes (M, L, R…) : options = syllabes CV, une seule syllabe du mot (ex. mamie → ma OU mi, pas les deux)
    if (isConsonne(son) && isConsonne(current.sonCible) && optionsSyllabes.length >= 2) {
      const affiche = getSyllabeCibleDansMot(current.mot, current.sonCible);
      if (affiche) {
        // Pour la lettre v : proposer exactement va, vo, ve, vu (ex. vache → va).
        const syllabesV = ["va", "vo", "ve", "vu"];
        if (son.id === "v" && syllabesV.includes(affiche)) {
          const distracteurs = syllabesV.filter((s) => s !== affiche);
          const tous = [affiche, ...distracteurs].sort(() => Math.random() - 0.5);
          setOptions(tous);
          return;
        }
        let autres = optionsSyllabes.filter((s) => s !== affiche && !motLower.includes(s));
        if (autres.length < 3) {
          autres = optionsSyllabes.filter((s) => s !== affiche);
        }
        const distracteurs = [...autres].sort(() => Math.random() - 0.5).slice(0, 3);
        const tous = [affiche, ...distracteurs].filter((v, i, a) => a.indexOf(v) === i);
        setOptions([...tous].sort(() => Math.random() - 0.5));
        return;
      }
    }

    if (optionsLettres.length < 2) return;
    const VARIANTES_E_ACCENT = ["é", "è", "ê", "ë"];
    const bon = current.sonCible.grapheme.split(",")[0].trim();
    const estEAccent = current.sonCible.id === "e-accent";
    const bons = estEAccent ? VARIANTES_E_ACCENT.filter((v) => optionsLettres.includes(v)) : [bon];
    const dansLeMot = bons.find((v) => current.mot.includes(v));
    const affiche = (dansLeMot && optionsLettres.includes(dansLeMot)) ? dansLeMot : (bons[0] ?? bon);
    let autres = optionsLettres.filter((l) => !bons.includes(l));
    // Ne jamais proposer une lettre qui est dans le mot (sauf la bonne) : ex. "note" → pas "o" et "e", "nuage" → pas "u" et "a"
    const autresHorsMot = autres.filter((l) => !motLower.includes(l));
    autres = autresHorsMot.length > 0 ? autresHorsMot : autres;
    const distracteurs = [...autres].sort(() => Math.random() - 0.5).slice(0, 3);
    const tous = [affiche, ...distracteurs].filter((v, i, a) => a.indexOf(v) === i);
    setOptions([...tous].sort(() => Math.random() - 0.5));
  }, [index, motsSerie, optionsLettres, optionsSyllabes, son.id, hasEcouteClique]);

  useEffect(() => {
    if (item?.mot) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourMot(item.mot), "fr-FR"), 300);
    }
  }, [index, item?.mot]);

  const reecouter = useCallback(() => {
    if (item?.mot) speak(getTextePourMot(item.mot), "fr-FR");
  }, [item?.mot]);

  const handleClick = useCallback(
    (lettre: string) => {
      if (!item) return;
      let correct: boolean;
      if (isConsonne(son) && isConsonne(item.sonCible)) {
        const syllabeCible = getSyllabeCibleDansMot(item.mot, item.sonCible);
        correct = syllabeCible ? lettre === syllabeCible : lettre === item.sonCible.grapheme.split(",")[0].trim();
      } else {
        const VARIANTES_E_ACCENT = ["é", "è", "ê", "ë"];
        const bon = item.sonCible.grapheme.split(",")[0].trim();
        const estEAccent = item.sonCible.id === "e-accent";
        correct = estEAccent && VARIANTES_E_ACCENT.includes(lettre) ? true : lettre === bon;
      }
      if (!correct) {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
        return;
      }
      setErreur(false);
      const newSucces = succes + 1;
      setSucces(newSucces);
      if (index + 1 >= total) {
        setFini({ score: newSucces, total });
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, succes, index, total, onTermine, son]
  );

  const handleContinuer = useCallback(() => {
    if (fini) onTermine(fini.score >= Math.ceil(fini.total * 0.6));
  }, [fini, onTermine]);

  const handleRecommencer = useCallback(() => {
    setFini(null);
    setIndex(0);
    setSucces(0);
  }, []);

  if (fini) {
    return (
      <ResultatPartie
        score={fini.score}
        total={fini.total}
        onContinuer={handleContinuer}
        onRecommencer={handleRecommencer}
      />
    );
  }

  if (!item || !options.length) return null;

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-[#2d4a3e]">
        {isConsonne(son) ? "Regarde l'image, écoute le mot. Quelle syllabe entends-tu ?" : "Regarde l'image, écoute le mot. Quelle lettre entends-tu ?"}
      </p>
      <div className="rounded-xl bg-[#ffd4a3]/30 px-4 py-2 text-center">
        <p className="text-sm text-[#2d4a3e]/80">Points</p>
        <p className="text-2xl font-bold text-[#2d4a3e]">{succes} sur {total}</p>
        <p className="text-sm text-[#2d4a3e]/70">Question {index + 1} sur {total}</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-3xl bg-white/95 p-8 shadow-xl">
          <MotVisuel item={item} size="lg" />
        </div>
        <button
          type="button"
          onClick={reecouter}
          className="flex items-center gap-2 rounded-xl bg-[#ffd4a3]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#ffd4a3]"
        >
          🔊 Réécouter
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((lettre, i) => (
          <button
            key={`option-${index}-${i}`}
            type="button"
            onClick={() => handleClick(lettre)}
            className={`rounded-2xl bg-white/95 px-8 py-4 text-3xl font-bold text-[#2d4a3e] shadow-lg transition hover:scale-105 hover:bg-[#ffd4a3]/50 ${erreur ? "animate-shake bg-red-100" : ""}`}
          >
            {lettre}
          </button>
        ))}
      </div>
      {erreur && (
        <p className="text-center text-red-600 font-medium">Non, réessaie !</p>
      )}
    </div>
  );
}

/** Sons images (niveau phono-image-2) : mot affiché, clic sur la syllabe qui contient le son travaillé. */
function JeuSonsImages({ son, niveau, onTermine }: PropsJeu) {
  const [items] = useState(() => getSonsImagesItemsPourSon(son.id));
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [erreur, setErreur] = useState(false);
  const [fini, setFini] = useState<{ score: number; total: number } | null>(null);
  const item = items[index];
  const syllabesConsigne = useMemo(() => getSyllabesCV(son), [son]);
  const texteConsigne = syllabesConsigne.length > 0
    ? `Clique sur la partie du mot qui contient le son (${syllabesConsigne.join(", ")}).`
    : `Clique sur la partie du mot qui contient le son ${son.id === "e-accent" ? "é/è/ê" : son.grapheme}.`;

  useEffect(() => {
    if (item?.mot) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourMot(item.mot), "fr-FR"), 300);
    }
  }, [index, item?.mot]);

  const reecouter = useCallback(() => {
    if (item?.mot) speak(getTextePourMot(item.mot), "fr-FR");
  }, [item?.mot]);

  const handleClick = useCallback(
    (syllabe: string) => {
      if (!item) return;
      if (syllabe === item.bonneSyllabe) {
        setSucces((s) => s + 1);
        if (index + 1 >= items.length) {
          setFini({ score: succes + 1, total: items.length });
          return;
        }
        setIndex((i) => i + 1);
      } else {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
      }
    },
    [item, index, items.length, succes]
  );

  const handleContinuer = useCallback(() => {
    if (fini) onTermine(fini.score >= Math.ceil(fini.total * 0.6));
  }, [fini, onTermine]);

  const handleRecommencer = useCallback(() => {
    setFini(null);
    setIndex(0);
    setSucces(0);
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white/95 p-8 text-center shadow-lg">
        <p className="text-lg text-[#2d4a3e]">Sons images — À venir pour ce son.</p>
      </div>
    );
  }

  if (fini) {
    return (
      <ResultatPartie
        score={fini.score}
        total={fini.total}
        onContinuer={handleContinuer}
        onRecommencer={handleRecommencer}
      />
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-[#ffd4a3]/30 px-4 py-2 text-center">
        <p className="text-sm text-[#2d4a3e]/80">Points</p>
        <p className="text-2xl font-bold text-[#2d4a3e]">{succes} sur {items.length}</p>
        <p className="text-sm text-[#2d4a3e]/70">Question {index + 1} sur {items.length}</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-lg text-[#2d4a3e]/90">
          {texteConsigne}
        </p>
        <div
          className={`flex flex-wrap justify-center items-baseline gap-0.5 sm:gap-1 ${item.enCursive ? "font-cursive" : ""}`}
          style={item.enCursive ? { fontFamily: "var(--font-cursive), 'Comic Sans MS', cursive" } : undefined}
        >
          {item.syllabes.map((syl, i) => (
            <button
              key={`${index}-${i}-${syl}`}
              type="button"
              onClick={() => handleClick(syl)}
              className={`rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-2xl sm:text-3xl font-bold text-[#2d4a3e] transition hover:bg-[#ffd4a3]/50 hover:scale-105 ${erreur ? "animate-shake bg-red-100" : "bg-transparent"}`}
            >
              {syl}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reecouter}
          className="flex items-center gap-2 rounded-xl bg-[#ffd4a3]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#ffd4a3]"
        >
          🔊 Réécouter le mot
        </button>
      </div>
      {erreur && (
        <p className="text-center text-red-600 font-medium">Non, réessaie !</p>
      )}
    </div>
  );
}

// ——— Exercices d'évaluation (4 types) ———
type ItemEntoureSon = { mot: string; emoji: string; image?: string; contientSon: boolean };
type ItemRepère = { mot: string; emoji: string; image?: string; positionSon: number; nbSyllabes: number };
type ItemSyllabe = { mot: string; emoji: string; image?: string; syllabeCorrecte: string; syllabeDistracteur: string };
type ItemSyllabeManquante = { mot: string; emoji: string; image?: string; prefix: string; suffix: string; syllabe: string };
type ItemEntoureLettre = { lettres: string[]; indicesCibles: number[] };

function getMotAvecSyllabeManquante(item: { mot: string; prefix?: string; suffix?: string; syllabe: string }) {
  // Cas explicite demandé : afficher "vali" puis laisser l'enfant écrire "se".
  if (item.mot.toLowerCase() === "valise" && item.syllabe.toLowerCase() === "se") {
    return { prefix: "vali", suffix: "" };
  }
  return { prefix: item.prefix ?? "", suffix: item.suffix ?? "" };
}

/** Affiche l’emoji ou l’image personnalisée (ex. tube de colle). */
function MotVisuel({
  item,
  size = "md",
}: {
  item: { mot: string; emoji: string; image?: string };
  size?: "sm" | "md" | "lg";
}) {
  if (item.image) {
    const h = size === "sm" ? "h-12" : size === "md" ? "h-14" : "h-20";
    return <img src={item.image} alt={item.mot} className={`${h} w-auto object-contain`} />;
  }
  const textSize = size === "sm" ? "text-4xl" : size === "md" ? "text-5xl" : "text-8xl";
  return (
    <span className={textSize} role="img" aria-hidden>
      {item.emoji}
    </span>
  );
}

function ExoEvalEntoureSon({
  son,
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  son: Son;
  items: ItemEntoureSon[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [envoye, setEnvoye] = useState(false);
  const grapheme = son.grapheme.split(",")[0].trim();

  const toggle = useCallback((i: number) => {
    if (envoye) return;
    setSelection((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, [envoye]);

  const points = useMemo(() => {
    let p = 0;
    items.forEach((x, i) => {
      if (x.contientSon && selection.has(i)) p++;
    });
    return p;
  }, [items, selection]);

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Entoure le dessin si tu entends le son « {grapheme} ».
      </p>
      <button
        type="button"
        onClick={() => {
          window.speechSynthesis?.cancel();
          const phrase =
            grapheme.length === 1
              ? `Entoure les images si tu entends le son. La lettre : ${grapheme}.`
              : `Entoure les images si tu entends le son ${grapheme}.`;
          speak(phrase, "fr-FR");
        }}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Écouter la consigne
      </button>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((x, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => toggle(i)}
            onKeyDown={(e) => e.key === "Enter" && toggle(i)}
            className={`flex flex-col items-center rounded-xl border-2 p-3 transition cursor-pointer ${
              selection.has(i)
                ? "border-[#4a7c5a] bg-[#a8d5ba]/50"
                : "border-transparent bg-white/90"
            }`}
          >
            <MotVisuel item={x} size="sm" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speak(getTextePourMot(x.mot), "fr-FR");
              }}
              className="mt-1 flex items-center justify-center rounded-lg p-1 text-[#2d4a3e]/80 hover:bg-[#a8d5ba]/50 hover:text-[#2d4a3e]"
              title="Écouter le mot"
              aria-label="Écouter le mot"
            >
              <span className="text-xl">🔊</span>
            </button>
          </div>
        ))}
      </div>
      {!envoye ? (
        <button
          type="button"
          onClick={() => setEnvoye(true)}
          className="mx-auto mt-4 block rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
        >
          Valider
        </button>
      ) : (
        <p className="mt-4 text-center text-sm font-medium text-[#2d4a3e]">
          Points : {points} / {pointsMax}
        </p>
      )}
      {envoye && (
        <button
          type="button"
          onClick={() => onTermine(points)}
          className="mx-auto mt-2 block text-sm text-[#2d4a3e]/70 underline"
        >
          Suivant →
        </button>
      )}
    </div>
  );
}

function ExoEvalRepèreSon({
  son,
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  son: Son;
  items: ItemRepère[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [reponses, setReponses] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const item = items[index];

  useEffect(() => {
    if (item) {
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourMot(item.mot), "fr-FR"), 150);
    }
  }, [index, item]);

  const handleClick = useCallback(
    (pos: number) => {
      if (!item) return;
      const correct = pos === item.positionSon;
      setReponses((r) => ({ ...r, [index]: pos }));
      setPoints((p) => p + (correct ? 1 : 0));
      if (index + 1 >= items.length) {
        onTermine(points + (correct ? 1 : 0));
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, index, items.length, points, onTermine]
  );

  if (!item) return null;

  const grapheme = son.grapheme.split(",")[0].trim();
  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Repère le son « {grapheme} » : fais une croix dans la case où tu l&apos;entends.
      </p>
      <button
        type="button"
        onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter le mot
      </button>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <MotVisuel item={item} size="md" />
          <button
            type="button"
            onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
            className="mt-2 flex items-center justify-center rounded-lg p-2 text-[#2d4a3e]/80 hover:bg-[#a8d5ba]/50 hover:text-[#2d4a3e]"
            title="Écouter le mot"
            aria-label="Écouter le mot"
          >
            <span className="text-2xl">🔊</span>
          </button>
        </div>
        <div className="flex gap-3">
          {Array.from({ length: Math.max(2, item.nbSyllabes ?? 2) }, (_, i) => i + 1).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handleClick(pos)}
              className={`h-12 w-12 rounded-xl border-2 text-lg font-bold ${
                reponses[index] === pos
                  ? "border-[#4a7c5a] bg-[#a8d5ba]"
                  : "border-[#2d4a3e]/30 bg-white"
              }`}
            >
              {reponses[index] === pos ? "✗" : ""}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {items.length}
      </p>
    </div>
  );
}

function ExoEvalEntoureSyllabe({
  son,
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  son: Son;
  items: ItemSyllabe[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const item = items[index];
  const options = useMemo(
    () => (item ? [item.syllabeCorrecte, item.syllabeDistracteur].sort(() => Math.random() - 0.5) : []),
    [item, index]
  );

  useEffect(() => {
    if (item) {
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourMot(item.mot), "fr-FR"), 150);
    }
  }, [index, item]);

  const handleClick = useCallback(
    (syll: string) => {
      if (!item) return;
      const correct = syll === item.syllabeCorrecte;
      setPoints((p) => p + (correct ? 1 : 0));
      if (index + 1 >= items.length) {
        onTermine(points + (correct ? 1 : 0));
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, index, items.length, points, onTermine]
  );

  if (!item || !options.length) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Entoure la syllabe que tu entends dans le mot.
      </p>
      <button
        type="button"
        onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <MotVisuel item={item} size="md" />
          <button
            type="button"
            onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
            className="mt-2 flex items-center justify-center rounded-lg p-2 text-[#2d4a3e]/80 hover:bg-[#a8d5ba]/50 hover:text-[#2d4a3e]"
            title="Écouter le mot"
            aria-label="Écouter le mot"
          >
            <span className="text-2xl">🔊</span>
          </button>
        </div>
        <div className="flex gap-4">
          {options.map((syll, i) => (
            <button
              key={`syll-${index}-${i}`}
              type="button"
              onClick={() => handleClick(syll)}
              className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-2xl font-bold text-[#2d4a3e] transition hover:bg-[#a8d5ba]/30"
            >
              {syll}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {items.length}
      </p>
    </div>
  );
}

function ExoEvalEcrisSyllabe({
  son,
  items,
  pointsMax,
  onTermine,
  canvasKey,
  exoNum,
}: {
  son: Son;
  items: ItemSyllabeManquante[];
  pointsMax: number;
  onTermine: (points: number) => void;
  canvasKey: number;
  exoNum: number;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [reponse, setReponse] = useState("");
  const item = items[index];
  const motAffiche = item ? getMotAvecSyllabeManquante(item) : null;

  useEffect(() => {
    if (item) {
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourMot(item.mot), "fr-FR"), 150);
    }
  }, [index, item]);

  const handleValider = useCallback(() => {
    if (!item) return;
    const correct = reponse.trim().toLowerCase() === item.syllabe.toLowerCase();
    setPoints((p) => p + (correct ? 1 : 0));
    setReponse("");
    if (index + 1 >= items.length) {
      onTermine(points + (correct ? 1 : 0));
      return;
    }
    setIndex((i) => i + 1);
  }, [item, reponse, index, items.length, points, onTermine]);

  if (!item) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Écris la syllabe qui manque dans le mot.
      </p>
      <button
        type="button"
        onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <MotVisuel item={item} size="md" />
          <button
            type="button"
            onClick={() => speak(getTextePourMot(item.mot), "fr-FR")}
            className="mt-2 flex items-center justify-center rounded-lg p-2 text-[#2d4a3e]/80 hover:bg-[#a8d5ba]/50 hover:text-[#2d4a3e]"
            title="Écouter le mot"
            aria-label="Écouter le mot"
          >
            <span className="text-2xl">🔊</span>
          </button>
        </div>
        <p className="font-cursive text-2xl font-medium text-[#2d4a3e]">
          {motAffiche?.prefix ?? ""}
          <span className="inline-block min-w-[80px] border-b-2 border-[#2d4a3e]/40 px-2">
            {reponse || "..."}
          </span>
          {motAffiche?.suffix ?? ""}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            placeholder="syllabe"
            className="rounded-xl border-2 border-[#2d4a3e]/30 px-4 py-2 text-lg font-cursive"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleValider}
            className="rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
          >
            Valider
          </button>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {items.length}
      </p>
    </div>
  );
}

// ——— Exo : Entoure la lettre/le son dans le mot ———
function ExoEvalEntoureLettreDansMot({
  son,
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  son: Son;
  items: ItemEntoureLettreDansMot[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [aValide, setAValide] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const item = items[index];
  const grapheme = son.grapheme.split(",")[0].trim();
  const lettres = item ? item.word.split("") : [];

  const toggle = useCallback((i: number) => {
    if (aValide) return;
    setSelection((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, [aValide]);

  const handleValider = useCallback(() => {
    if (!item) return;
    const selected = [...selection].sort((a, b) => a - b);
    const cibles = [...item.targetIndices].sort((a, b) => a - b);
    const ok =
      selected.length === cibles.length &&
      selected.every((v, i) => v === cibles[i]);
    setCorrect(ok);
    setAValide(true);
  }, [item, selection]);

  const handleSuivant = useCallback(() => {
    const totalPoints = points + (correct ? 1 : 0);
    setSelection(new Set());
    setAValide(false);
    setCorrect(null);
    if (index + 1 >= items.length) {
      onTermine(totalPoints);
      return;
    }
    setPoints(totalPoints);
    setIndex((i) => i + 1);
  }, [index, items.length, points, correct, onTermine]);

  if (!item) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Clique sur la lettre (ou les lettres) du son « {grapheme} » dans le mot.
      </p>
      <div className="mb-4 flex flex-wrap justify-center gap-1">
        {lettres.map((lettre, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`font-cursive min-w-[2.5rem] rounded-xl border-2 px-2 py-2 text-2xl font-bold transition ${
              selection.has(i)
                ? "border-[#4a7c5a] bg-[#a8d5ba] text-[#2d4a3e]"
                : "border-[#2d4a3e]/30 bg-white text-[#2d4a3e]"
            } ${aValide && item.targetIndices.includes(i) ? "ring-2 ring-[#4a7c5a]" : ""}`}
          >
            {lettre}
          </button>
        ))}
      </div>
      {!aValide ? (
        <button
          type="button"
          onClick={handleValider}
          className="mx-auto block rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
        >
          Valider
        </button>
      ) : (
        <div className="space-y-2">
          <p className={`text-center font-semibold ${correct ? "text-[#4a7c5a]" : "text-[#c45c4a]"}`}>
            {correct ? "Bravo !" : "Pas tout à fait. La bonne réponse était la lettre du son « " + grapheme + " »."}
          </p>
          <button
            type="button"
            onClick={handleSuivant}
            className="mx-auto block rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
          >
            Suivant
          </button>
        </div>
      )}
      <p className="mt-4 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {items.length} — Points : {points + (aValide && correct ? 1 : 0)} / {pointsMax}
      </p>
    </div>
  );
}

function ExoEvalEntoureLettre({
  son,
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  son: Son;
  items: ItemEntoureLettre[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const item = items[index];
  const grapheme = son.grapheme.split(",")[0].trim();

  const toggle = useCallback((i: number) => {
    setSelection((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const handleValider = useCallback(() => {
    if (!item) return;
    const correct = selection.size === item.indicesCibles.length &&
      item.indicesCibles.every((c) => selection.has(c));
    setPoints((p) => p + (correct ? 1 : 0));
    setSelection(new Set());
    if (index + 1 >= items.length) {
      onTermine(points + (correct ? 1 : 0));
      return;
    }
    setIndex((i) => i + 1);
  }, [item, selection, index, items.length, points, onTermine]);

  if (!item) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Entoure la lettre « <span className="font-cursive text-2xl font-bold">{grapheme}</span> » dans cette série.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {item.lettres.map((lettre, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`font-cursive h-12 w-12 rounded-xl border-2 text-2xl font-bold ${
              selection.has(i) ? "border-[#4a7c5a] bg-[#a8d5ba]" : "border-[#2d4a3e]/30 bg-white"
            }`}
          >
            {lettre}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleValider}
        className="mx-auto mt-4 block rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
      >
        Valider
      </button>
      <p className="mt-4 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {items.length}
      </p>
    </div>
  );
}

function ExoEvalArticleLeLa({
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  items: ItemArticleLeLa[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const item = items[index];

  const handleChoix = useCallback(
    (article: "le" | "la") => {
      if (!item) return;
      if (article === item.article) setPoints((p) => p + 1);
      if (index + 1 >= items.length) {
        onTermine(points + (article === item.article ? 1 : 0));
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, index, items.length, points, onTermine]
  );

  if (!item) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Écris <strong>le</strong> ou <strong>la</strong> devant le mot.
      </p>
      <p className="mb-2 text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} sur {items.length}
      </p>
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-2xl font-bold text-[#2d4a3e]">{item.mot}</p>
        <p className="text-center text-sm text-[#2d4a3e]/80">Choisis l&apos;article :</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleChoix("le")}
            className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]"
          >
            le
          </button>
          <button
            type="button"
            onClick={() => handleChoix("la")}
            className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]"
          >
            la
          </button>
        </div>
      </div>
    </div>
  );
}

/** Exercice Phono : le/la ou un/une (4 le/la + 2 un/une), mots commençant par la lettre. */
function ExoPhonoArticle({
  items,
  onTermine,
  themeBg = "bg-[#a8d5ba]/30",
}: {
  items: ItemArticlePhono[];
  onTermine: (points: number) => void;
  themeBg?: string;
}) {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const item = items[index];

  const handleChoix = useCallback(
    (choix: "le" | "la" | "un" | "une") => {
      if (!item) return;
      if (choix === item.article) setPoints((p) => p + 1);
      if (index + 1 >= items.length) {
        onTermine(points + (choix === item.article ? 1 : 0));
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, index, items.length, points, onTermine]
  );

  if (!item) return null;

  const isLeLa = item.article === "le" || item.article === "la";

  return (
    <div className="space-y-6">
      <p className="text-center text-lg text-[#2d4a3e]">
        Choisis <strong>le</strong> ou <strong>la</strong>, ou <strong>un</strong> ou <strong>une</strong> devant le mot.
      </p>
      <div className={`rounded-xl ${themeBg} px-4 py-2 text-center`}>
        <p className="text-sm text-[#2d4a3e]/80">Question {index + 1} sur {items.length}</p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-2xl font-bold text-[#2d4a3e]">{item.mot}</p>
        <p className="text-center text-sm text-[#2d4a3e]/80">Choisis l&apos;article :</p>
        <div className="flex gap-4">
          {isLeLa ? (
            <>
              <button type="button" onClick={() => handleChoix("le")} className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]">le</button>
              <button type="button" onClick={() => handleChoix("la")} className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]">la</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => handleChoix("un")} className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]">un</button>
              <button type="button" onClick={() => handleChoix("une")} className="rounded-2xl border-2 border-[#2d4a3e]/30 bg-white px-8 py-4 text-xl font-bold text-[#2d4a3e] shadow transition hover:bg-[#a8d5ba]/40 hover:border-[#4a7c5a]">une</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ExoEvalRelieEcritures({
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  items: ItemRelieEcritures[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const data = items[0];
  const wordsCursive = useMemo(() => data?.words ?? [], [data]);
  const wordsPrint = useMemo(() => {
    const w = [...(data?.words ?? [])];
    for (let i = w.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [w[i], w[j]] = [w[j], w[i]];
    }
    return w;
  }, [data]);
  const [slotContent, setSlotContent] = useState<(number | null)[]>(() =>
    Array(wordsCursive.length).fill(null)
  );
  // Sur tablette, le drag & drop natif ne marche souvent pas : on ajoute un mode "toucher" (tap-to-place).
  // 1) Tap sur un mot imprimé => selectedPrintIndex
  // 2) Tap sur le bon emplacement => on place le mot
  const [selectedPrintIndex, setSelectedPrintIndex] = useState<number | null>(null);
  const placedPrintIndices = useMemo(() => new Set(slotContent.filter((x): x is number => x !== null)), [slotContent]);
  const allCorrect = slotContent.every((printIdx, i) => printIdx !== null && wordsPrint[printIdx] === wordsCursive[i]);

  useEffect(() => {
    if (allCorrect && wordsCursive.length > 0) {
      onTermine(pointsMax);
    }
  }, [allCorrect, wordsCursive.length, onTermine, pointsMax]);

  const tryPlace = useCallback(
    (printIndex: number, slotIndex: number) => {
      if (Number.isNaN(printIndex)) return;
      if (placedPrintIndices.has(printIndex)) return;
      if (slotContent[slotIndex] !== null) return; // emplacement déjà rempli
      if (wordsPrint[printIndex] !== wordsCursive[slotIndex]) return; // pas le bon match

      setSlotContent((prev) => {
        const next = [...prev];
        next[slotIndex] = printIndex;
        return next;
      });
      setSelectedPrintIndex(null); // placement réussi
    },
    [placedPrintIndices, slotContent, wordsCursive, wordsPrint]
  );

  const handleDragStart = useCallback((e: React.DragEvent, printIndex: number) => {
    setSelectedPrintIndex(null);
    e.dataTransfer.setData("text/plain", String(printIndex));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      const printIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (Number.isNaN(printIndex)) return;
      tryPlace(printIndex, slotIndex);
    },
    [tryPlace]
  );

  if (!data || wordsCursive.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Relie le mot en belle écriture au même mot en imprimé. Dépose chaque mot imprimé sur le bon mot.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
        <div className="flex flex-col gap-3">
          {wordsCursive.map((mot, i) => (
            <div
              key={i}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onPointerDown={(e) => {
                if (e.pointerType !== "touch") return;
                // Tap-to-place : on ne place que si un mot imprimé est sélectionné.
                if (selectedPrintIndex === null) return;
                e.preventDefault();
                tryPlace(selectedPrintIndex, i);
              }}
              onTouchStart={(e) => {
                if (selectedPrintIndex === null) return;
                e.preventDefault();
                tryPlace(selectedPrintIndex, i);
              }}
              style={{ touchAction: "none" }}
              className={`min-h-[52px] min-w-[140px] rounded-xl border-2 border-dashed p-3 text-center text-xl ${
                slotContent[i] !== null
                  ? "border-[#4a7c5a] bg-[#a8d5ba]/40"
                  : selectedPrintIndex !== null && wordsPrint[selectedPrintIndex] === wordsCursive[i]
                    ? "border-[#4a7c5a]/80 bg-[#a8d5ba]/20"
                    : "border-[#2d4a3e]/30 bg-white"
              }`}
            >
              {slotContent[i] !== null ? (
                <>
                  <span className="block font-cursive text-xl font-semibold text-[#2d4a3e]">{wordsCursive[i]}</span>
                  <span className="block text-sm font-medium text-[#2d4a3e]/80">{wordsPrint[slotContent[i]!]}</span>
                </>
              ) : (
                <span className="font-cursive text-2xl font-semibold text-[#2d4a3e]">{mot}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:mt-0">
          {wordsPrint.map((mot, j) =>
            placedPrintIndices.has(j) ? null : (
              <div
                key={j}
                draggable
                onDragStart={(e) => handleDragStart(e, j)}
                onPointerDown={(e) => {
                  if (e.pointerType !== "touch") return;
                  if (placedPrintIndices.has(j)) return;
                  e.preventDefault();
                  setSelectedPrintIndex(j);
                }}
                onTouchStart={(e) => {
                  if (placedPrintIndices.has(j)) return;
                  e.preventDefault();
                  setSelectedPrintIndex(j);
                }}
                style={{ touchAction: "none" }}
                className={`cursor-grab rounded-xl border-2 border-[#2d4a3e]/30 bg-white px-4 py-2 text-center text-lg font-medium text-[#2d4a3e] active:cursor-grabbing ${
                  selectedPrintIndex === j ? "ring-2 ring-[#4a7c5a]" : ""
                }`}
              >
                {mot}
              </div>
            )
          )}
        </div>
      </div>
      {allCorrect && (
        <p className="mt-4 text-center font-semibold text-[#4a7c5a]">Bravo ! Tous les mots sont bien associés.</p>
      )}
    </div>
  );
}

function ExoEvalImageDeuxMots({
  items,
  pointsMax,
  onTermine,
  exoNum,
}: {
  items: ItemImageDeuxMots[];
  pointsMax: number;
  onTermine: (points: number) => void;
  exoNum: number;
}) {
  const [selection, setSelection] = useState<(0 | 1 | null)[]>(() => items.map(() => null));
  const [envoye, setEnvoye] = useState(false);
  const itemsWithOrder = useMemo(
    () =>
      items.map((it, i) => ({
        ...it,
        mots: (i + exoNum) % 2 === 0 ? [it.motCorrect, it.motDistracteur] : [it.motDistracteur, it.motCorrect],
      })),
    [items, exoNum]
  );

  const choose = useCallback(
    (itemIndex: number, wordIndex: 0 | 1) => {
      if (envoye) return;
      setSelection((prev) => {
        const next = [...prev];
        next[itemIndex] = prev[itemIndex] === wordIndex ? null : wordIndex;
        return next;
      });
    },
    [envoye]
  );

  const points = useMemo(() => {
    let p = 0;
    itemsWithOrder.forEach((it, i) => {
      if (selection[i] !== null && it.mots[selection[i]!] === it.motCorrect) p++;
    });
    return p;
  }, [itemsWithOrder, selection]);

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Choisis le mot qui correspond à l&apos;image. Lis les deux mots, puis clique sur le bon.
      </p>
      <button
        type="button"
        onClick={() => {
          window.speechSynthesis?.cancel();
          speak("Choisis le mot qui correspond à l'image. Lis les deux mots puis clique sur le bon.", "fr-FR");
        }}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Écouter la consigne
      </button>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itemsWithOrder.map((it, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-[#2d4a3e]/15 bg-[#fef9f3] p-4"
          >
            {it.image ? (
              <img src={it.image} alt="" className="h-14 w-auto object-contain" />
            ) : (
              <span className="text-5xl" role="img" aria-hidden>
                {it.emoji}
              </span>
            )}
            <div className="flex w-full flex-wrap justify-center gap-2">
              {it.mots.map((mot, wordIdx) => (
                <button
                  key={wordIdx}
                  type="button"
                  onClick={() => choose(idx, wordIdx as 0 | 1)}
                  className={`rounded-xl border-2 px-4 py-2 text-base font-medium transition ${
                    selection[idx] === wordIdx
                      ? "border-[#4a7c5a] bg-[#a8d5ba]/50 text-[#2d4a3e]"
                      : "border-[#2d4a3e]/25 bg-white text-[#2d4a3e] hover:bg-[#e8f0e9]"
                  }`}
                >
                  {mot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!envoye ? (
        <button
          type="button"
          onClick={() => setEnvoye(true)}
          className="mx-auto mt-6 block rounded-xl bg-[#4a7c5a] px-6 py-2 font-bold text-white"
        >
          Valider
        </button>
      ) : (
        <p className="mt-4 text-center text-sm font-medium text-[#2d4a3e]">
          Points : {points} / {pointsMax}
        </p>
      )}
      {envoye && (
        <button
          type="button"
          onClick={() => onTermine(points)}
          className="mx-auto mt-3 block rounded-xl bg-[#2d4a3e] px-6 py-2 font-medium text-white"
        >
          Exercice suivant
        </button>
      )}
    </div>
  );
}

const TITRES_EXO_EVAL: Record<string, string> = {
  "entoure-son": "Entoure le son",
  "repere-son": "Repère le son",
  "entoure-syllabe": "Entoure la syllabe",
  "ecris-syllabe": "Écris la syllabe",
  "entoure-lettre": "Entoure la lettre",
  "entoure-lettre-dans-mot": "Entoure la lettre dans le mot",
  "relie-ecritures": "Relie les écritures",
  "article-le-la": "Le ou la devant le mot",
  "image-deux-mots": "Choisis le mot qui correspond à l'image",
};

const EVAL_EXO_INDEX_REGEX = /-eval-\d+-(\d+)$/;

function JeuEval({ son, niveau, onTermine }: PropsJeu) {
  const series = useMemo(
    () => getExercicesEval(son, niveau.numero, niveau.numero),
    [son, niveau]
  );
  const singleExoIndex = useMemo(() => {
    const m = niveau.id.match(EVAL_EXO_INDEX_REGEX);
    return m ? parseInt(m[1], 10) : null;
  }, [niveau.id]);
  const [exoIndex, setExoIndex] = useState(singleExoIndex ?? 0);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);
  const [exercicesDetail, setExercicesDetail] = useState<DetailExerciceEval[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);

  const exo = series[exoIndex];
  if (!exo) {
    const reussi = pointsMaxTotal > 0 && pointsTotal >= Math.ceil(pointsMaxTotal * SEUIL_SUCCES);
    onTermine(reussi, { points: pointsTotal, pointsMax: pointsMaxTotal, exercices: exercicesDetail });
    return null;
  }

  const handleExoTermine = useCallback(
    (points: number) => {
      const newTotal = pointsTotal + points;
      const newMax = pointsMaxTotal + exo.pointsMax;
      const titre = TITRES_EXO_EVAL[exo.type] ?? exo.type;
      const detail: DetailExerciceEval = { type: exo.type, titre, points, pointsMax: exo.pointsMax };
      setPointsTotal(newTotal);
      setPointsMaxTotal(newMax);
      setExercicesDetail((prev) => [...prev, detail]);
      if (singleExoIndex !== null) {
        const reussi = newMax > 0 && newTotal >= Math.ceil(newMax * SEUIL_SUCCES);
        onTermine(reussi, { points: newTotal, pointsMax: newMax, exercices: [detail] });
        return;
      }
      if (exoIndex + 1 >= series.length) {
        const reussi = newMax > 0 && newTotal >= Math.ceil(newMax * SEUIL_SUCCES);
        onTermine(reussi, {
          points: newTotal,
          pointsMax: newMax,
          exercices: [...exercicesDetail, detail],
        });
        return;
      }
      setExoIndex((i) => i + 1);
      setCanvasKey((k) => k + 1);
    },
    [exo, exoIndex, series.length, pointsTotal, pointsMaxTotal, exercicesDetail, singleExoIndex, onTermine]
  );

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold text-[#2d4a3e]">
        Évaluation — Le son « {son.grapheme.split(",")[0].trim()} »
      </h2>
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Exercice {exoIndex + 1} sur {singleExoIndex !== null ? 1 : series.length}
      </p>
      {exo.type === "entoure-son" && (
        <ExoEvalEntoureSon
          son={son}
          items={exo.items as ItemEntoureSon[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "repere-son" && (
        <ExoEvalRepèreSon
          son={son}
          items={exo.items as ItemRepère[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "entoure-syllabe" && (
        <ExoEvalEntoureSyllabe
          son={son}
          items={exo.items as ItemSyllabe[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "ecris-syllabe" && (
        <ExoEvalEcrisSyllabe
          son={son}
          items={exo.items as ItemSyllabeManquante[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          canvasKey={canvasKey}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "entoure-lettre" && (
        <ExoEvalEntoureLettre
          son={son}
          items={exo.items as ItemEntoureLettre[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "entoure-lettre-dans-mot" && (
        <ExoEvalEntoureLettreDansMot
          son={son}
          items={exo.items as ItemEntoureLettreDansMot[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "relie-ecritures" && (
        <ExoEvalRelieEcritures
          items={exo.items as ItemRelieEcritures[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "article-le-la" && (
        <ExoEvalArticleLeLa
          items={exo.items as ItemArticleLeLa[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exo.type === "image-deux-mots" && (
        <ExoEvalImageDeuxMots
          items={exo.items as ItemImageDeuxMots[]}
          pointsMax={exo.pointsMax}
          onTermine={handleExoTermine}
          exoNum={exoIndex + 1}
        />
      )}
      {exoIndex > 0 && (
        <p className="text-center text-sm text-[#2d4a3e]/70">
          Points : {pointsTotal} / {pointsMaxTotal}
        </p>
      )}
    </div>
  );
}

function JeuEvalChrono({ son, niveau, onTermine }: PropsJeu) {
  const { items } = useMemo(() => getChronoFluenceItems(son), [son]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const dureeSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started || finished || timeLeft <= 0) return;
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
  }, [started, finished]);

  const handleStop = useCallback(() => {
    if (!started || finished) return;
    setFinished(true);
    dureeSecondsRef.current = 60 - timeLeft;
  }, [started, finished, timeLeft]);

  const handleClickItem = useCallback(
    (index: number) => {
      if (!finished || score !== null) return;
      const points = index + 1;
      setScore(points);
      const pointsMax = items.length;
      const duree = dureeSecondsRef.current ?? 60;
      onTermine(true, {
        points,
        pointsMax,
        exercices: [{ type: "fluence-chrono", titre: "Fluence 1 min", points, pointsMax, duree_secondes: duree }],
      });
    },
    [finished, score, items.length, onTermine]
  );

  if (items.length === 0) {
    return <p className="text-[#2d4a3e]">Aucun contenu pour ce son.</p>;
  }

  const labelType = isConsonne(son) ? "syllabe" : "lettre";

  return (
    <div className="space-y-6">
      <h2 className="text-center text-xl font-bold text-[#2d4a3e]">
        Évaluation 4 — Fluence (1 minute) — Le son « {son.grapheme.split(",")[0].trim()} »
      </h2>

      {!started ? (
        <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6 text-center">
          <p className="mb-4 text-[#2d4a3e]">
            Tu vas lire des {labelType}s pendant 1 minute (ou arrêter avant avec le bouton Stop). Quand c&apos;est fini, clique sur la dernière {labelType} que tu as lue.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d]"
          >
            Démarrer le chrono (1 minute)
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-[#fef9f3]/80 px-4 py-3">
            <span className="text-2xl font-mono font-bold text-[#2d4a3e]">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
            {!finished && (
              <button
                type="button"
                onClick={handleStop}
                className="rounded-xl border-2 border-[#c45c4a]/60 bg-white px-5 py-2 text-base font-bold text-[#c45c4a] transition hover:bg-[#c45c4a]/10"
              >
                Stop
              </button>
            )}
            {finished && (
              <span className="text-lg font-semibold text-[#4a7c5a]">
                C&apos;est fini ! Clique sur la dernière {labelType} que tu as lue.
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleClickItem(index)}
                disabled={!finished || score !== null}
                className={`rounded-lg border-2 px-3 py-2 text-lg font-medium transition ${
                  score !== null && index < score
                    ? "border-[#4a7c5a] bg-[#a8d5ba]/50 text-[#2d4a3e]"
                    : score !== null && index === score - 1
                      ? "border-[#4a7c5a] bg-[#4a7c5a] text-white"
                      : finished && score === null
                        ? "cursor-pointer border-[#2d4a3e]/30 bg-white text-[#2d4a3e] hover:bg-[#a8d5ba]/30"
                        : "border-[#2d4a3e]/20 bg-white/80 text-[#2d4a3e]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {score !== null && (
            <p className="text-center text-lg font-semibold text-[#4a7c5a]">
              Résultat : {score} {labelType}s lus{dureeSecondsRef.current !== null && dureeSecondsRef.current < 60 ? ` en ${dureeSecondsRef.current} s` : " en 1 minute"}.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Exercice standalone : Cursives-imprimés (relie), pour les sons à partir de p. */
function JeuRelieStandalone({ son, onTermine }: PropsJeu) {
  const seed = useMemo(() => (son.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10000) + 1, [son.id]);
  const items = useMemo(() => getRelieEcrituresItemsPourPhono(son, 5, seed), [son, seed]);
  const pointsMax = items[0]?.words.length ?? 0;

  const handleTermine = useCallback(
    (points: number) => {
      const reussi = pointsMax > 0 && points >= Math.ceil(pointsMax * SEUIL_SUCCES);
      onTermine(reussi);
    },
    [pointsMax, onTermine]
  );

  if (!items.length || pointsMax < 2) return <p className="text-[#2d4a3e]">Aucun mot disponible pour ce son.</p>;
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#2d4a3e]/80">Relie le mot en belle écriture au même mot en imprimé.</p>
      <ExoEvalRelieEcritures items={items} pointsMax={pointsMax} onTermine={handleTermine} exoNum={1} />
    </div>
  );
}

/** Exercice standalone : Article devant le nom (le/la, un/une), pour les sons à partir de p. */
function JeuArticleStandalone({ son, onTermine }: PropsJeu) {
  const seed = useMemo(() => (son.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10000) + 2, [son.id]);
  const items = useMemo(() => getArticlePhonoItems(son, seed), [son, seed]);

  const handleTermine = useCallback(
    (points: number) => {
      const pointsMax = items.length;
      const reussi = pointsMax > 0 && points >= Math.ceil(pointsMax * SEUIL_SUCCES);
      onTermine(reussi);
    },
    [items.length, onTermine]
  );

  if (!items.length) return <p className="text-[#2d4a3e]">Aucun mot disponible pour ce son.</p>;
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#2d4a3e]/80">Choisis le bon article : le ou la, un ou une.</p>
      <ExoPhonoArticle items={items} onTermine={handleTermine} themeBg="bg-[#a8d5ba]/30" />
    </div>
  );
}

/** Exercice 7 : Phrase possible ou impossible (vrai/faux), pour les sons à partir de v. */
function JeuPhrasesVraiFaux({ son, onTermine }: PropsJeu) {
  const items = useMemo(() => getPhrasesVraiFaux(son), [son]);
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);

  const handleChoix = useCallback(
    (vrai: boolean) => {
      const item = items[index];
      if (!item) return;
      if (vrai === item.vrai) setPoints((p) => p + 1);
      if (index + 1 >= items.length) {
        const pointsMax = items.length;
        const reussi = pointsMax > 0 && points + (vrai === item.vrai ? 1 : 0) >= Math.ceil(pointsMax * SEUIL_SUCCES);
        onTermine(reussi);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, items, onTermine]
  );

  if (!items.length) return <p className="text-[#2d4a3e]">Aucune phrase pour ce son.</p>;

  const item = items[index];
  if (!item) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#2d4a3e]/80">
        Est-ce que cette phrase est possible ou impossible ?
      </p>
      <p className="text-center text-lg font-medium text-[#2d4a3e]">
        {item.phrase}
      </p>
      <p className="text-center text-xs text-[#2d4a3e]/60">
        Phrase {index + 1} sur {items.length}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => handleChoix(true)}
          className="rounded-2xl bg-[#4a7c5a] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#3d6b4d] active:scale-95"
        >
          Possible
        </button>
        <button
          type="button"
          onClick={() => handleChoix(false)}
          className="rounded-2xl bg-[#c45c5c] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#a84a4a] active:scale-95"
        >
          Impossible
        </button>
      </div>
    </div>
  );
}

/** Exercice 8 : Écrire la syllabe (à partir du son v). 5 mots : on affiche prefix + __ + suffix, l'enfant écrit la syllabe. */
function JeuEcrireSyllabe({ son, onTermine }: PropsJeu) {
  const items = useMemo(() => getEcrireSyllabeItems(son), [son]);
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [reponse, setReponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const item = items[index];
  const motAffiche = item ? getMotAvecSyllabeManquante(item) : null;
  const displayBlank = motAffiche ? (motAffiche.prefix || "") + " __ " + (motAffiche.suffix || "") : "";

  useEffect(() => {
    if (!item) return;
    speak(item.mot);
  }, [index, item?.mot]);

  const handleValider = useCallback(() => {
    if (!item) return;
    const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/\u0301/g, "").replace(/\u0300/g, "e");
    const attendu = norm(item.syllabe);
    const donne = norm(reponse);
    if (donne === attendu) setPoints((p) => p + 1);
    setReponse("");
    if (index + 1 >= items.length) {
      const pointsMax = items.length;
      const reussi = pointsMax > 0 && points + (donne === attendu ? 1 : 0) >= Math.ceil(pointsMax * SEUIL_SUCCES);
      onTermine(reussi);
    } else {
      setIndex((i) => i + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [item, reponse, index, items.length, points, onTermine]);

  if (!items.length) return <p className="text-[#2d4a3e]">Aucun mot pour cet exercice.</p>;
  if (!item) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#2d4a3e]/80">
        Écoute le mot puis écris la syllabe manquante (celle avec le son {son.id === "e-accent" ? "é" : son.grapheme}).
      </p>
      <p className="text-center text-xs text-[#2d4a3e]/60">
        Mot {index + 1} sur {items.length}
      </p>
      <div className="flex flex-col items-center gap-4">
        {item.emoji && <span className="text-4xl">{item.emoji}</span>}
        <p className="font-mono text-2xl font-medium text-[#2d4a3e] tracking-wider">
          {displayBlank.trim() || " __ "}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValider()}
            placeholder="syllabe"
            className="rounded-xl border-2 border-[#2d4a3e]/30 bg-white px-4 py-3 text-lg text-[#2d4a3e] placeholder:text-[#2d4a3e]/40 focus:border-[#4a7c5a] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleValider}
            className="rounded-xl bg-[#4a7c5a] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[#3d6b4d] active:scale-95"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

export function renderJeu(
  son: Son,
  niveau: Niveau,
  onTermine: (reussi: boolean, detail?: OnTermineDetail) => void
): React.ReactNode {
  const props: PropsJeu = { son, niveau, onTermine };
  const isEvalChrono = niveau.type === "eval" && niveau.id.endsWith("eval-4");
  switch (niveau.type) {
    case "phono":
      return <JeuPhono {...props} />;
    case "phono-image":
      if (niveau.id.endsWith("-phono-image-2")) {
        return <JeuSonsImages {...props} />;
      }
      return <JeuPhonoImage {...props} />;
    case "relie":
      return <JeuRelieStandalone {...props} />;
    case "article":
      return <JeuArticleStandalone {...props} />;
    case "phrases-vrai-faux":
      return <JeuPhrasesVraiFaux {...props} />;
    case "ecrire-syllabe":
      return <JeuEcrireSyllabe {...props} />;
    case "eval":
      return isEvalChrono ? <JeuEvalChrono {...props} /> : <JeuEval {...props} />;
    default:
      return <p>Exercice non disponible.</p>;
  }
}
