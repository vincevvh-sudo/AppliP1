/**
 * Phono-image : une image, on dit le mot, l'enfant clique sur la LETTRE qu'il entend.
 * Mots représentatifs d'un seul son (pas "petit" pour E car il a aussi I).
 */

import type { Son } from "./sons-data";

/** Mots avec emoji (ou image personnalisée) - chaque mot est associé à UN seul son. */
export const MOTS_PHONO_IMAGE: Record<string, { mot: string; emoji: string; image?: string }[]> = {
  i: [
    { mot: "ici", emoji: "👆" },
    { mot: "lit", emoji: "🛏️" },
    { mot: "riz", emoji: "🍚" },
    { mot: "gris", emoji: "🐁" },
    { mot: "souris", emoji: "🐭" },
    { mot: "iris", emoji: "🌸" },
    { mot: "midi", emoji: "☀️" },
    { mot: "nid", emoji: "🪺" },
    { mot: "fil", emoji: "🧵" },
  ],
  a: [
    { mot: "chat", emoji: "🐱" },
    { mot: "rat", emoji: "🐀" },
    { mot: "sac", emoji: "👜" },
    { mot: "salade", emoji: "🥗" },
    { mot: "âne", emoji: "🫏" },
    { mot: "patte", emoji: "🦶" },
    { mot: "tarte", emoji: "🥧" },
    { mot: "barre", emoji: "📍" },
    { mot: "papa", emoji: "👨" },
  ],
  o: [
    { mot: "dos", emoji: "🎒" },
    { mot: "vélo", emoji: "🚲" },
    { mot: "photo", emoji: "📷" },
    { mot: "zéro", emoji: "0️⃣" },
    { mot: "zoo", emoji: "🦁" },
    { mot: "mot", emoji: "✉️" },
    { mot: "soleil", emoji: "☀️" },
    { mot: "pomme", emoji: "🍎" },
    { mot: "moto", emoji: "🏍️" },
    { mot: "colle", emoji: "🧴", image: "/images/colle-tube.png" },
    { mot: "école", emoji: "🏫" },
  ],
  // Ne pas mettre "dans" : on y entend le son "en" [ɑ̃], pas le e.
  e: [
    { mot: "requin", emoji: "🦈" },
    { mot: "renard", emoji: "🦊" },
    { mot: "belette", emoji: "🐾" },
    { mot: "pelouse", emoji: "🏟️" },
    { mot: "de", emoji: "➡️" },
    { mot: "je", emoji: "👤" },
    { mot: "melon", emoji: "🍈" },
    { mot: "fenêtre", emoji: "🪟" },
    { mot: "mercredi", emoji: "📅" },
    { mot: "note", emoji: "🎵" },
  ],
  u: [
    { mot: "lune", emoji: "🌙" },
    { mot: "rue", emoji: "🛤️" },
    { mot: "jus", emoji: "🧃" },
    { mot: "pull", emoji: "🧥" },
    { mot: "nuage", emoji: "☁️" },
    { mot: "plume", emoji: "🪶" },
    { mot: "dune", emoji: "🏜️" },
    { mot: "ruche", emoji: "🐝" },
    { mot: "sucette", emoji: "🍭" },
    { mot: "bulle", emoji: "🫧" },
    { mot: "cactus", emoji: "🌵" },
    { mot: "fusée", emoji: "🚀" },
    { mot: "lutin", emoji: "🧝" },
    { mot: "musique", emoji: "🎵" },
    { mot: "légumes", emoji: "🥕" },
    { mot: "tulipe", emoji: "🌷" },
  ],
  // Son "é" (eh eh) — distracteurs : on n'affiche jamais une lettre présente dans le mot (géré dans JeuxSons)
  "e-accent": [
    { mot: "été", emoji: "☀️" },
    { mot: "école", emoji: "🏫" },
    { mot: "père", emoji: "👨" },
    { mot: "mère", emoji: "👩" },
    { mot: "rêve", emoji: "💭" },
    { mot: "fête", emoji: "🎉" },
    { mot: "lézard", emoji: "🦎" },
    { mot: "légume", emoji: "🥕" },
    { mot: "karaté", emoji: "🥋" },
    { mot: "canapé", emoji: "🛋️" },
    { mot: "bébé", emoji: "👶" },
    { mot: "église", emoji: "⛪" },
    { mot: "fusée", emoji: "🚀" },
    { mot: "zèbre", emoji: "🦓" },
    { mot: "lèvre", emoji: "👄" },
    { mot: "colère", emoji: "😤" },
    { mot: "sirène", emoji: "🧜‍♀️" },
    { mot: "vipère", emoji: "🐍" },
    { mot: "café", emoji: "☕" },
    { mot: "thé", emoji: "🍵" },
    { mot: "clé", emoji: "🔑" },
    { mot: "fée", emoji: "🧚" },
  ],
  et: [
    { mot: "et", emoji: "🔗" },
    { mot: "billet", emoji: "🎫" },
    { mot: "poulet", emoji: "🐔" },
    { mot: "navet", emoji: "🥬" },
    { mot: "secret", emoji: "🤫" },
    { mot: "cabinet", emoji: "🪥" },
  ],
  m: [
    { mot: "melon", emoji: "🍈" },
    { mot: "musique", emoji: "🎵" },
    { mot: "moto", emoji: "🏍️" },
    { mot: "miroir", emoji: "🪞" },
    { mot: "fromage", emoji: "🧀" },
    { mot: "domino", emoji: "🎲", image: "/images/domino.png" },
    { mot: "locomotive", emoji: "🚂" },
    { mot: "madame", emoji: "👩" },
    { mot: "minute", emoji: "⏱️" },
    { mot: "limonade", emoji: "🧃" },
    { mot: "maladie", emoji: "🤒" },
    { mot: "chemise", emoji: "👔" },
    { mot: "pomme", emoji: "🍎" },
    { mot: "marguerite", emoji: "🌼" },
    { mot: "masque", emoji: "🎭" },
    { mot: "plume", emoji: "🪶" },
    { mot: "manège", emoji: "🎠" },
    { mot: "mur", emoji: "🧱" },
    { mot: "marteau", emoji: "🔨" },
    { mot: "dromadaire", emoji: "🐪" },
    { mot: "marmite", emoji: "🍲" },
    { mot: "ami", emoji: "👤" },
    { mot: "tomate", emoji: "🍅" },
    { mot: "mine", emoji: "⛏️" },
    { mot: "camion", emoji: "🚚" },
    { mot: "pyjama", emoji: "👕" },
    { mot: "miel", emoji: "🍯" },
    { mot: "Manon", emoji: "👧" },
  ],
  l: [
    { mot: "lune", emoji: "🌙" },
    { mot: "lit", emoji: "🛏️" },
    { mot: "livre", emoji: "📖" },
    { mot: "lunettes", emoji: "👓" },
    { mot: "balle", emoji: "⚾" },
    { mot: "valise", emoji: "🧳" },
    { mot: "lion", emoji: "🦁" },
    { mot: "poule", emoji: "🐔" },
    { mot: "lac", emoji: "🏞️" },
    { mot: "vélo", emoji: "🚲" },
    { mot: "lézard", emoji: "🦎" },
    { mot: "lavabo", emoji: "🚿" },
    { mot: "lumière", emoji: "💡" },
    { mot: "poules", emoji: "🐔" },
    { mot: "lions", emoji: "🦁" },
    { mot: "limaces", emoji: "🐌", image: "/images/limace.png" },
    { mot: "valises", emoji: "🧳" },
    { mot: "lattes", emoji: "📏" },
    { mot: "cheval", emoji: "🐴" },
    { mot: "bouillotte", emoji: "🛏️" },
    { mot: "luge", emoji: "🛷" },
    { mot: "télévision", emoji: "📺" },
  ],
  r: [
    { mot: "rat", emoji: "🐀" },
    { mot: "riz", emoji: "🍚" },
    { mot: "rue", emoji: "🛤️" },
    { mot: "robot", emoji: "🤖" },
    { mot: "raquette", emoji: "🎾" },
    { mot: "règle", emoji: "📏" },
    { mot: "repas", emoji: "🍽️" },
    { mot: "sorcière", emoji: "🧙" },
    { mot: "robinet", emoji: "🚿" },
    { mot: "raton", emoji: "🦝" },
    { mot: "souris", emoji: "🐭" },
    { mot: "réveil", emoji: "⏰" },
    { mot: "rame", emoji: "🚣" },
    { mot: "ruche", emoji: "🐝" },
    { mot: "renard", emoji: "🦊" },
    { mot: "sucre", emoji: "🍬" },
  ],
  s: [
    { mot: "sac", emoji: "👜" },
    { mot: "salade", emoji: "🥗" },
    { mot: "soleil", emoji: "☀️" },
    { mot: "serpent", emoji: "🐍" },
    { mot: "sel", emoji: "🧂" },
    { mot: "sport", emoji: "⚽" },
    { mot: "sirop", emoji: "🍯" },
    { mot: "sorcière", emoji: "🧙" },
    { mot: "stylo", emoji: "✏️" },
    { mot: "sirène", emoji: "🧜‍♀️" },
    { mot: "sucette", emoji: "🍭" },
  ],
  n: [
    { mot: "piscine", emoji: "🏊" },
    { mot: "nature", emoji: "🌿" },
    { mot: "navet", emoji: "🥬" },
    { mot: "nuage", emoji: "☁️" },
    { mot: "nid", emoji: "🪺" },
    { mot: "note", emoji: "📝" },
    { mot: "ananas", emoji: "🍍" },
    { mot: "âne", emoji: "🫏" },
    { mot: "nœud", emoji: "🎀" },
    { mot: "lunettes", emoji: "👓" },
    { mot: "niche", emoji: "🐕" },
    { mot: "fenêtre", emoji: "🪟" },
    { mot: "laine", emoji: "🧶" },
    { mot: "lune", emoji: "🌙" },
    { mot: "nuages", emoji: "☁️" },
  ],
  p: [
    { mot: "papa", emoji: "👨" },
    { mot: "perroquet", emoji: "🦜" },
    { mot: "palme", emoji: "🌴", image: "/images/palme.png" },
    { mot: "pomme", emoji: "🍎" },
    { mot: "porte", emoji: "🚪" },
    { mot: "pizza", emoji: "🍕" },
    { mot: "père", emoji: "👨" },
    { mot: "pote", emoji: "🤝" },
    { mot: "piste", emoji: "🛷" },
    { mot: "pastèque", emoji: "🍉" },
    { mot: "pépin", emoji: "🍎" },
    { mot: "pédale", emoji: "🚲" },
    { mot: "parapluie", emoji: "☂️" },
    { mot: "panade", emoji: "🥣" },
    { mot: "loupe", emoji: "🔍" },
    { mot: "pluie", emoji: "🌧️" },
    { mot: "piano", emoji: "🎹" },
    { mot: "premier", emoji: "🥇" },
    { mot: "parasol", emoji: "⛱️" },
    { mot: "pile", emoji: "🔋" },
    { mot: "papillon", emoji: "🦋" },
  ],
  t: [
    { mot: "tomate", emoji: "🍅" },
    { mot: "tapis", emoji: "🪔" },
    { mot: "table", emoji: "🪑" },
    { mot: "télé", emoji: "📺" },
    { mot: "tipi", emoji: "⛺" },
    { mot: "latte", emoji: "📏" },
    { mot: "taper", emoji: "⌨️" },
    { mot: "tirer", emoji: "🎯" },
    { mot: "ordinateur", emoji: "💻" },
    { mot: "locomotive", emoji: "🚂" },
    { mot: "vêtements", emoji: "👕" },
    { mot: "toque", emoji: "🧢" },
    { mot: "tulipe", emoji: "🌷" },
    { mot: "téléphone", emoji: "📱" },
    { mot: "moto", emoji: "🏍️" },
  ],
  f: [
    { mot: "affiche", emoji: "🖼️" },
    { mot: "fusée", emoji: "🚀" },
    { mot: "filet", emoji: "🕸️" },
    { mot: "fleur", emoji: "🌸" },
    { mot: "fromage", emoji: "🧀" },
    { mot: "forêt", emoji: "🌲" },
    { mot: "farde", emoji: "📁" },
    { mot: "farine", emoji: "🌾" },
    { mot: "café", emoji: "☕" },
    { mot: "fée", emoji: "🧚" },
    { mot: "facteur", emoji: "📮" },
    { mot: "girafe", emoji: "🦒" },
    { mot: "gaufre", emoji: "🧇" },
    { mot: "feuille", emoji: "🍃" },
    { mot: "ficelle", emoji: "🧵" },
    { mot: "forêt", emoji: "🌲" },
    { mot: "fumée", emoji: "💨" },
    { mot: "fichier", emoji: "📁" },
    { mot: "flûte", emoji: "🎵" },
  ],
  v: [
    { mot: "vélo", emoji: "🚲" },
    { mot: "vache", emoji: "🐄" },
    { mot: "cave", emoji: "🏚️" },
    { mot: "ville", emoji: "🏙️" },
    { mot: "vase", emoji: "🏺" },
    { mot: "bravo", emoji: "👏" },
    { mot: "vipère", emoji: "🐍" },
    { mot: "cerf-volant", emoji: "🪁" },
    { mot: "chevalier", emoji: "⚔️" },
    { mot: "violon", emoji: "🎻" },
    { mot: "caravane", emoji: "🚐" },
    { mot: "locomotive", emoji: "🚂" },
  ],
  ch: [
    { mot: "chat", emoji: "🐱" },
    { mot: "chapeau", emoji: "🎩" },
    { mot: "chocolat", emoji: "🍫" },
    { mot: "cheval", emoji: "🐴" },
    { mot: "poche", emoji: "👛" },
    { mot: "douche", emoji: "🚿" },
    { mot: "chèvre", emoji: "🐐" },
    { mot: "chameau", emoji: "🐫" },
    { mot: "chignon", emoji: "💇" },
    { mot: "parachute", emoji: "🪂" },
  ],
  j: [
    { mot: "jupe", emoji: "👗" },
    { mot: "jus", emoji: "🧃" },
    { mot: "jeu", emoji: "🎲" },
    { mot: "jambon", emoji: "🥪" },
    { mot: "jardin", emoji: "🌳" },
    { mot: "jaune", emoji: "🟡" },
    { mot: "pyjama", emoji: "👕" },
    { mot: "jardiner", emoji: "🌱" },
    { mot: "jongleur", emoji: "🤹" },
    { mot: "jeudi", emoji: "📅" },
    { mot: "déjeuner", emoji: "🍽️" },
    { mot: "journée", emoji: "☀️" },
    { mot: "jumelles", emoji: "🔭" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽" },
    { mot: "brosse", emoji: "🪥" },
    { mot: "balai", emoji: "🧹" },
    { mot: "balle", emoji: "⚾" },
    { mot: "bateau", emoji: "⛵" },
    { mot: "cabane", emoji: "🏠" },
    { mot: "bague", emoji: "💍" },
    { mot: "labyrinthe", emoji: "🏛️" },
    { mot: "bonhomme", emoji: "⛄" },
    { mot: "bonbon", emoji: "🍬" },
    { mot: "banane", emoji: "🍌" },
    { mot: "robots", emoji: "🤖" },
    { mot: "bijoux", emoji: "💎" },
    { mot: "balançoire", emoji: "🎢" },
  ],
  d: [
    { mot: "dé", emoji: "🎲" },
    { mot: "drapeau", emoji: "🚩" },
    { mot: "dur", emoji: "🪨" },
    { mot: "dame", emoji: "👩" },
    { mot: "déjà", emoji: "⏰" },
    { mot: "dos", emoji: "🎒" },
    { mot: "dentifrice", emoji: "🪥" },
    { mot: "promenade", emoji: "🚶" },
    { mot: "doigt", emoji: "👆" },
    { mot: "divan", emoji: "🛋️" },
    { mot: "début", emoji: "🏁" },
    { mot: "douze", emoji: "1️⃣" },
  ],
  g: [
    { mot: "gare", emoji: "🚂" },
    { mot: "gomme", emoji: "🧽" },
    { mot: "gâteau", emoji: "🎂" },
    { mot: "gris", emoji: "🐁" },
    { mot: "gros", emoji: "🐘" },
    { mot: "tigre", emoji: "🐅" },
    { mot: "gaufre", emoji: "🧇" },
    { mot: "licorne", emoji: "🦄" },
    { mot: "glace", emoji: "🍦" },
    { mot: "grenouille", emoji: "🐸" },
    { mot: "lego", emoji: "🧱" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣" },
    { mot: "zoo", emoji: "🦁" },
    { mot: "zèbre", emoji: "🦓" },
  ],
  "c-k": [
    { mot: "car", emoji: "🚗", image: "/images/car.png" },
    { mot: "coq", emoji: "🐓" },
    { mot: "café", emoji: "☕" },
    { mot: "clé", emoji: "🔑" },
    { mot: "canard", emoji: "🦆" },
    { mot: "camion", emoji: "🚚" },
    { mot: "croc", emoji: "🦷" },
  ],
  ou: [
    { mot: "loup", emoji: "🐺" },
    { mot: "cou", emoji: "🦒" },
    { mot: "souris", emoji: "🐭" },
    { mot: "forêt", emoji: "🌲" },
  ],
  oi: [
    { mot: "poisson", emoji: "🐟" },
    { mot: "roi", emoji: "👑" },
    { mot: "oiseau", emoji: "🐦" },
    { mot: "soif", emoji: "💧" },
  ],
  on: [
    { mot: "pont", emoji: "🌉" },
    { mot: "maison", emoji: "🏠" },
    { mot: "savon", emoji: "🧼" },
    { mot: "citron", emoji: "🍋" },
  ],
  an: [
    { mot: "enfant", emoji: "👧" },
    { mot: "pantalon", emoji: "👖" },
    { mot: "orange", emoji: "🍊" },
    { mot: "vent", emoji: "💨" },
  ],
  in: [
    { mot: "lapin", emoji: "🐰" },
    { mot: "matin", emoji: "🌅" },
    { mot: "main", emoji: "✋" },
    { mot: "train", emoji: "🚂" },
    { mot: "bain", emoji: "🛁" },
  ],
};

/** Série fixe Phono Image lettre M — niveau 1 : toujours ces 8 mots (ordre mélangé à l'affichage). */
const SERIE_FIXE_M_PHONO_IMAGE_1: { mot: string; emoji: string; image?: string }[] = [
  { mot: "melon", emoji: "🍈" },
  { mot: "musique", emoji: "🎵" },
  { mot: "moto", emoji: "🏍️" },
  { mot: "miroir", emoji: "🪞" },
  { mot: "fromage", emoji: "🧀" },
  { mot: "domino", emoji: "🎲", image: "/images/domino.png" },
  { mot: "locomotive", emoji: "🚂" },
  { mot: "madame", emoji: "👩" },
];

/** Série fixe Phono Image lettre M — niveau 2 : toujours ces 8 mots (ordre mélangé à l'affichage). */
const SERIE_FIXE_M_PHONO_IMAGE_2: { mot: string; emoji: string; image?: string }[] = [
  { mot: "minute", emoji: "⏱️" },
  { mot: "limonade", emoji: "🧃" },
  { mot: "maladie", emoji: "🤒" },
  { mot: "chemise", emoji: "👔" },
  { mot: "pomme", emoji: "🍎" },
  { mot: "marguerite", emoji: "🌼" },
  { mot: "masque", emoji: "🎭" },
  { mot: "plume", emoji: "🪶" },
];

/**
 * Retourne les 8 mots fixes pour la lettre M en Phono Image (même set à chaque fois, seul l'ordre change).
 */
export function getMotsPhonoImageFixesPourM(
  sonM: Son,
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son; image?: string }[] {
  const list = niveauNumero === 2 ? SERIE_FIXE_M_PHONO_IMAGE_2 : SERIE_FIXE_M_PHONO_IMAGE_1;
  return [...list]
    .sort(() => Math.random() - 0.5)
    .map((p) => ({ ...p, sonCible: sonM }));
}

/** Série fixe Phono Image lettre L — niveau 1 : toujours ces 8 mots (ordre mélangé à l'affichage). */
const SERIE_FIXE_L_PHONO_IMAGE_1: { mot: string; emoji: string; image?: string }[] = [
  { mot: "lune", emoji: "🌙" },
  { mot: "lit", emoji: "🛏️" },
  { mot: "livre", emoji: "📖" },
  { mot: "lunettes", emoji: "👓" },
  { mot: "balle", emoji: "⚾" },
  { mot: "valise", emoji: "🧳" },
  { mot: "lion", emoji: "🦁" },
  { mot: "poule", emoji: "🐔" },
];

/** Série fixe Phono Image lettre L — niveau 2 : toujours ces 8 mots (ordre mélangé à l'affichage). */
const SERIE_FIXE_L_PHONO_IMAGE_2: { mot: string; emoji: string; image?: string }[] = [
  { mot: "colle", emoji: "🧴", image: "/images/colle-tube.png" },
  { mot: "livre", emoji: "📖" },
  { mot: "vélo", emoji: "🚲" },
  { mot: "locomotive", emoji: "🚂" },
  { mot: "luge", emoji: "🛷" },
  { mot: "pile", emoji: "🔋" },
  { mot: "télévision", emoji: "📺" },
  { mot: "limaces", emoji: "🐌", image: "/images/limace.png" },
];

/**
 * Retourne les 8 mots fixes pour la lettre L en Phono Image (même set à chaque fois, seul l'ordre change).
 */
export function getMotsPhonoImageFixesPourL(
  sonL: Son,
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son; image?: string }[] {
  const list = niveauNumero === 2 ? SERIE_FIXE_L_PHONO_IMAGE_2 : SERIE_FIXE_L_PHONO_IMAGE_1;
  return [...list]
    .sort(() => Math.random() - 0.5)
    .map((p) => ({ ...p, sonCible: sonL }));
}

/** Série fixe Phono Image lettre J — niveau 1 uniquement (jaune→jaguar, jongleur→jument, jambon→judoka, jeu→juste). */
const SERIE_FIXE_J_PHONO_IMAGE_1: { mot: string; emoji: string }[] = [
  { mot: "jupe", emoji: "👗" },
  { mot: "jus", emoji: "🧃" },
  { mot: "juste", emoji: "✅" },
  { mot: "judoka", emoji: "🥋" },
  { mot: "jardin", emoji: "🌳" },
  { mot: "jaguar", emoji: "🐆" },
  { mot: "pyjama", emoji: "👕" },
  { mot: "jument", emoji: "🐴" },
];

/**
 * Retourne les 8 mots fixes pour la lettre J en Phono Image niveau 1 (même set à chaque fois, seul l'ordre change).
 * Niveau 2 utilise la liste standard (getMotsPhonoImagePourSerie).
 */
export function getMotsPhonoImageFixesPourJ(
  sonJ: Son,
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son; image?: string }[] {
  if (niveauNumero !== 1) return [];
  return [...SERIE_FIXE_J_PHONO_IMAGE_1]
    .sort(() => Math.random() - 0.5)
    .map((p) => ({ ...p, sonCible: sonJ }));
}

/** Série fixe Phono Image lettre D — niveau 1 : 8 mots (divan, promenade, date, domino, début, code, ordinateur, radio). */
const SERIE_FIXE_D_PHONO_IMAGE_1: { mot: string; emoji: string }[] = [
  { mot: "divan", emoji: "🛋️" },
  { mot: "promenade", emoji: "🚶" },
  { mot: "date", emoji: "📅" },
  { mot: "domino", emoji: "🎲" },
  { mot: "début", emoji: "🏁" },
  { mot: "code", emoji: "🔢" },
  { mot: "ordinateur", emoji: "💻" },
  { mot: "radio", emoji: "📻" },
];

/**
 * Retourne les 8 mots fixes pour la lettre D en Phono Image niveau 1.
 * Niveau 2 utilise la liste standard (getMotsPhonoImagePourSerie).
 */
export function getMotsPhonoImageFixesPourD(
  sonD: Son,
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son; image?: string }[] {
  if (niveauNumero !== 1) return [];
  return [...SERIE_FIXE_D_PHONO_IMAGE_1]
    .sort(() => Math.random() - 0.5)
    .map((p) => ({ ...p, sonCible: sonD }));
}

/** Série fixe Phono Image lettre G — niveau 1 : 8 mots (mygale, gare, légume, légo, escargot, gobelet, gourde, kangourou). */
const SERIE_FIXE_G_PHONO_IMAGE_1: { mot: string; emoji: string }[] = [
  { mot: "mygale", emoji: "🕷️" },
  { mot: "gare", emoji: "🚂" },
  { mot: "légume", emoji: "🥒" },
  { mot: "légo", emoji: "🧱" },
  { mot: "escargot", emoji: "🐌" },
  { mot: "gobelet", emoji: "🥤" },
  { mot: "gourde", emoji: "🧴" },
  { mot: "kangourou", emoji: "🦘" },
];

/**
 * Retourne les 8 mots fixes pour la lettre G en Phono Image niveau 1.
 * Niveau 2 utilise la liste standard (getMotsPhonoImagePourSerie).
 */
export function getMotsPhonoImageFixesPourG(
  sonG: Son,
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son; image?: string }[] {
  if (niveauNumero !== 1) return [];
  return [...SERIE_FIXE_G_PHONO_IMAGE_1]
    .sort(() => Math.random() - 0.5)
    .map((p) => ({ ...p, sonCible: sonG }));
}

/** Nombre de mots disponibles pour un son (niveau 1 = première moitié, niveau 2 = seconde moitié ; pour le cap on utilise la liste entière). */
export function getNombreMotsPhonoImage(sonId: string): number {
  const list = MOTS_PHONO_IMAGE[sonId] ?? [];
  return list.length;
}

/**
 * Retourne une série de 8 sons où aucun son n'apparaît plus souvent qu'il n'a de mots,
 * pour garantir 8 mots différents dans getMotsPhonoImagePourSerie.
 */
export function capSeriePourMotsDistincts(serie: Son[]): Son[] {
  const total = serie.length;
  if (total === 0) return [];
  const maxParSon = new Map<string, number>();
  const uniques: Son[] = [];
  for (const s of serie) {
    if (s?.id && !maxParSon.has(s.id)) {
      maxParSon.set(s.id, getNombreMotsPhonoImage(s.id));
      uniques.push(s);
    }
  }
  if (uniques.length === 0) return serie;
  const countAssigned = new Map<string, number>();
  for (const u of uniques) countAssigned.set(u.id, 0);
  const result: (Son | undefined)[] = new Array(total);
  const enAttente: number[] = [];
  for (let i = 0; i < total; i++) {
    const s = serie[i];
    if (!s?.id) {
      result[i] = uniques[0];
      continue;
    }
    const count = countAssigned.get(s.id) ?? 0;
    const max = maxParSon.get(s.id) ?? 8;
    if (count < max) {
      result[i] = s;
      countAssigned.set(s.id, count + 1);
    } else {
      enAttente.push(i);
    }
  }
  for (const index of enAttente) {
    const sousCap = uniques.filter((u) => (countAssigned.get(u.id) ?? 0) < (maxParSon.get(u.id) ?? 8));
    const choix = sousCap[Math.floor(Math.random() * sousCap.length)];
    if (choix) {
      result[index] = choix;
      countAssigned.set(choix.id, (countAssigned.get(choix.id) ?? 0) + 1);
    } else {
      result[index] = serie[index];
    }
  }
  return result.map((s, i) => s ?? serie[i]).filter((s): s is Son => s != null);
}

/** Mot + emoji pour phono-image, un par son. Jamais de répétition : uniquement des mots pas encore vus (8 mots différents). */
export function getMotsPhonoImagePourSerie(
  sons: Son[],
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son }[] {
  const result: { mot: string; emoji: string; sonCible: Son }[] = [];
  const motsDejaVus = new Set<string>();
  for (const s of sons) {
    if (!s?.id) continue;
    const list = MOTS_PHONO_IMAGE[s.id] ?? [];
    if (!list.length) continue;
    const mid = Math.ceil(list.length / 2);
    const part = niveauNumero === 2 && list.length > 1 ? list.slice(mid) : list.slice(0, mid);
    let disponibles = part.filter((p) => !motsDejaVus.has(p.mot));
    if (disponibles.length === 0) {
      disponibles = list.filter((p) => !motsDejaVus.has(p.mot));
    }
    if (disponibles.length === 0) continue;
    const pick = disponibles[Math.floor(Math.random() * disponibles.length)];
    motsDejaVus.add(pick.mot);
    result.push({ ...pick, sonCible: s });
  }
  return result.sort(() => Math.random() - 0.5);
}

/** Exercice "écoute le mot, clique si tu entends le son" : emoji + mot, contientSon = true si le mot contient le son. */
export type ItemEcouteClique = { mot: string; emoji: string; image?: string; contientSon: boolean };

const ECOUTE_CLIQUE_PAR_SON: Record<string, ItemEcouteClique[]> = {
  m: [
    { mot: "pomme", emoji: "🍎", contientSon: true },
    { mot: "mouton", emoji: "🐑", contientSon: true },
    { mot: "fleur", emoji: "🌸", contientSon: false },
    { mot: "mouche", emoji: "🪰", contientSon: true },
    { mot: "moto", emoji: "🏍️", contientSon: true },
    { mot: "étoile", emoji: "⭐", contientSon: false },
    { mot: "crayon", emoji: "✏️", contientSon: false },
    { mot: "masque", emoji: "🎭", contientSon: true },
    { mot: "papa", emoji: "👨", contientSon: false },
    { mot: "maison", emoji: "🏠", contientSon: true },
    { mot: "plume", emoji: "🪶", contientSon: true },
    { mot: "banane", emoji: "🍌", contientSon: false },
  ],
  l: [
    { mot: "lune", emoji: "🌙", contientSon: true },
    { mot: "lit", emoji: "🛏️", contientSon: true },
    { mot: "livre", emoji: "📖", contientSon: true },
    { mot: "lion", emoji: "🦁", contientSon: true },
    { mot: "vélo", emoji: "🚲", contientSon: true },
    { mot: "poule", emoji: "🐔", contientSon: true },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "pain", emoji: "🍞", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
    { mot: "ballon", emoji: "⚽", contientSon: false },
  ],
  r: [
    { mot: "rat", emoji: "🐀", contientSon: true },
    { mot: "rue", emoji: "🛤️", contientSon: true },
    { mot: "robot", emoji: "🤖", contientSon: true },
    { mot: "rame", emoji: "🚣", contientSon: true },
    { mot: "ruche", emoji: "🐝", contientSon: true },
    { mot: "renard", emoji: "🦊", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "sac", emoji: "👜", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "papa", emoji: "👨", contientSon: false },
    { mot: "tomate", emoji: "🍅", contientSon: false },
    { mot: "vélo", emoji: "🚲", contientSon: false },
  ],
  s: [
    { mot: "sac", emoji: "👜", contientSon: true },
    { mot: "soleil", emoji: "☀️", contientSon: true },
    { mot: "serpent", emoji: "🐍", contientSon: true },
    { mot: "sel", emoji: "🧂", contientSon: true },
    { mot: "sirop", emoji: "🍯", contientSon: true },
    { mot: "sirène", emoji: "🧜‍♀️", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  n: [
    { mot: "piscine", emoji: "🏊", contientSon: true },
    { mot: "nature", emoji: "🌿", contientSon: true },
    { mot: "nuage", emoji: "☁️", contientSon: true },
    { mot: "nid", emoji: "🪺", contientSon: true },
    { mot: "note", emoji: "📝", contientSon: true },
    { mot: "navet", emoji: "🥬", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "sac", emoji: "👜", contientSon: false },
    { mot: "papa", emoji: "👨", contientSon: false },
    { mot: "tomate", emoji: "🍅", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
  ],
  p: [
    { mot: "papa", emoji: "👨", contientSon: true },
    { mot: "palme", emoji: "🌴", image: "/images/palme.png", contientSon: true },
    { mot: "pomme", emoji: "🍎", contientSon: true },
    { mot: "porte", emoji: "🚪", contientSon: true },
    { mot: "pizza", emoji: "🍕", contientSon: true },
    { mot: "père", emoji: "👨", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "sac", emoji: "👜", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "vélo", emoji: "🚲", contientSon: false },
  ],
  t: [
    { mot: "tomate", emoji: "🍅", contientSon: true },
    { mot: "tapis", emoji: "🪔", contientSon: true },
    { mot: "table", emoji: "🪑", contientSon: true },
    { mot: "télé", emoji: "📺", contientSon: true },
    { mot: "taper", emoji: "⌨️", contientSon: true },
    { mot: "tirer", emoji: "🎯", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
    { mot: "ballon", emoji: "⚽", contientSon: false },
  ],
  f: [
    { mot: "affiche", emoji: "🖼️", contientSon: true },
    { mot: "fusée", emoji: "🚀", contientSon: true },
    { mot: "fleur", emoji: "🌸", contientSon: true },
    { mot: "fromage", emoji: "🧀", contientSon: true },
    { mot: "forêt", emoji: "🌲", contientSon: true },
    { mot: "fée", emoji: "🧚", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "ballon", emoji: "⚽", contientSon: false },
  ],
  v: [
    { mot: "vélo", emoji: "🚲", contientSon: true },
    { mot: "vache", emoji: "🐄", contientSon: true },
    { mot: "cave", emoji: "🏚️", contientSon: true },
    { mot: "ville", emoji: "🏙️", contientSon: true },
    { mot: "bravo", emoji: "👏", contientSon: true },
    { mot: "vase", emoji: "🏺", contientSon: true },
    { mot: "vipère", emoji: "🐍", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  ch: [
    { mot: "chat", emoji: "🐱", contientSon: true },
    { mot: "chapeau", emoji: "🎩", contientSon: true },
    { mot: "chocolat", emoji: "🍫", contientSon: true },
    { mot: "cheval", emoji: "🐴", contientSon: true },
    { mot: "chèvre", emoji: "🐐", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
    { mot: "vélo", emoji: "🚲", contientSon: false },
  ],
  j: [
    { mot: "jupe", emoji: "👗", contientSon: true },
    { mot: "jus", emoji: "🧃", contientSon: true },
    { mot: "jeu", emoji: "🎲", contientSon: true },
    { mot: "jardin", emoji: "🌳", contientSon: true },
    { mot: "jaune", emoji: "🟡", contientSon: true },
    { mot: "jambon", emoji: "🥪", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  b: [
    { mot: "ballon", emoji: "⚽", contientSon: true },
    { mot: "balle", emoji: "⚾", contientSon: true },
    { mot: "bateau", emoji: "⛵", contientSon: true },
    { mot: "banane", emoji: "🍌", contientSon: true },
    { mot: "brosse", emoji: "🪥", contientSon: true },
    { mot: "balai", emoji: "🧹", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  d: [
    { mot: "dé", emoji: "🎲", contientSon: true },
    { mot: "drapeau", emoji: "🚩", contientSon: true },
    { mot: "dame", emoji: "👩", contientSon: true },
    { mot: "dos", emoji: "🎒", contientSon: true },
    { mot: "doigt", emoji: "👆", contientSon: true },
    { mot: "douche", emoji: "🚿", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  g: [
    { mot: "gare", emoji: "🚂", contientSon: true },
    { mot: "gomme", emoji: "🧽", contientSon: true },
    { mot: "gâteau", emoji: "🎂", contientSon: true },
    { mot: "gris", emoji: "🐁", contientSon: true },
    { mot: "glace", emoji: "🍦", contientSon: true },
    { mot: "tigre", emoji: "🐅", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣", contientSon: true },
    { mot: "zoo", emoji: "🦁", contientSon: true },
    { mot: "zèbre", emoji: "🦓", contientSon: true },
    { mot: "pizza", emoji: "🍕", contientSon: true },
    { mot: "valise", emoji: "🧳", contientSon: true },
    { mot: "gaze", emoji: "🩹", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  "c-k": [
    { mot: "car", emoji: "🚗", image: "/images/car.png", contientSon: true },
    { mot: "coq", emoji: "🐓", contientSon: true },
    { mot: "café", emoji: "☕", contientSon: true },
    { mot: "canard", emoji: "🦆", contientSon: true },
    { mot: "camion", emoji: "🚚", contientSon: true },
    { mot: "clé", emoji: "🔑", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  ou: [
    { mot: "loup", emoji: "🐺", contientSon: true },
    { mot: "cou", emoji: "🦒", contientSon: true },
    { mot: "forêt", emoji: "🌲", contientSon: true },
    { mot: "souris", emoji: "🐭", contientSon: true },
    { mot: "poule", emoji: "🐔", contientSon: true },
    { mot: "roue", emoji: "🛞", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  oi: [
    { mot: "poisson", emoji: "🐟", contientSon: true },
    { mot: "roi", emoji: "👑", contientSon: true },
    { mot: "oiseau", emoji: "🐦", contientSon: true },
    { mot: "soif", emoji: "💧", contientSon: true },
    { mot: "moi", emoji: "👤", contientSon: true },
    { mot: "toit", emoji: "🏠", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  on: [
    { mot: "pont", emoji: "🌉", contientSon: true },
    { mot: "maison", emoji: "🏠", contientSon: true },
    { mot: "savon", emoji: "🧼", contientSon: true },
    { mot: "citron", emoji: "🍋", contientSon: true },
    { mot: "ballon", emoji: "⚽", contientSon: true },
    { mot: "mouton", emoji: "🐑", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  in: [
    { mot: "lapin", emoji: "🐰", contientSon: true },
    { mot: "matin", emoji: "🌅", contientSon: true },
    { mot: "main", emoji: "✋", contientSon: true },
    { mot: "train", emoji: "🚂", contientSon: true },
    { mot: "bain", emoji: "🛁", contientSon: true },
    { mot: "palme", emoji: "🌴", image: "/images/palme.png", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
  an: [
    { mot: "enfant", emoji: "👧", contientSon: true },
    { mot: "pantalon", emoji: "👖", contientSon: true },
    { mot: "vent", emoji: "💨", contientSon: true },
    { mot: "orange", emoji: "🍊", contientSon: true },
    { mot: "maman", emoji: "👩", contientSon: true },
    { mot: "jardin", emoji: "🌳", contientSon: true },
    { mot: "lune", emoji: "🌙", contientSon: false },
    { mot: "rat", emoji: "🐀", contientSon: false },
    { mot: "pomme", emoji: "🍎", contientSon: false },
    { mot: "chat", emoji: "🐱", contientSon: false },
    { mot: "piscine", emoji: "🏊", contientSon: false },
    { mot: "feu", emoji: "🔥", contientSon: false },
  ],
};

export function getEcouteCliqueItemsPourSon(sonId: string): ItemEcouteClique[] {
  const items = ECOUTE_CLIQUE_PAR_SON[sonId];
  if (!items || items.length === 0) return [];
  return [...items].sort(() => Math.random() - 0.5);
}

/** Exercice "Sons images" : mot affiché, l'enfant clique sur la syllabe qui contient ma/me/mi/mo/mu/mé/mè. */
export type ItemSonsImages = { mot: string; syllabes: string[]; bonneSyllabe: string; enCursive?: boolean };

const SONS_IMAGES_M: ItemSonsImages[] = [
  { mot: "rame", syllabes: ["ra", "me"], bonneSyllabe: "me" },
  { mot: "métal", syllabes: ["mé", "tal"], bonneSyllabe: "mé" },
  { mot: "Madeleine", syllabes: ["Ma", "de", "lei", "ne"], bonneSyllabe: "Ma" },
  { mot: "minute", syllabes: ["mi", "nu", "te"], bonneSyllabe: "mi" },
  { mot: "limonade", syllabes: ["li", "mo", "na", "de"], bonneSyllabe: "mo" },
  { mot: "moto", syllabes: ["mo", "to"], bonneSyllabe: "mo" },
  { mot: "numéro", syllabes: ["nu", "mé", "ro"], bonneSyllabe: "mé" },
  { mot: "maladie", syllabes: ["ma", "la", "die"], bonneSyllabe: "ma" },
  { mot: "mèche", syllabes: ["mè", "che"], bonneSyllabe: "mè", enCursive: true },
  { mot: "chemise", syllabes: ["che", "mi", "se"], bonneSyllabe: "mi", enCursive: true },
  { mot: "métro", syllabes: ["mé", "tro"], bonneSyllabe: "mé", enCursive: true },
  { mot: "Manon", syllabes: ["Ma", "non"], bonneSyllabe: "Ma", enCursive: true },
];

/** Pour la lettre L : uniquement des mots où "l" n'apparaît qu'une fois. */
const SONS_IMAGES_L: ItemSonsImages[] = [
  { mot: "lune", syllabes: ["lu", "ne"], bonneSyllabe: "lu" },
  { mot: "lit", syllabes: ["lit"], bonneSyllabe: "lit" },
  { mot: "livre", syllabes: ["li", "vre"], bonneSyllabe: "li" },
  { mot: "lac", syllabes: ["lac"], bonneSyllabe: "lac" },
  { mot: "lion", syllabes: ["li", "on"], bonneSyllabe: "li" },
  { mot: "luge", syllabes: ["lu", "ge"], bonneSyllabe: "lu" },
  { mot: "vélo", syllabes: ["vé", "lo"], bonneSyllabe: "lo" },
  { mot: "poule", syllabes: ["pou", "le"], bonneSyllabe: "le" },
  { mot: "valise", syllabes: ["va", "li", "se"], bonneSyllabe: "li" },
  { mot: "lézard", syllabes: ["lé", "zard"], bonneSyllabe: "lé" },
  { mot: "lavabo", syllabes: ["la", "va", "bo"], bonneSyllabe: "la" },
  { mot: "lumière", syllabes: ["lu", "miè", "re"], bonneSyllabe: "lu" },
];

const SONS_IMAGES_R: ItemSonsImages[] = [
  { mot: "rat", syllabes: ["rat"], bonneSyllabe: "rat" },
  { mot: "rue", syllabes: ["rue"], bonneSyllabe: "rue" },
  { mot: "robot", syllabes: ["ro", "bot"], bonneSyllabe: "ro" },
  { mot: "rame", syllabes: ["ra", "me"], bonneSyllabe: "ra" },
  { mot: "ruche", syllabes: ["ru", "che"], bonneSyllabe: "ru" },
  { mot: "renard", syllabes: ["re", "nard"], bonneSyllabe: "re" },
  { mot: "raquette", syllabes: ["ra", "quette"], bonneSyllabe: "ra" },
  { mot: "règle", syllabes: ["rè", "gle"], bonneSyllabe: "rè" },
  { mot: "riz", syllabes: ["riz"], bonneSyllabe: "riz" },
  { mot: "repas", syllabes: ["re", "pas"], bonneSyllabe: "re" },
  { mot: "robinet", syllabes: ["ro", "bi", "net"], bonneSyllabe: "ro" },
  { mot: "réveil", syllabes: ["ré", "veil"], bonneSyllabe: "ré" },
];

const SONS_IMAGES_S: ItemSonsImages[] = [
  { mot: "sac", syllabes: ["sac"], bonneSyllabe: "sac" },
  { mot: "soleil", syllabes: ["so", "leil"], bonneSyllabe: "so" },
  { mot: "serpent", syllabes: ["ser", "pent"], bonneSyllabe: "ser" },
  { mot: "sel", syllabes: ["sel"], bonneSyllabe: "sel" },
  { mot: "sirop", syllabes: ["si", "rop"], bonneSyllabe: "si" },
  { mot: "sport", syllabes: ["sport"], bonneSyllabe: "sport" },
  { mot: "salade", syllabes: ["sa", "lade"], bonneSyllabe: "sa" },
  { mot: "sirène", syllabes: ["si", "rè", "ne"], bonneSyllabe: "si" },
  { mot: "stylo", syllabes: ["sty", "lo"], bonneSyllabe: "sty" },
  { mot: "sucette", syllabes: ["su", "cette"], bonneSyllabe: "su" },
  { mot: "sorcière", syllabes: ["sor", "ciè", "re"], bonneSyllabe: "sor" },
  { mot: "santé", syllabes: ["san", "té"], bonneSyllabe: "san" },
];

const SONS_IMAGES_N: ItemSonsImages[] = [
  { mot: "piscine", syllabes: ["pi", "sci", "ne"], bonneSyllabe: "ne" },
  { mot: "nature", syllabes: ["na", "tu", "re"], bonneSyllabe: "na" },
  { mot: "nuage", syllabes: ["nu", "a", "ge"], bonneSyllabe: "nu" },
  { mot: "nid", syllabes: ["nid"], bonneSyllabe: "nid" },
  { mot: "note", syllabes: ["no", "te"], bonneSyllabe: "no" },
  { mot: "navet", syllabes: ["na", "vet"], bonneSyllabe: "na" },
  { mot: "nœud", syllabes: ["nœud"], bonneSyllabe: "nœud" },
  { mot: "niche", syllabes: ["ni", "che"], bonneSyllabe: "ni" },
  { mot: "nuit", syllabes: ["nuit"], bonneSyllabe: "nuit" },
  { mot: "nom", syllabes: ["nom"], bonneSyllabe: "nom" },
  { mot: "nous", syllabes: ["nous"], bonneSyllabe: "nous" },
  { mot: "nager", syllabes: ["na", "ger"], bonneSyllabe: "na" },
];

const SONS_IMAGES_P: ItemSonsImages[] = [
  { mot: "palme", syllabes: ["pal", "me"], bonneSyllabe: "pal" },
  { mot: "pomme", syllabes: ["po", "mme"], bonneSyllabe: "po" },
  { mot: "porte", syllabes: ["por", "te"], bonneSyllabe: "por" },
  { mot: "pizza", syllabes: ["piz", "za"], bonneSyllabe: "piz" },
  { mot: "père", syllabes: ["pè", "re"], bonneSyllabe: "pè" },
  { mot: "poule", syllabes: ["pou", "le"], bonneSyllabe: "pou" },
  { mot: "piano", syllabes: ["pia", "no"], bonneSyllabe: "pia" },
  { mot: "pluie", syllabes: ["pluie"], bonneSyllabe: "pluie" },
  { mot: "pédale", syllabes: ["pé", "da", "le"], bonneSyllabe: "pé" },
  { mot: "pastèque", syllabes: ["pas", "tè", "que"], bonneSyllabe: "pas" },
  { mot: "parapluie", syllabes: ["pa", "ra", "pluie"], bonneSyllabe: "pa" },
];

const SONS_IMAGES_T: ItemSonsImages[] = [
  { mot: "tube", syllabes: ["tu", "be"], bonneSyllabe: "tu" },
  { mot: "tapis", syllabes: ["ta", "pis"], bonneSyllabe: "ta" },
  { mot: "table", syllabes: ["ta", "ble"], bonneSyllabe: "ta" },
  { mot: "télé", syllabes: ["té", "lé"], bonneSyllabe: "té" },
  { mot: "télévision", syllabes: ["té", "lé", "vi", "sion"], bonneSyllabe: "té" },
  { mot: "taper", syllabes: ["ta", "per"], bonneSyllabe: "ta" },
  { mot: "tirer", syllabes: ["ti", "rer"], bonneSyllabe: "ti" },
  { mot: "ordinateur", syllabes: ["or", "di", "na", "teur"], bonneSyllabe: "teur" },
  { mot: "tipi", syllabes: ["ti", "pi"], bonneSyllabe: "ti" },
  { mot: "toque", syllabes: ["to", "que"], bonneSyllabe: "to" },
  { mot: "tulipe", syllabes: ["tu", "li", "pe"], bonneSyllabe: "tu" },
  { mot: "train", syllabes: ["train"], bonneSyllabe: "train" },
  { mot: "tracteur", syllabes: ["trac", "teur"], bonneSyllabe: "trac" },
];

const SONS_IMAGES_F: ItemSonsImages[] = [
  { mot: "affiche", syllabes: ["af", "fi", "che"], bonneSyllabe: "af" },
  { mot: "fusée", syllabes: ["fu", "sée"], bonneSyllabe: "fu" },
  { mot: "fleur", syllabes: ["fleur"], bonneSyllabe: "fleur" },
  { mot: "fromage", syllabes: ["fro", "ma", "ge"], bonneSyllabe: "fro" },
  { mot: "forêt", syllabes: ["fo", "rêt"], bonneSyllabe: "fo" },
  { mot: "fée", syllabes: ["fée"], bonneSyllabe: "fée" },
  { mot: "filet", syllabes: ["fi", "let"], bonneSyllabe: "fi" },
  { mot: "farine", syllabes: ["fa", "ri", "ne"], bonneSyllabe: "fa" },
  { mot: "fenêtre", syllabes: ["fe", "nê", "tre"], bonneSyllabe: "fe" },
  { mot: "forêt", syllabes: ["fo", "rêt"], bonneSyllabe: "fo" },
  { mot: "facteur", syllabes: ["fac", "teur"], bonneSyllabe: "fac" },
  { mot: "flûte", syllabes: ["flû", "te"], bonneSyllabe: "flû" },
];

const SONS_IMAGES_V: ItemSonsImages[] = [
  { mot: "vélo", syllabes: ["vé", "lo"], bonneSyllabe: "vé" },
  { mot: "vache", syllabes: ["va", "che"], bonneSyllabe: "va" },
  { mot: "cave", syllabes: ["ca", "ve"], bonneSyllabe: "ve" },
  { mot: "ville", syllabes: ["vil", "le"], bonneSyllabe: "vil" },
  { mot: "vase", syllabes: ["va", "se"], bonneSyllabe: "va" },
  { mot: "bravo", syllabes: ["bra", "vo"], bonneSyllabe: "vo" },
  { mot: "vipère", syllabes: ["vi", "pè", "re"], bonneSyllabe: "vi" },
  { mot: "violon", syllabes: ["vio", "lon"], bonneSyllabe: "vio" },
];

const SONS_IMAGES_CH: ItemSonsImages[] = [
  { mot: "écharpe", syllabes: ["é", "char", "pe"], bonneSyllabe: "char" },
  { mot: "chapeau", syllabes: ["cha", "peau"], bonneSyllabe: "cha" },
  { mot: "chocolat", syllabes: ["cho", "co", "lat"], bonneSyllabe: "cho" },
  { mot: "cheval", syllabes: ["che", "val"], bonneSyllabe: "che" },
  { mot: "chèvre", syllabes: ["chè", "vre"], bonneSyllabe: "chè" },
  { mot: "chameau", syllabes: ["cha", "meau"], bonneSyllabe: "cha" },
  { mot: "poche", syllabes: ["po", "che"], bonneSyllabe: "che" },
  { mot: "cloche", syllabes: ["clo", "che"], bonneSyllabe: "che" },
  { mot: "douche", syllabes: ["dou", "che"], bonneSyllabe: "che" },
  { mot: "chignon", syllabes: ["chi", "gnon"], bonneSyllabe: "chi" },
  { mot: "parachute", syllabes: ["pa", "ra", "chute"], bonneSyllabe: "chute" },
];

const SONS_IMAGES_J: ItemSonsImages[] = [
  { mot: "jupe", syllabes: ["ju", "pe"], bonneSyllabe: "ju" },
  { mot: "jus", syllabes: ["jus"], bonneSyllabe: "jus" },
  { mot: "jeu", syllabes: ["jeu"], bonneSyllabe: "jeu" },
  { mot: "jardin", syllabes: ["jar", "din"], bonneSyllabe: "jar" },
  { mot: "jaune", syllabes: ["jau", "ne"], bonneSyllabe: "jau" },
  { mot: "jambon", syllabes: ["jam", "bon"], bonneSyllabe: "jam" },
  { mot: "jeudi", syllabes: ["jeu", "di"], bonneSyllabe: "jeu" },
  { mot: "journée", syllabes: ["jour", "née"], bonneSyllabe: "jour" },
  { mot: "pyjama", syllabes: ["py", "ja", "ma"], bonneSyllabe: "ja" },
  { mot: "jongleur", syllabes: ["jon", "gleur"], bonneSyllabe: "jon" },
  { mot: "jumelles", syllabes: ["ju", "mel", "les"], bonneSyllabe: "ju" },
  { mot: "jardinier", syllabes: ["jar", "di", "nier"], bonneSyllabe: "jar" },
];

const SONS_IMAGES_B: ItemSonsImages[] = [
  { mot: "ballon", syllabes: ["ba", "llon"], bonneSyllabe: "ba" },
  { mot: "balle", syllabes: ["ba", "lle"], bonneSyllabe: "ba" },
  { mot: "bateau", syllabes: ["ba", "teau"], bonneSyllabe: "ba" },
  { mot: "banane", syllabes: ["ba", "na", "ne"], bonneSyllabe: "ba" },
  { mot: "brosse", syllabes: ["bros", "se"], bonneSyllabe: "bros" },
  { mot: "balai", syllabes: ["ba", "lai"], bonneSyllabe: "ba" },
  { mot: "cabane", syllabes: ["ca", "ba", "ne"], bonneSyllabe: "ba" },
  { mot: "bague", syllabes: ["ba", "gue"], bonneSyllabe: "ba" },
  { mot: "banane", syllabes: ["ba", "na", "ne"], bonneSyllabe: "ba" },
  { mot: "biche", syllabes: ["bi", "che"], bonneSyllabe: "bi" },
  { mot: "bijou", syllabes: ["bi", "jou"], bonneSyllabe: "bi" },
];

const SONS_IMAGES_D: ItemSonsImages[] = [
  { mot: "cadeau", syllabes: ["ca", "deau"], bonneSyllabe: "deau" },
  { mot: "douche", syllabes: ["dou", "che"], bonneSyllabe: "dou" },
  { mot: "dimanche", syllabes: ["di", "man", "che"], bonneSyllabe: "di" },
  { mot: "divan", syllabes: ["di", "van"], bonneSyllabe: "di" },
  { mot: "drapeau", syllabes: ["dra", "peau"], bonneSyllabe: "dra" },
  { mot: "dos", syllabes: ["dos"], bonneSyllabe: "dos" },
  { mot: "dame", syllabes: ["da", "me"], bonneSyllabe: "da" },
  { mot: "dentifrice", syllabes: ["den", "ti", "frice"], bonneSyllabe: "den" },
  { mot: "début", syllabes: ["dé", "but"], bonneSyllabe: "dé" },
  { mot: "déjà", syllabes: ["dé", "jà"], bonneSyllabe: "dé" },
];

const SONS_IMAGES_G: ItemSonsImages[] = [
  { mot: "gare", syllabes: ["ga", "re"], bonneSyllabe: "ga" },
  { mot: "gomme", syllabes: ["go", "mme"], bonneSyllabe: "go" },
  { mot: "gâteau", syllabes: ["gâ", "teau"], bonneSyllabe: "gâ" },
  { mot: "gris", syllabes: ["gris"], bonneSyllabe: "gris" },
  { mot: "glace", syllabes: ["gla", "ce"], bonneSyllabe: "gla" },
  { mot: "gorge", syllabes: ["gor", "ge"], bonneSyllabe: "gor" },
  { mot: "gros", syllabes: ["gros"], bonneSyllabe: "gros" },
  { mot: "gant", syllabes: ["gant"], bonneSyllabe: "gant" },
  { mot: "goutte", syllabes: ["gou", "tte"], bonneSyllabe: "gou" },
  { mot: "gaufre", syllabes: ["gau", "fre"], bonneSyllabe: "gau" },
];

const SONS_IMAGES_Z: ItemSonsImages[] = [
  { mot: "zéro", syllabes: ["zé", "ro"], bonneSyllabe: "zé" },
  { mot: "zoo", syllabes: ["zoo"], bonneSyllabe: "zoo" },
  { mot: "zèbre", syllabes: ["zè", "bre"], bonneSyllabe: "zè" },
  { mot: "valise", syllabes: ["va", "li", "se"], bonneSyllabe: "se" },
  { mot: "bizarre", syllabes: ["bi", "zarre"], bonneSyllabe: "zarre" },
  { mot: "gaz", syllabes: ["gaz"], bonneSyllabe: "gaz" },
  { mot: "douze", syllabes: ["douze"], bonneSyllabe: "douze" },
  { mot: "treize", syllabes: ["treize"], bonneSyllabe: "treize" },
  { mot: "rose", syllabes: ["ro", "se"], bonneSyllabe: "se" },
  { mot: "brise", syllabes: ["bri", "se"], bonneSyllabe: "se" },
  { mot: "chaise", syllabes: ["chai", "se"], bonneSyllabe: "se" },
  { mot: "pizza", syllabes: ["piz", "za"], bonneSyllabe: "za" },
];

const SONS_IMAGES_CK: ItemSonsImages[] = [
  { mot: "car", syllabes: ["car"], bonneSyllabe: "car" },
  { mot: "coq", syllabes: ["coq"], bonneSyllabe: "coq" },
  { mot: "café", syllabes: ["ca", "fé"], bonneSyllabe: "ca" },
  { mot: "canard", syllabes: ["ca", "nard"], bonneSyllabe: "ca" },
  { mot: "camion", syllabes: ["ca", "mion"], bonneSyllabe: "ca" },
  { mot: "clé", syllabes: ["clé"], bonneSyllabe: "clé" },
  { mot: "croc", syllabes: ["croc"], bonneSyllabe: "croc" },
  { mot: "sac", syllabes: ["sac"], bonneSyllabe: "sac" },
  { mot: "lac", syllabes: ["lac"], bonneSyllabe: "lac" },
  { mot: "cube", syllabes: ["cube"], bonneSyllabe: "cube" },
  { mot: "classe", syllabes: ["cla", "sse"], bonneSyllabe: "cla" },
  { mot: "carte", syllabes: ["car", "te"], bonneSyllabe: "car" },
];

const SONS_IMAGES_OU: ItemSonsImages[] = [
  { mot: "loup", syllabes: ["loup"], bonneSyllabe: "loup" },
  { mot: "cou", syllabes: ["cou"], bonneSyllabe: "cou" },
  { mot: "four", syllabes: ["four"], bonneSyllabe: "four" },
  { mot: "souris", syllabes: ["sou", "ris"], bonneSyllabe: "sou" },
  { mot: "poule", syllabes: ["pou", "le"], bonneSyllabe: "pou" },
  { mot: "roue", syllabes: ["roue"], bonneSyllabe: "roue" },
  { mot: "coude", syllabes: ["coude"], bonneSyllabe: "coude" },
  { mot: "mouche", syllabes: ["mou", "che"], bonneSyllabe: "mou" },
  { mot: "genou", syllabes: ["ge", "nou"], bonneSyllabe: "nou" },
  { mot: "hibou", syllabes: ["hi", "bou"], bonneSyllabe: "bou" },
  { mot: "toujours", syllabes: ["tou", "jours"], bonneSyllabe: "tou" },
  { mot: "jour", syllabes: ["jour"], bonneSyllabe: "jour" },
];

const SONS_IMAGES_ON: ItemSonsImages[] = [
  { mot: "pont", syllabes: ["pont"], bonneSyllabe: "pont" },
  { mot: "maison", syllabes: ["mai", "son"], bonneSyllabe: "son" },
  { mot: "savon", syllabes: ["sa", "von"], bonneSyllabe: "von" },
  { mot: "citron", syllabes: ["ci", "tron"], bonneSyllabe: "tron" },
  { mot: "ballon", syllabes: ["ba", "llon"], bonneSyllabe: "llon" },
  { mot: "mouton", syllabes: ["mou", "ton"], bonneSyllabe: "ton" },
  { mot: "jambon", syllabes: ["jam", "bon"], bonneSyllabe: "bon" },
  { mot: "papillon", syllabes: ["pa", "pi", "llon"], bonneSyllabe: "llon" },
  { mot: "melon", syllabes: ["me", "lon"], bonneSyllabe: "lon" },
  { mot: "bouton", syllabes: ["bou", "ton"], bonneSyllabe: "ton" },
  { mot: "chanson", syllabes: ["chan", "son"], bonneSyllabe: "son" },
  { mot: "avion", syllabes: ["a", "vion"], bonneSyllabe: "vion" },
];

const SONS_IMAGES_IN: ItemSonsImages[] = [
  { mot: "lapin", syllabes: ["la", "pin"], bonneSyllabe: "pin" },
  { mot: "matin", syllabes: ["ma", "tin"], bonneSyllabe: "tin" },
  { mot: "main", syllabes: ["main"], bonneSyllabe: "main" },
  { mot: "train", syllabes: ["train"], bonneSyllabe: "train" },
  { mot: "bain", syllabes: ["bain"], bonneSyllabe: "bain" },
  { mot: "palme", syllabes: ["pal", "me"], bonneSyllabe: "pal" },
  { mot: "baleine", syllabes: ["ba", "lei", "ne"], bonneSyllabe: "lei" },
  { mot: "sapin", syllabes: ["sa", "pin"], bonneSyllabe: "pin" },
  { mot: "bébé", syllabes: ["bé", "bé"], bonneSyllabe: "bé" },
  { mot: "serein", syllabes: ["se", "rein"], bonneSyllabe: "rein" },
  { mot: "demain", syllabes: ["de", "main"], bonneSyllabe: "main" },
  { mot: "copain", syllabes: ["co", "pain"], bonneSyllabe: "pain" },
];

const SONS_IMAGES_AN: ItemSonsImages[] = [
  { mot: "enfant", syllabes: ["en", "fant"], bonneSyllabe: "en" },
  { mot: "pantalon", syllabes: ["pan", "ta", "lon"], bonneSyllabe: "pan" },
  { mot: "vent", syllabes: ["vent"], bonneSyllabe: "vent" },
  { mot: "orange", syllabes: ["o", "ran", "ge"], bonneSyllabe: "ran" },
  { mot: "maman", syllabes: ["ma", "man"], bonneSyllabe: "man" },
  { mot: "dents", syllabes: ["dents"], bonneSyllabe: "dents" },
  { mot: "éléphant", syllabes: ["é", "lé", "phant"], bonneSyllabe: "phant" },
  { mot: "tambour", syllabes: ["tam", "bour"], bonneSyllabe: "tam" },
  { mot: "camping", syllabes: ["cam", "ping"], bonneSyllabe: "cam" },
  { mot: "balançoire", syllabes: ["ba", "lan", "çoire"], bonneSyllabe: "lan" },
  { mot: "savant", syllabes: ["sa", "vant"], bonneSyllabe: "vant" },
  { mot: "roman", syllabes: ["ro", "man"], bonneSyllabe: "man" },
  { mot: "manger", syllabes: ["man", "ger"], bonneSyllabe: "man" },
];

const SONS_IMAGES_OI: ItemSonsImages[] = [
  { mot: "poisson", syllabes: ["poi", "sson"], bonneSyllabe: "poi" },
  { mot: "roi", syllabes: ["roi"], bonneSyllabe: "roi" },
  { mot: "oiseau", syllabes: ["oi", "seau"], bonneSyllabe: "oi" },
  { mot: "soif", syllabes: ["soif"], bonneSyllabe: "soif" },
  { mot: "moi", syllabes: ["moi"], bonneSyllabe: "moi" },
  { mot: "toit", syllabes: ["toit"], bonneSyllabe: "toit" },
  { mot: "voiture", syllabes: ["voi", "ture"], bonneSyllabe: "voi" },
  { mot: "poire", syllabes: ["poire"], bonneSyllabe: "poire" },
  { mot: "croix", syllabes: ["croix"], bonneSyllabe: "croix" },
  { mot: "loi", syllabes: ["loi"], bonneSyllabe: "loi" },
  { mot: "soir", syllabes: ["soir"], bonneSyllabe: "soir" },
  { mot: "foi", syllabes: ["foi"], bonneSyllabe: "foi" },
];

const SONS_IMAGES_PAR_SON: Record<string, ItemSonsImages[]> = {
  m: SONS_IMAGES_M,
  l: SONS_IMAGES_L,
  r: SONS_IMAGES_R,
  s: SONS_IMAGES_S,
  n: SONS_IMAGES_N,
  p: SONS_IMAGES_P,
  t: SONS_IMAGES_T,
  f: SONS_IMAGES_F,
  v: SONS_IMAGES_V,
  ch: SONS_IMAGES_CH,
  j: SONS_IMAGES_J,
  b: SONS_IMAGES_B,
  d: SONS_IMAGES_D,
  g: SONS_IMAGES_G,
  z: SONS_IMAGES_Z,
  "c-k": SONS_IMAGES_CK,
  ou: SONS_IMAGES_OU,
  on: SONS_IMAGES_ON,
  in: SONS_IMAGES_IN,
  an: SONS_IMAGES_AN,
  oi: SONS_IMAGES_OI,
};

export function getSonsImagesItemsPourSon(sonId: string): ItemSonsImages[] {
  const list = SONS_IMAGES_PAR_SON[sonId];
  if (!list) return [];
  return [...list];
}
