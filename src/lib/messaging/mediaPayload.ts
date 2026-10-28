/**
 * Helper de sérialisation et désérialisation pour les messages multimédias Evenium
 * (Images, Vidéos, Notes vocales audio, Documents / Fichiers).
 * 
 * Stocké dans la colonne 'content' de la table 'messages' sous forme de JSON structuré
 * avec signature __evenium_media pour une rétrocompatibilité totale avec les anciens messages texte.
 */

export type MediaType = "image" | "audio" | "video" | "file";

export interface MediaPayload {
  __evenium_media: true;
  mediaType: MediaType;
  url: string;
  name: string;
  size?: number; // taille en octets
  duration?: number; // durée en secondes pour les messages vocaux
  text?: string; // texte d'accompagnement ou légende
}

export interface ParsedMessage {
  isMedia: boolean;
  media?: MediaPayload;
  text: string;
}

/**
 * Crée le contenu sérialisé d'un message multimédia.
 */
export function createMediaMessage(
  mediaType: MediaType,
  url: string,
  name: string,
  options?: {
    size?: number;
    duration?: number;
    text?: string;
  }
): string {
  const payload: MediaPayload = {
    __evenium_media: true,
    mediaType,
    url,
    name,
    size: options?.size,
    duration: options?.duration,
    text: options?.text?.trim() || undefined,
  };
  return JSON.stringify(payload);
}

/**
 * Analyse le contenu d'un message pour détecter s'il s'agit d'un média ou d'un texte simple.
 */
export function parseMediaMessage(rawContent: string | null | undefined): ParsedMessage {
  if (!rawContent || typeof rawContent !== "string") {
    return { isMedia: false, text: "" };
  }

  const trimmed = rawContent.trim();
  if (trimmed.startsWith('{"__evenium_media":true')) {
    try {
      const parsed = JSON.parse(trimmed) as MediaPayload;
      if (parsed && parsed.__evenium_media && parsed.url) {
        return {
          isMedia: true,
          media: parsed,
          text: parsed.text || "",
        };
      }
    } catch {
      // Échec de parsing JSON, considérer comme texte simple
    }
  }

  return {
    isMedia: false,
    text: rawContent,
  };
}

/**
 * Formate la taille d'un fichier en chaîne lisible (ex: "1.4 Mo", "340 Ko").
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Formate la durée en secondes en mm:ss (ex: "0:24", "1:15").
 */
export function formatAudioDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

/**
 * Génère le résumé court à afficher dans la liste des conversations (sidebar).
 */
export function getMediaSummaryText(media: MediaPayload): string {
  const caption = media.text ? ` "${media.text}"` : "";
  switch (media.mediaType) {
    case "image":
      return `📷 Photo${caption}`;
    case "audio":
      return `🎙️ Note vocale (${formatAudioDuration(media.duration)})`;
    case "video":
      return `🎥 Vidéo${caption}`;
    case "file":
      return `📄 ${media.name || "Fichier"}${caption}`;
    default:
      return `📎 Pièce jointe${caption}`;
  }
}
