import { NextRequest } from "next/server";
import { CUSTOM_STORAGE_DIR, storageKey } from "@/lib/customModels";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "video/mp4",
  webm: "video/webm",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  txt: "text/plain; charset=utf-8",
};

/** Script qui rend la page éditable (valeurs reçues du studio, de la création ou de l'invitation) */
const RUNTIME = '<script src="/ev-runtime.js" defer></script>';

/**
 * Fichiers d'un modèle importé, servis depuis le stockage sur le même domaine que le site
 * (les liens relatifs du modèle fonctionnent, et la page peut dialoguer avec l'éditeur).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path } = await params;
  if (!/^[a-z0-9-]{3,60}$/.test(slug) || path.some((p) => p === ".." || p === "")) return new Response("Introuvable", { status: 404 });

  const rel = path.map((p) => decodeURIComponent(p)).join("/");
  const ext = rel.split(".").pop()?.toLowerCase() ?? "";
  const isHtml = ext === "html" || ext === "htm";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Vidéos et musiques : Safari (iPhone, iPad, Mac) ne les lit que s'il peut les demander par morceaux (Range)
  const range = isHtml ? null : req.headers.get("range");
  const res = await fetch(`${base}/storage/v1/object/public/evenium_assets/${CUSTOM_STORAGE_DIR}/${slug}/${storageKey(rel)}`, {
    cache: "no-store",
    headers: range ? { Range: range } : undefined,
  });
  if (!res.ok) return new Response(res.status === 416 ? "Plage invalide" : "Introuvable", { status: res.status === 416 ? 416 : 404 });

  const type = TYPES[ext] ?? res.headers.get("content-type") ?? "application/octet-stream";

  if (isHtml) {
    let html = await res.text();
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${RUNTIME}</body>`) : html + RUNTIME;
    return new Response(html, { headers: { "Content-Type": type, "Cache-Control": "no-cache, must-revalidate" } });
  }

  const headers: Record<string, string> = { "Content-Type": type, "Cache-Control": "public, max-age=3600", "Accept-Ranges": "bytes" };
  for (const h of ["content-length", "content-range", "etag", "last-modified"]) {
    const v = res.headers.get(h);
    if (v) headers[h] = v;
  }
  return new Response(res.body, { status: res.status, headers });
}
