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
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isAudio =
      ALLOWED_AUDIO_TYPES.includes(mimeType) ||
      file.name.toLowerCase().endsWith(".mp3") ||
      file.name.toLowerCase().endsWith(".m4a") ||
      file.name.toLowerCase().endsWith(".wav");

    if (!isImage && !isAudio) {
      return NextResponse.json(
        {
          error:
            "Format de fichier non supporté. Veuillez choisir une image (JPG, PNG, WebP) ou un fichier audio (MP3, M4A, WAV).",
        },
        { status: 400 }
      );
    }

    // Taille max : 12 Mo pour les images, 25 Mo pour la musique
    const maxSize = isAudio ? 25 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isAudio
            ? "Le fichier audio est trop volumineux (maximum 25 Mo)."
            : "L'image est trop volumineuse (maximum 12 Mo).",
        },
        { status: 400 }
      );
    }

    // "library" = Evenium's sound bank: only an admin may write there
    const toLibrary = isAudio && requestedFolder === "library";
    if (toLibrary && !(await isAdminRequest())) {
      return NextResponse.json({ error: "Seul un administrateur peut ajouter des sons à la banque." }, { status: 403 });
    }
    const folder = isAudio ? (toLibrary ? "library" : "music") : requestedFolder;
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    const filePath = `invitations/${folder}/${Date.now()}_${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseAdmin();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evenium_assets")
      .upload(filePath, buffer, {
        contentType: mimeType || (isAudio ? "audio/mpeg" : "image/jpeg"),
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

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: uploadData.path,
      type: isAudio ? "audio" : "image",
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
