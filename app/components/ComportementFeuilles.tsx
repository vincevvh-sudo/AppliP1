"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "./MiyazakiDecor";
import { supabase } from "../../utils/supabase";
import {
  ATTENDUS_COMPORTEMENT,
  TEINTES_COMPORTEMENT,
  notesComportementVertes,
  type FeuilleComportement,
  type TeinteComportement,
} from "../data/comportement-feuille";

const STORAGE_KEY = "comportement-feuilles-2026";

function nouvelleFeuille(prenom = "", id = ""): FeuilleComportement {
  return {
    id: id || `feuille-${crypto.randomUUID()}`,
    prenom,
    notes: notesComportementVertes(),
  };
}

function feuillesValides(value: unknown): FeuilleComportement[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const teintes = new Set(TEINTES_COMPORTEMENT.map((t) => t.id));
  return value.map((item, index) => {
    const row = item as Partial<FeuilleComportement>;
    const notes = ATTENDUS_COMPORTEMENT.map((_, i) => {
      const note = row.notes?.[i];
      return note && teintes.has(note) ? note : "vert";
    });
    return {
      id: typeof row.id === "string" && row.id ? row.id : `feuille-${index}`,
      prenom: typeof row.prenom === "string" ? row.prenom : "",
      notes,
    };
  });
}

function Visage({
  teinte,
  colorie,
}: {
  teinte: TeinteComportement;
  colorie: boolean;
}) {
  const couleur = TEINTES_COMPORTEMENT.find((t) => t.id === teinte)?.couleur ?? "#fff";
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden>
      <circle cx="32" cy="32" r="29" fill="#fff" stroke="#222" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="24.5" fill={colorie ? couleur : "#fff"} />
      <circle cx="23" cy="26" r="3.1" fill="#222" />
      <circle cx="41" cy="26" r="3.1" fill="#222" />
      {teinte === "vert" && (
        <path d="M20 36.5 Q32 49 44 36.5" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
      )}
      {teinte === "jaune" && (
        <path d="M21 41 H43" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
      )}
      {teinte === "rouge" && (
        <path d="M20 46 Q32 35 44 46" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Feuille({
  feuille,
  fontClass,
  onPrenom,
  onNote,
  onRetirer,
}: {
  feuille: FeuilleComportement;
  fontClass: string;
  onPrenom: (prenom: string) => void;
  onNote: (index: number, teinte: TeinteComportement) => void;
  onRetirer: () => void;
}) {
  return (
    <article className={`comportement-sheet ${fontClass}`}>
      <div className="comportement-entete">
        <label className="comportement-prenom-label">
          Prénom :
          <input
            className="comportement-prenom"
            value={feuille.prenom}
            onChange={(e) => onPrenom(e.target.value)}
            aria-label="Prénom de l'enfant"
            autoComplete="off"
          />
        </label>
        <h2>Mon comportement</h2>
        <button type="button" className="comportement-retirer no-print" onClick={onRetirer}>
          Retirer
        </button>
      </div>

      <table className="comportement-table">
        <thead>
          <tr>
            <th className="comportement-icone" />
            <th>Comportement</th>
            <th>Enfant</th>
            <th>Enseignant</th>
          </tr>
        </thead>
        <tbody>
          {ATTENDUS_COMPORTEMENT.map((attendu, index) => (
            <tr key={attendu.id}>
              <td className="comportement-icone">
                <img src={attendu.icone} alt="" />
              </td>
              <td className="comportement-texte">{attendu.texte}</td>
              <td>
                <div className="comportement-visages" aria-hidden>
                  {TEINTES_COMPORTEMENT.map((teinte) => (
                    <Visage key={teinte.id} teinte={teinte.id} colorie={false} />
                  ))}
                </div>
              </td>
              <td>
                <div className="comportement-visages" role="group" aria-label={attendu.texte}>
                  {TEINTES_COMPORTEMENT.map((teinte) => {
                    const choisi = feuille.notes[index] === teinte.id;
                    return (
                      <button
                        key={teinte.id}
                        type="button"
                        className="comportement-choix"
                        aria-label={teinte.label}
                        aria-pressed={choisi}
                        onClick={() => onNote(index, teinte.id)}
                      >
                        <Visage teinte={teinte.id} colorie={choisi} />
                      </button>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export function ComportementFeuilles({ fontClass }: { fontClass: string }) {
  const [feuilles, setFeuilles] = useState<FeuilleComportement[] | null>(null);

  useEffect(() => {
    let ignore = false;

    async function charger() {
      let enregistrees: FeuilleComportement[] | null = null;
      try {
        enregistrees = feuillesValides(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
      } catch {
        enregistrees = null;
      }
      if (enregistrees) {
        if (!ignore) setFeuilles(enregistrees);
        return;
      }

      try {
        const { data, error } = await supabase.from("eleves").select("id, prenom").order("prenom");
        if (!ignore && !error && data && data.length > 0) {
          const triees = [...data].sort((a, b) =>
            a.prenom.localeCompare(b.prenom, "fr", { sensitivity: "base" })
          );
          setFeuilles(triees.map((eleve) => nouvelleFeuille(eleve.prenom, eleve.id)));
          return;
        }
      } catch {
        // Une feuille vide reste utilisable sans la liste de la classe.
      }
      if (!ignore) setFeuilles([nouvelleFeuille()]);
    }

    void charger();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!feuilles) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feuilles));
  }, [feuilles]);

  const modifier = useCallback((id: string, patch: (feuille: FeuilleComportement) => FeuilleComportement) => {
    setFeuilles((liste) => liste?.map((feuille) => (feuille.id === id ? patch(feuille) : feuille)) ?? liste);
  }, []);

  if (!feuilles) {
    return (
      <main className="relative min-h-screen text-[#2d4a3e]">
        <div className="no-print">
          <ForetMagiqueBackground />
        </div>
        <p className="relative z-10 px-6 py-16 text-center">Chargement des feuilles…</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-[#2d4a3e]">
      <style>{`
        .comportement-sheet {
          width: min(1100px, 100%);
          margin: 0 auto 1.5rem;
          background: #fff;
          color: #1a1a1a;
          padding: 1.1rem 1.25rem 1.25rem;
          box-shadow: 0 10px 30px rgba(45, 74, 62, 0.12);
        }
        .comportement-entete {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .comportement-entete h2 {
          margin: 0;
          text-align: center;
          font-size: 2.15rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.1;
        }
        .comportement-prenom-label {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          font-size: 1.15rem;
          white-space: nowrap;
        }
        .comportement-prenom {
          width: 100%;
          min-width: 0;
          border: none;
          border-bottom: 2px dotted #222;
          background: transparent;
          font: inherit;
          color: inherit;
          padding: 0 0.15rem 0.05rem;
        }
        .comportement-prenom:focus {
          outline: none;
          border-bottom-style: solid;
        }
        .comportement-retirer {
          justify-self: end;
          border: none;
          background: transparent;
          color: #2d4a3e;
          text-decoration: underline;
          cursor: pointer;
          font: inherit;
          font-size: 0.9rem;
        }
        .comportement-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .comportement-table th,
        .comportement-table td {
          border: 2px solid #222;
          text-align: center;
          vertical-align: middle;
          padding: 0.28rem 0.45rem;
        }
        .comportement-table th {
          font-size: 1.05rem;
          font-weight: 700;
          padding: 0.4rem;
        }
        .comportement-icone { width: 12%; }
        .comportement-table th:nth-child(2) { width: 46%; }
        .comportement-table th:nth-child(3),
        .comportement-table th:nth-child(4) { width: 21%; }
        .comportement-icone img {
          display: block;
          height: 3.4rem;
          width: auto;
          max-width: 100%;
          margin: 0 auto;
          object-fit: contain;
        }
        .comportement-texte {
          font-size: 1.02rem;
          line-height: 1.25;
          padding-left: 0.7rem;
          padding-right: 0.7rem;
        }
        .comportement-visages {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.35rem;
        }
        .comportement-choix {
          display: flex;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 999px;
        }
        .comportement-choix:hover,
        .comportement-choix:focus-visible {
          transform: scale(1.06);
          outline: 2px solid #2d4a3e;
          outline-offset: 1px;
        }
        @page comportement {
          size: A4 landscape;
          margin: 8mm;
        }
        @media print {
          .comportement-sheet {
            page: comportement;
            box-shadow: none;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            break-after: page;
            page-break-after: always;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .comportement-sheet:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .comportement-entete h2 { font-size: 22pt; }
          .comportement-texte { font-size: 11.5pt; }
          .comportement-icone img { height: 14mm; }
          .comportement-choix svg,
          .comportement-visages svg { height: 11mm; width: 11mm; }
        }
      `}</style>

      <div className="no-print">
        <ForetMagiqueBackground />
      </div>

      <header className="no-print relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/enseignant" className="font-display text-xl tracking-wide text-[#2d4a3e]">
            Mon comportement
          </Link>
          <Link href="/enseignant" className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20">
            Retour
          </Link>
        </div>
      </header>

      <div className="no-print sticky top-0 z-20 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-[#2d4a3e]/85">
            Le sourire est vert. Choisis le visage du milieu pour le jaune, ou le dernier pour le rouge.
            La colonne Enfant reste vide pour les crayons.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFeuilles((liste) => [...(liste ?? []), nouvelleFeuille()])}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2d4a3e] shadow-sm ring-1 ring-[#2d4a3e]/15 hover:bg-[#f3f7f4]"
            >
              Ajouter une feuille
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[#2d4a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3d6352]"
            >
              Imprimer
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-3 py-6">
        {feuilles.map((feuille) => (
          <Feuille
            key={feuille.id}
            feuille={feuille}
            fontClass={fontClass}
            onPrenom={(prenom) => modifier(feuille.id, (item) => ({ ...item, prenom }))}
            onNote={(index, teinte) =>
              modifier(feuille.id, (item) => {
                const notes = [...item.notes];
                notes[index] = teinte;
                return { ...item, notes };
              })
            }
            onRetirer={() => {
              const nom = feuille.prenom.trim() || "cette feuille";
              if (!window.confirm(`Retirer la feuille de ${nom} ?`)) return;
              setFeuilles((liste) => (liste ?? []).filter((item) => item.id !== feuille.id));
            }}
          />
        ))}
      </div>
    </main>
  );
}
