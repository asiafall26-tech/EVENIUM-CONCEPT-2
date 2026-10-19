-- ==============================================================
-- NOTIFICATIONS EN TEMPS RÉEL
-- Réclamations support, messages, demandes de devis, devis, avis clients, réponses des invités.
-- À exécuter dans le SQL Editor de Supabase (peut être relancé sans risque).
-- Sans ce script, les compteurs se mettent quand même à jour toutes les 30 secondes ;
-- avec, ils changent à l'instant où un élément arrive.
-- ==============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['support_tickets', 'messages', 'demandes_devis', 'devis', 'reviews', 'guests']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t)
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Les messages existants sans valeur de lecture comptent comme non lus
UPDATE public.messages SET is_read = false WHERE is_read IS NULL;
ALTER TABLE public.messages ALTER COLUMN is_read SET DEFAULT false;
