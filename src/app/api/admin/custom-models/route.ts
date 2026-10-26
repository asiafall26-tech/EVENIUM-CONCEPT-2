import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { CUSTOM_MODELS_TABLE, CUSTOM_STORAGE_DIR, storageKey } from "@/lib/customModels";

export const dynamic = "force-dynamic";

const BUCKET = "evenium_assets";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration Supabase manquante.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function isAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await admin().from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin";
}

const SLUG = /^[a-z0-9-]{3,60}$/;
/** Chemin relatif sûr à l'intérieur du dossier du modèle */
const safePath = (p: string) =>
  typeof p === "string" && p.length > 0 && p.length < 300 && !p.startsWith("/") && !p.split("/").includes("..") && !/[\\\u0000-\u001f]/.test(p);

/**
 * POST { slug, paths } : adresses d'envoi signées pour déposer les fichiers d'un modèle importé
 * (envoi direct au stockage, sans limite de taille de requête).
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Réservé à l'administrateur." }, { status: 403 });
    const { slug, paths } = (await req.json()) as { slug?: string; paths?: string[] };
    if (!slug || !SLUG.test(slug) || !Array.isArray(paths) || !paths.length || paths.length > 400 || !paths.every(safePath)) {
      return NextResponse.json({ error: "Fichiers du modèle invalides." }, { status: 400 });
    }
    const storage = admin().storage.from(BUCKET);
    const signed = await Promise.all(
      paths.map(async (p) => {
        const full = `${CUSTOM_STORAGE_DIR}/${slug}/${storageKey(p)}`;
        const { data, error } = await storage.createSignedUploadUrl(full, { upsert: true });
        if (error || !data) throw new Error(error?.message ?? "Signature impossible");
        return { path: p, fullPath: full, token: data.token };
      })
    );
    return NextResponse.json({ files: signed });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur serveur." }, { status: 500 });
  }
}

/** Liste récursive des fichiers d'un dossier du stockage */
async function listAll(dir: string): Promise<string[]> {
  const storage = admin().storage.from(BUCKET);
  const out: string[] = [];
  const { data } = await storage.list(dir, { limit: 1000 });
  for (const item of data ?? []) {
    const path = `${dir}/${item.name}`;
    if (item.id) out.push(path);
    else out.push(...(await listAll(path)));
  }
  return out;
}

/** DELETE ?slug= : supprime le modèle importé et ses fichiers */
export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Réservé à l'administrateur." }, { status: 403 });
    const slug = req.nextUrl.searchParams.get("slug") ?? "";
    if (!SLUG.test(slug)) return NextResponse.json({ error: "Modèle invalide." }, { status: 400 });
    const files = await listAll(`${CUSTOM_STORAGE_DIR}/${slug}`);
    if (files.length) await admin().storage.from(BUCKET).remove(files);
    const { error } = await admin().from(CUSTOM_MODELS_TABLE).delete().eq("slug", slug);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur serveur." }, { status: 500 });
  }
}
