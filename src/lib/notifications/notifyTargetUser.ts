import { sendPushToUser } from "@/lib/notifications/serverPush";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { parseMediaMessage } from "@/lib/messaging/mediaPayload";

/**
 * Service centralisé pour envoyer des notifications push natives directement
 * à la personne concernée (client, prestataire, admin) même si son application est fermée.
 */

export async function notifyNewMessage(receiverId: string, senderId: string, content: string) {
  if (!receiverId) return;
  try {
    const admin = getSupabaseAdmin();
    const { data: sender } = await admin.from("profiles").select("full_name, role").eq("id", senderId).maybeSingle();
    const { data: receiver } = await admin.from("profiles").select("role").eq("id", receiverId).maybeSingle();

    const senderName = sender?.role === "admin" ? "Support Evenium" : (sender?.full_name || "Evenium");
    const targetUrl = receiver?.role === "prestataire"
      ? "/prestataire/messages"
      : receiver?.role === "admin"
      ? "/admin/messages"
      : "/dashboard/messages";

    let preview = content;
    const parsed = parseMediaMessage(content);
    if (parsed.isMedia && parsed.media) {
      if (parsed.media.mediaType === "audio") preview = "🎤 Note vocale reçue";
      else if (parsed.media.mediaType === "image") preview = "📷 Photo partagée" + (parsed.media.text ? ` : ${parsed.media.text}` : "");
      else if (parsed.media.mediaType === "video") preview = "🎥 Vidéo partagée" + (parsed.media.text ? ` : ${parsed.media.text}` : "");
      else if (parsed.media.mediaType === "file") preview = `📎 Document : ${parsed.media.name || "Fichier"}`;
    } else if (preview.length > 80) {
      preview = preview.substring(0, 80) + "…";
    }

    await sendPushToUser(receiverId, {
      title: `Message de ${senderName}`,
      body: preview,
      url: targetUrl,
      tag: `msg-${senderId}`,
    });
  } catch (err) {
    console.warn("Échec notification push message:", err);
  }
}

export async function notifyRevisionRequested(prestataireId: string, clientName?: string, eventName?: string, devisReference?: string) {
  if (!prestataireId) return;
  try {
    const clientText = clientName ? `L'organisateur ${clientName}` : "L'organisateur";
    const refText = devisReference ? ` pour le devis ${devisReference}` : "";
    const evText = eventName ? ` (« ${eventName} »)` : "";

    await sendPushToUser(prestataireId, {
      title: "Demande de révision de devis ✍️",
      body: `${clientText} souhaite ajuster votre proposition${refText}${evText}.`,
      url: "/prestataire/demandes",
      tag: `revision-${Date.now()}`,
    });
  } catch (err) {
    console.warn("Échec notification push demande révision:", err);
  }
}

export async function notifyNewQuoteRequest(prestataireId: string, clientName?: string, eventName?: string) {
  if (!prestataireId) return;
  try {
    const senderText = clientName ? `${clientName} vous sollicite` : "Un client vous sollicite";
    const evText = eventName ? ` pour l'événement « ${eventName} »` : "";

    await sendPushToUser(prestataireId, {
      title: "Nouvelle demande de devis reçue 🔔",
      body: `${senderText}${evText}. Consultez les détails dans votre tableau de bord.`,
      url: "/prestataire/demandes",
      tag: `demande-${Date.now()}`,
    });
  } catch (err) {
    console.warn("Échec notification push demande devis:", err);
  }
}

export async function notifyQuoteSubmitted(clientId: string, providerName?: string, amount?: string | number) {
  if (!clientId) return;
  try {
    const providerText = providerName ? `Le prestataire ${providerName}` : "Un prestataire";
    const amountText = amount ? ` (Montant : ${amount} FCFA)` : "";

    await sendPushToUser(clientId, {
      title: "Nouveau devis reçu 📄",
      body: `${providerText} a déposé un devis pour votre événement${amountText}.`,
      url: "/dashboard/devis",
      tag: `devis-${Date.now()}`,
    });
  } catch (err) {
    console.warn("Échec notification push devis reçu:", err);
  }
}

export async function notifyQuoteAccepted(prestataireId: string, clientName?: string, eventName?: string) {
  if (!prestataireId) return;
  try {
    const clientText = clientName ? `L'organisateur ${clientName}` : "L'organisateur";
    const evText = eventName ? ` pour « ${eventName} »` : "";

    await sendPushToUser(prestataireId, {
      title: "Devis validé par le client ! 🎉",
      body: `${clientText} a validé votre proposition${evText}.`,
      url: "/prestataire",
      tag: `devis-valide-${Date.now()}`,
    });
  } catch (err) {
    console.warn("Échec notification push devis validé:", err);
  }
}

export async function notifyRsvpReceived(clientId: string, guestName: string, eventName: string, eventId: string) {
  if (!clientId) return;
  try {
    await sendPushToUser(clientId, {
      title: "Confirmation d'invité (RSVP) 💌",
      body: `${guestName} a confirmé sa présence pour l'événement « ${eventName} ».`,
      url: `/dashboard/events/${eventId}/participants`,
      tag: `rsvp-${Date.now()}`,
    });
  } catch (err) {
    console.warn("Échec notification push RSVP:", err);
  }
}
