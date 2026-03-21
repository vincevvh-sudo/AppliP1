-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Crée la table exercice_resultats (compatible eleves.id en UUID) et autorise l'accès anon (sans auth)

create extension if not exists pgcrypto;

CREATE TABLE IF NOT EXISTS public.exercice_resultats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id UUID NOT NULL REFERENCES public.eleves(id) ON DELETE CASCADE,
  son_id TEXT NOT NULL,
  niveau_id TEXT NOT NULL,
  points INT NOT NULL,
  points_max INT NOT NULL,
  reussi BOOLEAN NOT NULL,
  detail_exercices JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index utiles
create index if not exists idx_exercice_resultats_eleve_id on public.exercice_resultats (eleve_id);
create index if not exists idx_exercice_resultats_created_at on public.exercice_resultats (created_at desc);

-- Activer RLS
ALTER TABLE public.exercice_resultats ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes (noms EN ou FR), puis les recréer
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'exercice_resultats'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.exercice_resultats', pol.policyname);
  END LOOP;
END $$;

-- Autoriser l'insert et le select pour le client anon (app web)
CREATE POLICY "Allow anon insert" ON public.exercice_resultats
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select" ON public.exercice_resultats
  FOR SELECT TO anon USING (true);

-- (optionnel) autoriser la suppression
CREATE POLICY "Allow anon delete" ON public.exercice_resultats
  FOR DELETE TO anon USING (true);
