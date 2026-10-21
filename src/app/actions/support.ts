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

export async function createSupportTicket(userId: string, subject: string, message: string) {
  if (!userId || !subject || !message) {
    return { error: "Tous les champs sont requis." };
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        message,
        status: "en attente"
      });

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

  const enrichedTickets = tickets.map(t => ({
    ...t,
    profiles: profileMap[t.user_id] || null
  }));

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

  return { data: data || [], error: null };
}
