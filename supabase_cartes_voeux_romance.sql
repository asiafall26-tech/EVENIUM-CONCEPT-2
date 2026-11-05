-- =========================================================================
-- MIGRATION EVENIUM : TABLE CARTES VIRTUELLES (VŒUX & MOTS DOUX & INVITATIONS COUPLE)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.cartes_virtuelles (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'voeu', 'mot_doux', 'invitation_couple'
  occasion_id VARCHAR(50) NOT NULL, -- 'anniversaire', 'mariage', 'diner_secret', etc.
  occasion_name TEXT NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  kicker TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  music TEXT,
  photo_url TEXT,
  
  -- Champs spécifiques aux invitations couple
  rendez_vous_date TEXT,
  rendez_vous_time TEXT,
  rendez_vous_place TEXT,
  dress_code TEXT,
  partner_response VARCHAR(30) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  partner_response_note TEXT,
  
  -- Données acheteur & traçabilité
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  amount NUMERIC DEFAULT 3900,
  payment_method VARCHAR(20) DEFAULT 'wave',
  payment_status VARCHAR(20) DEFAULT 'paid',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par email ou téléphone (page /cartes/retrouver)
CREATE INDEX IF NOT EXISTS idx_cartes_buyer_email ON public.cartes_virtuelles(buyer_email);
CREATE INDEX IF NOT EXISTS idx_cartes_buyer_phone ON public.cartes_virtuelles(buyer_phone);
CREATE INDEX IF NOT EXISTS idx_cartes_user_id ON public.cartes_virtuelles(user_id);

-- Activation de RLS
ALTER TABLE public.cartes_virtuelles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique : n'importe qui avec le lien direct ID peut afficher la carte
CREATE POLICY "Lecture publique des cartes par ID" 
  ON public.cartes_virtuelles
  FOR SELECT 
  USING (true);

-- Politique d'insertion : les clients peuvent créer et acheter des cartes
CREATE POLICY "Création de cartes par tout utilisateur" 
  ON public.cartes_virtuelles
  FOR INSERT 
  WITH CHECK (true);

-- Politique de mise à jour pour la réponse du partenaire (RSVP amoureux)
CREATE POLICY "Mise à jour de la réponse partenaire" 
  ON public.cartes_virtuelles
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.cartes_virtuelles IS 'Cartes de vœux d''exception, mots doux et invitations intimes de couple';
