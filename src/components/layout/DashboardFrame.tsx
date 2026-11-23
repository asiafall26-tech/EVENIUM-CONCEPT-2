"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";
import { EveniumLogo } from "@/components/ui/EveniumLogo";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";

function getParentRoute(path: string): { href: string; label: string } | null {
  if (!path) return null;
  // Pages d'accueil racines (pas de retour nécessaire)
  if (path === "/dashboard" || path === "/prestataire" || path === "/admin") return null;

  // 1. Sous-pages d'un événement (/dashboard/events/[id]/...)
  const eventSubMatch = path.match(/^\/dashboard\/events\/([^/]+)\/(.+)$/);
  if (eventSubMatch) {
    const eventId = eventSubMatch[1];
    const sub = eventSubMatch[2];
    if (sub.startsWith("prestataires/catalogue")) {
      return { href: `/dashboard/events/${eventId}/prestataires`, label: "Mes Prestataires" };
    }
    return { href: `/dashboard/events/${eventId}`, label: "Événement" };
  }

  // 2. Vue globale d'un événement (/dashboard/events/[id])
  const eventOverviewMatch = path.match(/^\/dashboard\/events\/([^/]+)$/);
  if (eventOverviewMatch) {
    return { href: "/dashboard", label: "Mes événements" };
  }

  // 3. Devis client (/dashboard/devis/[id])
  if (path.match(/^\/dashboard\/devis\/[^/]+$/)) {
    return { href: "/dashboard/devis", label: "Mes devis" };
  }

  // 4. Autres sections client (/dashboard/...)
  if (path.startsWith("/dashboard/")) {
    return { href: "/dashboard", label: "Mon Espace" };
  }

  // 5. Sous-pages devis prestataire
  if (path.includes("/prestataire/devis/builder") || path.match(/^\/prestataire\/devis\/[^/]+$/)) {
    return { href: "/prestataire/demandes", label: "Demandes" };
  }

  // 6. Autres sections prestataire (/prestataire/...)
  if (path.startsWith("/prestataire/")) {
    return { href: "/prestataire", label: "Tableau de bord" };
  }

  // 7. Sous-pages administration
  if (path.match(/^\/admin\/evenements\/[^/]+$/)) {
    return { href: "/admin/evenements", label: "Événements" };
  }
  if (path.match(/^\/admin\/prestataires\/[^/]+$/)) {
    return { href: "/admin/prestataires", label: "Prestataires" };
  }
  if (path.match(/^\/admin\/utilisateurs\/[^/]+$/)) {
    return { href: "/admin/utilisateurs", label: "Utilisateurs" };
  }
  if (path.startsWith("/admin/")) {
    return { href: "/admin", label: "Accueil Admin" };
  }

  return null;
}

export interface DashboardFrameProps {
  children: React.ReactNode;
  homeHref?: string;
  badge?: string;
  sidebar: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  header?: React.ReactNode;
  variant?: "light" | "dark";
  sidebarVariant?: "light" | "dark";
  /** Onglets de la barre fixée en bas de l'écran sur mobile */
  mobileTabs?: MobileTab[];
}

export function DashboardFrame({
  children,
  homeHref = "/",
  badge,
  sidebar,
  sidebarFooter,
  header,
  variant = "light",
  sidebarVariant,
  mobileTabs,
}: DashboardFrameProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const parentRoute = getParentRoute(pathname);

  // Le menu mobile se referme quand on change de page
  const [openedOn, setOpenedOn] = useState(pathname);
  if (mobileOpen && openedOn !== pathname) {
    setMobileOpen(false);
    setOpenedOn(pathname);
  }

  // Échappement universel au clavier avec la touche Échap
  useEffect(() => {
    if (!parentRoute) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape") {
        router.push(parentRoute.href);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [parentRoute, router]);
  // Pas de défilement de la page derrière le menu ouvert
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);
  // Support pour ouvrir le menu latéral depuis n'importe quel composant (ex: barre messagerie mobile)
  useEffect(() => {
    const handleOpen = () => setMobileOpen(true);
    window.addEventListener("evenium:open-sidebar", handleOpen);
    return () => window.removeEventListener("evenium:open-sidebar", handleOpen);
  }, []);

  const isDark = variant === "dark";
  const isSidebarDark = sidebarVariant ? sidebarVariant === "dark" : isDark;

  return (
    <div className={`min-h-dvh flex ${isDark ? "bg-[#241b13] text-stone-100" : "bg-[#F8F7F4] text-stone-900"}`}>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER (DESKTOP + MOBILE DRAWER) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(20.5rem,86vw)] sm:w-80 lg:w-72 h-dvh lg:h-auto pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarDark
            ? "bg-[#0B0907] border-r border-[#b8924a]/25 shadow-2xl shadow-black/80"
            : "bg-[#fbf7f0] border-r border-stone-200/70 shadow-sm"
        }`}
      >
        {/* BRAND / LOGO AREA */}
        <div className={`h-20 shrink-0 px-4 sm:px-5 flex items-center justify-between gap-3 border-b ${
          isSidebarDark ? "border-[#b8924a]/20 bg-[#0B0907]" : "border-stone-200/60"
        }`}>
          <Link href={homeHref} className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink">
            <EveniumLogo
              variant={isSidebarDark ? "dark" : "light"}
              format="horizontal"
              height={32}
              width={120}
              priority
            />
            {badge && (
              <span className={`text-[9px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
                isSidebarDark
                  ? "bg-[#b8924a]/20 text-[#b8924a] border-[#b8924a]/40 shadow-xs"
                  : "bg-[#b8924a]/15 text-[#9a7209] border-[#b8924a]/30"
              }`}>
                {badge}
              </span>
            )}
          </Link>

          {/* Close mobile button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className={`lg:hidden shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
              isSidebarDark
                ? "text-stone-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10"
                : "text-stone-600 hover:text-stone-900 bg-stone-200/70 hover:bg-stone-200 border border-stone-300/50"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* SCROLLABLE SIDEBAR NAVIGATION */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-6"
          onClick={(e) => {
            // Un lien du menu ferme le tiroir sur mobile
            if ((e.target as HTMLElement).closest("a")) setMobileOpen(false);
          }}
        >
          {sidebar}
        </div>

        {/* SIDEBAR FOOTER (IF PROVIDED) */}
        {sidebarFooter && (
          <div className="p-4 pt-0 shrink-0">
            {sidebarFooter}
          </div>
        )}
      </aside>

      {/* MAIN WRAPPER (HEADER + CONTENT) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR / HEADER (Masquée sur mobile pour la messagerie afin d'éviter le double en-tête et offrir le plein écran) */}
        <header
          className={`sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 border-b backdrop-blur-md transition-all ${
            pathname?.includes("/messages") ? "hidden md:flex" : "flex"
          } ${
            isDark
              ? "bg-[#0B0907]/90 border-[#b8924a]/15"
              : "bg-white/85 border-stone-200/60 shadow-xs"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            minHeight: "calc(4rem + env(safe-area-inset-top, 0px))",
          }}
        >
          {/* Section gauche : Bouton Menu mobile + Bouton Retour Échappement universel */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile open drawer button */}
            <button
              type="button"
              onClick={() => {
                setOpenedOn(pathname);
                setMobileOpen(true);
              }}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                isDark
                  ? "text-stone-300 hover:bg-white/10 hover:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Menu size={22} />
            </button>

            {/* Bouton d'échappement / Retour universel fixé en haut pour ne jamais être bloqué */}
            {parentRoute && (
              <Link
                href={parentRoute.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 border cursor-pointer ${
                  isDark
                    ? "bg-[#b8924a]/15 hover:bg-[#b8924a]/25 text-[#f5eee1] border-[#b8924a]/30 shadow-xs"
                    : "bg-[#fbf7f0] hover:bg-[#f5eee1] text-[#7a5e2b] border-[#b8924a]/30 shadow-xs"
                }`}
                title={`Revenir à : ${parentRoute.label} (Raccourci : Échap)`}
              >
                <ArrowLeft size={13} className="text-[#b8924a] shrink-0" strokeWidth={2.2} />
                <span className="hidden sm:inline">Retour : {parentRoute.label}</span>
                <span className="sm:hidden font-bold">Retour</span>
              </Link>
            )}
          </div>

          {/* Header custom content (search, notifications, profile menu) */}
          <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            {header}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className={
            pathname?.includes("/messages")
              ? "flex-1 min-w-0 min-h-0 flex flex-col p-0 overflow-hidden h-dvh md:h-[calc(100dvh-5rem)]"
              : `flex-1 min-w-0 px-3 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 overflow-x-hidden ${
                  mobileTabs?.length
                    ? "pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8"
                    : "pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:pb-8"
                }`
          }
        >
          {children}
        </main>
        {mobileTabs?.length && !pathname?.includes("/messages") ? <MobileTabBar tabs={mobileTabs} dark={isDark} /> : null}
      </div>
    </div>
  );
}

export function SidebarHeading({
  children,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <h3
      className={`text-[11px] font-bold tracking-wider uppercase px-3.5 mb-2 ${
        dark ? "text-[#b8924a] font-mono" : "text-stone-600 font-mono font-bold"
      } ${className}`}
    >
      {children}
    </h3>
  );
}

export function sidebarLinkClass(isActive: boolean, dark = false): string {
  if (dark) {
    return isActive
      ? "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 bg-gradient-to-r from-[#b8924a] to-[#d9c08c] text-[#241b13] shadow-lg shadow-[#b8924a]/20"
      : "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-stone-200 hover:text-white hover:bg-white/[0.09]";
  }

  return isActive
    ? "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 bg-white text-stone-950 shadow-md ring-2 ring-[#b8924a]/50"
    : "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-white hover:shadow-xs";
}

export function sidebarIconClass(isActive: boolean, dark = false): string {
  if (dark) {
    return isActive
      ? "text-[#241b13] shrink-0"
      : "text-[#b8924a] shrink-0 group-hover:text-white transition-colors";
  }

  return isActive
    ? "text-[#8f6f33] shrink-0"
    : "text-stone-600 shrink-0 group-hover:text-stone-900 transition-colors";
}
