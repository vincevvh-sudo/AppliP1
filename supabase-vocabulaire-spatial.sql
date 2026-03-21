-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Table pour l'évaluation Vocabulaire spatial (Espace et géométrie).
-- L'enseignant saisit les points par phrase (14 phrases × 1 pt) ; l'enfant voit son score sur 10.

CREATE TABLE IF NOT EXISTS vocabulaire_spatial (
  eleve_id INT PRIMARY KEY REFERENCES eleves(id) ON DELETE CASCADE,
  points_obtenus SMALLINT NOT NULL DEFAULT 0 CHECK (points_obtenus >= 0 AND points_obtenus <= 14),
  score_sur_10 NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (score_sur_10 >= 0 AND score_sur_10 <= 10),
  phrase_scores JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vocabulaire_spatial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON vocabulaire_spatial
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON vocabulaire_spatial
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON vocabulaire_spatial
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
