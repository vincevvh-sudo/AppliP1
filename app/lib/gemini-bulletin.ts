/**
 * Appels Gemini pour les commentaires de bulletin (suggestion / reformulation).
 * Important : Gemini 2.5 consomme des tokens de « thinking » dans maxOutputTokens —
 * un plafond trop bas coupe les phrases au milieu.
 */

import { getGeminiApiKeyFromEnv } from "./gemini-api-key";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] as const;

export function getGeminiErrorMessage(status: number, errText: string): string {
  if (status === 400) return "Requête invalide. Vérifiez que la clé API Gemini est correcte.";
  if (status === 401 || status === 403) {
    return "Clé API Gemini invalide ou refusée. Vérifiez .env.local et recréez une clé sur aistudio.google.com/app/apikey";
  }
  if (status === 429) return "Quota Gemini dépassé. Réessayez plus tard.";
  try {
    const json = JSON.parse(errText) as { error?: { message?: string } };
    const msg = (json.error?.message ?? "").toLowerCase();
    if (msg.includes("api key") || msg.includes("invalid api key")) {
      return "Clé API invalide. Vérifiez GEMINI_API_KEY dans .env.local.";
    }
    if (msg.includes("has not been used") || msg.includes("enable") || msg.includes("activate")) {
      return "Activez l'API Gemini : Google Cloud Console → APIs & Services → Enable 'Generative Language API'.";
    }
    if (msg.includes("quota") || msg.includes("resource exhausted")) {
      return "Quota dépassé. Réessayez plus tard.";
    }
    const raw = json.error?.message ?? "";
    if (raw.length > 0 && raw.length < 150) return raw;
  } catch {
    // ignore
  }
  return "Erreur lors de l'appel à Gemini. Vérifiez la clé API et réessayez.";
}

function extractText(data: {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
}): { text: string; finishReason?: string } {
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  // Ignorer les parts de « thinking » si présentes ; garder le texte visible
  const text = parts
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text!.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  // Fallback : tout concaténer si le filtre a tout exclu
  const fallback =
    text ||
    parts
      .map((p) => (typeof p.text === "string" ? p.text.trim() : ""))
      .filter(Boolean)
      .join(" ")
      .trim();
  return { text: fallback, finishReason: candidate?.finishReason };
}

/** Nettoie la réponse modèle : guillemets, espaces, force une phrase complète si possible. */
export function cleanBulletinPhrase(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^["«»']+|["«»']+$/g, "").trim();
  // Enlever préambules du type "Voici une reformulation :"
  t = t.replace(/^(voici|suggestion|reformulation|commentaire)\s*[:：]\s*/i, "").trim();
  t = t.replace(/\s+/g, " ");
  // Une seule phrase si le modèle en a mis plusieurs
  const firstSentence = t.match(/^[\s\S]+?[.!?…](?=\s|$)/);
  if (firstSentence) t = firstSentence[0].trim();
  return t;
}

export function looksTruncated(text: string): boolean {
  const t = text.trim();
  if (!t || t === "—") return true;
  if (t.length < 12) return true;
  // Pas de ponctuation finale forte
  if (!/[.!?…]$/.test(t)) return true;
  // Finit par un mot de liaison / début de construction inachevée
  if (/\b(de|du|des|le|la|les|un|une|et|ou|à|au|aux|en|pour|par|avec|sans|que|qui|dont|tu|il|elle|nous|vous|ils|elles|fais|fait|preuve)\s*$/i.test(t)) {
    return true;
  }
  return false;
}

type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; error: string; status: number };

export async function generateBulletinComment(prompt: string): Promise<GenerateResult> {
  const apiKey = getGeminiApiKeyFromEnv();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local pour activer les suggestions.",
    };
  }

  const key = apiKey.replace(/^["']|["']$/g, "").trim();
  // maxOutputTokens élevé : Gemini 2.5 réserve une partie au thinking.
  // thinkingBudget: 0 désactive le thinking quand le modèle le permet.
  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.45,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  // Corps sans thinkingConfig pour les modèles plus anciens
  const geminiBodyLegacy = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.45,
    },
  });

  let lastError = "";
  for (const model of GEMINI_MODELS) {
    for (const body of [geminiBody, geminiBodyLegacy]) {
      try {
        const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (!res.ok) {
          const errText = await res.text();
          lastError = getGeminiErrorMessage(res.status, errText);
          // thinkingConfig non supporté → essayer le body legacy
          if (
            body === geminiBody &&
            (res.status === 400 || errText.toLowerCase().includes("thinking"))
          ) {
            continue;
          }
          if (res.status === 404 || errText.includes("not found") || errText.includes("Invalid model")) {
            break; // prochain modèle
          }
          return { ok: false, status: 502, error: lastError };
        }

        const data = (await res.json()) as Parameters<typeof extractText>[0];
        let { text } = extractText(data);
        text = cleanBulletinPhrase(text);

        if (!text) {
          lastError = "Réponse vide de Gemini.";
          continue;
        }

        // Si coupé (MAX_TOKENS / phrase incomplète), un second essai avec body legacy + prompt rappel
        if (looksTruncated(text)) {
          const retryPrompt = `${prompt}

IMPORTANT : ta réponse précédente était incomplète (« ${text} »). Réécris UNE phrase COMPLÈTE qui se termine par un point.`;
          const retryRes = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: retryPrompt }] }],
              generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.35,
              },
            }),
          });
          if (retryRes.ok) {
            const retryData = (await retryRes.json()) as Parameters<typeof extractText>[0];
            const retryText = cleanBulletinPhrase(extractText(retryData).text);
            if (retryText && !looksTruncated(retryText)) {
              return { ok: true, text: retryText };
            }
            if (retryText && retryText.length > text.length) {
              return { ok: true, text: retryText };
            }
          }
        }

        return { ok: true, text };
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Erreur réseau";
      }
    }
  }

  return {
    ok: false,
    status: 502,
    error: lastError || "Aucun modèle Gemini disponible. Vérifiez la clé sur aistudio.google.com/app/apikey",
  };
}

export function niveauLabelFr(niveau: string | undefined): string {
  if (niveau === "acquis") return "acquis";
  if (niveau === "en_cours") return "en cours d'acquisition";
  if (niveau === "non_acquis") return "non acquis";
  return "";
}
