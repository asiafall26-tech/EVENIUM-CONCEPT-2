"use server";

import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { formatMsgWithGroup } from "@/lib/guestImportUtils";

export interface ImportGuestItem {
  fullName: string;
  telephone?: string | null;
  email?: string | null;
  nombre_accompagnants?: number;
  groupe?: string | null;
}

export async function importGuestsAction(eventId: string, guests: ImportGuestItem[]) {
  try {
    const admin = getSupabaseAdmin();

    if (!guests || guests.length === 0) {
      return { success: false, error: "Aucun invité à importer" };
    }

    const rowsToInsert = guests.map((g) => {
      const messageField = formatMsgWithGroup(g.groupe, null);
      return {
        event_id: eventId,
        nom: g.fullName.trim() || "Invité",
        telephone: g.telephone?.trim() || null,
        email: g.email?.trim() ? g.email.trim().toLowerCase() : null,
        statut_rsvp: "Non envoyé",
        nombre_accompagnants: Math.max(0, Number(g.nombre_accompagnants) || 0),
        message: messageField,
      };
    });

    const { data: inserted, error } = await admin
      .from("guests")
      .insert(rowsToInsert)
      .select("id, nom, telephone, email, statut_rsvp, nombre_accompagnants, message, created_at");

    if (error) {
      console.error("importGuestsAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/invitations`);
    revalidatePath(`/dashboard/events/${eventId}`);

    return {
      success: true,
      count: inserted?.length || 0,
      guests: inserted || [],
    };
  } catch (err: any) {
    console.error("importGuestsAction unexpected error:", err);
    return { success: false, error: err.message || "Erreur lors de l'import des invités" };
  }
}

export async function updateGuestStatusAction(guestId: string, eventId: string, status: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("guests")
      .update({ statut_rsvp: status })
      .eq("id", guestId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/invitations`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de mettre à jour le statut" };
  }
}

export async function markGuestOpenedAction(guestId: string, eventId?: string) {
  try {
    const admin = getSupabaseAdmin();
    const { data: existing, error: fetchErr } = await admin
      .from("guests")
      .select("id, event_id, nom, telephone, email, statut_rsvp, nombre_accompagnants, message")
      .eq("id", guestId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return { success: false, error: "Invité introuvable", guest: null };
    }

    // Mettre à jour en 'Ouvert' uniquement si non encore confirmé ou refusé
    if (existing.statut_rsvp === "Non envoyé" || existing.statut_rsvp === "Envoyé") {
      await admin
        .from("guests")
        .update({ statut_rsvp: "Ouvert" })
        .eq("id", guestId);

      existing.statut_rsvp = "Ouvert";
    }

    if (eventId || existing.event_id) {
      revalidatePath(`/dashboard/events/${eventId || existing.event_id}/invitations`);
    }

    return { success: true, guest: existing };
  } catch (err: any) {
    return { success: false, error: err.message, guest: null };
  }
}

export async function deleteGuestAction(guestId: string, eventId: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("guests").delete().eq("id", guestId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/invitations`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de suppression" };
  }
}

export async function sendBulkEmailInvitationsAction(params: {
  eventId: string;
  eventName: string;
  guestIds: string[];
  accompanimentMessage?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    const { eventId, guestIds } = params;

    if (!guestIds || guestIds.length === 0) {
      return { success: false, error: "Aucun invité sélectionné" };
    }

    // Mettre à jour le statut des invités envoyés en 'Envoyé'
    const { error } = await admin
      .from("guests")
      .update({ statut_rsvp: "Envoyé" })
      .in("id", guestIds)
      .eq("event_id", eventId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/invitations`);
    return { success: true, sentCount: guestIds.length };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de l'envoi des invitations" };
  }
}

