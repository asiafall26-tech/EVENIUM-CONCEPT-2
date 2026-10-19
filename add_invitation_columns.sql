-- Script pour ajouter les champs d'invitation à la table events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS invitation_model_id TEXT,
ADD COLUMN IF NOT EXISTS invitation_title TEXT,
ADD COLUMN IF NOT EXISTS invitation_message TEXT;
