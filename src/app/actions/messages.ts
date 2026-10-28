"use server";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/notifications/serverPush";
import { parseMediaMessage } from "@/lib/messaging/mediaPayload";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function getMessagesForUser(userId: string) {
  if (!userId) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Erreur getMessagesForUser:", error);
    return [];
  }
  return data || [];
}

export async function getProfiles() {
  const admin = getSupabaseAdmin();
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error("Erreur getProfiles:", error);
  }

  // Compléter avec les données réelles saisies dans les profils et paramètres
  try {
    const { data: authData } = await admin.auth.admin.listUsers();
    const users = authData?.users || [];
    const userMap: Record<string, any> = {};
    users.forEach((u) => { userMap[u.id] = u; });

    const merged = (profiles || []).map((p: any) => {
      const u = userMap[p.id];
      const meta = u?.user_metadata || {};
      return {
        ...p,
        email: p.email || u?.email || "",
        phone: p.phone || meta.phone || "",
        full_name: p.full_name || meta.full_name || (u?.email ? u.email.split('@')[0] : "Membre"),
        avatar_url: p.avatar_url || meta.avatar_url || null,
        category: p.category || meta.category || (p.role === "prestataire" ? "Prestataire de services" : null),
        company_name: p.company_name || meta.company_name || null,
        bio: p.description || p.bio || meta.description || meta.bio || null,
        address: p.address || meta.address || null,
        role: p.role || meta.role || "client",
      };
    });

    // Ajouter les utilisateurs auth qui n'ont pas encore de ligne profile
    users.forEach((u) => {
      if (!merged.some((m) => m.id === u.id)) {
        const meta = u.user_metadata || {};
        merged.push({
          id: u.id,
          email: u.email || "",
          phone: meta.phone || "",
          full_name: meta.full_name || (u.email ? u.email.split('@')[0] : "Membre"),
          avatar_url: meta.avatar_url || null,
          category: meta.category || (meta.role === "prestataire" ? "Prestataire de services" : null),
          company_name: meta.company_name || null,
          bio: meta.description || meta.bio || null,
          address: meta.address || null,
          role: meta.role || "client",
        });
      }
    });

    return merged;
  } catch (authErr) {
    console.warn("listUsers fallback in getProfiles:", authErr);
    return profiles || [];
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  if (!senderId || !receiverId || !content) return { error: "Paramètres manquants" };
  
  const { data, error } = await getSupabaseAdmin()
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content
    })
    .select()
    .single();
    
  if (error) {
    console.error("Erreur sendMessage:", error);
    return { error: error.message };
  }

  // Envoi de la notification Push en arrière-plan (même application fermée)
  (async () => {
    try {
      const { notifyNewMessage } = await import("@/lib/notifications/notifyTargetUser");
      await notifyNewMessage(receiverId, senderId, content);
    } catch (pushErr) {
      console.warn("Background push notification failed:", pushErr);
    }
  })();

  return { success: true, data };
}

export async function sendBroadcastMessage(senderId: string, targetGroup: 'all_organisateurs' | 'all_prestataires' | 'everyone', content: string) {
  if (!senderId || !targetGroup || !content) return { error: "Paramètres manquants" };
  
  let query = getSupabaseAdmin().from('profiles').select('id');
  
  if (targetGroup === 'all_organisateurs') {
    query = query.eq('role', 'client');
  } else if (targetGroup === 'all_prestataires') {
    query = query.eq('role', 'prestataire');
  } else if (targetGroup === 'everyone') {
    query = query.in('role', ['client', 'prestataire']);
  }
  
  const { data: users, error: fetchError } = await query;
  
  if (fetchError) {
    console.error("Erreur fetch cibles broadcast:", fetchError);
    return { error: fetchError.message };
  }
  
  if (!users || users.length === 0) {
    return { error: "Aucun destinataire trouvé pour ce groupe." };
  }

  const inserts = users.map(user => ({
    sender_id: senderId,
    receiver_id: user.id,
    content: content,
  }));
  
  const { error: insertError } = await getSupabaseAdmin()
    .from('messages')
    .insert(inserts);
    
  if (insertError) {
    console.error("Erreur bulk insert broadcast:", insertError);
    return { error: insertError.message };
  }

  // Envoi des alertes push à tous les destinataires cibles
  (async () => {
    try {
      const previewText = content.length > 80 ? content.substring(0, 80) + "…" : content;
      await Promise.allSettled(
        users.map((u) =>
          sendPushToUser(u.id, {
            title: "Evenium • Annonce importante",
            body: previewText,
            url: "/dashboard/messages",
            tag: "broadcast-alert",
          })
        )
      );
    } catch (e) {
      console.warn("Broadcast push failed:", e);
    }
  })();

  return { success: true, count: inserts.length };
}
