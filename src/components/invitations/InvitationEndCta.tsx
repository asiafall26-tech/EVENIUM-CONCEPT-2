"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ctaText, useInvitationCta } from "./InvitationCtaContext";

interface InvitationEndCtaProps {
  theme?: "velours" | "sceau" | "ivoire" | "default";
  modelId?: string;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  isCreateMode?: boolean;
  hideCta?: boolean;
}

export default function InvitationEndCta({
  theme = "default",
  modelId,
  onBackToEdit,
  onFinalize,
  isCreateMode,
  hideCta = false,
}: InvitationEndCtaProps) {
  const [mounted, setMounted] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  // Démo publique affichée dans le cadre téléphone de la page d'aperçu (/apercu, sur ordinateur)
  const [isDemo, setIsDemo] = useState(false);
  const pathname = usePathname();
  const cta = useInvitationCta();
  const custom = ctaText(cta.variant);
  const isChoose = !!custom;

  useEffect(() => {
    setMounted(true);
    setIsDemo(new URLSearchParams(window.location.search).get("demo") === "1");
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }
  }, []);

  // 1. Explicit prop override
  if (hideCta) {
    return null;
  }

  // 2. Strict Route Protection:
  // After purchase or on guest invitation links (/invite/[id]) or within the organizer dashboard (/dashboard/...),
  // commercial / sales / checkout CTAs must NEVER be shown.
  if (!cta.force && typeof pathname === "string") {
    if (pathname.startsWith("/invite") || pathname.startsWith("/dashboard")) {
      return null;
    }
  }

  const isCreate =
    isCreateMode ||
    (typeof pathname === "string" && pathname.startsWith("/create")) ||
    !!onBackToEdit ||
    !!onFinalize;

  // When rendered inside an editor studio side-by-side iframe (not the fullscreen view),
  // do not display the public marketing footer
  if (!cta.force && mounted && isIframe && !isCreate && !isDemo) {
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

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const content = (
    <header
      data-inv-cta=""
      className="fixed top-0 left-0 right-0 z-[2147483647] w-full pt-[max(0.65rem,env(safe-area-inset-top,0.65rem))] px-3 sm:px-5 pointer-events-none flex items-center justify-between gap-3 select-none"
    >
      {/* 1. Left Action: Retour */}
      <div className="pointer-events-auto">
        {isCreate ? (
          <button
            type="button"
            onClick={handleBackToCreation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0e0a08]/70 hover:bg-[#0e0a08]/90 text-white backdrop-blur-md border border-white/20 hover:border-[#D4AF37]/60 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft size={13} className="shrink-0 text-[#f0d999]" />
            <span>{isChoose ? custom!.secondary : "Revenir"}</span>
          </button>
        ) : (
          <Link
            href="/invitations"
            target={isDemo ? "_top" : undefined}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0e0a08]/70 hover:bg-[#0e0a08]/90 text-white backdrop-blur-md border border-white/20 hover:border-[#D4AF37]/60 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft size={13} className="shrink-0 text-[#f0d999]" />
            <span>Retour</span>
          </Link>
        )}
      </div>

      {/* 2. Center: Transparent open view (zéro obstruction, les anneaux et créations restent 100% visibles) */}
      <div className="flex-1 min-w-0 pointer-events-none" />

      {/* 3. Right Action: Primary CTA */}
      <div className="pointer-events-auto">
        {isCreate ? (
          <button
            type="button"
            onClick={handleValiderAchat}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/30 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/70 whitespace-nowrap cursor-pointer"
          >
            <Sparkles size={13} className="text-black shrink-0" />
            <span>{isChoose ? custom!.primary : "Valider l'achat"}</span>
          </button>
        ) : (
          <Link
            href={createUrl}
            target={isDemo ? "_top" : undefined}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/30 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/70 whitespace-nowrap cursor-pointer"
          >
            <Sparkles size={13} className="text-black shrink-0" />
            <span>Choisir ce modèle</span>
          </Link>
        )}
      </div>
    </header>
  );

  return createPortal(content, document.body);
}
