/**
 * Synchronisation du gabarit global des sections/attendus (côté enseignant).
 *
 * Objectif (option A) :
 * - les modifications d'attendus sont stockées dans Supabase (source de vérité),
 * - l'enseignant recharge ce gabarit au chargement,
 * - les prochains bulletins envoyés utilisent automatiquement la version à jour.
 *
 * NOTE : les bulletins déjà envoyés restent une "snapshot" (comportement accepté pour l'option A).
 */

import { supabase } from "../../utils/supabase";
import type { SectionAttendus } from "./bulletin-storage";
import { getSections, setSections } from "./bulletin-storage";

const TEMPLATE_TABLE = "bulletin_sections_template";
const TEMPLATE_ID = "default";

export async function loadBulletinSectionsTemplate(): Promise<SectionAttendus[] | null> {
  // On fait un `limit(1)` pour ne pas déclencher une erreur Supabase
  // quand il n'existe pas encore de ligne pour `TEMPLATE_ID`.
  const { data, error } = await supabase
    .from(TEMPLATE_TABLE)
    .select("sections")
    .eq("id", TEMPLATE_ID)
    .limit(1);

  if (error) {
    // En cas de table manquante / erreurs RLS, on laisse le localStorage faire fallback.
    const anyErr = error as any;
    console.error("loadBulletinSectionsTemplate error:", {
      message: anyErr?.message,
      code: anyErr?.code,
      details: anyErr?.details,
      hint: anyErr?.hint,
      status: anyErr?.status,
      name: anyErr?.name,
      raw: error,
      errorKeys: Object.keys(anyErr ?? {}),
      errorProps: Object.getOwnPropertyNames(anyErr ?? {}),
    });
    return null;
  }

  const row = Array.isArray(data) ? data[0] : undefined;
  if (!row?.sections || !Array.isArray(row.sections)) return null;
  return row.sections as SectionAttendus[];
}

export async function upsertBulletinSectionsTemplate(sections: SectionAttendus[]): Promise<void> {
  const { error } = await supabase.from(TEMPLATE_TABLE).upsert(
    {
      id: TEMPLATE_ID,
      sections,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

/**
 * Charge le gabarit global depuis Supabase et l'injecte dans le localStorage
 * (via setSections). Si Supabase ne renvoie rien, on push la version locale.
 */
export async function syncBulletinSectionsTemplateToLocalStorage(): Promise<SectionAttendus[]> {
  const globalSections = await loadBulletinSectionsTemplate();
  if (globalSections) {
    setSections(globalSections);
    return globalSections;
  }

  const localSections = getSections();
  try {
    await upsertBulletinSectionsTemplate(localSections);
  } catch (e) {
    // Si push impossible, on conserve la version locale.
    console.error("syncBulletinSectionsTemplateToLocalStorage upsert failed:", e);
  }
  return localSections;
}

export async function pushLocalBulletinSectionsTemplateToSupabase(): Promise<void> {
  const localSections = getSections();
  await upsertBulletinSectionsTemplate(localSections);
}

