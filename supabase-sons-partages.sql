-- ============================================================
-- Partage des EXERCICES de la Forêt des sons (Phono, images…)
-- À exécuter dans le SQL Editor de Supabase si la table n'existe pas.
-- ============================================================

CREATE TABLE IF NOT EXISTS sons_partages (
  son_id TEXT NOT NULL,
  eleve_id TEXT NOT NULL DEFAULT '0',
  PRIMARY KEY (son_id, eleve_id)
);

ALTER TABLE sons_partages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select" ON sons_partages;
DROP POLICY IF EXISTS "Allow anon insert" ON sons_partages;
DROP POLICY IF EXISTS "Allow anon update" ON sons_partages;
DROP POLICY IF EXISTS "Allow anon delete" ON sons_partages;

CREATE POLICY "Allow anon select" ON sons_partages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert" ON sons_partages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update" ON sons_partages FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete" ON sons_partages FOR DELETE TO anon USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sons_partages TO anon;
