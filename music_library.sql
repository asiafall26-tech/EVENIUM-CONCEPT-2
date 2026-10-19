-- ==============================================================
-- BANQUE DE SONS EVENIUM
-- Morceaux mis à disposition des clients pour la musique de leur invitation.
-- À exécuter une fois dans le SQL Editor de Supabase (peut être relancé sans risque).
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.music_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  category TEXT NOT NULL DEFAULT 'Tous',      -- Mariage, Baptême, Anniversaire, Gala, Corporate, Tous
  mood TEXT,                                  -- Romantique, Festive, Traditionnelle, Douce, Instrumentale…
  audio_url TEXT NOT NULL,
  storage_path TEXT,                          -- chemin dans le bucket evenium_assets (pour supprimer le fichier)
  duration NUMERIC,                           -- secondes
  excerpt_start NUMERIC NOT NULL DEFAULT 0,   -- extrait conseillé (secondes)
  excerpt_end NUMERIC NOT NULL DEFAULT 0,     -- 0 = jusqu'à la fin
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS music_library_active_idx ON public.music_library (is_active, category, sort_order);

ALTER TABLE public.music_library ENABLE ROW LEVEL SECURITY;

-- Tout le monde (clients connectés ou non) peut lire les morceaux actifs
DROP POLICY IF EXISTS "Read active tracks" ON public.music_library;
CREATE POLICY "Read active tracks" ON public.music_library
  FOR SELECT USING (is_active = true);

-- Seul l'administrateur gère la banque
DROP POLICY IF EXISTS "Admins manage tracks" ON public.music_library;
CREATE POLICY "Admins manage tracks" ON public.music_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
