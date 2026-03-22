"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import {
  TITRE_CONSIGNES_1,
  ITEMS_CONSIGNES_1,
  type ItemConsigne,
} from "../../../data/consignes-1";
import { EvalNiveauAccessGate } from "../../../components/EvalNiveauAccessGate";
import { ECOUTER_LIRE_SON_ID, ECOUTER_EVAL_NIVEAU_CONSIGNES_1 } from "../../../data/ecouter-lire-eval-partage";

type ReponsesState = (string | number | null | boolean | number[])[];

const initialReponses: ReponsesState = [
  "",
  null,
  false,
  [],
  false,
  false,
  null,
  "",
  null,
  null,
];

export default function EnfantConsignes1Page() {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<ReponsesState>(initialReponses);
  const [termine, setTermine] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const item = ITEMS_CONSIGNES_1[step] as ItemConsigne;
  const total = ITEMS_CONSIGNES_1.length;
  const isLast = step === total - 1;

  // Init canvas fond blanc pour exercice "dessine"
  useEffect(() => {
    if (item.type === "dessine" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fef9f3";
        ctx.fillRect(0, 0, 320, 200);
      }
    }
  }, [step, item.type]);

  // Charger les voix (synthèse vocale) pour que le français soit dispo au premier clic
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const setReponse = (index: number, value: string | number | null | boolean | number[]) => {
    setReponses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toggleBarre = (exIndex: number, itemIndex: number) => {
    setReponses((prev) => {
      const arr = (prev[exIndex] ?? []) as number[];
      const next = [...prev];
      next[exIndex] = arr.includes(itemIndex)
        ? arr.filter((i) => i !== itemIndex)
        : [...arr, itemIndex];
      return next;
    });
  };

  const handleSuivant = () => {
    if (isLast) setTermine(true);
    else setStep((s) => s + 1);
  };

  const canContinue = (): boolean => {
    const r = reponses[step];
    switch (item.type) {
      case "ecris_mot":
        return (r as string).trim().length > 0;
      case "entoure_mot":
        return r !== null;
      case "dessine":
        return r === true;
      case "barre":
        return (r as number[]).length > 0;
      case "colorie_dernier":
        return r === true;
      case "encadre":
        return r === true;
      case "souligne_prenom_fille":
        return r !== null;
      case "recopie_mot":
        return (r as string).trim().length > 0;
      case "coche":
        return r !== null;
      case "croix_sous":
        return r !== null;
      default:
        return true;
    }
  };

  const lireConsigne = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find((v) => v.lang.startsWith("fr"));
    if (fr) u.voice = fr;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  return (
    <EvalNiveauAccessGate
      sonId={ECOUTER_LIRE_SON_ID}
      niveauId={ECOUTER_EVAL_NIVEAU_CONSIGNES_1}
      matiereLabel="Écouter-lire"
    >
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl text-[#2d4a3e]">{TITRE_CONSIGNES_1}</span>
          <Link
            href="/enfant/evaluations"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Évaluations
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-8">
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-between rounded-xl bg-white/90 px-4 py-2 shadow">
          <span className="text-sm font-medium text-[#2d4a3e]/80">
            Exercice {step + 1} / {total}
          </span>
          <div className="flex gap-1">
            {ITEMS_CONSIGNES_1.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`h-2 w-2 rounded-full transition sm:h-2.5 sm:w-2.5 ${
                  i === step ? "bg-[#4a7c5a]" : i < step ? "bg-[#4a7c5a]/50" : "bg-[#2d4a3e]/20"
                }`}
                aria-label={`Exercice ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {!termine ? (
          <div className="rounded-xl bg-white/95 p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 font-medium text-[#2d4a3e]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b8d4e8]/60 text-sm">
                {step + 1}
              </span>
              <span className="flex-1">{item.consigne}</span>
              <button
                type="button"
                onClick={() => lireConsigne(item.consigne)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#b8d4e8]/60 px-3 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#b8d4e8]/80"
                aria-label="Écouter la consigne"
              >
                <span className="text-lg" aria-hidden>🔊</span>
                Écouter
              </button>
            </div>

            {/* 1. Ecris le mot papa */}
            {item.type === "ecris_mot" && (
              <div className="space-y-3">
                <p className="text-sm text-[#2d4a3e]/70">Mot à écrire : « {item.mot} »</p>
                <input
                  type="text"
                  value={(reponses[step] as string) || ""}
                  onChange={(e) => setReponse(step, e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2d4a3e]/20 bg-[#fef9f3] px-4 py-3 font-handwriting text-xl tracking-wider text-[#2d4a3e]"
                  placeholder="Écris ici..."
                  maxLength={20}
                />
              </div>
            )}

            {/* 2. Entoure maman */}
            {item.type === "entoure_mot" && (
              <div className="flex flex-wrap gap-2">
                {item.mots.map((mot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReponse(step, i)}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                      reponses[step] === i
                        ? "border-[#4a7c5a] bg-[#a8d5ba]/40 text-[#2d4a3e]"
                        : "border-[#2d4a3e]/20 bg-white text-[#2d4a3e] hover:border-[#4a7c5a]/50"
                    }`}
                  >
                    {mot}
                  </button>
                ))}
              </div>
            )}

            {/* 3. Dessine un soleil */}
            {item.type === "dessine" && (
              <div className="space-y-3">
                <div className="relative rounded-xl border-2 border-dashed border-[#2d4a3e]/25 bg-[#fef9f3]">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={200}
                    className="block w-full rounded-lg"
                    onMouseDown={(e) => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d");
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 320;
                      const y = ((e.clientY - rect.top) / rect.height) * 200;
                      ctx.fillStyle = "#f5c542";
                      ctx.beginPath();
                      ctx.arc(x, y, 20, 0, Math.PI * 2);
                      ctx.fill();
                      setReponse(step, true);
                    }}
                  />
                  <p className="absolute bottom-2 left-2 text-xs text-[#2d4a3e]/50">
                    Clique pour dessiner (soleil)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReponse(step, true)}
                  className="rounded-lg bg-[#4a7c5a]/20 px-4 py-2 text-sm font-medium text-[#4a7c5a]"
                >
                  J&apos;ai dessiné
                </button>
              </div>
            )}

            {/* 4. Barre les champignons */}
            {item.type === "barre" && (
              <div className="flex flex-wrap gap-3">
                {item.items.map((it, i) => {
                  const barred = (reponses[step] as number[])?.includes(i) ?? false;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleBarre(step, i)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition ${
                        barred
                          ? "border-[#c45a5a] bg-[#f0d0d0]/40 opacity-80"
                          : "border-[#2d4a3e]/20 bg-white hover:border-[#4a7c5a]/40"
                      }`}
                    >
                      <span className="text-3xl">{it.emoji}</span>
                      <span className="text-xs text-[#2d4a3e]/70">{it.label}</span>
                      {barred && <span className="text-xs font-medium text-[#c45a5a]">Barré</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. Colorie le dernier cheval */}
            {item.type === "colorie_dernier" && (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: item.count }).map((_, i) => {
                  const isLast = i === item.count - 1;
                  const colored = reponses[step] === true && isLast;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => isLast && setReponse(step, true)}
                      className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-3xl transition ${
                        isLast
                          ? colored
                            ? "border-[#4a7c5a] bg-[#a8d5ba]/60"
                            : "border-[#2d4a3e]/25 bg-[#fef9f3] hover:border-[#4a7c5a]/50"
                          : "border-[#2d4a3e]/15 bg-white/80"
                      }`}
                    >
                      {item.emoji}
                    </button>
                  );
                })}
                <p className="w-full text-xs text-[#2d4a3e]/60">Clique sur le dernier cheval pour le colorier.</p>
              </div>
            )}

            {/* 6. Encadre le chat */}
            {item.type === "encadre" && (
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`relative inline-flex rounded-2xl border-4 p-6 transition ${
                    reponses[step] === true ? "border-[#4a7c5a] bg-[#a8d5ba]/20" : "border-transparent bg-[#fef9f3]"
                  }`}
                >
                  <span className="text-6xl">{item.emoji}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReponse(step, true)}
                  className="rounded-xl bg-[#4a7c5a] px-6 py-2 font-medium text-white"
                >
                  Encadrer le chat
                </button>
              </div>
            )}

            {/* 7. Souligne le prénom d'une fille */}
            {item.type === "souligne_prenom_fille" && (
              <div className="flex flex-wrap gap-2">
                {item.noms.map((nom, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReponse(step, i)}
                    className={`rounded-xl border-b-4 px-4 py-2 text-sm font-medium transition ${
                      reponses[step] === i
                        ? "border-[#4a7c5a] bg-[#a8d5ba]/30 text-[#2d4a3e]"
                        : "border-transparent bg-white text-[#2d4a3e] hover:bg-[#a8d5ba]/10"
                    }`}
                  >
                    {nom}
                  </button>
                ))}
              </div>
            )}

            {/* 8. Recopie le mot ami */}
            {item.type === "recopie_mot" && (
              <div className="space-y-3">
                <p className="text-lg font-medium text-[#2d4a3e]">
                  Mot à recopier : <span className="text-[#4a7c5a]">{item.mot}</span>
                </p>
                <input
                  type="text"
                  value={(reponses[step] as string) || ""}
                  onChange={(e) => setReponse(step, e.target.value)}
                  className="w-full rounded-xl border-2 border-[#2d4a3e]/20 bg-[#fef9f3] px-4 py-3 font-handwriting text-xl tracking-wider text-[#2d4a3e]"
                  placeholder="Recopie ici..."
                  maxLength={10}
                />
              </div>
            )}

            {/* 9. Coche la coccinelle */}
            {item.type === "coche" && (
              <div className="flex flex-wrap gap-4">
                {item.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReponse(step, i)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                      reponses[step] === i ? "border-[#4a7c5a] bg-[#a8d5ba]/20" : "border-[#2d4a3e]/20 bg-white hover:border-[#4a7c5a]/40"
                    }`}
                  >
                    <span className="text-4xl">{opt.emoji}</span>
                    <span className="text-sm text-[#2d4a3e]/80">{opt.label}</span>
                    <span className="h-6 w-6 rounded border-2 border-[#2d4a3e]/30 flex items-center justify-center">
                      {reponses[step] === i ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 10. Croix sous l'araignée */}
            {item.type === "croix_sous" && (
              <div className="flex flex-wrap gap-4">
                {item.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReponse(step, i)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                      reponses[step] === i ? "border-[#4a7c5a] bg-[#a8d5ba]/20" : "border-[#2d4a3e]/20 bg-white hover:border-[#4a7c5a]/40"
                    }`}
                  >
                    <span className="text-4xl">{opt.emoji}</span>
                    <span className="text-sm text-[#2d4a3e]/80">{opt.label}</span>
                    <span className="h-8 w-8 flex items-center justify-center text-[#2d4a3e] font-bold">
                      {reponses[step] === i ? "✗" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-xl bg-[#2d4a3e]/10 px-5 py-2 font-medium text-[#2d4a3e] disabled:opacity-40"
              >
                ← Précédent
              </button>
              <button
                type="button"
                onClick={handleSuivant}
                disabled={!canContinue()}
                className="rounded-xl bg-[#4a7c5a] px-6 py-2 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLast ? "Terminer" : "Suivant →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[#a8d5ba]/30 p-6 text-center">
            <p className="font-display text-xl text-[#2d4a3e]">Bravo !</p>
            <p className="mt-2 text-[#2d4a3e]/80">Tu as terminé les 10 exercices des Consignes 1.</p>
            <Link
              href="/enfant/evaluations"
              className="mt-6 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white"
            >
              ← Retour aux évaluations
            </Link>
          </div>
        )}
      </div>
    </main>
    </EvalNiveauAccessGate>
  );
}
