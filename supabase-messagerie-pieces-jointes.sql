-- Pièces jointes messagerie : à exécuter si vous avez déjà la table messages SANS les colonnes pièces jointes
-- (Sinon supabase-messagerie.sql inclut déjà tout)

ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- BUCKET STORAGE : créer manuellement dans Supabase Dashboard > Storage > New bucket
--   - Name: messagerie
--   - Public bucket: Oui (coché)
-- Puis exécuter les politiques ci-dessous :

-- Politique : tout le monde peut uploader et lire
DROP POLICY IF EXISTS "Allow anon upload messagerie" ON storage.objects;
CREATE POLICY "Allow anon upload messagerie" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'messagerie');

DROP POLICY IF EXISTS "Allow anon read messagerie" ON storage.objects;
CREATE POLICY "Allow anon read messagerie" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'messagerie');
