import webpush from "web-push";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

let vapidConfigured = false;

function ensureVapidConfig() {
  if (vapidConfigured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@evenium.com";

  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
}

/**
 * Envoie une notification Push Web native au(x) terminal(aux) d'un utilisateur,
 * même si son navigateur est fermé ou son smartphone verrouillé.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  try {
    ensureVapidConfig();
    const admin = getSupabaseAdmin();

    // 1. Récupérer tous les appareils abonnés de cet utilisateur (Mobile, Bureau, etc.)
    const { data: subscriptions, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      if (error.message?.includes("push_subscriptions") || error.code === "42P01" || error.code === "PGRST205") {
        return {
          success: false,
          sentCount: 0,
          error: "La table 'push_subscriptions' n'a pas encore été créée dans Supabase. Veuillez exécuter le script SQL dans Supabase SQL Editor.",
        };
      }
      return { success: false, sentCount: 0, error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, sentCount: 0 };
    }

    const jsonPayload = JSON.stringify({
      title: payload.title || "Evenium",
      body: payload.body || "",
      url: payload.url || "/dashboard",
      tag: payload.tag || "evenium-alert",
      icon: payload.icon || "/icon.png",
      badge: payload.badge || "/apple-icon.png",
    });

    let sentCount = 0;
    const expiredIds: string[] = [];

    // 2. Envoi en parallèle à tous les appareils de l'utilisateur
    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, jsonPayload);
          sentCount++;
        } catch (err: any) {
          // Si le token a expiré (code 410 Gone ou 404), on nettoie la base
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredIds.push(sub.id);
          } else {
            console.error("Erreur envoi push à l'endpoint:", sub.endpoint, err);
          }
        }
      })
    );

    // 3. Nettoyage automatique des abonnements expirés
    if (expiredIds.length > 0) {
      await admin.from("push_subscriptions").delete().in("id", expiredIds);
    }

    return { success: true, sentCount };
  } catch (err: any) {
    console.error("Erreur générale sendPushToUser:", err);
    return { success: false, sentCount: 0, error: err.message };
  }
}
