"use client";

import { useEffect } from "react";
import { getEnfantSession } from "../../utils/enfant-session";
import {
  markEnfantSectionSeenNow,
  type EnfantSectionKey,
} from "../data/enfant-nouveautes";

/** Marque une section comme « vue » pour enlever la pastille rouge sur l’accueil. */
export function useMarkEnfantSectionSeen(section: EnfantSectionKey) {
  useEffect(() => {
    const s = getEnfantSession();
    if (!s) return;
    void markEnfantSectionSeenNow(s.id, section);
  }, [section]);
}
