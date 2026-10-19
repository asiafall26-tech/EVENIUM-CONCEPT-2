-- Modèles d'invitation éditables (Velours Bordeaux, Sceau d'Or)
-- À exécuter une fois dans Supabase > SQL Editor. Peut être relancé sans risque.

-- 1. Contenu personnalisé de l'invitation (prénoms, programme multi-pages, Google Maps, dress code…)
alter table public.events
  add column if not exists invitation_content jsonb;

-- 2. Message de l'invité (boissons choisies dans la fiche invité du Sceau d'Or)
alter table public.guests
  add column if not exists message text;

-- 3. Les invités doivent pouvoir lire l'invitation et répondre sans compte
drop policy if exists "Tout le monde peut voir un événement" on public.events;
create policy "Tout le monde peut voir un événement"
  on public.events for select using (true);

drop policy if exists "Les invités peuvent RSVP" on public.guests;
create policy "Les invités peuvent RSVP"
  on public.guests for insert with check (true);

-- 4. Recharge le schéma de l'API pour que les nouvelles colonnes soient visibles tout de suite
notify pgrst, 'reload schema';
