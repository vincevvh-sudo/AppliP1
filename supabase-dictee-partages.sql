/*
  Partage des dictées de syllabes (1 dictée à la fois avec tous les élèves).
  À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor).
  Si vous aviez l'ancienne table (sans dictee_num), exécutez d'abord :
  DROP TABLE IF EXISTS public.dictee_partages;
*/

CREATE TABLE IF NOT EXISTS public.dictee_partages (
  eleve_id INT NOT NULL,
  dictee_num SMALLINT NOT NULL CHECK (dictee_num >= 1 AND dictee_num <= 5),
  PRIMARY KEY (eleve_id, dictee_num)
);

/* eleve_id = 0 signifie "partagé avec tous" pour la dictée dictee_num (1 à 5). */

ALTER TABLE public.dictee_partages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select dictee_partages" ON public.dictee_partages;
CREATE POLICY "Allow anon select dictee_partages" ON public.dictee_partages
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon insert dictee_partages" ON public.dictee_partages;
CREATE POLICY "Allow anon insert dictee_partages" ON public.dictee_partages
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete dictee_partages" ON public.dictee_partages;
CREATE POLICY "Allow anon delete dictee_partages" ON public.dictee_partages
  FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon update dictee_partages" ON public.dictee_partages;
CREATE POLICY "Allow anon update dictee_partages" ON public.dictee_partages
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, DELETE, UPDATE ON public.dictee_partages TO anon;

/* Rafraîchir le cache schéma PostgREST */
NOTIFY pgrst, 'reload schema';
