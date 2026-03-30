"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ForetMagiqueBackground } from "../../components/MiyazakiDecor";
import { FaceSelector } from "../../components/bulletin/FaceSelector";
import { CommentaireAvecGemini } from "../../components/bulletin/CommentaireAvecGemini";
import {
  getElevesBulletin,
  addEleveBulletin,
  updateEleveBulletin,
  removeEleveBulletin,
  getSections,
  addProgrammationSectionsIfMissing,
  addAttendu,
  updateAttendu,
  removeAttendu,
  moveAttendu,
  getBulletinEleve,
  setEvaluation,
  setCommentaire,
  getSectionComment,
  setSectionComment,
  type EleveBulletin,
  type SectionAttendus,
  type NiveauAcquisition,
} from "../../data/bulletin-storage";
import {
  syncBulletinSectionsTemplateToLocalStorage,
  pushLocalBulletinSectionsTemplateToSupabase,
} from "../../data/bulletin-sections-template-storage";
import {
  BULLETIN_MONTHS,
  BULLETIN_SUBJECTS,
  type BulletinMonthId,
} from "../../data/programmation-par-mois";
import {
  saveBulletinEnvoye,
  type BulletinEnvoyeData,
  type BulletinEnvoyeLigne,
} from "../../data/bulletin-envoye-storage";
import { supabase } from "../../../utils/supabase";
import type { EleveRow } from "../../../utils/supabase";
import { getResultatsByEleve } from "../../data/resultats-storage";
import { getDicteeScoresByEleves } from "../../data/dictee-scores-storage";
import {
  computeSyntheseBulletin,
  BULLETIN_SYNTHESE_CATEGORIES,
  formatNoteSurBarème,
  type SyntheseBulletin,
  type DicteeScoresForBulletin,
} from "../../data/bulletin-synthese";

const IconLeaf = () => (
  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.69-3.59c.48.17.98.28 1.5.34C10.5 19 17 15 17 8z" />
  </svg>
);

function SectionTable({
  section,
  bulletin,
  selectedEleve,
  collapsedSections,
  setCollapsedSections,
  handleSetEvaluation,
  handleSetCommentaire,
  showEnfantColumn,
}: {
  section: SectionAttendus;
  bulletin: ReturnType<typeof getBulletinEleve> | null;
  selectedEleve: EleveBulletin;
  collapsedSections: Set<string>;
  setCollapsedSections: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleSetEvaluation: (
    eleveId: string,
    sectionId: string,
    attenduId: string,
    role: "enfant" | "enseignant",
    niveau: NiveauAcquisition
  ) => void;
  handleSetCommentaire: (
    eleveId: string,
    sectionId: string,
    attenduId: string,
    commentaire: string
  ) => void;
  showEnfantColumn: boolean;
}) {
  const isCollapsed = collapsedSections.has(section.id);
  return (
    <section className="mb-6 rounded-xl border border-[#2d4a3e]/10 bg-white/50 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left font-display text-lg text-[#2d4a3e] hover:bg-[#2d4a3e]/5 transition print:cursor-default"
        onClick={() =>
          setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(section.id)) next.delete(section.id);
            else next.add(section.id);
            return next;
          })
        }
      >
        <span>{section.titre}</span>
        <span className="text-[#2d4a3e]/60">
          {isCollapsed ? "▶" : "▼"} {section.attendus.length} attendu(s)
        </span>
      </button>
      {!isCollapsed && (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#2d4a3e]/20">
                <th className="pb-2 pr-4 text-left font-medium text-[#2d4a3e]">
                  Attendus
                </th>
                {showEnfantColumn && (
                  <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                    Enfant
                  </th>
                )}
                <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                  Enseignant
                </th>
                <th className="pb-2 pl-4 text-left font-medium text-[#2d4a3e] min-w-[200px]">
                  Commentaire
                </th>
              </tr>
            </thead>
            <tbody>
              {section.attendus.map((attendu) => {
                const evalLine = bulletin?.sections[section.id]?.[attendu.id];
                const enfant = evalLine?.enfant ?? null;
                const enseignant = evalLine?.enseignant ?? null;
                const commentaire = evalLine?.commentaire ?? "";
                return (
                  <tr
                    key={attendu.id}
                    className="border-b border-[#2d4a3e]/10 align-top"
                  >
                    <td className="py-3 pr-4 text-[#2d4a3e]">
                      {attendu.libelle}
                    </td>
                    {showEnfantColumn && (
                      <td className="py-3 px-2">
                        <FaceSelector
                          columnLabel="Enfant"
                          value={enfant}
                          onChange={(v) =>
                            handleSetEvaluation(
                              selectedEleve.id,
                              section.id,
                              attendu.id,
                              "enfant",
                              v
                            )
                          }
                        />
                      </td>
                    )}
                    <td className="py-3 px-2">
                      <FaceSelector
                        columnLabel="Enseignant"
                        value={enseignant}
                        onChange={(v) =>
                          handleSetEvaluation(
                            selectedEleve.id,
                            section.id,
                            attendu.id,
                            "enseignant",
                            v
                          )
                        }
                      />
                    </td>
                    <td
                      className={`py-3 pl-4 ${
                        commentaire.trim() === ""
                          ? "comment-cell-empty-print"
                          : ""
                      }`}
                    >
                      <div className="no-print">
                        <CommentaireAvecGemini
                          libelle={attendu.libelle}
                          niveauEnseignant={enseignant}
                          value={commentaire}
                          onChange={(c) =>
                            handleSetCommentaire(
                              selectedEleve.id,
                              section.id,
                              attendu.id,
                              c
                            )
                          }
                        />
                      </div>
                      {commentaire.trim() !== "" && (
                        <div className="print-only whitespace-pre-wrap text-sm text-[#2d4a3e]/90">
                          {commentaire}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function BulletinPage() {
  const [eleves, setEleves] = useState<EleveBulletin[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sections, setSectionsState] = useState<SectionAttendus[]>([]);
  const [editAttendus, setEditAttendus] = useState(false);
  const [newPrenom, setNewPrenom] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingAttendu, setEditingAttendu] = useState<{ sectionId: string; attenduId: string; libelle: string } | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());
  const [supabaseEleves, setSupabaseEleves] = useState<EleveRow[]>([]);
  const [sendingSection, setSendingSection] = useState<string | null>(null);
  const [printMonthId, setPrintMonthId] = useState<BulletinMonthId | null>(null);
  type ViewMode = "mois" | "matiere";
  const [viewMode, setViewMode] = useState<ViewMode>("mois");
  type SelectedPart =
    | { subjectId: string; subjectLabel: string; subpartId: string; subpartLabel: string }
    | { subjectId: string; subjectLabel: string; subpartId?: never; subpartLabel?: never };
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(null);
  const [syntheseEval, setSyntheseEval] = useState<SyntheseBulletin | null>(null);
  const [loadingSynthese, setLoadingSynthese] = useState(false);

  const load = useCallback(async () => {
    setEleves(getElevesBulletin());
    const synced = await syncBulletinSectionsTemplateToLocalStorage();
    setSectionsState(synced);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Réinitialiser le filtre d'impression après la fin de l'impression
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setPrintMonthId(null);
    window.addEventListener("afterprint", handler);
    return () => window.removeEventListener("afterprint", handler);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("eleves").select("*").order("nom").order("prenom");
      setSupabaseEleves((data ?? []) as EleveRow[]);
    })();
  }, []);

  const selectedEleve = eleves.find((e) => e.id === selectedId);
  const bulletin = selectedId ? getBulletinEleve(selectedId) : null;
  // refresh forces re-read from storage after evaluation/commentaire change
  void refresh;

  useEffect(() => {
    const eleveId = selectedEleve?.supabaseEleveId;
    if (eleveId == null) {
      setSyntheseEval(null);
      return;
    }
    setLoadingSynthese(true);
    Promise.all([getResultatsByEleve(eleveId), getDicteeScoresByEleves()])
      .then(([rows, dicteeByEleve]) => {
        const scores = dicteeByEleve[String(eleveId)] as DicteeScoresForBulletin | undefined;
        setSyntheseEval(computeSyntheseBulletin(rows, scores ?? null));
      })
      .catch(() => setSyntheseEval(null))
      .finally(() => setLoadingSynthese(false));
  }, [selectedEleve?.id, selectedEleve?.supabaseEleveId]);

  const handleAddEleve = (e: React.FormEvent) => {
    e.preventDefault();
    const prenom = newPrenom.trim();
    if (!prenom) return;
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const eleve = addEleveBulletin(prenom, dataUrl);
        setEleves(getElevesBulletin());
        setSelectedId(eleve.id);
        setNewPrenom("");
        setPhotoFile(null);
      };
      reader.readAsDataURL(photoFile);
    } else {
      const eleve = addEleveBulletin(prenom);
      setEleves(getElevesBulletin());
      setSelectedId(eleve.id);
      setNewPrenom("");
    }
  };

  const handleRemoveEleve = (id: string) => {
    if (!window.confirm("Supprimer cet élève du bulletin ?")) return;
    removeEleveBulletin(id);
    setEleves(getElevesBulletin());
    if (selectedId === id) setSelectedId(null);
  };

  const handlePhotoChange = (id: string, file: File | null) => {
    if (!file) {
      updateEleveBulletin(id, { photoDataUrl: null });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        updateEleveBulletin(id, { photoDataUrl: reader.result as string });
        setEleves(getElevesBulletin());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetEvaluation = (
    eleveId: string,
    sectionId: string,
    attenduId: string,
    role: "enfant" | "enseignant",
    niveau: NiveauAcquisition
  ) => {
    setEvaluation(eleveId, sectionId, attenduId, role, niveau);
    setRefresh((r) => r + 1);
  };

  const handleSetCommentaire = (
    eleveId: string,
    sectionId: string,
    attenduId: string,
    commentaire: string
  ) => {
    setCommentaire(eleveId, sectionId, attenduId, commentaire);
    setRefresh((r) => r + 1);
  };

  const handleSaveAttenduEdit = async () => {
    if (!editingAttendu) return;
    updateAttendu(editingAttendu.sectionId, editingAttendu.attenduId, editingAttendu.libelle);
    const nextSections = getSections();
    setSectionsState(nextSections);
    try {
      await pushLocalBulletinSectionsTemplateToSupabase();
    } catch (e) {
      console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
    }
    setEditingAttendu(null);
  };

  const handleAddAttenduLine = async (sectionId: string) => {
    const libelle = window.prompt("Libellé du nouvel attendu :");
    if (libelle?.trim()) {
      addAttendu(sectionId, libelle);
      const nextSections = getSections();
      setSectionsState(nextSections);
      try {
        await pushLocalBulletinSectionsTemplateToSupabase();
      } catch (e) {
        console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
      }
    }
  };

  const handlePrint = () => {
    if (!selectedEleve) return;
    setCollapsedSections(new Set());
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleSetSectionComment = (eleveId: string, sectionId: string, comment: string) => {
    setSectionComment(eleveId, sectionId, comment);
    setRefresh((r) => r + 1);
  };

  const sectionComportement = sections.find((s) => s.id === "comportement");

  const sectionsById = new Map(sections.map((s) => [s.id, s]));

  const structuredMonths = BULLETIN_MONTHS.map((month) => {
    const subjects = BULLETIN_SUBJECTS.map((subject) => {
      if ("subparts" in subject && subject.subparts) {
        const subparts = subject.subparts.map((sub) => {
          const id = `mois-${month.id}-${subject.id}-${sub.id}`;
          const section = sectionsById.get(id) ?? {
            id,
            titre: `${month.label} — ${subject.label} — ${sub.label}`,
            attendus: [],
          };
          return { ...sub, section };
        });
        return { ...subject, subparts };
      }
      const id = `mois-${month.id}-${subject.id}`;
      const section = sectionsById.get(id) ?? {
        id,
        titre: `${month.label} — ${subject.label}`,
        attendus: [],
      };
      return { ...subject, section };
    });
    return { ...month, subjects };
  });

  const partOptions: SelectedPart[] = [];
  for (const subject of BULLETIN_SUBJECTS) {
    if ("subparts" in subject && subject.subparts) {
      for (const sub of subject.subparts) {
        partOptions.push({
          subjectId: subject.id,
          subjectLabel: subject.label,
          subpartId: sub.id,
          subpartLabel: sub.label,
        });
      }
    } else {
      partOptions.push({
        subjectId: subject.id,
        subjectLabel: subject.label,
      });
    }
  }

  const buildBulletinData = useCallback(
    (
      monthId: BulletinMonthId,
      monthLabel: string,
      monthSections: SectionAttendus[]
    ): BulletinEnvoyeData => {
      const comportement: BulletinEnvoyeLigne[] = sectionComportement
        ? sectionComportement.attendus.map((a) => {
            const line = bulletin?.sections["comportement"]?.[a.id];
            return {
              libelle: a.libelle,
              enfant: line?.enfant ?? null,
              enseignant: line?.enseignant ?? null,
              commentaire: line?.commentaire ?? "",
            };
          })
        : [];
      const attendus: BulletinEnvoyeLigne[] = [];
      for (const section of monthSections) {
        for (const a of section.attendus) {
          const line = bulletin?.sections[section.id]?.[a.id];
          attendus.push({
            libelle: `${section.titre} — ${a.libelle}`,
            enseignant: line?.enseignant ?? null,
            commentaire: line?.commentaire ?? "",
          });
        }
      }
      return {
        sectionTitle: monthLabel,
        commentaireMois: getSectionComment(
          selectedEleve!.id,
          `mois-${monthId}-commentaire`
        ),
        comportement,
        attendus,
      };
    },
    [bulletin, sectionComportement, selectedEleve]
  );

  const handleEnvoyerBulletinMois = async (
    monthId: BulletinMonthId,
    monthLabel: string,
    monthSections: SectionAttendus[]
  ) => {
    if (!selectedEleve) return;
    const supabaseId = selectedEleve.supabaseEleveId ?? null;
    if (supabaseId == null) {
      alert(
        "Pour envoyer le bulletin à l'enfant, lie d'abord cet élève à un élève de l'app (menu à côté du prénom dans la liste)."
      );
      return;
    }
    setSendingSection(`mois-${monthId}`);
    try {
      const data = buildBulletinData(monthId, monthLabel, monthSections);
      await saveBulletinEnvoye(
        String(supabaseId),
        `mois-${monthId}`,
        monthLabel,
        data
      );
      alert(`Bulletin « ${monthLabel} » envoyé à l'enfant.`);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : (() => {
              try {
                return JSON.stringify(e);
              } catch {
                return String(e);
              }
            })();
      console.error("handleEnvoyerBulletinMois error:", msg, e);
      alert(`Erreur lors de l'envoi : ${msg}\n\nVérifiez que la table bulletins_envoyes existe dans Supabase (voir supabase-bulletins-envoyes.sql).`);
    } finally {
      setSendingSection(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-[#2d4a3e]">
      <div className="no-print">
        <ForetMagiqueBackground />
      </div>

      <header className="relative z-10 border-b border-[#2d4a3e]/10 bg-[#fef9f3]/95 backdrop-blur-md no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link
            href="/enseignant"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#2d4a3e]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd4a3]/80 text-[#2d4a3e]">
              <IconLeaf />
            </span>
            Bulletin
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {!sections.some((s) => s.id.startsWith("mois-")) && (
              <button
                type="button"
                onClick={async () => {
                  if (addProgrammationSectionsIfMissing()) {
                    setSectionsState(getSections());
                    try {
                      await pushLocalBulletinSectionsTemplateToSupabase();
                    } catch (e) {
                      console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
                    }
                  }
                  await load();
                }}
                className="rounded-full bg-[#4a7c5a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3d6b4d]"
              >
                Ajouter la programmation par mois
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditAttendus(!editAttendus)}
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              {editAttendus ? "Masquer" : "Modifier les attendus"}
            </button>
            <Link
              href="/enseignant"
              className="rounded-full bg-[#2d4a3e]/10 px-4 py-2 text-sm font-medium text-[#2d4a3e] transition hover:bg-[#2d4a3e]/20"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="bulletin-layout relative z-10 mx-auto flex max-w-6xl flex-col gap-6 p-5 lg:flex-row lg:gap-8">
        {/* Liste des élèves */}
        <aside className="no-print w-full shrink-0 rounded-2xl bg-white/95 p-5 shadow-lg lg:w-72">
          <h2 className="font-display text-lg text-[#2d4a3e]">Élèves</h2>
          <form onSubmit={handleAddEleve} className="mt-3 flex flex-col gap-2">
            <input
              type="text"
              value={newPrenom}
              onChange={(e) => setNewPrenom(e.target.value)}
              placeholder="Prénom"
              className="rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e]"
            />
            <label className="flex items-center gap-2 text-sm text-[#2d4a3e]/80">
              <span>Photo (optionnel)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={!newPrenom.trim()}
              className="rounded-xl bg-[#4a7c5a] px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Ajouter
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {eleves.map((e) => (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                  selectedId === e.id
                    ? "border-[#4a7c5a] bg-[#a8d5ba]/30"
                    : "border-[#2d4a3e]/10 bg-white/80 hover:bg-[#2d4a3e]/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#2d4a3e]/10">
                    {e.photoDataUrl ? (
                      <img
                        src={e.photoDataUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl text-[#2d4a3e]/50">
                        👤
                      </span>
                    )}
                  </div>
                  <span className="truncate font-medium text-[#2d4a3e]">
                    {e.prenom}
                  </span>
                </button>
                <select
                  className="shrink-0 max-w-[120px] rounded border border-[#2d4a3e]/20 bg-white px-1 py-0.5 text-xs text-[#2d4a3e]"
                  title="Lier à un élève de l'app (pour envoyer le bulletin)"
                  value={e.supabaseEleveId ?? ""}
                  onChange={(ev) => {
                    const v = ev.target.value;
                    updateEleveBulletin(e.id, {
                      supabaseEleveId: v === "" ? null : v,
                    });
                    setEleves(getElevesBulletin());
                  }}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <option value="">Non lié</option>
                  {supabaseEleves.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
                </select>
                <label className="shrink-0 cursor-pointer text-[#2d4a3e]/60 hover:text-[#4a7c5a]" title="Changer la photo">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      if (f) handlePhotoChange(e.id, f);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveEleve(e.id)}
                  className="shrink-0 text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {eleves.length === 0 && (
            <p className="mt-3 text-sm text-[#2d4a3e]/60">
              Ajoutez un élève pour commencer.
            </p>
          )}
        </aside>

        {/* Bulletin de l'élève sélectionné */}
        <div
          id="bulletin-print-area"
          className="min-w-0 flex-1 rounded-2xl bg-white/95 p-6 shadow-lg"
          data-print-month={printMonthId ?? ""}
        >
          {/* En-tête d'impression (première page uniquement, car placé au début du flux) */}
          <div className="print-only mb-4">
            <h1 className="font-display text-xl text-[#2d4a3e]">M. Vincent</h1>
          </div>
          {!selectedEleve ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#2d4a3e]/70">
              <p className="text-lg">Sélectionnez un élève ou ajoutez-en un.</p>
            </div>
          ) : (
            <>
              {/* Vue Par mois / Par matière + Imprimer */}
              <div className="no-print mb-4 flex flex-wrap items-center justify-end gap-3">
                <span className="text-sm font-medium text-[#2d4a3e]/80">
                  Affichage :
                </span>
                <div className="flex rounded-xl border border-[#2d4a3e]/20 bg-white/80 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("mois");
                      setSelectedPart(null);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      viewMode === "mois"
                        ? "bg-[#4a7c5a] text-white"
                        : "text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/10"
                    }`}
                  >
                    Par mois
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("matiere")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      viewMode === "matiere"
                        ? "bg-[#4a7c5a] text-white"
                        : "text-[#2d4a3e]/80 hover:bg-[#2d4a3e]/10"
                    }`}
                  >
                    Par matière
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl bg-[#4a7c5a] px-5 py-2.5 font-semibold text-white shadow transition hover:bg-[#3d6b4d]"
                >
                  <span aria-hidden>🖨️</span>
                  Imprimer / Enregistrer en PDF
                </button>
              </div>

              {/* En-tête : photo + prénom */}
              <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-[#2d4a3e]/10 pb-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#2d4a3e]/20 bg-[#2d4a3e]/5">
                  {selectedEleve.photoDataUrl ? (
                    <img
                      src={selectedEleve.photoDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-4xl text-[#2d4a3e]/40">
                      👤
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#2d4a3e]/70">Prénom</p>
                  <h1 className="font-display text-2xl text-[#2d4a3e]">
                    {selectedEleve.prenom}
                  </h1>
                </div>
              </div>

              {/* Synthèse des évaluations (points par partie et par période) */}
              {selectedEleve.supabaseEleveId != null && (
                <section className="mb-6 rounded-xl border border-[#2d4a3e]/10 bg-white/50 overflow-hidden">
                  <h2 className="border-b border-[#2d4a3e]/10 px-4 py-3 font-display text-lg text-[#2d4a3e]">
                    Synthèse des évaluations (application)
                  </h2>
                  {loadingSynthese ? (
                    <p className="p-4 text-sm text-[#2d4a3e]/60">Chargement…</p>
                  ) : syntheseEval ? (
                    <div className="overflow-x-auto px-4 pb-4">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#2d4a3e]/20">
                            <th className="pb-2 pr-4 text-left font-medium text-[#2d4a3e]">
                              Partie
                            </th>
                            <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                              P1 (août–oct.)
                            </th>
                            <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                              P2 (nov.–fév.)
                            </th>
                            <th className="pb-2 px-2 text-center font-medium text-[#2d4a3e]">
                              P3 (mars–juin)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {BULLETIN_SYNTHESE_CATEGORIES.map((cat) => (
                            <tr
                              key={cat.id}
                              className="border-b border-[#2d4a3e]/10"
                            >
                              <td className="py-2 pr-4 text-[#2d4a3e]">
                                {cat.label}
                              </td>
                              <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                                {formatNoteSurBarème(
                                  syntheseEval[cat.id].P1,
                                  cat.maxPoints
                                )}
                              </td>
                              <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                                {formatNoteSurBarème(
                                  syntheseEval[cat.id].P2,
                                  cat.maxPoints
                                )}
                              </td>
                              <td className="py-2 px-2 text-center text-[#2d4a3e]/90">
                                {formatNoteSurBarème(
                                  syntheseEval[cat.id].P3,
                                  cat.maxPoints
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-[#2d4a3e]/60">
                      Aucun résultat d&apos;évaluation pour cet élève.
                    </p>
                  )}
                </section>
              )}

              {/* Édition des attendus (toggle) */}
              {editAttendus && (
                <section className="no-print mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <h3 className="font-display text-base text-[#2d4a3e]">
                    Gérer les attendus
                  </h3>
                  {sections.map((section) => (
                    <div key={section.id} className="mt-3">
                      <p className="text-sm font-medium text-[#2d4a3e]/80">
                        {section.titre}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {section.attendus.map((a) => (
                          <li
                            key={a.id}
                            className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2"
                          >
                            {editingAttendu?.attenduId === a.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingAttendu.libelle}
                                  onChange={(e) =>
                                    setEditingAttendu((prev) =>
                                      prev ? { ...prev, libelle: e.target.value } : null
                                    )
                                  }
                                  className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveAttenduEdit}
                                  className="text-sm text-[#4a7c5a]"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingAttendu(null)}
                                  className="text-sm text-[#2d4a3e]/60"
                                >
                                  Annuler
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="min-w-0 flex-1 text-sm text-[#2d4a3e]">
                                  {a.libelle}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      moveAttendu(section.id, a.id, "up");
                                      const nextSections = getSections();
                                      setSectionsState(nextSections);
                                      try {
                                        await pushLocalBulletinSectionsTemplateToSupabase();
                                      } catch (e) {
                                        console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
                                      }
                                    }}
                                    className="text-xs text-[#2d4a3e]/70 hover:text-[#2d4a3e]"
                                    title="Monter"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      moveAttendu(section.id, a.id, "down");
                                      const nextSections = getSections();
                                      setSectionsState(nextSections);
                                      try {
                                        await pushLocalBulletinSectionsTemplateToSupabase();
                                      } catch (e) {
                                        console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
                                      }
                                    }}
                                    className="text-xs text-[#2d4a3e]/70 hover:text-[#2d4a3e]"
                                    title="Descendre"
                                  >
                                    ↓
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingAttendu({
                                      sectionId: section.id,
                                      attenduId: a.id,
                                      libelle: a.libelle,
                                    })
                                  }
                                  className="text-xs text-[#4a7c5a]"
                                >
                                  Modifier
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm("Supprimer cet attendu ?")) {
                                        removeAttendu(section.id, a.id);
                                        const nextSections = getSections();
                                        setSectionsState(nextSections);
                                        try {
                                          await pushLocalBulletinSectionsTemplateToSupabase();
                                        } catch (e) {
                                          console.error("pushLocalBulletinSectionsTemplateToSupabase failed:", e);
                                        }
                                      }
                                    }}
                                  className="text-xs text-red-600"
                                >
                                  Suppr.
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                        <li>
                          <button
                            type="button"
                            onClick={() => handleAddAttenduLine(section.id)}
                            className="text-sm text-[#4a7c5a] underline"
                          >
                            + Ajouter un attendu
                          </button>
                        </li>
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              {/* Vue par mois : comportement + matières + commentaire du mois + bouton Envoyer */}
              {viewMode === "mois" && (
                <>
              {structuredMonths.map((month) => {
                if (printMonthId && month.id !== printMonthId) {
                  // En mode impression filtrée sur un mois, on n'affiche que ce mois.
                  return null;
                }
                const monthSections: SectionAttendus[] = [];
                for (const subject of month.subjects) {
                  if ("subparts" in subject && subject.subparts) {
                    for (const sub of subject.subparts) {
                      if (sub.section) monthSections.push(sub.section);
                    }
                  } else if (subject.section) {
                    monthSections.push(subject.section);
                  }
                }

                const monthCommentSectionId = `mois-${month.id}-commentaire`;
                const commentaireMoisValue = getSectionComment(
                  selectedEleve.id,
                  monthCommentSectionId
                );

                return (
                  <div
                    key={month.id}
                    className="mb-10 space-y-6 print-month-page"
                  >
                    <h2 className="font-display text-xl text-[#2d4a3e]">
                      {month.label}
                    </h2>

                    {/* Comportement (répété pour chaque mois) */}
                    {sectionComportement && (
                      <SectionTable
                        section={sectionComportement}
                        bulletin={bulletin}
                        selectedEleve={selectedEleve}
                        collapsedSections={collapsedSections}
                        setCollapsedSections={setCollapsedSections}
                        handleSetEvaluation={handleSetEvaluation}
                        handleSetCommentaire={handleSetCommentaire}
                        showEnfantColumn
                      />
                    )}

                    {/* 7 grandes parties par mois */}
                    {month.subjects.map((subject) => (
                      <div key={subject.id} className="space-y-3">
                        <h3 className="font-display text-lg text-[#2d4a3e]">
                          {subject.label}
                        </h3>
                        {"subparts" in subject && subject.subparts ? (
                          <div className="space-y-3">
                            {subject.subparts.map((sub) =>
                              sub.section ? (
                                <div key={sub.id}>
                                  <h4 className="text-sm font-semibold text-[#2d4a3e]/80">
                                    {sub.label}
                                  </h4>
                                  <SectionTable
                                    section={sub.section}
                                    bulletin={bulletin}
                                    selectedEleve={selectedEleve}
                                    collapsedSections={collapsedSections}
                                    setCollapsedSections={setCollapsedSections}
                                    handleSetEvaluation={handleSetEvaluation}
                                    handleSetCommentaire={handleSetCommentaire}
                                    showEnfantColumn={false}
                                  />
                                </div>
                              ) : null
                            )}
                          </div>
                        ) : subject.section ? (
                          <SectionTable
                            section={subject.section}
                            bulletin={bulletin}
                            selectedEleve={selectedEleve}
                            collapsedSections={collapsedSections}
                            setCollapsedSections={setCollapsedSections}
                            handleSetEvaluation={handleSetEvaluation}
                            handleSetCommentaire={handleSetCommentaire}
                            showEnfantColumn={false}
                          />
                        ) : null}
                      </div>
                    ))}

                    {/* Commentaire du mois : masqué à l'impression si vide */}
                    <div
                      className={
                        commentaireMoisValue.trim() === ""
                          ? "commentaire-mois-empty"
                          : undefined
                      }
                    >
                      <div className="no-print rounded-xl border border-[#2d4a3e]/10 bg-white/50 p-4">
                        <label className="mb-2 block font-display text-base text-[#2d4a3e]">
                          Commentaire du mois — {month.label}
                        </label>
                        <textarea
                          className="min-h-[120px] w-full rounded-xl border border-[#2d4a3e]/20 px-3 py-2 text-[#2d4a3e] placeholder:text-[#2d4a3e]/50"
                          placeholder="Commentaire global pour ce mois…"
                          value={commentaireMoisValue}
                          onChange={(e) =>
                            handleSetSectionComment(
                              selectedEleve.id,
                              monthCommentSectionId,
                              e.target.value
                            )
                          }
                        />
                      </div>
                      {commentaireMoisValue.trim() !== "" && (
                        <div className="print-only rounded-xl border border-[#2d4a3e]/10 bg-white/50 p-4">
                          <h3 className="mb-2 font-display text-base text-[#2d4a3e]">
                            Commentaire du mois — {month.label}
                          </h3>
                          <p className="whitespace-pre-wrap text-[#2d4a3e]/90">
                            {commentaireMoisValue}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Boutons Envoyer / Imprimer le bulletin du mois */}
                    <div className="no-print mt-3 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        disabled={sendingSection === `mois-${month.id}`}
                        onClick={() =>
                          handleEnvoyerBulletinMois(
                            month.id,
                            month.label,
                            monthSections
                          )
                        }
                        className="rounded-xl bg-[#4a7c5a] px-5 py-2.5 font-semibold text-white shadow transition hover:bg-[#3d6b4d] disabled:opacity-50"
                      >
                        {sendingSection === `mois-${month.id}`
                          ? "Envoi…"
                          : "Envoyer le bulletin du mois aux enfants"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCollapsedSections(new Set());
                          setPrintMonthId(month.id);
                          setTimeout(() => {
                            window.print();
                          }, 300);
                        }}
                        className="rounded-xl border border-[#2d4a3e]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#2d4a3e] shadow-sm transition hover:bg-[#2d4a3e]/5"
                      >
                        Imprimer ce mois
                      </button>
                    </div>
                  </div>
                );
              })}
                </>
              )}

              {/* Vue par matière : liste des parties cliquables */}
              {viewMode === "matiere" && !selectedPart && (
                <div className="space-y-4">
                  <p className="text-[#2d4a3e]/80">
                    Cliquez sur une matière pour afficher ses attendus de tous les mois (août-septembre → juin).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {partOptions.map((part) => {
                      const label =
                        "subpartLabel" in part && part.subpartLabel
                          ? `${part.subjectLabel} — ${part.subpartLabel}`
                          : part.subjectLabel;
                      const key =
                        "subpartId" in part && part.subpartId
                          ? `${part.subjectId}-${part.subpartId}`
                          : part.subjectId;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedPart(part)}
                          className="rounded-xl border border-[#2d4a3e]/20 bg-white/90 px-4 py-3 text-left text-sm font-medium text-[#2d4a3e] shadow-sm transition hover:border-[#4a7c5a]/50 hover:bg-[#a8d5ba]/20"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vue par matière : une partie sélectionnée, tous les mois */}
              {viewMode === "matiere" && selectedPart && (
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => setSelectedPart(null)}
                    className="no-print rounded-lg text-sm font-medium text-[#4a7c5a] hover:underline"
                  >
                    ← Retour aux matières
                  </button>
                  <h2 className="font-display text-xl text-[#2d4a3e]">
                    {"subpartLabel" in selectedPart && selectedPart.subpartLabel
                      ? `${selectedPart.subjectLabel} — ${selectedPart.subpartLabel}`
                      : selectedPart.subjectLabel}
                  </h2>
                  {BULLETIN_MONTHS.map((month) => {
                    const sectionId =
                      "subpartId" in selectedPart && selectedPart.subpartId
                        ? `mois-${month.id}-${selectedPart.subjectId}-${selectedPart.subpartId}`
                        : `mois-${month.id}-${selectedPart.subjectId}`;
                    const section = sectionsById.get(sectionId) ?? {
                      id: sectionId,
                      titre: `${month.label} — ${
                        "subpartLabel" in selectedPart && selectedPart.subpartLabel
                          ? `${selectedPart.subjectLabel} — ${selectedPart.subpartLabel}`
                          : selectedPart.subjectLabel
                      }`,
                      attendus: [],
                    };
                    return (
                      <div key={month.id} className="print-month-page">
                        <h3 className="mb-2 font-display text-lg text-[#2d4a3e]">
                          {month.label}
                        </h3>
                        <SectionTable
                          section={section}
                          bulletin={bulletin}
                          selectedEleve={selectedEleve}
                          collapsedSections={collapsedSections}
                          setCollapsedSections={setCollapsedSections}
                          handleSetEvaluation={handleSetEvaluation}
                          handleSetCommentaire={handleSetCommentaire}
                          showEnfantColumn={false}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
