-- Créer le bucket de stockage public pour Evenium
insert into storage.buckets (id, name, public) 
values ('evenium_assets', 'evenium_assets', true) 
on conflict (id) do nothing;

-- Autoriser l'upload pour les utilisateurs connectés
create policy "Auth Upload" on storage.objects 
for insert 
with check ( bucket_id = 'evenium_assets' and auth.role() = 'authenticated' );

-- Autoriser la lecture publique
create policy "Public Access" on storage.objects 
for select 
using ( bucket_id = 'evenium_assets' );

-- Ajouter la colonne avatar_url à la table profiles s'il le faut
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
