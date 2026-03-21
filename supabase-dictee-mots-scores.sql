-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Table pour les dictées de mots (16 dictées, points sur 5 par élève).

CREATE TABLE IF NOT EXISTS dictee_mots_scores (
  eleve_id INT PRIMARY KEY REFERENCES eleves(id) ON DELETE CASCADE,
  mot_1 SMALLINT CHECK (mot_1 >= 0 AND mot_1 <= 5),
  mot_2 SMALLINT CHECK (mot_2 >= 0 AND mot_2 <= 5),
  mot_3 SMALLINT CHECK (mot_3 >= 0 AND mot_3 <= 5),
  mot_4 SMALLINT CHECK (mot_4 >= 0 AND mot_4 <= 5),
  mot_5 SMALLINT CHECK (mot_5 >= 0 AND mot_5 <= 5),
  mot_6 SMALLINT CHECK (mot_6 >= 0 AND mot_6 <= 5),
  mot_7 SMALLINT CHECK (mot_7 >= 0 AND mot_7 <= 5),
  mot_8 SMALLINT CHECK (mot_8 >= 0 AND mot_8 <= 5),
  mot_9 SMALLINT CHECK (mot_9 >= 0 AND mot_9 <= 5),
  mot_10 SMALLINT CHECK (mot_10 >= 0 AND mot_10 <= 5),
  mot_11 SMALLINT CHECK (mot_11 >= 0 AND mot_11 <= 5),
  mot_12 SMALLINT CHECK (mot_12 >= 0 AND mot_12 <= 5),
  mot_13 SMALLINT CHECK (mot_13 >= 0 AND mot_13 <= 5),
  mot_14 SMALLINT CHECK (mot_14 >= 0 AND mot_14 <= 5),
  mot_15 SMALLINT CHECK (mot_15 >= 0 AND mot_15 <= 5),
  mot_16 SMALLINT CHECK (mot_16 >= 0 AND mot_16 <= 5)
);

ALTER TABLE dictee_mots_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON dictee_mots_scores
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON dictee_mots_scores
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON dictee_mots_scores
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

