import type { Metadata } from "next";
import VeloursInvitation from "@/components/invitations/velours/VeloursInvitation";

export const metadata: Metadata = {
  title: "Velours Bordeaux | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage animé Velours Bordeaux.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default function InvitationMariagePage() {
  return <VeloursInvitation preview />;
}
