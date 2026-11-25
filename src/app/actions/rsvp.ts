"use server";

import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { notifyRsvpReceived } from "@/lib/notifications/notifyTargetUser";

export interface GuestRsvpInput {
  eventId: string;
  guestId?: string | null;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  statut_rsvp: "Confirmé" | "Refusé";
  nombre_accompagnants?: number;
  message?: string | null;
}

export async function submitGuestRsvpAction(input: GuestRsvpInput) {
  try {
    const admin = getSupabaseAdmin();
    const row: Record<string, unknown> = {
      nom: input.nom.trim(),
      statut_rsvp: input.statut_rsvp,
      nombre_accompagnants: Math.max(0, Number(input.nombre_accompagnants) || 0),
    };

    if (input.email && input.email.trim()) row.email = input.email.trim();
    if (input.telephone && input.telephone.trim()) row.telephone = input.telephone.trim();

    // 1. Si un guestId est spécifié (lien personnel d'un invité importé)
    if (input.guestId) {
      // Récupérer le message existant pour préserver le tag de groupe si présent
      let finalMessage = input.message && input.message.trim() ? input.message.trim() : null;
      try {
        const { data: existingGuest } = await admin
          .from("guests")
          .select("message")
          .eq("id", input.guestId)
          .maybeSingle();

        if (existingGuest?.message && existingGuest.message.startsWith("[Groupe:")) {
          const groupMatch = existingGuest.message.match(/^(\[Groupe:\s*[^\]]+\])/);
          if (groupMatch && finalMessage) {
            finalMessage = `${groupMatch[1]} ${finalMessage}`;
          } else if (groupMatch && !finalMessage) {
            finalMessage = groupMatch[1];
          }
        }
      } catch {
        // Ignorer
      }

      if (finalMessage) row.message = finalMessage;

      const { data: updated, error: updateErr } = await admin
        .from("guests")
        .update(row)
        .eq("id", input.guestId)
        .select()
        .single();

      if (!updateErr && updated) {
        // Notification organisateur
        try {
          const { data: ev } = await admin
            .from("events")
            .select("client_id, name")
            .eq("id", input.eventId)
            .maybeSingle();

          if (ev?.client_id) {
            await notifyRsvpReceived(ev.client_id, input.nom, ev.name || "Votre événement", input.eventId);
          }
        } catch {}

        return { success: true, guest: updated };
      }
    }

    // 2. Sinon, insertion standard pour le lien ouvert
    row.event_id = input.eventId;
    if (input.message && input.message.trim()) row.message = input.message.trim();

    let { data, error } = await admin.from("guests").insert([row]).select().single();

    // Fallback if message column somehow errors out
    if (error && row.message && error.message?.includes("message")) {
      delete row.message;
      const res = await admin.from("guests").insert([row]).select().single();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("submitGuestRsvpAction error:", error);
      return { success: false, error: error.message };
    }

    // Envoyer une notification push / in-app à l'organisateur
    try {
      const { data: ev } = await admin
        .from("events")
        .select("client_id, name")
        .eq("id", input.eventId)
        .maybeSingle();

      if (ev?.client_id) {
        await notifyRsvpReceived(ev.client_id, input.nom, ev.name || "Votre événement", input.eventId);
      }
    } catch (notifErr) {
      console.warn("Erreur envoi notification RSVP:", notifErr);
    }

    return { success: true, guest: data };
  } catch (err: any) {
    console.error("submitGuestRsvpAction exception:", err);
    return { success: false, error: err?.message || "Erreur serveur RSVP" };
  }
}
