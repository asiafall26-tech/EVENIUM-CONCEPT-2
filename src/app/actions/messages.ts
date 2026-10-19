"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function getMessagesForUser(userId: string) {
  if (!userId) return [];
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error("Erreur getProfiles:", error);
    return [];
  }
  return data || [];
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  if (!senderId || !receiverId || !content) return { error: "Paramètres manquants" };
  
  const { data, error } = await supabaseAdmin
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
  return { success: true, data };
}

export async function sendBroadcastMessage(senderId: string, targetGroup: 'all_organisateurs' | 'all_prestataires' | 'everyone', content: string) {
  if (!senderId || !targetGroup || !content) return { error: "Paramètres manquants" };
  
  let query = supabaseAdmin.from('profiles').select('id');
  
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
  
  const { error: insertError } = await supabaseAdmin
    .from('messages')
    .insert(inserts);
    
  if (insertError) {
    console.error("Erreur bulk insert broadcast:", insertError);
    return { error: insertError.message };
  }
  
  return { success: true, count: inserts.length };
}
