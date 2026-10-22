import type { Metadata } from "next";
import IvoireInvitation from "@/components/invitations/ivoire/IvoireInvitation";
import { IVOIRE_MODEL_ID, type IvoireContent } from "@/components/invitations/ivoire/content";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Ivoire Couture | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage Ivoire Couture.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationIvoirePage() {
  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const { content, hidden } = await fetchPublishedModel<IvoireContent>(await createClient(), IVOIRE_MODEL_ID);
  // Modèle retiré du site par l'admin
  if (hidden) notFound();
  return <IvoireInvitation preview content={content} />;
}
