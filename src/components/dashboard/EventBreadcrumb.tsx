"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronRight, ArrowLeft, Home, Calendar } from "lucide-react";

interface Props {
  eventId: string;
  eventName?: string;
  currentPage?: string;
  parentPage?: {
    label: string;
    href: string;
  };
  className?: string;
  enableEscapeKey?: boolean;
}

/**
 * Menu d'échappement & Fil d'Ariane luxueux pour toutes les sous-pages d'un événement Evenium :
 * - Navigation fluide : Accueil > [Nom de l'événement] > [Page actuelle]
 * - Bouton de retour rapide au pouce sur mobile et desktop
 * - Touche Échap (Escape) pour revenir instantanément à l'aperçu de l'événement
 */
export default function EventBreadcrumb({
  eventId,
  eventName = "Événement",
  currentPage,
  parentPage,
  className = "",
  enableEscapeKey = true,
}: Props) {
  const router = useRouter();

  // Écoute de la touche Échap pour échapper facilement à la page courante
  useEffect(() => {
    if (!enableEscapeKey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si l'utilisateur est en train de taper dans un champ
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape") {
        if (currentPage) {
          router.push(parentPage ? parentPage.href : `/dashboard/events/${eventId}`);
        } else {
          router.push("/dashboard");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableEscapeKey, currentPage, parentPage, eventId, router]);

  const backHref = currentPage
    ? parentPage
      ? parentPage.href
      : `/dashboard/events/${eventId}`
    : "/dashboard";

  const backLabel = currentPage
    ? parentPage
      ? `← ${parentPage.label}`
      : "← Retour à l'événement"
    : "← Mes événements";

  return (
    <nav
      aria-label="Fil d'Ariane et navigation"
      className={`flex items-center justify-between gap-3 text-xs sm:text-sm font-medium py-2 px-1 mb-4 sm:mb-6 flex-wrap select-none ${className}`}
    >
      {/* Fil d'Ariane */}
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-gray-500">
        <li className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="hover:text-black transition-colors flex items-center gap-1 text-[#8f6f33] font-semibold"
            title="Revenir au tableau de bord principal"
          >
            <Home size={13} className="shrink-0" />
            <span className="hidden sm:inline">Tableau de bord</span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </li>

        <li aria-hidden="true" className="text-gray-300">
          <ChevronRight size={13} />
        </li>

        <li className="flex items-center gap-1.5 min-w-0">
          {currentPage ? (
            <Link
              href={`/dashboard/events/${eventId}`}
              className="hover:text-black transition-colors text-gray-600 hover:underline truncate max-w-[140px] sm:max-w-xs font-serif"
              title={`Aperçu de ${eventName}`}
            >
              {eventName}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-md font-serif">
              {eventName}
            </span>
          )}
        </li>

        {parentPage && (
          <>
            <li aria-hidden="true" className="text-gray-300">
              <ChevronRight size={13} />
            </li>
            <li>
              <Link
                href={parentPage.href}
                className="hover:text-black transition-colors text-gray-600 hover:underline"
              >
                {parentPage.label}
              </Link>
            </li>
          </>
        )}

        {currentPage && (
          <>
            <li aria-hidden="true" className="text-gray-300">
              <ChevronRight size={13} />
            </li>
            <li className="text-black font-bold">
              <span>{currentPage}</span>
            </li>
          </>
        )}
      </ol>

      {/* Bouton d'échappement express (Retour) */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black border border-gray-200/80 transition-all active:scale-95 shrink-0 ml-auto cursor-pointer"
        title="Revenir en arrière (Raccourci clavier : Échap)"
      >
        <ArrowLeft size={13} className="text-[#8f6f33] shrink-0" />
        <span>{backLabel}</span>
        <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-white rounded border border-gray-200 text-[10px] text-gray-400 font-mono">
          Échap
        </kbd>
      </Link>
    </nav>
  );
}
