-- ==============================================================
-- CORRECTION DES TABLES : PRESTATAIRES (Transactions, Profils, Planning, Messages)
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- ==============================================================

-- 1. Correction de la table TRANSACTIONS
-- Ajout des colonnes manquantes pour le module Finances du prestataire
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS prestataire_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS libelle TEXT;

-- Permettre au prestataire d'insérer ses propres transactions
DROP POLICY IF EXISTS "Prestataire can insert transactions" ON public.transactions;
CREATE POLICY "Prestataire can insert transactions" ON public.transactions FOR INSERT WITH CHECK (prestataire_id = auth.uid());
-- S'assurer que la politique de lecture existe
DROP POLICY IF EXISTS "Prestataire can read transactions" ON public.transactions;
CREATE POLICY "Prestataire can read transactions" ON public.transactions FOR SELECT USING (prestataire_id = auth.uid());

-- 2. Correction de la table PROFILES
-- Ajout des colonnes pour le Profil du prestataire
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 3. Correction RLS de la table PROVIDER_EVENTS (Planning)
-- La précédente politique "FOR ALL" sans "WITH CHECK" bloquait l'insertion (Ajouter une indisponibilité)
DROP POLICY IF EXISTS "Providers manage their own calendar" ON public.provider_events;
CREATE POLICY "Providers manage their own calendar" ON public.provider_events 
FOR ALL USING (prestataire_id = auth.uid()) WITH CHECK (prestataire_id = auth.uid());

-- 4. Correction RLS de la table MESSAGES
-- Assurez-vous que les prestataires et clients peuvent envoyer des messages
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
