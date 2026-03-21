/**
 * Texte pour la synthèse vocale (Speech Synthesis API)
 * Pour les lettres seules (i, a, o, e, u, etc.), on utilise "X comme dans [mot]"
 * car la TTS prononce mal ou pas du tout une lettre isolée.
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
  n: "nez",
  p: "pain",
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

export function getTextePourGrapheme(son: Son): string {
  const g = son.grapheme.split(",")[0].trim();
  const motExemple = MOT_EXEMPLE_PAR_SON[son.id];
  if (motExemple && g.length <= 2) {
    if (son.id === "e") {
      return `Le son ${g} comme dans ${motExemple}`;
    }
    return `${g} comme dans ${motExemple}`;
  }
  return g;
}

/**
 * Pour l'exercice Reconnaissance : dire uniquement le son/syllabe, sans "comme dans...".
 * La lettre "e" est prononcée "è" pour éviter que la TTS dise "eu".
 */
export function getTexteReconnaissance(son: Son, cible: string): string {
  if (son.id === "e") {
    return "è"; // évite la prononciation "eu" du e isolé
  }
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
  ne: "nez",
  ni: "nid",
  no: "note",
  nu: "nuage",
  an: "enfant",
  en: "vent",
  in: "lapin",
  on: "pont",
  un: "un",
  pa: "pain",
  pe: "pomme",
  pi: "pizza",
  po: "porte",
  pu: "pull",
  ap: "cap",
  ep: "step",
  ip: "type",
  op: "stop",
  up: "dupe",
  ta: "table",
  te: "télé",
  ti: "lit",
  to: "tomate",
  tu: "tu",
  at: "chat",
  et: "et",
  it: "lit",
  ot: "mot",
  ut: "but",
  fa: "fa",
  fe: "fenêtre",
  fi: "fil",
  fo: "photo",
  fu: "fusée",
  af: "neuf",
  ef: "chef",
  if: "actif",
  of: "œuf",
  uf: "golf",
  va: "vache",
  ve: "vélo",
  vi: "ville",
  vo: "vol",
  vu: "vu",
  av: "savoir",
  ev: "rêve",
  iv: "vivre",
  ov: "trouve",
  uv: "fauve",
  cha: "chat",
  che: "chien",
  chi: "chiffre",
  cho: "chou",
  chu: "chut",
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
  be: "bébé",
  bi: "bis",
  bo: "ballon",
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
  ga: "gare",
  ge: "gant",
  gi: "guitare",
  go: "gomme",
  gu: "guitare",
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

export function getTextePourSyllabe(syllabe: string): string {
  const s = syllabe.toLowerCase();
  const mot = MOT_EXEMPLE_PAR_SYLLABE[s];
  if (mot) {
    return `${syllabe} comme dans ${mot}`;
  }
  return syllabe;
}
