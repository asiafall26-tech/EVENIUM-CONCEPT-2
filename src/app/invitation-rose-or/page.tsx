import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO_SRC, ROSE_OR_MODEL_ID } from "@/components/invitations/rose-or/content";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";

export const metadata: Metadata = {
  title: "Rose Poudrée & Or Impérial | Modèle d'invitation Evenium",
  description: "Modèle d'invitation de mariage animé avec enveloppe scellée, vidéo cinématique, musique d'ambiance et RSVP.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvitationRoseOrPage() {
  // Modèle retiré du site par l'admin ; sinon la page animée charge elle-même la version publiée
  const { hidden } = await fetchPublishedModel(await createClient(), ROSE_OR_MODEL_ID);
  if (hidden) notFound();
  return (
    <main className="w-full h-screen overflow-hidden bg-[#efe2dc] m-0 p-0 relative flex items-center justify-center">
      <iframe
        src={DEMO_SRC}
        title="Rose Poudrée & Or Impérial"
        className="w-full h-full border-0 block"
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
