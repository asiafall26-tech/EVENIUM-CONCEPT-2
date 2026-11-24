-- Migration pour permettre d'enregistrer les réponses des hôtes aux vœux des invités
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS reponse TEXT,
ADD COLUMN IF NOT EXISTS reponse_envoyee_le TIMESTAMPTZ;

COMMENT ON COLUMN public.guests.reponse IS 'Réponse personnalisée envoyée par les hôtes aux vœux de l''invité';
COMMENT ON COLUMN public.guests.reponse_envoyee_le IS 'Date et heure d''envoi de la réponse par les hôtes';
