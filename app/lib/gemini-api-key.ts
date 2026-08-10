/**
 * Clé API Gemini pour les routes serveur (bulletins).
 * Ordre de lecture : préférer GEMINI_API_KEY (non exposée au navigateur).
 */

export function getGeminiApiKeyFromEnv(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_API_KEY,
    // Compat : certains projets n’ont que la variable « public » (moins idéal pour la sécurité)
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ];
  for (const raw of candidates) {
    const t = raw?.trim().replace(/^["']|["']$/g, "");
    if (t) return t;
  }
  return undefined;
}
