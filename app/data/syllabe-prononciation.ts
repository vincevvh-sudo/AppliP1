/**
 * Texte pour la synthèse vocale (Speech Synthesis API)
 * Phono et Reconnaissance : dire uniquement la lettre (ex. "i"), pas "i comme dans lit".
 */

import type { Son } from "./sons-data";

const MOT_EXEMPLE_PAR_SON: Record<string, string> = {
  i: "lit",
  a: "chat",
  o: "mot",
  e: "petit",
  u: "lune",
  "e-accent": "été",
  m: "maman",
  l: "lune",
  r: "rat",
  s: "sac",
  n: "piscine",
  p: "palme",
  t: "tomate",
  f: "feu",
  v: "vélo",
  ch: "chat",
  j: "jupe",
  b: "ballon",
  d: "doigt",
  g: "gare",
  z: "zéro",
  "c-k": "car",
  ou: "loup",
  oi: "oiseau",
  on: "pont",
  an: "enfant",
  in: "lapin",
};

/**
 * Pour l'exercice Phono : dire uniquement la lettre/son (ex. "i"), sans "comme dans...".
 * L'enfant écoute la lettre et clique sur la bonne.
 * Pour "e" : on dit "e" (la lettre), pas "est" ni "è".
 */
export function getTextePourGrapheme(son: Son): string {
  const g = son.grapheme.split(",")[0].trim();
  // Son "e" : dire la lettre "e", pas "est"
  if (son.id === "e") return "e";
  // Son "et" (mot-outil) : dire "et" pour la TTS
  if (son.id === "et") return "et";
  // "ch" isolé : la TTS dit "cé ache" au lieu de [ʃ] → utiliser "chat"
  if (son.id === "ch") return "chat";
  return g;
}

/**
 * Pour l'exercice Reconnaissance : faire dire le mot-exemple pour les syllabes (consonne+voyelle liées).
 * Pour le son "e" : dire "e" (la lettre), pas "est".
 */
export function getTexteReconnaissance(son: Son, cible: string): string {
  if (son.id === "e") {
    return "e"; // la lettre e, pas "est"
  }
  // Pour "ch" : la TTS dit "cé ache" au lieu de [ʃ] → utiliser "chat"
  if (son.id === "ch" && cible === "ch") return "chat";
  // Syllabes (L, M, R…) : faire dire le mot-exemple pour que consonne+voyelle soient liées
  const motSyllabe = (MOT_EXEMPLE_PAR_SYLLABE as Record<string, string>)[cible.toLowerCase()];
  if (motSyllabe) return motSyllabe;
  return cible;
}

/**
 * Mots-exemples pour les syllabes (VC et CV) afin que la TTS prononce
 * "um" comme une syllabe et pas "u" "m" séparément.
 */
const MOT_EXEMPLE_PAR_SYLLABE: Record<string, string> = {
  ma: "maman",
  me: "melon",
  mi: "midi",
  mo: "moto",
  mu: "mur",
  am: "lampe",
  em: "temps",
  im: "simple",
  om: "pomme",
  um: "parfum",
  la: "lac",
  le: "lever",
  li: "lit",
  lo: "lot",
  lu: "lune",
  al: "bal",
  el: "melon",
  il: "fil",
  ol: "colle",
  ul: "bulle",
  ra: "rat",
  re: "regard",
  ré: "réveil",
  rè: "règle",
  ri: "riz",
  ro: "robot",
  ru: "rue",
  ar: "art",
  er: "mer",
  ir: "iris",
  or: "or",
  ur: "mur",
  sa: "sac",
  se: "sel",
  si: "six",
  so: "solo",
  su: "supérieur",
  as: "match",
  es: "bus",
  is: "vis",
  os: "os",
  us: "plus",
  na: "nage",
  ne: "piscine",
  ni: "nid",
  no: "note",
  nu: "nuage",
  an: "enfant",
  en: "vent",
  in: "lapin",
  on: "pont",
  un: "un",
  pa: "palme",
  pe: "pelle",
  pi: "pizza",
  po: "pomme",
  pu: "pull",
  ap: "cap",
  ep: "step",
  ip: "type",
  op: "stop",
  up: "dupe",
  ta: "table",
  te: "télé",
  té: "télé",
  ti: "tire",
  to: "tomate",
  tu: "tu",
  at: "chat",
  et: "et",
  it: "lit",
  ot: "mot",
  ut: "but",
  fa: "fa",
  fe: "fenêtre",
  fé: "café",
  fi: "fil",
  fo: "photo",
  fu: "fusée",
  af: "affiche",
  ef: "chef",
  if: "actif",
  of: "œuf",
  uf: "golf",
  va: "vache",
  ve: "veste",
  vé: "vélo",
  vi: "vitre",
  vo: "vol",
  vu: "vu",
  av: "savoir",
  ev: "rêve",
  iv: "vivre",
  ov: "trouve",
  uv: "fauve",
  cha: "chapeau",
  che: "cheval",
  chi: "chiffre",
  cho: "chocolat",
  chu: "chut",
  chè: "chèvre",
  ach: "vache",
  ech: "pêche",
  ich: "riche",
  och: "proche",
  uch: "bouche",
  ja: "jardin",
  je: "je",
  ji: "bijou",
  jo: "jockey",
  ju: "jupe",
  aj: "page",
  ej: "beige",
  ij: "village",
  oj: "loge",
  uj: "rouge",
  ba: "ballon",
  be: "belle",
  bi: "biche",
  bo: "botte",
  bu: "bus",
  ab: "arabe",
  eb: "web",
  ib: "hibou",
  ob: "robe",
  ub: "bulle",
  da: "dame",
  de: "de",
  di: "dimanche",
  do: "dos",
  du: "dur",
  ad: "ad",
  ed: "pied",
  id: "midi",
  od: "code",
  ud: "étude",
  ga: "garage",
  ge: "gant",
  gi: "girafe",
  go: "gomme",
  gu: "légume",
  ag: "bagage",
  eg: "leg",
  ig: "figue",
  og: "dog",
  ug: "rugby",
  za: "zoo",
  ze: "zéro",
  zi: "zizi",
  zo: "zéro",
  zu: "zut",
  az: "gaz",
  ez: "nez",
  iz: "riz",
  oz: "roz",
  uz: "buzz",
  ca: "car",
  ce: "cerise",
  ci: "cinéma",
  co: "copain",
  cu: "cube",
  ac: "sac",
  ec: "sec",
  ic: "stric",
  oc: "roc",
  uc: "sucre",
  ka: "kilo",
  ke: "ketchup",
  ki: "kilo",
  ko: "kola",
  ku: "kung-fu",
};

/** Pour la lettre g en Phono 2 : plusieurs mots par syllabe (garage, mygale pour ga ; gomme, escargot pour go). */
const MOTS_GA_G = ["garage", "mygale"];
const MOTS_GO_G = ["gomme", "escargot"];

/**
 * Pour Phono (L, M, R…) : faire dire le mot-exemple uniquement, pour que la TTS prononce
 * la syllabe en une seule unité (ex. "lot" → [lo] lié, pas "l" puis "o").
 * indexOptionnel : pour la lettre g (syllabes ga, go), permet d'alterner entre plusieurs mots.
 */
export function getTextePourSyllabe(syllabe: string, indexOptionnel?: number): string {
  const s = syllabe.toLowerCase();
  if (s === "ga" && indexOptionnel !== undefined) {
    return MOTS_GA_G[indexOptionnel % MOTS_GA_G.length];
  }
  if (s === "go" && indexOptionnel !== undefined) {
    return MOTS_GO_G[indexOptionnel % MOTS_GO_G.length];
  }
  const mot = MOT_EXEMPLE_PAR_SYLLABE[s];
  if (mot) {
    return mot;
  }
  return syllabe;
}

/**
 * Texte à envoyer à la TTS pour prononcer un mot correctement (en français, avec le bon son).
 * Ex. "dos" en français se dit [do] (s muet) → on fait dire "do" pour éviter "dosss".
 * "bus" : "le mot bus" pour forcer la prononciation [bys] avec le s final (éviter "but").
 */
const PRONONCIATION_MOT: Record<string, string> = {
  dos: "do",
  bus: "le mot bus",
  nœud: "neu",
  nœuds: "neu",
  noeud: "neu",
  noeuds: "neu",
};

export function getTextePourMot(mot: string): string {
  const m = mot.trim().toLowerCase();
  return PRONONCIATION_MOT[m] ?? mot;
}
