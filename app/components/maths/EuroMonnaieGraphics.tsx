"use client";

import Image from "next/image";
import type { ReactElement } from "react";

/**
 * Visuels fournis par l’enseignant (fichiers dans /public/monnaie/).
 */

const COIN_SIZE = 48;

function Piece1Euro() {
  return (
    <Image
      src="/monnaie/euro-1.png"
      alt=""
      width={COIN_SIZE}
      height={COIN_SIZE}
      className="h-12 w-12 shrink-0 rounded-full border border-black/15 object-cover shadow-sm"
      aria-hidden
    />
  );
}

function Piece2Euro() {
  return (
    <Image
      src="/monnaie/euro-2.png"
      alt=""
      width={COIN_SIZE}
      height={COIN_SIZE}
      className="h-12 w-12 shrink-0 rounded-full border border-black/15 object-cover shadow-sm"
      aria-hidden
    />
  );
}

/** Billet de 5 € (visuel rectangulaire). */
function Billet5Euro() {
  return (
    <Image
      src="/monnaie/euro-5.png"
      alt=""
      width={88}
      height={50}
      className="h-11 w-auto max-w-[5.5rem] shrink-0 rounded-sm border border-black/15 object-contain shadow-sm"
      aria-hidden
    />
  );
}

function Billet10Euro() {
  return (
    <Image
      src="/monnaie/euro-10.png"
      alt=""
      width={88}
      height={50}
      className="h-11 w-auto max-w-[5.5rem] shrink-0 rounded-sm border border-black/15 object-contain shadow-sm"
      aria-hidden
    />
  );
}

function repeatIcon(count: number, Icon: () => ReactElement, keyPrefix: string) {
  return Array.from({ length: count }, (_, i) => (
    <span key={`${keyPrefix}-${i}`} className="inline-flex items-center">
      <Icon />
    </span>
  ));
}

export function descriptionAccessibilite(q: { n1: number; n2: number; n5: number; n10: number }): string {
  const parts: string[] = [];
  if (q.n1) parts.push(`${q.n1} pièce${q.n1 > 1 ? "s" : ""} de 1 euro`);
  if (q.n2) parts.push(`${q.n2} pièce${q.n2 > 1 ? "s" : ""} de 2 euros`);
  if (q.n5) parts.push(`${q.n5} billet${q.n5 > 1 ? "s" : ""} de 5 euros`);
  if (q.n10) parts.push(`${q.n10} billet${q.n10 > 1 ? "s" : ""} de 10 euros`);
  return parts.length ? parts.join(", ") : "Aucune pièce ni billet";
}

/** Affiche toutes les pièces et billets de la question. */
export function EuroMonnaiePile({
  n1,
  n2,
  n5,
  n10,
  labelId,
}: {
  n1: number;
  n2: number;
  n5: number;
  n10: number;
  /** id d’un élément pour aria-labelledby sur la zone visuelle */
  labelId?: string;
}) {
  return (
    <div
      className="flex min-h-[3rem] flex-wrap items-center gap-2 rounded-xl border border-[#2d4a3e]/15 bg-[#faf8f3] p-3"
      role="img"
      aria-labelledby={labelId}
    >
      {repeatIcon(n1, Piece1Euro, "p1")}
      {repeatIcon(n2, Piece2Euro, "p2")}
      {repeatIcon(n5, Billet5Euro, "b5")}
      {repeatIcon(n10, Billet10Euro, "b10")}
    </div>
  );
}
