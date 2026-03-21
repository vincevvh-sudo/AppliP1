export type ManualEvalCategoryId =
  | "francais-ecrire"
  | "francais-parler"
  | "francais-lire"
  | "francais-ecouter"
  | "maths-arithmetique"
  | "maths-grandeur"
  | "maths-espace-geo"
  | "maths-traitement-donnees"
  | "eveil";

export const MANUAL_EVAL_CATEGORIES: { id: ManualEvalCategoryId; label: string }[] = [
  { id: "francais-ecrire", label: "Français : écrire" },
  { id: "francais-parler", label: "Français : parler" },
  { id: "francais-lire", label: "Français : lire" },
  { id: "francais-ecouter", label: "Français : écouter" },
  { id: "maths-arithmetique", label: "Mathématiques : arithmétique" },
  { id: "maths-grandeur", label: "Mathématiques : grandeurs" },
  { id: "maths-espace-geo", label: "Mathématiques : espace/géométrie" },
  { id: "maths-traitement-donnees", label: "Mathématiques : organisation des données" },
  { id: "eveil", label: "Éveil" },
];

export function getManualCategoryLabel(id: string | undefined): string {
  if (!id) return "Catégorie";
  return MANUAL_EVAL_CATEGORIES.find((c) => c.id === id)?.label ?? "Catégorie";
}

