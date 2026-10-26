/**
 * Import d'un modèle (ZIP ou HTML) dans le navigateur de l'admin :
 * lecture des fichiers, repérage des textes / images / musiques modifiables, envoi au stockage.
 */
import JSZip from "jszip";
import { createClient } from "@/utils/supabase/client";
import type { CustomField } from "@/lib/customModels";

export interface ModelFile {
  path: string;
  blob: Blob;
}

const MIME: Record<string, string> = {
  html: "text/html", htm: "text/html", css: "text/css", js: "text/javascript", mjs: "text/javascript", json: "application/json",
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", avif: "image/avif",
  mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", mp4: "video/mp4", webm: "video/webm",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", ico: "image/x-icon", txt: "text/plain",
};
const mimeOf = (path: string) => MIME[path.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
const isHtml = (p: string) => /\.html?$/i.test(p);

/** Lit un ZIP ou un fichier HTML et trouve la page principale. */
export async function readModelFiles(file: File): Promise<{ files: ModelFile[]; entry: string }> {
  if (isHtml(file.name)) return { files: [{ path: "index.html", blob: file }], entry: "index.html" };
  if (!/\.zip$/i.test(file.name)) throw new Error("Choisissez un fichier .zip ou .html.");

  const zip = await JSZip.loadAsync(file);
  let files: ModelFile[] = [];
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    const name = entry.name.replace(/\\/g, "/");
    if (name.startsWith("__MACOSX/") || /(^|\/)\.DS_Store$/.test(name) || /(^|\/)Thumbs\.db$/i.test(name)) continue;
    files.push({ path: name, blob: await entry.async("blob") });
  }
  if (!files.length) throw new Error("Le ZIP est vide.");

  // Dossier unique à la racine du ZIP : on le retire
  const tops = new Set(files.map((f) => f.path.split("/")[0]));
  if (tops.size === 1 && files.every((f) => f.path.includes("/"))) {
    const top = [...tops][0] + "/";
    files = files.map((f) => ({ ...f, path: f.path.slice(top.length) }));
  }

  const htmls = files.map((f) => f.path).filter(isHtml).sort((a, b) => a.split("/").length - b.split("/").length);
  const entry = htmls.find((p) => /(^|\/)index\.html?$/i.test(p)) ?? htmls[0];
  if (!entry) throw new Error("Aucune page HTML trouvée dans le ZIP (il faut un fichier index.html).");
  return { files, entry };
}

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TEMPLATE", "IFRAME", "HEAD", "CANVAS", "SELECT", "OPTION", "TEXTAREA"]);
const INLINE = new Set(["B", "STRONG", "I", "EM", "U", "SMALL", "SPAN", "BR", "SUP", "SUB", "MARK", "FONT"]);
const TAG_LABEL: Record<string, string> = {
  H1: "Titre principal", H2: "Titre", H3: "Sous-titre", H4: "Sous-titre", H5: "Petit titre", H6: "Petit titre",
  P: "Texte", A: "Lien / bouton", BUTTON: "Bouton", LI: "Élément de liste", BLOCKQUOTE: "Citation", LABEL: "Étiquette", TD: "Case de tableau",
};

/** Texte d'un élément, retours à la ligne compris */
function readText(el: Element) {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  return (clone.textContent ?? "")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/^\n+|\n+$/g, "");
}

const hasOwnText = (el: Element) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && /[\p{L}\p{N}]/u.test(n.textContent ?? ""));
const onlyInlineChildren = (el: Element): boolean =>
  Array.from(el.children).every((c) => INLINE.has(c.tagName.toUpperCase()) && onlyInlineChildren(c));
const snippet = (t: string) => (t.length > 32 ? t.slice(0, 30).trim() + "…" : t);

/**
 * Repère les éléments modifiables et les marque (data-ev-field / data-ev-type).
 * Textes : éléments avec du texte et seulement de la mise en forme dedans. Images : <img>, fonds en style.
 * Musiques : <audio> et leurs <source>.
 */
export function detectFields(html: string): { html: string; fields: CustomField[]; cover: string | null } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const fields: CustomField[] = [];
  let n = 0;
  let cover: string | null = null;

  // Sections de la page (menus du studio) : <section>, <header>, <footer>, <article>, ou blocs principaux
  const meaningful = (el: Element) => Array.from(el.children).filter((c) => !SKIP.has(c.tagName.toUpperCase()));
  let root: Element = doc.body;
  for (let depth = 0; depth < 6 && meaningful(root).length === 1; depth++) root = meaningful(root)[0];
  const sectionIndex = new Map<Element, number>();
  const sectionHeading = new Map<number, string>();
  const sectionOf = (el: Element) => {
    let cur: Element | null = el;
    while (cur && cur !== root && cur !== doc.body) {
      if (/^(SECTION|HEADER|FOOTER|ARTICLE|NAV)$/.test(cur.tagName.toUpperCase()) || cur.parentElement === root) break;
      cur = cur.parentElement;
    }
    const key = cur && cur !== doc.body ? cur : root;
    if (!sectionIndex.has(key)) sectionIndex.set(key, sectionIndex.size + 1);
    return sectionIndex.get(key)!;
  };

  /**
   * Un élément peut porter plusieurs réglages : son texte (data-ev-field), son lien (data-ev-href),
   * son image de fond (data-ev-bg) et sa couleur (data-ev-color), chacun avec son propre identifiant.
   */
  const add = (el: Element, f: Omit<CustomField, "id" | "clientEditable">, domType: string, attr = "data-ev-field") => {
    if (fields.length >= 400) return;
    const id = `f${++n}`;
    el.setAttribute(attr, id);
    if (attr === "data-ev-field") el.setAttribute("data-ev-type", domType);
    const section = sectionOf(el);
    if (f.type === "text" && /^H[1-3]$/.test(el.tagName.toUpperCase()) && !sectionHeading.has(section)) sectionHeading.set(section, f.original);
    fields.push({ id, clientEditable: true, section, ...f });
  };

  const walk = (el: Element) => {
    const tag = el.tagName.toUpperCase();
    if (SKIP.has(tag)) return;

    if (tag === "IMG") {
      const src = el.getAttribute("src");
      if (src && !src.startsWith("data:")) {
        cover ??= src;
        add(el, { type: "image", label: `Image ${fields.filter((f) => f.type === "image").length + 1}`, original: src }, "image");
      }
      return;
    }
    if (tag === "VIDEO") {
      const own = el.getAttribute("src");
      const target = own ? el : el.querySelector("source[src]");
      const src = target?.getAttribute("src");
      if (target && src) add(target, { type: "video", label: `Vidéo ${fields.filter((f) => f.type === "video").length + 1}`, original: src }, "video");
      return;
    }
    if (tag === "AUDIO") {
      const own = el.getAttribute("src");
      const target = own ? el : el.querySelector("source[src]");
      const src = target?.getAttribute("src");
      if (target && src) add(target, { type: "audio", label: `Musique ${fields.filter((f) => f.type === "audio").length + 1}`, original: src }, "audio");
      return;
    }

    const style = el.getAttribute("style") ?? "";
    const bg = style.match(/background(?:-image)?\s*:[^;]*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (bg && !bg[1].startsWith("data:")) {
      cover ??= bg[1];
      add(el, { type: "image", label: `Image de fond ${fields.filter((f) => f.type === "image").length + 1}`, original: bg[1] }, "bg", "data-ev-bg");
    }
    // Couleurs posées dans la page (ex. pastilles du code vestimentaire)
    const color = style.match(/background(?:-color)?\s*:\s*(#[0-9a-f]{3,8})\b/i);
    if (color) {
      const near = el.parentElement ? readText(el.parentElement) : "";
      const label = near && near.length < 40 ? `Couleur « ${near} »` : `Couleur ${fields.filter((f) => f.type === "color").length + 1}`;
      add(el, { type: "color", label, original: color[1] }, "color", "data-ev-color");
    }

    // Liens : itinéraire, téléphone, WhatsApp, site…
    const href = tag === "A" ? el.getAttribute("href") : null;
    if (href && !href.startsWith("#") && !/^javascript:/i.test(href)) {
      const text = readText(el);
      const kind = /maps|goo\.gl|waze/i.test(href)
        ? "Lien d'itinéraire"
        : /^tel:/i.test(href)
          ? "Numéro de téléphone"
          : /wa\.me|whatsapp/i.test(href)
            ? "Lien WhatsApp"
            : /^mailto:/i.test(href)
              ? "Adresse e-mail"
              : "Lien";
      add(el, { type: "link", label: `${kind}${text ? ` « ${snippet(text)} »` : ""}`, original: href }, "link", "data-ev-href");
    }

    if (hasOwnText(el) && onlyInlineChildren(el)) {
      const text = readText(el);
      if (text) {
        add(el, {
          type: "text",
          label: `${TAG_LABEL[tag] ?? "Texte"} « ${snippet(text.replace(/\n/g, " "))} »`,
          original: text,
          multiline: text.includes("\n") || text.length > 70 || tag === "P" || tag === "BLOCKQUOTE",
        }, "text");
      }
      // Couleurs posées sur des éléments à l'intérieur du texte (ex. pastille + nom de la couleur)
      el.querySelectorAll("[style]").forEach((inner) => {
        const c = (inner.getAttribute("style") ?? "").match(/background(?:-color)?\s*:\s*(#[0-9a-f]{3,8})\b/i);
        if (c) add(inner, { type: "color", label: `Couleur « ${snippet(readText(el))} »`, original: c[1] }, "color", "data-ev-color");
      });
      return;
    }
    Array.from(el.children).forEach(walk);
  };
  if (doc.body) Array.from(doc.body.children).forEach(walk);

  // Titre de chaque section : son premier titre, sinon son premier texte
  for (const f of fields) {
    const sec = f.section ?? 1;
    const firstText = fields.find((x) => x.section === sec && x.type === "text")?.original;
    const title = (sectionHeading.get(sec) ?? firstText ?? "").replace(/\s+/g, " ").trim();
    f.sectionTitle = title ? snippet(title) : `Section ${sec}`;
  }

  const doctype = /^\s*<!doctype[^>]*>/i.exec(html)?.[0] ?? "<!DOCTYPE html>";
  return { html: `${doctype}\n${doc.documentElement.outerHTML}`, fields, cover };
}

/** Envoie les fichiers du modèle au stockage (adresses signées par le serveur, envoi direct). */
export async function uploadModelFiles(slug: string, files: ModelFile[], onProgress?: (done: number, total: number) => void) {
  const supabase = createClient();
  const res = await fetch("/api/admin/custom-models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, paths: files.map((f) => f.path) }),
  });
  const data = (await res.json()) as { files?: { path: string; fullPath: string; token: string }[]; error?: string };
  if (!res.ok || !data.files) throw new Error(data.error ?? "Envoi impossible.");

  const byPath = new Map(files.map((f) => [f.path, f]));
  let done = 0;
  const queue = [...data.files];
  const worker = async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      const file = byPath.get(s.path)!;
      const blob = file.blob.type ? file.blob : new Blob([file.blob], { type: mimeOf(file.path) });
      const { error } = await supabase.storage.from("evenium_assets").uploadToSignedUrl(s.fullPath, s.token, blob, { contentType: mimeOf(file.path), upsert: true });
      if (error) throw new Error(`« ${file.path} » : ${error.message}`);
      onProgress?.(++done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
}

/** Adresse publique d'une image du modèle (chemin relatif au dossier du modèle) */
export const modelAssetUrl = (slug: string, entry: string, src: string) => {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("/")) return src;
  const dir = entry.includes("/") ? entry.slice(0, entry.lastIndexOf("/") + 1) : "";
  return `/m/${slug}/${dir}${src}`;
};
