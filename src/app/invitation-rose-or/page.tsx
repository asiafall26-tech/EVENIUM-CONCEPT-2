import type { Metadata } from "next";
import { DEMO_SRC } from "@/components/invitations/rose-or/content";

export const metadata: Metadata = {
  title: "Rose Poudrée & Or Impérial | Modèle d'invitation Evenium",
  description: "Modèle d'invitation de mariage animé avec enveloppe scellée, vidéo cinématique, musique d'ambiance et RSVP.",
};

export default function InvitationRoseOrPage() {
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
