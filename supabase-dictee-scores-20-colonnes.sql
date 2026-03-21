-- Migration : ajouter les colonnes dictee_4 à dictee_20 si la table avait seulement dictee_1, dictee_2, dictee_3.
-- Exécuter dans le SQL Editor Supabase après supabase-dictee-scores.sql (ou si la table existe déjà).

ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_4 SMALLINT CHECK (dictee_4 >= 0 AND dictee_4 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_5 SMALLINT CHECK (dictee_5 >= 0 AND dictee_5 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_6 SMALLINT CHECK (dictee_6 >= 0 AND dictee_6 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_7 SMALLINT CHECK (dictee_7 >= 0 AND dictee_7 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_8 SMALLINT CHECK (dictee_8 >= 0 AND dictee_8 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_9 SMALLINT CHECK (dictee_9 >= 0 AND dictee_9 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_10 SMALLINT CHECK (dictee_10 >= 0 AND dictee_10 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_11 SMALLINT CHECK (dictee_11 >= 0 AND dictee_11 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_12 SMALLINT CHECK (dictee_12 >= 0 AND dictee_12 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_13 SMALLINT CHECK (dictee_13 >= 0 AND dictee_13 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_14 SMALLINT CHECK (dictee_14 >= 0 AND dictee_14 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_15 SMALLINT CHECK (dictee_15 >= 0 AND dictee_15 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_16 SMALLINT CHECK (dictee_16 >= 0 AND dictee_16 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_17 SMALLINT CHECK (dictee_17 >= 0 AND dictee_17 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_18 SMALLINT CHECK (dictee_18 >= 0 AND dictee_18 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_19 SMALLINT CHECK (dictee_19 >= 0 AND dictee_19 <= 5);
ALTER TABLE dictee_scores ADD COLUMN IF NOT EXISTS dictee_20 SMALLINT CHECK (dictee_20 >= 0 AND dictee_20 <= 5);
