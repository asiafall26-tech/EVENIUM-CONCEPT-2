-- ==============================================================
-- AJOUT DES COLONNES POUR LA VITRINE DU PRESTATAIRE
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- ==============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;
