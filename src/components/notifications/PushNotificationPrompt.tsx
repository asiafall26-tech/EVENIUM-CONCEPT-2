"use client";

import { useState, useEffect } from "react";
import { BellRing, X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { isPushSupported, subscribeToPush } from "@/lib/notifications/pushManager";

interface Props {
  userId?: string | null;
}

export function PushNotificationPrompt({ userId }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isPushSupported()) return;

    // Ne s'affiche que si la permission n'a pas encore été décidée ("default")
    if (typeof Notification === "undefined" || Notification.permission !== "default") {
      return;
    }

    // Vérifier si l'utilisateur l'a temporairement fermée
    const dismissedUntil = localStorage.getItem("evenium_push_prompt_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Petit délai d'apparition pour ne pas agresser au chargement
    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await subscribeToPush(userId || undefined);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setShow(false), 2500);
      } else {
        // En cas de refus, masquer le bandeau
        setShow(false);
      }
    } catch {
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Snooze pendant 7 jours
    const in7Days = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("evenium_push_prompt_dismissed_until", String(in7Days));
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Invitation aux alertes push"
      className="relative z-40 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white border-b border-[#b8924a]/30 shadow-md animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b8924a]/30 to-[#d4af37]/20 text-[#d4af37] border border-[#b8924a]/40 flex items-center justify-center shrink-0 shadow-xs">
            <BellRing size={16} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            {success ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Notifications activées sur cet appareil !
              </span>
            ) : (
              <div className="leading-tight">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#d4af37]" />
                  Alertes Même Application Fermée
                </span>
                <p className="text-stone-300 text-[11px] sm:text-xs mt-0.5">
                  Recevez vos messages, devis et réservations instantanément sur ce téléphone ou ordinateur.
                </p>
              </div>
            )}
          </div>
        </div>

        {!success && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleActivate}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Activer en 1 clic
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fermer pour l'instant"
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
