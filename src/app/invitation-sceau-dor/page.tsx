import type { Metadata } from "next";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";
import { SCEAU_MODEL_ID, type SceauContent } from "@/components/invitations/sceau/content";
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefault } from "@/lib/modelDefaults";

export const metadata: Metadata = {
  title: "Sceau d'Or Impérial | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Sceau d'Or Impérial.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationSceauDorPage() {
  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const content = await fetchModelDefault<SceauContent>(await createClient(), SCEAU_MODEL_ID);
  return <SceauInvitation preview content={content} />;
}
