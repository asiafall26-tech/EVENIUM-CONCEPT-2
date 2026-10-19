-- Ajouter la colonne is_active pour permettre au prestataire de masquer sa vitrine
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Ajouter la colonne gallery pour permettre au prestataire d'ajouter plusieurs photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT ARRAY[]::text[];

-- Ajouter la colonne gallery aux services (catalogues)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT ARRAY[]::text[];
