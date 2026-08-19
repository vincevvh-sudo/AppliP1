import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKeyFromEnv } from "../../../lib/gemini-api-key";
import { getGeminiErrorMessage } from "../../../lib/gemini-bulletin";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
] as const;

const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/m4a",
]);

/**
 * Transcrit un enregistrement audio (dictée enseignant, mobile inclus).
 * Body JSON : { audioBase64: string, mimeType?: string }
 */
export async function POST(request: NextRequest) {
  let body: { audioBase64?: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const audioBase64 =
    typeof body.audioBase64 === "string" ? body.audioBase64.replace(/^data:[^;]+;base64,/, "").trim() : "";
  if (!audioBase64) {
    return NextResponse.json({ error: "audioBase64 requis" }, { status: 400 });
  }

  let mimeType = typeof body.mimeType === "string" ? body.mimeType.split(";")[0].trim().toLowerCase() : "audio/webm";
  if (!ALLOWED_MIME.has(mimeType)) {
    // iOS / Chrome envoient parfois des variantes ; on normalise
    if (mimeType.includes("webm")) mimeType = "audio/webm";
    else if (mimeType.includes("mp4") || mimeType.includes("m4a")) mimeType = "audio/mp4";
    else if (mimeType.includes("ogg")) mimeType = "audio/ogg";
    else if (mimeType.includes("mpeg") || mimeType.includes("mp3")) mimeType = "audio/mpeg";
    else mimeType = "audio/webm";
  }

  const apiKey = getGeminiApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local." },
      { status: 503 }
    );
  }
  const key = apiKey.replace(/^["']|["']$/g, "").trim();

  const prompt = `Transcris fidèlement cet enregistrement audio en français.
Consigne :
- Écris uniquement le texte dicté, sans guillemets, sans titre, sans commentaire.
- Corrige la ponctuation de base si c'est naturel, mais ne reformule pas le fond.
- Si l'audio est inaudible ou vide, réponds exactement : (inaudible)`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: audioBase64 } },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.1,
    },
  };

  let lastError = "Erreur de transcription";
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        lastError = getGeminiErrorMessage(res.status, errText);
        if (res.status === 404 || errText.includes("not found") || errText.includes("Invalid model")) {
          continue;
        }
        // modèle suivant si audio non supporté
        if (res.status === 400) continue;
        return NextResponse.json({ error: lastError }, { status: 502 });
      }
      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        }>;
      };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text!.trim())
        .filter(Boolean)
        .join(" ")
        .trim();
      if (!text || text === "(inaudible)") {
        return NextResponse.json(
          { error: "Rien n'a pu être entendu. Réessaie en parlant plus près du micro." },
          { status: 422 }
        );
      }
      return NextResponse.json({ text });
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Erreur réseau";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
