-- À exécuter dans le SQL Editor de Supabase si la table exercice_resultats existe déjà.
-- Ajoute la colonne detail_exercices pour enregistrer le détail par exercice (évaluations).

ALTER TABLE exercice_resultats
  ADD COLUMN IF NOT EXISTS detail_exercices JSONB;

COMMENT ON COLUMN exercice_resultats.detail_exercices IS 'Pour les évaluations : tableau [{ type, titre, points, pointsMax }] par exercice.';
