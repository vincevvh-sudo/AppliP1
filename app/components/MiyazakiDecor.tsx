"use client";

/**
 * Fond de page « forêt magique » — image en CSS (cover) plutôt que next/image en fill,
 * pour éviter les sauts / reflows au chargement (mobile, barre d’adresse, CLS).
 */
export function ForetMagiqueBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden bg-[#1a2e22] [transform:translateZ(0)]"
      style={{
        backgroundImage: "url(/images/foret-magique.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#1a3324]/20 via-transparent to-[#1a3324]/30"
        aria-hidden
      />
    </div>
  );
}
