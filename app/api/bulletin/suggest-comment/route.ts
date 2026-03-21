import { NextRequest, NextResponse } from "next/server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] as const;

function getGeminiErrorMessage(status: number, errText: string): string {
  if (status === 400) return "Requête invalide. Vérifiez que la clé API Gemini est correcte.";
  if (status === 401 || status === 403) return "Clé API Gemini invalide ou refusée. Vérifiez .env.local et recréez une clé sur aistudio.google.com/app/apikey";
  if (status === 429) return "Quota Gemini dépassé. Réessayez plus tard.";
  try {
    const json = JSON.parse(errText) as { error?: { message?: string } };
    const msg = (json.error?.message ?? "").toLowerCase();
    if (msg.includes("api key") || msg.includes("invalid api key")) return "Clé API invalide. Vérifiez GEMINI_API_KEY dans .env.local.";
    if (msg.includes("has not been used") || msg.includes("enable") || msg.includes("activate")) return "Activez l'API Gemini : Google Cloud Console → APIs & Services → Enable 'Generative Language API' pour le projet de ta clé.";
    if (msg.includes("quota") || msg.includes("resource exhausted")) return "Quota dépassé. Réessayez plus tard.";
    const raw = json.error?.message ?? "";
    if (raw.length > 0 && raw.length < 150) return raw;
  } catch {
    // ignore
  }
  return "Erreur lors de l'appel à Gemini. Vérifiez la clé API et réessayez.";
}

export async function POST(request: NextRequest) {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local pour activer les suggestions." },
      { status: 503 }
    );
  }

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

  const niveauLabel =
    niveau === "acquis"
      ? "acquis"
      : niveau === "en_cours"
        ? "en cours d'acquisition"
        : niveau === "non_acquis"
          ? "non acquis"
          : "non renseigné";

  const prompt = `Tu es un enseignant rédigeant un bulletin scolaire en français. Pour l'attendu suivant, rédige UNE SEULE phrase courte et bienveillante (max 15-20 mots) pour un commentaire de bulletin. L'attendu : "${libelle}". Niveau choisi : ${niveauLabel}. Réponds uniquement par cette phrase, sans guillemets ni préambule.`;

  const key = apiKey.replace(/^["']|["']$/g, "").trim();
  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 100,
      temperature: 0.5,
    },
  });

  let lastError = "";
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: geminiBody,
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = getGeminiErrorMessage(res.status, errText);
        if (res.status === 404 || errText.includes("not found") || errText.includes("Invalid model")) {
          continue;
        }
        return NextResponse.json({ error: lastError }, { status: 502 });
      }

      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> }
        }>
      };
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      return NextResponse.json({ suggestion: text || "—" });
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Erreur réseau";
    }
  }

  return NextResponse.json(
    { error: lastError || "Aucun modèle Gemini disponible. Vérifiez la clé sur aistudio.google.com/app/apikey" },
    { status: 502 }
  );
}
