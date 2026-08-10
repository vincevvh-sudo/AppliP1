-- ============================================================
-- Messagerie : répondre à un message + pouvoir supprimer
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Colonne pour les réponses (style WhatsApp)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_message_id);

-- 2. Politique + permission DELETE (manquantes jusqu'ici)
DROP POLICY IF EXISTS "Allow anon delete messages" ON messages;
CREATE POLICY "Allow anon delete messages" ON messages
  FOR DELETE TO anon USING (true);

GRANT SELECT, INSERT, DELETE ON public.messages TO anon;

-- 3. Pour que le Realtime voit aussi les suppressions filtrées par conversation
ALTER TABLE messages REPLICA IDENTITY FULL;
