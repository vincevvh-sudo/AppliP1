"use client";

import Image from "next/image";

/** Fond de page avec l'image de forêt magique (watercolor, rivière, champignons lumineux) */
export function ForetMagiqueBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src="/images/foret-magique.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#1a3324]/20 via-transparent to-[#1a3324]/30"
        aria-hidden
      />
    </div>
  );
}