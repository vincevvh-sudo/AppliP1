export type SolideId = "cube" | "pave" | "cylindre" | "sphere";

export const SOLIDES: { id: SolideId; label: string; emoji: string }[] = [
  { id: "cube", label: "Cube", emoji: "🧊" },
  { id: "pave", label: "Parallélépipède rectangle", emoji: "📦" },
  { id: "cylindre", label: "Cylindre", emoji: "🥫" },
  { id: "sphere", label: "Sphère", emoji: "⚽" },
];

export type ItemObjetSolide = {
  id: string;
  emoji?: string;
  image?: string;
  label: string;
  solide: SolideId;
};

// 9 objets (avec 3 exemples de parallélépipède rectangle)
export const OBJETS_A_RELier: ItemObjetSolide[] = [
  { id: "obj-1", emoji: "🎲", label: "dé", solide: "cube" },
  { id: "obj-2", emoji: "🧊", label: "glaçon", solide: "cube" },
  { id: "obj-3", image: "/images/solides/parallelepipede-1.png", label: "boîte de mouchoirs", solide: "pave" },
  { id: "obj-4", image: "/images/solides/parallelepipede-2.png", label: "brique", solide: "pave" },
  { id: "obj-5", image: "/images/solides/parallelepipede-3.png", label: "carton", solide: "pave" },
  { id: "obj-6", emoji: "🥫", label: "boîte de conserve", solide: "cylindre" },
  { id: "obj-7", emoji: "🕯️", label: "bougie", solide: "cylindre" },
  { id: "obj-8", emoji: "⚽", label: "ballon", solide: "sphere" },
  { id: "obj-9", emoji: "🍊", label: "orange", solide: "sphere" },
];

export type ItemVraiFaux = { id: string; phrase: string; correct: boolean };

// Phrases inspirées du PDF (roule / ne roule pas)
export const SOLIDES_VRAI_FAUX: ItemVraiFaux[] = [
  { id: "vf-1", phrase: "La sphère roule toujours.", correct: true },
  { id: "vf-2", phrase: "Le cube roule parfois.", correct: false },
  { id: "vf-3", phrase: "Le parallélépipède rectangle ne roule jamais.", correct: true },
  { id: "vf-4", phrase: "La sphère ne roule jamais.", correct: false },
  { id: "vf-5", phrase: "Le cylindre roule parfois.", correct: true },
  { id: "vf-6", phrase: "Le cube roule toujours.", correct: false },
  { id: "vf-7", phrase: "Le parallélépipède rectangle roule parfois.", correct: false },
  { id: "vf-8", phrase: "Le cube ne roule jamais.", correct: true },
];

export const TITRE_SOLIDES_EVALUATION = "Solides (relier + vrai/faux)";

