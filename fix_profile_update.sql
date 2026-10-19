-- ==============================================================
-- CORRECTION DÉFINITIVE : ACCÈS TOTAL AU PROFIL
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- ==============================================================

-- 1. Nettoyer les anciennes politiques qui pourraient causer des conflits
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- 2. Créer une politique globale (ALL) pour le propriétaire du profil
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. Autoriser la lecture publique (nécessaire pour afficher les noms dans les catalogues)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles 
FOR SELECT 
USING (true);

-- 4. S'assurer que le RLS est actif
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
