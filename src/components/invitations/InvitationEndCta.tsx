"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft, X } from "lucide-react";
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
  const [showExitModal, setShowExitModal] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [returnCategory, setReturnCategory] = useState<string>("");
  // Démo publique affichée dans le cadre téléphone de la page d'aperçu (/apercu, sur ordinateur)
  const [isDemo, setIsDemo] = useState(false);
  const pathname = usePathname();
  const cta = useInvitationCta();
  const custom = ctaText(cta.variant);
  const isChoose = !!custom;

  useEffect(() => {
    setMounted(true);
    const sp = new URLSearchParams(window.location.search);
    setIsDemo(sp.get("demo") === "1");
    const cat = sp.get("cat") || sp.get("category") || "";
    if (cat && cat !== "Tous") {
      setReturnCategory(cat);
      try { sessionStorage.setItem("evenium:last_category", cat); } catch {}
    } else {
      try {
        const saved = sessionStorage.getItem("evenium:last_category");
        if (saved && saved !== "Tous") setReturnCategory(saved);
      } catch {}
    }
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

  const isFinalCheckout = !isChoose && (pathname?.includes("checkout") || pathname?.includes("step-5"));
  const modalTitle = isChoose
    ? custom!.title
    : isFinalCheckout
    ? "Votre invitation est prête !"
    : "Ce modèle vous plaît ?";
  const modalDesc = isChoose
    ? custom!.desc
    : isFinalCheckout
    ? "Toutes vos personnalisations sont en place. Validez votre commande pour activer votre lien officiel et vos accès organisateur."
    : "Sélectionnez ce modèle pour le personnaliser avec vos propres textes, photos et musiques, ou continuez à explorer notre collection.";
  const primaryLabel = isChoose
    ? custom!.primary
    : isFinalCheckout
    ? "Valider & Finaliser l'achat"
    : "Choisir ce modèle";
  const secondaryLabel = isChoose
    ? custom!.secondary
    : isFinalCheckout
    ? "Revenir à la création"
    : "Explorer d'autres modèles";

  const content = (
    <>
      {/* 1. Bouton de sortie discret Haute Joaillerie : aucun bandeau, zéro camouflage de l'œuvre */}
      <button
        type="button"
        onClick={() => setShowExitModal(true)}
        aria-label="Quitter l'aperçu"
        className="fixed top-3 left-3 z-[2147483647] w-9 h-9 rounded-full bg-[#0e0a08]/75 hover:bg-[#0e0a08]/90 text-white/90 hover:text-white border border-white/25 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
      >
        <X size={16} />
      </button>

      {/* 2. Modale de confirmation Haute Couture : lisibilité absolue noir et or impérial */}
      {showExitModal && (
        <div className="fixed inset-0 z-[2147483647] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full p-6 sm:p-7 text-center rounded-3xl bg-[#15100c] border border-[#d4af37]/60 shadow-[0_25px_80px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
            {/* Bouton pour fermer la modale et reprendre l'admiration du modèle */}
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fermer la modale"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#d4af37]/25 to-transparent border border-[#d4af37]/50 flex items-center justify-center">
              <Sparkles size={22} className="text-[#d4af37]" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-semibold mb-2">{modalTitle}</h3>
            <p className="text-xs sm:text-[13px] text-[#f0e4d0]/80 leading-relaxed mb-6">{modalDesc}</p>
            <div className="flex flex-col gap-2.5">
              {isCreate ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    handleValiderAchat();
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-extrabold text-xs shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#d4af37]/70"
                >
                  ✨ {primaryLabel}
                </button>
              ) : (
                <Link
                  href={createUrl}
                  target={isDemo ? "_top" : undefined}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-extrabold text-xs shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#d4af37]/70 block text-center"
                >
                  ✨ {primaryLabel}
                </Link>
              )}

              {isCreate ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    handleBackToCreation();
                  }}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
                >
                  {secondaryLabel}
                </button>
              ) : (
                <Link
                  href={returnCategory ? `/invitations?cat=${encodeURIComponent(returnCategory)}` : "/invitations"}
                  target={isDemo ? "_top" : undefined}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer block text-center"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
}
