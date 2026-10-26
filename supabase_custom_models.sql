-- ==============================================================
-- MODÈLES IMPORTÉS (STUDIO DES MODÈLES, ADMIN)
-- Modèles d'invitation importés en ZIP ou HTML : fichiers dans le stockage
-- (evenium_assets/custom-models/<slug>/), champs modifiables et contenu ici.
-- À exécuter une fois dans le SQL Editor de Supabase (peut être relancé sans risque).
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.custom_invitation_models (
  slug TEXT PRIMARY KEY,                          -- identifiant du dossier ; l'événement enregistre « custom:<slug> »
  name TEXT NOT NULL,
  entry TEXT NOT NULL DEFAULT 'index.html',       -- page principale dans le dossier
  fields JSONB NOT NULL DEFAULT '[]',             -- textes / images / musiques repérés, avec « modifiable par le client »
  content JSONB NOT NULL DEFAULT '{}',            -- valeurs publiées (point de départ des clients)
  draft_content JSONB,                            -- valeurs enregistrées, pas encore publiées
  cover_url TEXT,
  invitation_type TEXT NOT NULL DEFAULT 'animée', -- 'animée' ou 'carte'
  event_types TEXT[] NOT NULL DEFAULT ARRAY['Mariage'],
  status TEXT NOT NULL DEFAULT 'draft',           -- 'draft' (en préparation), 'published' (sur le site), 'hidden' (retiré)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

ALTER TABLE public.custom_invitation_models ENABLE ROW LEVEL SECURITY;

-- Tout le monde lit les modèles (les galeries ne montrent que les publiés ;
-- un modèle retiré reste lisible pour les invitations déjà achetées)
DROP POLICY IF EXISTS "Read custom models" ON public.custom_invitation_models;
CREATE POLICY "Read custom models" ON public.custom_invitation_models
  FOR SELECT USING (true);

-- Seul l'administrateur les gère
DROP POLICY IF EXISTS "Admins manage custom models" ON public.custom_invitation_models;
CREATE POLICY "Admins manage custom models" ON public.custom_invitation_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
