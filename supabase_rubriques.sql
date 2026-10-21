-- ==============================================================
-- RUBRIQUES PERSONNALISÉES DU PROFIL PRESTATAIRE
-- À exécuter dans le SQL Editor de Supabase (peut être relancé sans risque).
--
-- Chaque rubrique : { id, title, kind: "texte" | "liste" | "infos", text, items[], rows[{label, value}] }
-- Les rubriques des offres du catalogue sont enregistrées dans services.infos_pratiques
-- (aucune modification de la table services n'est nécessaire).
-- ==============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rubriques JSONB DEFAULT '[]'::jsonb;
