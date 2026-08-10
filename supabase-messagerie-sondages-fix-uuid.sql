-- Correctif UUID pour les votes des sondages
-- A exécuter si vous avez déjà exécuté supabase-messagerie-sondages.sql
-- et que poll_votes.voter_eleve_id est en BIGINT.

DROP INDEX IF EXISTS idx_poll_votes_unique_voter;

ALTER TABLE poll_votes
  ALTER COLUMN voter_eleve_id TYPE TEXT
  USING voter_eleve_id::TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_votes_unique_voter
ON poll_votes (poll_id, voter_type, COALESCE(voter_eleve_id, '__none__'));
