-- Script de création/mise à jour des tables pour le nouveau système de devis Evenium
-- A EXÉCUTER DANS L'ÉDITEUR SQL DE SUPABASE

-- 1. Mise à jour de la table "demandes_devis" pour ajouter les nouveaux champs de la demande
ALTER TABLE public.demandes_devis
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS catalogue_id UUID, -- S'il y a une table catalogues
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS client_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS event_date TEXT,
ADD COLUMN IF NOT EXISTS event_time TEXT,
ADD COLUMN IF NOT EXISTS event_location TEXT,
ADD COLUMN IF NOT EXISTS event_guests INTEGER,
ADD COLUMN IF NOT EXISTS needs_description TEXT,
ADD COLUMN IF NOT EXISTS needs_options TEXT,
ADD COLUMN IF NOT EXISTS needs_quantity INTEGER,
ADD COLUMN IF NOT EXISTS budget_indicatif NUMERIC,
ADD COLUMN IF NOT EXISTS files TEXT[]; -- URLs des pièces jointes

-- 2. Mise à jour de la table "devis" existante
ALTER TABLE public.devis
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS date_emission DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS valid_until DATE,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type TEXT, -- 'amount' ou 'percentage'
ADD COLUMN IF NOT EXISTS extra_fees NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_type TEXT, -- 'amount' ou 'percentage'
ADD COLUMN IF NOT EXISTS payment_conditions TEXT,
ADD COLUMN IF NOT EXISTS cancellation_conditions TEXT,
ADD COLUMN IF NOT EXISTS included_items TEXT,
ADD COLUMN IF NOT EXISTS not_included_items TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- 3. Table des prestations (lignes du devis)
CREATE TABLE IF NOT EXISTS public.devis_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    designation TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des options et frais (Livraison, Installation, etc.)
CREATE TABLE IF NOT EXISTS public.devis_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_included BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table de l'historique des statuts du devis
CREATE TABLE IF NOT EXISTS public.devis_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des versions du devis
CREATE TABLE IF NOT EXISTS public.devis_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des pièces jointes du devis
CREATE TABLE IF NOT EXISTS public.devis_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES public.devis(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Désactivation temporaire de la RLS pour faciliter le développement des requêtes, 
-- à configurer finement en production.
ALTER TABLE public.devis_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_attachments DISABLE ROW LEVEL SECURITY;

-- Note : Assurez-vous que RLS sur `devis` et `demandes_devis` permet les lectures/écritures.
ALTER TABLE public.devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_devis DISABLE ROW LEVEL SECURITY;
