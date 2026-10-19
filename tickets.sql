-- ==============================================================
-- ETAPE 4 : SUPPORT & TICKETS
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- Objectif : Permettre la création et gestion de tickets de support
-- ==============================================================

-- 1. Création de la table tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sujet TEXT NOT NULL,
    message TEXT NOT NULL,
    statut TEXT DEFAULT 'Ouvert', -- 'Ouvert', 'En cours', 'Résolu', 'Fermé'
    priority TEXT DEFAULT 'Normale', -- 'Basse', 'Normale', 'Haute', 'Critique'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activer le RLS pour la table tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 3. Politiques de sécurité (Row Level Security)
-- Les utilisateurs normaux (Clients & Prestataires) peuvent voir et créer LEURS PROPRES tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own tickets" ON public.tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own tickets" ON public.tickets FOR UPDATE USING (user_id = auth.uid());

-- L'Administrateur peut TOUT faire sur les tickets
CREATE POLICY "Admins can do everything on tickets" ON public.tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
