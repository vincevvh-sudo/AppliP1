"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Son, Niveau } from "../data/sons-data";
import {
  SONS,
  getDistracteurs,
  getDistracteursFromPool,
  getDistracteursSyllabes,
  getSyllabes,
  isConsonne,
  getSonsMelangesPourExercice,
  getCiblesReconnaissanceSansRepetition,
} from "../data/sons-data";
import { getMotsPhono, getMotsPhonoPourSerie, getMotAleatoire, getMotPourNiveau } from "../data/mots-phono";
import { getMotsPhonoImagePourSerie } from "../data/mots-phono-image";
import { getTextePourGrapheme, getTextePourSyllabe, getTexteReconnaissance } from "../data/syllabe-prononciation";
import { getExercicesEval, type SerieExoEval } from "../data/eval-data";

type PropsJeu = {
  son: Son;
  niveau: Niveau;
  onTermine: (reussi: boolean) => void;
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

const SEUIL_SUCCES = 0.8;

function JeuPhono({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => getSonsMelangesPourExercice(son, EXERCICES_PAR_SERIE, niveau.numero));
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [erreur, setErreur] = useState(false);
  const cible = serie[index];

  useEffect(() => {
    if (!cible) return;
    const bon = cible.grapheme.split(",")[0].trim();
    const distracteurs = serie.length > 1 ? getDistracteursFromPool(serie, cible, 3) : getDistracteurs(cible, 3);
    const tous = [bon, ...distracteurs].filter((v, i, a) => a.indexOf(v) === i);
    setOptions([...tous].sort(() => Math.random() - 0.5));
  }, [cible, serie]);

  useEffect(() => {
    if (cible && options.length) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(getTextePourGrapheme(cible), "fr-FR"), 150);
    }
  }, [index, cible, options]);

  const reecouter = useCallback(() => {
    if (cible) speak(getTextePourGrapheme(cible), "fr-FR");
  }, [cible]);

  const handleClick = useCallback(
    (g: string) => {
      if (!cible) return;
      const bon = cible.grapheme.split(",")[0].trim();
      if (g === bon) {
        setErreur(false);
        const newSucces = succes + 1;
        setSucces(newSucces);
        if (index + 1 >= serie.length) {
          onTermine(newSucces >= Math.ceil(serie.length * SEUIL_SUCCES));
          return;
        }
        setIndex((i) => i + 1);
      } else {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
      }
    },
    [cible, succes, index, serie.length, onTermine]
  );

  if (!cible || !options.length) return null;

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-[#2d4a3e]">
        Écoute le son et clique sur la bonne lettre.
      </p>
      <button
        type="button"
        onClick={reecouter}
        className="mx-auto flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#a8d5ba]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((g) => (
          <button
            key={`${g}-${index}`}
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
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {serie.length} · Succès : {succes}
      </p>
    </div>
  );
}

function JeuPhonoImage({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => getSonsMelangesPourExercice(son, EXERCICES_PAR_SERIE, niveau.numero));
  const [motsSerie] = useState(() => getMotsPhonoImagePourSerie(serie, niveau.numero).filter((x) => x.mot));
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [erreur, setErreur] = useState(false);
  const item = motsSerie[index];
  const optionsLettres = useMemo(
    () => {
      const lettres = SONS.filter((s) => s.ordre <= son.ordre).flatMap((s) =>
        s.grapheme.split(",").map((g) => g.trim()).filter(Boolean)
      );
      const uniques = [...new Set(lettres)];
      return uniques.length >= 2 ? uniques : ["i", "a", "o", "e", "é", "è"];
    },
    [son.ordre]
  );
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const current = motsSerie[index];
    if (!current || optionsLettres.length < 2) return;
    const VARIANTES_E_ACCENT = ["é", "è", "ê", "ë"];
    const bon = current.sonCible.grapheme.split(",")[0].trim();
    const estEAccent = current.sonCible.id === "e-accent";
    const bons = estEAccent ? VARIANTES_E_ACCENT.filter((v) => optionsLettres.includes(v)) : [bon];
    const dansLeMot = bons.find((v) => current.mot.includes(v));
    const affiche = (dansLeMot && optionsLettres.includes(dansLeMot)) ? dansLeMot : (bons[0] ?? bon);
    const autres = optionsLettres.filter((l) => !bons.includes(l));
    const distracteurs = [...autres].sort(() => Math.random() - 0.5).slice(0, 3);
    const tous = [affiche, ...distracteurs].filter((v, i, a) => a.indexOf(v) === i);
    setOptions([...tous].sort(() => Math.random() - 0.5));
  }, [index, motsSerie, optionsLettres]);

  useEffect(() => {
    if (item?.mot) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(item.mot, "fr-FR"), 300);
    }
  }, [index, item?.mot]);

  const reecouter = useCallback(() => {
    if (item?.mot) speak(item.mot, "fr-FR");
  }, [item?.mot]);

  const handleClick = useCallback(
    (lettre: string) => {
      if (!item) return;
      const VARIANTES_E_ACCENT = ["é", "è", "ê", "ë"];
      const bon = item.sonCible.grapheme.split(",")[0].trim();
      const estEAccent = item.sonCible.id === "e-accent";
      const correct =
        estEAccent && VARIANTES_E_ACCENT.includes(lettre) ? true : lettre === bon;
      if (!correct) {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
        return;
      }
      setErreur(false);
      const newSucces = succes + 1;
      setSucces(newSucces);
      if (index + 1 >= motsSerie.length) {
        onTermine(newSucces >= Math.ceil(motsSerie.length * SEUIL_SUCCES));
        return;
      }
      setIndex((i) => i + 1);
    },
    [item, succes, index, motsSerie.length, onTermine]
  );

  if (!item || !options.length) return null;

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-[#2d4a3e]">
        Regarde l&apos;image, écoute le mot. Quelle lettre entends-tu ?
      </p>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-3xl bg-white/95 p-8 shadow-xl">
          <span className="text-8xl" role="img" aria-hidden>
            {item.emoji}
          </span>
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
        {options.map((lettre) => (
          <button
            key={`${lettre}-${index}`}
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
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {motsSerie.length} · Succès : {succes}
      </p>
    </div>
  );
}

function JeuReconnaissance({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => getSonsMelangesPourExercice(son, EXERCICES_PAR_SERIE, niveau.numero));
  const [cibles] = useState(() => getCiblesReconnaissanceSansRepetition(serie));
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [erreur, setErreur] = useState(false);
  const cible = cibles[index];
  const sCourant = serie[index];

  useEffect(() => {
    if (!cible || !sCourant) return;
    const distracteurs = isConsonne(sCourant)
      ? getDistracteursSyllabes(sCourant, 3, cible)
      : serie.length > 1
        ? getDistracteursFromPool(serie, sCourant, 3)
        : getDistracteurs(sCourant, 3);
    const tous = [cible, ...distracteurs].filter((v, i, a) => a.indexOf(v) === i);
    setOptions([...tous].sort(() => Math.random() - 0.5));
  }, [cible, sCourant, serie]);

  useEffect(() => {
    if (cible && sCourant) {
      setErreur(false);
      window.speechSynthesis?.cancel();
      const texte = getTexteReconnaissance(sCourant, cible);
      setTimeout(() => speak(texte, "fr-FR"), 150);
    }
  }, [index, cible, sCourant]);

  const reecouter = useCallback(() => {
    if (cible && sCourant) {
      const texte = getTexteReconnaissance(sCourant, cible);
      speak(texte, "fr-FR");
    }
  }, [cible, sCourant]);

  const handleClick = useCallback(
    (opt: string) => {
      if (opt !== cible) {
        setErreur(true);
        setTimeout(() => setErreur(false), 600);
        return;
      }
      setErreur(false);
      const newSucces = succes + 1;
      setSucces(newSucces);
      if (index + 1 >= serie.length) {
        onTermine(newSucces >= Math.ceil(serie.length * SEUIL_SUCCES));
        return;
      }
      setIndex((i) => i + 1);
    },
    [cible, succes, index, serie.length, onTermine]
  );

  if (!cible || !options.length) return null;

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-[#2d4a3e]">
        Écoute et clique sur ce que tu entends.
      </p>
      <button
        type="button"
        onClick={reecouter}
        className="mx-auto flex items-center gap-2 rounded-xl bg-[#b8d4e8]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#b8d4e8]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((opt) => (
          <button
            key={`${opt}-${index}`}
            type="button"
            onClick={() => handleClick(opt)}
            className={`rounded-2xl bg-white/95 px-8 py-4 text-2xl font-bold text-[#2d4a3e] shadow-lg transition hover:scale-105 hover:bg-[#b8d4e8]/50 ${erreur ? "animate-shake bg-red-100" : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {erreur && (
        <p className="text-center text-red-600 font-medium">Non, réessaie !</p>
      )}
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {serie.length} · Succès : {succes}
      </p>
    </div>
  );
}

function CanvasEcriture({ onClear }: { onClear?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0] ?? (e as React.TouchEvent).changedTouches[0];
        if (!touch) return null;
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    },
    []
  );

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#2d4a3e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const last = lastPosRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPosRef.current = { x, y };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const coords = getCoords(e);
      if (coords) {
        isDrawingRef.current = true;
        lastPosRef.current = coords;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#2d4a3e";
            ctx.fill();
          }
        }
      }
    },
    [getCoords]
  );

  const moveDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const coords = getCoords(e);
      if (coords) {
        draw(coords.x, coords.y);
      }
    },
    [getCoords, draw]
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f8faf8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    onClear?.();
  }, [onClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#f8faf8";
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-2xl border-2 border-[#2d4a3e]/30 touch-none cursor-crosshair select-none bg-[#f8faf8]"
        style={{ touchAction: "none" }}
        onMouseDown={startDrawing}
        onMouseMove={moveDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={moveDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="mt-2 text-sm text-[#2d4a3e]/70 hover:text-[#2d4a3e] underline"
      >
        Effacer
      </button>
    </div>
  );
}

function JeuEcriture({ son, niveau, onTermine }: PropsJeu) {
  const [serie] = useState(() => getSonsMelangesPourExercice(son, EXERCICES_PAR_SERIE, niveau.numero));
  const [mots] = useState(() => getMotsPhonoPourSerie(serie, niveau.numero));
  const [index, setIndex] = useState(0);
  const [succes, setSucces] = useState(0);
  const [key, setKey] = useState(0);
  const affiche = mots[index] ?? "";

  useEffect(() => {
    if (affiche) {
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(affiche, "fr-FR"), 150);
    }
  }, [index, affiche]);

  const handleValider = useCallback(() => {
    const newSucces = succes + 1;
    setSucces(newSucces);
    if (index + 1 >= mots.length) {
      onTermine(newSucces >= Math.ceil(mots.length * SEUIL_SUCCES));
      return;
    }
    setIndex((i) => i + 1);
    setKey((k) => k + 1);
  }, [succes, index, mots.length, onTermine]);

  const handlePasser = useCallback(() => {
    if (index + 1 >= mots.length) return;
    setIndex((i) => i + 1);
    setKey((k) => k + 1);
  }, [index, mots.length]);

  if (!mots.length) return null;

  return (
    <div className="space-y-6">
      <p className="text-center text-lg text-[#2d4a3e]">
        Écoute le mot et écris-le au doigt ou à la souris.
      </p>
      <button
        type="button"
        onClick={() => speak(affiche, "fr-FR")}
        className="mx-auto flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter le mot
      </button>
      <CanvasEcriture key={key} />
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={handlePasser}
          className="rounded-xl border border-[#2d4a3e]/30 px-6 py-3 text-[#2d4a3e]"
        >
          Passer
        </button>
        <button
          type="button"
          onClick={handleValider}
          className="rounded-xl bg-[#4a7c5a] px-6 py-3 font-bold text-white"
        >
          J&apos;ai écrit !
        </button>
      </div>
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Question {index + 1} / {mots.length} · Succès : {succes}
      </p>
    </div>
  );
}

// ——— Exercices d'évaluation (4 types) ———
type ItemEntoureSon = { mot: string; emoji: string; contientSon: boolean };
type ItemRepère = { mot: string; emoji: string; positionSon: number; nbSyllabes: number };
type ItemSyllabe = { mot: string; emoji: string; syllabeCorrecte: string; syllabeDistracteur: string };
type ItemSyllabeManquante = { mot: string; emoji: string; prefix: string; suffix: string; syllabe: string };
type ItemEntoureLettre = { lettres: string[]; indicesCibles: number[] };

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
          speak(`Entoure les images si tu entends le son ${grapheme}`, "fr-FR");
        }}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Écouter la consigne
      </button>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((x, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`flex flex-col items-center rounded-xl border-2 p-3 transition ${
              selection.has(i)
                ? "border-[#4a7c5a] bg-[#a8d5ba]/50"
                : "border-transparent bg-white/90"
            }`}
          >
            <span className="text-4xl">{x.emoji}</span>
          </button>
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
      setTimeout(() => speak(item.mot, "fr-FR"), 150);
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

  return (
    <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/80 p-6">
      <p className="mb-4 text-center font-medium text-[#2d4a3e]">
        {exoNum}. Repère le son « {son.grapheme.split(",")[0].trim()} » et fais une croix dans la case.
      </p>
      <button
        type="button"
        onClick={() => speak(item.mot, "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter le mot
      </button>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-5xl">{item.emoji}</span>
        </div>
        <div className="flex gap-3">
          {Array.from({ length: item.nbSyllabes }, (_, i) => i + 1).map((pos) => (
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
      setTimeout(() => speak(item.mot, "fr-FR"), 150);
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
        onClick={() => speak(item.mot, "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">{item.emoji}</span>
        <div className="flex gap-4">
          {options.map((syll) => (
            <button
              key={syll}
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

  useEffect(() => {
    if (item) {
      window.speechSynthesis?.cancel();
      setTimeout(() => speak(item.mot, "fr-FR"), 150);
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
        onClick={() => speak(item.mot, "fr-FR")}
        className="mb-4 flex items-center gap-2 rounded-xl bg-[#a8d5ba]/60 px-4 py-2 text-sm font-medium text-[#2d4a3e]"
      >
        🔊 Réécouter
      </button>
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">{item.emoji}</span>
        <p className="font-cursive text-2xl font-medium text-[#2d4a3e]">
          {item.prefix}
          <span className="inline-block min-w-[80px] border-b-2 border-[#2d4a3e]/40 px-2">
            {reponse || "..."}
          </span>
          {item.suffix}
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
        {exoNum}. Entoure la lettre « {grapheme} » dans cette série.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {item.lettres.map((lettre, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`h-12 w-12 rounded-xl border-2 text-xl font-bold ${
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

function JeuEval({ son, niveau, onTermine }: PropsJeu) {
  const series = useMemo(
    () => getExercicesEval(son, niveau.numero, parseInt(niveau.id.split("-").pop() ?? "1", 10)),
    [son, niveau]
  );
  const [exoIndex, setExoIndex] = useState(0);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0);

  const exo = series[exoIndex];
  if (!exo) {
    const reussi = pointsMaxTotal > 0 && pointsTotal >= Math.ceil(pointsMaxTotal * SEUIL_SUCCES);
    onTermine(reussi);
    return null;
  }

  const handleExoTermine = useCallback(
    (points: number) => {
      setPointsTotal((p) => p + points);
      setPointsMaxTotal((pm) => pm + exo.pointsMax);
      if (exoIndex + 1 >= series.length) {
        const total = pointsTotal + points;
        const max = pointsMaxTotal + exo.pointsMax;
        onTermine(max > 0 && total >= Math.ceil(max * SEUIL_SUCCES));
        return;
      }
      setExoIndex((i) => i + 1);
      setCanvasKey((k) => k + 1);
    },
    [exo, exoIndex, series.length, pointsTotal, pointsMaxTotal, onTermine]
  );

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold text-[#2d4a3e]">
        Évaluation — Le son « {son.grapheme.split(",")[0].trim()} »
      </h2>
      <p className="text-center text-sm text-[#2d4a3e]/70">
        Exercice {exoIndex + 1} sur {series.length}
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
      {exoIndex > 0 && (
        <p className="text-center text-sm text-[#2d4a3e]/70">
          Points : {pointsTotal} / {pointsMaxTotal}
        </p>
      )}
    </div>
  );
}

export function renderJeu(
  son: Son,
  niveau: Niveau,
  onTermine: (reussi: boolean) => void
): React.ReactNode {
  const props: PropsJeu = { son, niveau, onTermine };
  switch (niveau.type) {
    case "phono":
      return <JeuPhono {...props} />;
    case "phono-image":
      return <JeuPhonoImage {...props} />;
    case "reconnaissance":
      return <JeuReconnaissance {...props} />;
    case "ecriture":
      return <JeuEcriture {...props} />;
    case "eval":
      return <JeuEval {...props} />;
    default:
      return <p>Exercice non disponible.</p>;
  }
}
