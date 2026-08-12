import { NextRequest, NextResponse } from "next/server";
import {
  generateBulletinComment,
  niveauLabelFr,
} from "../../../lib/gemini-bulletin";

export async function POST(request: NextRequest) {
  let body: { text: string; libelle?: string; niveau?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { text, libelle, niveau } = body;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text requis" }, { status: 400 });
  }

  const niveauLabel = niveauLabelFr(niveau);
  const contextLines = [
    libelle ? `Attendu : « ${libelle} »` : "",
    niveauLabel ? `Niveau : ${niveauLabel}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Tu es un enseignant de primaire (CP/CE1) qui reformule un commentaire de bulletin en français, adressé à l'enfant (tutoiement).

${contextLines ? `${contextLines}\n` : ""}
Ébauche dictée ou notée par l'enseignant :
« ${text.trim()} »

Consigne :
- Réécris cette idée en UNE seule phrase complète, correcte, bienveillante et professionnelle.
- Garde le sens de l'ébauche (ne change pas le message).
- La phrase doit être ENTIÈRE et se terminer par un point (jamais coupée au milieu, jamais du type « Tu fais preuve » sans suite).
- Environ 12 à 30 mots.
- Réponds uniquement par cette phrase, sans guillemets, sans titre, sans explication.`;

  const result = await generateBulletinComment(prompt);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ suggestion: result.text || text.trim() });
}
