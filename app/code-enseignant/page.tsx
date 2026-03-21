"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForetMagiqueBackground } from "../components/MiyazakiDecor";

const IconLeaf = () => (
  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

export default function CodeEnseignantPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, "").slice(0, 8);
    setCode(digits);
    setError(null);
    if (digits.length !== 8) {
      setError("Le code doit contenir exactement 8 chiffres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/enseignant/verifier-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: digits }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        router.replace("/enseignant");
        router.refresh();
        return;
      }
      setError(data.error ?? "Code incorrect.");
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <ForetMagiqueBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <Link
          href="/"
          className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#2d4a3e] shadow-sm backdrop-blur transition hover:bg-white"
        >
          <IconLeaf />
          Retour
        </Link>

        <div className="rounded-2xl bg-white/95 p-8 shadow-lg backdrop-blur">
          <h1 className="font-display text-2xl font-bold text-[#2d4a3e]">
            Espace enseignant
          </h1>
          <p className="mt-2 text-[#2d4a3e]/80">
            Saisis le code à 8 chiffres pour accéder à l&apos;espace enseignant.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label htmlFor="code" className="block text-sm font-medium text-[#2d4a3e]">
              Code
            </label>
            <input
              id="code"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full rounded-xl border-2 border-[#2d4a3e]/20 bg-white px-4 py-3 text-center text-xl tracking-[0.5em] text-[#2d4a3e] outline-none placeholder:text-[#2d4a3e]/40 focus:border-[#4a7c5a]"
              autoComplete="one-time-code"
              disabled={loading}
            />
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || code.length !== 8}
              className="w-full rounded-xl bg-[#4a7c5a] px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#3d6b4d] disabled:opacity-50 disabled:hover:bg-[#4a7c5a]"
            >
              {loading ? "Vérification…" : "Valider"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
