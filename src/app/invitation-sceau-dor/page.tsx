import type { Metadata } from "next";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";

export const metadata: Metadata = {
  title: "Sceau d'Or Impérial | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Sceau d'Or Impérial.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default function InvitationSceauDorPage() {
  return <SceauInvitation preview />;
}
