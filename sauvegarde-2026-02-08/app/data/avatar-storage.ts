const PREFIX = "rdl-avatar-";
const PHOTO_PREFIX = "rdl-avatar-photo-";

export function getAvatarFromStorage(eleveId: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX + eleveId);
  } catch {
    return null;
  }
}

export function setAvatarInStorage(eleveId: number, json: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + eleveId, json);
  } catch {
    // ignore
  }
}

export function getAvatarPhotoFromStorage(eleveId: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PHOTO_PREFIX + eleveId);
  } catch {
    return null;
  }
}

export function setAvatarPhotoInStorage(eleveId: number, urlOrData: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (urlOrData) localStorage.setItem(PHOTO_PREFIX + eleveId, urlOrData);
    else localStorage.removeItem(PHOTO_PREFIX + eleveId);
  } catch {
    // ignore
  }
}
