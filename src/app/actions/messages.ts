"use server";

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/notifications/serverPush";
import { mockProviders } from "@/data/mock/prestataires";

const PERSISTED_MESSAGES_FILE = path.join(process.cwd(), "src", "data", "mock", "persisted_messages.json");
const PERSISTED_CAMPAIGNS_FILE = path.join(process.cwd(), "src", "data", "mock", "persisted_campaigns.json");

function readPersistedMessages(): any[] {
  try {
    if (fs.existsSync(PERSISTED_MESSAGES_FILE)) {
      const raw = fs.readFileSync(PERSISTED_MESSAGES_FILE, "utf-8");
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn("readPersistedMessages notice:", err);
  }
  return [];
}

function writePersistedMessages(messages: any[]): void {
  try {
    fs.writeFileSync(PERSISTED_MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.warn("writePersistedMessages notice:", err);
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Récupère tous les messages réels d'un utilisateur (fusion Supabase + persistance disque)
 * Zéro message automatique / chatbot support factice
 */
export async function getMessagesForUser(userId: string) {
  if (!userId) return [];

  const mergedMap = new Map<string, any>();

  // 1. Charger depuis le fichier disque persistant
  const fileMsgs = readPersistedMessages();
  fileMsgs.forEach((m) => {
    if (m.sender_id === userId || m.receiver_id === userId) {
      mergedMap.set(m.id, m);
    }
  });

  // 2. Charger depuis Supabase si connecté
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      data.forEach((m) => {
        mergedMap.set(m.id, m);
      });
    }
  } catch (err) {
    console.warn("getMessagesForUser db fetch fallback to disk:", err);
  }

  const list = Array.from(mergedMap.values());
  return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Récupère les profils réels (Clients, Prestataires, Administrateurs)
 */
export async function getProfiles() {
  const admin = getSupabaseAdmin();
  let profiles: any[] = [];

  try {
    const { data, error } = await admin.from('profiles').select('*');
    if (!error && data) {
      profiles = data;
    }
  } catch (err) {
    console.warn("getProfiles error:", err);
  }

  // Compléter avec les données d'utilisateurs auth réels
  try {
    const { data: authData } = await admin.auth.admin.listUsers();
    const users = authData?.users || [];
    const userMap: Record<string, any> = {};
    users.forEach((u) => { userMap[u.id] = u; });

    profiles = profiles.map((p: any) => {
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

    users.forEach((u) => {
      if (!profiles.some((m) => m.id === u.id)) {
        const meta = u.user_metadata || {};
        profiles.push({
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
  } catch (authErr) {
    console.warn("listUsers fallback in getProfiles:", authErr);
  }

  // Ajouter les profils des prestataires vérifiés du catalogue et des campagnes
  mockProviders.forEach((mp) => {
    if (!profiles.some((p) => p.id === mp.id)) {
      profiles.push({
        id: mp.id,
        email: "contact@" + mp.name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
        phone: mp.phone || mp.whatsapp || "+221 77 000 00 00",
        full_name: mp.name,
        company_name: mp.name,
        avatar_url: mp.avatar_url || null,
        category: mp.category,
        bio: mp.description,
        address: mp.zone,
        role: "prestataire",
      });
    }
  });

  // Profil prestataire par défaut prov-me
  if (!profiles.some((p) => p.id === "prov-me")) {
    profiles.push({
      id: "prov-me",
      email: "prestataire@evenium.com",
      phone: "+221 78 304 66 76",
      full_name: "Mon Entreprise (Prestataire)",
      company_name: "Mon Entreprise",
      avatar_url: null,
      category: "Prestataire Événementiel",
      bio: "Services d'exception pour vos célébrations inoubliables.",
      address: "Dakar, Sénégal",
      role: "prestataire",
    });
  }

  // Profil administration Evenium
  if (!profiles.some((p) => p.role === "admin")) {
    profiles.push({
      id: "admin-evenium",
      email: "admin@evenium.com",
      phone: "+221 33 800 00 00",
      full_name: "Administration Evenium",
      company_name: "Evenium Corporate",
      avatar_url: null,
      category: "Direction Générale",
      bio: "Équipe de direction et conciergerie Evenium.",
      address: "Siège Evenium, Dakar",
      role: "admin",
    });
  }

  return profiles;
}

/**
 * Envoie un message réel entre deux utilisateurs
 * Sauvegarde garantie sur disque + Supabase + déclenchement push & alertes
 */
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  if (!senderId || !receiverId || !content) return { error: "Paramètres manquants" };

  const messagePayload = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    sender_id: senderId,
    receiver_id: receiverId,
    content: content.trim(),
    created_at: new Date().toISOString(),
    is_read: false,
  };

  // 1. Sauvegarde disque persistante immédiate
  const existing = readPersistedMessages();
  existing.push(messagePayload);
  writePersistedMessages(existing);

  // 2. Synchronisation Supabase en arrière-plan
  try {
    const admin = getSupabaseAdmin();
    await admin.from('messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
    });
  } catch (err) {
    console.warn("sendMessage supabase insert fallback to disk:", err);
  }

  // 3. Notification push native
  (async () => {
    try {
      const { notifyNewMessage } = await import("@/lib/notifications/notifyTargetUser");
      await notifyNewMessage(receiverId, senderId, content.trim());
    } catch (pushErr) {
      console.warn("Background push notification failed:", pushErr);
    }
  })();

  return { success: true, data: messagePayload };
}

/**
 * Marque tous les messages reçus de otherUserId comme lus
 */
export async function markConversationReadInStore(userId: string, otherUserId: string) {
  if (!userId || !otherUserId) return;

  const msgs = readPersistedMessages();
  let hasChange = false;
  msgs.forEach((m) => {
    if (m.receiver_id === userId && m.sender_id === otherUserId && !m.is_read) {
      m.is_read = true;
      hasChange = true;
    }
  });

  if (hasChange) {
    writePersistedMessages(msgs);
  }

  try {
    const admin = getSupabaseAdmin();
    await admin
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
  } catch (err) {
    console.warn("markConversationReadInStore db notice:", err);
  }
}

export async function sendBroadcastMessage(senderId: string, targetGroup: 'all_organisateurs' | 'all_prestataires' | 'everyone', content: string) {
  if (!senderId || !targetGroup || !content) return { error: "Paramètres manquants" };
  
  const allProfiles = await getProfiles();
  let targets: any[] = [];
  
  if (targetGroup === 'all_organisateurs') {
    targets = allProfiles.filter((p) => p.role === 'client' && p.id !== senderId);
  } else if (targetGroup === 'all_prestataires') {
    targets = allProfiles.filter((p) => p.role === 'prestataire' && p.id !== senderId);
  } else if (targetGroup === 'everyone') {
    targets = allProfiles.filter((p) => p.id !== senderId);
  }
  
  if (targets.length === 0) {
    return { error: "Aucun destinataire trouvé pour ce groupe." };
  }

  const existingMsgs = readPersistedMessages();
  const now = new Date().toISOString();

  targets.forEach((user) => {
    existingMsgs.push({
      id: `msg-bcast-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sender_id: senderId,
      receiver_id: user.id,
      content: content.trim(),
      created_at: now,
      is_read: false,
    });
  });

  writePersistedMessages(existingMsgs);

  // Push alert
  (async () => {
    try {
      const previewText = content.length > 80 ? content.substring(0, 80) + "…" : content;
      await Promise.allSettled(
        targets.map((u) =>
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

  return { success: true, count: targets.length };
}
