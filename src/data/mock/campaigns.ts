import { ProviderCampaign } from "@/types/campaigns";

export const MOCK_PROVIDER_CAMPAIGNS: ProviderCampaign[] = [
  {
    id: "camp-001",
    provider_id: "prov-traiteur-01",
    provider_name: "Saveurs d'Or Traiteur",
    provider_avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80",
    provider_category: "Traiteur & Gastronomie",
    title: "Menu Découverte Fêtes & Mariages",
    hook: "Dégustation gastronomique offerte pour toute réservation de plus de 50 convives avant fin décembre.",
    description: "Une expérience culinaire d'exception pour sublimer vos réceptions privées et cérémonies de prestige.",
    badge: "Dégustation Offerte",
    media_url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    cta_label: "Découvrir la carte",
    target_event_types: ["Mariage", "Noël", "Fêtes de fin d'année", "Gala & Soirée"],
    target_zones: ["Toutes", "Dakar", "Abidjan"],
    plan_type: "boost_30j",
    status: "active",
    price_paid_fcfa: 39000,
    starts_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    ends_at: new Date(Date.now() + 27 * 86400000).toISOString(),
    impressions_count: 1420,
    clicks_count: 184,
    contacts_count: 36,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "camp-002",
    provider_id: "prov-photo-02",
    provider_name: "Studio Lumière & Émotion",
    provider_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    provider_category: "Photographe & Vidéaste",
    title: "Pack Film Cinématographique 4K",
    hook: "-15% sur la formule complète Mariage & drone offert pour les réservations 2025/2026.",
    description: "Immortalisez les regards, les larmes et les sourires à travers un film de mariage au rendu cinéma digne des plus grands festivals.",
    badge: "Remise -15%",
    media_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80",
    cta_label: "Voir le portfolio",
    target_event_types: ["Mariage", "Anniversaire", "Fiançailles"],
    target_zones: ["Toutes", "Dakar", "Paris"],
    plan_type: "subscription_monthly",
    status: "active",
    price_paid_fcfa: 49000,
    starts_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    ends_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    impressions_count: 2890,
    clicks_count: 342,
    contacts_count: 78,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "camp-003",
    provider_id: "prov-deco-03",
    provider_name: "Palais d'Ébène Décoration",
    provider_avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    provider_category: "Décoration & Scénographie",
    title: "Scénographie Féerique de Fin d'Année",
    hook: "Arche florale monumentale & art de la table raffiné pour réveillons et galas d'entreprise.",
    description: "Transformez vos espaces en contes de fées scintillants grâce à nos créations végétales et nos éclairages d'ambiance or chaud.",
    badge: "Édition Limitée",
    media_url: "https://images.unsplash.com/photo-1519225438865-d069b2520638?auto=format&fit=crop&w=800&q=80",
    cta_label: "Demander un devis",
    target_event_types: ["Noël", "Fêtes de fin d'année", "Gala & Soirée", "Séminaire & Corporate"],
    target_zones: ["Toutes", "Dakar", "Abidjan"],
    plan_type: "boost_7j",
    status: "active",
    price_paid_fcfa: 15000,
    starts_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    impressions_count: 940,
    clicks_count: 112,
    contacts_count: 22,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "camp-004",
    provider_id: "prov-dj-04",
    provider_name: "Acoustic Gold & DJ Set",
    provider_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    provider_category: "Animation & DJ",
    title: "Ambiance Son & Lumières Haut de Gamme",
    hook: "Saxophoniste live offert pendant le cocktail pour toute réservation soirée ou mariage.",
    description: "Du cocktail lounge feutré jusqu'à l'effervescence de la piste de danse au bout de la nuit, une programmation musicale sur-mesure.",
    badge: "Artiste Offert",
    media_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    cta_label: "Écouter un extrait",
    target_event_types: ["Mariage", "Anniversaire", "Fêtes de fin d'année", "Gala & Soirée"],
    target_zones: ["Toutes"],
    plan_type: "boost_30j",
    status: "active",
    price_paid_fcfa: 39000,
    starts_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    ends_at: new Date(Date.now() + 25 * 86400000).toISOString(),
    impressions_count: 1810,
    clicks_count: 205,
    contacts_count: 45,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Filter campaigns matching the client's current context (event type & zone)
 */
export function getContextualCampaigns(filters?: {
  eventType?: string;
  zone?: string;
  limit?: number;
}): ProviderCampaign[] {
  let list = [...MOCK_PROVIDER_CAMPAIGNS].filter((c) => c.status === "active");

  if (filters?.eventType && filters.eventType !== "Tous") {
    const normEvent = filters.eventType.toLowerCase();
    const eventMatches = list.filter((c) =>
      c.target_event_types.some((t) => t.toLowerCase() === "tous" || t.toLowerCase() === normEvent)
    );
    if (eventMatches.length > 0) {
      list = eventMatches;
    }
  }

  if (filters?.zone && filters.zone !== "Toutes") {
    const normZone = filters.zone.toLowerCase();
    const zoneMatches = list.filter((c) =>
      c.target_zones.some((z) => z.toLowerCase() === "toutes" || normZone.includes(z.toLowerCase()) || z.toLowerCase().includes(normZone))
    );
    if (zoneMatches.length > 0) {
      list = zoneMatches;
    }
  }

  return list.slice(0, filters?.limit ?? 4);
}
