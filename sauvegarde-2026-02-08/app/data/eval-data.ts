/**
 * Données pour les 3 évaluations par son.
 * 4 exercices par évaluation, inspirés des fiches pédagogiques CP.
 * — Les syllabes à écrire n'utilisent que des sons déjà vus (ordre).
 * — Chaque évaluation a des mots différents (variété eval 1, 2, 3).
 */

import type { Son } from "./sons-data";
import { SONS, getSonById, isConsonne, getSyllabes } from "./sons-data";
import { MOTS_PHONO_IMAGE } from "./mots-phono-image";

// Ordre min requis pour chaque graphème (la syllabe ne doit utiliser que des sons déjà vus)
const GRAPHEME_ORDRE: Record<string, number> = {};
for (const s of SONS) {
  for (const g of s.grapheme.split(",").map((x) => x.trim().toLowerCase())) {
    if (g && !(g in GRAPHEME_ORDRE)) GRAPHEME_ORDRE[g] = s.ordre;
  }
  const g0 = s.grapheme.split(",")[0].trim().toLowerCase();
  if (g0) GRAPHEME_ORDRE[g0] = s.ordre;
}
const GRAPHEMES_TRIES = Object.keys(GRAPHEME_ORDRE).sort((a, b) => b.length - a.length);

/** La syllabe n'utilise que des sons avec ordre <= son.ordre */
function syllabeUtiliseSonsAppris(syllabe: string, son: Son): boolean {
  const s = syllabe.toLowerCase();
  let rest = s;
  let ordreMax = 0;
  while (rest.length > 0) {
    let found = false;
    for (const g of GRAPHEMES_TRIES) {
      if (rest.startsWith(g)) {
        ordreMax = Math.max(ordreMax, GRAPHEME_ORDRE[g] ?? 99);
        rest = rest.slice(g.length);
        found = true;
        break;
      }
    }
    if (!found) {
      ordreMax = 99;
      rest = "";
    }
  }
  return ordreMax <= son.ordre;
}

export function getImagesEntoureLeSon(
  son: Son,
  countAvec: number,
  countSans: number,
  seed: number,
  evalOffset = 0
): { mot: string; emoji: string; contientSon: boolean }[] {
  const avec = (MOTS_PHONO_IMAGE[son.id] ?? []).slice();
  const grapheme = son.grapheme.split(",")[0].trim().toLowerCase();

  function contientSon(mot: string): boolean {
    const m = mot.toLowerCase();
    if (son.id === "c-k") return /[ckq]/.test(m);
    if (son.id === "e-accent") return /[éèêë]/.test(m);
    if (grapheme.length === 1) return m.includes(grapheme);
    return m.includes(grapheme) || (son.id === "ou" && m.includes("ou")) || (son.id === "oi" && /oi/.test(m)) || (son.id === "on" && /on/.test(m)) || (son.id === "an" && /an/.test(m)) || (son.id === "in" && /in/.test(m));
  }

  const MOTS_A_EVITER = ["maman", "papa", "bébé"];
  const avecList = (MOTS_PHONO_IMAGE[son.id] ?? [])
    .filter(
      (x) =>
        contientSon(x.mot) &&
        !MOTS_A_EVITER.includes(x.mot.toLowerCase()) &&
        motSimplePourSon(x.mot, son.ordre)
    );
  const autres = SONS.filter((x) => x.id !== son.id && x.ordre <= son.ordre);
  const sansList: { mot: string; emoji: string }[] = [];
  for (const o of autres) {
    for (const x of MOTS_PHONO_IMAGE[o.id] ?? []) {
      if (
        !contientSon(x.mot) &&
        !MOTS_A_EVITER.includes(x.mot.toLowerCase()) &&
        !avecList.some((a) => a.mot === x.mot) &&
        motSimplePourSon(x.mot, son.ordre)
      ) {
        sansList.push(x);
      }
    }
  }

  const seedR = (s: number) => {
    const x = Math.sin(s) * 10000;
    return ((x % 1) + 1) % 1; // toujours entre 0 et 1
  };
  const shuffle = <T>(arr: T[], s: number) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(seedR(s + i) * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const picksAvec = shuffle(avecList, seed);
  const picksSans = shuffle(sansList, seed + 1000);
  const offA = Math.min(evalOffset * 2, Math.max(0, avecList.length - countAvec));
  const offS = Math.min(evalOffset * 2, Math.max(0, sansList.length - countSans));
  const picksAvecF = picksAvec.slice(offA, offA + countAvec);
  const picksSansF = picksSans.slice(offS, offS + countSans);
  const melange = shuffle(
    [
      ...picksAvecF.map((x) => ({ ...x, contientSon: true })),
      ...picksSansF.map((x) => ({ ...x, contientSon: false })),
    ],
    seed + 2000
  );
  return melange;
}

// ——— Exo 2 : Repère le son, fais une croix dans la case ———
// Mot avec position du son (1, 2 ou 3 = syllabe)
type ItemRepère = { mot: string; emoji: string; positionSon: number; nbSyllabes: number };

// Mots avec le son dans UNE seule syllabe (éviter maman, papa, bébé, banane…)
const REPERE_SON: Record<string, ItemRepère[]> = {
  l: [
    { mot: "balai", emoji: "🧹", positionSon: 2, nbSyllabes: 2 },
    { mot: "lavabo", emoji: "🚿", positionSon: 1, nbSyllabes: 3 },
    { mot: "lilas", emoji: "💜", positionSon: 1, nbSyllabes: 2 },
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
    { mot: "lune", emoji: "🌙", positionSon: 1, nbSyllabes: 1 },
    { mot: "lait", emoji: "🥛", positionSon: 1, nbSyllabes: 1 },
    { mot: "lézard", emoji: "🦎", positionSon: 1, nbSyllabes: 2 },
    { mot: "règle", emoji: "📏", positionSon: 2, nbSyllabes: 1 },
  ],
  m: [
    { mot: "moto", emoji: "🏍️", positionSon: 1, nbSyllabes: 2 },
    { mot: "pomme", emoji: "🍎", positionSon: 1, nbSyllabes: 2 },
    { mot: "miel", emoji: "🍯", positionSon: 1, nbSyllabes: 2 },
    { mot: "mur", emoji: "🧱", positionSon: 1, nbSyllabes: 1 },
    { mot: "mot", emoji: "✉️", positionSon: 1, nbSyllabes: 1 },
    { mot: "marteau", emoji: "🔨", positionSon: 1, nbSyllabes: 2 },
    { mot: "midi", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "tomate", emoji: "🍅", positionSon: 2, nbSyllabes: 3 },
  ],
  r: [
    { mot: "robot", emoji: "🤖", positionSon: 1, nbSyllabes: 2 },
    { mot: "radio", emoji: "📻", positionSon: 1, nbSyllabes: 2 },
    { mot: "riz", emoji: "🍚", positionSon: 1, nbSyllabes: 1 },
    { mot: "rat", emoji: "🐀", positionSon: 1, nbSyllabes: 1 },
    { mot: "rue", emoji: "🛤️", positionSon: 1, nbSyllabes: 1 },
    { mot: "règle", emoji: "📏", positionSon: 1, nbSyllabes: 1 },
    { mot: "repas", emoji: "🍽️", positionSon: 1, nbSyllabes: 2 },
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
  ],
  s: [
    { mot: "sac", emoji: "👜", positionSon: 1, nbSyllabes: 1 },
    { mot: "salade", emoji: "🥗", positionSon: 1, nbSyllabes: 3 },
    { mot: "soleil", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "serpent", emoji: "🐍", positionSon: 1, nbSyllabes: 2 },
    { mot: "sel", emoji: "🧂", positionSon: 1, nbSyllabes: 1 },
    { mot: "sport", emoji: "⚽", positionSon: 1, nbSyllabes: 1 },
    { mot: "sirop", emoji: "🍯", positionSon: 2, nbSyllabes: 2 },
  ],
  n: [
    { mot: "nez", emoji: "👃", positionSon: 1, nbSyllabes: 1 },
    { mot: "nature", emoji: "🌿", positionSon: 1, nbSyllabes: 2 },
    { mot: "navet", emoji: "🥬", positionSon: 1, nbSyllabes: 2 },
    { mot: "nuage", emoji: "☁️", positionSon: 1, nbSyllabes: 2 },
    { mot: "nid", emoji: "🐦", positionSon: 1, nbSyllabes: 1 },
    { mot: "note", emoji: "📝", positionSon: 1, nbSyllabes: 1 },
    { mot: "citron", emoji: "🍋", positionSon: 2, nbSyllabes: 2 },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", positionSon: 1, nbSyllabes: 2 },
    { mot: "porte", emoji: "🚪", positionSon: 1, nbSyllabes: 2 },
    { mot: "pain", emoji: "🍞", positionSon: 1, nbSyllabes: 1 },
    { mot: "pizza", emoji: "🍕", positionSon: 1, nbSyllabes: 2 },
    { mot: "père", emoji: "👨", positionSon: 1, nbSyllabes: 1 },
    { mot: "piste", emoji: "🛷", positionSon: 1, nbSyllabes: 1 },
    { mot: "pompe", emoji: "🚿", positionSon: 1, nbSyllabes: 1 },
    { mot: "pastèque", emoji: "🍉", positionSon: 1, nbSyllabes: 3 },
    { mot: "tapis", emoji: "🪔", positionSon: 2, nbSyllabes: 2 },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", positionSon: 1, nbSyllabes: 3 },
    { mot: "télé", emoji: "📺", positionSon: 1, nbSyllabes: 2 },
    { mot: "tapis", emoji: "🪔", positionSon: 1, nbSyllabes: 2 },
    { mot: "table", emoji: "🪑", positionSon: 1, nbSyllabes: 2 },
    { mot: "lit", emoji: "🛏️", positionSon: 2, nbSyllabes: 1 },
    { mot: "mot", emoji: "✉️", positionSon: 2, nbSyllabes: 1 },
    { mot: "marteau", emoji: "🔨", positionSon: 2, nbSyllabes: 2 },
  ],
  f: [
    { mot: "feu", emoji: "🔥", positionSon: 1, nbSyllabes: 1 },
    { mot: "fusée", emoji: "🚀", positionSon: 1, nbSyllabes: 2 },
    { mot: "filet", emoji: "🕸️", positionSon: 1, nbSyllabes: 2 },
    { mot: "fleur", emoji: "🌸", positionSon: 1, nbSyllabes: 1 },
    { mot: "four", emoji: "🧱", positionSon: 1, nbSyllabes: 1 },
    { mot: "café", emoji: "☕", positionSon: 2, nbSyllabes: 2 },
    { mot: "fromage", emoji: "🧀", positionSon: 2, nbSyllabes: 3 },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", positionSon: 1, nbSyllabes: 2 },
    { mot: "vache", emoji: "🐄", positionSon: 1, nbSyllabes: 2 },
    { mot: "lavabo", emoji: "🚿", positionSon: 3, nbSyllabes: 3 },
    { mot: "vent", emoji: "💨", positionSon: 1, nbSyllabes: 1 },
    { mot: "ville", emoji: "🏙️", positionSon: 1, nbSyllabes: 1 },
    { mot: "vase", emoji: "🏺", positionSon: 1, nbSyllabes: 1 },
    { mot: "valise", emoji: "🧳", positionSon: 1, nbSyllabes: 3 },
  ],
  ch: [
    { mot: "chien", emoji: "🐕", positionSon: 1, nbSyllabes: 2 },
    { mot: "chocolat", emoji: "🍫", positionSon: 1, nbSyllabes: 3 },
    { mot: "chat", emoji: "🐱", positionSon: 1, nbSyllabes: 1 },
    { mot: "cheval", emoji: "🐴", positionSon: 1, nbSyllabes: 2 },
    { mot: "chapeau", emoji: "🎩", positionSon: 1, nbSyllabes: 2 },
    { mot: "pêche", emoji: "🍑", positionSon: 2, nbSyllabes: 1 },
  ],
  j: [
    { mot: "jupe", emoji: "👗", positionSon: 1, nbSyllabes: 2 },
    { mot: "jardin", emoji: "🌳", positionSon: 1, nbSyllabes: 2 },
    { mot: "jeu", emoji: "🎲", positionSon: 1, nbSyllabes: 1 },
    { mot: "jus", emoji: "🧃", positionSon: 1, nbSyllabes: 1 },
    { mot: "jaune", emoji: "🟡", positionSon: 1, nbSyllabes: 1 },
    { mot: "jambon", emoji: "🥪", positionSon: 1, nbSyllabes: 2 },
    { mot: "orange", emoji: "🍊", positionSon: 2, nbSyllabes: 2 },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", positionSon: 1, nbSyllabes: 2 },
    { mot: "balai", emoji: "🧹", positionSon: 1, nbSyllabes: 2 },
    { mot: "brosse", emoji: "🪥", positionSon: 1, nbSyllabes: 2 },
    { mot: "balle", emoji: "⚾", positionSon: 1, nbSyllabes: 1 },
    { mot: "bateau", emoji: "⛵", positionSon: 1, nbSyllabes: 2 },
    { mot: "beau", emoji: "✨", positionSon: 1, nbSyllabes: 1 },
    { mot: "robot", emoji: "🤖", positionSon: 2, nbSyllabes: 2 },
  ],
  d: [
    { mot: "drapeau", emoji: "🚩", positionSon: 1, nbSyllabes: 2 },
    { mot: "dé", emoji: "🎲", positionSon: 1, nbSyllabes: 1 },
    { mot: "dur", emoji: "🪨", positionSon: 1, nbSyllabes: 1 },
    { mot: "dame", emoji: "👩", positionSon: 1, nbSyllabes: 1 },
    { mot: "dos", emoji: "🎒", positionSon: 1, nbSyllabes: 1 },
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
    { mot: "salade", emoji: "🥗", positionSon: 3, nbSyllabes: 3 },
  ],
  g: [
    { mot: "gare", emoji: "🚂", positionSon: 1, nbSyllabes: 1 },
    { mot: "gomme", emoji: "🧽", positionSon: 1, nbSyllabes: 1 },
    { mot: "gâteau", emoji: "🎂", positionSon: 1, nbSyllabes: 2 },
    { mot: "gris", emoji: "🐁", positionSon: 1, nbSyllabes: 1 },
    { mot: "gros", emoji: "🐘", positionSon: 1, nbSyllabes: 1 },
    { mot: "gorge", emoji: "🍫", positionSon: 1, nbSyllabes: 1 },
    { mot: "regard", emoji: "👀", positionSon: 2, nbSyllabes: 2 },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", positionSon: 1, nbSyllabes: 2 },
    { mot: "zoo", emoji: "🦁", positionSon: 1, nbSyllabes: 1 },
    { mot: "zèbre", emoji: "🦓", positionSon: 1, nbSyllabes: 1 },
    { mot: "gaz", emoji: "⛽", positionSon: 2, nbSyllabes: 1 },
  ],
  "c-k": [
    { mot: "car", emoji: "🚗", positionSon: 1, nbSyllabes: 1 },
    { mot: "coq", emoji: "🐓", positionSon: 1, nbSyllabes: 1 },
    { mot: "café", emoji: "☕", positionSon: 1, nbSyllabes: 2 },
    { mot: "clé", emoji: "🔑", positionSon: 1, nbSyllabes: 1 },
    { mot: "canard", emoji: "🦆", positionSon: 1, nbSyllabes: 2 },
    { mot: "camion", emoji: "🚚", positionSon: 1, nbSyllabes: 3 },
    { mot: "sac", emoji: "👜", positionSon: 2, nbSyllabes: 1 },
  ],
  i: [{ mot: "lit", emoji: "🛏️", positionSon: 1, nbSyllabes: 1 }],
  a: [{ mot: "chat", emoji: "🐱", positionSon: 1, nbSyllabes: 1 }],
  o: [{ mot: "moto", emoji: "🏍️", positionSon: 2, nbSyllabes: 2 }],
  e: [{ mot: "regard", emoji: "👀", positionSon: 2, nbSyllabes: 2 }],
  u: [{ mot: "lune", emoji: "🌙", positionSon: 1, nbSyllabes: 1 }],
  "e-accent": [{ mot: "école", emoji: "🏫", positionSon: 1, nbSyllabes: 2 }],
  ou: [{ mot: "loup", emoji: "🐺", positionSon: 2, nbSyllabes: 1 }],
  oi: [{ mot: "poisson", emoji: "🐟", positionSon: 1, nbSyllabes: 2 }],
  on: [{ mot: "maison", emoji: "🏠", positionSon: 2, nbSyllabes: 2 }],
  an: [{ mot: "enfant", emoji: "👧", positionSon: 1, nbSyllabes: 2 }],
  in: [{ mot: "lapin", emoji: "🐰", positionSon: 2, nbSyllabes: 2 }],
};

function getRepèrePourSon(son: Son, count: number, seed: number, evalOffset = 0): ItemRepère[] {
  let pool = (REPERE_SON[son.id] ?? []).filter((x) => motSimplePourSon(x.mot, son.ordre));
  if (!pool.length && isConsonne(son)) {
    pool = (REPERE_SON["l"] ?? []).filter((x) => motSimplePourSon(x.mot, son.ordre));
  }
  if (!pool.length) {
    const mi = (MOTS_PHONO_IMAGE[son.id] ?? []).find((x) => motSimplePourSon(x.mot, son.ordre));
    if (mi) pool = [{ mot: mi.mot, emoji: mi.emoji, positionSon: 1, nbSyllabes: 2 }];
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  const off = Math.min(evalOffset * 2, Math.max(0, out.length - count));
  return out.slice(off, off + count);
}

// ——— Exo 3 : Entoure la syllabe que tu entends ———
type ItemSyllabe = { mot: string; emoji: string; syllabeCorrecte: string; syllabeDistracteur: string };

// Pas de papa, maman, bébé (son dans plusieurs syllabes)
const SYLLABE_CHOIX: Record<string, ItemSyllabe[]> = {
  l: [
    { mot: "règle", emoji: "📏", syllabeCorrecte: "rè", syllabeDistracteur: "la" },
    { mot: "licorne", emoji: "🦄", syllabeCorrecte: "li", syllabeDistracteur: "la" },
    { mot: "lune", emoji: "🌙", syllabeCorrecte: "lu", syllabeDistracteur: "li" },
    { mot: "lézard", emoji: "🦎", syllabeCorrecte: "lé", syllabeDistracteur: "la" },
    { mot: "lilas", emoji: "💜", syllabeCorrecte: "li", syllabeDistracteur: "la" },
  ],
  m: [
    { mot: "moto", emoji: "🏍️", syllabeCorrecte: "mo", syllabeDistracteur: "ma" },
    { mot: "pomme", emoji: "🍎", syllabeCorrecte: "me", syllabeDistracteur: "ma" },
    { mot: "miel", emoji: "🍯", syllabeCorrecte: "mi", syllabeDistracteur: "ma" },
    { mot: "midi", emoji: "☀️", syllabeCorrecte: "mi", syllabeDistracteur: "ma" },
    { mot: "mur", emoji: "🧱", syllabeCorrecte: "mu", syllabeDistracteur: "ma" },
    { mot: "marteau", emoji: "🔨", syllabeCorrecte: "mar", syllabeDistracteur: "ma" },
  ],
  r: [
    { mot: "rat", emoji: "🐀", syllabeCorrecte: "ra", syllabeDistracteur: "ri" },
    { mot: "riz", emoji: "🍚", syllabeCorrecte: "ri", syllabeDistracteur: "ra" },
    { mot: "robot", emoji: "🤖", syllabeCorrecte: "ro", syllabeDistracteur: "ra" },
    { mot: "radio", emoji: "📻", syllabeCorrecte: "ra", syllabeDistracteur: "ri" },
    { mot: "rue", emoji: "🛤️", syllabeCorrecte: "ru", syllabeDistracteur: "ra" },
    { mot: "règle", emoji: "📏", syllabeCorrecte: "rè", syllabeDistracteur: "ra" },
  ],
  s: [
    { mot: "sac", emoji: "👜", syllabeCorrecte: "sa", syllabeDistracteur: "se" },
    { mot: "salade", emoji: "🥗", syllabeCorrecte: "sa", syllabeDistracteur: "se" },
    { mot: "soleil", emoji: "☀️", syllabeCorrecte: "so", syllabeDistracteur: "sa" },
    { mot: "serpent", emoji: "🐍", syllabeCorrecte: "ser", syllabeDistracteur: "sa" },
    { mot: "sel", emoji: "🧂", syllabeCorrecte: "sel", syllabeDistracteur: "sa" },
  ],
  n: [
    { mot: "nez", emoji: "👃", syllabeCorrecte: "ne", syllabeDistracteur: "na" },
    { mot: "nature", emoji: "🌿", syllabeCorrecte: "na", syllabeDistracteur: "ne" },
    { mot: "navet", emoji: "🥬", syllabeCorrecte: "na", syllabeDistracteur: "ne" },
    { mot: "nuage", emoji: "☁️", syllabeCorrecte: "nua", syllabeDistracteur: "na" },
    { mot: "nid", emoji: "🐦", syllabeCorrecte: "nid", syllabeDistracteur: "na" },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", syllabeCorrecte: "po", syllabeDistracteur: "pa" },
    { mot: "porte", emoji: "🚪", syllabeCorrecte: "por", syllabeDistracteur: "pa" },
    { mot: "pain", emoji: "🍞", syllabeCorrecte: "pain", syllabeDistracteur: "pa" },
    { mot: "père", emoji: "👨", syllabeCorrecte: "pè", syllabeDistracteur: "pa" },
    { mot: "piste", emoji: "🛷", syllabeCorrecte: "pis", syllabeDistracteur: "pa" },
    { mot: "pizza", emoji: "🍕", syllabeCorrecte: "pi", syllabeDistracteur: "pa" },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", syllabeCorrecte: "to", syllabeDistracteur: "ta" },
    { mot: "télé", emoji: "📺", syllabeCorrecte: "té", syllabeDistracteur: "ta" },
    { mot: "tapis", emoji: "🪔", syllabeCorrecte: "ta", syllabeDistracteur: "to" },
    { mot: "table", emoji: "🪑", syllabeCorrecte: "ta", syllabeDistracteur: "te" },
  ],
  f: [
    { mot: "fusée", emoji: "🚀", syllabeCorrecte: "fu", syllabeDistracteur: "fa" },
    { mot: "feu", emoji: "🔥", syllabeCorrecte: "feu", syllabeDistracteur: "fa" },
    { mot: "filet", emoji: "🕸️", syllabeCorrecte: "fi", syllabeDistracteur: "fa" },
    { mot: "fleur", emoji: "🌸", syllabeCorrecte: "fleur", syllabeDistracteur: "fa" },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", syllabeCorrecte: "vé", syllabeDistracteur: "va" },
    { mot: "vache", emoji: "🐄", syllabeCorrecte: "va", syllabeDistracteur: "vé" },
    { mot: "vent", emoji: "💨", syllabeCorrecte: "vent", syllabeDistracteur: "va" },
    { mot: "ville", emoji: "🏙️", syllabeCorrecte: "vi", syllabeDistracteur: "va" },
  ],
  ch: [
    { mot: "chien", emoji: "🐕", syllabeCorrecte: "chi", syllabeDistracteur: "cha" },
    { mot: "chat", emoji: "🐱", syllabeCorrecte: "cha", syllabeDistracteur: "chi" },
    { mot: "chocolat", emoji: "🍫", syllabeCorrecte: "cho", syllabeDistracteur: "cha" },
    { mot: "cheval", emoji: "🐴", syllabeCorrecte: "che", syllabeDistracteur: "cha" },
  ],
  j: [
    { mot: "jupe", emoji: "👗", syllabeCorrecte: "ju", syllabeDistracteur: "ja" },
    { mot: "jardin", emoji: "🌳", syllabeCorrecte: "jar", syllabeDistracteur: "ja" },
    { mot: "jus", emoji: "🧃", syllabeCorrecte: "jus", syllabeDistracteur: "ja" },
    { mot: "jaune", emoji: "🟡", syllabeCorrecte: "jau", syllabeDistracteur: "ja" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "brosse", emoji: "🪥", syllabeCorrecte: "bro", syllabeDistracteur: "ba" },
    { mot: "balai", emoji: "🧹", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "balle", emoji: "⚾", syllabeCorrecte: "bal", syllabeDistracteur: "ba" },
  ],
  d: [
    { mot: "dos", emoji: "🎒", syllabeCorrecte: "do", syllabeDistracteur: "da" },
    { mot: "drapeau", emoji: "🚩", syllabeCorrecte: "dra", syllabeDistracteur: "da" },
    { mot: "dé", emoji: "🎲", syllabeCorrecte: "dé", syllabeDistracteur: "da" },
    { mot: "dur", emoji: "🪨", syllabeCorrecte: "dur", syllabeDistracteur: "da" },
  ],
  g: [
    { mot: "gare", emoji: "🚂", syllabeCorrecte: "ga", syllabeDistracteur: "go" },
    { mot: "gomme", emoji: "🧽", syllabeCorrecte: "go", syllabeDistracteur: "ga" },
    { mot: "gâteau", emoji: "🎂", syllabeCorrecte: "gâ", syllabeDistracteur: "ga" },
    { mot: "gris", emoji: "🐁", syllabeCorrecte: "gri", syllabeDistracteur: "ga" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", syllabeCorrecte: "zé", syllabeDistracteur: "za" },
    { mot: "zoo", emoji: "🦁", syllabeCorrecte: "zo", syllabeDistracteur: "za" },
    { mot: "zèbre", emoji: "🦓", syllabeCorrecte: "zè", syllabeDistracteur: "za" },
  ],
  "c-k": [
    { mot: "camion", emoji: "🚚", syllabeCorrecte: "ca", syllabeDistracteur: "co" },
    { mot: "canard", emoji: "🦆", syllabeCorrecte: "ca", syllabeDistracteur: "cu" },
    { mot: "car", emoji: "🚗", syllabeCorrecte: "car", syllabeDistracteur: "ca" },
    { mot: "café", emoji: "☕", syllabeCorrecte: "ca", syllabeDistracteur: "co" },
  ],
};

function getSyllabeExercices(son: Son, count: number, seed: number, evalOffset = 0): ItemSyllabe[] {
  let pool = (SYLLABE_CHOIX[son.id] ?? []).filter((x) => motSimplePourSon(x.mot, son.ordre));
  if (!pool.length && isConsonne(son)) {
    pool = (SYLLABE_CHOIX["l"] ?? []).filter((x) => motSimplePourSon(x.mot, son.ordre));
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  const off = Math.min(evalOffset * 2, Math.max(0, out.length - count));
  return out.slice(off, off + count);
}

// ——— Exo 4 : Écris la syllabe qui manque ———
type ItemSyllabeManquante = { mot: string; emoji: string; prefix: string; suffix: string; syllabe: string };

function getSyllabeManquanteExercices(
  son: Son,
  count: number,
  seed: number,
  evalOffset = 0
): ItemSyllabeManquante[] {
  const result: ItemSyllabeManquante[] = [];
  if (!isConsonne(son)) return result;
  const syllabes = getSyllabes(son);
  const motsCompatibles: { mot: string; emoji: string; syll: string; idx: number }[] = [];
  const ordreMaxComplex = son.ordre; // n'utiliser que des mots sans sons complexes (on, ou, oi, an, in) avant de les avoir vus
  for (const syll of syllabes) {
    if (!syllabeUtiliseSonsAppris(syll, son)) continue; // syllabe à écrire = sons déjà vus
    for (const [id, list] of Object.entries(MOTS_PHONO_IMAGE)) {
      const so = getSonById(id);
      if (!so || so.ordre > son.ordre) continue;
      for (const x of list) {
        if (!motSimplePourSon(x.mot, ordreMaxComplex)) continue;
        if (["maman", "papa", "bébé", "maison"].includes(x.mot.toLowerCase())) continue;
        const idx = x.mot.indexOf(syll);
        if (idx >= 0 && (idx === 0 || idx === x.mot.length - syll.length)) {
          const prefix = idx === 0 ? "" : x.mot.slice(0, idx);
          const suffix = idx === 0 ? x.mot.slice(syll.length) : "";
          if (prefix.length > 0 || suffix.length > 0) {
            motsCompatibles.push({ mot: x.mot, emoji: x.emoji, syll, idx });
          }
        }
      }
    }
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...motsCompatibles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const uniques: typeof motsCompatibles = [];
  const vus = new Set<string>();
  for (const p of shuffled) {
    if (!vus.has(p.mot)) {
      vus.add(p.mot);
      uniques.push(p);
    }
  }
  const off = Math.min(evalOffset * 2, Math.max(0, uniques.length - count));
  for (const pick of uniques.slice(off, off + count)) {
    const prefix = pick.idx === 0 ? "" : pick.mot.slice(0, pick.idx);
    const suffix = pick.idx === 0 ? pick.mot.slice(pick.syll.length) : "";
    result.push({
      mot: pick.mot,
      emoji: pick.emoji,
      prefix,
      suffix,
      syllabe: pick.syll,
    });
  }
  return result;
}

// Mots à éviter avant d'avoir vu on(25), ou(23), oi(24), an(26), in(27)
function motSimplePourSon(mot: string, sonOrdre: number): boolean {
  const m = mot.toLowerCase();
  if (/ou/.test(m) && sonOrdre < 23) return false;
  if (/oi/.test(m) && sonOrdre < 24) return false;
  if (/on/.test(m) && sonOrdre < 25) return false;
  if (/an/.test(m) && sonOrdre < 26) return false;
  if (/in/.test(m) && sonOrdre < 27) return false;
  return true;
}

const SYLLABE_MANQUANTE_FALLBACK: Record<string, ItemSyllabeManquante[]> = {
  l: [
    { mot: "vélo", emoji: "🚲", prefix: "vé", suffix: "", syllabe: "lo" },
    { mot: "lilas", emoji: "💜", prefix: "", suffix: "las", syllabe: "li" },
    { mot: "lait", emoji: "🥛", prefix: "", suffix: "it", syllabe: "la" },
    { mot: "lune", emoji: "🌙", prefix: "", suffix: "ne", syllabe: "lu" },
  ],
  m: [
    { mot: "moto", emoji: "🏍️", prefix: "", suffix: "to", syllabe: "mo" },
    { mot: "pomme", emoji: "🍎", prefix: "po", suffix: "", syllabe: "me" },
    { mot: "miel", emoji: "🍯", prefix: "", suffix: "el", syllabe: "mi" },
  ],
  r: [
    { mot: "robot", emoji: "🤖", prefix: "", suffix: "bot", syllabe: "ro" },
    { mot: "radio", emoji: "📻", prefix: "", suffix: "dio", syllabe: "ra" },
    { mot: "riz", emoji: "🍚", prefix: "", suffix: "z", syllabe: "ri" },
    { mot: "rat", emoji: "🐀", prefix: "", suffix: "t", syllabe: "ra" },
  ],
  s: [
    { mot: "salade", emoji: "🥗", prefix: "", suffix: "lade", syllabe: "sa" },
    { mot: "sac", emoji: "👜", prefix: "", suffix: "c", syllabe: "sa" },
    { mot: "soleil", emoji: "☀️", prefix: "", suffix: "leil", syllabe: "so" },
  ],
  n: [
    { mot: "navet", emoji: "🥬", prefix: "", suffix: "vet", syllabe: "na" },
    { mot: "nez", emoji: "👃", prefix: "", suffix: "z", syllabe: "ne" },
    { mot: "nature", emoji: "🌿", prefix: "", suffix: "ture", syllabe: "na" },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", prefix: "po", suffix: "", syllabe: "me" },
    { mot: "pompe", emoji: "🚿", prefix: "pom", suffix: "", syllabe: "pe" },
    { mot: "pizza", emoji: "🍕", prefix: "", suffix: "zza", syllabe: "pi" },
    { mot: "pastèque", emoji: "🍉", prefix: "", suffix: "tèque", syllabe: "pas" },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", prefix: "to", suffix: "te", syllabe: "ma" },
    { mot: "télé", emoji: "📺", prefix: "té", suffix: "", syllabe: "lé" },
  ],
  f: [
    { mot: "fusée", emoji: "🚀", prefix: "fu", suffix: "", syllabe: "sée" },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", prefix: "", suffix: "lo", syllabe: "vé" },
    { mot: "vache", emoji: "🐄", prefix: "", suffix: "che", syllabe: "va" },
    { mot: "vent", emoji: "💨", prefix: "", suffix: "t", syllabe: "ven" },
  ],
  ch: [
    { mot: "chien", emoji: "🐕", prefix: "chi", suffix: "", syllabe: "en" },
    { mot: "chat", emoji: "🐱", prefix: "", suffix: "t", syllabe: "cha" },
    { mot: "chocolat", emoji: "🍫", prefix: "", suffix: "colat", syllabe: "cho" },
  ],
  j: [
    { mot: "jupe", emoji: "👗", prefix: "ju", suffix: "", syllabe: "pe" },
    { mot: "jus", emoji: "🧃", prefix: "", suffix: "s", syllabe: "ju" },
    { mot: "jardin", emoji: "🌳", prefix: "", suffix: "din", syllabe: "jar" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", prefix: "", suffix: "llon", syllabe: "ba" },
    { mot: "brosse", emoji: "🪥", prefix: "bro", suffix: "", syllabe: "sse" },
    { mot: "balai", emoji: "🧹", prefix: "", suffix: "lai", syllabe: "ba" },
  ],
  d: [
    { mot: "drapeau", emoji: "🚩", prefix: "dra", suffix: "", syllabe: "peau" },
    { mot: "dos", emoji: "🎒", prefix: "", suffix: "s", syllabe: "do" },
    { mot: "dur", emoji: "🪨", prefix: "", suffix: "r", syllabe: "du" },
  ],
  g: [
    { mot: "gare", emoji: "🚂", prefix: "", suffix: "re", syllabe: "ga" },
    { mot: "gomme", emoji: "🧽", prefix: "go", suffix: "", syllabe: "mme" },
    { mot: "gâteau", emoji: "🎂", prefix: "gâ", suffix: "teau", syllabe: "teau" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", prefix: "zé", suffix: "", syllabe: "ro" },
    { mot: "zoo", emoji: "🦁", prefix: "", suffix: "o", syllabe: "zo" },
    { mot: "zèbre", emoji: "🦓", prefix: "", suffix: "bre", syllabe: "zè" },
  ],
  "c-k": [
    { mot: "car", emoji: "🚗", prefix: "", suffix: "r", syllabe: "ca" },
    { mot: "café", emoji: "☕", prefix: "", suffix: "fé", syllabe: "ca" },
    { mot: "canard", emoji: "🦆", prefix: "ca", suffix: "", syllabe: "nard" },
  ],
  ou: [
    { mot: "poulet", emoji: "🐔", prefix: "pou", suffix: "", syllabe: "let" },
  ],
  on: [
    { mot: "maison", emoji: "🏠", prefix: "mai", suffix: "", syllabe: "son" },
    { mot: "savon", emoji: "🧼", prefix: "sa", suffix: "", syllabe: "von" },
  ],
  an: [
    { mot: "enfant", emoji: "👧", prefix: "en", suffix: "", syllabe: "fant" },
  ],
  in: [
    { mot: "lapin", emoji: "🐰", prefix: "la", suffix: "", syllabe: "pin" },
  ],
};

// ——— Exo alternatif voyelles : Entoure la lettre dans la série ———
type ItemEntoureLettre = { lettres: string[]; indicesCibles: number[] };

function getEntoureLettreItems(son: Son, count: number, seed: number): ItemEntoureLettre[] {
  const g = son.grapheme.split(",")[0].trim();
  const autres = SONS.filter((s) => s.ordre <= son.ordre && s.id !== son.id)
    .map((s) => s.grapheme.split(",")[0].trim())
    .filter((x) => x.length <= 2);
  const pool = [...new Set(autres)].slice(0, 8);
  const items: ItemEntoureLettre[] = [];
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  for (let i = 0; i < count; i++) {
    const n = 8 + Math.floor(s(i * 3) * 4);
    const lettres: string[] = [];
    const indicesCibles: number[] = [];
    const nbCibles = 1 + Math.floor(s(i * 5) * 2);
    for (let k = 0; k < n; k++) {
      if (indicesCibles.length < nbCibles && s(i * 7 + k) < 0.3) {
        lettres.push(g);
        indicesCibles.push(lettres.length - 1);
      } else {
        lettres.push(pool[Math.floor(s(i * 11 + k) * pool.length)] ?? "a");
      }
    }
    if (indicesCibles.length === 0) {
      lettres[Math.floor(s(i) * lettres.length)] = g;
      indicesCibles.push(lettres.indexOf(g));
    }
    items.push({ lettres, indicesCibles });
  }
  return items;
}

// ——— Export des séries par évaluation ———
export type TypeExoEval = "entoure-son" | "repere-son" | "entoure-syllabe" | "ecris-syllabe" | "entoure-lettre";

export type SerieExoEval = {
  type: TypeExoEval;
  items: unknown[];
  pointsMax: number;
};

export function getExercicesEval(
  son: Son,
  niveauNumero: number,
  evalNumero: number
): SerieExoEval[] {
  const base = (son.id + niveauNumero * 10).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  // Seed très différent par évaluation pour éviter les mêmes images entre eval 1, 2, 3
  const seed = base + evalNumero * 9997;

  const off = evalNumero - 1; // 0, 1, 2 pour evals 1, 2, 3
  const exo1Items = getImagesEntoureLeSon(son, 4, 4, seed, off);
  const exo2Items = getRepèrePourSon(son, 4, seed + 1, off);
  const exo3Items = getSyllabeExercices(son, 4, seed + 2, off);
  let exo4Items = getSyllabeManquanteExercices(son, 3, seed + 3, off);
  if (exo4Items.length < 2) {
    const fb = (SYLLABE_MANQUANTE_FALLBACK[son.id] ?? []).filter((x) =>
      syllabeUtiliseSonsAppris(x.syllabe, son)
    );
    if (fb.length >= 2) {
      const s = (x: number) => ((Math.sin(seed + 333 + x) * 10000) % 1 + 1) % 1;
      const shuf = [...fb];
      for (let i = shuf.length - 1; i > 0; i--) {
        const j = Math.floor(s(i) * (i + 1));
        [shuf[i], shuf[j]] = [shuf[j], shuf[i]];
      }
      const o = Math.min(off * 2, Math.max(0, shuf.length - 3));
      exo4Items = shuf.slice(o, o + 3);
    }
  }

  const pointsExo1 = exo1Items.filter((x) => x?.contientSon === true).length;
  const series: SerieExoEval[] = [
    { type: "entoure-son", items: exo1Items.filter(Boolean), pointsMax: pointsExo1 || 1 },
    { type: "repere-son", items: exo2Items, pointsMax: exo2Items.length },
  ];

  if (exo3Items.length > 0) {
    series.push({ type: "entoure-syllabe", items: exo3Items, pointsMax: exo3Items.length });
  } else {
    series.push({ type: "entoure-lettre", items: getEntoureLettreItems(son, 2, seed + 20), pointsMax: 2 });
  }
  if (exo4Items.length > 0) {
    series.push({ type: "ecris-syllabe", items: exo4Items, pointsMax: exo4Items.length });
  } else {
    series.push({ type: "entoure-lettre", items: getEntoureLettreItems(son, 2, seed + 21), pointsMax: 2 });
  }
  return series;
}
