import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { sendPushToUser } from "@/lib/notifications/serverPush";
import { parseMediaMessage } from "@/lib/messaging/mediaPayload";

/**
 * Webhook universel Supabase pour déclencher des alertes Push natives
 * sur l'appareil de la personne concernée (même si son application est totalement fermée).
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    if (!table || !record) {
      return NextResponse.json({ message: "Payload incomplet ignoré" }, { status: 200 });
    }

    const admin = getSupabaseAdmin();

    // 1. TABLE: MESSAGES -> Notifier le destinataire exact
    if (table === "messages" && type === "INSERT") {
      const receiverId = record.receiver_id;
      const senderId = record.sender_id;

      if (receiverId) {
        const { data: sender } = await admin
          .from("profiles")
          .select("full_name, role")
          .eq("id", senderId)
          .maybeSingle();

        const senderName =
          sender?.role === "admin" ? "Support Evenium" : (sender?.full_name || "Evenium");

        let bodyText = record.content || "";
        const parsed = parseMediaMessage(record.content);
        if (parsed.isMedia && parsed.media) {
          if (parsed.media.mediaType === "audio") bodyText = "🎤 Note vocale reçue";
          else if (parsed.media.mediaType === "image")
            bodyText = "📷 Photo partagée" + (parsed.media.text ? ` : ${parsed.media.text}` : "");
          else if (parsed.media.mediaType === "video")
            bodyText = "🎥 Vidéo partagée" + (parsed.media.text ? ` : ${parsed.media.text}` : "");
          else if (parsed.media.mediaType === "file")
            bodyText = `📎 Document : ${parsed.media.name || "Fichier"}`;
        } else if (bodyText.length > 80) {
          bodyText = bodyText.substring(0, 80) + "…";
        }

        await sendPushToUser(receiverId, {
          title: `Nouveau message de ${senderName}`,
          body: bodyText,
          url: "/dashboard/messages",
          tag: `msg-${senderId}`,
        });
      }
    }

    // 2. TABLE: DEMANDES_DEVIS -> Notifier le prestataire sollicité
    else if (table === "demandes_devis" && type === "INSERT") {
      const prestataireId = record.prestataire_id;
      if (prestataireId) {
        let eventName = "un événement";
        if (record.event_id) {
          const { data: ev } = await admin.from("events").select("name").eq("id", record.event_id).maybeSingle();
          if (ev?.name) eventName = `« ${ev.name} »`;
        }

        await sendPushToUser(prestataireId, {
          title: "Nouvelle demande de devis reçue 🔔",
          body: `Un organisateur souhaite un devis pour ${eventName}. Ouvrez votre tableau de bord pour y répondre.`,
          url: "/prestataire/demandes",
          tag: `demande-${record.id}`,
        });
      }
    }

    // 3. TABLE: DEVIS -> Notifier le client ou le prestataire selon le cas
    else if (table === "devis") {
      // Si le client a validé/accepté le devis -> Notifier le prestataire
      if (
        (record.status === "Accepté" || record.status === "Validé" || record.status === "Payé") &&
        old_record?.status !== record.status
      ) {
        if (record.prestataire_id) {
          await sendPushToUser(record.prestataire_id, {
            title: "Devis validé par le client ! 🎉",
            body: `Excellente nouvelle ! Votre devis de ${record.montant_total || ""} FCFA a été validé.`,
            url: "/prestataire",
            tag: `devis-valide-${record.id}`,
          });
        }
      }
      // Si le prestataire soumet un nouveau devis -> Notifier le client organisateur
      else if (type === "INSERT" && record.client_id) {
        await sendPushToUser(record.client_id, {
          title: "Nouveau devis reçu 📄",
          body: `Un prestataire a déposé un devis pour votre événement (${record.montant_total || ""} FCFA).`,
          url: `/dashboard/devis`,
          tag: `devis-recu-${record.id}`,
        });
      }
    }

    // 4. TABLE: GUESTS (RSVP) -> Notifier le client organisateur
    else if (table === "guests" && type === "INSERT") {
      if (record.event_id) {
        const { data: ev } = await admin.from("events").select("client_id, name").eq("id", record.event_id).maybeSingle();
        if (ev?.client_id) {
          const guestName = `${record.prenom || ""} ${record.nom || ""}`.trim() || "Un invité";
          const status = record.statut_rsvp === "confirme" ? "a confirmé sa présence" : "a répondu à l'invitation";

          await sendPushToUser(ev.client_id, {
            title: "Réponse RSVP reçue 💌",
            body: `${guestName} ${status} pour votre événement « ${ev.name} ».`,
            url: `/dashboard/events/${record.event_id}/participants`,
            tag: `rsvp-${record.id}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Erreur Webhook Supabase Push:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
