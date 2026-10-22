import type { Metadata } from "next";
import VeloursInvitation from "@/components/invitations/velours/VeloursInvitation";
import { VELOURS_MODEL_ID, type VeloursContent } from "@/components/invitations/velours/content";
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefault } from "@/lib/modelDefaults";

export const metadata: Metadata = {
  title: "Velours Bordeaux | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Velours Bordeaux.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationMariagePage() {
  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const content = await fetchModelDefault<VeloursContent>(await createClient(), VELOURS_MODEL_ID);
  return <VeloursInvitation preview content={content} />;
}
