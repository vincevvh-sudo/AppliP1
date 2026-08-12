-- Semainier classe (leçons / devoirs / à savoir) — lun–ven
-- À exécuter dans Supabase → SQL Editor

create extension if not exists pgcrypto;

CREATE TABLE IF NOT EXISTS public.semainier_semaine (
  week_start DATE PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.semainier_semaine IS
  'Semainier scolaire par semaine (week_start = lundi). data = { lundi: { lecons, devoirs, a_savoir }, ... }';

ALTER TABLE public.semainier_semaine ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'semainier_semaine'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.semainier_semaine', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow anon select" ON public.semainier_semaine
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.semainier_semaine
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.semainier_semaine
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON public.semainier_semaine
  FOR DELETE TO anon USING (true);
