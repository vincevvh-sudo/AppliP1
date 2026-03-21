-- Messagerie : conversations (groupe + direct) et messages
-- À exécuter dans le SQL Editor de Supabase

-- Conversations : groupe classe (eleve_id NULL) ou direct (eleve_id = un élève)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('groupe', 'direct')),
  eleve_id INT REFERENCES eleves(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (content peut être vide si pièce jointe seule)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('enseignant', 'eleve')),
  eleve_id INT REFERENCES eleves(id) ON DELETE SET NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anon insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anon select conversations" ON conversations;
CREATE POLICY "Allow anon insert conversations" ON conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select conversations" ON conversations FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon all messages" ON messages;
DROP POLICY IF EXISTS "Allow anon insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon select messages" ON messages;
CREATE POLICY "Allow anon insert messages" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select messages" ON messages FOR SELECT TO anon USING (true);

-- Créer la conversation groupe (une seule) si elle n'existe pas
INSERT INTO conversations (type, eleve_id)
SELECT 'groupe', NULL WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE type = 'groupe' AND eleve_id IS NULL);
