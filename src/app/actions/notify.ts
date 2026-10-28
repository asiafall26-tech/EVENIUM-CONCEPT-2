"use server";

import {
  notifyNewMessage,
  notifyNewQuoteRequest,
  notifyQuoteSubmitted,
  notifyQuoteAccepted,
  notifyRsvpReceived,
  notifyRevisionRequested,
} from "@/lib/notifications/notifyTargetUser";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

export async function sendRsvpPushAction(eventId: string, guestName: string) {
  try {
    const admin = getSupabaseAdmin();
    const { data: ev } = await admin.from("events").select("client_id, name").eq("id", eventId).maybeSingle();
    if (ev?.client_id) {
      await notifyRsvpReceived(ev.client_id, guestName, ev.name || "Votre événement", eventId);
    }
  } catch (err) {
    console.warn("sendRsvpPushAction error:", err);
  }
}

export async function sendQuoteRequestPushAction(prestataireId: string, clientName?: string, eventName?: string) {
  try {
    await notifyNewQuoteRequest(prestataireId, clientName, eventName);
  } catch (err) {
    console.warn("sendQuoteRequestPushAction error:", err);
  }
}

export async function sendQuoteSubmittedPushAction(clientId: string, providerName?: string, amount?: string | number) {
  try {
    await notifyQuoteSubmitted(clientId, providerName, amount);
  } catch (err) {
    console.warn("sendQuoteSubmittedPushAction error:", err);
  }
}

export async function sendQuoteAcceptedPushAction(prestataireId: string, clientName?: string, eventName?: string) {
  try {
    await notifyQuoteAccepted(prestataireId, clientName, eventName);
  } catch (err) {
    console.warn("sendQuoteAcceptedPushAction error:", err);
  }
}

export async function sendRevisionRequestedPushAction(
  prestataireId: string,
  clientName?: string,
  eventName?: string,
  devisReference?: string
) {
  try {
    await notifyRevisionRequested(prestataireId, clientName, eventName, devisReference);
  } catch (err) {
    console.warn("sendRevisionRequestedPushAction error:", err);
  }
}
