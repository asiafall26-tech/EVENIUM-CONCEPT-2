import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

// Supabase client with service role key to securely write into storage bucket
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Configuration Supabase manquante dans les variables d'environnement.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** True when the signed-in user (session cookie) is an admin */
async function isAdminRequest() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await getSupabaseAdmin().from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin";
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/webm",
  "audio/3gpp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-msvideo",
  "video/3gpp",
];

const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "photos";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const lowerName = file.name.toLowerCase();

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType) || /\.(jpg|jpeg|png|webp|gif|avif|heic)$/i.test(lowerName);
    const isAudio =
      ALLOWED_AUDIO_TYPES.includes(mimeType) ||
      /\.(mp3|m4a|wav|aac|ogg|flac|webm|weba)$/i.test(lowerName);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType) || /\.(mp4|webm|mov|avi|m4v)$/i.test(lowerName);
    const isDoc = ALLOWED_DOC_TYPES.includes(mimeType) || /\.(pdf|doc|docx|xls|xlsx|txt|csv|zip)$/i.test(lowerName);

    if (!isImage && !isAudio && !isVideo && !isDoc) {
      return NextResponse.json(
        {
          error:
            "Format de fichier non supporté. Types acceptés : images (JPG, PNG, WebP), audios (MP3, WAV, WebM), vidéos (MP4, WebM, MOV) et documents (PDF, Word, Excel, ZIP).",
        },
        { status: 400 }
      );
    }

    // Tailles max : 15 Mo image, 25 Mo audio, 50 Mo vidéo, 25 Mo document
    let maxSize = 15 * 1024 * 1024;
    let typeLabel = "L'image";
    if (isVideo) {
      maxSize = 50 * 1024 * 1024;
      typeLabel = "La vidéo";
    } else if (isAudio) {
      maxSize = 25 * 1024 * 1024;
      typeLabel = "Le fichier audio";
    } else if (isDoc) {
      maxSize = 25 * 1024 * 1024;
      typeLabel = "Le document";
    }

    if (file.size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        {
          error: `${typeLabel} est trop volumineux (maximum ${maxMb} Mo).`,
        },
        { status: 400 }
      );
    }

    // "library" = Evenium's sound bank: only an admin may write there
    const toLibrary = isAudio && requestedFolder === "library";
    if (toLibrary && !(await isAdminRequest())) {
      return NextResponse.json({ error: "Seul un administrateur peut ajouter des sons à la banque." }, { status: 403 });
    }

    const cleanFolder = requestedFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();

    // Organisation des chemins de stockage
    let filePath: string;
    if (cleanFolder === "messages") {
      filePath = `messages/${Date.now()}_${cleanFileName}`;
    } else if (isAudio) {
      filePath = `invitations/${toLibrary ? "library" : "music"}/${Date.now()}_${cleanFileName}`;
    } else {
      filePath = `invitations/${cleanFolder || "photos"}/${Date.now()}_${cleanFileName}`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseAdmin();
    const resolvedContentType =
      mimeType ||
      (isImage ? "image/jpeg" : isVideo ? "video/mp4" : isAudio ? "audio/mpeg" : isDoc ? "application/pdf" : "application/octet-stream");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evenium_assets")
      .upload(filePath, buffer, {
        contentType: resolvedContentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Échec du téléversement : ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("evenium_assets")
      .getPublicUrl(uploadData.path);

    const detectedType = isVideo ? "video" : isAudio ? "audio" : isDoc ? "file" : "image";

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: uploadData.path,
      type: detectedType,
      name: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur interne lors de l'upload du média." },
      { status: 500 }
    );
  }
}
