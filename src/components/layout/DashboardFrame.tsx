"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { EveniumLogo } from "@/components/ui/EveniumLogo";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";

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
  // Le menu mobile se referme quand on change de page
  const [openedOn, setOpenedOn] = useState(pathname);
  if (mobileOpen && openedOn !== pathname) {
    setMobileOpen(false);
    setOpenedOn(pathname);
  }
  // Pas de défilement de la page derrière le menu ouvert
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);
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
        className={`fixed inset-y-0 left-0 z-50 w-[min(20.5rem,86vw)] sm:w-80 lg:w-72 h-dvh lg:h-auto pb-[env(safe-area-inset-bottom)] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
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
        {/* TOPBAR / HEADER */}
        <header
          className={`sticky top-0 z-30 h-16 sm:h-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 border-b backdrop-blur-md ${
            isDark
              ? "bg-[#0B0907]/90 border-[#b8924a]/15"
              : "bg-white/85 border-stone-200/60 shadow-xs"
          }`}
        >
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

          {/* Header custom content (search, notifications, profile menu) */}
          <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            {header}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className={`flex-1 min-w-0 px-3 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 overflow-x-hidden ${
            // Marge basse distincte : la barre d'onglets mobile ne doit jamais recouvrir le bas des pages
            mobileTabs?.length
              ? "pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8"
              : "pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-8"
          }`}
        >
          {children}
        </main>
        {mobileTabs?.length ? <MobileTabBar tabs={mobileTabs} dark={isDark} /> : null}
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
