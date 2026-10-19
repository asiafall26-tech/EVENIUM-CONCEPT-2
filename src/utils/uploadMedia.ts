export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  type?: "image" | "audio";
  error?: string;
}

/**
 * Uploads an image or audio file to Supabase Storage via our secure /api/upload endpoint.
 * Returns the permanent public CDN URL.
 */
export async function uploadMedia(
  file: File,
  folder: "photos" | "music" | "avatars" | "library" = "photos"
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error || `Erreur lors de l'envoi (${res.status})`,
      };
    }

    return {
      success: true,
      url: data.url,
      path: data.path,
      type: data.type,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Impossible de contacter le serveur d'envoi.",
    };
  }
}
