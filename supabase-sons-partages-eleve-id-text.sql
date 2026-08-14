-- =============================================================================
-- Migration : eleve_id en TEXT pour accepter les UUID des élèves
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
-- Sans ça, le partage « un ou plusieurs élèves » (Lecture de syllabes, etc.) échoue.
-- eleve_id = '0' reste le marqueur « tous les élèves ».
-- =============================================================================

-- 1) sons_partages (exercices)
ALTER TABLE sons_partages
  ALTER COLUMN eleve_id TYPE TEXT USING eleve_id::text;

-- 2) sons_partages_evaluations (évaluations globales par son)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sons_partages_evaluations'
  ) THEN
    ALTER TABLE sons_partages_evaluations
      ALTER COLUMN eleve_id TYPE TEXT USING eleve_id::text;
  END IF;
END $$;

-- 3) sons_partages_eval_niveaux (Éval 1–4, lecture syllabes/mots/…, fluence)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sons_partages_eval_niveaux'
  ) THEN
    ALTER TABLE sons_partages_eval_niveaux
      ALTER COLUMN eleve_id TYPE TEXT USING eleve_id::text;
  END IF;
END $$;
