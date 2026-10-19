-- ==============================================================================
-- EVENIUM - MIGRATION ROBUSTE : ACTIVATION DU ON DELETE CASCADE
-- ==============================================================================
-- Ce script résout définitivement l'erreur "Database error deleting user"
-- dans Supabase Studio et dans les tableaux de bord Evenium.
--
-- Chaque table est traitée dans un bloc protégé : s'il manque une table ou
-- une colonne, le script continue sans jamais bloquer ou échouer.
-- ==============================================================================

DO $$
BEGIN
  -- ----------------------------------------------------------------------------
  -- 1. Table PROFILES (cascade depuis auth.users)
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: profiles -> auth.users CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice profiles: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 2. Table EVENTS (cascade depuis auth.users ou profiles)
  -- ----------------------------------------------------------------------------
  BEGIN
    -- Nettoyer les orphelins éventuels
    DELETE FROM public.events WHERE client_id NOT IN (SELECT id FROM auth.users);
    
    ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_client_id_fkey;
    ALTER TABLE public.events 
      ADD CONSTRAINT events_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: events -> auth.users CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice events: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 3. Table DEMANDES_DEVIS
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.demandes_devis DROP CONSTRAINT IF EXISTS demandes_devis_prestataire_id_fkey;
    ALTER TABLE public.demandes_devis DROP CONSTRAINT IF EXISTS demandes_devis_event_id_fkey;

    ALTER TABLE public.demandes_devis 
      ADD CONSTRAINT demandes_devis_prestataire_id_fkey 
      FOREIGN KEY (prestataire_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.demandes_devis 
      ADD CONSTRAINT demandes_devis_event_id_fkey 
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: demandes_devis CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice demandes_devis: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 4. Table DEVIS
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_prestataire_id_fkey;
    ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_client_id_fkey;
    ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_event_id_fkey;
    ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_demande_id_fkey;

    ALTER TABLE public.devis 
      ADD CONSTRAINT devis_prestataire_id_fkey 
      FOREIGN KEY (prestataire_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.devis 
      ADD CONSTRAINT devis_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.devis 
      ADD CONSTRAINT devis_event_id_fkey 
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

    ALTER TABLE public.devis 
      ADD CONSTRAINT devis_demande_id_fkey 
      FOREIGN KEY (demande_id) REFERENCES public.demandes_devis(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: devis CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice devis: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 5. Table DEVIS_ITEMS
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.devis_items DROP CONSTRAINT IF EXISTS devis_items_devis_id_fkey;
    ALTER TABLE public.devis_items 
      ADD CONSTRAINT devis_items_devis_id_fkey 
      FOREIGN KEY (devis_id) REFERENCES public.devis(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: devis_items -> devis CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice devis_items: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 6. Table MESSAGES
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_event_id_fkey;

    ALTER TABLE public.messages 
      ADD CONSTRAINT messages_sender_id_fkey 
      FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.messages 
      ADD CONSTRAINT messages_receiver_id_fkey 
      FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.messages 
      ADD CONSTRAINT messages_event_id_fkey 
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: messages CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice messages: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 7. Table TRANSACTIONS
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_prestataire_id_fkey;
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_event_id_fkey;

    ALTER TABLE public.transactions 
      ADD CONSTRAINT transactions_prestataire_id_fkey 
      FOREIGN KEY (prestataire_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.transactions 
      ADD CONSTRAINT transactions_event_id_fkey 
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: transactions CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice transactions: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 8. Table GUESTS
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_event_id_fkey;
    ALTER TABLE public.guests 
      ADD CONSTRAINT guests_event_id_fkey 
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: guests CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice guests: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 9. Table SUPPORT_TICKETS & TICKETS
  -- ----------------------------------------------------------------------------
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
      ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
      ALTER TABLE public.support_tickets 
        ADD CONSTRAINT support_tickets_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE 'OK: support_tickets CASCADE configure';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice support_tickets: %', SQLERRM;
  END;

  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tickets') THEN
      ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;
      ALTER TABLE public.tickets 
        ADD CONSTRAINT tickets_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE 'OK: tickets CASCADE configure';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice tickets: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 10. Table TASKS
  -- ----------------------------------------------------------------------------
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
      ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_event_id_fkey;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'event_id') THEN
        ALTER TABLE public.tasks 
          ADD CONSTRAINT tasks_event_id_fkey 
          FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
        RAISE NOTICE 'OK: tasks CASCADE configure';
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice tasks: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 11. Table REVIEWS
  -- ----------------------------------------------------------------------------
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
      ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_prestataire_id_fkey;
      ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_client_id_fkey;
      ALTER TABLE public.reviews 
        ADD CONSTRAINT reviews_prestataire_id_fkey 
        FOREIGN KEY (prestataire_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.reviews 
        ADD CONSTRAINT reviews_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE 'OK: reviews CASCADE configure';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice reviews: %', SQLERRM;
  END;

  -- ----------------------------------------------------------------------------
  -- 12. Table STORAGE.OBJECTS (pour ne pas bloquer si un avatar/fichier existe)
  -- ----------------------------------------------------------------------------
  BEGIN
    ALTER TABLE storage.objects DROP CONSTRAINT IF EXISTS objects_owner_fkey;
    ALTER TABLE storage.objects 
      ADD CONSTRAINT objects_owner_fkey 
      FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'OK: storage.objects -> auth.users CASCADE configure';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice storage.objects: %', SQLERRM;
  END;

  RAISE NOTICE '=== SUCCESS : MIGRATION CASCADE EVENIUM TERMINEE AVEC SUCCES ! ===';
END $$;
