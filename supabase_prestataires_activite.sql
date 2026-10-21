-- ==============================================================
-- ACTIVITÉ DES PRESTATAIRES : TYPES D'ÉVÉNEMENTS, PRESTATIONS, PAYS ET ZONES
-- À exécuter dans le SQL Editor de Supabase (peut être relancé sans risque).
--
-- Remplace les anciennes catégories fixes (Traiteur, Photographe…) :
--   - event_types       : types d'événements où le prestataire intervient (Mariage, Yendou…)
--   - services_proposes : prestations proposées (liste du code + prestations personnalisées)
--   - country / zones   : pays et zones d'intervention (zones personnalisées acceptées)
-- Les organisateurs filtrent l'annuaire avec ces informations.
--
-- Dès que ce script est exécuté, un prestataire certifié Evenium qui n'a pas
-- renseigné ces informations est invité à le faire à sa prochaine connexion.
-- ==============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS event_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS services_proposes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS zones TEXT[] DEFAULT '{}',
  -- Activités de devis déduites des prestations (aussi créée par supabase_devis_personnalisation.sql)
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Index pour les filtres de l'annuaire
CREATE INDEX IF NOT EXISTS profiles_event_types_idx ON public.profiles USING GIN (event_types);
CREATE INDEX IF NOT EXISTS profiles_services_proposes_idx ON public.profiles USING GIN (services_proposes);
CREATE INDEX IF NOT EXISTS profiles_zones_idx ON public.profiles USING GIN (zones);
CREATE INDEX IF NOT EXISTS profiles_country_idx ON public.profiles (country);

-- Offres du catalogue : la colonne « categorie » contient désormais le type d'événement
-- (ou « Tous événements ») ; la prestation concernée est enregistrée à part.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS prestation TEXT;

CREATE INDEX IF NOT EXISTS services_prestation_idx ON public.services (prestation);
