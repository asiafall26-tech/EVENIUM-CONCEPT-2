-- ==============================================================
-- MODULE PUBLICITÉ & SÉLECTION PRIVILÈGE (PRESTATAIRES EVENIUM)
-- Tables pour la gestion des annonces sponsorisées et boosts.
-- À exécuter dans le SQL Editor de Supabase.
-- ==============================================================

-- 1. Table des campagnes publicitaires des prestataires
CREATE TABLE IF NOT EXISTS public.provider_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_avatar TEXT,
  provider_category TEXT,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  description TEXT,
  badge TEXT NOT NULL DEFAULT 'Offre Spéciale',
  media_url TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Contacter le prestataire',
  target_event_types TEXT[] NOT NULL DEFAULT ARRAY['Tous'],
  target_zones TEXT[] NOT NULL DEFAULT ARRAY['Toutes'],
  plan_type TEXT NOT NULL DEFAULT 'boost_7j', -- 'boost_7j', 'boost_30j', 'subscription_monthly'
  status TEXT NOT NULL DEFAULT 'active', -- 'draft', 'pending', 'active', 'expired', 'paused'
  price_paid_fcfa INTEGER NOT NULL DEFAULT 15000,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  impressions_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  contacts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index de recherche rapide pour les organisateurs
CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates ON public.provider_campaigns(status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_provider_id ON public.provider_campaigns(provider_id);

-- 2. Table de suivi des impressions et clics (Frequency Capping)
CREATE TABLE IF NOT EXISTS public.campaign_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.provider_campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  event_id UUID,
  action TEXT NOT NULL DEFAULT 'impression', -- 'impression', 'click', 'dismissed', 'contact'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impressions_user_campaign ON public.campaign_impressions(user_id, campaign_id, action);

-- RLS
ALTER TABLE public.provider_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_impressions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS provider_campaigns
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.provider_campaigns;
CREATE POLICY "Public can view active campaigns" ON public.provider_campaigns
  FOR SELECT
  USING (status = 'active' AND now() BETWEEN starts_at AND ends_at);

DROP POLICY IF EXISTS "Providers can manage their own campaigns" ON public.provider_campaigns;
CREATE POLICY "Providers can manage their own campaigns" ON public.provider_campaigns
  FOR ALL
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- Politiques RLS campaign_impressions
DROP POLICY IF EXISTS "Users can insert impressions" ON public.campaign_impressions;
CREATE POLICY "Users can insert impressions" ON public.campaign_impressions
  FOR INSERT
  WITH CHECK (true);
