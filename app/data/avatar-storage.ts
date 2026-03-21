const PREFIX = "rdl-avatar-";
const PHOTO_PREFIX = "rdl-avatar-photo-";

export function getAvatarFromStorage(eleveId: number | string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX + String(eleveId));
  } catch {
    return null;
  }
}

export function setAvatarInStorage(eleveId: number | string, json: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + String(eleveId), json);
  } catch {
    // ignore
  }
}

export function getAvatarPhotoFromStorage(eleveId: number | string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PHOTO_PREFIX + String(eleveId));
  } catch {
    return null;
  }
}

export function setAvatarPhotoInStorage(eleveId: number | string, urlOrData: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (urlOrData) localStorage.setItem(PHOTO_PREFIX + String(eleveId), urlOrData);
    else localStorage.removeItem(PHOTO_PREFIX + String(eleveId));
  } catch {
    // ignore
  }
}
