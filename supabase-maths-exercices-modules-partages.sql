-- Partage des exercices maths (Grandeur, Espace/géométrie, Traitement de données)
-- par module et par élève. À exécuter dans le SQL Editor Supabase.

CREATE TABLE IF NOT EXISTS public.maths_exercices_modules_partages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  eleve_id UUID NOT NULL REFERENCES public.eleves(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, eleve_id)
);

CREATE INDEX IF NOT EXISTS idx_maths_mod_part_module ON public.maths_exercices_modules_partages(module_id);
CREATE INDEX IF NOT EXISTS idx_maths_mod_part_eleve ON public.maths_exercices_modules_partages(eleve_id);

ALTER TABLE public.maths_exercices_modules_partages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'maths_exercices_modules_partages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.maths_exercices_modules_partages', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow anon select" ON public.maths_exercices_modules_partages
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.maths_exercices_modules_partages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.maths_exercices_modules_partages
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON public.maths_exercices_modules_partages
  FOR DELETE TO anon USING (true);
