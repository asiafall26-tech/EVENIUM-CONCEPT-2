export interface SupportAttachment {
  name: string;
  url: string;
  size?: number;
  type?: "image" | "video" | "audio" | "file";
}

export function encodeSupportMessage(
  message: string,
  attachments?: SupportAttachment[],
  audioUrl?: string,
  audioDuration?: number
): string {
  if ((!attachments || attachments.length === 0) && !audioUrl) {
    return message;
  }
  const payload = {
    attachments: attachments || [],
    audioUrl: audioUrl || null,
    audioDuration: audioDuration || 0
  };
  return `${message.trim()}\n\n[EVENIUM_SUPPORT_PAYLOAD]${JSON.stringify(payload)}[/EVENIUM_SUPPORT_PAYLOAD]`;
}

export function decodeSupportTicket(ticket: any) {
  if (!ticket) return ticket;
  let text = ticket.message || "";
  let attachments: SupportAttachment[] = Array.isArray(ticket.attachments) ? ticket.attachments : [];
  let audioUrl: string | null = ticket.audio_url || null;
  let audioDuration: number = Number(ticket.audio_duration) || 0;

  if (text.includes("[EVENIUM_SUPPORT_PAYLOAD]")) {
    try {
      const match = text.match(/\[EVENIUM_SUPPORT_PAYLOAD\]([\s\S]*?)\[\/EVENIUM_SUPPORT_PAYLOAD\]/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.attachments && (!attachments || attachments.length === 0)) {
          attachments = parsed.attachments;
        }
        if (parsed.audioUrl && !audioUrl) {
          audioUrl = parsed.audioUrl;
        }
        if (parsed.audioDuration && !audioDuration) {
          audioDuration = parsed.audioDuration;
        }
        text = text.replace(/\[EVENIUM_SUPPORT_PAYLOAD\][\s\S]*?\[\/EVENIUM_SUPPORT_PAYLOAD\]/, "").trim();
      }
    } catch (_) {}
  }

  return {
    ...ticket,
    cleanMessage: text,
    attachments,
    audioUrl,
    audioDuration
  };
}
