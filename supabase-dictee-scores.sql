-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Table pour l'Évaluation 5 — Dictées (points sur 5 par élève : Dictée 1 à 20)

CREATE TABLE IF NOT EXISTS dictee_scores (
  eleve_id INT PRIMARY KEY REFERENCES eleves(id) ON DELETE CASCADE,
  dictee_1 SMALLINT CHECK (dictee_1 >= 0 AND dictee_1 <= 5),
  dictee_2 SMALLINT CHECK (dictee_2 >= 0 AND dictee_2 <= 5),
  dictee_3 SMALLINT CHECK (dictee_3 >= 0 AND dictee_3 <= 5),
  dictee_4 SMALLINT CHECK (dictee_4 >= 0 AND dictee_4 <= 5),
  dictee_5 SMALLINT CHECK (dictee_5 >= 0 AND dictee_5 <= 5),
  dictee_6 SMALLINT CHECK (dictee_6 >= 0 AND dictee_6 <= 5),
  dictee_7 SMALLINT CHECK (dictee_7 >= 0 AND dictee_7 <= 5),
  dictee_8 SMALLINT CHECK (dictee_8 >= 0 AND dictee_8 <= 5),
  dictee_9 SMALLINT CHECK (dictee_9 >= 0 AND dictee_9 <= 5),
  dictee_10 SMALLINT CHECK (dictee_10 >= 0 AND dictee_10 <= 5),
  dictee_11 SMALLINT CHECK (dictee_11 >= 0 AND dictee_11 <= 5),
  dictee_12 SMALLINT CHECK (dictee_12 >= 0 AND dictee_12 <= 5),
  dictee_13 SMALLINT CHECK (dictee_13 >= 0 AND dictee_13 <= 5),
  dictee_14 SMALLINT CHECK (dictee_14 >= 0 AND dictee_14 <= 5),
  dictee_15 SMALLINT CHECK (dictee_15 >= 0 AND dictee_15 <= 5),
  dictee_16 SMALLINT CHECK (dictee_16 >= 0 AND dictee_16 <= 5),
  dictee_17 SMALLINT CHECK (dictee_17 >= 0 AND dictee_17 <= 5),
  dictee_18 SMALLINT CHECK (dictee_18 >= 0 AND dictee_18 <= 5),
  dictee_19 SMALLINT CHECK (dictee_19 >= 0 AND dictee_19 <= 5),
  dictee_20 SMALLINT CHECK (dictee_20 >= 0 AND dictee_20 <= 5)
);

ALTER TABLE dictee_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON dictee_scores
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON dictee_scores
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON dictee_scores
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Si la table existait déjà avec seulement dictee_1, dictee_2, dictee_3, exécuter les lignes suivantes pour ajouter les colonnes :
-- ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_4 SMALLINT CHECK (dictee_4 >= 0 AND dictee_4 <= 5);
-- ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_5 SMALLINT CHECK (dictee_5 >= 0 AND dictee_5 <= 5);
-- ... (répéter pour dictee_6 à dictee_20)
