import { NextRequest, NextResponse } from "next/server";
import { corrigerOrthographeSeule } from "../../../lib/gemini-bulletin";

/**
 * Corrige uniquement l’orthographe / les accents d’un intitulé d’horaire.
 * Ne reformule pas.
 */
export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text requis" }, { status: 400 });
  }

  const result = await corrigerOrthographeSeule(text);
  if (!result.ok) {
    return NextResponse.json({ text }, { status: 200 });
  }
  return NextResponse.json({ text: result.text || text });
}
