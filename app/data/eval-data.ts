/**
 * Données pour les 3 évaluations par son.
 * 4 exercices par évaluation, inspirés des fiches pédagogiques CP.
 * — Les syllabes à écrire n'utilisent que des sons déjà vus (ordre).
 * — Chaque évaluation a des mots différents (variété eval 1, 2, 3).
 * — Tous les exercices avec image/mot n'utilisent que des mots de 2, 3 ou 4 syllabes (jamais 1).
 */

import type { Son } from "./sons-data";
import { SONS, getSonById, isConsonne, getSyllabes } from "./sons-data";
import { MOTS_PHONO_IMAGE } from "./mots-phono-image";

/** Mots considérés comme une seule syllabe : à exclure des évaluations (on veut 2+ syllabes). */
const MOTS_UNE_SYLLABE = new Set([
  "lit", "nid", "chat", "rat", "sac", "mot", "dos", "lune", "rue", "jus", "pull", "mur", "feu",
  "sel", "sport", "nid", "pain", "père", "piste", "vent", "ville", "vase", "jeu",
  "jus", "jaune", "balle", "beau", "dé", "dur", "dame", "dos", "gare", "gomme", "gris", "gros",
  "gorge", "zoo", "zèbre", "gaz", "car", "coq", "clé", "loup", "cou", "four", "roue", "roi", "pont",
  "règle", "riz", "bus", "nœud", "niche", "note", "pile", "doigt", "tête",
].map((m) => m.toLowerCase()));

function motAuMoinsDeuxSyllabes(mot: string): boolean {
  return !MOTS_UNE_SYLLABE.has(mot.trim().toLowerCase());
}

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
  evalOffset = 0,
  /** Optionnel : ne garder que les mots passant ce filtre dans la liste « avec le son » (ex. pour éval 2 é/è/ê : uniquement è et ê). */
  filterAvec?: (mot: string) => boolean
): { mot: string; emoji: string; image?: string; contientSon: boolean }[] {
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
  // Ne pas utiliser d'image qui ressemble à la lettre évaluée (ex. sac à dos 🎒 ≈ lettre U)
  const EMOJI_RESSEMBLE_LETTRE: Record<string, string[]> = {
    u: ["🎒"], // sac à dos = forme en U
  };
  const emojisAEviter = EMOJI_RESSEMBLE_LETTRE[son.id] ?? [];
  const eviterEmoji = (emoji: string) => emojisAEviter.includes(emoji);
  let avecList = (MOTS_PHONO_IMAGE[son.id] ?? [])
    .filter(
      (x) =>
        contientSon(x.mot) &&
        !MOTS_A_EVITER.includes(x.mot.toLowerCase()) &&
        motSimplePourSon(x.mot, son.ordre) &&
        motAuMoinsDeuxSyllabes(x.mot) &&
        !eviterEmoji(x.emoji)
    );
  if (filterAvec) {
    avecList = avecList.filter((x) => filterAvec(x.mot));
  }
  const autres = SONS.filter((x) => x.id !== son.id && x.ordre <= son.ordre);
  const sansList: { mot: string; emoji: string }[] = [];
  for (const o of autres) {
    for (const x of MOTS_PHONO_IMAGE[o.id] ?? []) {
      if (
        !contientSon(x.mot) &&
        !MOTS_A_EVITER.includes(x.mot.toLowerCase()) &&
        !eviterEmoji(x.emoji) &&
        !avecList.some((a) => a.mot === x.mot) &&
        motSimplePourSon(x.mot, son.ordre) &&
        motAuMoinsDeuxSyllabes(x.mot)
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
type ItemRepère = { mot: string; emoji: string; image?: string; positionSon: number; nbSyllabes: number };

// Mots avec le son dans UNE seule syllabe (éviter maman, papa, bébé, banane…)
const REPERE_SON: Record<string, ItemRepère[]> = {
  l: [
    { mot: "balai", emoji: "🧹", positionSon: 2, nbSyllabes: 2 },
    { mot: "lavabo", emoji: "🚿", positionSon: 1, nbSyllabes: 3 },
    { mot: "bulle", emoji: "🫧", positionSon: 2, nbSyllabes: 2 },
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
    { mot: "lézard", emoji: "🦎", positionSon: 1, nbSyllabes: 2 },
    { mot: "lunettes", emoji: "👓", positionSon: 1, nbSyllabes: 3 },
    { mot: "lumière", emoji: "💡", positionSon: 1, nbSyllabes: 3 },
    { mot: "lions", emoji: "🦁", positionSon: 1, nbSyllabes: 2 },
    { mot: "limaces", emoji: "🐌", image: "/images/limace.png", positionSon: 1, nbSyllabes: 3 },
    { mot: "valises", emoji: "🧳", positionSon: 2, nbSyllabes: 3 },
    { mot: "cheval", emoji: "🐴", positionSon: 2, nbSyllabes: 2 },
    { mot: "bouillotte", emoji: "🛏️", positionSon: 1, nbSyllabes: 3 },
  ],
  m: [
    { mot: "moto", emoji: "🏍️", positionSon: 1, nbSyllabes: 2 },
    { mot: "pomme", emoji: "🍎", positionSon: 1, nbSyllabes: 2 },
    { mot: "miel", emoji: "🍯", positionSon: 1, nbSyllabes: 2 },
    { mot: "marteau", emoji: "🔨", positionSon: 1, nbSyllabes: 2 },
    { mot: "midi", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "tomate", emoji: "🍅", positionSon: 2, nbSyllabes: 3 },
    { mot: "mouton", emoji: "🐑", positionSon: 1, nbSyllabes: 2 },
    { mot: "maison", emoji: "🏠", positionSon: 1, nbSyllabes: 2 },
    { mot: "musique", emoji: "🎵", positionSon: 1, nbSyllabes: 3 },
    { mot: "domino", emoji: "🎲", image: "/images/domino.png", positionSon: 2, nbSyllabes: 3 },
    { mot: "locomotive", emoji: "🚂", positionSon: 1, nbSyllabes: 4 },
    { mot: "madame", emoji: "👩", positionSon: 1, nbSyllabes: 3 },
    { mot: "chemise", emoji: "👔", positionSon: 2, nbSyllabes: 2 },
    { mot: "melon", emoji: "🍈", positionSon: 1, nbSyllabes: 2 },
    { mot: "peloton", emoji: "🚴", positionSon: 2, nbSyllabes: 3 },
  ],
  r: [
    { mot: "robot", emoji: "🤖", positionSon: 1, nbSyllabes: 2 },
    { mot: "radio", emoji: "📻", positionSon: 1, nbSyllabes: 2 },
    { mot: "repas", emoji: "🍽️", positionSon: 1, nbSyllabes: 2 },
    { mot: "rame", emoji: "🚣", positionSon: 1, nbSyllabes: 2 },
    { mot: "sorcière", emoji: "🧙", positionSon: 2, nbSyllabes: 3 },
    { mot: "robinet", emoji: "🚿", positionSon: 1, nbSyllabes: 2 },
    { mot: "souris", emoji: "🐭", positionSon: 2, nbSyllabes: 2 },
    { mot: "réveil", emoji: "⏰", positionSon: 1, nbSyllabes: 2 },
    { mot: "renard", emoji: "🦊", positionSon: 1, nbSyllabes: 2 },
  ],
  s: [
    { mot: "salade", emoji: "🥗", positionSon: 1, nbSyllabes: 3 },
    { mot: "soleil", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "serpent", emoji: "🐍", positionSon: 1, nbSyllabes: 2 },
    { mot: "sirop", emoji: "🍯", positionSon: 2, nbSyllabes: 2 },
    { mot: "sorcière", emoji: "🧙", positionSon: 1, nbSyllabes: 3 },
    { mot: "stylo", emoji: "✏️", positionSon: 1, nbSyllabes: 2 },
    { mot: "souris", emoji: "🐭", positionSon: 1, nbSyllabes: 2 },
    { mot: "sucette", emoji: "🍭", positionSon: 1, nbSyllabes: 2 },
  ],
  n: [
    { mot: "nature", emoji: "🌿", positionSon: 1, nbSyllabes: 2 },
    { mot: "navet", emoji: "🥬", positionSon: 1, nbSyllabes: 2 },
    { mot: "nuage", emoji: "☁️", positionSon: 1, nbSyllabes: 3 },
    { mot: "citron", emoji: "🍋", positionSon: 2, nbSyllabes: 2 },
    { mot: "ananas", emoji: "🍍", positionSon: 2, nbSyllabes: 3 },
    { mot: "lunettes", emoji: "👓", positionSon: 2, nbSyllabes: 3 },
    { mot: "fenêtre", emoji: "🪟", positionSon: 2, nbSyllabes: 3 },
    { mot: "nuages", emoji: "☁️", positionSon: 1, nbSyllabes: 2 },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", positionSon: 1, nbSyllabes: 2 },
    { mot: "porte", emoji: "🚪", positionSon: 1, nbSyllabes: 2 },
    { mot: "pizza", emoji: "🍕", positionSon: 1, nbSyllabes: 2 },
    { mot: "pastèque", emoji: "🍉", positionSon: 1, nbSyllabes: 3 },
    { mot: "tapis", emoji: "🪔", positionSon: 2, nbSyllabes: 2 },
    { mot: "piano", emoji: "🎹", positionSon: 1, nbSyllabes: 3 },
    { mot: "premier", emoji: "🥇", positionSon: 1, nbSyllabes: 2 },
    { mot: "parasol", emoji: "⛱️", positionSon: 1, nbSyllabes: 3 },
    { mot: "papillon", emoji: "🦋", positionSon: 1, nbSyllabes: 3 },
    { mot: "pluie", emoji: "🌧️", positionSon: 1, nbSyllabes: 2 },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", positionSon: 1, nbSyllabes: 3 },
    { mot: "télé", emoji: "📺", positionSon: 1, nbSyllabes: 2 },
    { mot: "tapis", emoji: "🪔", positionSon: 1, nbSyllabes: 2 },
    { mot: "table", emoji: "🪑", positionSon: 1, nbSyllabes: 2 },
    { mot: "marteau", emoji: "🔨", positionSon: 2, nbSyllabes: 2 },
    { mot: "tipi", emoji: "⛺", positionSon: 1, nbSyllabes: 2 },
    { mot: "taper", emoji: "⌨️", positionSon: 1, nbSyllabes: 2 },
    { mot: "tirer", emoji: "🎯", positionSon: 1, nbSyllabes: 2 },
    { mot: "ordinateur", emoji: "💻", positionSon: 4, nbSyllabes: 4 },
    { mot: "locomotive", emoji: "🚂", positionSon: 1, nbSyllabes: 4 },
    { mot: "tulipe", emoji: "🌷", positionSon: 1, nbSyllabes: 3 },
    { mot: "téléphone", emoji: "📱", positionSon: 1, nbSyllabes: 4 },
    { mot: "moto", emoji: "🏍️", positionSon: 2, nbSyllabes: 2 },
  ],
  f: [
    { mot: "fusée", emoji: "🚀", positionSon: 1, nbSyllabes: 2 },
    { mot: "filet", emoji: "🕸️", positionSon: 1, nbSyllabes: 2 },
    { mot: "café", emoji: "☕", positionSon: 2, nbSyllabes: 2 },
    { mot: "fromage", emoji: "🧀", positionSon: 2, nbSyllabes: 3 },
    { mot: "farine", emoji: "🌾", positionSon: 2, nbSyllabes: 3 },
    { mot: "fée", emoji: "🧚", positionSon: 1, nbSyllabes: 2 },
    { mot: "facteur", emoji: "📮", positionSon: 1, nbSyllabes: 2 },
    { mot: "girafe", emoji: "🦒", positionSon: 2, nbSyllabes: 3 },
    { mot: "gaufre", emoji: "🧇", positionSon: 1, nbSyllabes: 2 },
    { mot: "feuille", emoji: "🍃", positionSon: 1, nbSyllabes: 2 },
    { mot: "forêt", emoji: "🌲", positionSon: 2, nbSyllabes: 2 },
    { mot: "flûte", emoji: "🎵", positionSon: 1, nbSyllabes: 2 },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", positionSon: 1, nbSyllabes: 2 },
    { mot: "vache", emoji: "🐄", positionSon: 1, nbSyllabes: 2 },
    { mot: "lavabo", emoji: "🚿", positionSon: 3, nbSyllabes: 3 },
    { mot: "valise", emoji: "🧳", positionSon: 1, nbSyllabes: 3 },
    { mot: "vaisselle", emoji: "🍽️", positionSon: 1, nbSyllabes: 3 },
    { mot: "violon", emoji: "🎻", positionSon: 1, nbSyllabes: 3 },
    { mot: "caravane", emoji: "🚐", positionSon: 3, nbSyllabes: 4 },
    { mot: "locomotive", emoji: "🚂", positionSon: 4, nbSyllabes: 4 },
  ],
  ch: [
    { mot: "chapeau", emoji: "🎩", positionSon: 1, nbSyllabes: 2 },
    { mot: "chocolat", emoji: "🍫", positionSon: 1, nbSyllabes: 3 },
    { mot: "cheval", emoji: "🐴", positionSon: 1, nbSyllabes: 2 },
    { mot: "chapeau", emoji: "🎩", positionSon: 1, nbSyllabes: 2 },
    { mot: "vache", emoji: "🐄", positionSon: 2, nbSyllabes: 2 },
    { mot: "douche", emoji: "🚿", positionSon: 2, nbSyllabes: 2 },
    { mot: "chèvre", emoji: "🐐", positionSon: 1, nbSyllabes: 2 },
    { mot: "chameau", emoji: "🐫", positionSon: 1, nbSyllabes: 2 },
    { mot: "parachute", emoji: "🪂", positionSon: 3, nbSyllabes: 3 },
  ],
  j: [
    { mot: "jupe", emoji: "👗", positionSon: 1, nbSyllabes: 2 },
    { mot: "jardin", emoji: "🌳", positionSon: 1, nbSyllabes: 2 },
    { mot: "jambon", emoji: "🥪", positionSon: 1, nbSyllabes: 2 },
    { mot: "orange", emoji: "🍊", positionSon: 2, nbSyllabes: 2 },
    { mot: "pyjama", emoji: "🛏️", positionSon: 2, nbSyllabes: 3 },
    { mot: "jongleur", emoji: "🤹", positionSon: 1, nbSyllabes: 2 },
    { mot: "jeudi", emoji: "📅", positionSon: 1, nbSyllabes: 2 },
    { mot: "déjeuner", emoji: "🍽️", positionSon: 2, nbSyllabes: 3 },
    { mot: "jumelles", emoji: "🔭", positionSon: 1, nbSyllabes: 2 },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", positionSon: 1, nbSyllabes: 2 },
    { mot: "balai", emoji: "🧹", positionSon: 1, nbSyllabes: 2 },
    { mot: "brosse", emoji: "🪥", positionSon: 1, nbSyllabes: 2 },
    { mot: "bateau", emoji: "⛵", positionSon: 1, nbSyllabes: 2 },
    { mot: "robot", emoji: "🤖", positionSon: 2, nbSyllabes: 2 },
    { mot: "bague", emoji: "💍", positionSon: 1, nbSyllabes: 2 },
    { mot: "bonhomme", emoji: "⛄", positionSon: 1, nbSyllabes: 3 },
    { mot: "bonbon", emoji: "🍬", positionSon: 1, nbSyllabes: 2 },
    { mot: "banane", emoji: "🍌", positionSon: 1, nbSyllabes: 3 },
    { mot: "cabane", emoji: "🏠", positionSon: 2, nbSyllabes: 3 },
    { mot: "balançoire", emoji: "🎢", positionSon: 3, nbSyllabes: 4 },
  ],
  d: [
    { mot: "drapeau", emoji: "🚩", positionSon: 1, nbSyllabes: 2 },
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
    { mot: "salade", emoji: "🥗", positionSon: 3, nbSyllabes: 3 },
    { mot: "cadeau", emoji: "🎁", positionSon: 2, nbSyllabes: 2 },
    { mot: "dentifrice", emoji: "🪥", positionSon: 1, nbSyllabes: 3 },
    { mot: "douche", emoji: "🚿", positionSon: 1, nbSyllabes: 2 },
    { mot: "début", emoji: "🏁", positionSon: 1, nbSyllabes: 2 },
  ],
  g: [
    { mot: "gâteau", emoji: "🎂", positionSon: 1, nbSyllabes: 2 },
    { mot: "regard", emoji: "👀", positionSon: 2, nbSyllabes: 2 },
    { mot: "gaufre", emoji: "🧇", positionSon: 1, nbSyllabes: 2 },
    { mot: "licorne", emoji: "🦄", positionSon: 2, nbSyllabes: 3 },
    { mot: "glace", emoji: "🍦", positionSon: 1, nbSyllabes: 2 },
    { mot: "grenouille", emoji: "🐸", positionSon: 2, nbSyllabes: 3 },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", positionSon: 1, nbSyllabes: 2 },
  ],
  "c-k": [
    { mot: "café", emoji: "☕", positionSon: 1, nbSyllabes: 2 },
    { mot: "canard", emoji: "🦆", positionSon: 1, nbSyllabes: 2 },
    { mot: "camion", emoji: "🚚", positionSon: 1, nbSyllabes: 3 },
  ],
  // Voyelles : uniquement mots 2, 3 ou 4 syllabes (jamais 1)
  i: [
    { mot: "midi", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "iris", emoji: "🌸", positionSon: 1, nbSyllabes: 2 },
    { mot: "souris", emoji: "🐭", positionSon: 2, nbSyllabes: 2 },
    { mot: "habit", emoji: "👕", positionSon: 2, nbSyllabes: 2 },
  ],
  a: [
    { mot: "patte", emoji: "🦶", positionSon: 1, nbSyllabes: 2 },
    { mot: "salade", emoji: "🥗", positionSon: 1, nbSyllabes: 3 },
    { mot: "tomate", emoji: "🍅", positionSon: 2, nbSyllabes: 3 },
    { mot: "lavabo", emoji: "🚿", positionSon: 2, nbSyllabes: 3 },
  ],
  o: [
    { mot: "vélo", emoji: "🚲", positionSon: 2, nbSyllabes: 2 },
    { mot: "soleil", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "colle", emoji: "🧴", image: "/images/colle-tube.png", positionSon: 1, nbSyllabes: 2 },
    { mot: "zéro", emoji: "0️⃣", positionSon: 2, nbSyllabes: 2 },
    { mot: "école", emoji: "🏫", positionSon: 2, nbSyllabes: 3 },
  ],
  e: [
    { mot: "melon", emoji: "🍈", positionSon: 1, nbSyllabes: 2 },
    { mot: "fenêtre", emoji: "🪟", positionSon: 1, nbSyllabes: 3 },
    { mot: "mercredi", emoji: "📅", positionSon: 1, nbSyllabes: 3 },
    { mot: "peluche", emoji: "🧸", positionSon: 2, nbSyllabes: 3 },
  ],
  u: [
    { mot: "nuage", emoji: "☁️", positionSon: 1, nbSyllabes: 3 },
    { mot: "tortue", emoji: "🐢", positionSon: 2, nbSyllabes: 2 },
    { mot: "musique", emoji: "🎵", positionSon: 1, nbSyllabes: 3 },
    { mot: "lunette", emoji: "👓", positionSon: 1, nbSyllabes: 3 },
    { mot: "ruban", emoji: "🎀", positionSon: 1, nbSyllabes: 2 },
    { mot: "lutin", emoji: "🧝", positionSon: 1, nbSyllabes: 2 },
    { mot: "légumes", emoji: "🥕", positionSon: 2, nbSyllabes: 3 },
    { mot: "cactus", emoji: "🌵", positionSon: 2, nbSyllabes: 2 },
    { mot: "sucette", emoji: "🍭", positionSon: 2, nbSyllabes: 2 },
    { mot: "tulipe", emoji: "🌷", positionSon: 1, nbSyllabes: 3 },
  ],
  "e-accent": [
    { mot: "école", emoji: "🏫", positionSon: 2, nbSyllabes: 3 },
    { mot: "été", emoji: "☀️", positionSon: 1, nbSyllabes: 2 },
    { mot: "télé", emoji: "📺", positionSon: 1, nbSyllabes: 2 },
    { mot: "rêver", emoji: "💭", positionSon: 1, nbSyllabes: 2 },
    { mot: "père", emoji: "👨", positionSon: 1, nbSyllabes: 2 },
    { mot: "règle", emoji: "📏", positionSon: 1, nbSyllabes: 2 },
    { mot: "fenêtre", emoji: "🪟", positionSon: 2, nbSyllabes: 3 },
    { mot: "fête", emoji: "🎂", positionSon: 1, nbSyllabes: 2 },
    { mot: "tête", emoji: "🧠", positionSon: 1, nbSyllabes: 2 },
  ],
  et: [
    { mot: "billet", emoji: "🎫", positionSon: 2, nbSyllabes: 2 },
    { mot: "poulet", emoji: "🐔", positionSon: 2, nbSyllabes: 2 },
    { mot: "navet", emoji: "🥬", positionSon: 2, nbSyllabes: 2 },
    { mot: "secret", emoji: "🤫", positionSon: 2, nbSyllabes: 2 },
    { mot: "cabinet", emoji: "🪥", positionSon: 2, nbSyllabes: 3 },
  ],
  ou: [
    { mot: "poulet", emoji: "🐔", positionSon: 1, nbSyllabes: 2 },
    { mot: "couverture", emoji: "🛏️", positionSon: 2, nbSyllabes: 4 },
    { mot: "fourchette", emoji: "🍴", positionSon: 1, nbSyllabes: 3 },
    { mot: "roulette", emoji: "🎡", positionSon: 1, nbSyllabes: 3 },
  ],
  oi: [
    { mot: "poisson", emoji: "🐟", positionSon: 1, nbSyllabes: 2 },
    { mot: "oiseau", emoji: "🐦", positionSon: 1, nbSyllabes: 2 },
    { mot: "voiture", emoji: "🚗", positionSon: 2, nbSyllabes: 3 },
    { mot: "roitelet", emoji: "🐦", positionSon: 1, nbSyllabes: 3 },
  ],
  on: [
    { mot: "maison", emoji: "🏠", positionSon: 2, nbSyllabes: 2 },
    { mot: "ballon", emoji: "⚽", positionSon: 2, nbSyllabes: 2 },
    { mot: "citron", emoji: "🍋", positionSon: 2, nbSyllabes: 2 },
    { mot: "savon", emoji: "🧼", positionSon: 2, nbSyllabes: 2 },
  ],
  an: [
    { mot: "enfant", emoji: "👧", positionSon: 1, nbSyllabes: 2 },
    { mot: "maman", emoji: "👩", positionSon: 2, nbSyllabes: 2 },
    { mot: "orange", emoji: "🍊", positionSon: 1, nbSyllabes: 2 },
    { mot: "pantalon", emoji: "👖", positionSon: 1, nbSyllabes: 3 },
  ],
  in: [
    { mot: "lapin", emoji: "🐰", positionSon: 2, nbSyllabes: 2 },
    { mot: "matin", emoji: "🌅", positionSon: 2, nbSyllabes: 2 },
    { mot: "sapin", emoji: "🎄", positionSon: 2, nbSyllabes: 2 },
    { mot: "jardin", emoji: "🌳", positionSon: 2, nbSyllabes: 2 },
  ],
};

function getRepèrePourSon(son: Son, count: number, seed: number, evalOffset = 0): ItemRepère[] {
  let pool = (REPERE_SON[son.id] ?? [])
    .filter((x) => motSimplePourSon(x.mot, son.ordre) && x.nbSyllabes >= 2);
  if (!pool.length && isConsonne(son)) {
    pool = (REPERE_SON["l"] ?? []).filter((x) => motSimplePourSon(x.mot, son.ordre) && x.nbSyllabes >= 2);
  }
  if (!pool.length) {
    const mi = (MOTS_PHONO_IMAGE[son.id] ?? []).find(
      (x) => motSimplePourSon(x.mot, son.ordre) && motAuMoinsDeuxSyllabes(x.mot)
    );
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
type ItemSyllabe = { mot: string; emoji: string; image?: string; syllabeCorrecte: string; syllabeDistracteur: string };

// Pas de papa, maman, bébé (son dans plusieurs syllabes)
const SYLLABE_CHOIX: Record<string, ItemSyllabe[]> = {
  l: [
    { mot: "règle", emoji: "📏", syllabeCorrecte: "rè", syllabeDistracteur: "la" },
    { mot: "licorne", emoji: "🦄", syllabeCorrecte: "li", syllabeDistracteur: "la" },
    { mot: "lune", emoji: "🌙", syllabeCorrecte: "lu", syllabeDistracteur: "li" },
    { mot: "lézard", emoji: "🦎", syllabeCorrecte: "lé", syllabeDistracteur: "la" },
    { mot: "bulle", emoji: "🫧", syllabeCorrecte: "le", syllabeDistracteur: "la" },
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
    { mot: "piscine", emoji: "🏊", syllabeCorrecte: "scine", syllabeDistracteur: "na" },
    { mot: "nature", emoji: "🌿", syllabeCorrecte: "na", syllabeDistracteur: "ne" },
    { mot: "navet", emoji: "🥬", syllabeCorrecte: "na", syllabeDistracteur: "ne" },
    { mot: "nuage", emoji: "☁️", syllabeCorrecte: "nua", syllabeDistracteur: "na" },
    { mot: "nid", emoji: "🪺", syllabeCorrecte: "nid", syllabeDistracteur: "na" },
    { mot: "ananas", emoji: "🍍", syllabeCorrecte: "na", syllabeDistracteur: "ne" },
    { mot: "lunettes", emoji: "👓", syllabeCorrecte: "ne", syllabeDistracteur: "na" },
    { mot: "fenêtre", emoji: "🪟", syllabeCorrecte: "nê", syllabeDistracteur: "na" },
  ],
  "e-accent": [
    { mot: "télé", emoji: "📺", syllabeCorrecte: "té", syllabeDistracteur: "ta" },
    { mot: "été", emoji: "☀️", syllabeCorrecte: "é", syllabeDistracteur: "è" },
    { mot: "école", emoji: "🏫", syllabeCorrecte: "é", syllabeDistracteur: "è" },
    { mot: "rêver", emoji: "💭", syllabeCorrecte: "rê", syllabeDistracteur: "ra" },
    { mot: "règle", emoji: "📏", syllabeCorrecte: "rè", syllabeDistracteur: "ra" },
    { mot: "père", emoji: "👨", syllabeCorrecte: "pè", syllabeDistracteur: "pa" },
    { mot: "fenêtre", emoji: "🪟", syllabeCorrecte: "nê", syllabeDistracteur: "na" },
    { mot: "fête", emoji: "🎂", syllabeCorrecte: "fê", syllabeDistracteur: "fa" },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", syllabeCorrecte: "po", syllabeDistracteur: "pa" },
    { mot: "porte", emoji: "🚪", syllabeCorrecte: "por", syllabeDistracteur: "pa" },
    { mot: "pain", emoji: "🍞", syllabeCorrecte: "pain", syllabeDistracteur: "pa" },
    { mot: "père", emoji: "👨", syllabeCorrecte: "pè", syllabeDistracteur: "pa" },
    { mot: "piste", emoji: "🛷", syllabeCorrecte: "pis", syllabeDistracteur: "pa" },
    { mot: "pizza", emoji: "🍕", syllabeCorrecte: "pi", syllabeDistracteur: "pa" },
    { mot: "parapluie", emoji: "☂️", syllabeCorrecte: "pa", syllabeDistracteur: "po" },
    { mot: "piano", emoji: "🎹", syllabeCorrecte: "pia", syllabeDistracteur: "pa" },
    { mot: "pluie", emoji: "🌧️", syllabeCorrecte: "plu", syllabeDistracteur: "pa" },
    { mot: "papillon", emoji: "🦋", syllabeCorrecte: "pa", syllabeDistracteur: "po" },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", syllabeCorrecte: "to", syllabeDistracteur: "ta" },
    { mot: "télé", emoji: "📺", syllabeCorrecte: "té", syllabeDistracteur: "ta" },
    { mot: "tapis", emoji: "🪔", syllabeCorrecte: "ta", syllabeDistracteur: "to" },
    { mot: "table", emoji: "🪑", syllabeCorrecte: "ta", syllabeDistracteur: "te" },
    { mot: "tipi", emoji: "⛺", syllabeCorrecte: "ti", syllabeDistracteur: "ta" },
    { mot: "taper", emoji: "⌨️", syllabeCorrecte: "ta", syllabeDistracteur: "to" },
    { mot: "tulipe", emoji: "🌷", syllabeCorrecte: "tu", syllabeDistracteur: "ta" },
    { mot: "tirer", emoji: "🎯", syllabeCorrecte: "ti", syllabeDistracteur: "ta" },
    { mot: "moto", emoji: "🏍️", syllabeCorrecte: "to", syllabeDistracteur: "ta" },
  ],
  f: [
    { mot: "fusée", emoji: "🚀", syllabeCorrecte: "fu", syllabeDistracteur: "fa" },
    { mot: "feu", emoji: "🔥", syllabeCorrecte: "feu", syllabeDistracteur: "fa" },
    { mot: "filet", emoji: "🕸️", syllabeCorrecte: "fi", syllabeDistracteur: "fa" },
    { mot: "fleur", emoji: "🌸", syllabeCorrecte: "fleur", syllabeDistracteur: "fa" },
    { mot: "fée", emoji: "🧚", syllabeCorrecte: "fée", syllabeDistracteur: "fa" },
    { mot: "gaufre", emoji: "🧇", syllabeCorrecte: "fre", syllabeDistracteur: "fa" },
    { mot: "feuille", emoji: "🍃", syllabeCorrecte: "feu", syllabeDistracteur: "fa" },
    { mot: "flûte", emoji: "🎵", syllabeCorrecte: "flû", syllabeDistracteur: "fa" },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", syllabeCorrecte: "vé", syllabeDistracteur: "va" },
    { mot: "vache", emoji: "🐄", syllabeCorrecte: "va", syllabeDistracteur: "vé" },
    { mot: "vent", emoji: "💨", syllabeCorrecte: "vent", syllabeDistracteur: "va" },
    { mot: "ville", emoji: "🏙️", syllabeCorrecte: "vi", syllabeDistracteur: "va" },
    { mot: "vaisselle", emoji: "🍽️", syllabeCorrecte: "vai", syllabeDistracteur: "va" },
    { mot: "violon", emoji: "🎻", syllabeCorrecte: "vio", syllabeDistracteur: "va" },
  ],
  ch: [
    { mot: "chapeau", emoji: "🎩", syllabeCorrecte: "cha", syllabeDistracteur: "chi" },
    { mot: "chat", emoji: "🐱", syllabeCorrecte: "cha", syllabeDistracteur: "chi" },
    { mot: "chocolat", emoji: "🍫", syllabeCorrecte: "cho", syllabeDistracteur: "cha" },
    { mot: "cheval", emoji: "🐴", syllabeCorrecte: "che", syllabeDistracteur: "cha" },
    { mot: "chèvre", emoji: "🐐", syllabeCorrecte: "chè", syllabeDistracteur: "cha" },
    { mot: "chameau", emoji: "🐫", syllabeCorrecte: "cha", syllabeDistracteur: "chi" },
    { mot: "parachute", emoji: "🪂", syllabeCorrecte: "chu", syllabeDistracteur: "cha" },
  ],
  j: [
    { mot: "jupe", emoji: "👗", syllabeCorrecte: "ju", syllabeDistracteur: "ja" },
    { mot: "jardin", emoji: "🌳", syllabeCorrecte: "jar", syllabeDistracteur: "ja" },
    { mot: "jus", emoji: "🧃", syllabeCorrecte: "jus", syllabeDistracteur: "ja" },
    { mot: "jaune", emoji: "🟡", syllabeCorrecte: "jau", syllabeDistracteur: "ja" },
    { mot: "jongleur", emoji: "🤹", syllabeCorrecte: "jon", syllabeDistracteur: "ja" },
    { mot: "jeudi", emoji: "📅", syllabeCorrecte: "jeu", syllabeDistracteur: "ja" },
    { mot: "jumelles", emoji: "🔭", syllabeCorrecte: "ju", syllabeDistracteur: "ja" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "brosse", emoji: "🪥", syllabeCorrecte: "bro", syllabeDistracteur: "ba" },
    { mot: "balai", emoji: "🧹", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "balle", emoji: "⚾", syllabeCorrecte: "bal", syllabeDistracteur: "ba" },
    { mot: "bague", emoji: "💍", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "bonbon", emoji: "🍬", syllabeCorrecte: "bon", syllabeDistracteur: "ba" },
    { mot: "banane", emoji: "🍌", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
    { mot: "cabane", emoji: "🏠", syllabeCorrecte: "ba", syllabeDistracteur: "bo" },
  ],
  d: [
    { mot: "dos", emoji: "🎒", syllabeCorrecte: "do", syllabeDistracteur: "da" },
    { mot: "drapeau", emoji: "🚩", syllabeCorrecte: "dra", syllabeDistracteur: "da" },
    { mot: "dé", emoji: "🎲", syllabeCorrecte: "dé", syllabeDistracteur: "da" },
    { mot: "dur", emoji: "🪨", syllabeCorrecte: "dur", syllabeDistracteur: "da" },
    { mot: "cadeau", emoji: "🎁", syllabeCorrecte: "deau", syllabeDistracteur: "da" },
    { mot: "douche", emoji: "🚿", syllabeCorrecte: "dou", syllabeDistracteur: "da" },
    { mot: "début", emoji: "🏁", syllabeCorrecte: "dé", syllabeDistracteur: "da" },
  ],
  g: [
    { mot: "gare", emoji: "🚂", syllabeCorrecte: "ga", syllabeDistracteur: "go" },
    { mot: "gomme", emoji: "🧽", syllabeCorrecte: "go", syllabeDistracteur: "ga" },
    { mot: "gâteau", emoji: "🎂", syllabeCorrecte: "gâ", syllabeDistracteur: "ga" },
    { mot: "gris", emoji: "🐁", syllabeCorrecte: "gri", syllabeDistracteur: "ga" },
    { mot: "gaufre", emoji: "🧇", syllabeCorrecte: "gau", syllabeDistracteur: "ga" },
    { mot: "glace", emoji: "🍦", syllabeCorrecte: "gla", syllabeDistracteur: "ga" },
    { mot: "grenouille", emoji: "🐸", syllabeCorrecte: "grou", syllabeDistracteur: "ga" },
    { mot: "escargot", emoji: "🐌", syllabeCorrecte: "gar", syllabeDistracteur: "ga" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", syllabeCorrecte: "zé", syllabeDistracteur: "za" },
    { mot: "zoo", emoji: "🦁", syllabeCorrecte: "zo", syllabeDistracteur: "za" },
    { mot: "zèbre", emoji: "🦓", syllabeCorrecte: "zè", syllabeDistracteur: "za" },
  ],
  "c-k": [
    { mot: "camion", emoji: "🚚", syllabeCorrecte: "ca", syllabeDistracteur: "co" },
    { mot: "canard", emoji: "🦆", syllabeCorrecte: "ca", syllabeDistracteur: "cu" },
    { mot: "car", emoji: "🚗", image: "/images/car.png", syllabeCorrecte: "car", syllabeDistracteur: "ca" },
    { mot: "café", emoji: "☕", syllabeCorrecte: "ca", syllabeDistracteur: "co" },
  ],
};

function getSyllabeExercices(son: Son, count: number, seed: number, evalOffset = 0): ItemSyllabe[] {
  let pool = (SYLLABE_CHOIX[son.id] ?? []).filter(
    (x) => motSimplePourSon(x.mot, son.ordre) && motAuMoinsDeuxSyllabes(x.mot)
  );
  if (!pool.length && isConsonne(son)) {
    pool = (SYLLABE_CHOIX["l"] ?? []).filter(
      (x) => motSimplePourSon(x.mot, son.ordre) && motAuMoinsDeuxSyllabes(x.mot)
    );
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
  if (!isConsonne(son) && son.id !== "et") return result;
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
        if (["maman", "bébé", "maison"].includes(x.mot.toLowerCase())) continue;
        if (x.mot.toLowerCase() === "papa" && son.id !== "p") continue; // papa autorisé uniquement pour l'exo syllabe manquante (son p)
        if (son.id === "p" && x.mot.toLowerCase() === "sirop") continue; // sirop : P en fin (op), remplacé par papa
        if (son.id === "s" && ["légume", "légumes", "lunette", "lunettes", "limace", "limaces"].includes(x.mot.toLowerCase())) continue; // légume(s), lunette(s) : on n'entend pas le [s] ; limace(s) : [s] écrit avec c
        if (!motAuMoinsDeuxSyllabes(x.mot)) continue;
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

// Fallback : uniquement mots 2+ syllabes (jamais 1 syllabe)
const SYLLABE_MANQUANTE_FALLBACK: Record<string, ItemSyllabeManquante[]> = {
  l: [
    { mot: "vélo", emoji: "🚲", prefix: "vé", suffix: "", syllabe: "lo" },
    { mot: "bulle", emoji: "🫧", prefix: "bul", suffix: "", syllabe: "le" },
    { mot: "lézard", emoji: "🦎", prefix: "", suffix: "zard", syllabe: "lé" },
  ],
  m: [
    { mot: "moto", emoji: "🏍️", prefix: "", suffix: "to", syllabe: "mo" },
    { mot: "pomme", emoji: "🍎", prefix: "po", suffix: "", syllabe: "me" },
    { mot: "miel", emoji: "🍯", prefix: "", suffix: "el", syllabe: "mi" },
  ],
  r: [
    { mot: "robot", emoji: "🤖", prefix: "", suffix: "bot", syllabe: "ro" },
    { mot: "radio", emoji: "📻", prefix: "", suffix: "dio", syllabe: "ra" },
    { mot: "règle", emoji: "📏", prefix: "", suffix: "gle", syllabe: "rè" },
  ],
  s: [
    { mot: "salade", emoji: "🥗", prefix: "", suffix: "lade", syllabe: "sa" },
    { mot: "soleil", emoji: "☀️", prefix: "", suffix: "leil", syllabe: "so" },
    { mot: "serpent", emoji: "🐍", prefix: "ser", suffix: "", syllabe: "pent" },
    { mot: "savon", emoji: "🧼", prefix: "", suffix: "von", syllabe: "sa" },
    { mot: "sabot", emoji: "👢", prefix: "", suffix: "bot", syllabe: "sa" },
  ],
  n: [
    { mot: "navet", emoji: "🥬", prefix: "", suffix: "vet", syllabe: "na" },
    { mot: "nature", emoji: "🌿", prefix: "", suffix: "ture", syllabe: "na" },
    { mot: "nuage", emoji: "☁️", prefix: "", suffix: "age", syllabe: "nu" },
  ],
  p: [
    { mot: "pomme", emoji: "🍎", prefix: "po", suffix: "", syllabe: "me" },
    { mot: "pizza", emoji: "🍕", prefix: "", suffix: "zza", syllabe: "pi" },
    { mot: "pastèque", emoji: "🍉", prefix: "", suffix: "tèque", syllabe: "pas" },
    { mot: "papa", emoji: "👨", prefix: "pa", suffix: "", syllabe: "pa" },
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
  ],
  ch: [
    { mot: "chapeau", emoji: "🎩", prefix: "cha", suffix: "", syllabe: "peau" },
    { mot: "chocolat", emoji: "🍫", prefix: "", suffix: "colat", syllabe: "cho" },
    { mot: "cheval", emoji: "🐴", prefix: "che", suffix: "", syllabe: "val" },
  ],
  j: [
    { mot: "jupe", emoji: "👗", prefix: "ju", suffix: "", syllabe: "pe" },
    { mot: "jardin", emoji: "🌳", prefix: "", suffix: "din", syllabe: "jar" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", prefix: "", suffix: "llon", syllabe: "ba" },
    { mot: "brosse", emoji: "🪥", prefix: "bro", suffix: "", syllabe: "sse" },
    { mot: "balai", emoji: "🧹", prefix: "", suffix: "lai", syllabe: "ba" },
  ],
  d: [
    { mot: "drapeau", emoji: "🚩", prefix: "dra", suffix: "", syllabe: "peau" },
  ],
  g: [
    { mot: "gâteau", emoji: "🎂", prefix: "gâ", suffix: "teau", syllabe: "teau" },
    { mot: "gomme", emoji: "🧽", prefix: "go", suffix: "", syllabe: "mme" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", prefix: "zé", suffix: "", syllabe: "ro" },
  ],
  "c-k": [
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

// ——— Exo : Entoure la lettre/le son dans le mot ———
export type ItemEntoureLettreDansMot = { word: string; targetIndices: number[] };

function getEntoureLettreDansMotItems(
  son: Son,
  count: number,
  seed: number,
  evalOffset = 0
): ItemEntoureLettreDansMot[] {
  const grapheme = son.grapheme.split(",")[0].trim().toLowerCase();
  function contientSon(m: string): boolean {
    const w = m.toLowerCase();
    if (son.id === "c-k") return /[ckq]/.test(w);
    if (son.id === "e-accent") return /[éèêë]/.test(w);
    if (grapheme.length === 1) return w.includes(grapheme);
    return (
      w.includes(grapheme) ||
      (son.id === "ou" && w.includes("ou")) ||
      (son.id === "oi" && /oi/.test(w)) ||
      (son.id === "on" && /on/.test(w)) ||
      (son.id === "an" && /an/.test(w)) ||
      (son.id === "in" && /in/.test(w))
    );
  }
  function nbOccurrencesGrapheme(mot: string): number {
    const w = mot.toLowerCase();
    if (son.id === "e-accent") return (w.match(/[éèêë]/g) ?? []).length;
    if (grapheme.length === 1) return (w.match(new RegExp(grapheme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
    const regex = son.id === "oi" || son.id === "on" || son.id === "an" || son.id === "in" ? new RegExp(grapheme, "g") : new RegExp(grapheme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    return (w.match(regex) ?? []).length;
  }
  function addToPool(mot: string): void {
    const w = mot.toLowerCase();
    if (!contientSon(w) || !motSimplePourSon(w, son.ordre) || !motAuMoinsDeuxSyllabes(w)) return;
    if (nbOccurrencesGrapheme(w) > 1) return;
    if (pool.some((x) => x.word.toLowerCase() === w)) return;
    let start = -1;
    if (grapheme.length === 1) {
      start = w.indexOf(grapheme);
    } else {
      const patterns = son.id === "e-accent" ? ["é", "è", "ê", "ë"] : [grapheme];
      for (const p of patterns) {
        const i = w.indexOf(p);
        if (i >= 0) {
          start = i;
          break;
        }
      }
      if (start < 0 && (son.id === "ou" || son.id === "oi" || son.id === "on" || son.id === "an" || son.id === "in")) {
        start = w.indexOf(grapheme);
      }
    }
    if (start < 0) return;
    const len = grapheme.length === 1 ? 1 : (son.id === "e-accent" ? 1 : grapheme.length);
    const targetIndices = Array.from({ length: len }, (_, k) => start + k);
    pool.push({ word: mot, targetIndices });
  }
  const pool: { word: string; targetIndices: number[] }[] = [];
  for (const entry of MOTS_PHONO_IMAGE[son.id] ?? []) {
    addToPool(entry.mot);
  }
  for (const entry of REPERE_SON[son.id] ?? []) {
    if (entry.nbSyllabes >= 2) addToPool(entry.mot);
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const off = Math.min(evalOffset * 2, Math.max(0, shuffled.length - count));
  return shuffled.slice(off, off + count);
}

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

// ——— Exo : Relie les écritures (cursive / imprimé) ———
export type ItemRelieEcritures = { words: string[] };

/** True si le mot commence par le graphème du son (pour Phono : uniquement mots commençant par la lettre). */
function motCommenceParSon(mot: string, son: Son): boolean {
  const m = mot.trim().toLowerCase();
  const g = son.grapheme.split(",")[0].trim().toLowerCase();
  if (son.id === "c-k") return m.startsWith("c") || m.startsWith("k");
  if (g.length > 1) return m.startsWith(g);
  return m.startsWith(g);
}

/** Série fixe pour l'exercice Cursives-imprimés de la lettre j : 6 mots. */
const RELIE_ECRITURES_MOTS_J = ["jumelles", "jupe", "jeudi", "judo", "jus", "jeton"];

/** Série fixe pour l'exercice Cursives-imprimés de la lettre d : 8 mots (dont divan et dimanche). */
const RELIE_ECRITURES_MOTS_D = ["drapeau", "dame", "dentifrice", "début", "déjà", "douche", "divan", "dimanche"];

/** Série fixe pour l'exercice Cursives-imprimés de la lettre g : 8 mots (dont gare, kangourou et légume). */
const RELIE_ECRITURES_MOTS_G = ["gare", "kangourou", "légume", "gomme", "gâteau", "glace", "gorge", "gourde"];

/** Pour Phono 1/2, Phono Image, Sons images (à partir de p) : 5 mots commençant par la lettre pour relie écritures. */
export function getRelieEcrituresItemsPourPhono(son: Son, count: number, seed: number): ItemRelieEcritures[] {
  if (son.ordre < ORDRE_SON_P) return [];
  if (son.id === "j") {
    const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
    const shuffled = [...RELIE_ECRITURES_MOTS_J];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(s(i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [{ words: shuffled }];
  }
  if (son.id === "d") {
    const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
    const shuffled = [...RELIE_ECRITURES_MOTS_D];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(s(i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [{ words: shuffled }];
  }
  if (son.id === "g") {
    const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
    const shuffled = [...RELIE_ECRITURES_MOTS_G];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(s(i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [{ words: shuffled }];
  }
  const pool: string[] = [];
  const seen = new Set<string>();
  for (const entry of MOTS_PHONO_IMAGE[son.id] ?? []) {
    const w = entry.mot.trim();
    const low = w.toLowerCase();
    if (!motCommenceParSon(low, son) || !motSimplePourSon(low, son.ordre) || !motAuMoinsDeuxSyllabes(low) || seen.has(low)) continue;
    seen.add(low);
    pool.push(w);
  }
  for (const entry of REPERE_SON[son.id] ?? []) {
    if (entry.nbSyllabes < 2) continue;
    const w = entry.mot.trim();
    const low = w.toLowerCase();
    if (!motCommenceParSon(low, son) || !motSimplePourSon(low, son.ordre) || seen.has(low)) continue;
    seen.add(low);
    pool.push(w);
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const words = shuffled.slice(0, Math.min(count, shuffled.length));
  if (words.length < 2) return [];
  return [{ words }];
}

function getRelieEcrituresItems(son: Son, count: number, seed: number, evalOffset = 0): ItemRelieEcritures[] {
  const pool: string[] = [];
  const seen = new Set<string>();
  for (const entry of MOTS_PHONO_IMAGE[son.id] ?? []) {
    const w = entry.mot.trim();
    const low = w.toLowerCase();
    if (!motSimplePourSon(low, son.ordre) || !motAuMoinsDeuxSyllabes(low) || seen.has(low)) continue;
    seen.add(low);
    pool.push(w);
  }
  for (const entry of REPERE_SON[son.id] ?? []) {
    if (entry.nbSyllabes < 2) continue;
    const w = entry.mot.trim();
    const low = w.toLowerCase();
    if (!motSimplePourSon(low, son.ordre) || seen.has(low)) continue;
    seen.add(low);
    pool.push(w);
  }
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const n = Math.min(count, shuffled.length);
  const off = Math.min(evalOffset * 2, Math.max(0, shuffled.length - n));
  const words = shuffled.slice(off, off + n);
  if (words.length < 2) return [];
  return [{ words }];
}

// ——— Évaluation 4 : Fluence chrono (1 minute) ———
/** 49 sons + 31 mots + 10 mots liens = 90 items (consonnes / digrammes). Voyelles : 70 lettres + 10 mots liens = 80. */
const FLUENCE_NB_SONS = 49;
const FLUENCE_NB_MOTS = 31;
const FLUENCE_NB_MOTS_LIENS = 10;
const FLUENCE_TOTAL_CONS = FLUENCE_NB_SONS + FLUENCE_NB_MOTS + FLUENCE_NB_MOTS_LIENS; // 90
const FLUENCE_TOTAL_VOY = 70 + FLUENCE_NB_MOTS_LIENS; // 80

/** Mots 3+ syllabes (exclus de la fluence mots 1–2 syllabes). */
function getMotsTroisSyllabesOuPlus(): Set<string> {
  const set = new Set<string>();
  for (const list of Object.values(REPERE_SON)) {
    for (const x of list) {
      if (x.nbSyllabes >= 3) set.add(x.mot.toLowerCase());
    }
  }
  return set;
}

/** Mots scolaires pour la fluence : uniquement sons déjà vus. 1–2 syllabes, par son. */
const FLUENCE_MOTS_SCOLAIRES: Record<string, string[]> = {
  m: ["hum", "mama", "mamie", "amie", "mimi", "môme", "même", "ma", "mou", "mou", "ami", "mât", "mots", "miel", "midi", "moto", "mur", "melon", "pomme", "mouton", "marteau", "domino", "musique", "maison", "plume", "madame", "melon", "moto", "pomme", "miel", "mur"],
  l: ["lama", "mâle", "lame", "ami", "lime", "lino", "mal", "nuit", "lune", "lit", "lait", "lac", "lézard", "vélo", "lavabo", "balle", "livre", "lourd", "lunettes", "lumière", "poules", "lions", "limaces", "valises", "lattes", "cheval", "lune", "bulle", "règle", "licorne", "lézard"],
  r: ["mûre", "remanié", "renu", "amir", "armure", "remue", "larme", "lyra", "rat", "riz", "rue", "robot", "raquette", "règle", "repas", "robinet", "roi", "souris", "réveil", "rame", "ruche", "renard", "sucre", "rat", "radio", "règle", "rue", "rire", "rare", "rond", "rose"],
  s: ["ça", "lasso", "los", "glisse", "salut", "Salim", "si", "mot", "sérieux", "lilas", "salami", "Maroc", "sac", "salade", "soleil", "serpent", "sel", "souris", "sucette", "sac", "salade", "soleil", "sirop", "sport", "stylo", "sorcière", "sac", "salade", "soleil", "serpent", "sel"],
  n: ["piscine", "nature", "navet", "nuage", "nid", "note", "ananas", "âne", "nœud", "lunettes", "niche", "fenêtre", "laine", "lune", "nuages", "piscine", "nature", "navet", "nuage", "nid", "note", "ananas", "lunettes", "fenêtre", "nuages", "piscine", "nature", "nuage", "nid", "note", "lunettes"],
  p: ["papa", "pipi", "popo", "pomme", "pain", "porte", "pizza", "père", "piste", "parapluie", "piano", "pluie", "papillon", "pédale", "premier", "perroquet", "pastèque", "parasol", "pomme", "pain", "porte", "père", "pluie", "pomme", "pizza", "papa", "pipi", "piano", "pluie", "pomme", "pain"],
  t: ["tomate", "télé", "tapis", "table", "tipi", "taper", "tirer", "tulipe", "téléphone", "ordinateur", "moto", "locomotive", "tomate", "télé", "tapis", "table", "tulipe", "moto", "tomate", "télé", "tapis", "taper", "tirer", "tomate", "télé", "table", "tulipe", "tapis", "ordinateur"],
  f: ["fusée", "filet", "café", "fée", "facteur", "girafe", "gaufre", "feuille", "forêt", "flûte", "feu", "fusée", "fleur", "fromage", "farde", "farine", "ficelle", "fumée", "fusée", "fée", "feuille", "flûte", "feu", "fusée", "filet", "fée", "feuille", "fusée", "forêt", "flûte"],
  v: ["vélo", "vache", "vent", "ville", "vaisselle", "violon", "caravane", "vélo", "vache", "vent", "ville", "vase", "voiture", "vélo", "vache", "vent", "ville", "vaisselle", "violon", "vélo", "vache", "vent", "ville", "vélo", "vache", "vent", "ville", "vélo", "vache", "vent", "ville"],
  ch: ["chat", "chapeau", "chocolat", "cheval", "chèvre", "chameau", "parachute", "douche", "chat", "chapeau", "chocolat", "cheval", "chèvre", "chameau", "chat", "chapeau", "chocolat", "cheval", "chèvre", "chat", "chapeau", "chocolat", "cheval", "chèvre", "chat", "chapeau", "chocolat", "cheval", "chèvre", "chat"],
  j: ["jupe", "jardin", "jambon", "pyjama", "jongleur", "jeudi", "jumelles", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon", "jupe", "jardin", "jambon"],
  b: ["ballon", "brosse", "balai", "balle", "bateau", "bague", "bonhomme", "bonbon", "banane", "cabane", "bijoux", "ballon", "brosse", "balai", "balle", "bateau", "ballon", "brosse", "balai", "balle", "bateau", "ballon", "brosse", "balai", "balle", "ballon", "brosse", "balai", "balle", "ballon", "brosse"],
  d: ["drapeau", "cadeau", "dentifrice", "douche", "début", "dé", "dame", "dos", "drapeau", "cadeau", "douche", "début", "drapeau", "cadeau", "dame", "drapeau", "cadeau", "douche", "drapeau", "cadeau", "drapeau", "cadeau", "drapeau", "cadeau", "drapeau", "cadeau", "drapeau", "cadeau", "drapeau", "cadeau", "drapeau"],
  g: ["gâteau", "gaufre", "licorne", "glace", "grenouille", "escargot", "gare", "gomme", "gris", "gros", "gorge", "gâteau", "gaufre", "glace", "gare", "gomme", "gâteau", "gaufre", "glace", "gare", "gâteau", "gaufre", "glace", "gare", "gâteau", "gaufre", "glace", "gare", "gâteau", "gaufre", "glace"],
  z: ["zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro", "zoo", "zèbre", "zéro"],
  "c-k": ["café", "canard", "camion", "clé", "coq", "car", "croc", "café", "canard", "camion", "clé", "coq", "café", "canard", "camion", "clé", "café", "canard", "camion", "café", "canard", "camion", "café", "canard", "camion", "café", "canard", "camion", "café", "canard", "camion"],
  et: ["et", "billet", "poulet", "navet", "secret", "cabinet", "piolet", "basket", "et", "billet", "poulet", "navet", "secret", "et", "billet", "poulet", "navet", "et", "billet", "poulet", "et", "billet", "et", "billet", "poulet", "navet", "secret", "et", "billet", "poulet"],
};

/** Mots français 1–2 syllabes pour la fluence : priorité aux listes scolaires, puis complément depuis MOTS_PHONO_IMAGE / REPERE_SON. */
function getMotsFluencePourSon(son: Son, count: number, seed: number): string[] {
  const mots3plus = getMotsTroisSyllabesOuPlus();
  const rnd = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;

  const scolaires = (FLUENCE_MOTS_SCOLAIRES[son.id] ?? [])
    .filter((mot) => {
      const m = mot.trim().toLowerCase();
      return motSimplePourSon(m, son.ordre) && !mots3plus.has(m);
    });

  const pool: string[] = [];
  const seen = new Set<string>(scolaires.map((m) => m.trim().toLowerCase()));

  for (const entry of scolaires) {
    pool.push(entry.trim());
  }
  for (const s of SONS) {
    if (s.ordre > son.ordre) continue;
    for (const entry of MOTS_PHONO_IMAGE[s.id] ?? []) {
      const mot = entry.mot.trim().toLowerCase();
      if (!motSimplePourSon(mot, son.ordre) || mots3plus.has(mot) || seen.has(mot)) continue;
      seen.add(mot);
      pool.push(entry.mot.trim());
    }
    for (const entry of REPERE_SON[s.id] ?? []) {
      if (entry.nbSyllabes >= 3) continue;
      const mot = entry.mot.trim().toLowerCase();
      if (!motSimplePourSon(mot, son.ordre) || seen.has(mot)) continue;
      seen.add(mot);
      pool.push(entry.mot.trim());
    }
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(i) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** 10 mots liens (positions 81–90) : progression selon le son déjà vu. Jusqu'à L : un, une, des. Puis + la, + par, + sans/mais, + où/ou. */
function getMotsLiens(son: Son): string[] {
  const o = son.ordre;
  let base: string[] = ["un", "une", "des"];
  if (o >= 6) base = ["un", "une", "des", "la"];
  if (o >= 7) base = ["un", "une", "des", "la", "par"];
  if (o >= 8) base = ["un", "une", "des", "la", "par", "sans", "mais"];
  if (o >= 14) base = ["un", "une", "des", "la", "par", "sans", "mais", "où", "ou"];
  const out: string[] = [];
  for (let i = 0; i < FLUENCE_NB_MOTS_LIENS; i++) {
    out.push(base[i % base.length]);
  }
  return out;
}

/** Syllabes pour les graphèmes complexes (ou, oi, on, an, in) : 2 à 4 lettres formant des sons. */
const FLUENCE_SYLLABES_DIGRAPHES: Record<string, string[]> = {
  ou: ["ou", "lou", "cou", "pou", "rou", "sou", "nou", "mou", "tou", "fou", "vou", "bou", "dou", "jou", "gou", "zou", "out", "oux"],
  oi: ["oi", "loi", "roi", "moi", "toi", "soi", "voi", "boi", "poi", "foi", "noi", "dois", "goi", "zoi", "choi", "quoi"],
  on: ["on", "lon", "ron", "mon", "ton", "son", "non", "pon", "fon", "von", "bon", "don", "jon", "gon", "zon", "ont", "ons"],
  an: ["an", "lan", "ran", "man", "tan", "san", "nan", "pan", "fan", "van", "ban", "dan", "jan", "gan", "zan", "ant", "ans", "ent", "ens"],
  in: ["in", "lin", "rin", "min", "tin", "sin", "nin", "pin", "vin", "bin", "din", "jin", "gin", "ain", "ein", "ins"],
};

/** Liste personnalisée de fluence (ex. grille PDF) : items et nombre d’éléments par ligne. Si défini pour un son, il est utilisé à la place du généré. */
export type FluenceCustomEntry = { items: string[]; perLine?: number; lineLengths?: number[] };
export const FLUENCE_CUSTOM: Partial<Record<string, FluenceCustomEntry>> = {
  /** Voyelle 1 (son o) — grille Lecture : 6 (Lecture 1, voyelles en image.pdf). */
  o: {
    items: [
      "é", "è", "e", "a", "i",
      "u", "o", "e", "è", "é",
      "a", "u", "é", "e", "é",
      "o", "e", "è", "i", "è",
      "é", "é", "e", "e", "è",
      "é", "é", "e", "è", "u",
    ],
    perLine: 5,
  },
  /** Voyelle 2 (son u) — grille précédente (lecture de voyelle). */
  u: {
    items: [
      "é", "è", "e", "a", "i",
      "u", "o", "e", "è", "é",
      "a", "u", "é", "e", "é",
      "o", "e", "è", "i", "è",
      "è", "é", "e", "e", "è",
      "é", "è", "e", "è", "u",
    ],
    perLine: 5,
  },
  /** Voyelle 3 (son e) — grille Lecture 1, voyelles en image (page 8). */
  e: {
    items: [
      "é", "è", "e", "a", "i",
      "u", "o", "e", "è", "é",
      "a", "u", "é", "e", "é",
      "o", "e", "è", "i", "è",
      "è", "é", "e", "e", "è",
      "é", "é", "e", "è", "u",
    ],
    perLine: 5,
  },
  /** Consonne M — 28 sons (4×7), 27 mots (5+5+5+6+6), 2 phrases (9 mots) + 1 phrase (4 mots). Chiffre en fin de ligne : 7, 14, 21, 28, 33, 38, 43, 49, 55, 64, 68. */
  m: {
    items: [
      // 28 sons (lignes de 7)
      "ma", "me", "mi", "mo", "mu", "am", "em",
      "im", "om", "um", "ma", "me", "mi", "mo",
      "mu", "am", "em", "im", "om", "um", "ma",
      "me", "mi", "mo", "mu", "am", "em", "im",
      // 27 mots (5, 5, 5, 6, 6)
      "hum", "mama", "mamie", "amie", "mimi",
      "môme", "même", "ma", "mou", "ami",
      "mât", "mots", "miel", "midi", "moto",
      "mur", "melon", "pomme", "mouton", "marteau", "domino",
      "musique", "maison", "plume", "madame", "melon", "moto",
      // 2 phrases : mamie a une mort / une mamie a un rhume (9 mots)
      "mamie", "a", "une", "mort", "une", "mamie", "a", "un", "rhume",
      // 1 phrase : maman mine un ami (4 mots)
      "maman", "mine", "un", "ami",
    ],
    lineLengths: [7, 7, 7, 7, 5, 5, 5, 6, 6, 9, 4],
  },
  /** Consonne L — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 7 mots outils, 2 phrases (5+6 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 76, 81, 87. */
  l: {
    items: [
      // 49 syllabes (7 lignes de 7)
      "al", "le", "li", "lo", "lu", "ly", "le",
      "li", "lo", "lu", "la", "le", "lu", "lo",
      "ul", "al", "le", "il", "lo", "lu", "ly",
      "li", "lo", "ul", "la", "le", "lu", "ol",
      "ra", "lo", "mu", "mi", "ri", "la", "lo",
      "mo", "mu", "lu", "ra", "il", "ar", "or",
      "ol", "ul", "il", "al", "ma", "mi", "ir",
      // Les mots (4 lignes de 5)
      "Lama", "mal", "mure", "lame", "rami",
      "armure", "remue", "mur", "lime", "ami",
      "Léna", "lira", "ara", "ira", "larme",
      "lire", "malle", "l'or", "armure", "ara",
      // Les mots outils (1 ligne de 7)
      "un", "avec", "de", "une", "le", "la", "avec",
      // Les phrases : Léna lit avec un ami. (5) / Le lama ira dans la mare. (6)
      "Léna", "lit", "avec", "un", "ami",
      "Le", "lama", "ira", "dans", "la", "mare",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 7, 5, 6],
  },
  /** Consonne R — Fluence lecture 1 et 2 primaire : 16 sons (2×8), 28 syllabes (4×7), 20 syllabes liées (4×5), 7 mots outils. Chiffres : 8, 16, 23, 30, 37, 44, 49, 54, 59, 64, 71. */
  r: {
    items: [
      // Les sons (2 lignes de 8)
      "a", "e", "i", "o", "u", "r", "e", "i",
      "r", "u", "a", "r", "u", "o", "i", "r",
      // Les syllabes (4 lignes de 7)
      "ra", "re", "ri", "ro", "ru", "ry", "re",
      "ri", "ro", "ru", "ra", "re", "ru", "ro",
      "ru", "ar", "re", "ir", "ro", "ur", "ry",
      "ri", "ro", "ru", "ar", "re", "ru", "or",
      // Les syllabes liées (4 lignes de 5)
      "rare", "riro", "rury", "rero", "rari",
      "raro", "rura", "reru", "rori", "ruro",
      "iru", "ira", "oro", "ura", "rary",
      "riro", "aru", "arre", "ruri", "ora",
      // Les mots outils (1 ligne de 7)
      "un", "de", "une", "un", "une", "de", "un",
    ],
    lineLengths: [8, 8, 7, 7, 7, 7, 5, 5, 5, 5, 7],
  },
  /** Consonne S — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (5+4+7 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 79, 83, 90. */
  s: {
    items: [
      // Les sons (7 lignes de 7)
      "sa", "se", "si", "so", "su", "sy", "se",
      "si", "so", "su", "sa", "se", "su", "so",
      "ul", "sal", "se", "sil", "sor", "su", "sy",
      "lip", "lop", "pu", "lap", "le", "ul", "ol",
      "ra", "sol", "sul", "mis", "sip", "sap", "lor",
      "mor", "sur", "sup", "ras", "pil", "par", "sor",
      "lo", "us", "il", "as", "ma", "mis", "is",
      // Les mots (4 lignes de 5)
      "sale", "lasso", "papa", "l'os", "lys",
      "pipe", "sali", "Salim", "iris", "lit",
      "lis", "assis", "sol", "sirop", "palme",
      "sort", "mare", "parle", "série", "lilas",
      // Les mots outils (1 ligne de 5)
      "avec", "des", "sans", "mais", "et",
      // Les phrases : Salim a sali son lit. (5) / Léo parle avec Papa. (4) / Sami a une pipe et du lilas. (7)
      "Salim", "a", "sali", "son", "lit",
      "Léo", "parle", "avec", "Papa",
      "Sami", "a", "une", "pipe", "et", "du", "lilas",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 4, 7],
  },
  /** Consonne P — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 7 mots outils, 3 phrases (5+6+6 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 76, 81, 87, 93. */
  p: {
    items: [
      // Les syllabes (7 lignes de 7)
      "pa", "pe", "pi", "po", "pu", "py", "pe",
      "pi", "po", "pu", "pa", "pe", "pu", "po",
      "pal", "pe", "pil", "pu", "py", "ap", "ep",
      "ip", "op", "up", "pa", "pe", "pi", "po",
      "lip", "lop", "pu", "lap", "rip", "lap", "ep",
      "rap", "pil", "par", "por", "pur", "pel", "pol",
      "pul", "pa", "pe", "pi", "po", "pu", "py",
      // Les mots (4 lignes de 5)
      "papa", "papi", "pale", "pape", "pari",
      "pipe", "palme", "parle", "pomme", "port",
      "pain", "plume", "poule", "pied", "puce",
      "poli", "punaise", "panda", "prune", "piste",
      // Les mots outils (1 ligne de 7)
      "un", "une", "le", "la", "par", "avec", "de",
      // Les phrases : Léo parle avec un papa. (5) / Le papi de papa a mal. (6) / Papi parle de papa et maman. (6)
      "Léo", "parle", "avec", "un", "papa",
      "Le", "papi", "de", "papa", "a", "mal",
      "Papi", "parle", "de", "papa", "et", "maman",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 7, 5, 6, 6],
  },
  /** Consonne N — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (4+6+5 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 78, 84, 89. */
  n: {
    items: [
      // Les syllabes (7 lignes de 7)
      "na", "ne", "ni", "no", "nu", "ny", "ne",
      "ni", "no", "né", "na", "ne", "nu", "no",
      "nur", "nal", "né", "nil", "nor", "nul", "nir",
      "nif", "nor", "na", "no", "nup", "nol", "nal",
      "fa", "chol", "chal", "fip", "mif", "cha", "chir",
      "lor", "pur", "chu", "ris", "fim", "mar", "lor",
      "lof", "fu", "mil", "mas", "ma", "chi", "ril",
      // Les mots (4 lignes de 5)
      "nid", "niche", "annulé", "ananas", "âne",
      "lionne", "nonne", "numéro", "énorme", "renard",
      "mare", "assis", "chat", "riche", "fiche",
      "lune", "affiche", "pipe", "murmure", "larme",
      // Les mots outils (1 ligne de 5)
      "et", "avec", "car", "mais", "sans",
      // Les phrases : Aline a une niche. (4) / La chatte est dans la forêt. (6) / Le papi fume la pipe. (5)
      "Aline", "a", "une", "niche",
      "La", "chatte", "est", "dans", "la", "forêt",
      "Le", "papi", "fume", "la", "pipe",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 4, 6, 5],
  },
  /** Consonne T — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (7+9+10 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 81, 90, 100. */
  t: {
    items: [
      // Les syllabes (7 lignes de 7)
      "ta", "ten", "ti", "tu", "to", "ty", "té",
      "tan", "tè", "te", "tou", "ty", "tan", "ten",
      "tal", "tip", "tul", "tor", "tir", "tol", "tur",
      "at", "et", "it", "ot", "ut", "ta", "te",
      "ti", "to", "tu", "at", "et", "it", "ot",
      "ut", "tal", "tel", "til", "tol", "tul", "tor",
      "tir", "tol", "tur", "ta", "te", "ti", "to",
      // Les mots (4 lignes de 5)
      "tomate", "tortue", "dent", "tout", "tornade",
      "toute", "Toujours", "tarte", "chute", "vite",
      "lent", "enfant", "méchant", "gant", "Nathan",
      "tapis", "tente", "petit", "mot", "part",
      // Les mots outils (1 ligne de 5)
      "et", "avec", "dans", "la", "très",
      // Les phrases : La tatie de Tatiana a une tortue. (7) / Léo a chuté, il a mal à la jambe. (9) / Il y a une tache de moutarde sur ta robe. (10)
      "La", "tatie", "de", "Tatiana", "a", "une", "tortue",
      "Léo", "a", "chuté", "il", "a", "mal", "à", "la", "jambe",
      "Il", "y", "a", "une", "tache", "de", "moutarde", "sur", "ta", "robe",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 7, 9, 10],
  },
  /** Consonne V — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (6+6+9 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 80, 86, 95. */
  v: {
    items: [
      // Les syllabes (7 lignes de 7)
      "vê", "vè", "va", "vo", "ve", "vé", "vu",
      "vi", "vo", "vy", "va", "vê", "vi", "vè",
      "pè", "fi", "ru", "rè", "mol", "so", "sal",
      "fu", "cha", "rê", "vur", "var", "vo", "ro",
      "fol", "chi", "pu", "lir", "par", "re", "fé",
      "pol", "rol", "sir", "sa", "fè", "sa", "nil",
      "nè", "fi", "lê", "rê", "nar", "chê", "ni",
      // Les mots (4 lignes de 5)
      "vache", "vélo", "vipère", "mèche", "chevelu",
      "cheval", "Valérie", "ville", "volé", "rêverie",
      "lire", "même", "forêt", "assis", "sofa",
      "Vipère", "énorme", "série", "parle", "malle",
      // Les mots outils (1 ligne de 5)
      "mais", "est", "son", "car", "de",
      // Les phrases : La vache est dans la forêt. (6) / Le vélo de Léo est volé. (6) / Valérie ne va pas en ville avec son père. (9)
      "La", "vache", "est", "dans", "la", "forêt",
      "Le", "vélo", "de", "Léo", "est", "volé",
      "Valérie", "ne", "va", "pas", "en", "ville", "avec", "son", "père",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 6, 6, 9],
  },
  /** Consonne F — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (7+4+8 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 81, 85, 93. */
  f: {
    items: [
      // Les syllabes (7 lignes de 7)
      "fa", "fe", "fi", "fo", "fu", "fy", "fe",
      "fi", "fo", "fu", "fa", "fe", "fu", "fo",
      "uf", "fal", "fé", "fil", "for", "lu", "ry",
      "lif", "lof", "puf", "fas", "lip", "uf", "rol",
      "fa", "fol", "ful", "fip", "sif", "fap", "ror",
      "mor", "fur", "mup", "mas", "fim", "far", "lor",
      "lof", "pus", "mil", "ras", "maf", "mip", "ris",
      // Les mots (4 lignes de 5)
      "fil", "folle", "fée", "fossé", "fosse",
      "sofa", "fort", "fils", "affalé", "rat",
      "malle", "assis", "pipe", "sirop", "marre",
      "Sam", "mamie", "massé", "murmure", "lys",
      // Les mots outils (1 ligne de 5)
      "avec", "des", "sans", "mais", "et",
      // Les phrases : Sam est sur le sofa avec Sarah. (7) / La fée est folle. (4) / Sami est fort. Il est sur la malle. (8)
      "Sam", "est", "sur", "le", "sofa", "avec", "Sarah",
      "La", "fée", "est", "folle",
      "Sami", "est", "fort", "Il", "est", "sur", "la", "malle",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 7, 4, 8],
  },
  /** Son CH — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (7+10+5 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 81, 91, 96. */
  ch: {
    items: [
      // Les syllabes (7 lignes de 7)
      "cha", "che", "chi", "cho", "chu", "chy", "che",
      "chi", "cho", "ché", "cha", "che", "chu", "cho",
      "chur", "chal", "ché", "chil", "chor", "chum", "chir",
      "chif", "chor", "cha", "cho", "chup", "chol", "chul",
      "fa", "chol", "chal", "fip", "sif", "chap", "chir",
      "mor", "fur", "chup", "pis", "fim", "far", "lor",
      "lof", "pus", "mil", "ras", "maf", "chi", "ris",
      // Les mots (4 lignes de 5)
      "ruche", "marché", "riche", "roche", "charme",
      "affiche", "fort", "chat", "chatte", "rat",
      "mare", "assis", "charriot", "sirop", "fiche",
      "Lia", "lilas", "pipe", "murmure", "lasso",
      // Les mots outils (1 ligne de 5)
      "aussi", "en", "sans", "mais", "et",
      // Les phrases : Lia affiche la fiche sur le mur. (7) / Le chat est sur le sofa. Il chasse les rats. (10) / Léa marche avec un charriot. (5)
      "Lia", "affiche", "la", "fiche", "sur", "le", "mur",
      "Le", "chat", "est", "sur", "le", "sofa", "Il", "chasse", "les", "rats",
      "Léa", "marche", "avec", "un", "charriot",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 7, 10, 5],
  },
  /** Son J — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (5+7+6 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 79, 86, 92. */
  j: {
    items: [
      // Les syllabes (7 lignes de 7)
      "ja", "jou", "ju", "jê", "je", "ju", "jy",
      "jè", "jé", "ji", "jac", "jol", "ji", "jo",
      "jour", "jur", "jir", "jyp", "jap", "jil", "jor",
      "jap", "ju", "ja", "je", "ji", "jo", "ju",
      "jor", "jel", "joc", "juc", "aj", "ej", "ij",
      "oj", "uj", "ja", "jou", "ju", "jê", "je",
      "jy", "jè", "jé", "ji", "jac", "jol", "jo",
      // Les mots (4 lignes de 5)
      "jupe", "bijou", "Julie", "journée", "jour",
      "joli", "joué", "Jules", "jouet", "jardin",
      "jambon", "jaune", "jus", "bijou", "jupe",
      "joli", "jour", "Julie", "Jules", "jouet",
      // Les mots outils (1 ligne de 5)
      "qui", "chez", "très", "est", "comme",
      // Les phrases : Julie a joué avec Lily. (5) / Johanna a une jolie bouée avec un canari. (7 mots affichés) / Barbara a une jolie jupe. (6)
      "Julie", "a", "joué", "avec", "Lily",
      "Johanna", "a", "une", "jolie", "bouée", "avec", "un",
      "Barbara", "a", "une", "jolie", "jupe", "bleue",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 7, 6],
  },
  /** Consonne B — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (7+6+5 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 81, 87, 92. */
  b: {
    items: [
      // Les syllabes (7 lignes de 7)
      "ba", "bou", "bu", "bê", "be", "bu", "by",
      "bè", "bé", "bi", "bac", "bol", "bul", "bil",
      "bou", "bur", "bir", "byp", "bep", "nol", "ra",
      "ror", "pul", "pê", "cap", "nar", "vol", "chu",
      "pou", "for", "co", "ne", "mal", "fe", "ché",
      "lu", "bè", "pil", "sal", "by", "bou", "por",
      "bi", "fy", "co", "ca", "lu", "fè", "nil",
      // Les mots (4 lignes de 5)
      "bouche", "bar", "bébé", "bol", "bac",
      "biche", "Luc", "couché", "cabane", "bulle",
      "sac", "bizarre", "zizanie", "cacao", "zéro",
      "canapé", "capuche", "copine", "caniche", "lac",
      // Les mots outils (1 ligne de 5)
      "des", "chez", "et", "même", "comme",
      // Les phrases : Le bébé de Lily a une capuche. (7) / C'est bizarre, Zélie a des babouches. (6) / Milo a bu son bol. (5)
      "Le", "bébé", "de", "Lily", "a", "une", "capuche",
      "C'est", "bizarre", "Zélie", "a", "des", "babouches",
      "Milo", "a", "bu", "son", "bol",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 7, 6, 5],
  },
  /** Consonne D — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (7+10+8 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 81, 91, 99. */
  d: {
    items: [
      // Les syllabes (7 lignes de 7)
      "da", "dou", "du", "dê", "de", "di", "dy",
      "dè", "dé", "di", "dac", "dol", "dul", "dil",
      "dou", "dur", "dir", "dyp", "dep", "ad", "ed",
      "id", "od", "ud", "da", "de", "di", "do",
      "du", "dè", "dé", "dac", "dol", "dul", "dil",
      "dal", "del", "dil", "dor", "dur", "da", "de",
      "di", "do", "du", "dê", "dè", "dé", "dy",
      // Les mots (4 lignes de 5)
      "judo", "radis", "dune", "corde", "dos",
      "dupé", "David", "pommade", "dé", "salade",
      "jardiné", "galope", "Magali", "régale", "sirop",
      "figure", "forêt", "lune", "bulle", "légume",
      // Les mots outils (1 ligne de 5)
      "et", "devant", "au", "mais", "quelle",
      // Les phrases : Mardi, Lily a jardiné avec son papi. (7) / Magali se régale avec le sirop de prunes de Léo. (10) / Denis a dormi dans le lit de papa. (8)
      "Mardi", "Lily", "a", "jardiné", "avec", "son", "papi",
      "Magali", "se", "régale", "avec", "le", "sirop", "de", "prunes", "de", "Léo",
      "Denis", "a", "dormi", "dans", "le", "lit", "de", "papa",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 7, 10, 8],
  },
  /** Consonne G — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (8+6+6 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 82, 88, 94. */
  g: {
    items: [
      // Les syllabes (7 lignes de 7)
      "ga", "gou", "gu", "guê", "gue", "gu", "gag",
      "gu", "gué", "gui", "gac", "gal", "gui", "gou",
      "gour", "gur", "gor", "gap", "gul", "gop", "ra",
      "fo", "chal", "nê", "pap", "nar", "val", "vup",
      "bou", "bor", "cu", "che", "fal", "ve", "ché",
      "bu", "nè", "pil", "fal", "bou", "fou", "nor",
      "ca", "fy", "co", "var", "lou", "lè", "mil",
      // Les mots (4 lignes de 5)
      "Hugo", "galope", "loup-garou", "Magali", "régale",
      "figure", "gaz", "rugby", "gomme", "légume",
      "jolie", "joue", "Julie", "animé", "bûche",
      "bouche", "ananas", "vache", "fou", "Fanny",
      // Les mots outils (1 ligne de 5)
      "et", "même", "comme", "est", "quelle",
      // Les phrases : Le cheval d' Hugo galope dans la forêt. (8) / Johanna joue au rugby avec Milo. (6) / Magali se régale avec les légumes. (6)
      "Le", "cheval", "d'", "Hugo", "galope", "dans", "la", "forêt",
      "Johanna", "joue", "au", "rugby", "avec", "Milo",
      "Magali", "se", "régale", "avec", "les", "légumes",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 8, 6, 6],
  },
  /** Consonne C/K — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (5+7+6 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 79, 86, 92. */
  "c-k": {
    items: [
      // Les syllabes (7 lignes de 7)
      "ca", "cou", "cu", "co", "cé", "ci", "cy",
      "cu", "co", "ca", "cou", "cé", "ci", "co",
      "cal", "col", "cap", "lac", "pac", "poc", "puc",
      "ac", "ec", "ic", "oc", "uc", "ca", "co",
      "cou", "cu", "cal", "col", "cul", "cor", "cur",
      "lac", "pac", "poc", "ca", "cou", "cu", "co",
      "cé", "ci", "cal", "col", "cap", "lac", "rac",
      // Les mots (4 lignes de 5)
      "canapé", "lac", "cacao", "col", "arc",
      "parc", "Luc", "canari", "caniche", "cou",
      "niche", "capuche", "corde", "sac", "sec",
      "copain", "café", "camion", "clé", "coq",
      // Les mots outils (1 ligne de 5)
      "et", "au", "même", "son", "comme",
      // Les phrases : Zélie a fini le cacao. (5) / Zoé court avec Luc dans le parc. (7) / Sami a un caniche comme Milo. (6)
      "Zélie", "a", "fini", "le", "cacao",
      "Zoé", "court", "avec", "Luc", "dans", "le", "parc",
      "Sami", "a", "un", "caniche", "comme", "Milo",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 7, 6],
  },
  /** Son OU — Fluence lecture 1 et 2 primaire : 49 syllabes (7×7), 20 mots (4×5), 5 mots outils, 3 phrases (6+6+9 mots). Chiffres : 7, 14, 21, 28, 35, 42, 49, 54, 59, 64, 69, 74, 80, 86, 95. */
  ou: {
    items: [
      // Les syllabes (7 lignes de 7)
      "vou", "fou", "pou", "rou", "nou", "sou", "lou",
      "mou", "chou", "pou", "fou", "sou", "rou", "lou",
      "tou", "vou", "bou", "dou", "jou", "gou", "zou",
      "rou", "nou", "mou", "chou", "pou", "fou", "sou",
      "out", "oux", "lou", "cou", "pou", "rou", "sou",
      "nou", "mou", "tou", "fou", "vou", "bou", "pou",
      "fou", "sou", "rou", "chou", "lou", "mou", "nou",
      // Les mots (4 lignes de 5)
      "souris", "ours", "fourche", "mouche", "pou",
      "four", "l'amour", "pour", "sourd", "fourmi",
      "évanoui", "lourd", "chevelure", "cou", "tout",
      "jour", "goût", "sous", "roux", "bout",
      // Les mots outils (1 ligne de 5)
      "ou", "où", "et", "avec", "dans",
      // Les phrases : La souris parle avec la mouche. (6) / et la fourmi Il est dans. (6) / Le chat roux chasse les souris et les rats. (9)
      "La", "souris", "parle", "avec", "la", "mouche",
      "et", "la", "fourmi", "Il", "est", "dans",
      "Le", "chat", "roux", "chasse", "les", "souris", "et", "les", "rats",
    ],
    lineLengths: [7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 6, 6, 9],
  },
  /** Son ON — Fluence Lecture 20 (texte suivi) : 72 mots, virgules et points conservés, chiffres 10, 21, 26, 36, 45, 46, 57, 67, 72. */
  on: {
    items: [
      // Ligne 1 (10)
      "Le", "chaton", "de", "Manon", "et", "Gaston", "a", "dévoré", "la", "crème",
      // Ligne 2 (11)
      "de", "marron", "de", "l'oncle", "Simon.", "Il", "y", "en", "avait", "dans", "toute",
      // Ligne 3 (5)
      "la", "maison", "!", "Quel", "cochon !",
      // Ligne 4 (10)
      "«", "Petit", "monstre,", "si", "je", "t'attrape,", "je", "te", "fais", "prendre",
      // Ligne 5 (9)
      "un", "bain", "!", "Tu", "n'es", "qu'un", "gros", "glouton", "gourmand",
      // Ligne 6 (1)
      "! ».",
      // Ligne 7 (11)
      "Alors,", "d'un", "bond,", "le", "chaton", "s'est", "glissé", "contre", "la", "joue", "du",
      // Ligne 8 (10)
      "tonton.", "Il", "a", "ronronné", "et", "l'oncle", "de", "Manon", "a", "accordé",
      // Ligne 9 (5)
      "son", "pardon", "!", ".", "»",
    ],
    lineLengths: [10, 11, 5, 10, 9, 1, 11, 10, 5],
  },
  /** Son OI — Fluence Lecture 29 (texte suivi) : 71 mots, virgules et points conservés, chiffres 9, 14, 23, 33, 42, 49, 57, 62, 71. */
  oi: {
    items: [
      // Ligne 1 (9)
      "En", "début", "de", "soirée,", "papa", "commença", "à", "lire", "une",
      // Ligne 2 (5)
      "histoire", "à", "Benoit", "et", "Héloïse.",
      // Ligne 3 (9)
      "«", "Il", "était", "une", "fois", "un", "petit", "roi", "prénommé",
      // Ligne 4 (10)
      "Benoît.", "Il", "vivait", "dans", "un", "bois", "avec", "sa", "sœur", "Héloïse",
      // Ligne 5 (9)
      "qui", "savait", "parler", "aux", "oiseaux", "!", "Ce", "petit", "roi,",
      // Ligne 6 (7)
      "quant", "à", "lui,", "mangeait", "toujours", "des", "petits",
      // Ligne 7 (8)
      "pois", "et", "buvait", "tous", "les", "jours", "du", "jus",
      // Ligne 8 (5)
      "de", "poire...", "-", "Comme", "moi",
      // Ligne 9 (9)
      "!", "dit", "Héloïse", "amusée.", "-", "Tais-toi,", "dit", "Benoît.", "Ecoute",
      // Ligne 10 (4) — fin du texte
      "l'histoire", "de", "papa.", "»",
    ],
    lineLengths: [9, 5, 9, 10, 9, 7, 8, 5, 9, 4],
  },
  /** Son AN (Lecture 23, en/em/an/am) — Fluence texte suivi : 77 mots, virgules et points conservés, chiffres 7, 13, 20, 27, 38, 43, 51, 58, 68, 75, 77. */
  an: {
    items: [
      // Ligne 1 (7)
      "Pendant", "qu'un", "enfant", "jouait", "avec", "son", "petit",
      // Ligne 2 (6)
      "éléphant,", "Quentin", "s'amusait", "en", "se", "balançant",
      // Ligne 3 (7)
      "sur", "sa", "chaise.", "En", "attendant", "que", "maman",
      // Ligne 4 (7)
      "revienne", "dans", "la", "salle", "d'attente,", "il", "s'occupait.",
      // Ligne 5 (11)
      "Il", "s'ennuyait", "un", "peu", "!", "Il", "ne", "pensait", "pas", "que", "le",
      // Ligne 6 (5)
      "rendez-vous", "durerait", "aussi", "longtemps.", "Il",
      // Ligne 7 (8)
      "aurait", "dû", "emporter", "le", "grand", "livre", "offert", "par",
      // Ligne 8 (7)
      "sa", "tante", "avant-hier", "pour", "son", "anniversaire", "!",
      // Ligne 9 (10)
      "En", "plus,", "il", "commençait", "à", "avoir", "faim", "et", "sa",
      // Ligne 10 (7)
      "mère", "n'avait", "mis", "qu'une", "orange", "dans", "son",
      // Ligne 11 (2)
      "sac", "!",
    ],
    lineLengths: [7, 6, 7, 7, 11, 5, 8, 7, 10, 7, 2],
  },
};

/** Liste d'items à lire : 49 sons + 31 mots + 10 mots liens (consonnes/digrammes) ou 70 lettres + 10 mots liens (voyelles). Retourne aussi perLine ou lineLengths si liste personnalisée. */
export function getChronoFluenceItems(son: Son): { items: string[]; perLine?: number; lineLengths?: number[] } {
  const custom = FLUENCE_CUSTOM[son.id];
  if (custom) return { items: custom.items, perLine: custom.perLine, lineLengths: custom.lineLengths };

  const seed = son.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;

  // Digrammes (ou, oi, on, an, in) : 49 syllabes + 31 mots + 10 mots liens
  if (FLUENCE_SYLLABES_DIGRAPHES[son.id]) {
    const syllDig = FLUENCE_SYLLABES_DIGRAPHES[son.id];
    const sonsPart: string[] = [];
    for (let i = 0; i < FLUENCE_NB_SONS; i++) {
      sonsPart.push(syllDig[Math.floor(s(i) * syllDig.length)] ?? syllDig[0]);
    }
    const mots = getMotsFluencePourSon(son, FLUENCE_NB_MOTS, seed + 1000);
    const motsLiens = getMotsLiens(son);
    return { items: [...sonsPart, ...mots, ...motsLiens] };
  }

  // Son « et » : fluence en syllabes "et" + mots (comme consonnes)
  if (son.id === "et") {
    const syllabes = getSyllabes(son);
    if (syllabes.length === 0) return { items: [] };
    const sonsPart: string[] = [];
    for (let i = 0; i < FLUENCE_NB_SONS; i++) {
      sonsPart.push(syllabes[Math.floor(s(i) * syllabes.length)] ?? syllabes[0]);
    }
    const mots = getMotsFluencePourSon(son, FLUENCE_NB_MOTS, seed + 1000);
    const motsLiens = getMotsLiens(son);
    return { items: [...sonsPart, ...mots, ...motsLiens] };
  }

  // Voyelles (i, a, o, e, u, é) : 70 lettres + 10 mots liens
  if (!isConsonne(son)) {
    const g = son.grapheme.split(",")[0].trim().toLowerCase();
    const voyelles: string[] = ["a", "e", "i", "o", "u"];
    if (son.id === "e-accent") voyelles.push("é", "è", "ê");
    const pool: string[] = [];
    for (let i = 0; i < 70; i++) {
      if (s(i) < 0.6) pool.push(g.length === 1 ? g : g.slice(0, 1));
      else pool.push(voyelles[Math.floor(s(i + 100) * voyelles.length)] ?? "a");
    }
    return { items: [...pool, ...getMotsLiens(son)] };
  }

  // Consonnes (m à c-k) : 49 syllabes + 31 mots + 10 mots liens
  const syllabes = getSyllabes(son);
  if (syllabes.length === 0) return { items: [] };

  const sonsPart: string[] = [];
  for (let i = 0; i < FLUENCE_NB_SONS; i++) {
    sonsPart.push(syllabes[Math.floor(s(i) * syllabes.length)] ?? syllabes[0]);
  }
  const mots = getMotsFluencePourSon(son, FLUENCE_NB_MOTS, seed + 1000);
  const motsLiens = getMotsLiens(son);
  return { items: [...sonsPart, ...mots, ...motsLiens] };
}

// ——— Exo : Écris le ou la devant le nom (à partir du son P, évals 1, 2, 3) ———
export type ItemArticleLeLa = { mot: string; article: "le" | "la" };
/** Pour Phono : le/la ou un/une (4 mots le/la + 2 mots un/une, tous commençant par la lettre). */
export type ItemArticlePhono = { mot: string; article: "le" | "la" | "un" | "une" };

const ARTICLE_LE_LA: Record<string, ItemArticleLeLa[]> = {
  p: [
    { mot: "perroquet", article: "le" },
    { mot: "pomme", article: "la" },
    { mot: "palme", article: "la" },
    { mot: "porte", article: "la" },
    { mot: "piano", article: "le" },
    { mot: "pluie", article: "la" },
    { mot: "père", article: "le" },
    { mot: "parasol", article: "le" },
    { mot: "papillon", article: "le" },
    { mot: "pizza", article: "la" },
    { mot: "pastèque", article: "la" },
    { mot: "parapluie", article: "le" },
    { mot: "pédale", article: "la" },
    { mot: "loupe", article: "la" },
    { mot: "premier", article: "le" },
  ],
  t: [
    { mot: "tomate", article: "la" },
    { mot: "tapis", article: "le" },
    { mot: "table", article: "la" },
    { mot: "télé", article: "la" },
    { mot: "tipi", article: "le" },
    { mot: "tulipe", article: "la" },
    { mot: "téléphone", article: "le" },
    { mot: "moto", article: "la" },
    { mot: "ordinateur", article: "le" },
    { mot: "locomotive", article: "la" },
  ],
  f: [
    { mot: "fusée", article: "la" },
    { mot: "filet", article: "le" },
    { mot: "café", article: "le" },
    { mot: "fée", article: "la" },
    { mot: "facteur", article: "le" },
    { mot: "girafe", article: "la" },
    { mot: "gaufre", article: "la" },
    { mot: "feuille", article: "la" },
    { mot: "forêt", article: "la" },
    { mot: "flûte", article: "la" },
  ],
  v: [
    { mot: "vélo", article: "le" },
    { mot: "vache", article: "la" },
    { mot: "vent", article: "le" },
    { mot: "ville", article: "la" },
    { mot: "vaisselle", article: "la" },
    { mot: "violon", article: "le" },
    { mot: "caravane", article: "la" },
    { mot: "locomotive", article: "la" },
  ],
  ch: [
    { mot: "chat", article: "le" },
    { mot: "chapeau", article: "le" },
    { mot: "chocolat", article: "le" },
    { mot: "cheval", article: "le" },
    { mot: "chèvre", article: "la" },
    { mot: "chameau", article: "le" },
    { mot: "parachute", article: "le" },
    { mot: "douche", article: "la" },
  ],
  j: [
    { mot: "jupe", article: "la" },
    { mot: "jardin", article: "le" },
    { mot: "jambon", article: "le" },
    { mot: "pyjama", article: "le" },
    { mot: "jongleur", article: "le" },
    { mot: "jeudi", article: "le" },
  ],
  b: [
    { mot: "ballon", article: "le" },
    { mot: "brosse", article: "la" },
    { mot: "balai", article: "le" },
    { mot: "balle", article: "la" },
    { mot: "bateau", article: "le" },
    { mot: "bague", article: "la" },
    { mot: "bonhomme", article: "le" },
    { mot: "bonbon", article: "le" },
    { mot: "banane", article: "la" },
    { mot: "cabane", article: "la" },
  ],
  d: [
    { mot: "drapeau", article: "le" },
    { mot: "cadeau", article: "le" },
    { mot: "dentifrice", article: "le" },
    { mot: "douche", article: "la" },
    { mot: "début", article: "le" },
  ],
  g: [
    { mot: "gâteau", article: "le" },
    { mot: "gaufre", article: "la" },
    { mot: "licorne", article: "la" },
    { mot: "glace", article: "la" },
    { mot: "grenouille", article: "la" },
    { mot: "escargot", article: "le" },
    { mot: "gare", article: "la" },
  ],
  z: [
    { mot: "zéro", article: "le" },
    { mot: "zoo", article: "le" },
    { mot: "zèbre", article: "le" },
  ],
  "c-k": [
    { mot: "café", article: "le" },
    { mot: "canard", article: "le" },
    { mot: "camion", article: "le" },
    { mot: "clé", article: "la" },
    { mot: "coq", article: "le" },
  ],
  ou: [
    { mot: "loup", article: "le" },
    { mot: "poulet", article: "le" },
    { mot: "four", article: "le" },
    { mot: "cou", article: "le" },
  ],
  oi: [
    { mot: "poisson", article: "le" },
    { mot: "roi", article: "le" },
    { mot: "voiture", article: "la" },
  ],
  on: [
    { mot: "pont", article: "le" },
    { mot: "maison", article: "la" },
    { mot: "ballon", article: "le" },
    { mot: "citron", article: "le" },
    { mot: "savon", article: "le" },
  ],
  an: [
    { mot: "pantalon", article: "le" },
    { mot: "maman", article: "la" },
  ],
  in: [
    { mot: "lapin", article: "le" },
    { mot: "matin", article: "le" },
    { mot: "sapin", article: "le" },
    { mot: "jardin", article: "le" },
  ],
};

const ORDRE_SON_P = 10;

function getArticleLeLaItems(son: Son, count: number, seed: number, evalOffset: number): ItemArticleLeLa[] {
  const pool = ARTICLE_LE_LA[son.id] ?? [];
  if (pool.length === 0) return [];
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  const off = Math.min(evalOffset * 2, Math.max(0, out.length - count));
  return out.slice(off, off + count);
}

/** Un/une pour l'exercice Phono (mots commençant par la lettre). 2 par son. */
const ARTICLE_UN_UNE: Record<string, ItemArticlePhono[]> = {
  p: [{ mot: "pomme", article: "une" }, { mot: "papa", article: "un" }, { mot: "parapluie", article: "un" }, { mot: "pastèque", article: "une" }],
  t: [{ mot: "tomate", article: "une" }, { mot: "tapis", article: "un" }, { mot: "table", article: "une" }, { mot: "télé", article: "la" }],
  f: [{ mot: "fusée", article: "une" }, { mot: "feuille", article: "une" }],
  v: [{ mot: "vélo", article: "un" }, { mot: "voiture", article: "une" }],
  ch: [{ mot: "chat", article: "un" }, { mot: "chèvre", article: "une" }],
  j: [{ mot: "jupe", article: "une" }, { mot: "jardin", article: "un" }],
  b: [{ mot: "ballon", article: "un" }, { mot: "banane", article: "une" }],
  d: [{ mot: "drapeau", article: "un" }, { mot: "douche", article: "une" }],
  g: [{ mot: "gâteau", article: "un" }, { mot: "grenouille", article: "une" }],
  z: [{ mot: "zèbre", article: "un" }, { mot: "zoo", article: "un" }],
  "c-k": [{ mot: "canard", article: "un" }, { mot: "clé", article: "une" }],
  ou: [{ mot: "poulet", article: "un" }, { mot: "cou", article: "un" }],
  oi: [{ mot: "poisson", article: "un" }, { mot: "oiseau", article: "un" }],
  on: [{ mot: "pont", article: "un" }, { mot: "savon", article: "un" }],
  an: [{ mot: "ananas", article: "un" }, { mot: "animal", article: "un" }],
  in: [{ mot: "indien", article: "un" }, { mot: "invité", article: "un" }],
};

// ——— Exercice 7 : Phrase possible ou impossible (à partir du son V) ———
export type ItemPhraseVraiFaux = { phrase: string; vrai: boolean };

const PHRASES_VRAI_FAUX: Record<string, ItemPhraseVraiFaux[]> = {
  v: [
    { phrase: "Valérie lit le livre.", vrai: true },
    { phrase: "Vincent avale l'olive.", vrai: true },
    { phrase: "La vipère vole dans les nuages.", vrai: false },
    { phrase: "La vache a réparé la ville.", vrai: false },
    { phrase: "Victor lave vite le vélo.", vrai: true },
  ],
  ch: [
    { phrase: "Le chat mange dans sa gamelle.", vrai: true },
    { phrase: "Le cheval porte un chapeau.", vrai: true },
    { phrase: "La chèvre vole dans le ciel.", vrai: false },
    { phrase: "Le chocolat répare la cheminée.", vrai: false },
    { phrase: "Chantal cherche des choux.", vrai: true },
  ],
  j: [
    { phrase: "Julie range le jouet.", vrai: true },
    { phrase: "Le jardin a des fleurs.", vrai: true },
    { phrase: "Le jambon conduit la voiture.", vrai: false },
    { phrase: "La jupe lit un journal.", vrai: false },
    { phrase: "Juliette joue du piano.", vrai: true },
  ],
  b: [
    { phrase: "Bruno lance le ballon.", vrai: true },
    { phrase: "La banane est sur la table.", vrai: true },
    { phrase: "Le bateau court dans la forêt.", vrai: false },
    { phrase: "La brosse chante une chanson.", vrai: false },
    { phrase: "Béatrice a une belle robe.", vrai: true },
  ],
  d: [
    { phrase: "David donne du pain.", vrai: true },
    { phrase: "Le drapeau flotte au vent.", vrai: true },
    { phrase: "La dent lit un livre.", vrai: false },
    { phrase: "Le dé démarre la voiture.", vrai: false },
    { phrase: "Denis range sa chambre.", vrai: true },
  ],
  g: [
    { phrase: "Gaston aime le gâteau.", vrai: true },
    { phrase: "La grenouille saute.", vrai: true },
    { phrase: "La gomme nage dans la mer.", vrai: false },
    { phrase: "Le garage mange une glace.", vrai: false },
    { phrase: "Gisèle prend le train.", vrai: true },
  ],
  z: [
    { phrase: "Zara voit le zèbre.", vrai: true },
    { phrase: "Le zéro est un chiffre.", vrai: true },
    { phrase: "Le zoo conduit un bus.", vrai: false },
    { phrase: "La zone lit le journal.", vrai: false },
    { phrase: "Zoé range ses affaires.", vrai: true },
  ],
  "c-k": [
    { phrase: "Kevin a un camion.", vrai: true },
    { phrase: "Le canard nage.", vrai: true },
    { phrase: "La clé mange des croissants.", vrai: false },
    { phrase: "Le coq répare le toit.", vrai: false },
    { phrase: "Carole lit un livre.", vrai: true },
  ],
  ou: [
    { phrase: "Le loup court dans la forêt.", vrai: true },
    { phrase: "Le poulet est dans le four.", vrai: true },
    { phrase: "Le four conduit une voiture.", vrai: false },
    { phrase: "La souris vole dans le ciel.", vrai: false },
    { phrase: "Mamie coud un bouton.", vrai: true },
  ],
  oi: [
    { phrase: "Le roi porte une couronne.", vrai: true },
    { phrase: "Le poisson nage.", vrai: true },
    { phrase: "La voiture vole dans l'océan.", vrai: false },
    { phrase: "La loi mange une pomme.", vrai: false },
    { phrase: "Loïc boit de l'eau.", vrai: true },
  ],
  on: [
    { phrase: "Le pont traverse la rivière.", vrai: true },
    { phrase: "Le ballon roule.", vrai: true },
    { phrase: "Le savon lit un livre.", vrai: false },
    { phrase: "Le pantalon nage.", vrai: false },
    { phrase: "Monique range la maison.", vrai: true },
  ],
  an: [
    { phrase: "L'éléphant mange des bananes.", vrai: true },
    { phrase: "La maman lit une histoire.", vrai: true },
    { phrase: "Le pantalon conduit un train.", vrai: false },
    { phrase: "L'animal répare la voiture.", vrai: false },
    { phrase: "Anne a un ananas.", vrai: true },
  ],
  in: [
    { phrase: "Le lapin mange une carotte.", vrai: true },
    { phrase: "Le matin le soleil se lève.", vrai: true },
    { phrase: "Le sapin nage dans la piscine.", vrai: false },
    { phrase: "Le jardin conduit un avion.", vrai: false },
    { phrase: "Sabine range son bureau.", vrai: true },
  ],
  et: [
    { phrase: "Michel achète un ticket.", vrai: true },
    { phrase: "Le navet est dans le potager.", vrai: true },
    { phrase: "Le carnet vole dans les nuages.", vrai: false },
    { phrase: "Le ballet répare la voiture.", vrai: false },
    { phrase: "Emma a un carnet.", vrai: true },
  ],
};

const ORDRE_SON_V_PHRASES = 13;

/** Retourne les 5 phrases possible/impossible pour l'exercice 7 (à partir du son v). */
export function getPhrasesVraiFaux(son: Son): ItemPhraseVraiFaux[] {
  if (son.ordre < ORDRE_SON_V_PHRASES) return [];
  return PHRASES_VRAI_FAUX[son.id] ?? [];
}

// ——— Exercice « Écrire la syllabe » (à partir du son v, 8e exercice) ———
// 5 mots par son : affichage prefix + "__" + suffix, l'enfant écrit la syllabe manquante (celle du son travaillé).
export type ItemEcrireSyllabe = { mot: string; syllabe: string; prefix: string; suffix: string; emoji?: string };

const ECRIRE_SYLLABE_ITEMS: Record<string, ItemEcrireSyllabe[]> = {
  v: [
    { mot: "vache", syllabe: "va", prefix: "", suffix: "che", emoji: "🐄" },
    { mot: "vélo", syllabe: "vé", prefix: "", suffix: "lo", emoji: "🚲" },
    { mot: "vipère", syllabe: "vi", prefix: "", suffix: "père", emoji: "🐍" },
    { mot: "locomotive", syllabe: "ve", prefix: "locomoti", suffix: "", emoji: "🚂" },
    { mot: "voler", syllabe: "vo", prefix: "", suffix: "ler", emoji: "✈️" },
  ],
  ch: [
    { mot: "chapeau", syllabe: "cha", prefix: "", suffix: "peau", emoji: "🎩" },
    { mot: "chocolat", syllabe: "cho", prefix: "", suffix: "colat", emoji: "🍫" },
    { mot: "cheval", syllabe: "che", prefix: "", suffix: "val", emoji: "🐴" },
    { mot: "vache", syllabe: "che", prefix: "va", suffix: "", emoji: "🐄" },
    { mot: "cloche", syllabe: "clo", prefix: "", suffix: "che", emoji: "🔔" },
  ],
  j: [
    { mot: "jupe", syllabe: "ju", prefix: "", suffix: "pe", emoji: "👗" },
    { mot: "jardin", syllabe: "jar", prefix: "", suffix: "din", emoji: "🌳" },
    { mot: "judoka", syllabe: "ju", prefix: "", suffix: "doka", emoji: "🥋" },
    { mot: "jetons", syllabe: "je", prefix: "", suffix: "tons", emoji: "🪙" },
    { mot: "jument", syllabe: "ju", prefix: "", suffix: "ment", emoji: "🐴" },
  ],
  b: [
    { mot: "ballon", syllabe: "ba", prefix: "", suffix: "llon", emoji: "⚽" },
    { mot: "balle", syllabe: "ba", prefix: "", suffix: "lle", emoji: "🎾" },
    { mot: "bateau", syllabe: "ba", prefix: "", suffix: "teau", emoji: "⛵" },
    { mot: "bébé", syllabe: "bé", prefix: "", suffix: "bé", emoji: "👶" },
    { mot: "robe", syllabe: "be", prefix: "ro", suffix: "", emoji: "👗" },
  ],
  d: [
    { mot: "drapeau", syllabe: "dra", prefix: "", suffix: "peau", emoji: "🚩" },
    { mot: "dimanche", syllabe: "di", prefix: "", suffix: "manche", emoji: "📅" },
    { mot: "domino", syllabe: "do", prefix: "", suffix: "mino", emoji: "🎲" },
    { mot: "salade", syllabe: "de", prefix: "sala", suffix: "", emoji: "🥗" },
    { mot: "divan", syllabe: "di", prefix: "", suffix: "van", emoji: "🛋️" },
  ],
  g: [
    { mot: "gâteau", syllabe: "gâ", prefix: "", suffix: "teau", emoji: "🎂" },
    { mot: "gomme", syllabe: "go", prefix: "", suffix: "mme", emoji: "🧽" },
    { mot: "kangourou", syllabe: "gou", prefix: "kan", suffix: "rou", emoji: "🦘" },
    { mot: "légume", syllabe: "gu", prefix: "lé", suffix: "me", emoji: "🥒" },
    { mot: "gare", syllabe: "ga", prefix: "", suffix: "re", emoji: "🚉" },
  ],
  z: [
    { mot: "zéro", syllabe: "zé", prefix: "", suffix: "ro", emoji: "0️⃣" },
    { mot: "zoo", syllabe: "zo", prefix: "", suffix: "o", emoji: "🦁" },
    { mot: "zèbre", syllabe: "zè", prefix: "", suffix: "bre", emoji: "🦓" },
    { mot: "valise", syllabe: "se", prefix: "vali", suffix: "", emoji: "🧳" },
    { mot: "rose", syllabe: "se", prefix: "ro", suffix: "", emoji: "🌹" },
  ],
  "c-k": [
    { mot: "café", syllabe: "ca", prefix: "", suffix: "fé", emoji: "☕" },
    { mot: "canard", syllabe: "ca", prefix: "", suffix: "nard", emoji: "🦆" },
    { mot: "camion", syllabe: "ca", prefix: "", suffix: "mion", emoji: "🚚" },
    { mot: "sac", syllabe: "c", prefix: "sa", suffix: "", emoji: "👜" },
    { mot: "coq", syllabe: "co", prefix: "", suffix: "q", emoji: "🐓" },
  ],
  ou: [
    { mot: "poulet", syllabe: "pou", prefix: "", suffix: "let", emoji: "🐔" },
    { mot: "loup", syllabe: "lou", prefix: "", suffix: "p", emoji: "🐺" },
    { mot: "cou", syllabe: "cou", prefix: "", suffix: "", emoji: "🦒" },
    { mot: "four", syllabe: "fou", prefix: "", suffix: "r", emoji: "🔥" },
    { mot: "souris", syllabe: "sou", prefix: "", suffix: "ris", emoji: "🐭" },
  ],
  oi: [
    { mot: "poisson", syllabe: "poi", prefix: "", suffix: "sson", emoji: "🐟" },
    { mot: "roi", syllabe: "roi", prefix: "", suffix: "", emoji: "👑" },
    { mot: "oiseau", syllabe: "oi", prefix: "", suffix: "seau", emoji: "🐦" },
    { mot: "moi", syllabe: "moi", prefix: "", suffix: "", emoji: "👤" },
    { mot: "foi", syllabe: "foi", prefix: "", suffix: "", emoji: "✋" },
  ],
  on: [
    { mot: "maison", syllabe: "son", prefix: "mai", suffix: "", emoji: "🏠" },
    { mot: "savon", syllabe: "von", prefix: "sa", suffix: "", emoji: "🧼" },
    { mot: "ballon", syllabe: "llon", prefix: "ba", suffix: "", emoji: "⚽" },
    { mot: "pont", syllabe: "pon", prefix: "", suffix: "t", emoji: "🌉" },
    { mot: "citron", syllabe: "ron", prefix: "cit", suffix: "", emoji: "🍋" },
  ],
  an: [
    { mot: "maman", syllabe: "man", prefix: "ma", suffix: "", emoji: "👩" },
    { mot: "pantalon", syllabe: "pan", prefix: "", suffix: "talon", emoji: "👖" },
    { mot: "enfant", syllabe: "an", prefix: "en", suffix: "fant", emoji: "👧" },
    { mot: "orange", syllabe: "an", prefix: "or", suffix: "ge", emoji: "🍊" },
    { mot: "vent", syllabe: "en", prefix: "v", suffix: "t", emoji: "💨" },
  ],
  in: [
    { mot: "lapin", syllabe: "pin", prefix: "la", suffix: "", emoji: "🐰" },
    { mot: "matin", syllabe: "tin", prefix: "ma", suffix: "", emoji: "🌅" },
    { mot: "pain", syllabe: "in", prefix: "pa", suffix: "", emoji: "🥖" },
    { mot: "main", syllabe: "main", prefix: "", suffix: "", emoji: "✋" },
    { mot: "train", syllabe: "train", prefix: "", suffix: "", emoji: "🚂" },
  ],
  et: [
    { mot: "poulet", syllabe: "let", prefix: "pou", suffix: "", emoji: "🐔" },
    { mot: "billet", syllabe: "illet", prefix: "b", suffix: "", emoji: "🎫" },
    { mot: "navet", syllabe: "vet", prefix: "na", suffix: "", emoji: "🥬" },
    { mot: "secret", syllabe: "cret", prefix: "se", suffix: "", emoji: "🤫" },
    { mot: "et", syllabe: "et", prefix: "", suffix: "", emoji: "&" },
  ],
};

const ORDRE_SON_V_ECRIRE_SYLLABE = 13;

/** Retourne les 5 items pour l'exercice « Écrire la syllabe » (à partir du son v). */
export function getEcrireSyllabeItems(son: Son): ItemEcrireSyllabe[] {
  if (son.ordre < ORDRE_SON_V_ECRIRE_SYLLABE) return [];
  const items = ECRIRE_SYLLABE_ITEMS[son.id] ?? [];
  return items.slice(0, 5);
}

/** Pour Phono 1/2, Phono Image, Sons images : 6 mots (4 le/la + 2 un/une) commençant par la lettre. */
export function getArticlePhonoItems(son: Son, seed: number): ItemArticlePhono[] {
  if (son.ordre < ORDRE_SON_P) return [];
  const leLa = (ARTICLE_LE_LA[son.id] ?? []).filter((x) => motCommenceParSon(x.mot, son));
  const unUne = (ARTICLE_UN_UNE[son.id] ?? []).filter((x) => motCommenceParSon(x.mot, son) && (x.article === "un" || x.article === "une"));
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shufLeLa = [...leLa];
  for (let i = shufLeLa.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shufLeLa[i], shufLeLa[j]] = [shufLeLa[j], shufLeLa[i]];
  }
  const shufUnUne = [...unUne];
  for (let i = shufUnUne.length - 1; i > 0; i--) {
    const j = Math.floor(s(i + 100) * (i + 1));
    [shufUnUne[i], shufUnUne[j]] = [shufUnUne[j], shufUnUne[i]];
  }
  const four = shufLeLa.slice(0, 4).map((x) => ({ mot: x.mot, article: x.article as "le" | "la" }));
  const two = shufUnUne.slice(0, 2).map((x) => ({ mot: x.mot, article: x.article as "un" | "une" }));
  return [...four, ...two];
}

// ——— Export des séries par évaluation ———
export type TypeExoEval = "entoure-son" | "repere-son" | "entoure-syllabe" | "ecris-syllabe" | "entoure-lettre" | "entoure-lettre-dans-mot" | "relie-ecritures" | "article-le-la" | "image-deux-mots";

export type ItemImageDeuxMots = { emoji: string; image?: string; motCorrect: string; motDistracteur: string };

export type SerieExoEval = {
  type: TypeExoEval;
  items: unknown[];
  pointsMax: number;
};

/** Exercice « Choisis le mot qui correspond à l'image » — uniquement pour la lettre M. Mots déjà fournis, deux mots bien différents par item. */
const ITEMS_IMAGE_DEUX_MOTS_M: ItemImageDeuxMots[] = [
  { emoji: "🍈", motCorrect: "melon", motDistracteur: "malade" },
  { emoji: "🍎", motCorrect: "pomme", motDistracteur: "ballon" },
  { emoji: "🎵", motCorrect: "musique", motDistracteur: "livre" },
  { emoji: "🏍️", motCorrect: "moto", motDistracteur: "vélo" },
  { emoji: "🌼", motCorrect: "marguerite", motDistracteur: "maison" },
  { emoji: "🎭", motCorrect: "masque", motDistracteur: "ville" },
  { emoji: "🪶", motCorrect: "plume", motDistracteur: "chocolat" },
  { emoji: "⏱️", motCorrect: "minute", motDistracteur: "lapin" },
];

function getImageDeuxMotsItemsPourM(seed: number, evalOffset: number): ItemImageDeuxMots[] {
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...ITEMS_IMAGE_DEUX_MOTS_M];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const count = 6;
  const start = Math.min(evalOffset * 2, Math.max(0, shuffled.length - count));
  return shuffled.slice(start, start + count);
}

/** Exercice « Choisis le mot qui correspond à l'image » — 5 items par lettre, à partir de la lettre r. */
const ORDRE_SON_R = 7;
const ITEMS_IMAGE_DEUX_MOTS_APRES_R: Record<string, ItemImageDeuxMots[]> = {
  r: [
    { emoji: "🥕", motCorrect: "radis", motDistracteur: "ride" },
    { emoji: "🌳", motCorrect: "arbre", motDistracteur: "rime" },
    { emoji: "🪟", motCorrect: "rideau", motDistracteur: "radeau" },
    { emoji: "🦆", motCorrect: "canard", motDistracteur: "tirer" },
    { emoji: "🔨", motCorrect: "marteau", motDistracteur: "radeau" },
  ],
  s: [
    { emoji: "🥗", motCorrect: "salade", motDistracteur: "sol" },
    { emoji: "☀️", motCorrect: "soleil", motDistracteur: "sel" },
    { emoji: "🐍", motCorrect: "serpent", motDistracteur: "sport" },
    { emoji: "👜", motCorrect: "sac", motDistracteur: "sec" },
    { emoji: "🐭", motCorrect: "souris", motDistracteur: "sous" },
  ],
  n: [
    { emoji: "☁️", motCorrect: "nuage", motDistracteur: "nage" },
    { emoji: "🥬", motCorrect: "navet", motDistracteur: "novembre" },
    { emoji: "🪺", motCorrect: "nid", motDistracteur: "nuit" },
    { emoji: "🥜", motCorrect: "noix", motDistracteur: "noël" },
    { emoji: "🌙", motCorrect: "nuit", motDistracteur: "nid" },
  ],
  p: [
    { emoji: "🍎", motCorrect: "pomme", motDistracteur: "papa" },
    { emoji: "🍞", motCorrect: "pain", motDistracteur: "pompe" },
    { emoji: "🦋", motCorrect: "papillon", motDistracteur: "pomme" },
    { emoji: "🎹", motCorrect: "piano", motDistracteur: "pied" },
    { emoji: "🐟", motCorrect: "poisson", motDistracteur: "porte" },
  ],
  t: [
    { emoji: "🍅", motCorrect: "tomate", motDistracteur: "tapis" },
    { emoji: "🚂", motCorrect: "train", motDistracteur: "tire" },
    { emoji: "🐢", motCorrect: "tortue", motDistracteur: "tarte" },
    { emoji: "📺", motCorrect: "télé", motDistracteur: "thé" },
    { emoji: "🪔", motCorrect: "tapis", motDistracteur: "tomate" },
  ],
  f: [
    { emoji: "🔥", motCorrect: "feu", motDistracteur: "fou" },
    { emoji: "🌸", motCorrect: "fleur", motDistracteur: "fil" },
    { emoji: "🧀", motCorrect: "fromage", motDistracteur: "frère" },
    { emoji: "🚀", motCorrect: "fusée", motDistracteur: "fête" },
    { emoji: "🍃", motCorrect: "feuille", motDistracteur: "fusée" },
  ],
  v: [
    { emoji: "🚲", motCorrect: "vélo", motDistracteur: "ville" },
    { emoji: "🐄", motCorrect: "vache", motDistracteur: "vue" },
    { emoji: "🚗", motCorrect: "voiture", motDistracteur: "vent" },
    { emoji: "💨", motCorrect: "vent", motDistracteur: "vélo" },
    { emoji: "🎻", motCorrect: "violon", motDistracteur: "vache" },
  ],
  ch: [
    { emoji: "🐱", motCorrect: "chat", motDistracteur: "chou" },
    { emoji: "🎩", motCorrect: "chapeau", motDistracteur: "chien" },
    { emoji: "🍫", motCorrect: "chocolat", motDistracteur: "cheval" },
    { emoji: "🐴", motCorrect: "cheval", motDistracteur: "chat" },
    { emoji: "🐕", motCorrect: "chien", motDistracteur: "chapeau" },
  ],
  j: [
    { emoji: "👗", motCorrect: "jupe", motDistracteur: "jour" },
    { emoji: "🌳", motCorrect: "jardin", motDistracteur: "jupe" },
    { emoji: "📅", motCorrect: "jeudi", motDistracteur: "jambon" },
    { emoji: "🧃", motCorrect: "jus", motDistracteur: "jardin" },
    { emoji: "🤹", motCorrect: "jongleur", motDistracteur: "jupe" },
  ],
  b: [
    { emoji: "⚽", motCorrect: "ballon", motDistracteur: "bateau" },
    { emoji: "🍌", motCorrect: "banane", motDistracteur: "bébé" },
    { emoji: "🚢", motCorrect: "bateau", motDistracteur: "ballon" },
    { emoji: "👶", motCorrect: "bébé", motDistracteur: "banane" },
    { emoji: "🍬", motCorrect: "bonbon", motDistracteur: "bateau" },
  ],
  d: [
    { emoji: "🐬", motCorrect: "dauphin", motDistracteur: "dame" },
    { emoji: "🦷", motCorrect: "dent", motDistracteur: "dos" },
    { emoji: "🦕", motCorrect: "dinosaure", motDistracteur: "dent" },
    { emoji: "🎲", motCorrect: "dé", motDistracteur: "dur" },
    { emoji: "🚿", motCorrect: "douche", motDistracteur: "dame" },
  ],
  g: [
    { emoji: "🎂", motCorrect: "gâteau", motDistracteur: "gomme" },
    { emoji: "🧤", motCorrect: "gant", motDistracteur: "gare" },
    { emoji: "🧽", motCorrect: "gomme", motDistracteur: "gâteau" },
    { emoji: "🦍", motCorrect: "gorille", motDistracteur: "gant" },
    { emoji: "🚉", motCorrect: "gare", motDistracteur: "gomme" },
  ],
  "c-k": [
    { emoji: "🚗", motCorrect: "car", motDistracteur: "carte" },
    { emoji: "🦆", motCorrect: "canard", motDistracteur: "camion" },
    { emoji: "🚚", motCorrect: "camion", motDistracteur: "canard" },
    { emoji: "🔑", motCorrect: "clé", motDistracteur: "coq" },
    { emoji: "🐓", motCorrect: "coq", motDistracteur: "clé" },
  ],
  ou: [
    { emoji: "🐺", motCorrect: "loup", motDistracteur: "cou" },
    { emoji: "🦒", motCorrect: "cou", motDistracteur: "loup" },
    { emoji: "🔥", motCorrect: "four", motDistracteur: "fou" },
    { emoji: "🐔", motCorrect: "poule", motDistracteur: "pou" },
    { emoji: "🛞", motCorrect: "roue", motDistracteur: "roux" },
  ],
  oi: [
    { emoji: "🐟", motCorrect: "poisson", motDistracteur: "poix" },
    { emoji: "👑", motCorrect: "roi", motDistracteur: "roche" },
    { emoji: "🐦", motCorrect: "oiseau", motDistracteur: "soie" },
    { emoji: "💧", motCorrect: "soif", motDistracteur: "soi" },
    { emoji: "🪨", motCorrect: "poix", motDistracteur: "poisson" },
  ],
  on: [
    { emoji: "🌉", motCorrect: "pont", motDistracteur: "don" },
    { emoji: "🍬", motCorrect: "bonbon", motDistracteur: "pont" },
    { emoji: "🐑", motCorrect: "mouton", motDistracteur: "monde" },
    { emoji: "🏠", motCorrect: "maison", motDistracteur: "mont" },
    { emoji: "🍋", motCorrect: "citron", motDistracteur: "nom" },
  ],
  an: [
    { emoji: "👩", motCorrect: "maman", motDistracteur: "mantel" },
    { emoji: "👖", motCorrect: "pantalon", motDistracteur: "enfant" },
    { emoji: "🐘", motCorrect: "éléphant", motDistracteur: "an" },
    { emoji: "🌳", motCorrect: "jardin", motDistracteur: "orange" },
    { emoji: "🍊", motCorrect: "orange", motDistracteur: "jardin" },
  ],
  in: [
    { emoji: "🐰", motCorrect: "lapin", motDistracteur: "pain" },
    { emoji: "🍞", motCorrect: "pain", motDistracteur: "lapin" },
    { emoji: "✋", motCorrect: "main", motDistracteur: "mince" },
    { emoji: "🌲", motCorrect: "sapin", motDistracteur: "vin" },
    { emoji: "🚂", motCorrect: "train", motDistracteur: "brin" },
  ],
  et: [
    { emoji: "🔤", motCorrect: "alphabet", motDistracteur: "effet" },
    { emoji: "🎁", motCorrect: "objet", motDistracteur: "et" },
    { emoji: "🤫", motCorrect: "secret", motDistracteur: "navet" },
    { emoji: "🥬", motCorrect: "navet", motDistracteur: "secret" },
    { emoji: "🍗", motCorrect: "poulet", motDistracteur: "alphabet" },
  ],
};

function getImageDeuxMotsItemsPourSon(son: Son, seed: number, _evalOffset: number): ItemImageDeuxMots[] {
  const items = ITEMS_IMAGE_DEUX_MOTS_APRES_R[son.id];
  if (!items || items.length < 5) return [];
  const s = (x: number) => ((Math.sin(seed + x) * 10000) % 1 + 1) % 1;
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(s(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}

/** Pour l'évaluation 2 du son é/è/ê : ne garder que les mots contenant è ou ê (pas seulement é). */
function contientEouE(mot: string): boolean {
  return /[èê]/.test(mot);
}

export function getExercicesEval(
  son: Son,
  niveauNumero: number,
  evalNumero: number
): SerieExoEval[] {
  const base = (son.id + niveauNumero * 10).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  // Seed très différent par évaluation pour éviter les mêmes images entre eval 1, 2, 3
  const seed = base + evalNumero * 9997;

  const off = evalNumero - 1; // 0, 1, 2 pour evals 1, 2, 3
  const onlyEouE = son.id === "e-accent" && evalNumero === 2;
  let exo1Items = getImagesEntoureLeSon(
    son,
    4,
    4,
    seed,
    off,
    onlyEouE ? contientEouE : undefined
  );
  let exo2Items = getRepèrePourSon(son, 4, seed + 1, off);
  let exo3Items = getSyllabeExercices(son, 4, seed + 2, off);
  let exo4Items = getSyllabeManquanteExercices(son, 3, seed + 3, off);
  if (exo4Items.length < 2) {
    const fb = (SYLLABE_MANQUANTE_FALLBACK[son.id] ?? []).filter(
      (x) => syllabeUtiliseSonsAppris(x.syllabe, son) && motAuMoinsDeuxSyllabes(x.mot)
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

  if (onlyEouE) {
    exo2Items = exo2Items.filter((x) => contientEouE(x.mot));
    exo3Items = exo3Items.filter((x) => contientEouE(x.mot));
    exo4Items = exo4Items.filter((x) => contientEouE(x.mot));
  }

  const pointsExo1 = exo1Items.filter((x) => x?.contientSon === true).length;
  let exoLettreDansMotItems = getEntoureLettreDansMotItems(son, 3, seed + 15, off);
  let exoRelieEcrituresItems = getRelieEcrituresItems(son, 5, seed + 22, off);
  let exoArticleLeLaItems = son.ordre >= ORDRE_SON_P && evalNumero <= 3
    ? getArticleLeLaItems(son, 4, seed + 30, off)
    : [];

  if (onlyEouE) {
    exoLettreDansMotItems = exoLettreDansMotItems.filter((x) => contientEouE(x.word));
    exoRelieEcrituresItems = exoRelieEcrituresItems.filter((x) =>
      x.words.some((w) => contientEouE(w))
    );
    exoArticleLeLaItems = exoArticleLeLaItems.filter((x) => contientEouE(x.mot));
  }

  const exoImageDeuxMotsItems =
    son.id === "m"
      ? getImageDeuxMotsItemsPourM(seed + 40, off)
      : son.ordre >= ORDRE_SON_R
        ? getImageDeuxMotsItemsPourSon(son, seed + 40, off)
        : [];

  const series: SerieExoEval[] = [
    { type: "entoure-son", items: exo1Items.filter(Boolean), pointsMax: pointsExo1 || 1 },
    { type: "repere-son", items: exo2Items, pointsMax: exo2Items.length },
  ];
  if (exoImageDeuxMotsItems.length > 0) {
    series.unshift({
      type: "image-deux-mots",
      items: exoImageDeuxMotsItems,
      pointsMax: exoImageDeuxMotsItems.length,
    });
  }
  if (exoArticleLeLaItems.length > 0) {
    series.push({ type: "article-le-la", items: exoArticleLeLaItems, pointsMax: exoArticleLeLaItems.length });
  }
  if (exoLettreDansMotItems.length > 0) {
    series.push({ type: "entoure-lettre-dans-mot", items: exoLettreDansMotItems, pointsMax: exoLettreDansMotItems.length });
  }
  if (exoRelieEcrituresItems.length > 0 && exoRelieEcrituresItems[0].words.length >= 2) {
    series.push({ type: "relie-ecritures", items: exoRelieEcrituresItems, pointsMax: exoRelieEcrituresItems[0].words.length });
  }
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
