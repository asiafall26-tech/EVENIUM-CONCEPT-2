import type { Metadata } from "next";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";
import { SCEAU_MODEL_ID, withDefaults, type SceauContent } from "@/components/invitations/sceau/content";
import { withoutMusic } from "@/lib/staticCard";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Sceau d'Or Impérial | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Sceau d'Or Impérial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationSceauDorPage() {
  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const { content, hidden, isCard } = await fetchPublishedModel<SceauContent>(await createClient(), SCEAU_MODEL_ID);
  // Modèle retiré du site par l'admin
  if (hidden) notFound();
  // Carte statique : la démo est présentée sans musique
  const shown = isCard ? withoutMusic(withDefaults(content)) : content;
  return <SceauInvitation preview content={shown} />;
}
