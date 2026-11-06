export type CampaignPlanType = "boost_7j" | "boost_30j" | "subscription_monthly";

export type CampaignStatus = "draft" | "pending" | "active" | "expired" | "paused";

export interface ProviderCampaign {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar?: string | null;
  provider_category?: string | null;
  title: string;
  hook: string;
  description?: string | null;
  badge: string;
  media_url?: string | null;
  cta_label: string;
  target_event_types: string[];
  target_zones: string[];
  plan_type: CampaignPlanType;
  status: CampaignStatus;
  price_paid_fcfa: number;
  starts_at: string;
  ends_at: string;
  impressions_count: number;
  clicks_count: number;
  contacts_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignPlanOffer {
  id: CampaignPlanType;
  name: string;
  durationLabel: string;
  priceFcfa: number;
  priceEur: string;
  badge?: string;
  features: string[];
}

export const CAMPAIGN_PLANS: CampaignPlanOffer[] = [
  {
    id: "boost_7j",
    name: "Boost Événement",
    durationLabel: "7 jours de visibilité",
    priceFcfa: 15000,
    priceEur: "22 €",
    badge: "Idéal pour une date",
    features: [
      "Affichage prioritaire sur le Dashboard des organisateurs",
      "Ciblage par zone géographique & type d'événement",
      "Badge « Partenaire en Vedette » dans le catalogue",
      "Statistiques de clics et consultations en direct",
    ],
  },
  {
    id: "boost_30j",
    name: "Pack Visibilité Mensuelle",
    durationLabel: "30 jours de diffusion continue",
    priceFcfa: 39000,
    priceEur: "59 €",
    badge: "Le plus populaire",
    features: [
      "Présence continue 30 jours en tête de liste catalogue",
      "Carrousel « Sélection Privilège » sur le dashboard clients",
      "Inclusion dans le Digest Hebdomadaire des organisateurs",
      "Bouton de mise en relation directe par messagerie",
      "Support prioritaire Evenium Pro",
    ],
  },
  {
    id: "subscription_monthly",
    name: "Abonnement Pro Illimité",
    durationLabel: "Mensuel sans engagement",
    priceFcfa: 49000,
    priceEur: "75 € / mois",
    badge: "Performance Maximale",
    features: [
      "Visibilité permanente garantie dans votre catégorie",
      "Modification libre et illimitée de vos annonces & promos",
      "Accès aux statistiques avancées d'audiences & demandes",
      "Mise en avant sur les réseaux sociaux & vitrine Evenium",
      "Zéro commission supplémentaire sur vos devis signés",
    ],
  },
];
