-- Partage des créneaux de rendez-vous par jour
-- À exécuter dans Supabase → SQL Editor
-- eleve_id = '0' => toute la classe ; sinon id de l'élève (texte, compatible UUID)

CREATE TABLE IF NOT EXISTS public.rendez_vous_partages (
  jour DATE NOT NULL,
  eleve_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (jour, eleve_id)
);

CREATE INDEX IF NOT EXISTS rendez_vous_partages_eleve_idx
  ON public.rendez_vous_partages (eleve_id);

COMMENT ON TABLE public.rendez_vous_partages IS
  'Jours de RDV visibles pour les familles. eleve_id = ''0'' = toute la classe.';

ALTER TABLE public.rendez_vous_partages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rendez_vous_partages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rendez_vous_partages', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow anon select" ON public.rendez_vous_partages
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.rendez_vous_partages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.rendez_vous_partages
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON public.rendez_vous_partages
  FOR DELETE TO anon USING (true);

-- Autoriser aussi la création / suppression des créneaux (si absentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rendez_vous_creneaux'
      AND policyname = 'Allow anon insert creneaux'
  ) THEN
    CREATE POLICY "Allow anon insert creneaux" ON public.rendez_vous_creneaux
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rendez_vous_creneaux'
      AND policyname = 'Allow anon delete creneaux'
  ) THEN
    CREATE POLICY "Allow anon delete creneaux" ON public.rendez_vous_creneaux
      FOR DELETE TO anon USING (true);
  END IF;
END $$;
