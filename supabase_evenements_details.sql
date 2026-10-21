-- ==============================================================
-- DÉTAILS DES ÉVÉNEMENTS (FORMULES PREMIUM / GOLD) + ACTIVITÉ DES PRESTATAIRES À L'INSCRIPTION
-- À exécuter dans le SQL Editor de Supabase, APRÈS supabase_prestataires_activite.sql
-- (peut être relancé sans risque).
-- ==============================================================

-- 1. Détails importants de l'événement, saisis à l'achat des formules Premium et Gold
--    et modifiables dans le dashboard : { theme, programme, prestations_recherchees[], notes }
--    Le nombre d'invités, le budget, la date et le lieu utilisent les colonnes existantes.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS guests_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS budget_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS event_details JSONB DEFAULT '{}'::jsonb;

-- 2. Création du profil à l'inscription : on reprend aussi l'activité saisie par le prestataire
--    (types d'événements, prestations, pays, zones), même si l'e-mail n'est pas encore confirmé.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  activity JSONB := NEW.raw_user_meta_data -> 'activity';
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, event_types, services_proposes, country, zones)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'role',
    NEW.email,
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(activity -> 'event_types')), '{}'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(activity -> 'services')), '{}'),
    activity ->> 'country',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(activity -> 'zones')), '{}')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Rattrapage : prestataires déjà inscrits dont l'activité n'est que dans leur compte
UPDATE public.profiles p
SET
  event_types = ARRAY(SELECT jsonb_array_elements_text(u.raw_user_meta_data -> 'activity' -> 'event_types')),
  services_proposes = ARRAY(SELECT jsonb_array_elements_text(u.raw_user_meta_data -> 'activity' -> 'services')),
  country = u.raw_user_meta_data -> 'activity' ->> 'country',
  zones = ARRAY(SELECT jsonb_array_elements_text(u.raw_user_meta_data -> 'activity' -> 'zones'))
FROM auth.users u
WHERE u.id = p.id
  AND p.role = 'prestataire'
  AND COALESCE(cardinality(p.zones), 0) = 0
  AND jsonb_typeof(u.raw_user_meta_data -> 'activity' -> 'zones') = 'array';
