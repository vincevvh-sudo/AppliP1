-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- Permet à la messagerie de recevoir les nouveaux messages en temps réel (enseignant ↔ enfant).
-- Si la table est déjà dans la publication, vous pouvez ignorer l'erreur.

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
