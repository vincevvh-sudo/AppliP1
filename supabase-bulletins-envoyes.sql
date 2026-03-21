-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Table pour les bulletins du mois envoyés aux enfants (comportement + attendus du mois + commentaire)
-- Copiez tout ce script, collez-le dans SQL Editor, puis cliquez sur "Run".

CREATE TABLE IF NOT EXISTS bulletins_envoyes (
  id BIGSERIAL PRIMARY KEY,
  eleve_id INT NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB NOT NULL
);

-- Activer RLS
ALTER TABLE bulletins_envoyes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques si elles existent (pour pouvoir réexécuter ce script)
DROP POLICY IF EXISTS "Allow anon insert bulletins_envoyes" ON bulletins_envoyes;
DROP POLICY IF EXISTS "Allow anon select bulletins_envoyes" ON bulletins_envoyes;

-- Autoriser insert et select pour le client anon (app web)
CREATE POLICY "Allow anon insert bulletins_envoyes" ON bulletins_envoyes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select bulletins_envoyes" ON bulletins_envoyes
  FOR SELECT TO anon USING (true);
