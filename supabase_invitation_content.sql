-- Contenu personnalisé des modèles d'invitation éditables (ex : Velours Bordeaux)
-- À exécuter une fois dans Supabase > SQL Editor.
alter table public.events
  add column if not exists invitation_content jsonb;
