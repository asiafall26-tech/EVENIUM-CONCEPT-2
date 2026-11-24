"use server";

import { getSupabaseAdmin } from "@/utils/supabase/admin";

export interface SaveWishReplyInput {
  eventId: string;
  guestId: string;
  replyText: string;
  channel?: "whatsapp" | "sms" | "email" | "manuel";
  guestPhone?: string;
}

export interface WishReplyRecord {
  reply: string;
  repliedAt: string;
  channel: string;
}

/**
 * Enregistre la réponse d'un hôte/organisateur aux vœux d'un invité.
 * Sauvegarde à la fois dans event_details (colonne JSON fiable de events)
 * et tente une mise à jour sur la table guests si les colonnes existent.
 */
export async function saveWishReplyAction(input: SaveWishReplyInput) {
  try {
    const admin = getSupabaseAdmin();
    const nowIso = new Date().toISOString();
    const cleanReply = input.replyText.trim();

    if (!cleanReply) {
      return { success: false, error: "Le texte de réponse est vide." };
    }

    // 1. Récupérer l'événement et son event_details existant
    const { data: ev, error: evError } = await admin
      .from("events")
      .select("id, event_details")
      .eq("id", input.eventId)
      .maybeSingle();

    if (evError || !ev) {
      console.error("saveWishReplyAction error fetching event:", evError);
      return { success: false, error: "Événement introuvable." };
    }

    const currentDetails = (ev.event_details && typeof ev.event_details === "object" ? ev.event_details : {}) as Record<string, any>;
    const currentReplies = (currentDetails.guest_replies && typeof currentDetails.guest_replies === "object" ? currentDetails.guest_replies : {}) as Record<string, WishReplyRecord>;

    const updatedReplies = {
      ...currentReplies,
      [input.guestId]: {
        reply: cleanReply,
        repliedAt: nowIso,
        channel: input.channel || "whatsapp",
      },
    };

    const updatedDetails = {
      ...currentDetails,
      guest_replies: updatedReplies,
    };

    // Mettre à jour events.event_details
    const { error: updateEventError } = await admin
      .from("events")
      .update({ event_details: updatedDetails })
      .eq("id", input.eventId);

    if (updateEventError) {
      console.error("saveWishReplyAction error updating event_details:", updateEventError);
    }

    // 2. Si le téléphone a été complété ou corrigé lors de la réponse, le mettre à jour dans guests
    if (input.guestPhone && input.guestPhone.trim()) {
      try {
        await admin
          .from("guests")
          .update({ telephone: input.guestPhone.trim() })
          .eq("id", input.guestId);
      } catch (phoneErr) {
        console.warn("Could not update guest phone:", phoneErr);
      }
    }

    // 3. Tenter de mettre à jour la colonne reponse dans guests si elle existe
    try {
      await admin
        .from("guests")
        .update({
          reponse: cleanReply,
          reponse_envoyee_le: nowIso,
        } as any)
        .eq("id", input.guestId);
    } catch (guestErr) {
      // Ignorer si les colonnes reponse / reponse_envoyee_le n'ont pas encore été créées par script SQL
      console.info("Info: colonnes reponse/reponse_envoyee_le non présentes dans guests, données conservées dans event_details.");
    }

    return {
      success: true,
      reply: cleanReply,
      repliedAt: nowIso,
      channel: input.channel || "whatsapp",
    };
  } catch (err: any) {
    console.error("saveWishReplyAction exception:", err);
    return { success: false, error: err?.message || "Erreur serveur lors de la sauvegarde de la réponse." };
  }
}

/**
 * Récupère l'ensemble des réponses enregistrées pour un événement donné
 */
export async function getWishRepliesAction(eventId: string): Promise<Record<string, WishReplyRecord>> {
  try {
    const admin = getSupabaseAdmin();
    const { data: ev } = await admin
      .from("events")
      .select("event_details")
      .eq("id", eventId)
      .maybeSingle();

    if (!ev || !ev.event_details) return {};
    const details = ev.event_details as Record<string, any>;
    return (details.guest_replies as Record<string, WishReplyRecord>) || {};
  } catch (err) {
    console.error("getWishRepliesAction error:", err);
    return {};
  }
}
