/**
 * Lecture des sons — structure GraphoGames/Lalilo
 * Chaque son : 2 phono, 2 phono-image, 2 reconnaissance, 2 écriture, 3 eval
 */

export type TypeNiveau = "phono" | "phono-image" | "reconnaissance" | "ecriture" | "eval";

export type Niveau = {
  id: string;
  type: TypeNiveau;
  numero: number;
  titre: string;
};

export type Son = {
  id: string;
  grapheme: string;
  phoneme: string;
  ordre: number;
  niveaux: Niveau[];
};

function creerNiveaux(prefix: string, grapheme: string): Niveau[] {
  return [
    { id: `${prefix}-phono-1`, type: "phono", numero: 1, titre: "Phono 1" },
    { id: `${prefix}-phono-2`, type: "phono", numero: 2, titre: "Phono 2" },
    { id: `${prefix}-phono-image-1`, type: "phono-image", numero: 1, titre: "Phono images 1" },
    { id: `${prefix}-phono-image-2`, type: "phono-image", numero: 2, titre: "Phono images 2" },
    { id: `${prefix}-reco-1`, type: "reconnaissance", numero: 1, titre: "Reconnaissance 1" },
    { id: `${prefix}-reco-2`, type: "reconnaissance", numero: 2, titre: "Reconnaissance 2" },
    { id: `${prefix}-ecrit-1`, type: "ecriture", numero: 1, titre: "Écrire au doigt 1" },
    { id: `${prefix}-ecrit-2`, type: "ecriture", numero: 2, titre: "Écrire au doigt 2" },
    { id: `${prefix}-eval-1`, type: "eval", numero: 1, titre: "Évaluation 1" },
    { id: `${prefix}-eval-2`, type: "eval", numero: 2, titre: "Évaluation 2" },
    { id: `${prefix}-eval-3`, type: "eval", numero: 3, titre: "Évaluation 3" },
  ];
}

export const SONS: Son[] = [
  { id: "i", grapheme: "i", phoneme: "[i]", ordre: 1, niveaux: creerNiveaux("i", "i") },
  { id: "a", grapheme: "a", phoneme: "[a]", ordre: 2, niveaux: creerNiveaux("a", "a") },
  { id: "o", grapheme: "o", phoneme: "[o]", ordre: 3, niveaux: creerNiveaux("o", "o") },
  { id: "e", grapheme: "e", phoneme: "[ə]", ordre: 4, niveaux: creerNiveaux("e", "e") },
  { id: "u", grapheme: "u", phoneme: "[y]", ordre: 5, niveaux: creerNiveaux("u", "u") },
  { id: "e-accent", grapheme: "é, è, ê", phoneme: "[e], [ɛ]", ordre: 6, niveaux: creerNiveaux("e-accent", "é, è, ê") },
  { id: "m", grapheme: "m", phoneme: "[m]", ordre: 7, niveaux: creerNiveaux("m", "m") },
  { id: "l", grapheme: "l", phoneme: "[l]", ordre: 8, niveaux: creerNiveaux("l", "l") },
  { id: "r", grapheme: "r", phoneme: "[ʁ]", ordre: 9, niveaux: creerNiveaux("r", "r") },
  { id: "s", grapheme: "s", phoneme: "[s]", ordre: 10, niveaux: creerNiveaux("s", "s") },
  { id: "n", grapheme: "n", phoneme: "[n]", ordre: 11, niveaux: creerNiveaux("n", "n") },
  { id: "p", grapheme: "p", phoneme: "[p]", ordre: 12, niveaux: creerNiveaux("p", "p") },
  { id: "t", grapheme: "t", phoneme: "[t]", ordre: 13, niveaux: creerNiveaux("t", "t") },
  { id: "f", grapheme: "f", phoneme: "[f]", ordre: 14, niveaux: creerNiveaux("f", "f") },
  { id: "v", grapheme: "v", phoneme: "[v]", ordre: 15, niveaux: creerNiveaux("v", "v") },
  { id: "ch", grapheme: "ch", phoneme: "[ʃ]", ordre: 16, niveaux: creerNiveaux("ch", "ch") },
  { id: "j", grapheme: "j", phoneme: "[ʒ]", ordre: 17, niveaux: creerNiveaux("j", "j") },
  { id: "b", grapheme: "b", phoneme: "[b]", ordre: 18, niveaux: creerNiveaux("b", "b") },
  { id: "d", grapheme: "d", phoneme: "[d]", ordre: 19, niveaux: creerNiveaux("d", "d") },
  { id: "g", grapheme: "g", phoneme: "[g]", ordre: 20, niveaux: creerNiveaux("g", "g") },
  { id: "z", grapheme: "z", phoneme: "[z]", ordre: 21, niveaux: creerNiveaux("z", "z") },
  { id: "c-k", grapheme: "c, k", phoneme: "[k]", ordre: 22, niveaux: creerNiveaux("c-k", "c, k") },
  { id: "ou", grapheme: "ou", phoneme: "[u]", ordre: 23, niveaux: creerNiveaux("ou", "ou") },
  { id: "oi", grapheme: "oi", phoneme: "[wa]", ordre: 24, niveaux: creerNiveaux("oi", "oi") },
  { id: "on", grapheme: "on", phoneme: "[ɔ̃]", ordre: 25, niveaux: creerNiveaux("on", "on") },
  { id: "an", grapheme: "an", phoneme: "[ɑ̃]", ordre: 26, niveaux: creerNiveaux("an", "an") },
  { id: "in", grapheme: "in", phoneme: "[ɛ̃]", ordre: 27, niveaux: creerNiveaux("in", "in") },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getSonById(id: string): Son | undefined {
  return SONS.find((s) => s.id === id);
}

export function getNiveauById(sonId: string, niveauId: string): Niveau | undefined {
  const son = getSonById(sonId);
  return son?.niveaux.find((n) => n.id === niveauId);
}

const VOYELLES_SYLLABES = ["a", "e", "i", "o", "u"];
const CONSONNES_IDS = ["m", "l", "r", "s", "n", "p", "t", "f", "v", "ch", "j", "b", "d", "g", "z", "c-k"];

const VC_A_EVITER: Record<string, string[]> = {
  m: ["am", "em", "om"],
  n: ["an", "en", "on"],
};

function getBaseConsonne(son: Son): string {
  const g = son.grapheme.split(",")[0].trim();
  if (son.id === "c-k") return "c";
  return g;
}

export function isConsonne(son: Son): boolean {
  return CONSONNES_IDS.includes(son.id);
}

export function getSyllabes(son: Son): string[] {
  if (!isConsonne(son)) return [];
  const c = getBaseConsonne(son);
  const cv = VOYELLES_SYLLABES.map((v) => c + v);
  const vcTous = VOYELLES_SYLLABES.map((v) => v + c);
  const aEviter = VC_A_EVITER[son.id] ?? [];
  const vc = vcTous.filter((s) => !aEviter.includes(s));
  return [...cv, ...vc];
}

/** Cibles (syllabes ou graphemes) pour reconnaissance, sans répétition. */
export function getCiblesReconnaissanceSansRepetition(sons: Son[]): string[] {
  const result: string[] = [];
  const ciblesDejaVues = new Set<string>();
  for (const s of sons) {
    let cible: string;
    if (isConsonne(s)) {
      const syllabes = getSyllabes(s);
      const disponibles = syllabes.filter((c) => !ciblesDejaVues.has(c));
      const pool = disponibles.length > 0 ? disponibles : syllabes;
      cible = pool[Math.floor(Math.random() * pool.length)] ?? syllabes[0] ?? s.grapheme.split(",")[0].trim();
    } else {
      cible = s.grapheme.split(",")[0].trim();
    }
    if (cible) {
      ciblesDejaVues.add(cible);
      result.push(cible);
    }
  }
  return result;
}

export function getSonsDejaVus(son: Son): Son[] {
  return SONS.filter((s) => s.id !== son.id && s.ordre <= son.ordre);
}

export function getSonsPourEval(son: Son): Son[] {
  return shuffle(SONS.filter((s) => s.ordre <= son.ordre));
}

/**
 * Répartit les éléments pour éviter les répétitions consécutives (jamais plus de 2 identiques d'affilée).
 * Ex : [e,e,e,e,e,i,a,o] → [e,i,e,a,e,o,e,e]
 */
function distribuerMelange<T>(items: T[], getId: (t: T) => string): T[] {
  if (items.length <= 1) return items;
  const parId = new Map<string, T[]>();
  for (const t of items) {
    const id = getId(t);
    if (!parId.has(id)) parId.set(id, []);
    parId.get(id)!.push(t);
  }
  let majorite: T[] = [];
  let minorites: T[] = [];
  for (const arr of parId.values()) {
    if (arr.length > majorite.length) {
      minorites = [...minorites, ...majorite];
      majorite = arr;
    } else {
      minorites = [...minorites, ...arr];
    }
  }
  minorites = shuffle(minorites);
  const total = items.length;
  const indicesRappels = total <= 4 ? [1] : [1, Math.floor(total / 2), total - 2].slice(0, minorites.length);
  const setRappels = new Set(indicesRappels);
  const result: T[] = [];
  let iMaj = 0;
  let iMin = 0;
  for (let k = 0; k < total; k++) {
    if (setRappels.has(k) && iMin < minorites.length) {
      result.push(minorites[iMin++]);
    } else {
      result.push(majorite[iMaj++]);
    }
  }
  return result;
}

/**
 * Retourne une série de sons pour un exercice : majorité du son actuel + rappels des sons déjà vus.
 * Les rappels sont répartis pour éviter d'avoir 4 fois la même lettre d'affilée.
 */
export function getSonsMelangesPourExercice(son: Son, total = 8, niveauNumero = 1): Son[] {
  const prev = getSonsDejaVus(son);
  const nCourant = Math.max(1, Math.ceil(total * 0.6));
  const nPrev = Math.min(total - nCourant, prev.length);
  const seed = (son.id + niveauNumero).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const prevShuffled = shuffleSeeded(prev, seed);
  const serie: Son[] = [];
  for (let i = 0; i < nCourant; i++) serie.push(son);
  for (let i = 0; i < nPrev; i++) serie.push(prevShuffled[i % prevShuffled.length]);
  return distribuerMelange(serie, (s) => s.id);
}

export function getDistracteurs(son: Son, count = 3): string[] {
  const pool = getSonsDejaVus(son);
  const graphemes = pool.map((s) => s.grapheme.split(",")[0].trim());
  return shuffle([...new Set(graphemes)]).slice(0, count);
}

/** Distracteurs à partir d'un pool de sons (pour exercices mélangés). */
export function getDistracteursFromPool(sons: Son[], correctSon: Son, count = 3): string[] {
  let autres = sons.filter((s) => s.id !== correctSon.id);
  if (autres.length === 0) {
    autres = SONS.filter((s) => s.id !== correctSon.id).slice(0, 5);
  }
  const graphemes = autres.map((s) => s.grapheme.split(",")[0].trim());
  return shuffle([...new Set(graphemes)]).slice(0, count);
}

export function getSyllabesAutresConsonnes(son: Son): string[] {
  const mesSyllabes = new Set(getSyllabes(son));
  const result: string[] = [];
  for (const s of SONS) {
    if (!isConsonne(s) || s.id === son.id || s.ordre > son.ordre) continue;
    for (const syll of getSyllabes(s)) {
      if (!mesSyllabes.has(syll)) result.push(syll);
    }
  }
  return result;
}

function getSyllabesMemeConsonne(son: Son): string[] {
  return getSyllabes(son);
}

export function getDistracteursSyllabes(son: Son, count = 3, exclure?: string): string[] {
  const autresConsonnes = shuffle(getSyllabesAutresConsonnes(son));
  const memeConsonne = shuffle(getSyllabesMemeConsonne(son).filter((s) => s !== exclure));
  const result: string[] = [];
  const dejaPris = new Set<string>();
  if (exclure) dejaPris.add(exclure);
  const nAutres = Math.min(2, autresConsonnes.length, count);
  for (let i = 0; i < nAutres; i++) {
    result.push(autresConsonnes[i]);
    dejaPris.add(autresConsonnes[i]);
  }
  for (let i = 0; i < memeConsonne.length && result.length < count; i++) {
    if (!dejaPris.has(memeConsonne[i])) {
      result.push(memeConsonne[i]);
      dejaPris.add(memeConsonne[i]);
      break;
    }
  }
  for (let i = nAutres; i < autresConsonnes.length && result.length < count; i++) {
    if (!dejaPris.has(autresConsonnes[i])) result.push(autresConsonnes[i]);
  }
  return shuffle(result);
}
