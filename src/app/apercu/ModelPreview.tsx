"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import { demoSrc } from "@/lib/modelPreview";

const MOBILE = "(max-width: 767px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

interface Props {
  src: string;
  name: string;
  cover: string | null;
  showBack: boolean;
}

/**
 * Aperçu d'un modèle sur ordinateur : le modèle au centre, sur toute la hauteur, aux proportions d'un écran
 * de smartphone, devant sa couverture floutée. Sur mobile, le modèle s'ouvre directement en plein écran.
 * Le choix du modèle se fait avec le bloc de fin de l'invitation.
 */
export default function ModelPreview({ src, name, cover, showBack }: Props) {
  const desktop = useSyncExternalStore(subscribeMobile, () => !window.matchMedia(MOBILE).matches, () => false);

  // Écran étroit : la page en plein écran (demo=1, pour ne pas être re-cadrée par le proxy)
  useEffect(() => {
    if (window.matchMedia(MOBILE).matches) window.location.replace(demoSrc(src));
  }, [src]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#1a120c]">
      {/* Arrière-plan : la couverture du modèle, floutée et assombrie */}
      {cover && (
        <div
          aria-hidden
          className="absolute -inset-16 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url("${cover}")` }}
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-black/35" />

      {desktop && (
        <>
          {showBack && (
            <Link
              href="/invitations"
              aria-label="Retour aux modèles"
              className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              <ArrowLeft size={16} /> Retour aux modèles
            </Link>
          )}

          {/*
            Largeur des modèles : 480 px, celle pour laquelle ils sont dessinés (au-delà, les pages d'ouverture laissent
            des bandes vides sur les côtés), jamais moins de 430 px pour ne pas comprimer l'invitation sur un petit écran.
          */}
          <div
            className="relative z-10 mx-auto h-dvh max-w-full overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.55)]"
            style={{ width: "clamp(430px, 46dvh, 480px)" }}
          >
            <iframe src={demoSrc(src)} title={name} allow="autoplay; fullscreen" className="block h-full w-full border-0" />
          </div>
        </>
      )}
    </main>
  );
}
