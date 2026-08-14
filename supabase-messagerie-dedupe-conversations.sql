-- =============================================================================
-- Messagerie : nettoyer les conversations en double + empêcher les futurs doublons
-- À exécuter UNE FOIS dans Supabase → SQL Editor → Run
-- (corrige l'erreur PGRST116 : "multiple rows returned")
-- =============================================================================

-- 1) Conversations directes en double pour le même eleve_id :
--    garder la plus ancienne (MIN id), déplacer les messages, supprimer le reste.
DO $$
DECLARE
  r RECORD;
  keep_id BIGINT;
  dup_id BIGINT;
BEGIN
  FOR r IN
    SELECT eleve_id
    FROM conversations
    WHERE type = 'direct' AND eleve_id IS NOT NULL
    GROUP BY eleve_id
    HAVING COUNT(*) > 1
  LOOP
    SELECT MIN(id) INTO keep_id
    FROM conversations
    WHERE type = 'direct' AND eleve_id = r.eleve_id;

    FOR dup_id IN
      SELECT id FROM conversations
      WHERE type = 'direct' AND eleve_id = r.eleve_id AND id <> keep_id
    LOOP
      UPDATE messages SET conversation_id = keep_id WHERE conversation_id = dup_id;
      DELETE FROM conversations WHERE id = dup_id;
    END LOOP;
  END LOOP;
END $$;

-- 2) Conversations « groupe » en double
DO $$
DECLARE
  keep_id BIGINT;
  dup_id BIGINT;
BEGIN
  SELECT MIN(id) INTO keep_id
  FROM conversations
  WHERE type = 'groupe' AND eleve_id IS NULL;

  IF keep_id IS NOT NULL THEN
    FOR dup_id IN
      SELECT id FROM conversations
      WHERE type = 'groupe' AND eleve_id IS NULL AND id <> keep_id
    LOOP
      UPDATE messages SET conversation_id = keep_id WHERE conversation_id = dup_id;
      DELETE FROM conversations WHERE id = dup_id;
    END LOOP;
  END IF;
END $$;

-- 3) Index uniques pour éviter que ça se reproduise
CREATE UNIQUE INDEX IF NOT EXISTS conversations_direct_eleve_unique
  ON conversations (eleve_id)
  WHERE type = 'direct' AND eleve_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_groupe_unique
  ON conversations (type)
  WHERE type = 'groupe';
