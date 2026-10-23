"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, X } from "lucide-react";

const CURRENT = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "local";
const CHECK_EVERY_MS = 5 * 60 * 1000;

/**
 * Personnes déjà connectées : quand une nouvelle version est mise en ligne, un bandeau propose de la charger.
 * (À la navigation suivante, Next.js recharge de toute façon la page sur la nouvelle version.)
 */
export default function UpdateWatcher() {
  const pathname = usePathname();
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (CURRENT === "local") return;
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = (await res.json()) as { version?: string };
        if (!stopped && version && version !== "local" && version !== CURRENT) setAvailable(true);
      } catch {
        // hors ligne : on réessaiera plus tard
      }
    };
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    check();
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  // Pas de bandeau sur les invitations vues par les invités
  const guestView = pathname?.startsWith("/invite") || pathname?.startsWith("/invitation-");
  if (!available || dismissed || guestView) return null;

  return (
    <div className="fixed z-[200] inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-[#2b2118] text-[#f5eee1] px-4 py-3 shadow-2xl border border-[#b8924a]/40">
        <RefreshCw size={18} className="shrink-0 text-[#d9c08c]" />
        <p className="flex-1 text-sm">Une nouvelle version d&apos;Evenium est disponible.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 rounded-xl bg-[#b8924a] text-[#2b2118] px-3 py-2 text-xs font-bold"
        >
          Mettre à jour
        </button>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Plus tard" className="shrink-0 text-[#f5eee1]/60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
