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

/** Style préventif masquant immédiatement les boutons d'édition internes (crayons, fab, modals locaux) */
const HIDE_INTERNAL_EDITS = `<style id="ev-hide-pencils">#fabEdit,#editFab,#editBtn,#edit-toggle,#editRsvp,.edit-fab,.fab-edit,.btn-edit,.edit-btn,[aria-label*="Personnaliser"],[aria-label*="Modifier"],[aria-label*="Éditer"],[title*="Personnaliser"],[title*="Modifier"],#panel,#pf,#editor,.editor[role="dialog"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;position:absolute!important;left:-9999px!important;}</style>`;

/** Script qui rend la page éditable (valeurs reçues du studio, de la création ou de l'invitation) */
const RUNTIME = `${HIDE_INTERNAL_EDITS}<script src="/ev-runtime.js" defer></script>`;

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
    const isSelfContained = html.includes('id="editor"') || html.includes('id="fab"');
    const isEditMode = req.nextUrl.searchParams.get("canEdit") === "1" || req.nextUrl.searchParams.get("edit") === "1";
    const shouldHideEdit = !isEditMode || req.nextUrl.searchParams.get("guest") === "1" || req.nextUrl.searchParams.get("hideEdit") === "1" || req.nextUrl.searchParams.get("demo") === "1";

    // Injecter les modifications enregistrées en base (content / draft_content) dans le modèle
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && serviceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        const { data: row } = await supabase
          .from("custom_invitation_models")
          .select("content, draft_content")
          .eq("slug", slug)
          .maybeSingle();

        const modelData = isEditMode
          ? (row?.draft_content && Object.keys(row.draft_content).length > 0 ? row.draft_content : row?.content)
          : row?.content;

        if (modelData && typeof modelData === "object" && Object.keys(modelData).length > 0) {
          const jsonStr = JSON.stringify(modelData).replace(/</g, "\\u003c");
          if (html.includes('id="inv-data"')) {
            html = html.replace(
              /<script\s+type="application\/json"\s+id="inv-data">[\s\S]*?<\/script>/i,
              `<script type="application/json" id="inv-data">${jsonStr}</script>`
            );
          } else {
            const dataScript = `<script type="application/json" id="inv-data">${jsonStr}</script>`;
            html = /<\/head>/i.test(html)
              ? html.replace(/<\/head>/i, `${dataScript}</head>`)
              : dataScript + html;
          }
        }
      }
    } catch {
      // Continuer si la base n'est pas joignable
    }

    let injection = "";
    if (isSelfContained) {
      if (shouldHideEdit) {
        injection = `<style id="ev-guest-hide">#fab, #ebar, .fab, .ebar, #editor, .editor, button.fab, div.ebar, aside.editor { display: none !important; visibility: hidden !important; pointer-events: none !important; width: 0 !important; height: 0 !important; position: absolute !important; left: -9999px !important; }</style>`;
      }
    } else {
      injection = shouldHideEdit
        ? `${HIDE_INTERNAL_EDITS}<script src="/ev-runtime.js" defer></script>`
        : `<script src="/ev-runtime.js" defer></script>`;
    }

    if (injection) {
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${injection}</body>`) : html + injection;
    }
    return new Response(html, { headers: { "Content-Type": type, "Cache-Control": "no-cache, must-revalidate" } });
  }

  const headers: Record<string, string> = { "Content-Type": type, "Cache-Control": "public, max-age=3600", "Accept-Ranges": "bytes" };
  for (const h of ["content-length", "content-range", "etag", "last-modified"]) {
    const v = res.headers.get(h);
    if (v) headers[h] = v;
  }
  return new Response(res.body, { status: res.status, headers });
}
