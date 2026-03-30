"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../../../components/MiyazakiDecor";
import { DICTEE_MOTS, NOM_DICTEE_MOTS } from "../../../data/dictee-mots-data";
import { getDicteesMotsPartagesPourEleve } from "../../../data/dictee-mots-partages";
import { normaliserSyllabe } from "../../../data/dictee-syllabes";
import { saveResultat } from "../../../data/resultats-storage";
import { getEnfantSession } from "../../../../utils/enfant-session";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function speakMot(mot: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(mot);
  u.lang = "fr-FR";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function EnfantDicteeMotsNumPage() {
  const params = useParams();
  const router = useRouter();
  const session = getEnfantSession();
  const [partage, setPartage] = useState<number[] | null>(null);

  const num = parseInt(params.num as string, 10);
  const index = Number.isFinite(num) && num >= 1 && num <= DICTEE_MOTS.length ? num - 1 : -1;
  const mots = index >= 0 ? (DICTEE_MOTS[index] ?? []) : [];
  const titre = index >= 0 ? (NOM_DICTEE_MOTS[index] ?? "") : "";

  useEffect(() => {
    if (!session?.id) {
      setPartage([]);
      return;
    }
    getDicteesMotsPartagesPourEleve(session.id as number).then(setPartage);
  }, [session?.id]);

  useEffect(() => {
    if (partage !== null && !partage.includes(num)) router.replace("/enfant/sons");
  }, [partage, num, router]);

  const [current, setCurrent] = useState(0);
  const [reponse, setReponse] = useState("");
  const [resultats, setResultats] = useState<(boolean | null)[]>(() => mots.map(() => null));
  const [verifie, setVerifie] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const attendu = mots[current] ?? "";
  const estDernier = current === mots.length - 1;
  const tousVerifies = resultats.every((r) => r !== null);

  const play = useCallback(() => {
    if (attendu) speakMot(attendu);
  }, [attendu]);

  useEffect(() => {
    if (attendu) speakMot(attendu);
  }, [current, attendu]);

  const handleVerifier = useCallback(() => {
    if (verifie) return;
    const ok =
      normaliserSyllabe(reponse ?? "") === normaliserSyllabe(attendu ?? "");
    setResultats((prev) => {
      const next = [...prev];
      next[current] = ok;
      return next;
    });
    setVerifie(true);
  }, [current, reponse, attendu, verifie]);

  const handleSuivant = useCallback(() => {
    if (!verifie) return;
    if (estDernier) return;
    setCurrent((c) => c + 1);
    setReponse("");
    setVerifie(false);
  }, [verifie, estDernier]);

  const score = resultats.filter((r) => r === true).length;

  useEffect(() => {
    if (!tousVerifies || resultSaved) return;
    if (!session?.id) return;
    saveResultat({
      eleve_id: String(session.id),
      son_id: "dictee-mots",
      niveau_id: `dictee-mots-${num}`,
      points: score,
      points_max: mots.length,
      reussi: score >= mots.length * 0.8,
      detail_exercices: mots.map((m, i) => ({
        type: "dictee-mot",
        titre: `Mot ${i + 1}`,
        points: resultats[i] === true ? 1 : 0,
        pointsMax: 1,
      })),
    }).finally(() => setResultSaved(true));
  }, [mots, num, resultSaved, score, session?.id, tousVerifies, resultats]);

  useEffect(() => {
    if (!tousVerifies || !resultSaved) return;
    const t = setTimeout(() => {
      router.replace("/enfant/resultats");
    }, 1200);
    return () => clearTimeout(t);
  }, [tousVerifies, resultSaved, router]);

  if (partage === null) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 flex min-h-[40vh] items-center justify-center">
          <p className="text-[#2d4a3e]/70">Chargement…</p>
        </div>
      </main>
    );
  }

  if (index < 0 || mots.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
        <ForetMagiqueBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center">
          <p>Dictée de mots introuvable.</p>
          <Link href="/enfant/dictees-mots" className="mt-4 inline-block text-[#4a7c5a]">
            ← Retour aux dictées de mots
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />
      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/enfant/dictees-mots"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8d5ba]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            {titre}
          </Link>
          <Link
            href="/enfant/dictees-mots"
            className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-5 py-12">
        {!tousVerifies ? (
          <>
            <p className="text-center text-[#2d4a3e]/80">
              Mot {current + 1} sur {mots.length}
            </p>
            <div className="mt-8 rounded-2xl bg-white/95 p-8 shadow-xl">
              <p className="text-center text-[#2d4a3e]/70">
                Écoute le mot, puis écris-le dans la case pour t&apos;entraîner.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={play}
                  className="rounded-xl bg-[#4a7c5a] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#3d6b4d]"
                >
                  🔊 Réécouter le mot
                </button>
              </div>
              <div className="mt-8">
                <label
                  htmlFor="reponse"
                  className="block text-center text-sm font-medium text-[#2d4a3e]/80"
                >
                  Ta réponse
                </label>
                <input
                  id="reponse"
                  type="text"
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!verifie) handleVerifier();
                      else if (!estDernier) handleSuivant();
                    }
                  }}
                  disabled={verifie}
                  placeholder="écris ici"
                  className="mx-auto mt-2 block w-full max-w-xs rounded-xl border-2 border-[#2d4a3e]/25 px-4 py-4 text-center text-xl font-medium text-[#2d4a3e] placeholder:text-[#2d4a3e]/40 focus:border-[#4a7c5a] focus:outline-none disabled:bg-[#fef9f3]/80"
                  autoFocus
                />
              </div>
              {verifie && (
                <div className="mt-6 text-center">
                  {resultats[current] === true ? (
                    <p className="text-lg font-semibold text-[#4a7c5a]">
                      ✓ Bravo, c&apos;est correct !
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-[#c45c4a]">
                      Le mot correct était : <strong>{attendu}</strong>
                    </p>
                  )}
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {!verifie ? (
                  <button
                    type="button"
                    onClick={handleVerifier}
                    disabled={!reponse.trim()}
                    className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d] disabled:opacity-50"
                  >
                    Vérifier
                  </button>
                ) : !estDernier ? (
                  <button
                    type="button"
                    onClick={handleSuivant}
                    className="rounded-xl bg-[#4a7c5a] px-8 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
                  >
                    Mot suivant
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white/95 p-8 text-center shadow-xl">
            <p className="text-xl text-[#2d4a3e]">
              Tu as bien écrit <strong>{score}</strong> mot
              {score > 1 ? "s" : ""} sur {mots.length}.
            </p>
            <p className="mt-2 text-lg font-semibold text-[#2d4a3e]">
              Score : {score} / {mots.length}
            </p>
            <p className="mt-2 text-sm text-[#2d4a3e]/80">
              Tu peux refaire la dictée plus tard pour t&apos;améliorer avant la dictée à l&apos;école.
            </p>
            <Link
              href="/enfant/resultats"
              className="mt-6 inline-block rounded-xl bg-[#4a7c5a] px-6 py-3 font-semibold text-white transition hover:bg-[#3d6b4d]"
            >
              Vers mes résultats
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

