import { ProviderCampaign } from "@/types/campaigns";
import { 
  fetchActiveCampaignsAction, 
  fetchProviderCampaignsAction, 
  saveProviderCampaignAction, 
  deleteProviderCampaignAction,
  toggleCampaignLikeAction
} from "@/app/actions/campaignActions";
import { addNotificationForClient } from "@/lib/notifications";

const STORAGE_KEY = "evenium_provider_campaigns";

/**
 * Récupère les campagnes sauvegardées dans le stockage local du navigateur
 */
export function getStoredCampaigns(): ProviderCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("getStoredCampaigns storage read error:", err);
    return [];
  }
}

/**
 * Met à jour le stockage local des campagnes
 */
function setStoredCampaigns(campaigns: ProviderCampaign[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (err) {
    console.warn("setStoredCampaigns storage write error:", err);
  }
}

/**
 * Enregistre une campagne à la fois localement et sur le serveur
 * Déclenche automatiquement l'alerte client dans la cloche de notifications
 */
export async function saveCampaignLocallyAndRemotely(
  campaignData: Partial<ProviderCampaign> & { provider_id: string }
): Promise<ProviderCampaign> {
  const existingList = getStoredCampaigns();
  const id = campaignData.id || `camp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const now = new Date();
  const durationDays = campaignData.plan_type === "boost_7j" ? 7 : 30;
  const endsAt = campaignData.ends_at || new Date(now.getTime() + durationDays * 86400000).toISOString();

  const fullCampaign: ProviderCampaign = {
    id,
    provider_id: campaignData.provider_id,
    provider_name: campaignData.provider_name || "Prestataire Evenium",
    provider_avatar: campaignData.provider_avatar || null,
    provider_category: campaignData.provider_category || "Service Événementiel",
    title: campaignData.title || "",
    hook: campaignData.hook || "",
    description: campaignData.description || "",
    badge: campaignData.badge || "✨ Offre Spéciale",
    media_url: campaignData.media_url || null,
    cta_label: campaignData.cta_label || "Demander un devis",
    target_event_types: campaignData.target_event_types && campaignData.target_event_types.length > 0 ? campaignData.target_event_types : ["Tous"],
    target_zones: campaignData.target_zones && campaignData.target_zones.length > 0 ? campaignData.target_zones : ["Toutes"],
    plan_type: campaignData.plan_type || "boost_7j",
    status: campaignData.status || "active",
    price_paid_fcfa: campaignData.price_paid_fcfa ?? 0,
    starts_at: campaignData.starts_at || now.toISOString(),
    ends_at: endsAt,
    impressions_count: campaignData.impressions_count ?? 0,
    clicks_count: campaignData.clicks_count ?? 0,
    contacts_count: campaignData.contacts_count ?? 0,
    likes_count: campaignData.likes_count ?? 0,
    created_at: campaignData.created_at || now.toISOString(),
    updated_at: now.toISOString(),
  };

  // 1. Sauvegarde locale immédiate (réactivité instantanée)
  const idx = existingList.findIndex((c) => c.id === id);
  if (idx >= 0) {
    existingList[idx] = fullCampaign;
  } else {
    existingList.unshift(fullCampaign);
  }
  setStoredCampaigns(existingList);

  // 2. Déclenchement de la notification automatique pour les clients
  if (fullCampaign.status === "active") {
    addNotificationForClient({
      title: `✨ Nouvelle Offre : ${fullCampaign.provider_name}`,
      desc: `${fullCampaign.title} — ${fullCampaign.hook}`,
      link: `/dashboard`,
      type: "boost_offer",
    });
  }

  // 3. Diffusion de l'événement de mise à jour pour tous les composants à l'écoute
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("evenium_campaigns_updated", { detail: fullCampaign }));
  }

  // 4. Synchronisation serveur asynchrone sécurisée
  try {
    const serverResult = await saveProviderCampaignAction(fullCampaign);
    if (serverResult && serverResult.id) {
      const updatedIdx = existingList.findIndex((c) => c.id === id);
      if (updatedIdx >= 0) {
        existingList[updatedIdx] = serverResult;
        setStoredCampaigns(existingList);
      }
      return serverResult;
    }
  } catch (err) {
    console.warn("saveProviderCampaignAction async sync fallback to local:", err);
  }

  return fullCampaign;
}

/**
 * Récupère toutes les campagnes actives pour les clients (fusion serveur + local, zéro fausse pub)
 */
export async function loadActiveCampaigns(filters?: {
  eventType?: string;
  zone?: string;
  limit?: number;
}): Promise<ProviderCampaign[]> {
  const mergedMap = new Map<string, ProviderCampaign>();

  // 1. Charger depuis le stockage local
  const localList = getStoredCampaigns();
  localList.forEach((c) => {
    if (c.status === "active") {
      mergedMap.set(c.id, c);
    }
  });

  // 2. Charger depuis le serveur
  try {
    const serverList = await fetchActiveCampaignsAction(filters);
    if (serverList && serverList.length > 0) {
      serverList.forEach((c) => {
        if (c.status === "active") {
          mergedMap.set(c.id, c);
        }
      });
    }
  } catch (err) {
    console.warn("loadActiveCampaigns server load notice:", err);
  }

  const allActive = Array.from(mergedMap.values());
  const now = Date.now();

  let filtered = allActive.filter((c) => {
    if (c.status !== "active") return false;
    const ends = new Date(c.ends_at).getTime();
    return isNaN(ends) || ends > now;
  });

  // Filtrage intelligent selon événement et zone si spécifiés
  if (filters?.eventType && filters.eventType !== "Tous") {
    const norm = filters.eventType.toLowerCase();
    const matches = filtered.filter((c) =>
      c.target_event_types.some((t) => {
        const tn = t.toLowerCase();
        return tn === "tous" || norm.includes(tn) || tn.includes(norm);
      })
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  if (filters?.zone && filters.zone !== "Toutes") {
    const norm = filters.zone.toLowerCase();
    const matches = filtered.filter((c) =>
      c.target_zones.some((z) => {
        const zn = z.toLowerCase();
        return zn === "toutes" || norm.includes(zn) || zn.includes(norm);
      })
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  return filtered.slice(0, filters?.limit ?? 12);
}

/**
 * Récupère les campagnes d'un prestataire (fusion serveur + local)
 */
export async function loadProviderCampaigns(providerId: string): Promise<ProviderCampaign[]> {
  const mergedMap = new Map<string, ProviderCampaign>();

  // 1. Local
  const localList = getStoredCampaigns().filter((c) => c.provider_id === providerId);
  localList.forEach((c) => mergedMap.set(c.id, c));

  // 2. Serveur
  try {
    const serverList = await fetchProviderCampaignsAction(providerId);
    if (serverList && serverList.length > 0) {
      serverList.forEach((c) => mergedMap.set(c.id, c));
    }
  } catch (err) {
    console.warn("loadProviderCampaigns server fetch notice:", err);
  }

  return Array.from(mergedMap.values());
}

/**
 * Supprime une publication localement et sur le serveur
 */
export async function deleteCampaignLocallyAndRemotely(
  campaignId: string,
  providerId: string
): Promise<boolean> {
  const existingList = getStoredCampaigns();
  const updated = existingList.filter((c) => c.id !== campaignId);
  setStoredCampaigns(updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("evenium_campaigns_updated"));
  }

  try {
    await deleteProviderCampaignAction(campaignId, providerId);
  } catch (err) {
    console.warn("deleteProviderCampaignAction error:", err);
  }

  return true;
}

/**
 * Alterne le J'aime sur une publication et synchronise instantanément en local et sur le serveur
 */
export async function toggleCampaignLikeLocallyAndRemotely(
  campaignId: string,
  increment: boolean
): Promise<number> {
  const existingList = getStoredCampaigns();
  let updatedCount = 0;
  const idx = existingList.findIndex((c) => c.id === campaignId);
  if (idx >= 0) {
    const cur = existingList[idx].likes_count || 0;
    updatedCount = Math.max(0, cur + (increment ? 1 : -1));
    existingList[idx] = {
      ...existingList[idx],
      likes_count: updatedCount,
    };
    setStoredCampaigns(existingList);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("evenium_campaign_like_updated", {
        detail: { campaignId, likesCount: updatedCount, increment },
      })
    );
    window.dispatchEvent(new CustomEvent("evenium_campaigns_updated"));
  }

  try {
    const res = await toggleCampaignLikeAction(campaignId, "client", increment);
    if (res && typeof res.likesCount === "number") {
      updatedCount = res.likesCount;
      const reList = getStoredCampaigns();
      const reIdx = reList.findIndex((c) => c.id === campaignId);
      if (reIdx >= 0) {
        reList[reIdx].likes_count = updatedCount;
        setStoredCampaigns(reList);
      }
    }
  } catch (err) {
    console.warn("toggleCampaignLikeLocallyAndRemotely server notice:", err);
  }

  return updatedCount;
}
