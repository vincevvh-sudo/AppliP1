-- ============================================================
-- NETTOYAGE MESSAGERIE - 15 JUILLET
-- À exécuter le 15 juillet (ou après) pour effacer tous les messages
-- Copie-colle dans le SQL Editor de Supabase puis "Run"
-- ============================================================

-- Efface tous les messages
DELETE FROM messages;

-- Efface toutes les conversations (groupe + directes)
DELETE FROM conversations;

-- Recrée la conversation groupe vide pour la rentrée
INSERT INTO conversations (type, eleve_id) VALUES ('groupe', NULL);
