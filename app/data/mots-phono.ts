/**
 * Mots pour les exercices de conscience phonologique (phono 1/2)
 * Chaque son a une liste de mots où le phonème apparaît.
 */

import type { Son } from "./sons-data";

const MOTS_PAR_SON: Record<string, string[]> = {
  i: ["lit", "riz", "midi", "iris", "image", "ici", "hibou", "lilas"],
  a: ["rat", "sac", "chat", "âne", "âne", "papa", "maman", "salade"],
  o: ["mot", "dos", "os", "photo", "robot", "auto", "zéro", "ôter"],
  e: ["de", "je", "le", "petit", "regard", "mercredi", "fenêtre"],
  u: ["lune", "rue", "vu", "jus", "pull", "bus", "numéro", "nuage"],
  "e-accent": ["été", "école", "élève", "être", "père", "mère", "rêve", "fête"],
  m: ["ma", "maman", "miel", "moto", "mouton", "melon"],
  l: ["lune", "lit", "loup", "lilas", "lait", "école", "ballon"],
  r: ["rat", "riz", "rue", "robot", "radio", "raquette", "rhume"],
  s: ["sac", "salade", "soleil", "salut", "serpent", "sandwich"],
  n: ["piscine", "piscine", "noix", "nature", "note", "navet", "nuage"],
  p: ["pain", "papa", "pomme", "poule", "porte", "pédale"],
  t: ["toi", "tu", "tapis", "table", "tomate", "télé", "taper"],
  f: ["feu", "fête", "fois", "forêt", "fusée", "filet", "frais"],
  v: ["vélo", "vache", "voix", "vol", "vent", "ville", "vert"],
  ch: ["chat", "chapeau", "chèvre", "chant", "chocolat", "cheval"],
  j: ["jupe", "jouer", "jus", "jardin", "jeu", "juillet"],
  b: ["bébé", "ballon", "boîte", "banane", "brosse", "bulle"],
  d: ["dos", "doigt", "dé", "dimanche", "domino", "drapeau"],
  g: ["gare", "gant", "gomme", "gâteau", "girafe", "garage"],
  z: ["zéro", "zoo", "zone", "zèbre", "zizi"],
  "c-k": ["car", "canard", "coq", "kilo", "képi", "camion", "carte"],
  ou: ["loup", "cou", "tout", "four", "jour", "souris", "vous"],
  oi: ["poisson", "roi", "moi", "oiseau", "foi", "toi", "soif"],
  on: ["pont", "maison", "ballon", "savon", "citron", "poisson"],
  an: ["maman", "papa", "enfant", "pantalon", "orange", "vent"],
  in: ["lapin", "matin", "pain", "main", "train", "bain"],
  et: ["et", "billet", "poulet", "navet", "secret", "cabinet", "piolet", "basket"],
};

export function getMotsPhono(son: Son, count = 8): string[] {
  const mots = MOTS_PAR_SON[son.id] ?? [];
  return [...mots].sort(() => Math.random() - 0.5).slice(0, count);
}

/** Un mot aléatoire pour un son. */
export function getMotAleatoire(son: Son): string {
  const mots = MOTS_PAR_SON[son.id] ?? [];
  return mots[Math.floor(Math.random() * mots.length)] ?? "";
}

/** Mot pour un niveau donné : niveau 1 = première moitié, niveau 2 = seconde moitié (pas de doublon entre Phono image 1 et 2). indexInSerie pour varier à chaque occurrence. */
export function getMotPourNiveau(son: Son, niveauNumero: number, indexInSerie = 0): string {
  const mots = [...new Set(MOTS_PAR_SON[son.id] ?? [])];
  if (!mots.length) return "";
  const mid = Math.ceil(mots.length / 2);
  const part = niveauNumero === 2 && mots.length > 1 ? mots.slice(mid) : mots.slice(0, mid);
  return part[indexInSerie % part.length] ?? part[0];
}

/** Retourne un mot par son dans la série, sans répétition (pour écriture, etc.). */
export function getMotsPhonoPourSerie(sons: Son[], niveauNumero = 1): string[] {
  const result: string[] = [];
  const motsDejaVus = new Set<string>();
  for (const s of sons) {
    const list = [...new Set(MOTS_PAR_SON[s.id] ?? [])];
    if (!list.length) continue;
    const mid = Math.ceil(list.length / 2);
    const part = niveauNumero === 2 && list.length > 1 ? list.slice(mid) : list.slice(0, mid);
    const disponibles = part.filter((m) => !motsDejaVus.has(m));
    const pool = disponibles.length > 0 ? disponibles : part;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      motsDejaVus.add(pick);
      result.push(pick);
    }
  }
  return result.sort(() => Math.random() - 0.5);
}
