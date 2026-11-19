-- Migration : Catégories de services d'invitation dynamiques
-- Permet à l'admin de gérer les 4 services (Invitations, Vœux, Mots Doux, Couple)
-- avec leurs labels, icônes, prix et ordre d'affichage.

CREATE TABLE IF NOT EXISTS invitation_service_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,          -- ex: "invitations", "voeux", "mots_doux", "couple"
  label         text NOT NULL,                 -- ex: "Invitations Grands Événements"
  description   text,
  icon          text DEFAULT '📜',
  price_fcfa    integer,                       -- prix en FCFA (null = pas de prix fixe)
  sort_order    integer DEFAULT 0,             -- ordre d'affichage
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Données initiales
INSERT INTO invitation_service_categories (slug, label, description, icon, price_fcfa, sort_order) VALUES
  ('invitations', 'Invitations Grands Événements', 'Mariages, baptêmes, anniversaires et grands événements', '📜', null, 1),
  ('voeux', 'Vœux d''Exception', 'Cartes de vœux et félicitations exclusives', '🌟', 2000, 2),
  ('mots_doux', 'Les Mots Doux', 'Messages affectueux et attentions romantiques', '💌', 1000, 3),
  ('couple', 'Invitations Couple', 'Soirées et rendez-vous en amoureux', '🥂', 4000, 4)
ON CONFLICT (slug) DO NOTHING;

-- RLS : seuls les admins peuvent modifier les catégories
ALTER TABLE invitation_service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active categories" ON invitation_service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON invitation_service_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

