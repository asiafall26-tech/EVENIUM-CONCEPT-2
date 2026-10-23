import type { Metadata } from "next";
import AnniversaireInvitation from "@/components/invitations/anniversaire/AnniversaireInvitation";
import { ANNIVERSAIRE_MODEL_ID, withDefaults, type AnniversaireContent } from "@/components/invitations/anniversaire/content";
import { withoutMusic } from "@/lib/staticCard";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Anniversaire Bordeaux & Or | Modèle d'invitation Evenium",
  description: "Démo du modèle d'invitation d'anniversaire Bordeaux & Or, sur deux pages.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Démo publique du modèle
export default async function InvitationAnniversairePage() {
  // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
  const { content, hidden, isCard } = await fetchPublishedModel<AnniversaireContent>(await createClient(), ANNIVERSAIRE_MODEL_ID);
  // Modèle retiré du site par l'admin
  if (hidden) notFound();
  // Carte statique : la démo est présentée sans musique
  const shown = isCard ? withoutMusic(withDefaults(content)) : content ? withDefaults(content) : undefined;
  return <AnniversaireInvitation preview content={shown} />;
}
