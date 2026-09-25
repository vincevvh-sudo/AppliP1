/**
 * Horaire de la semaine (lundi–vendredi) : cases par heure.
 * Mercredi = matin seulement ; vendredi = sans 14h30.
 */

export const HORAIRE_JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"] as const;
export type HoraireJour = (typeof HORAIRE_JOURS)[number];

export const TOUS_CRENEAUX = ["08:30", "09:20", "10:40", "11:30", "13:40", "14:30"] as const;
export type HoraireCreneau = (typeof TOUS_CRENEAUX)[number];

export const CRENEAUX_PAR_JOUR: Record<HoraireJour, readonly HoraireCreneau[]> = {
  lundi: TOUS_CRENEAUX,
  mardi: TOUS_CRENEAUX,
  mercredi: ["08:30", "09:20", "10:40", "11:30"],
  jeudi: TOUS_CRENEAUX,
  vendredi: ["08:30", "09:20", "10:40", "11:30", "13:40"],
};

export const JOUR_LABELS: Record<HoraireJour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
};

export const CRENEAU_LABEL: Record<HoraireCreneau, string> = {
  "08:30": "8h30",
  "09:20": "9h20",
  "10:40": "10h40",
  "11:30": "11h30",
  "13:40": "13h40",
  "14:30": "14h30",
};

export type HoraireSemaineData = Record<HoraireJour, Partial<Record<HoraireCreneau, string>>>;

export function horaireHasContent(data: HoraireSemaineData | undefined): boolean {
  if (!data) return false;
  return HORAIRE_JOURS.some((jour) =>
    Object.values(data[jour] ?? {}).some((v) => (v ?? "").trim().length > 0)
  );
}

export function emptyHoraireSemaine(): HoraireSemaineData {
  return {
    lundi: {},
    mardi: {},
    mercredi: {},
    jeudi: {},
    vendredi: {},
  };
}

export function formatJourColonne(weekStart: string, jour: HoraireJour): string {
  const idx = HORAIRE_JOURS.indexOf(jour);
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, m - 1, d + idx);
  const dateLabel = date.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
  return `${JOUR_LABELS[jour]} ${dateLabel}`;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeDictee(s: string): string {
  return stripAccents(s)
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9:h ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remplace les formulations orales d’heure par un jeton 08:30, 09:20… */
function applyTimeTokens(s: string): string {
  const replacements: [RegExp, string][] = [
    [
      /huit heures et demie|8 heures et demie|8 heures trente|huit heures trente|8 h 30|8h30|8:30|08h30|08:30/g,
      "08:30",
    ],
    [
      /neuf heures vingt|9 heures vingt|9 heures 20|neuf heures 20|9 h 20|9h20|9:20|09h20|09:20/g,
      "09:20",
    ],
    [
      /dix heures quarante|10 heures quarante|10 heures 40|dix heures 40|10 h 40|10h40|10:40/g,
      "10:40",
    ],
    [
      /onze heures et demie|onze heures trente|11 heures trente|11 heures 30|11 h 30|11h30|11:30/g,
      "11:30",
    ],
    [
      /treize heures quarante|13 heures quarante|13 heures 40|13 h 40|13h40|13:40|une heure quarante/g,
      "13:40",
    ],
    [
      /quatorze heures et demie|quatorze heures trente|14 heures trente|14 heures 30|14 h 30|14h30|14:30|deux heures et demie|deux heures trente/g,
      "14:30",
    ],
  ];
  let out = ` ${s} `;
  for (const [re, token] of replacements) {
    out = out.replace(re, ` ${token} `);
  }
  return out.replace(/\s+/g, " ").trim();
}

function capitalizeActivite(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export type DicteeHoraire = {
  jour: HoraireJour;
  creneau: HoraireCreneau;
  texte: string;
  /** « tous les jeudis… » → chaque semaine jusqu’au 2 juillet (sauf vacances). */
  recurrent: boolean;
};

export function parseHoraireDictee(raw: string): {
  ok: DicteeHoraire[];
  erreurs: string[];
} {
  const text = applyTimeTokens(normalizeDictee(raw));
  const jours = [...text.matchAll(/\b(lundis?|mardis?|mercredis?|jeudis?|vendredis?)\b/g)];
  const ok: DicteeHoraire[] = [];
  const erreurs: string[] = [];

  if (jours.length === 0) {
    erreurs.push(
      "Dis le jour, puis l’heure, puis l’activité. Ex. : « mardi 9h20 chrono » ou « tous les jeudis 9h20 piscine »."
    );
    return { ok, erreurs };
  }

  for (let i = 0; i < jours.length; i++) {
    const jour = jours[i][1].replace(/s$/, "") as HoraireJour;
    const idx = jours[i].index ?? 0;
    const before = text.slice(Math.max(0, idx - 20), idx);
    const recurrent = /\b(tous les|toutes les|chaque)\s*$/.test(before);
    const start = idx + jours[i][0].length;
    const end = i + 1 < jours.length ? (jours[i + 1].index ?? text.length) : text.length;
    const chunk = text.slice(start, end).trim();
    const timeMatch = chunk.match(/\b(08:30|09:20|10:40|11:30|13:40|14:30)\b/);
    if (!timeMatch) {
      erreurs.push(`${JOUR_LABELS[jour]} : je n’ai pas entendu l’heure.`);
      continue;
    }
    const creneau = timeMatch[1] as HoraireCreneau;
    if (!CRENEAUX_PAR_JOUR[jour].includes(creneau)) {
      erreurs.push(`${JOUR_LABELS[jour]} n’a pas de case ${CRENEAU_LABEL[creneau]}.`);
      continue;
    }
    const texte = capitalizeActivite(chunk.slice((timeMatch.index ?? 0) + timeMatch[0].length));
    if (!texte) {
      erreurs.push(
        `${JOUR_LABELS[jour]} ${CRENEAU_LABEL[creneau]} : dis aussi l’activité (ex. chrono).`
      );
      continue;
    }
    ok.push({ jour, creneau, texte, recurrent });
  }
  return { ok, erreurs };
}

export function jourACeCreneau(jour: HoraireJour, creneau: HoraireCreneau): boolean {
  return CRENEAUX_PAR_JOUR[jour].includes(creneau);
}
