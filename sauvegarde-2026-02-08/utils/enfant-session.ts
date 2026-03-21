const ENFANT_SESSION_KEY = "enfant_session";

export type EnfantSession = {
  id: number;
  prenom: string;
  nom: string;
};

export function getEnfantSession(): EnfantSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(ENFANT_SESSION_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as EnfantSession;
    return parsed.id && parsed.prenom ? parsed : null;
  } catch {
    return null;
  }
}

export function setEnfantSession(e: EnfantSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ENFANT_SESSION_KEY, JSON.stringify(e));
}

export function clearEnfantSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ENFANT_SESSION_KEY);
}
