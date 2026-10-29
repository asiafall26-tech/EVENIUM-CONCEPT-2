"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

import { SupportAttachment, encodeSupportMessage, decodeSupportTicket } from "@/lib/support/supportPayload";
export type { SupportAttachment };

export async function createSupportTicket(
  userId: string,
  subject: string,
  message: string,
  attachments?: SupportAttachment[],
  audioUrl?: string,
  audioDuration?: number
) {
  if (!userId || !subject || (!message && !audioUrl)) {
    return { error: "Un sujet et un message ou note vocale sont requis." };
  }

  const encodedMessage = encodeSupportMessage(message || "Message vocal support", attachments, audioUrl, audioDuration);

  try {
    // Tentative d'insertion avec colonnes enrichies si présentes
    const payloadWithColumns: any = {
      user_id: userId,
      subject,
      message: encodedMessage,
      status: "en attente",
      attachments: attachments && attachments.length > 0 ? attachments : null,
      audio_url: audioUrl || null,
      audio_duration: audioDuration || null
    };

    let { error } = await getSupabaseAdmin()
      .from("support_tickets")
      .insert(payloadWithColumns);

    // Si erreur de schéma (colonnes non créées), repli transparent vers colonnes de base
    if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema'))) {
      const fallbackResult = await getSupabaseAdmin()
        .from("support_tickets")
        .insert({
          user_id: userId,
          subject,
          message: encodedMessage,
          status: "en attente"
        });
      error = fallbackResult.error;
    }

    if (error) {
      if (error.code === '42P01') {
        return { error: "La table 'support_tickets' n'existe pas encore dans Supabase." };
      }
      throw error;
    }

    revalidatePath("/admin/support");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur createSupportTicket:", error);
    return { error: error.message };
  }
}

export async function getSupportTickets() {
  const { data: tickets, error: ticketsError } = await getSupabaseAdmin()
    .from("support_tickets")
    .select('*')
    .order("created_at", { ascending: false });

  if (ticketsError) {
    console.error("Erreur getSupportTickets:", ticketsError);
    return { data: [], error: ticketsError.message };
  }
  
  if (!tickets || tickets.length === 0) {
    return { data: [], error: null };
  }

  // Fetch profiles
  const userIds = [...new Set(tickets.map(t => t.user_id))];
  const { data: profiles } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", userIds);

  const profileMap = (profiles || []).reduce((acc: any, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedTickets = tickets.map(t => {
    const decoded = decodeSupportTicket(t);
    return {
      ...decoded,
      profiles: profileMap[t.user_id] || null
    };
  });

  return { data: enrichedTickets, error: null };
}

export async function updateTicketStatus(ticketId: string, status: string) {
  // First, get the ticket info to know who to notify
  const { data: ticketData } = await getSupabaseAdmin()
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  const { error } = await getSupabaseAdmin()
    .from("support_tickets")
    .update({ status: status })
    .eq("id", ticketId);

  if (error) {
    return { error: error.message };
  }

  // If resolved, notify the user
  if (status === "résolu" && ticketData) {
    // Find an admin to send the message from
    const { data: adminData } = await getSupabaseAdmin()
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminData) {
      const { data: userProf } = await getSupabaseAdmin()
        .from("profiles")
        .select("full_name")
        .eq("id", ticketData.user_id)
        .single();
      const recipientName = userProf?.full_name ? `Bonjour ${userProf.full_name},\n\n` : "Bonjour,\n\n";

      await getSupabaseAdmin().from("messages").insert({
        sender_id: adminData.id,
        receiver_id: ticketData.user_id,
        content: `${recipientName}Notre équipe Support Evenium vous informe que votre demande concernant « ${ticketData.subject} » a été traitée et résolue par nos conseillers.\n\nNous restons à votre entière disposition si vous avez la moindre question !`
      });
    }
  }

  revalidatePath("/admin/support");
  return { success: true };
}

export async function getUserSupportTickets(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur getUserSupportTickets:", error);
    return { data: [], error: error.message };
  }

  return { data: (data || []).map(decodeSupportTicket), error: null };
}
