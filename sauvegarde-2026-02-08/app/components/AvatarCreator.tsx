"use client";

import type { AvatarData } from "../../utils/supabase";

const HAIR_COLORS = ["e8c070", "5c4033", "2d1f1a", "a0522d", "6b4423"];
const SKIN_COLORS = ["ffdfc4", "e8c4a8", "d4a574", "c4946a", "8b6b4a"];
const SHIRT_COLORS = ["88c8e8", "6b9b7a", "e8a0b0", "c8a8d8", "ffd4a3"];

const DEFAULT_AVATAR: AvatarData = {
  hairColor: 0,
  hairCut: 0,
  eyeShape: 0,
  eyebrows: 0,
  skinColor: 0,
  nose: 0,
  mouth: 0,
  shirtColor: 0,
};

export function parseAvatarData(json: string | null | undefined): AvatarData | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Partial<AvatarData>;
    if (typeof parsed.hairColor !== "number" || typeof parsed.skinColor !== "number") return null;
    return {
      hairColor: Math.max(0, Math.min(4, parsed.hairColor ?? 0)),
      hairCut: Math.max(0, Math.min(4, parsed.hairCut ?? 0)),
      eyeShape: Math.max(0, Math.min(4, parsed.eyeShape ?? 0)),
      eyebrows: Math.max(0, Math.min(4, parsed.eyebrows ?? 0)),
      skinColor: Math.max(0, Math.min(4, parsed.skinColor ?? 0)),
      nose: Math.max(0, Math.min(4, parsed.nose ?? 0)),
      mouth: Math.max(0, Math.min(4, parsed.mouth ?? 0)),
      shirtColor: Math.max(0, Math.min(4, parsed.shirtColor ?? 0)),
    };
  } catch {
    return null;
  }
}

export function stringifyAvatarData(data: AvatarData): string {
  return JSON.stringify(data);
}

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/avataaars/svg";
const HAIR_TOPS = ["shortRound", "shaggy", "straight01", "bun", "longButNotTooLong"] as const;
const EYE_STYLES = ["default", "happy", "surprised", "squint", "closed"] as const;
const EYEBROW_STYLES = ["flatNatural", "defaultNatural", "upDownNatural", "sadConcernedNatural", "raisedExcitedNatural"] as const;
const MOUTH_STYLES = ["smile", "default", "twinkle", "concerned", "tongue"] as const;

export function getAvatarUrl(data: AvatarData | null): string {
  if (!data) return "";
  const seed = `rdl-${data.hairColor}-${data.hairCut}-${data.skinColor}-${data.eyeShape}-${data.eyebrows}-${data.nose}-${data.mouth}-${data.shirtColor}`;
  const params = new URLSearchParams({
    seed,
    size: "200",
    backgroundColor: "transparent",
    hairColor: HAIR_COLORS[data.hairColor] ?? HAIR_COLORS[0],
    skinColor: SKIN_COLORS[data.skinColor] ?? SKIN_COLORS[0],
    clothesColor: SHIRT_COLORS[data.shirtColor] ?? SHIRT_COLORS[0],
    top: HAIR_TOPS[data.hairCut] ?? HAIR_TOPS[0],
    eyes: EYE_STYLES[data.eyeShape] ?? EYE_STYLES[0],
    eyebrows: EYEBROW_STYLES[data.eyebrows ?? 0] ?? EYEBROW_STYLES[0],
    mouth: MOUTH_STYLES[data.mouth] ?? MOUTH_STYLES[0],
    clothing: "shirtCrewNeck",
    accessoriesProbability: "0",
    facialHairProbability: "0",
  });
  return `${DICEBEAR_BASE}?${params.toString()}`;
}

export function AvatarBust({
  data,
  photoUrl,
  size = 120,
  className = "",
}: {
  data: AvatarData | null;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const showPhoto = !!photoUrl?.trim();

  if (showPhoto) {
    return (
      <div
        className={`overflow-hidden rounded-full bg-white/80 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl!}
          alt="Ma photo"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-[#a8d5ba]/50 text-[#2d4a3e]/60 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-3xl">👤</span>
      </div>
    );
  }

  const url = getAvatarUrl(data);
  return (
    <div
      className={`overflow-hidden rounded-full bg-white/80 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Avatar"
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

type Props = {
  value: AvatarData;
  onChange: (data: AvatarData) => void;
  readOnly?: boolean;
};

export default function AvatarCreator({ value, onChange, readOnly }: Props) {
  const data = { ...DEFAULT_AVATAR, ...value };

  const update = (key: keyof AvatarData, n: number) => {
    if (readOnly) return;
    onChange({ ...data, [key]: n });
  };

  const labels = {
    hairColor: ["Blond", "Brun", "Noir", "Roux", "Châtain"],
    hairCut: ["Court", "Garçon (long)", "Long", "Queue", "Carré"],
    eyeShape: ["Ronds", "Amande", "Grands", "Fermés (sourire)", "Mi-clos"],
    eyebrows: ["Petit", "Bouton", "Droit", "Fin", "Arrondi"],
    skinColor: ["Clair", "Hâlé", "Moyen", "Bronze", "Foncé"],
    nose: ["Petit", "Bouton", "Droit", "Fin", "Arrondi"],
    mouth: ["Sourire", "Neutre", "Grande joie", "Triste", "Langue"],
    shirtColor: ["Bleu", "Vert", "Rose", "Violet", "Abricot"],
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-2xl border-2 border-[#2d4a3e]/20 bg-white/90 p-6 shadow-lg">
        <AvatarBust data={data} size={140} />
      </div>
      {!readOnly && (
        <div className="grid w-full max-w-md gap-4 text-sm">
          <div>
            <p className="mb-2 font-medium text-[#2d4a3e]">Coupe de cheveux</p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => update("hairCut", i)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    data.hairCut === i ? "bg-[#4a7c5a] text-white" : "bg-[#e8e8e8] text-[#2d4a3e] hover:bg-[#d8d8d8]"
                  }`}
                >
                  {labels.hairCut[i]}
                </button>
              ))}
            </div>
          </div>
          {(["hairColor", "skinColor", "shirtColor"] as const).map((key) => (
            <div key={key}>
              <p className="mb-2 font-medium text-[#2d4a3e]">{labels[key]}</p>
              <div className="flex flex-wrap gap-2">
                {(key === "hairColor" ? HAIR_COLORS.map((c) => `#${c}`) : key === "skinColor" ? SKIN_COLORS.map((c) => `#${c}`) : SHIRT_COLORS.map((c) => `#${c}`)).map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => update(key, i)}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      data[key] === i ? "border-[#4a7c5a] ring-2 ring-[#4a7c5a]/50" : "border-[#2d4a3e]/20"
                    }`}
                    style={{ backgroundColor: color }}
                    title={labels[key][i]}
                  />
                ))}
              </div>
            </div>
          ))}
          {(["eyeShape", "eyebrows", "mouth"] as const).map((key) => (
            <div key={key}>
              <p className="mb-2 font-medium text-[#2d4a3e]">{labels[key]}</p>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => update(key, i)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                      data[key] === i ? "bg-[#4a7c5a] text-white" : "bg-[#e8e8e8] text-[#2d4a3e] hover:bg-[#d8d8d8]"
                    }`}
                  >
                    {labels[key][i]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
