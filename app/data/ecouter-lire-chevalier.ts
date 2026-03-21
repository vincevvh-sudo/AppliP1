/**
 * Test écouter-lire "Le chevalier de la nuit" — 10 phrases Vrai/Faux.
 * Corriger les réponses attendues selon l'histoire si besoin.
 */

export const TITRE_CHEVALIER = "Le chevalier de la nuit";

export type ItemChevalier = { phrase: string; correct: boolean };

export const ITEMS_CHEVALIER: ItemChevalier[] = [
  { phrase: "Le petit garçon s'appelle Léon.", correct: true },
  { phrase: "Le lapin a peur des sangliers de la forêt.", correct: false },
  { phrase: "Le renard a peur d'un bruit terrible.", correct: true },
  { phrase: "L'écureuil a peur des chasseurs de la forêt.", correct: true },
  { phrase: "Il y a même un loup qui vient dormir contre le chevalier.", correct: true },
  { phrase: "Le petit garçon se réveille trois fois pendant la nuit.", correct: true },
  { phrase: "Tous les animaux se cachent sous le lit.", correct: false },
  { phrase: "Le petit garçon veut bien prêter son chevalier.", correct: true },
  { phrase: "Le lendemain matin, c'est le papa qui réveille le petit garçon.", correct: false },
  { phrase: "Le petit garçon accueille les peluches dans son lit.", correct: true },
];
