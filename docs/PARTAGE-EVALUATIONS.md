# Partage des évaluations — Arbre des mathématiques & Forêt des sons

Ce document décrit **comment réutiliser le même principe de partage** (choisir des élèves, Tous / Aucun, enregistrement Supabase ou secours navigateur) pour **toute nouvelle évaluation** ajoutée plus tard.

> **Vocabulaire** : dans l’app, la section français/sons s’intitule **« Forêt des sons »** (parfois évoquée comme la « rivière de sons ») ; le principe est le même : **partage par élève** via des tables Supabase dédiées.

---

## 1. Mathématiques — modules interactifs (hors feuilles « nombres »)

### Principe

- **Composant UI** : `app/components/PartageMathsModuleForm.tsx` — carte blanche, boutons **Tous** / **Aucun**, cases par élève, **Enregistrer le partage**.
- **Données** : table Supabase `maths_exercices_modules_partages` (`module_id` + `eleve_id` UUID). Script : `supabase-maths-exercices-modules-partages.sql`.
- **Secours sans table** : `app/data/maths-partages.ts` — `exercicesModulesEleves` (localStorage, liste d’UUID par module).
- **Accès côté enfant** : `moduleEstAccessiblePourEleve(moduleId, eleveId)` dans `app/data/maths-modules-partages-storage.ts`.

### Checklist — nouvelle évaluation / exercice dans l’arbre des maths

1. **Identifiant unique**  
   Ajouter un id dans `MathsExerciceModuleId` et une entrée dans `MATHS_EXERCICES_MODULES` (`app/data/maths-exercices-modules.ts`) : `partieId`, titres, `hrefEnfant`, `hrefEnseignant`.

2. **Pages enseignant**  
   - Soit la partie est déjà couverte par `app/enseignant/maths/exercice/[partieId]/page.tsx` (liste dynamique des modules).  
   - Soit page dédiée (ex. `centimetre-metre`, `suite-logique`) : placer **en premier** le bloc  
     `<PartageMathsModuleForm moduleId="…" compact titreAide="Partage aux élèves de l'app. Exécute le SQL Supabase si besoin." />`  
   - Même chose sur **Évaluation** : `app/enseignant/maths/evaluation/[partieId]/page.tsx` pour la partie concernée.

3. **Page enfant**  
   Au début de l’activité : `moduleEstAccessiblePourEleve("<id-module>", session.id)` puis redirection si non autorisé (voir les pages existantes).

4. **Base Supabase**  
   Exécuter le script SQL si la table n’existe pas encore. Les politiques RLS « anon » doivent permettre insert/select/delete comme dans le fichier fourni.

5. **Cohérence visuelle**  
   `main` : `min-h-[100dvh] overflow-x-hidden` ; en-tête avec icône calculatrice comme les autres pages maths.

---

## 2. Forêt des sons (français / phonologie)

### Principe (déjà en place)

- **Fichier métier** : `app/data/sons-partages.ts`
  - Exercices : table `sons_partages` (`son_id`, `eleve_id` ; `eleve_id = 0` = tous).
  - Évaluations : logique séparée (`sons_partages_evaluations`, etc. — voir commentaires dans le fichier).
- **UI centralisée** : `app/enseignant/sons/exercices/page.tsx` — partage par son (liste d’élèves, partage à tous ou sélection).

### Pour une **nouvelle** évaluation dans la Forêt des sons

1. Rattacher l’activité à un **`son_id`** (ou au mécanisme dictée / fluence déjà prévu).
2. Étendre les appels dans `sons-partages.ts` si une **nouvelle table** ou un nouveau type de ligne est nécessaire (sur le même modèle : `son_id` + `eleve_id`).
3. Réutiliser les patterns de la page **Exercices** ou des pages **Évaluation par son** (`app/enseignant/sons/evaluation/[sonId]/page.tsx`) pour l’UI de partage.
4. **Harmonisation visuelle (optionnel)** : reprendre les classes de `PartageMathsModuleForm` (carte `rounded-2xl bg-white/95`, boutons Tous/Aucun) pour coller à l’arbre des maths — sans mélanger les deux systèmes de données (UUID maths vs ids numériques sons).

### Évaluation lecture (syllabes, mots, janvier, phrases)

- **`son_id` fixe** : `lecture` ; **`niveau_id`** : `lecture-syllabes`, `lecture-mots`, `lecture-janvier`, `lecture-phrases` (voir `app/data/lecture-eval-partage.ts`).
- **Partage** : table `sons_partages_eval_niveaux` via `setPartageEvalNiveau("lecture", niveauId, …)` — composant **`PartageLectureEvalForm`** sur chaque page enseignant sous `enseignant/sons/lecture/…`.
- **Liste élève** : `app/enfant/evaluations/page.tsx` inclut ces évaluations quand le partage existe (traitement spécial car `lecture` n’est pas un « son » dans `sons-data.ts`).
- **Accès direct URL** : `LectureEvalAccessGate` + `getNiveauxEvalPartagesPourEleve` sur les pages `enfant/sons/lecture/…`.

### Évaluation écouter (écouter-lire)

- **`son_id` fixe** : `ecouter-lire` ; **`niveau_id`** : `ecouter-chevalier-de-la-nuit`, `ecouter-consignes-1` (`ecouter-lire-eval-partage.ts`).
- **Partage** : même table `sons_partages_eval_niveaux` — composant **`PartageEvalNiveauForm`** sur les pages enseignant de chaque exercice.
- **Liste élève** : section **Écouter-lire** dans `enfant/evaluations` (liens uniquement si partagé).
- **Accès** : **`EvalNiveauAccessGate`** sur `enfant/ecouter-lire/…`.

---

## 3. Résumé

| Zone | Composant / fichier clé | Table Supabase (typique) |
|------|-------------------------|---------------------------|
| Maths (modules) | `PartageMathsModuleForm`, `maths-modules-partages-storage.ts` | `maths_exercices_modules_partages` |
| Forêt des sons | `sons-partages.ts`, page exercices enseignant | `sons_partages`, `sons_partages_evaluations` |
| Lecture (éval.) | `PartageLectureEvalForm` → `PartageEvalNiveauForm`, `lecture-eval-partage.ts` | `sons_partages_eval_niveaux` (`son_id` = `lecture`) |
| Écouter-lire | `PartageEvalNiveauForm`, `ecouter-lire-eval-partage.ts` | `sons_partages_eval_niveaux` (`son_id` = `ecouter-lire`) |

Toute nouvelle fonctionnalité doit **documenter ici** en une phrase si un troisième type de partage apparaît.
