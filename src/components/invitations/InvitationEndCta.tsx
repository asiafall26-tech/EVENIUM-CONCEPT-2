"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2, Home, Crown, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface InvitationEndCtaProps {
  theme?: "velours" | "sceau" | "ivoire" | "default";
  modelId?: string;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  isCreateMode?: boolean;
}

export default function InvitationEndCta({
  theme = "default",
  modelId,
  onBackToEdit,
  onFinalize,
  isCreateMode,
}: InvitationEndCtaProps) {
  const [mounted, setMounted] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }
  }, []);

  const isCreate =
    isCreateMode ||
    (typeof pathname === "string" && pathname.startsWith("/create")) ||
    !!onBackToEdit ||
    !!onFinalize;

  // When rendered inside an editor studio side-by-side iframe (not the fullscreen view),
  // do not display the public marketing footer
  if (mounted && isIframe && !isCreate) {
    return null;
  }

  const isDark = theme === "velours" || theme === "sceau";
  const createUrl = modelId ? `/create?model=${modelId}` : "/create";

  const handleBackToCreation = () => {
    if (onBackToEdit) {
      onBackToEdit();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("evenium:close-preview"));
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "evenium:close-preview" }, "*");
      }
    }
  };

  const handleValiderAchat = () => {
    if (onFinalize) {
      onFinalize();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("evenium:open-checkout"));
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "evenium:open-checkout" }, "*");
      }
    }
  };

  return (
    <>
      {/* Floating return shortcut for standalone visitor convenience (only on public demo routes, not in /create) */}
      {!isCreate && (
        <div className="fixed top-4 left-4 z-40 pointer-events-auto">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 border ${
              isDark
                ? "bg-black/60 hover:bg-black/85 text-white/90 border-white/15 hover:border-[#D4AF37]/50"
                : "bg-white/80 hover:bg-white text-gray-900 border-black/10 hover:border-[#D4AF37]/60"
            }`}
            title="Retourner à l'accueil"
          >
            <Home size={13} className="text-[#D4AF37]" />
            <span>Accueil</span>
          </Link>
        </div>
      )}

      {/* Luxury End of Invitation CTA block */}
      <section
        className={`w-full py-12 sm:py-16 px-3 sm:px-6 text-center transition-all relative z-10 ${
          isDark
            ? "bg-gradient-to-b from-transparent via-black/60 to-black/90 text-white border-t border-[#D4AF37]/25"
            : "bg-gradient-to-b from-transparent via-[#fbf7f0]/80 to-[#f3ece2] text-[#2a050d] border-t border-[#D4AF37]/30"
        }`}
      >
        <div
          className={`w-full max-w-[440px] mx-auto rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden backdrop-blur-md shadow-2xl transition-all border ${
            isDark
              ? "bg-gradient-to-b from-[#180309]/95 via-[#0e0205]/95 to-black/95 text-white border-[#D4AF37]/40 shadow-black/80"
              : "bg-gradient-to-b from-white/95 via-[#fffdf9]/95 to-[#f9f4ec]/95 text-[#2a050d] border-[#D4AF37]/40 shadow-[#D4AF37]/15"
          }`}
        >
          {/* Radiant Top Gold Glow */}
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-90" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 bg-[#D4AF37]/20 blur-2xl pointer-events-none rounded-full" />

          {/* Emblem Icon with Dual Ring */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#996515] p-[1.5px] shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? "bg-[#180309]" : "bg-white"
                }`}
              >
                <Sparkles size={22} className="text-[#D4AF37]" />
              </div>
            </div>
          </div>

          {/* Kicker with subtle divider hairlines */}
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <span className="w-5 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#D4AF37]">
              {isCreate ? "Votre création Evenium" : "Evenium · Haute Couture Digitale"}
            </span>
            <span className="w-5 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          {/* Title */}
          <h3
            className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${
              isDark ? "text-white" : "text-[#1f1715]"
            }`}
          >
            {isCreate ? "Votre invitation est prête !" : "Ce modèle vous inspire ?"}
          </h3>

          {/* Subtitle */}
          <p
            className={`text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed font-sans ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {isCreate
              ? "Toutes vos personnalisations sont en place. Validez votre achat pour activer votre lien officiel, débloquer le partage WhatsApp et vos accès organisateur."
              : "Personnalisez ce modèle avec vos photos, musiques, programme et gérez vos confirmations RSVP en temps réel."}
          </p>

          {/* Action buttons stack: Single-line (whitespace-nowrap) & prominent primary action */}
          <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
            {isCreate ? (
              <>
                {/* 1. Primary Action: Valider & Finaliser l'achat */}
                <button
                  type="button"
                  onClick={handleValiderAchat}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-sm sm:text-base shadow-xl shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/45 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/60 group cursor-pointer whitespace-nowrap"
                >
                  <Sparkles size={17} className="text-black group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="tracking-wide">Valider &amp; Finaliser l&apos;achat</span>
                </button>

                {/* 2. Secondary Action: Revenir à la création */}
                <button
                  type="button"
                  onClick={handleBackToCreation}
                  className={`w-full py-3 px-6 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50"
                      : "bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300/90 shadow-sm hover:border-[#D4AF37]/60"
                  }`}
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  <span>Revenir à la création</span>
                </button>
              </>
            ) : (
              <>
                {/* 1. Primary Action: Choisir ce modèle */}
                <Link
                  href={createUrl}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-sm sm:text-base shadow-xl shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/45 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/60 group cursor-pointer whitespace-nowrap"
                >
                  <Sparkles size={17} className="text-black group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="tracking-wide">Choisir ce modèle</span>
                </Link>

                {/* 2. Secondary Action: Retour à l'accueil */}
                <Link
                  href="/"
                  className={`w-full py-3 px-6 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50"
                      : "bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300/90 shadow-sm hover:border-[#D4AF37]/60"
                  }`}
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  <span>Retour à l&apos;accueil</span>
                </Link>
              </>
            )}
          </div>

          {/* Reassurance pill */}
          <div
            className={`mt-6 py-2 px-4 rounded-full inline-flex items-center justify-center gap-2 text-[11px] font-medium border ${
              isDark
                ? "bg-white/5 text-gray-300 border-white/10"
                : "bg-[#f5ede0] text-gray-700 border-[#D4AF37]/25"
            }`}
          >
            {isCreate ? (
              <>
                <Lock size={12} className="text-[#D4AF37] shrink-0" />
                <span>Téléchargement et liens de partage débloqués après validation</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-[#D4AF37] shrink-0" />
                <span>Formules avec ou sans abonnement · Sans engagement</span>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
