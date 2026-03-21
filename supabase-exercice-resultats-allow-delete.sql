-- À exécuter une seule fois dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Autorise la suppression d'un résultat pour que l'enseignant puisse laisser l'élève recommencer l'évaluation.

CREATE POLICY "Allow anon delete" ON public.exercice_resultats
  FOR DELETE TO anon USING (true);
