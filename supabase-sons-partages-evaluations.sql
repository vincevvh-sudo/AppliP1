-- =============================================================================
-- COPIER TOUT CE FICHIER dans le SQL Editor de Supabase (Dashboard > SQL Editor
-- > New query), puis cliquer sur Run. Cela crée la table pour que le choix
-- "Évaluations visibles par les enfants : Oui" soit bien enregistré.
-- =============================================================================

-- Table pour le partage des ÉVALUATIONS (séparé des exercices).
-- Les exercices (Phono 1, 2, Phono Image 1, 2) sont gérés par sons_partages.
-- Les évaluations (Éval 1, 2, 3, 4) ne sont visibles par l'enfant que si présentes ici.
-- eleve_id = 0 => évaluations partagées à tous les élèves pour ce son.

CREATE TABLE IF NOT EXISTS sons_partages_evaluations (
  son_id TEXT NOT NULL,
  eleve_id INT NOT NULL,
  PRIMARY KEY (son_id, eleve_id)
);

ALTER TABLE sons_partages_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON sons_partages_evaluations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON sons_partages_evaluations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON sons_partages_evaluations
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON sons_partages_evaluations
  FOR DELETE TO anon USING (true);
