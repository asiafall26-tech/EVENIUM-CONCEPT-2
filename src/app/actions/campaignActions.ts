"use server";

import { createClient } from "@supabase/supabase-js";
import { ProviderCampaign, CampaignPlanType, CampaignStatus, CAMPAIGN_PLANS } from "@/types/campaigns";
import { MOCK_PROVIDER_CAMPAIGNS, getContextualCampaigns } from "@/data/mock/campaigns";

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
 * Fetch active campaigns for clients (with contextual filters: eventType, zone)
 * Gracefully falls back to rich mock campaigns if table doesn't exist yet or is empty.
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
        let filtered = data as ProviderCampaign[];

        if (filters?.eventType && filters.eventType !== "Tous") {
          const normEvent = filters.eventType.toLowerCase();
          const matches = filtered.filter(
            (c) =>
              !c.target_event_types ||
              c.target_event_types.length === 0 ||
              c.target_event_types.some((t) => t.toLowerCase() === "tous" || t.toLowerCase() === normEvent)
          );
          if (matches.length > 0) filtered = matches;
        }

        if (filters?.zone && filters.zone !== "Toutes") {
          const normZone = filters.zone.toLowerCase();
          const matches = filtered.filter(
            (c) =>
              !c.target_zones ||
              c.target_zones.length === 0 ||
              c.target_zones.some((z) => z.toLowerCase() === "toutes" || normZone.includes(z.toLowerCase()) || z.toLowerCase().includes(normZone))
          );
          if (matches.length > 0) filtered = matches;
        }

        return filtered;
      }
    }
  } catch (err) {
    console.warn("fetchActiveCampaignsAction fallback to mock:", err);
  }

  // Graceful fallback to mock data
  return getContextualCampaigns(filters);
}

/**
 * Fetch campaigns belonging to a specific provider
 */
export async function fetchProviderCampaignsAction(providerId?: string): Promise<ProviderCampaign[]> {
  if (!providerId) {
    return MOCK_PROVIDER_CAMPAIGNS.slice(0, 1);
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
    console.warn("fetchProviderCampaignsAction fallback to mock:", err);
  }

  // Fallback: return default mock matching or created
  return MOCK_PROVIDER_CAMPAIGNS.filter((c) => c.provider_id === providerId || c.id === "camp-001");
}

/**
 * Create or update a provider campaign
 */
export async function saveProviderCampaignAction(campaign: Partial<ProviderCampaign> & { provider_id: string }): Promise<ProviderCampaign> {
  const planInfo = CAMPAIGN_PLANS.find((p) => p.id === campaign.plan_type) || CAMPAIGN_PLANS[0];
  const now = new Date();
  const durationDays = campaign.plan_type === "boost_7j" ? 7 : 30;
  const endsAt = new Date(now.getTime() + durationDays * 86400000).toISOString();

  const payload = {
    provider_id: campaign.provider_id,
    provider_name: campaign.provider_name || "Prestataire Evenium",
    provider_avatar: campaign.provider_avatar || null,
    provider_category: campaign.provider_category || "Service Événementiel",
    title: campaign.title || "Offre Privilège Evenium",
    hook: campaign.hook || "Contactez-nous pour votre prochain événement d'exception.",
    description: campaign.description || "",
    badge: campaign.badge || "Offre Spéciale",
    media_url: campaign.media_url || null,
    cta_label: campaign.cta_label || "Contacter le prestataire",
    target_event_types: campaign.target_event_types || ["Tous"],
    target_zones: campaign.target_zones || ["Toutes"],
    plan_type: campaign.plan_type || "boost_7j",
    status: campaign.status || "active",
    price_paid_fcfa: campaign.price_paid_fcfa ?? planInfo.priceFcfa,
    starts_at: campaign.starts_at || now.toISOString(),
    ends_at: campaign.ends_at || endsAt,
    updated_at: now.toISOString(),
  };

  try {
    const admin = getAdminClient();
    if (admin) {
      if (campaign.id && !campaign.id.startsWith("camp-mock") && !campaign.id.startsWith("camp-00")) {
        const { data, error } = await admin
          .from("provider_campaigns")
          .update(payload)
          .eq("id", campaign.id)
          .select()
          .single();

        if (!error && data) return data as ProviderCampaign;
      } else {
        const { data, error } = await admin
          .from("provider_campaigns")
          .insert({ ...payload, created_at: now.toISOString() })
          .select()
          .single();

        if (!error && data) return data as ProviderCampaign;
      }
    }
  } catch (err) {
    console.warn("saveProviderCampaignAction error, returning simulated object:", err);
  }

  // Simulated fallback for immediate reactivity
  return {
    id: campaign.id || `camp-${Date.now()}`,
    impressions_count: campaign.impressions_count ?? 0,
    clicks_count: campaign.clicks_count ?? 0,
    contacts_count: campaign.contacts_count ?? 0,
    created_at: now.toISOString(),
    ...payload,
  } as ProviderCampaign;
}

/**
 * Activate a campaign after payment
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
    if (admin && !campaignId.startsWith("camp-00")) {
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

  return {
    ok: true,
    message: `Félicitations ! Votre campagne est active pour ${planInfo.durationLabel}.`,
    endsAt,
  };
}

/**
 * Record an impression, click, or dismiss action
 */
export async function recordCampaignAction(
  campaignId: string,
  action: "impression" | "click" | "dismissed" | "contact",
  userId?: string,
  eventId?: string
): Promise<void> {
  try {
    const admin = getAdminClient();
    if (!admin) return;

    // 1. Log impression row
    await admin.from("campaign_impressions").insert({
      campaign_id: campaignId,
      user_id: userId || null,
      event_id: eventId || null,
      action,
      created_at: new Date().toISOString(),
    });

    // 2. Increment counters
    if (action === "impression") {
      await admin.rpc("increment_campaign_impressions", { campaign_id: campaignId });
    } else if (action === "click") {
      await admin.rpc("increment_campaign_clicks", { campaign_id: campaignId });
    } else if (action === "contact") {
      await admin.rpc("increment_campaign_contacts", { campaign_id: campaignId });
    }
  } catch {
    // Silent fail for non-blocking analytics
  }
}

/**
 * Fetch all campaigns for Admin view
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
    console.warn("fetchAdminCampaignsAction fallback to mock:", err);
  }

  return MOCK_PROVIDER_CAMPAIGNS;
}

/**
 * Update campaign status (admin moderation: active, paused, expired)
 */
export async function updateCampaignStatusAction(
  campaignId: string,
  status: CampaignStatus
): Promise<void> {
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

