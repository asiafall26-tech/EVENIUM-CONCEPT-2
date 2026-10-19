"use client";

import React from "react";
import { ExternalLink, Sparkles } from "lucide-react";

interface IPhone16ProMaxFrameProps {
  children?: React.ReactNode;
  src?: string;
  title?: string;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
  containerClassName?: string;
  bgColor?: string;
  dynamicIslandContent?: React.ReactNode;
  showNotification?: boolean;
  adaptiveHeight?: boolean;
}

/**
 * Cadre smartphone vertical grand format façon iPhone 16 Pro Max.
 * Conçu avec une largeur équilibrée et une hauteur adaptative
 * qui s'ajuste parfaitement dans les studios de personnalisation et les pages de présentation.
 */
export function IPhone16ProMaxFrame({
  children,
  src,
  title = "Prévisualisation du modèle",
  iframeRef,
  className = "",
  containerClassName = "",
  bgColor = "bg-black",
  dynamicIslandContent,
  showNotification = false,
  adaptiveHeight = false,
}: IPhone16ProMaxFrameProps) {
  const [notificationDismissed, setNotificationDismissed] = React.useState(false);

  return (
    <div className={`w-full flex flex-col items-center justify-center min-h-0 ${containerClassName}`}>
      {/* Notification : Ouvrez en plein écran pour une meilleure prévisualisation */}
      {showNotification && !notificationDismissed && (
        <div className="w-full max-w-[96vw] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] mx-auto mb-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#b8924a]/30 via-[#8f6f33]/25 to-[#b8924a]/30 border border-[#b8924a]/70 shadow-[0_4px_30px_rgba(184,146,74,0.28)] backdrop-blur-md flex items-center justify-between gap-3 text-white animate-in fade-in duration-300 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8924a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b8924a]"></span>
            </span>
            <p className="font-medium text-xs sm:text-[13px] leading-tight text-white/95">
              <strong className="text-[#b8924a] font-semibold">Conseil :</strong> Ouvrez en plein écran pour une meilleure prévisualisation
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#b8924a] to-[#F3E5AB] hover:brightness-110 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
                title="Ouvrir le modèle en plein écran dans un nouvel onglet"
              >
                <ExternalLink size={12} />
                <span>Plein écran</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setNotificationDismissed(true)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Fermer la notification"
              aria-label="Fermer la notification"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Châssis iPhone 16 Pro Max */}
      <div
        className={`relative mx-auto flex flex-col overflow-hidden bg-black transition-all duration-300 select-none
          /* Format vertical smartphone authentique (Ratio iPhone 19.5:9) */
          w-full
          max-w-[min(90vw,360px)]
          sm:max-w-[375px]
          ${adaptiveHeight ? "h-full max-h-[580px] min-h-[380px]" : "h-[min(70vh,680px)] min-h-[420px] max-h-[740px]"}
          /* Châssis Titane & Bordures de luxe */
          rounded-[2.4rem] sm:rounded-[2.8rem]
          border-[5px] sm:border-[6px] border-[#1c1c1f]
          ring-1 ring-white/20
          shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]
          ${className}`}
      >
        {/* Dynamic Island compacte */}
        <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-4.5 sm:h-5 bg-black rounded-full z-40 pointer-events-none flex items-center justify-end pr-2.5 gap-1.5 shadow-md ring-1 ring-white/10">
          {dynamicIslandContent || (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] ring-1 ring-white/15 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#1c1c30]" />
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d0d14]" />
            </>
          )}
        </div>

        {/* Bouton rapide Plein Écran en haut à droite sur le téléphone */}
        {src && (
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="absolute top-2.5 right-4 z-40 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-[#b8924a] border border-white/20 backdrop-blur-sm transition-all shadow-md hover:scale-110"
            title="Ouvrir en plein écran dans un nouvel onglet"
          >
            <ExternalLink size={13} />
          </a>
        )}

        {/* Écran d'affichage interactif - 100% calibré sans coupure ni bug */}
        <div className={`relative flex-1 w-full h-full min-h-0 overflow-hidden ${bgColor}`}>
          {src && (
            <iframe
              ref={iframeRef}
              src={src}
              title={title}
              allow="autoplay"
              className="absolute inset-0 w-full h-full border-0 overflow-y-auto"
            />
          )}
          {children}
        </div>

        {/* Barre d'accueil Home Indicator */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-1 bg-white/35 rounded-full z-40 pointer-events-none" />
      </div>
    </div>
  );
}
