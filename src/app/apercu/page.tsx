import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ModelPreview from "./ModelPreview";
import { isCoverUrl, isModelSrc } from "@/lib/modelPreview";
import { createClient } from "@/utils/supabase/server";
import { mockInvitationModels } from "@/data/mock/invitations";
import { fetchModelDefaults, modelCoverOf, modelNameOf } from "@/lib/modelDefaults";
import { fetchCustomModel, isCustomModelId } from "@/lib/customModels";

export const metadata: Metadata = {
  title: "Invitation | Evenium",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Nom et couverture d'un modèle, d'après son identifiant (modèle Evenium ou importé) */
async function modelInfo(supabase: Supabase, id: string | null | undefined) {
  if (!id) return null;
  if (isCustomModelId(id)) {
    const m = await fetchCustomModel(supabase, id.replace(/^custom:/, ""));
    return m ? { name: m.name, cover: m.cover_url } : null;
  }
  const native = mockInvitationModels.find((m) => m.id === id);
  if (!native) return null;
  const rows = await fetchModelDefaults(supabase);
  return { name: modelNameOf(rows[id], native.name), cover: modelCoverOf(rows[id], native.thumbnail) };
}

/** Le modèle derrière une page d'invitation : démo, modèle importé ou invitation d'un événement */
async function infoFor(src: string) {
  const supabase = await createClient();
  const custom = src.match(/^\/m\/([a-z0-9-]+)\//);
  if (custom) return modelInfo(supabase, `custom:${custom[1]}`);
  const invite = src.match(/^\/invite\/([\w-]+)$/);
  if (invite) {
    const { data } = await supabase.from("events").select("invitation_model_id").eq("id", invite[1]).maybeSingle();
    return modelInfo(supabase, data?.invitation_model_id);
  }
  return modelInfo(supabase, mockInvitationModels.find((m) => m.liveUrl === src)?.id);
}

export default async function ApercuPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const src = one(sp.src);
  if (!isModelSrc(src)) redirect("/invitations");
  let name = one(sp.name).slice(0, 120);
  let cover = one(sp.cover);
  if (!name || !isCoverUrl(cover)) {
    const info = await infoFor(src).catch(() => null);
    name ||= info?.name ?? "";
    if (!isCoverUrl(cover)) cover = info?.cover ?? "";
  }
  return (
    <ModelPreview
      src={src}
      name={name || "Invitation"}
      cover={isCoverUrl(cover) ? cover : null}
      // Lien envoyé aux invités : pas de retour vers la galerie des modèles
      showBack={!src.startsWith("/invite/")}
    />
  );
}
