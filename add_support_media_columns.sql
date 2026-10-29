-- Migration Evenium: Support & Réclamations avec Médias (Audio, Fichiers, Documents)
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase si vous souhaitez ajouter explicitement les colonnes.

ALTER TABLE public.support_tickets 
  ADD COLUMN IF NOT EXISTS attachments jsonb,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS audio_duration numeric;

COMMENT ON COLUMN public.support_tickets.attachments IS 'Liste des pièces jointes (fichiers, images, pdf, documents, etc.)';
COMMENT ON COLUMN public.support_tickets.audio_url IS 'URL publique de la note vocale enregistrée pour le support';
COMMENT ON COLUMN public.support_tickets.audio_duration IS 'Durée en secondes de la note vocale';
