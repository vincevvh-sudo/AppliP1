-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Table pour l'évaluation "Centimètre ou mètre" (Grandeur).
-- L'enfant fait les 20 questions dans l'app ; son score (sur 20 puis sur 10) est enregistré ici.
-- eleves.id doit être de type UUID. Si vous aviez créé la table avec eleve_id INT, exécutez d'abord : DROP TABLE IF EXISTS centimetre_metre;

CREATE TABLE IF NOT EXISTS centimetre_metre (
  eleve_id UUID PRIMARY KEY REFERENCES eleves(id) ON DELETE CASCADE,
  points_obtenus SMALLINT NOT NULL DEFAULT 0 CHECK (points_obtenus >= 0 AND points_obtenus <= 20),
  score_sur_10 NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (score_sur_10 >= 0 AND score_sur_10 <= 10),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE centimetre_metre ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON centimetre_metre
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON centimetre_metre
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON centimetre_metre
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
