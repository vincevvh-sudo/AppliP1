-- =============================================================================
-- Messagerie : eleve_id compatible UUID (élèves en UUID)
-- À exécuter UNE FOIS dans Supabase → SQL Editor → Run.
-- Sans ça, un élève ne peut pas créer la conversation « Avec mon maître »
-- ni enregistrer un message (eleve_id était encore en INT).
-- =============================================================================

-- 1) Enlever les anciennes clés étrangères INT → eleves
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_eleve_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_eleve_id_fkey;

-- 2) Passer eleve_id en TEXT (accepte les UUID des élèves)
ALTER TABLE conversations
  ALTER COLUMN eleve_id TYPE TEXT USING
    CASE WHEN eleve_id IS NULL THEN NULL ELSE eleve_id::text END;

ALTER TABLE messages
  ALTER COLUMN eleve_id TYPE TEXT USING
    CASE WHEN eleve_id IS NULL THEN NULL ELSE eleve_id::text END;

-- 3) S'assurer que la conversation groupe existe
INSERT INTO conversations (type, eleve_id)
SELECT 'groupe', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM conversations WHERE type = 'groupe' AND eleve_id IS NULL
);
