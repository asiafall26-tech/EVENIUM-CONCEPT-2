import { ProviderCampaign } from "@/types/campaigns";

/**
 * Strictement ZÉRO fausse publicité / Zéro mock fictif.
 * Seules les publications et boosts réellement créés par les prestataires sont affichés.
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
    return isNaN(ends) || ends > now;
  });

  if (filters?.eventType && filters.eventType !== "Tous") {
    const normEvent = filters.eventType.toLowerCase();
    const eventMatches = list.filter((c) =>
      c.target_event_types.some((t) => {
        const normT = t.toLowerCase();
        return normT === "tous" || normEvent.includes(normT) || normT.includes(normEvent);
      })
    );
    if (eventMatches.length > 0) {
      list = eventMatches;
    }
  }

  if (filters?.zone && filters.zone !== "Toutes") {
    const normZone = filters.zone.toLowerCase();
    const zoneMatches = list.filter((c) =>
      c.target_zones.some((z) => {
        const normZ = z.toLowerCase();
        return normZ === "toutes" || normZone.includes(normZ) || normZ.includes(normZone);
      })
    );
    if (zoneMatches.length > 0) {
      list = zoneMatches;
    }
  }

  return list.slice(0, filters?.limit ?? 8);
}
