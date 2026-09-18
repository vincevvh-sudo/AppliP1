-- À exécuter une fois dans le SQL Editor de Supabase.
-- Autorise la mise à jour des bulletins déjà envoyés (pour nettoyer la synthèse :
-- garder seulement les notes encodées par l’enseignant).

DROP POLICY IF EXISTS "Allow anon update bulletins_envoyes" ON bulletins_envoyes;

CREATE POLICY "Allow anon update bulletins_envoyes" ON bulletins_envoyes
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
