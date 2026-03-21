/**
 * Lecture des sons — structure GraphoGames/Lalilo
 * Chaque son : 2 phono, 2 phono-image, 3 eval
 */

export type TypeNiveau = "phono" | "phono-image" | "eval" | "relie" | "article" | "phrases-vrai-faux" | "ecrire-syllabe";

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

const ORDRE_SON_P = 10;
const ORDRE_SON_V = 13;

function creerNiveaux(prefix: string, grapheme: string, ordre?: number): Niveau[] {
  const base: Niveau[] = [
    { id: `${prefix}-phono-1`, type: "phono", numero: 1, titre: "Phono 1" },
    { id: `${prefix}-phono-2`, type: "phono", numero: 2, titre: "Phono 2" },
    { id: `${prefix}-phono-image-1`, type: "phono-image", numero: 1, titre: "Phono images 1" },
    { id: `${prefix}-phono-image-2`, type: "phono-image", numero: 2, titre: "Sons images" },
    { id: `${prefix}-eval-1`, type: "eval", numero: 1, titre: "Évaluation 1" },
    { id: `${prefix}-eval-2`, type: "eval", numero: 2, titre: "Évaluation 2" },
    { id: `${prefix}-eval-3`, type: "eval", numero: 3, titre: "Évaluation 3" },
    { id: `${prefix}-eval-4`, type: "eval", numero: 4, titre: "Évaluation 4 (chrono 1 min)" },
  ];
  if (ordre !== undefined && ordre >= ORDRE_SON_P) {
    base.push(
      { id: `${prefix}-relie`, type: "relie", numero: 1, titre: "Cursives-imprimés" },
      { id: `${prefix}-article`, type: "article", numero: 1, titre: "Article devant le nom" }
    );
  }
  if (ordre !== undefined && ordre >= ORDRE_SON_V) {
    base.push(
      { id: `${prefix}-phrases-vrai-faux`, type: "phrases-vrai-faux", numero: 1, titre: "Phrase possible ou impossible" },
      { id: `${prefix}-ecrire-syllabe`, type: "ecrire-syllabe", numero: 1, titre: "Écrire la syllabe" }
    );
  }
  return base;
}

// Forêt des sons : I et A en ordre 0 (utilisés dans les exercices mais pas affichés comme étapes).
// La première étape affichée est O (I, A, O mélangés), puis E (I, A, O, E mélangés), etc.
export const SONS: Son[] = [
  { id: "i", grapheme: "i", phoneme: "[i]", ordre: 0, niveaux: creerNiveaux("i", "i", 0) },
  { id: "a", grapheme: "a", phoneme: "[a]", ordre: 0, niveaux: creerNiveaux("a", "a", 0) },
  { id: "o", grapheme: "o", phoneme: "[o]", ordre: 1, niveaux: creerNiveaux("o", "o", 1) },
  { id: "e", grapheme: "e", phoneme: "[ə]", ordre: 2, niveaux: creerNiveaux("e", "e", 2) },
  { id: "u", grapheme: "u", phoneme: "[y]", ordre: 3, niveaux: creerNiveaux("u", "u", 3) },
  { id: "e-accent", grapheme: "é, è, ê", phoneme: "[e], [ɛ]", ordre: 4, niveaux: creerNiveaux("e-accent", "é, è, ê", 4) },
  { id: "m", grapheme: "m", phoneme: "[m]", ordre: 5, niveaux: creerNiveaux("m", "m", 5) },
  { id: "l", grapheme: "l", phoneme: "[l]", ordre: 6, niveaux: creerNiveaux("l", "l", 6) },
  { id: "r", grapheme: "r", phoneme: "[ʁ]", ordre: 7, niveaux: creerNiveaux("r", "r", 7) },
  { id: "s", grapheme: "s", phoneme: "[s]", ordre: 8, niveaux: creerNiveaux("s", "s", 8) },
  { id: "n", grapheme: "n", phoneme: "[n]", ordre: 9, niveaux: creerNiveaux("n", "n", 9) },
  { id: "p", grapheme: "p", phoneme: "[p]", ordre: 10, niveaux: creerNiveaux("p", "p", 10) },
  { id: "t", grapheme: "t", phoneme: "[t]", ordre: 11, niveaux: creerNiveaux("t", "t", 11) },
  { id: "f", grapheme: "f", phoneme: "[f]", ordre: 12, niveaux: creerNiveaux("f", "f", 12) },
  { id: "v", grapheme: "v", phoneme: "[v]", ordre: 13, niveaux: creerNiveaux("v", "v", 13) },
  { id: "ch", grapheme: "ch", phoneme: "[ʃ]", ordre: 14, niveaux: creerNiveaux("ch", "ch", 14) },
  { id: "j", grapheme: "j", phoneme: "[ʒ]", ordre: 15, niveaux: creerNiveaux("j", "j", 15) },
  { id: "b", grapheme: "b", phoneme: "[b]", ordre: 16, niveaux: creerNiveaux("b", "b", 16) },
  { id: "d", grapheme: "d", phoneme: "[d]", ordre: 17, niveaux: creerNiveaux("d", "d", 17) },
  { id: "g", grapheme: "g", phoneme: "[g]", ordre: 18, niveaux: creerNiveaux("g", "g", 18) },
  { id: "c-k", grapheme: "c, k", phoneme: "[k]", ordre: 20, niveaux: creerNiveaux("c-k", "c, k", 20) },
  { id: "ou", grapheme: "ou", phoneme: "[u]", ordre: 21, niveaux: creerNiveaux("ou", "ou", 21) },
  { id: "oi", grapheme: "oi", phoneme: "[wa]", ordre: 22, niveaux: creerNiveaux("oi", "oi", 22) },
  { id: "on", grapheme: "on", phoneme: "[ɔ̃]", ordre: 23, niveaux: creerNiveaux("on", "on", 23) },
  { id: "an", grapheme: "an", phoneme: "[ɑ̃]", ordre: 24, niveaux: creerNiveaux("an", "an", 24) },
  { id: "in", grapheme: "in", phoneme: "[ɛ̃]", ordre: 25, niveaux: creerNiveaux("in", "in", 25) },
  { id: "et", grapheme: "et", phoneme: "[e]", ordre: 26, niveaux: creerNiveaux("et", "et", 26) },
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
  if (!id) return undefined;
  const key = id.toLowerCase();
  return SONS.find((s) => s.id === key || s.id === id);
}

/** Sons affichés dans la Forêt (exclut I et A, ordre 0). */
export function getSonsPourForet(): Son[] {
  return SONS.filter((s) => s.ordre > 0);
}

/** 5 parties de la Forêt des sons : Voyelles, Consonnes, Sons, Évaluations, Lecture. */
export type IdPartieForet = "voyelles" | "consonnes" | "sons" | "evaluations" | "lecture";

export type PartieForet = {
  id: IdPartieForet;
  titre: string;
  /** IDs des sons dans cette partie (vide pour évaluations et lecture). */
  sonIds: string[];
  isEvaluations?: boolean;
  isLecture?: boolean;
};

const VOYELLES_IDS = ["o", "u", "e", "e-accent"];
const CONSONNES_PARTIE_IDS = ["m", "l", "r", "s", "n", "p", "t", "f", "v", "ch", "j", "b", "d", "g", "c-k"];
const SONS_PARTIE_IDS = ["ou", "oi", "on", "an", "in"];

export const PARTIES_FORET: PartieForet[] = [
  { id: "voyelles", titre: "Voyelles", sonIds: VOYELLES_IDS },
  { id: "consonnes", titre: "Consonnes", sonIds: CONSONNES_PARTIE_IDS },
  { id: "sons", titre: "Sons", sonIds: SONS_PARTIE_IDS },
  { id: "evaluations", titre: "Évaluations", sonIds: [], isEvaluations: true },
  { id: "lecture", titre: "Lecture", sonIds: [], isLecture: true },
];

/** Retourne les sons d'une partie (ordre conservé). */
export function getSonsByPartie(partie: PartieForet): Son[] {
  return partie.sonIds
    .map((id) => getSonById(id))
    .filter((s): s is Son => s != null);
}

const EVAL_EXO_ID_REGEX = /^(.+)-eval-(\d+)-(\d+)$/;

export function getNiveauById(sonId: string, niveauId: string): Niveau | undefined {
  const son = getSonById(sonId);
  const niveau = son?.niveaux.find((n) => n.id === niveauId);
  if (niveau) return niveau;
  const match = niveauId.match(EVAL_EXO_ID_REGEX);
  if (match && match[1] === sonId) {
    const numEval = parseInt(match[2], 10);
    const exoIndex = parseInt(match[3], 10);
    return {
      id: niveauId,
      type: "eval",
      numero: numEval,
      titre: `Évaluation ${numEval} — Ex. ${exoIndex + 1}`,
    };
  }
  return undefined;
}

const VOYELLES_SYLLABES = ["a", "e", "i", "o", "u"];
/** Voyelles pour syllabes CV, avec variantes accentuées (lé, lè, mè…) pour que Phono Image propose des syllabes et non des lettres. */
const VOYELLES_SYLLABES_CV = ["a", "e", "é", "è", "i", "o", "u"];
const CONSONNES_IDS = ["m", "l", "r", "s", "n", "p", "t", "f", "v", "ch", "j", "b", "d", "g", "c-k"];

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
  if (son.id === "et") return ["et"];
  if (!isConsonne(son)) return [];
  const c = getBaseConsonne(son);
  const cv = VOYELLES_SYLLABES.map((v) => c + v);
  const vcTous = VOYELLES_SYLLABES.map((v) => v + c);
  const aEviter = VC_A_EVITER[son.id] ?? [];
  const vc = vcTous.filter((s) => !aEviter.includes(s));
  return [...cv, ...vc];
}

/** Syllabes consonne + voyelle (la, le, lé, lè, li, lo, lu pour L, etc.). Utilise les voyelles accentuées pour matcher des mots comme « télévision ». */
export function getSyllabesCV(son: Son): string[] {
  if (son.id === "et") return ["et"];
  if (!isConsonne(son)) return [];
  const c = getBaseConsonne(son);
  let cv = VOYELLES_SYLLABES_CV.map((v) => c + v);
  // Pour « télé », afficher la syllabe « té » et non « te » en Phono 2.
  if (son.id === "t") cv = cv.filter((s) => s !== "te");
  // Pour v : va, vo, ve, vu (vache, etc.) + vi, vé (vitre, vélo) pour Phono Image et getSyllabeCibleDansMot.
  if (son.id === "v") cv = ["va", "vo", "ve", "vu", "vi", "vé"];
  // Pour g : + gou (kangourou, gourde) pour Phono Image 1.
  if (son.id === "g") cv = [...cv, "gou"];
  return cv;
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
 * Retourne une série de sons pour un exercice : mélange équilibré du son actuel + sons déjà vus.
 * Ex. pour O : I, A, O à parts égales. Pour E : I, A, O, E à parts égales. Évite les répétitions d'affilée.
 */
export function getSonsMelangesPourExercice(son: Son, total = 8, niveauNumero = 1): Son[] {
  const prev = getSonsDejaVus(son).filter((s): s is Son => s != null && s.id != null);
  const pool = [son, ...prev].filter((s): s is Son => s != null && s.id != null);
  if (pool.length === 0) return [];
  const seed = (son.id + niveauNumero).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const poolShuffled = shuffleSeeded([...pool], seed);
  const nParSon = Math.max(1, Math.floor(total / pool.length));
  const reste = total - nParSon * pool.length;
  const serie: Son[] = [];
  for (let i = 0; i < poolShuffled.length; i++) {
    const s = poolShuffled[i];
    if (!s?.id) continue;
    const count = nParSon + (i < reste ? 1 : 0);
    for (let k = 0; k < count; k++) serie.push(s);
  }
  while (serie.length < total) {
    const next = pool[serie.length % pool.length];
    if (next) serie.push(next);
    else break;
  }
  const slice = serie.slice(0, total).filter((s): s is Son => s != null && s.id != null);
  if (slice.length < total) {
    while (slice.length < total) slice.push(pool[slice.length % pool.length]);
  }
  return distribuerMelange(slice, (s) => s.id);
}

export function getDistracteurs(son: Son, count = 3): string[] {
  const pool = getSonsDejaVus(son);
  const graphemes = pool.map((s) => s.grapheme.split(",")[0].trim());
  return shuffle([...new Set(graphemes)]).slice(0, count);
}

/** Distracteurs à partir d'un pool de sons (pour exercices mélangés). */
export function getDistracteursFromPool(sons: Son[], correctSon: Son, count = 3): string[] {
  if (!correctSon || !sons?.length) {
    return getDistracteurs(correctSon ?? getSonById("o")!, count);
  }
  const sonsValides = sons.filter((s): s is Son => s != null && typeof s.id === "string");
  let autres = sonsValides.filter((s) => s.id !== correctSon.id);
  if (autres.length === 0) {
    autres = SONS.filter((s) => s.id !== correctSon.id).slice(0, 5);
  }
  const graphemes = autres.map((s) => s.grapheme.split(",")[0].trim()).filter(Boolean);
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

/** Syllabes CV des autres consonnes déjà vues (pour Phono 1/2 en mode syllabes). */
export function getSyllabesCVAutresConsonnes(son: Son): string[] {
  const mesCV = new Set(getSyllabesCV(son));
  const result: string[] = [];
  for (const s of SONS) {
    if (!isConsonne(s) || s.id === son.id || s.ordre > son.ordre) continue;
    for (const syll of getSyllabesCV(s)) {
      if (!mesCV.has(syll)) result.push(syll);
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

/** Distracteurs en syllabes CV uniquement (pour Phono 1/2 à partir de M). */
export function getDistracteursSyllabesCV(son: Son, count = 3, exclure?: string): string[] {
  const autresCV = shuffle(getSyllabesCVAutresConsonnes(son));
  const memeCV = shuffle(getSyllabesCV(son).filter((s) => s !== exclure));
  const result: string[] = [];
  const dejaPris = new Set<string>();
  if (exclure) dejaPris.add(exclure);
  const nAutres = Math.min(2, autresCV.length, count);
  for (let i = 0; i < nAutres; i++) {
    result.push(autresCV[i]);
    dejaPris.add(autresCV[i]);
  }
  for (let i = 0; i < memeCV.length && result.length < count; i++) {
    if (!dejaPris.has(memeCV[i])) {
      result.push(memeCV[i]);
      dejaPris.add(memeCV[i]);
      break;
    }
  }
  for (let i = nAutres; i < autresCV.length && result.length < count; i++) {
    if (!dejaPris.has(autresCV[i])) result.push(autresCV[i]);
  }
  return shuffle(result);
}

/** Première syllabe CV du son qui apparaît dans le mot (pour Phono Image : une seule syllabe cible, pas ma+mi pour mamie). */
export function getSyllabeCibleDansMot(mot: string, son: Son): string | undefined {
  if (!isConsonne(son)) return undefined;
  const m = mot.toLowerCase().normalize("NFC");
  // Pour « café » avec le son f : la syllabe cible est « fé ».
  if (son.id === "f" && (m === "café" || m === "cafe")) return "fé";
  // Pour « ville » avec le son v : la syllabe cible est « vil » (vil-le).
  if (son.id === "v" && m === "ville") return "vil";
  // Pour « kangourou » et « gourde » avec le son g : la syllabe cible est « gou ».
  if (son.id === "g" && (m === "kangourou" || m === "gourde")) return "gou";
  let syllabes = getSyllabesCV(son);
  // Pour « latte » : syllabe « te ». Pour « ordinateur » : syllabe « teur ».
  if (son.id === "t") syllabes = [...syllabes, "te", "teur"];
  // Pour « affiche » : syllabe « af ».
  if (son.id === "f") syllabes = [...syllabes, "af"];
  let best: { syll: string; pos: number } | null = null;
  for (const syll of syllabes) {
    const pos = m.indexOf(syll);
    if (pos >= 0 && (best === null || pos < best.pos)) best = { syll, pos };
  }
  return best?.syll;
}
