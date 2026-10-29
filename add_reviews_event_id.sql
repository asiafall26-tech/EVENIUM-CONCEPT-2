-- Ajout de la colonne event_id sur la table reviews si elle n'existe pas
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
