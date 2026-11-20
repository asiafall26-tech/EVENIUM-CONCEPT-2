-- ============================================================================
-- Evenium : Bibliothèque de messages d'accompagnement (message_templates)
-- Permet aux organisateurs d'avoir des messages pré-rédigés par type d'événement
-- et par tonalité (formel, chaleureux, court, tendre), modifiables par l'admin sans code.
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  sub_type TEXT,
  tone TEXT NOT NULL, -- 'formel', 'chaleureux', 'court', 'tendre'
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour accélérer les requêtes par type et statut
CREATE INDEX IF NOT EXISTS idx_message_templates_type_active ON message_templates(event_type, is_active);
CREATE INDEX IF NOT EXISTS idx_message_templates_tone ON message_templates(tone);

-- Politiques RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Public read active message templates'
  ) THEN
    CREATE POLICY "Public read active message templates"
      ON message_templates FOR SELECT
      USING (is_active = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'Admin full access message templates'
  ) THEN
    CREATE POLICY "Admin full access message templates"
      ON message_templates FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Insertion des 13 messages de départ requis par Evenium
INSERT INTO message_templates (event_type, sub_type, tone, body, is_active)
VALUES
  -- MARIAGE
  ('mariage', NULL, 'formel', 'Bonjour {prenom_invite}, nous avons l''honneur de vous convier au mariage de {prenoms_hotes}, le {date} à {lieu}. Votre invitation vous attend ici : {lien}', TRUE),
  ('mariage', NULL, 'chaleureux', '{prenom_invite}, le grand jour approche ! {prenoms_hotes} seraient ravis de vous compter parmi eux. Découvrez votre invitation : {lien} 💍', TRUE),

  -- BAPTÊME
  ('baptême', NULL, 'formel', 'Bonjour {prenom_invite}, la famille {prenoms_hotes} a la joie de vous inviter au baptême de leur enfant, le {date}. Votre invitation : {lien}', TRUE),
  ('baptême', NULL, 'chaleureux', 'Une petite merveille est arrivée ! {prenoms_hotes} vous invitent à célébrer son baptême le {date}. Tous les détails ici : {lien} 👶', TRUE),

  -- ANNIVERSAIRE
  ('anniversaire', NULL, 'chaleureux', '{prenom_invite}, on fête l''anniversaire de {prenoms_hotes} le {date} et ce ne sera pas pareil sans toi ! Ton invitation : {lien} 🎉', TRUE),
  ('anniversaire', NULL, 'court', 'Tu es invité·e ! Anniversaire de {prenoms_hotes}, le {date}. Infos et réponse : {lien}', TRUE),

  -- CONFÉRENCE / SÉMINAIRE
  ('conférence', NULL, 'formel', 'Bonjour, vous êtes cordialement invité·e à notre événement du {date} à {lieu}. Merci de confirmer votre présence en indiquant votre nom ici : {lien}', TRUE),
  ('conférence', NULL, 'court', 'Invitation personnelle : événement du {date}. Confirmez votre présence ici : {lien}', TRUE),

  -- VŒUX
  ('vœux', 'Korité / Tabaski', 'chaleureux', '{prenom_invite}, en ce jour béni, {prenoms_hotes} vous souhaitent paix, santé et baraka. Une petite surprise vous attend ici : {lien} 🌙', TRUE),
  ('vœux', 'Nouvel An', 'chaleureux', 'Bonne et heureuse année {prenom_invite} ! Que cette année vous apporte joie et réussite. Nos vœux en images : {lien} ✨', TRUE),

  -- MOTS DOUX
  ('mots doux', 'couple', 'tendre', 'Pour toi, mon cœur… j''ai préparé quelque chose rien que pour toi : {lien} ❤️', TRUE),
  ('mots doux', 'amis', 'chaleureux', 'Juste un petit mot pour te dire à quel point tu comptes pour moi. Ouvre ceci : {lien} 💛', TRUE),
  ('mots doux', 'famille', 'tendre', 'Parce qu''on ne le dit pas assez : merci d''être là. Un message pour toi : {lien} 🌸', TRUE)
ON CONFLICT DO NOTHING;
