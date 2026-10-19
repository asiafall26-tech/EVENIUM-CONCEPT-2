-- ==============================================================
-- CORRECTION RLS POUR LES DEMANDES DE DEVIS (Côté Client)
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- ==============================================================

-- Permettre aux clients d'insérer des demandes de devis
DROP POLICY IF EXISTS "Clients can insert requests" ON public.demandes_devis;
CREATE POLICY "Clients can insert requests" ON public.demandes_devis 
FOR INSERT WITH CHECK (
  event_id IN (SELECT id FROM public.events WHERE client_id = auth.uid())
);
