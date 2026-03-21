-- ============================================================
-- MESSAGERIE ROYAUME DES LETTRES - SCRIPT COMPLET
-- Copie-colle tout ce script dans le SQL Editor de Supabase
-- puis clique sur "Run"
-- ============================================================

-- 1. CRÉER LES TABLES (si la table eleves existe déjà)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('groupe', 'direct')),
  eleve_id INT REFERENCES eleves(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 2. S'ASSURER QUE content PEUT ÊTRE VIDE (pièces jointes seules)
DO $$ BEGIN
  ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. AJOUTER LES COLONNES PIÈCES JOINTES SI MANQUANTES
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 4. DROPPER TOUTES LES ANCIENNES POLITIQUES RLS
DROP POLICY IF EXISTS "Allow anon all conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anon all messages" ON messages;
DROP POLICY IF EXISTS "Allow anon insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anon select conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anon insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon select messages" ON messages;

-- 5. ACTIVER RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. CRÉER LES NOUVELLES POLITIQUES RLS
CREATE POLICY "Allow anon insert conversations" ON conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select conversations" ON conversations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert messages" ON messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select messages" ON messages
  FOR SELECT TO anon USING (true);

-- 7. PERMISSIONS EXPLICITES (souvent nécessaires pour que anon puisse écrire)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.conversations TO anon;
GRANT SELECT, INSERT ON public.messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 8. CRÉER LA CONVERSATION GROUPE SI ELLES N'EXISTE PAS
INSERT INTO conversations (type, eleve_id)
SELECT 'groupe', NULL 
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE type = 'groupe' AND eleve_id IS NULL);

-- Terminé ! Les messages sont conservés jusqu'au 15 juillet.
-- Pour tout effacer le 15 juillet, exécutez le script :
-- supabase-messagerie-nettoyage-15-juillet.sql
