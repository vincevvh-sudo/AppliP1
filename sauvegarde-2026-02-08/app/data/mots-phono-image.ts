/**
 * Phono-image : une image, on dit le mot, l'enfant clique sur la LETTRE qu'il entend.
 * Mots représentatifs d'un seul son (pas "petit" pour E car il a aussi I).
 */

import type { Son } from "./sons-data";

/** Mots avec emoji - chaque mot est associé à UN seul son de manière claire. */
export const MOTS_PHONO_IMAGE: Record<string, { mot: string; emoji: string }[]> = {
  i: [
    { mot: "ici", emoji: "👆" },
    { mot: "lit", emoji: "🛏️" },
    { mot: "riz", emoji: "🍚" },
    { mot: "gris", emoji: "🐁" },
    { mot: "souris", emoji: "🐭" },
    { mot: "iris", emoji: "🌸" },
    { mot: "midi", emoji: "☀️" },
    { mot: "lilas", emoji: "💜" },
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
  ],
  o: [
    { mot: "dos", emoji: "🎒" },
    { mot: "vélo", emoji: "🚲" },
    { mot: "photo", emoji: "📷" },
    { mot: "auto", emoji: "🚗" },
    { mot: "zéro", emoji: "0️⃣" },
    { mot: "zoo", emoji: "🦁" },
    { mot: "radio", emoji: "📻" },
  ],
  e: [
    { mot: "regard", emoji: "👀" },
    { mot: "fenêtre", emoji: "🪟" },
    { mot: "mercredi", emoji: "📅" },
    { mot: "de", emoji: "➡️" },
    { mot: "je", emoji: "👤" },
    { mot: "le", emoji: "📄" },
  ],
  u: [
    { mot: "lune", emoji: "🌙" },
    { mot: "rue", emoji: "🛤️" },
    { mot: "jus", emoji: "🧃" },
    { mot: "bus", emoji: "🚌" },
    { mot: "pull", emoji: "🧥" },
    { mot: "nuage", emoji: "☁️" },
  ],
  "e-accent": [
    { mot: "été", emoji: "☀️" },
    { mot: "école", emoji: "🏫" },
    { mot: "père", emoji: "👨" },
    { mot: "mère", emoji: "👩" },
    { mot: "rêve", emoji: "💭" },
    { mot: "fête", emoji: "🎉" },
  ],
  m: [
    { mot: "miel", emoji: "🍯" },
    { mot: "mur", emoji: "🧱" },
    { mot: "marteau", emoji: "🔨" },
    { mot: "mot", emoji: "✉️" },
    { mot: "midi", emoji: "☀️" },
    { mot: "pomme", emoji: "🍎" },
    { mot: "tomate", emoji: "🍅" },
  ],
  l: [
    { mot: "lune", emoji: "🌙" },
    { mot: "lit", emoji: "🛏️" },
    { mot: "lait", emoji: "🥛" },
    { mot: "lilas", emoji: "💜" },
    { mot: "vélo", emoji: "🚲" },
    { mot: "lézard", emoji: "🦎" },
    { mot: "lavabo", emoji: "🚿" },
    { mot: "balle", emoji: "⚾" },
  ],
  r: [
    { mot: "rat", emoji: "🐀" },
    { mot: "riz", emoji: "🍚" },
    { mot: "rue", emoji: "🛤️" },
    { mot: "robot", emoji: "🤖" },
    { mot: "radio", emoji: "📻" },
    { mot: "règle", emoji: "📏" },
    { mot: "repas", emoji: "🍽️" },
  ],
  s: [
    { mot: "sac", emoji: "👜" },
    { mot: "salade", emoji: "🥗" },
    { mot: "soleil", emoji: "☀️" },
    { mot: "serpent", emoji: "🐍" },
    { mot: "sel", emoji: "🧂" },
    { mot: "sport", emoji: "⚽" },
    { mot: "sirop", emoji: "🍯" },
  ],
  n: [
    { mot: "nez", emoji: "👃" },
    { mot: "nature", emoji: "🌿" },
    { mot: "navet", emoji: "🥬" },
    { mot: "nuage", emoji: "☁️" },
    { mot: "nid", emoji: "🐦" },
    { mot: "note", emoji: "📝" },
  ],
  p: [
    { mot: "pain", emoji: "🍞" },
    { mot: "pomme", emoji: "🍎" },
    { mot: "porte", emoji: "🚪" },
    { mot: "pizza", emoji: "🍕" },
    { mot: "père", emoji: "👨" },
    { mot: "pote", emoji: "🤝" },
    { mot: "pompe", emoji: "🚿" },
    { mot: "piste", emoji: "🛷" },
    { mot: "pastèque", emoji: "🍉" },
  ],
  t: [
    { mot: "tomate", emoji: "🍅" },
    { mot: "tapis", emoji: "🪔" },
    { mot: "table", emoji: "🪑" },
    { mot: "télé", emoji: "📺" },
  ],
  f: [
    { mot: "feu", emoji: "🔥" },
    { mot: "fusée", emoji: "🚀" },
    { mot: "filet", emoji: "🕸️" },
    { mot: "fleur", emoji: "🌸" },
    { mot: "fromage", emoji: "🧀" },
    { mot: "four", emoji: "🧱" },
  ],
  v: [
    { mot: "vélo", emoji: "🚲" },
    { mot: "vache", emoji: "🐄" },
    { mot: "vent", emoji: "💨" },
    { mot: "ville", emoji: "🏙️" },
    { mot: "vase", emoji: "🏺" },
    { mot: "voiture", emoji: "🚗" },
  ],
  ch: [
    { mot: "chat", emoji: "🐱" },
    { mot: "chien", emoji: "🐕" },
    { mot: "chocolat", emoji: "🍫" },
    { mot: "cheval", emoji: "🐴" },
    { mot: "chapeau", emoji: "🎩" },
  ],
  j: [
    { mot: "jupe", emoji: "👗" },
    { mot: "jus", emoji: "🧃" },
    { mot: "jeu", emoji: "🎲" },
    { mot: "jambon", emoji: "🥪" },
    { mot: "jardin", emoji: "🌳" },
    { mot: "jaune", emoji: "🟡" },
  ],
  b: [
    { mot: "ballon", emoji: "⚽" },
    { mot: "brosse", emoji: "🪥" },
    { mot: "balai", emoji: "🧹" },
    { mot: "balle", emoji: "⚾" },
    { mot: "bateau", emoji: "⛵" },
    { mot: "beau", emoji: "✨" },
  ],
  d: [
    { mot: "dé", emoji: "🎲" },
    { mot: "drapeau", emoji: "🚩" },
    { mot: "dur", emoji: "🪨" },
    { mot: "dame", emoji: "👩" },
    { mot: "déjà", emoji: "⏰" },
    { mot: "dos", emoji: "🎒" },
  ],
  g: [
    { mot: "gare", emoji: "🚂" },
    { mot: "gomme", emoji: "🧽" },
    { mot: "gâteau", emoji: "🎂" },
    { mot: "gris", emoji: "🐁" },
    { mot: "gros", emoji: "🐘" },
    { mot: "gorge", emoji: "🍫" },
  ],
  z: [
    { mot: "zéro", emoji: "0️⃣" },
    { mot: "zoo", emoji: "🦁" },
    { mot: "zèbre", emoji: "🦓" },
  ],
  "c-k": [
    { mot: "car", emoji: "🚗" },
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
    { mot: "four", emoji: "🧱" },
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

/** Mot + emoji pour phono-image, un par son. Pas de répétition de mot (cyclage si nécessaire). */
export function getMotsPhonoImagePourSerie(
  sons: Son[],
  niveauNumero: number
): { mot: string; emoji: string; sonCible: Son }[] {
  const result: { mot: string; emoji: string; sonCible: Son }[] = [];
  const motsDejaVus = new Set<string>();
  for (const s of sons) {
    const list = MOTS_PHONO_IMAGE[s.id] ?? [];
    if (!list.length) continue;
    const mid = Math.ceil(list.length / 2);
    const part = niveauNumero === 2 && list.length > 1 ? list.slice(mid) : list.slice(0, mid);
    const disponibles = part.filter((p) => !motsDejaVus.has(p.mot));
    const pool = disponibles.length > 0 ? disponibles : part;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      motsDejaVus.add(pick.mot);
      result.push({ ...pick, sonCible: s });
    }
  }
  return result.sort(() => Math.random() - 0.5);
}
