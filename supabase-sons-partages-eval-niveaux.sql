-- =============================================================================
-- Partage des évaluations 1 à la fois (Éval 1, 2, 3 ou 4) par son.
-- À exécuter dans le SQL Editor Supabase si tu utilises "Partager cette évaluation"
-- (tous les élèves ou un seul élève).
-- =============================================================================

-- Table : une ligne = une évaluation (niveau) partagée à un élève ou à tous.
-- son_id + niveau_id (ex: "s-eval-1") + eleve_id (0 = tous les élèves).

CREATE TABLE IF NOT EXISTS sons_partages_eval_niveaux (
  son_id TEXT NOT NULL,
  niveau_id TEXT NOT NULL,
  eleve_id INT NOT NULL,
  PRIMARY KEY (son_id, niveau_id, eleve_id)
);

ALTER TABLE sons_partages_eval_niveaux ENABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes (noms EN ou FR), puis les recréer
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sons_partages_eval_niveaux'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON sons_partages_eval_niveaux', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow anon select" ON sons_partages_eval_niveaux
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON sons_partages_eval_niveaux
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON sons_partages_eval_niveaux
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON sons_partages_eval_niveaux
  FOR DELETE TO anon USING (true);
