import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { DEMO_SRC } from "@/components/invitations/rose-or/content";

export const metadata: Metadata = {
  title: "Rose Poudrée & Or Impérial | Modèle d'invitation Evenium",
  description: "Modèle d'invitation de mariage animé avec enveloppe scellée, vidéo cinématique, musique d'ambiance et RSVP.",
};

export default function InvitationRoseOrPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#efe2dc] m-0 p-0 relative flex items-center justify-center">
      {/* Floating shortcut to home */}
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 border bg-white/85 hover:bg-white text-gray-900 border-black/10 hover:border-[#D4AF37]/60"
          title="Retourner à l'accueil"
        >
          <Home size={13} className="text-[#D4AF37]" />
          <span>Accueil</span>
        </Link>
      </div>

      <iframe
        src={DEMO_SRC}
        title="Rose Poudrée & Or Impérial"
        className="w-full h-full border-0 block"
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
