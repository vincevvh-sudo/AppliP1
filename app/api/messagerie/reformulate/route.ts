import { NextRequest, NextResponse } from "next/server";
import { generateBulletinComment } from "../../../lib/gemini-bulletin";

/**
 * Reformule un brouillon de message enseignant → parents / famille.
 * Réutilise le client Gemini du bulletin (même clé API).
 */
export async function POST(request: NextRequest) {
  let body: { text?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text requis" }, { status: 400 });
  }

  const context =
    typeof body.context === "string" && body.context.trim()
      ? `Contexte de la conversation : « ${body.context.trim()} »\n`
      : "";

  const prompt = `Tu es un enseignant de primaire (1re primaire / CP) qui reformule un MESSAGE destiné aux parents (ou à la famille), en français.

${context}
Ébauche dictée ou notée par l'enseignant :
« ${text} »

Consigne :
- Réécris en 1 à 4 phrases COMPLÈTES, correctes, claires et professionnelles.
- Tutoiement ou vouvoiement : privilégie le vouvoiement (« vous ») adapté aux parents, sauf si l'ébauche tutoyait clairement.
- Ton bienveillant, concret, sans jargon inutile.
- Garde le sens de l'ébauche (ne change pas le message).
- Chaque phrase doit être entière et se terminer par un point (jamais de texte coupé).
- Environ 30 à 100 mots au total.
- Réponds uniquement par ces phrases, sans guillemets, sans titre, sans explication.`;

  // style "mois" : nettoyage multi-phrases (pas une seule phrase tronquée)
  const result = await generateBulletinComment(prompt, { style: "mois" });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ suggestion: result.text || text });
}
