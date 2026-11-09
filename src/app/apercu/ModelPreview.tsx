"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
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
  category?: string;
  showBack: boolean;
}

/**
 * Aperçu d'un modèle sur ordinateur : le modèle au centre, sur toute la hauteur, aux proportions d'un écran
 * de smartphone, devant sa couverture floutée. Sur mobile, le modèle s'ouvre directement en plein écran.
 * Le choix du modèle se fait avec le bloc de fin de l'invitation.
 */
export default function ModelPreview({ src, name, cover, category, showBack }: Props) {
  const desktop = useSyncExternalStore(subscribeMobile, () => !window.matchMedia(MOBILE).matches, () => false);

  const backUrl = category && category !== "Tous" ? `/invitations?cat=${encodeURIComponent(category)}` : "/invitations";

  const chooseUrl = (() => {
    const catParam = category && category !== "Tous" ? `&cat=${encodeURIComponent(category)}` : "";
    const custom = src.match(/^\/m\/([a-z0-9-]+)/);
    if (custom) return `/create?model=custom:${custom[1]}${catParam}`;
    if (src.includes("rose-or")) return `/create?model=invit-10${catParam}`;
    if (src.includes("sceau-dor")) return `/create?model=invit-8${catParam}`;
    if (src.includes("velours") || src.includes("mariage")) return `/create?model=invit-7${catParam}`;
    if (src.includes("ivoire")) return `/create?model=invit-9${catParam}`;
    if (src.includes("anniversaire")) return `/create?model=invit-11${catParam}`;
    if (src.includes("voeux")) return `/create?model=voeu-exception${catParam}`;
    if (src.includes("mots-doux")) return `/create?model=mot-doux${catParam}`;
    return `/create${catParam ? `?${catParam.slice(1)}` : ""}`;
  })();

  // Mémorise la catégorie active pour que le retour ramène toujours à la bonne catégorie
  useEffect(() => {
    if (category && category !== "Tous") {
      try {
        sessionStorage.setItem("evenium:last_category", category);
      } catch {}
    }
  }, [category]);

  // Écran étroit : la page en plein écran (demo=1, pour ne pas être re-cadrée par le proxy)
  useEffect(() => {
    if (window.matchMedia(MOBILE).matches) window.location.replace(demoSrc(src, category));
  }, [src, category]);

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
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* En-tête sur une ligne format très simple au clic */}
          <header className="shrink-0 h-14 px-4 sm:px-8 bg-[#0e0a08]/92 backdrop-blur-md border-b border-[#D4AF37]/35 flex items-center justify-between gap-3 shadow-lg z-30 select-none">
            {showBack ? (
              <Link
                href={backUrl}
                aria-label="Retour aux modèles"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft size={14} className="text-[#f0d999]" /> <span>Retour aux modèles</span>
              </Link>
            ) : <div />}

            <div className="text-center min-w-0 max-w-md hidden sm:block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-extrabold block">Aperçu du modèle</span>
              <p className="font-serif text-sm text-white/90 truncate font-medium">{name}</p>
            </div>

            <Link
              href={chooseUrl}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs shadow-md shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/60 whitespace-nowrap cursor-pointer"
            >
              <Sparkles size={14} className="text-black shrink-0" /> <span>Choisir ce modèle</span>
            </Link>
          </header>

          {/*
            Largeur des modèles : 480 px, celle pour laquelle ils sont dessinés (au-delà, les pages d'ouverture laissent
            des bandes vides sur les côtés), jamais moins de 430 px pour ne pas comprimer l'invitation sur un petit écran.
          */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-5">
            <div
              className="relative mx-auto h-full max-h-[92vh] max-w-full overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.55)] border-x border-[#c9a45e]/60 sm:rounded-[36px] sm:border sm:border-[#c9a45e]/70"
              style={{ width: "clamp(430px, 46dvh, 480px)" }}
            >
              <iframe
                src={`${src}${src.includes("?") ? "&" : "?"}hideCta=1`}
                title={name}
                allow="autoplay; fullscreen"
                className="block h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
