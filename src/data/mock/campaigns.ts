import { ProviderCampaign } from "@/types/campaigns";

/**
 * Liste initiale vide : Aucune fausse donnée ou prestataire fictif.
 * Les annonces ne proviennent que des prestataires réels ayant souscrit un boost.
 */
export const MOCK_PROVIDER_CAMPAIGNS: ProviderCampaign[] = [];

/**
 * Filtre contextuel des campagnes actives (type d'événement & zone)
 */
export function getContextualCampaigns(
  campaigns: ProviderCampaign[],
  filters?: {
    eventType?: string;
    zone?: string;
    limit?: number;
  }
): ProviderCampaign[] {
  const now = Date.now();
  let list = campaigns.filter((c) => {
    if (c.status !== "active") return false;
    const ends = new Date(c.ends_at).getTime();
    return ends > now;
  });

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
