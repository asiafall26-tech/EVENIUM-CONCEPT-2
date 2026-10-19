import type { Metadata } from "next";
import IvoireInvitation from "@/components/invitations/ivoire/IvoireInvitation";

export const metadata: Metadata = {
  title: "Ivoire Couture | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation de mariage Ivoire Couture.",
};

// Public demo of the model; also used as the live preview iframe inside the editors
export default function InvitationIvoirePage() {
  return <IvoireInvitation preview />;
}
