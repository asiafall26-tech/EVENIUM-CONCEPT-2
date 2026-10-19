-- ==============================================================
-- ETAPES COMPLEMENTAIRES : REVIEWS & PLANNING PRESTATAIRES
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- Objectif : Permettre la gestion des avis clients et des indisponibilités
-- ==============================================================

-- 1. Création de la table reviews (Avis Clients)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prestataire_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Création de la table provider_events (Indisponibilités & Events Perso)
CREATE TABLE IF NOT EXISTS public.provider_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prestataire_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'indisponibilite', 'externe'
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Activer le RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_events ENABLE ROW LEVEL SECURITY;

-- 4. Politiques RLS pour reviews
-- Tout le monde peut lire les avis
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
-- Seuls les clients authentifiés peuvent créer un avis
CREATE POLICY "Clients can create reviews" ON public.reviews FOR INSERT WITH CHECK (client_id = auth.uid());
-- Seul le prestataire concerné peut mettre à jour (répondre) à un avis
CREATE POLICY "Providers can reply to their reviews" ON public.reviews FOR UPDATE USING (prestataire_id = auth.uid());

-- 5. Politiques RLS pour provider_events
-- Seul le prestataire peut gérer son calendrier
CREATE POLICY "Providers manage their own calendar" ON public.provider_events FOR ALL USING (prestataire_id = auth.uid());
