"use server";

import { markConversationReadInStore } from "@/app/actions/messages";
import fs from "fs";
import path from "path";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const PERSISTED_MESSAGES_FILE = path.join(process.cwd(), "src", "data", "mock", "persisted_messages.json");

// Service-role client: counts must work whatever the RLS policies of each table
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export type AppRole = "admin" | "client" | "prestataire";

export interface BadgeCounts {
  userId: string | null;
  role: AppRole | null;
  /** Messages received by the current user and not opened yet */
  unreadMessages: number;
  /** Admin: support tickets not resolved yet */
  pendingSupport: number;
  /** Admin: providers who signed up since the providers page was last opened */
  newPrestataires: number;
  /** Prestataire: quote requests to handle + quotes the client asked to modify */
  pendingDemandes: number;
  /** Prestataire: client reviews without a reply */
  unansweredReviews: number;
  /** Organisateur: quotes received and waiting for a decision */
  pendingDevis: number;
  /** Organisateur: guest answers received since the participants page was last opened, per event */
  newRsvps: Record<string, number>;
}

const EMPTY: BadgeCounts = {
  userId: null,
  role: null,
  unreadMessages: 0,
  pendingSupport: 0,
  newPrestataires: 0,
  pendingDemandes: 0,
  unansweredReviews: 0,
  pendingDevis: 0,
  newRsvps: {},
};

/** Statuses of a support ticket that no longer needs an answer from the team */
const RESOLVED_STATUSES = ["résolu", "fermé"];
/** Quote requests the provider still has to answer ("Nouvelle" becomes "À traiter" once opened) */
const OPEN_DEMANDE_STATUSES = ["Nouvelle", "À traiter", "En attente"];

const inList = (values: string[]) => `(${values.map((v) => `"${v}"`).join(",")})`;

async function count(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  return error ? 0 : (count ?? 0);
}

const serverBadgeCache = new Map<string, { counts: BadgeCounts; timestamp: number }>();

/**
 * Counters shown as badges in the menus and the bell, for the signed-in user.
 * `rsvpSeenAt` maps an event id to the last time its participants page was opened (ISO date).
 * `prestatairesSeenAt` is the last time an admin opened the providers page (ISO date).
 */
export async function getBadgeCounts(rsvpSeenAt: Record<string, string> = {}, prestatairesSeenAt?: string): Promise<BadgeCounts> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const now = Date.now();
  const cached = serverBadgeCache.get(user.id);
  if (cached && now - cached.timestamp < 10000) {
    return cached.counts;
  }

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role ?? null) as AppRole | null;
  const result: BadgeCounts = { ...EMPTY, newRsvps: {}, userId: user.id, role };

  const dbUnread = await count(
    supabaseAdmin.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).eq("is_read", false)
  );

  let diskUnread = 0;
  try {
    if (fs.existsSync(PERSISTED_MESSAGES_FILE)) {
      const raw = fs.readFileSync(PERSISTED_MESSAGES_FILE, "utf-8");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          diskUnread = parsed.filter((m: any) => m.receiver_id === user.id && !m.is_read).length;
        }
      }
    }
  } catch {}

  result.unreadMessages = Math.max(dbUnread, diskUnread);

  if (role === "admin") {
    result.pendingSupport = await count(
      supabaseAdmin.from("support_tickets").select("id", { count: "exact", head: true }).not("status", "in", inList(RESOLVED_STATUSES))
    );
    if (prestatairesSeenAt && !Number.isNaN(Date.parse(prestatairesSeenAt))) {
      result.newPrestataires = await count(
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "prestataire").gt("created_at", prestatairesSeenAt)
      );
    }
  }

  if (role === "prestataire") {
    const [demandes, modifications, reviews] = await Promise.all([
      count(
        supabaseAdmin.from("demandes_devis").select("id", { count: "exact", head: true }).eq("prestataire_id", user.id).in("status", OPEN_DEMANDE_STATUSES)
      ),
      count(
        supabaseAdmin.from("devis").select("id", { count: "exact", head: true }).eq("prestataire_id", user.id).in("status", ["Modification demandée", "Révision demandée", "En cours de révision"])
      ),
      count(supabaseAdmin.from("reviews").select("id", { count: "exact", head: true }).eq("prestataire_id", user.id).is("reply", null)),
    ]);
    result.pendingDemandes = demandes + modifications;
    result.unansweredReviews = reviews;
  }

  if (role === "client") {
    result.pendingDevis = await count(
      supabaseAdmin
        .from("devis")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.id)
        .eq("is_draft", false)
        .in("status", ["En attente de validation", "Nouvelle version envoyée", "Envoyé"])
    );

    // New guest answers, only for events whose participants page was opened at least once
    const seen = Object.entries(rsvpSeenAt).filter(([, at]) => !Number.isNaN(Date.parse(at)));
    if (seen.length) {
      const { data: events } = await supabaseAdmin.from("events").select("id").eq("client_id", user.id).in("id", seen.map(([id]) => id));
      const mine = new Set((events ?? []).map((e: any) => e.id));
      const counts = await Promise.all(
        seen
          .filter(([id]) => mine.has(id))
          .map(async ([id, at]) => [id, await count(supabaseAdmin.from("guests").select("id", { count: "exact", head: true }).eq("event_id", id).gt("created_at", at))] as const)
      );
      for (const [id, n] of counts) if (n > 0) result.newRsvps[id] = n;
    }
  }

  serverBadgeCache.set(user.id, { counts: result, timestamp: Date.now() });
  return result;
}

/** Marks every message received from `otherUserId` as read, for the signed-in user. */
export async function markConversationRead(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "prov-me";
  if (!otherUserId) return { error: "Paramètre manquant" };

  await markConversationReadInStore(userId, otherUserId);

  try {
    await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", userId)
      .eq("sender_id", otherUserId)
      .eq("is_read", false);
  } catch {}

  return { success: true };
}
