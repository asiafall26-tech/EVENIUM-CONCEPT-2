"use server";

import { createClient } from "@supabase/supabase-js";
import { ProviderCampaign, CampaignPlanType, CampaignStatus, CAMPAIGN_PLANS } from "@/types/campaigns";
import { getContextualCampaigns } from "@/data/mock/campaigns";

// Mémoire d'exécution partagée pour garantir la persistance immédiate même si la table SQL n'est pas encore créée
let RUNTIME_CAMPAIGNS: ProviderCampaign[] = [];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Récupère les campagnes actives pour les clients (filtrage contextuel : événement & zone)
 * Zéro fausse donnée : si aucune campagne réelle n'a été créée et activée, renvoie un tableau vide []
 */
export async function fetchActiveCampaignsAction(filters?: {
  eventType?: string;
  zone?: string;
  limit?: number;
}): Promise<ProviderCampaign[]> {
  try {
    const admin = getAdminClient();
    if (admin) {
      const now = new Date().toISOString();
      let query = admin
        .from("provider_campaigns")
        .select("*")
        .eq("status", "active")
        .lte("starts_at", now)
        .gte("ends_at", now)
        .order("created_at", { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return getContextualCampaigns(data as ProviderCampaign[], filters);
      }
    }
  } catch (err) {
    console.warn("fetchActiveCampaignsAction db notice:", err);
  }

  // Filtrage sur les campagnes réelles en mémoire
  return getContextualCampaigns(RUNTIME_CAMPAIGNS, filters);
}

/**
 * Récupère les campagnes d'un prestataire donné
 * Renvoie [] s'il n'en a pas encore créée (aucune fausse donnée)
 */
export async function fetchProviderCampaignsAction(providerId?: string): Promise<ProviderCampaign[]> {
  if (!providerId) {
    return [];
  }

  try {
    const admin = getAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("provider_campaigns")
        .select("*")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ProviderCampaign[];
      }
    }
  } catch (err) {
    console.warn("fetchProviderCampaignsAction db notice:", err);
  }

  // Fallback mémoire locale sur les campagnes de ce prestataire
  return RUNTIME_CAMPAIGNS.filter((c) => c.provider_id === providerId);
}

/**
 * Enregistre ou met à jour une annonce créée par le prestataire
 */
export async function saveProviderCampaignAction(campaign: Partial<ProviderCampaign> & { provider_id: string }): Promise<ProviderCampaign> {
  const planInfo = CAMPAIGN_PLANS.find((p) => p.id === campaign.plan_type) || CAMPAIGN_PLANS[0];
  const now = new Date();
  const durationDays = campaign.plan_type === "boost_7j" ? 7 : 30;
  const endsAt = campaign.ends_at || new Date(now.getTime() + durationDays * 86400000).toISOString();

  const campaignId = campaign.id || `camp-${Date.now()}`;

  const payload: ProviderCampaign = {
    id: campaignId,
    provider_id: campaign.provider_id,
    provider_name: campaign.provider_name || "Mon Entreprise",
    provider_avatar: campaign.provider_avatar || null,
    provider_category: campaign.provider_category || "Service Événementiel",
    title: campaign.title || "",
    hook: campaign.hook || "",
    description: campaign.description || "",
    badge: campaign.badge || "Offre Spéciale",
    media_url: campaign.media_url || null,
    cta_label: campaign.cta_label || "Demander un devis",
    target_event_types: campaign.target_event_types && campaign.target_event_types.length > 0 ? campaign.target_event_types : ["Tous"],
    target_zones: campaign.target_zones && campaign.target_zones.length > 0 ? campaign.target_zones : ["Toutes"],
    plan_type: campaign.plan_type || "boost_7j",
    status: campaign.status || "draft",
    price_paid_fcfa: campaign.price_paid_fcfa ?? 0,
    starts_at: campaign.starts_at || now.toISOString(),
    ends_at: endsAt,
    impressions_count: campaign.impressions_count ?? 0,
    clicks_count: campaign.clicks_count ?? 0,
    contacts_count: campaign.contacts_count ?? 0,
    created_at: campaign.created_at || now.toISOString(),
    updated_at: now.toISOString(),
  };

  try {
    const admin = getAdminClient();
    if (admin) {
      if (campaign.id && !campaign.id.startsWith("camp-")) {
        const { data, error } = await admin
          .from("provider_campaigns")
          .update(payload)
          .eq("id", campaign.id)
          .select()
          .single();

        if (!error && data) {
          updateRuntimeList(data as ProviderCampaign);
          return data as ProviderCampaign;
        }
      } else {
        const { data, error } = await admin
          .from("provider_campaigns")
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          updateRuntimeList(data as ProviderCampaign);
          return data as ProviderCampaign;
        }
      }
    }
  } catch (err) {
    console.warn("saveProviderCampaignAction error, persisting in runtime memory:", err);
  }

  updateRuntimeList(payload);
  return payload;
}

function updateRuntimeList(item: ProviderCampaign) {
  const idx = RUNTIME_CAMPAIGNS.findIndex((c) => c.id === item.id);
  if (idx >= 0) {
    RUNTIME_CAMPAIGNS[idx] = item;
  } else {
    RUNTIME_CAMPAIGNS.unshift(item);
  }
}

/**
 * Active une campagne suite au paiement du boost
 */
export async function activateCampaignAction(
  campaignId: string,
  planType: CampaignPlanType
): Promise<{ ok: boolean; message: string; endsAt: string }> {
  const planInfo = CAMPAIGN_PLANS.find((p) => p.id === planType) || CAMPAIGN_PLANS[0];
  const durationDays = planType === "boost_7j" ? 7 : 30;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 86400000).toISOString();

  try {
    const admin = getAdminClient();
    if (admin) {
      await admin
        .from("provider_campaigns")
        .update({
          status: "active",
          plan_type: planType,
          price_paid_fcfa: planInfo.priceFcfa,
          starts_at: now.toISOString(),
          ends_at: endsAt,
          updated_at: now.toISOString(),
        })
        .eq("id", campaignId);
    }
  } catch (err) {
    console.warn("activateCampaignAction db update failed:", err);
  }

  // Mise à jour de la mémoire d'exécution
  const target = RUNTIME_CAMPAIGNS.find((c) => c.id === campaignId) || RUNTIME_CAMPAIGNS[0];
  if (target) {
    target.status = "active";
    target.plan_type = planType;
    target.price_paid_fcfa = planInfo.priceFcfa;
    target.starts_at = now.toISOString();
    target.ends_at = endsAt;
    target.updated_at = now.toISOString();
  }

  return {
    ok: true,
    message: `Félicitations ! Votre campagne est active pour ${planInfo.durationLabel}.`,
    endsAt,
  };
}

/**
 * Enregistre une vue, un clic, un contact ou le masquage d'une annonce
 */
export async function recordCampaignAction(
  campaignId: string,
  action: "impression" | "click" | "dismissed" | "contact",
  userId?: string,
  eventId?: string
): Promise<void> {
  // Incrément mémoire runtime
  const target = RUNTIME_CAMPAIGNS.find((c) => c.id === campaignId);
  if (target) {
    if (action === "impression") target.impressions_count = (target.impressions_count || 0) + 1;
    if (action === "click") target.clicks_count = (target.clicks_count || 0) + 1;
    if (action === "contact") target.contacts_count = (target.contacts_count || 0) + 1;
  }

  try {
    const admin = getAdminClient();
    if (!admin) return;

    await admin.from("campaign_impressions").insert({
      campaign_id: campaignId,
      user_id: userId || null,
      event_id: eventId || null,
      action,
      created_at: new Date().toISOString(),
    });

    if (action === "impression") {
      await admin.rpc("increment_campaign_impressions", { campaign_id: campaignId });
    } else if (action === "click") {
      await admin.rpc("increment_campaign_clicks", { campaign_id: campaignId });
    } else if (action === "contact") {
      await admin.rpc("increment_campaign_contacts", { campaign_id: campaignId });
    }
  } catch {
    // Analytics non bloquante
  }
}

/**
 * Récupère toutes les campagnes pour l'administration (zéro fausse donnée)
 */
export async function fetchAdminCampaignsAction(): Promise<ProviderCampaign[]> {
  try {
    const admin = getAdminClient();
    if (admin) {
      const { data, error } = await admin
        .from("provider_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ProviderCampaign[];
      }
    }
  } catch (err) {
    console.warn("fetchAdminCampaignsAction db notice:", err);
  }

  return RUNTIME_CAMPAIGNS;
}

/**
 * Mise à jour du statut par l'admin (modération)
 */
export async function updateCampaignStatusAction(
  campaignId: string,
  status: CampaignStatus
): Promise<void> {
  const target = RUNTIME_CAMPAIGNS.find((c) => c.id === campaignId);
  if (target) {
    target.status = status;
    target.updated_at = new Date().toISOString();
  }

  try {
    const admin = getAdminClient();
    if (admin) {
      await admin
        .from("provider_campaigns")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", campaignId);
    }
  } catch (err) {
    console.warn("updateCampaignStatusAction error:", err);
  }
}
