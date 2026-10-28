"use client";

/**
 * Gestionnaire client des notifications Web Push (Application fermée).
 * Déclare le Service Worker, demande l'autorisation du système (iOS/Android/Desktop),
 * et synchronise l'abonnement auprès de l'API Evenium.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.error("Échec de l'enregistrement du Service Worker:", err);
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeToPush(customUserId?: string): Promise<{ success: boolean; error?: string; subscription?: PushSubscription }> {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Votre appareil ou navigateur ne supporte pas les notifications push web.",
    };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return {
      success: false,
      error: "Clé VAPID publique manquante dans la configuration.",
    };
  }

  try {
    // 1. Demande de permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "L'autorisation des notifications a été refusée sur cet appareil.",
      };
    }

    // 2. Service Worker ready
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, error: "Impossible d'initialiser le service d'arrière-plan." };
    }

    const readyReg = await navigator.serviceWorker.ready;

    // 3. Souscription auprès d'APNs/FCM via PushManager
    const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
    const subscription = await readyReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey as unknown as BufferSource,
    });

    // 4. Envoi au serveur Evenium
    const subJson = subscription.toJSON();
    const res = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...subJson,
        userId: customUserId,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || "Erreur lors de l'enregistrement de l'abonnement sur le serveur.",
      };
    }

    return { success: true, subscription };
  } catch (err: any) {
    console.error("Erreur d'abonnement push:", err);
    return { success: false, error: err.message || "Erreur inconnue lors de l'activation." };
  }
}

/**
 * Synchronise silencieusement l'abonnement Push actif avec le compte utilisateur,
 * si la permission a déjà été accordée.
 */
export async function autoSyncPushSubscription(customUserId?: string): Promise<void> {
  if (!isPushSupported()) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  try {
    const reg = await registerServiceWorker();
    if (!reg) return;
    const readyReg = await navigator.serviceWorker.ready;
    const subscription = await readyReg.pushManager.getSubscription();
    if (!subscription) return;

    const subJson = subscription.toJSON();
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...subJson,
        userId: customUserId,
      }),
    });
  } catch (err) {
    console.warn("Échec synchronisation automatique push:", err);
  }
}

export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) return { success: false };
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
