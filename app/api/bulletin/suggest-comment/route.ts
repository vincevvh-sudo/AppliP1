import { NextRequest, NextResponse } from "next/server";
import {
  generateBulletinComment,
  niveauLabelFr,
} from "../../../lib/gemini-bulletin";

export async function POST(request: NextRequest) {
  let body: { libelle: string; niveau: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { libelle, niveau } = body;
  if (!libelle || typeof libelle !== "string") {
    return NextResponse.json({ error: "libelle requis" }, { status: 400 });
  }

  const niveauLabel = niveauLabelFr(niveau) || "non renseigné";

  const prompt = `Tu es un enseignant de primaire (CP/CE1) qui rédige un commentaire de bulletin en français, adressé à l'enfant (tutoiement).

Attendu évalué : « ${libelle} »
Niveau : ${niveauLabel}

Rédige UNE seule phrase complète, claire et bienveillante (environ 12 à 25 mots), qui se termine obligatoirement par un point.
La phrase doit être finie : pas de formulation coupée du type « Tu fais preuve » ou « Tu es capable de ».
Réponds uniquement par cette phrase, sans guillemets, sans titre, sans explication.`;

  const result = await generateBulletinComment(prompt);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ suggestion: result.text });
}
