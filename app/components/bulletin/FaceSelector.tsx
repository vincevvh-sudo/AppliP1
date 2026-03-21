"use client";

import type { NiveauAcquisition } from "../../data/bulletin-storage";

const LABELS: Record<NonNullable<NiveauAcquisition>, string> = {
  acquis: "Acquis",
  en_cours: "En cours",
  non_acquis: "Non acquis",
};

type Props = {
  value: NiveauAcquisition;
  onChange: (v: NiveauAcquisition) => void;
  columnLabel: string; // "Enfant" | "Enseignant"
};

export function FaceSelector({ value, onChange, columnLabel }: Props) {
  return (
    <div className="flex flex-col items-center gap-0.5 bulletin-face-selector">
      <span className="text-[10px] font-medium text-[#2d4a3e]/80">{columnLabel}</span>
      <div className="flex items-center gap-0.5 rounded-lg border border-[#2d4a3e]/20 bg-white/80 p-0.5">
        {(["acquis", "en_cours", "non_acquis"] as const).map((niveau) => (
          <button
            key={niveau}
            type="button"
            title={LABELS[niveau]}
            onClick={() => onChange(value === niveau ? null : niveau)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg transition ${
              value === niveau
                ? "bg-[#4a7c5a]/20 ring-1 ring-[#4a7c5a]/50"
                : "hover:bg-[#2d4a3e]/5"
            }`}
          >
            {niveau === "acquis" && "😊"}
            {niveau === "en_cours" && "😐"}
            {niveau === "non_acquis" && "😞"}
          </button>
        ))}
      </div>
    </div>
  );
}
