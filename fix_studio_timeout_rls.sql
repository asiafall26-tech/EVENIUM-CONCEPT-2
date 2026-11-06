-- ==============================================================
-- FIX : STATEMENT TIMEOUT SUR LE STUDIO DES MODÈLES (ADMIN)
-- Copiez et exécutez ce script dans le SQL Editor de Supabase.
-- Objectifs :
-- 1. Créer une fonction SECURITY DEFINER `public.is_admin()` pour éviter
--    les sous-requêtes récursives lentes et les blocages RLS.
-- 2. Optimiser les index sur la table `profiles`.
-- 3. Augmenter le timeout Postgres pour les opérations administratives.
-- ==============================================================

-- 1. Fonction admin ultra-rapide (SECURITY DEFINER, mise en cache stable)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Index composite sur profiles(id, role) pour un lookup en 0ms
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON public.profiles(id, role);

-- 3. Mise à jour des politiques RLS sur invitation_model_defaults
ALTER TABLE IF EXISTS public.invitation_model_defaults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage model defaults" ON public.invitation_model_defaults;
CREATE POLICY "Admins manage model defaults" ON public.invitation_model_defaults
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read model defaults" ON public.invitation_model_defaults;
CREATE POLICY "Read model defaults" ON public.invitation_model_defaults
  FOR SELECT
  USING (true);

-- 4. Mise à jour des politiques RLS sur custom_invitation_models
ALTER TABLE IF EXISTS public.custom_invitation_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage custom models" ON public.custom_invitation_models;
CREATE POLICY "Admins manage custom models" ON public.custom_invitation_models
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read custom models" ON public.custom_invitation_models;
CREATE POLICY "Read custom models" ON public.custom_invitation_models
  FOR SELECT
  USING (true);

-- 5. Augmenter le statement_timeout par défaut pour les utilisateurs authentifiés
ALTER ROLE authenticated SET statement_timeout = '60s';

