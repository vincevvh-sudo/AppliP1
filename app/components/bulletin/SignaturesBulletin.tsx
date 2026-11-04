"use client";

import { useState } from "react";
import { setSignatureEnseignant } from "../../data/bulletin-storage";

async function fileToSignatureDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxW = 1000;
  const scale = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Impossible de lire cette image.");
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return file.type === "image/png"
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.85);
}

const SIGNATURE_PAR_DEFAUT = "/bulletin/signature-enseignant.jpg";

/** Bas de la feuille de synthèse : direction (à signer) et enseignant (photo enregistrée une fois). */
export function SignaturesBulletin({ allowUpload = false }: { allowUpload?: boolean }) {
  const [signature, setSignature] = useState<string>(SIGNATURE_PAR_DEFAUT);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToSignatureDataUrl(file);
      setSignatureEnseignant(dataUrl);
      setSignature(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d’enregistrer la signature.");
    }
  };

  const remove = () => {
    setSignatureEnseignant(null);
    setSignature(SIGNATURE_PAR_DEFAUT);
  };

  return (
    <footer className="bulletin-signatures">
      <div className="bulletin-signature-slot">
        <p>Signature de la direction</p>
      </div>
      <div className="bulletin-signature-slot">
        <p>Signature de l&apos;enseignant</p>
        <img src={signature} alt="Signature de l'enseignant" />
        {allowUpload && (
          <div className="no-print mt-2 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg bg-[#4a7c5a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#3d6b4d]">
              {signature ? "Changer ma signature" : "Ajouter ma signature"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  void onFile(file);
                  e.target.value = "";
                }}
              />
            </label>
            {signature !== SIGNATURE_PAR_DEFAUT && (
              <button
                type="button"
                onClick={remove}
                className="rounded-lg border border-[#2d4a3e]/20 px-3 py-1.5 text-sm text-[#2d4a3e]"
              >
                Retirer
              </button>
            )}
            <span className="text-xs text-[#2d4a3e]/70">
              Une seule fois : elle s&apos;imprime sur tous les bulletins.
            </span>
          </div>
        )}
        {error && <p className="no-print mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </footer>
  );
}
