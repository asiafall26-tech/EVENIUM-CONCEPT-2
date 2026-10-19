-- Ajouter le statut (Brouillon, Publié, Désactivé)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS status text DEFAULT 'Publié';

-- Ajouter le type de prix (Fixe, A partir de, etc.)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS type_prix text DEFAULT 'Fixe';

-- Ce qui est inclus (liste)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS inclus text[] DEFAULT ARRAY[]::text[];

-- Options supplémentaires (liste d'objets JSON {nom, prix, description})
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '[]'::jsonb;

-- Informations pratiques (capacité, durée, etc. selon catégorie)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS infos_pratiques jsonb DEFAULT '{}'::jsonb;

-- Zones d'intervention
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS zones text[] DEFAULT ARRAY[]::text[];
