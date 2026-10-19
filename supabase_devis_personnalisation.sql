-- ==============================================================
-- DEVIS PERSONNALISÉS SELON LE MÉTIER DU PRESTATAIRE
-- À exécuter dans le SQL Editor de Supabase (peut être relancé sans risque).
--
-- Ajoute :
--   1. Les activités multiples du prestataire (profiles.categories)
--   2. Ses services personnalisés (table prestataire_services_perso)
--   3. Les informations du devis : détails par activité, TVA, caution, acompte en FCFA…
--   4. Le mode de calcul de chaque ligne (forfait, par personne, location…)
--   5. Les règles de sécurité (RLS) des devis et de leurs lignes
--
-- Les catégories et les services prédéfinis sont définis dans le code
-- (src/lib/devis/categories.ts) ; seuls les services ajoutés par les prestataires
-- sont stockés en base.
-- ==============================================================

-- 1. Activités du prestataire (identifiants : organisation, decoration, traiteur, …)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- 2. Services personnalisés : propres à chaque prestataire, jamais ajoutés au catalogue commun
CREATE TABLE IF NOT EXISTS public.prestataire_services_perso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS prestataire_services_perso_unique
  ON public.prestataire_services_perso (prestataire_id, COALESCE(category_id, ''), lower(name));

ALTER TABLE public.prestataire_services_perso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prestataire lit ses services" ON public.prestataire_services_perso;
CREATE POLICY "Prestataire lit ses services" ON public.prestataire_services_perso
  FOR SELECT USING (prestataire_id = auth.uid());

DROP POLICY IF EXISTS "Prestataire ajoute ses services" ON public.prestataire_services_perso;
CREATE POLICY "Prestataire ajoute ses services" ON public.prestataire_services_perso
  FOR INSERT WITH CHECK (prestataire_id = auth.uid());

DROP POLICY IF EXISTS "Prestataire modifie ses services" ON public.prestataire_services_perso;
CREATE POLICY "Prestataire modifie ses services" ON public.prestataire_services_perso
  FOR UPDATE USING (prestataire_id = auth.uid()) WITH CHECK (prestataire_id = auth.uid());

DROP POLICY IF EXISTS "Prestataire supprime ses services" ON public.prestataire_services_perso;
CREATE POLICY "Prestataire supprime ses services" ON public.prestataire_services_perso
  FOR DELETE USING (prestataire_id = auth.uid());

-- 3. Informations du devis
ALTER TABLE public.devis
  ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS event_name TEXT,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS event_date TEXT,
  ADD COLUMN IF NOT EXISTS event_location TEXT,
  -- { "traiteur": { "nb_personnes": 250, "formule_service": "Buffet", … }, … }
  ADD COLUMN IF NOT EXISTS category_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC,
  -- Valeur saisie de l'acompte (ex. 30 pour 30 %) ; deposit_amount contient alors le montant en FCFA
  ADD COLUMN IF NOT EXISTS deposit_value NUMERIC,
  ADD COLUMN IF NOT EXISTS caution_amount NUMERIC DEFAULT 0;

-- 4. Mode de calcul des lignes
ALTER TABLE public.devis_items
  ADD COLUMN IF NOT EXISTS category_id TEXT,
  -- forfait | unitaire | par_personne | horaire | journalier | location | personnel | vehicule
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT,
  ADD COLUMN IF NOT EXISTS duration NUMERIC,
  ADD COLUMN IF NOT EXISTS duration_unit TEXT;

CREATE INDEX IF NOT EXISTS devis_items_devis_id_idx ON public.devis_items (devis_id);
CREATE INDEX IF NOT EXISTS devis_prestataire_id_idx ON public.devis (prestataire_id);
CREATE INDEX IF NOT EXISTS devis_client_id_idx ON public.devis (client_id);

-- 5. Règles de sécurité des devis
-- Un devis est visible par son prestataire, son organisateur (client du devis ou de l'événement) et les admins.

CREATE OR REPLACE FUNCTION public.is_evenium_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_event_client(p_event_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.events e WHERE e.id = p_event_id AND e.client_id = auth.uid());
$$;

-- Pour les tables liées (lignes, frais…) : le devis parent existe déjà
CREATE OR REPLACE FUNCTION public.can_access_devis(p_devis_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.devis d
    WHERE d.id = p_devis_id
      AND (
        d.prestataire_id = auth.uid()
        OR d.client_id = auth.uid()
        OR public.is_event_client(d.event_id)
        OR public.is_evenium_admin()
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_devis(p_devis_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.devis d
    WHERE d.id = p_devis_id AND (d.prestataire_id = auth.uid() OR public.is_evenium_admin())
  );
$$;

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

-- Conditions sur les colonnes de la ligne elle-même (et non via can_access_devis) :
-- sinon un devis tout juste créé ne serait pas relisible dans la même requête.
DROP POLICY IF EXISTS "Devis visibles par les parties" ON public.devis;
CREATE POLICY "Devis visibles par les parties" ON public.devis
  FOR SELECT USING (
    prestataire_id = auth.uid() OR client_id = auth.uid() OR public.is_event_client(event_id) OR public.is_evenium_admin()
  );

DROP POLICY IF EXISTS "Prestataire crée ses devis" ON public.devis;
CREATE POLICY "Prestataire crée ses devis" ON public.devis
  FOR INSERT WITH CHECK (prestataire_id = auth.uid() OR public.is_evenium_admin());

-- L'organisateur met à jour le statut (accepter, refuser, demander une révision)
DROP POLICY IF EXISTS "Parties mettent à jour le devis" ON public.devis;
CREATE POLICY "Parties mettent à jour le devis" ON public.devis
  FOR UPDATE USING (
    prestataire_id = auth.uid() OR client_id = auth.uid() OR public.is_event_client(event_id) OR public.is_evenium_admin()
  );

DROP POLICY IF EXISTS "Prestataire supprime ses devis" ON public.devis;
CREATE POLICY "Prestataire supprime ses devis" ON public.devis
  FOR DELETE USING (prestataire_id = auth.uid() OR public.is_evenium_admin());

-- Lignes, frais, versions et pièces jointes : lecture par les parties, écriture par le prestataire
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['devis_items', 'devis_options', 'devis_versions', 'devis_attachments']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Lecture par les parties" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Lecture par les parties" ON public.%I FOR SELECT USING (public.can_access_devis(devis_id))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Écriture par le prestataire" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Écriture par le prestataire" ON public.%I FOR ALL USING (public.owns_devis(devis_id)) WITH CHECK (public.owns_devis(devis_id))', t);
  END LOOP;
END $$;

-- Historique des statuts : chaque partie peut lire et ajouter une étape
ALTER TABLE public.devis_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture par les parties" ON public.devis_status_history;
CREATE POLICY "Lecture par les parties" ON public.devis_status_history
  FOR SELECT USING (public.can_access_devis(devis_id));

DROP POLICY IF EXISTS "Ajout par les parties" ON public.devis_status_history;
CREATE POLICY "Ajout par les parties" ON public.devis_status_history
  FOR INSERT WITH CHECK (public.can_access_devis(devis_id));
