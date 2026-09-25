-- Horaire Semaine (lundi–vendredi, cases par heure)
-- À exécuter dans Supabase → SQL Editor (optionnel : l’appli a un repli sinon)

CREATE TABLE IF NOT EXISTS public.horaire_semaine (
  week_start DATE PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.horaire_semaine IS
  'Horaire de classe par semaine (week_start = lundi). data = { lundi: { "08:30": "…" }, ... }';

ALTER TABLE public.horaire_semaine ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'horaire_semaine'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.horaire_semaine', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow anon select" ON public.horaire_semaine
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.horaire_semaine
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.horaire_semaine
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON public.horaire_semaine
  FOR DELETE TO anon USING (true);
