-- S'assurer que la table profiles existe (au cas où)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'client',
  avatar_url text,
  email text
);

-- 1. Réparer les utilisateurs déjà inscrits (Backfill)
-- Copier tous les utilisateurs actuels depuis auth.users vers public.profiles
insert into public.profiles (id, full_name, role, email)
select id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'role', email
from auth.users
on conflict (id) do nothing;

-- 2. Automatiser pour les futurs inscrits (Trigger)
-- Fonction qui sera appelée à chaque nouvelle inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger attaché à auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
