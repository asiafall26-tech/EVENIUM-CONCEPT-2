-- ==============================================================
-- STUDIO DES MODÈLES (ADMIN)
-- Contenu des modèles d'invitation publiés sur le site (textes, photos, musique…),
-- ajusté par l'administrateur. À exécuter une fois dans le SQL Editor de Supabase
-- (peut être relancé sans risque).
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.invitation_model_defaults (
  model_id TEXT PRIMARY KEY,                 -- invit-7, invit-8, invit-9, invit-10, invit-11
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.invitation_model_defaults ENABLE ROW LEVEL SECURITY;

-- Tout le monde voit les modèles publiés (site, démos, création d'événement)
DROP POLICY IF EXISTS "Read model defaults" ON public.invitation_model_defaults;
CREATE POLICY "Read model defaults" ON public.invitation_model_defaults
  FOR SELECT USING (true);

-- Seul l'administrateur modifie les modèles
DROP POLICY IF EXISTS "Admins manage model defaults" ON public.invitation_model_defaults;
CREATE POLICY "Admins manage model defaults" ON public.invitation_model_defaults
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
