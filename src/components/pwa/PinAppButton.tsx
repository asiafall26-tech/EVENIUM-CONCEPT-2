"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Share,
  PlusSquare,
  Monitor,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  ArrowRight,
  BellRing,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { isPushSupported, subscribeToPush } from "@/lib/notifications/pushManager";

interface Props {
  variant?: "header" | "sidebar" | "banner";
  className?: string;
}

export function PinAppButton({ variant = "header", className = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop");
  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  useEffect(() => {
    // Détection de l'appareil
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);

      if (isIOS) {
        setDeviceType("ios");
        setActiveTab("ios");
      } else if (isAndroid) {
        setDeviceType("android");
        setActiveTab("android");
      } else {
        setDeviceType("desktop");
        setActiveTab("desktop");
      }

      // Vérifier si déjà installée en mode standalone
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // Écouter le prompt natif PWA (Android / Chrome Desktop / Edge)
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    }
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      setIsOpen(true);
    }
  };

  const handleQuickEnablePush = async () => {
    setPushStatus("Activation en cours...");
    const res = await subscribeToPush();
    if (res.success) {
      setPushStatus("Notifications activées avec succès !");
    } else {
      setPushStatus(res.error || "Impossible d'activer.");
    }
    setTimeout(() => setPushStatus(null), 4000);
  };

  if (isInstalled) {
    // Si l'application est déjà lancée en mode plein écran PWA installé
    return null;
  }

  return (
    <>
      {/* Bouton visible selon la variante */}
      {variant === "header" && (
        <button
          type="button"
          onClick={() => (deferredPrompt ? handleNativeInstall() : setIsOpen(true))}
          title="Épingler l'application sur votre écran d'accueil ou menu"
          className={`shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold transition-all shadow-xs border ${
            "bg-gradient-to-r from-[#b8924a]/15 via-[#d9c08c]/20 to-[#b8924a]/15 text-[#8f6f33] border-[#b8924a]/40 hover:border-[#b8924a] hover:bg-[#b8924a]/25 hover:scale-[1.02] active:scale-[0.98]"
          } ${className}`}
        >
          <Smartphone size={15} className="text-[#8f6f33] shrink-0 animate-pulse" />
          <span className="hidden sm:inline">Épingler l&apos;application</span>
          <span className="sm:hidden">Épingler</span>
        </button>
      )}

      {variant === "sidebar" && (
        <button
          type="button"
          onClick={() => (deferredPrompt ? handleNativeInstall() : setIsOpen(true))}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#b8924a]/15 to-[#d9c08c]/25 border border-[#b8924a]/35 text-[#8f6f33] hover:border-[#b8924a] transition-all text-xs font-bold shadow-xs ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone size={16} className="text-[#8f6f33] shrink-0" />
            <span>Épingler l&apos;application</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b8924a]/20 text-[#7a5e2b]">
            1 clic
          </span>
        </button>
      )}

      {/* Modal explicatif universel avec détection automatique */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Épingler Evenium sur votre appareil" maxWidth="lg">
        <div className="space-y-6 pt-1">
          <div className="text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#b8924a]/30">
              <Smartphone size={28} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Accédez à Evenium en 1 clic
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Épinglez votre tableau de bord sur l&apos;écran d&apos;accueil de votre téléphone ou dans vos logiciels pour une expérience plein écran ultra-rapide et des notifications en temps réel.
            </p>
          </div>

          {/* Onglets de sélection du type d'appareil */}
          <div className="flex p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("ios")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "ios"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              🍏 iPhone / iPad
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "android"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              🤖 Android
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("desktop")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "desktop"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              💻 Mac / Windows
            </button>
          </div>

          {/* Contenu selon l'onglet */}
          {activeTab === "ios" && (
            <div className="space-y-3 bg-[#faf8f5] border border-stone-200 rounded-2xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                  1
                </span>
                Ouvrez Evenium dans Safari sur votre iPhone ou iPad
              </div>

              <div className="font-bold text-stone-900 flex items-center gap-2 pt-2">
                <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                  2
                </span>
                Appuyez sur le bouton Partager
                <Share size={16} className="text-[#8f6f33] shrink-0" />
                <span className="text-xs font-normal text-stone-500">(le carré avec la flèche vers le haut en bas)</span>
              </div>

              <div className="font-bold text-stone-900 flex items-center gap-2 pt-2">
                <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                  3
                </span>
                Faites défiler et sélectionnez « Sur l&apos;écran d&apos;accueil »
                <PlusSquare size={16} className="text-[#8f6f33] shrink-0" />
              </div>

              <div className="font-bold text-stone-900 flex items-center gap-2 pt-2">
                <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                  4
                </span>
                Appuyez sur « Ajouter » en haut à droite. C&apos;est tout !
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 mt-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  L&apos;icône Evenium apparaîtra sur votre écran comme une application native.
                </span>
              </div>
            </div>
          )}

          {activeTab === "android" && (
            <div className="space-y-4 bg-[#faf8f5] border border-stone-200 rounded-2xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm">
              {deferredPrompt ? (
                <div className="text-center py-2 space-y-3">
                  <p className="text-sm text-stone-700">
                    Votre téléphone supporte l&apos;installation directe en un clic :
                  </p>
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-3 px-5 rounded-xl bg-[#241b13] text-[#d9c08c] font-bold text-sm shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Installer l&apos;application maintenant
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    Ouvrez Evenium dans Chrome ou Samsung Internet
                  </div>
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                      2
                    </span>
                    Appuyez sur les 3 petits points ⋮ en haut à droite
                  </div>
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#b8924a] text-white flex items-center justify-center text-xs">
                      3
                    </span>
                    Choisissez « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil »
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "desktop" && (
            <div className="space-y-4 bg-[#faf8f5] border border-stone-200 rounded-2xl p-4 sm:p-5 text-stone-800 text-xs sm:text-sm">
              {deferredPrompt ? (
                <div className="text-center py-2 space-y-3">
                  <p className="text-sm text-stone-700">
                    Installez Evenium comme application de bureau sur votre ordinateur :
                  </p>
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-3 px-5 rounded-xl bg-[#241b13] text-[#d9c08c] font-bold text-sm shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Installer sur votre ordinateur
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <Monitor size={18} className="text-[#8f6f33] shrink-0" />
                    Installation depuis Chrome, Brave ou Edge :
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Cliquez sur la petite icône d&apos;ordinateur 🖥️ ou de flèche située tout à droite dans la barre d&apos;adresse de votre navigateur (à côté de l&apos;URL), puis cliquez sur <strong>« Installer »</strong>.
                  </p>
                  <p className="text-xs text-stone-600">
                    Evenium s&apos;ouvrira alors dans sa propre fenêtre logicielle indépendante, que vous pouvez épingler à votre barre des tâches Windows ou Dock Mac.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bouton d'activation des notifications push immédiate */}
          <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-600 flex items-center gap-2">
              <BellRing size={16} className="text-[#8f6f33] shrink-0" />
              <span>Recevoir les alertes même application fermée</span>
            </div>
            <button
              type="button"
              onClick={handleQuickEnablePush}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 text-stone-900 text-xs font-bold hover:bg-stone-200 transition-colors"
            >
              {pushStatus || "Activer les notifications"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
