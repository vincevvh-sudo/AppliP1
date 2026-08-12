import { NextRequest, NextResponse } from "next/server";
import {
  generateBulletinComment,
  niveauLabelFr,
} from "../../../lib/gemini-bulletin";

export async function POST(request: NextRequest) {
  let body: { text: string; libelle?: string; niveau?: string; style?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { text, libelle, niveau, style: styleRaw } = body;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text requis" }, { status: 400 });
  }

  const style = styleRaw === "mois" ? "mois" : "attendu";
  const niveauLabel = niveauLabelFr(niveau);
  const contextLines = [
    libelle
      ? style === "mois"
        ? `Période / commentaire : « ${libelle} »`
        : `Attendu : « ${libelle} »`
      : "",
    niveauLabel ? `Niveau : ${niveauLabel}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt =
    style === "mois"
      ? `Tu es un enseignant de primaire (CP/CE1) qui reformule le COMMENTAIRE DE BILAN DU MOIS d'un bulletin scolaire en français, adressé à l'enfant (tutoiement).

${contextLines ? `${contextLines}\n` : ""}
Ébauche dictée ou notée par l'enseignant :
« ${text.trim()} »

Consigne :
- Réécris en 2 à 4 phrases COMPLÈTES, correctes, bienveillantes et professionnelles.
- C'est un résumé global du mois (pas un seul attendu).
- Garde le sens de l'ébauche.
- Chaque phrase doit être entière et se terminer par un point (jamais de texte coupé).
- Environ 40 à 90 mots au total.
- Réponds uniquement par ces phrases, sans guillemets, sans titre, sans explication.`
      : `Tu es un enseignant de primaire (CP/CE1) qui reformule un commentaire de bulletin en français, adressé à l'enfant (tutoiement).

${contextLines ? `${contextLines}\n` : ""}
Ébauche dictée ou notée par l'enseignant :
« ${text.trim()} »

Consigne :
- Réécris cette idée en UNE seule phrase complète, correcte, bienveillante et professionnelle.
- Garde le sens de l'ébauche (ne change pas le message).
- La phrase doit être ENTIÈRE et se terminer par un point (jamais coupée au milieu, jamais du type « Tu fais preuve » sans suite).
- Environ 12 à 30 mots.
- Réponds uniquement par cette phrase, sans guillemets, sans titre, sans explication.`;

  const result = await generateBulletinComment(prompt, { style });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ suggestion: result.text || text.trim() });
}
