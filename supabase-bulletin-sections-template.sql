-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Copiez tout ce script, collez-le dans SQL Editor, puis cliquez sur "Run".

-- Stocke le gabarit global des sections/attendus utilisé pour les bulletins "futurs".
-- Les bulletins déjà envoyés restent une snapshot (option A).

CREATE TABLE IF NOT EXISTS bulletin_sections_template (
  id TEXT PRIMARY KEY,
  sections JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bulletin_sections_template ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select bulletin_sections_template" ON bulletin_sections_template;
DROP POLICY IF EXISTS "Allow anon insert bulletin_sections_template" ON bulletin_sections_template;
DROP POLICY IF EXISTS "Allow anon update bulletin_sections_template" ON bulletin_sections_template;

-- Autoriser lecture depuis l'app (anon)
CREATE POLICY "Allow anon select bulletin_sections_template" ON bulletin_sections_template
  FOR SELECT TO anon USING (true);

-- Autoriser insert/upsert depuis l'app (anon)
CREATE POLICY "Allow anon insert bulletin_sections_template" ON bulletin_sections_template
  FOR INSERT TO anon WITH CHECK (true);

-- Autoriser update/upsert depuis l'app (anon)
CREATE POLICY "Allow anon update bulletin_sections_template" ON bulletin_sections_template
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

