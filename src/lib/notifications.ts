/**
 * Utilitaire de gestion des notifications interactives Evenium (Clients & Prestataires)
 */

export interface EveniumNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  link?: string;
  bg?: string;
  type?: "like" | "follow" | "matching_provider" | "boost_offer" | "quote" | "rsvp" | "message";
  createdAt: string;
}

export function addNotificationForClient(notif: {
  title: string;
  desc: string;
  link?: string;
  type?: EveniumNotificationItem["type"];
}) {
  if (typeof window === "undefined") return;
  try {
    const key = "evenium_client_notifications";
    const existing: EveniumNotificationItem[] = JSON.parse(localStorage.getItem(key) || "[]");
    
    // Éviter les doublons stricts récents
    const isDuplicate = existing.some(
      (e) => e.title === notif.title && Math.abs(new Date(e.createdAt).getTime() - Date.now()) < 60000
    );
    if (isDuplicate) return;

    const newItem: EveniumNotificationItem = {
      id: `notif-client-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: notif.title,
      desc: notif.desc,
      time: "À l'instant",
      link: notif.link || "/dashboard",
      type: notif.type || "matching_provider",
      bg: notif.type === "like" 
        ? "bg-rose-100 text-rose-700" 
        : notif.type === "follow" 
        ? "bg-purple-100 text-purple-700" 
        : notif.type === "message"
        ? "bg-amber-100 text-[#7a5e2b]"
        : notif.type === "quote"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-[#7a5e2b]",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify([newItem, ...existing].slice(0, 30)));
    window.dispatchEvent(new Event("evenium_notifications_updated"));
  } catch (err) {
    console.warn("Erreur addNotificationForClient:", err);
  }
}

export function addNotificationForProvider(
  providerId: string,
  notif: {
    title: string;
    desc: string;
    link?: string;
    type?: EveniumNotificationItem["type"];
  }
) {
  if (typeof window === "undefined" || !providerId) return;
  try {
    const key = `evenium_provider_notifs_${providerId}`;
    const existing: EveniumNotificationItem[] = JSON.parse(localStorage.getItem(key) || "[]");

    const isDuplicate = existing.some(
      (e) => e.title === notif.title && Math.abs(new Date(e.createdAt).getTime() - Date.now()) < 60000
    );
    if (isDuplicate) return;

    const newItem: EveniumNotificationItem = {
      id: `notif-prov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: notif.title,
      desc: notif.desc,
      time: "À l'instant",
      link: notif.link || "/prestataire/publicite",
      type: notif.type || "like",
      bg: notif.type === "like" 
        ? "bg-rose-100 text-rose-700" 
        : notif.type === "follow" 
        ? "bg-purple-100 text-purple-700" 
        : notif.type === "message"
        ? "bg-amber-100 text-[#7a5e2b]"
        : notif.type === "quote"
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-800",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify([newItem, ...existing].slice(0, 30)));
    window.dispatchEvent(new Event("evenium_notifications_updated"));
  } catch (err) {
    console.warn("Erreur addNotificationForProvider:", err);
  }
}

export function notifyMessageReceipt(params: {
  receiverId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  preview: string;
}) {
  if (typeof window === "undefined") return;
  const isReceiverProvider = params.receiverId.startsWith("prov") || params.receiverId.includes("prestataire");
  const link = isReceiverProvider
    ? `/prestataire/messages?contactId=${encodeURIComponent(params.senderId)}&contactName=${encodeURIComponent(params.senderName)}`
    : `/dashboard/messages?prestataire=${encodeURIComponent(params.senderId)}&name=${encodeURIComponent(params.senderName)}`;

  if (isReceiverProvider) {
    addNotificationForProvider(params.receiverId, {
      title: `Nouveau message de ${params.senderName}`,
      desc: params.preview,
      link,
      type: "message",
    });
    // Fallback prov-me
    if (params.receiverId !== "prov-me") {
      addNotificationForProvider("prov-me", {
        title: `Nouveau message de ${params.senderName}`,
        desc: params.preview,
        link,
        type: "message",
      });
    }
  } else {
    addNotificationForClient({
      title: `Nouveau message de ${params.senderName}`,
      desc: params.preview,
      link,
      type: "message",
    });
  }
}

export function getClientNotifications(): EveniumNotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("evenium_client_notifications") || "[]");
  } catch {
    return [];
  }
}

export function getProviderNotifications(providerId: string): EveniumNotificationItem[] {
  if (typeof window === "undefined" || !providerId) return [];
  try {
    const list = JSON.parse(localStorage.getItem(`evenium_provider_notifs_${providerId}`) || "[]");
    if (list.length === 0 && providerId !== "prov-me") {
      return JSON.parse(localStorage.getItem("evenium_provider_notifs_prov-me") || "[]");
    }
    return list;
  } catch {
    return [];
  }
}
