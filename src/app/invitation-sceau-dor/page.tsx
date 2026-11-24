import type { Metadata } from "next";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";
import { SCEAU_MODEL_ID, withDefaults, seedFromEvent, type SceauContent } from "@/components/invitations/sceau/content";
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

interface Props {
  searchParams?: Promise<{ preview?: string; canEdit?: string; hideCta?: string; eventId?: string }>;
}

// Public demo of the model; also used as the live preview iframe inside the editors
export default async function InvitationSceauDorPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === "1";
  const hideCta = sp.hideCta === "1";
  const eventId = sp.eventId;

  let contentToShow: Partial<SceauContent> | null = null;
  let isCard = false;

  if (eventId) {
    const supabase = await createClient();
    const { data: eventRow } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle();
    if (eventRow) {
      isCard = eventRow.format === "Carte" || eventRow.format === "Statique";
      const customContent = eventRow.invitation_content?.values ?? eventRow.invitation_content;
      if (customContent && typeof customContent === "object" && Object.keys(customContent).length > 0) {
        contentToShow = withDefaults(customContent as Partial<SceauContent>);
      } else {
        contentToShow = withDefaults(seedFromEvent(eventRow));
      }
    }
  }

  if (!contentToShow) {
    // Version ajustée par l'admin dans le studio des modèles, sinon contenu d'origine
    const { content, hidden, isCard: modelIsCard } = await fetchPublishedModel<SceauContent>(await createClient(), SCEAU_MODEL_ID);
    // Modèle retiré du site par l'admin
    if (hidden) notFound();
    contentToShow = content;
    isCard = modelIsCard;
  }

  // Carte statique : la démo est présentée sans musique
  const shown = isCard ? withoutMusic(withDefaults(contentToShow ?? undefined)) : withDefaults(contentToShow ?? undefined);
  return <SceauInvitation preview={isPreview} hideCta={hideCta} content={shown} />;
}
