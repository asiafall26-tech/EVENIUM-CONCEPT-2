"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { EveniumLogo } from "@/components/ui/EveniumLogo";

export interface DashboardFrameProps {
  children: React.ReactNode;
  homeHref?: string;
  badge?: string;
  sidebar: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  header?: React.ReactNode;
  variant?: "light" | "dark";
  sidebarVariant?: "light" | "dark";
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
}: DashboardFrameProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = variant === "dark";
  const isSidebarDark = sidebarVariant ? sidebarVariant === "dark" : isDark;

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#241b13] text-stone-100" : "bg-[#F8F7F4] text-stone-900"}`}>
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
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarDark
            ? "bg-[#0B0907] border-r border-[#b8924a]/25 shadow-2xl shadow-black/80"
            : "bg-[#fbf7f0] border-r border-stone-200/70 shadow-sm"
        }`}
      >
        {/* BRAND / LOGO AREA */}
        <div className={`h-20 shrink-0 px-5 flex items-center justify-between border-b ${
          isSidebarDark ? "border-[#b8924a]/20 bg-[#0B0907]" : "border-stone-200/60"
        }`}>
          <Link href={homeHref} className="flex items-center gap-2.5 group min-w-0">
            <EveniumLogo
              variant={isSidebarDark ? "dark" : "light"}
              format="horizontal"
              height={36}
              width={135}
              priority
            />
            {badge && (
              <span className={`text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
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
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${
              isSidebarDark
                ? "text-stone-300 hover:text-white hover:bg-white/10"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE SIDEBAR NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
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
          className={`sticky top-0 z-30 h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 border-b backdrop-blur-md ${
            isDark
              ? "bg-[#0B0907]/90 border-[#b8924a]/15"
              : "bg-white/85 border-stone-200/60 shadow-xs"
          }`}
        >
          {/* Mobile open drawer button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              isDark
                ? "text-stone-300 hover:bg-white/10 hover:text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Menu size={22} />
          </button>

          {/* Header custom content (search, notifications, profile menu) */}
          <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
            {header}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
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
