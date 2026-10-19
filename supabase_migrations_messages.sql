-- Désactivation de la RLS pour la table messages pour rétablir le tunnel d'envoi de messages
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
