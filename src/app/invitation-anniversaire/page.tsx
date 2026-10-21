import type { Metadata } from "next";
import AnniversaireInvitation from "@/components/invitations/anniversaire/AnniversaireInvitation";

export const metadata: Metadata = {
  title: "Anniversaire Bordeaux & Or | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation d'anniversaire Bordeaux & Or, sur deux pages.",
};

// Démo publique du modèle
export default function InvitationAnniversairePage() {
  return <AnniversaireInvitation preview />;
}
