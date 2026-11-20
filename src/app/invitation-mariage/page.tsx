import type { Metadata } from "next";
import VeloursInvitation from "@/components/invitations/velours/VeloursInvitation";
import { VELOURS_MODEL_ID, withDefaults, type VeloursContent } from "@/components/invitations/velours/content";
import { withoutMusic } from "@/lib/staticCard";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Velours Bordeaux | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Velours Bordeaux.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams?: Promise<{ preview?: string; canEdit?: string; hideCta?: string }>;
}

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationMariagePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === "1";
  const canEdit = sp.canEdit === "1" || isPreview;
  const hideCta = sp.hideCta === "1";

  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const { content, hidden, isCard } = await fetchPublishedModel<VeloursContent>(await createClient(), VELOURS_MODEL_ID);
  // Modèle retiré du site par l'admin
  if (hidden) notFound();
  // Carte statique : la démo est présentée sans musique
  const shown = isCard ? withoutMusic(withDefaults(content)) : content;
  return <VeloursInvitation preview={isPreview} hideCta={hideCta} content={shown} />;
}
