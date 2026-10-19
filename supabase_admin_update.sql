-- ==============================================================
-- ETAPE 3 : ACCÈS GLOBAL POUR L'ADMINISTRATEUR (SUPER ADMIN)
-- Copiez tout ce code et exécutez-le dans le SQL Editor de Supabase
-- Objectif : Permettre à l'Admin de voir toutes les données
-- ==============================================================

-- 1. Accès complet aux Evénements pour l'Admin
CREATE POLICY "Admins can do everything on events"
ON public.events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 2. Accès complet aux Transactions pour l'Admin
CREATE POLICY "Admins can do everything on transactions"
ON public.transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. Accès complet aux Demandes et Devis pour l'Admin
CREATE POLICY "Admins can do everything on demandes_devis"
ON public.demandes_devis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can do everything on devis"
ON public.devis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Accès complet aux Messages pour l'Admin (L'admin peut lire tous les messages)
CREATE POLICY "Admins can do everything on messages"
ON public.messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
