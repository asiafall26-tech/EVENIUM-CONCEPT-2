"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Menu, Sparkles, Heart, Store, Calendar, LogIn } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In the event creation funnel, render a clean, distraction-free header without marketing navigation
  if (pathname.startsWith('/create')) {
    return (
      <header
        className="sticky top-0 z-40 bg-[#faf3e8]/90 backdrop-blur-md transition-all after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#c9a45e]/60 after:to-transparent"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-horizontal-dark.png"
              alt="Evenium Logo"
              width={120}
              height={30}
              className="object-contain w-[96px] sm:w-[120px] h-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-black hover:bg-gray-100 transition-all border border-gray-200/60"
          >
            <span>Quitter</span>
            <X size={14} />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-50 bg-[#faf3e8]/95 backdrop-blur-xl transition-all after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#c9a45e]/60 after:to-transparent"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Logo & Navigation gauche avec protection anti-débordement tablette */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/logo-horizontal-dark.png"
              alt="Evenium Logo"
              width={140}
              height={36}
              className="object-contain w-[82px] sm:w-[98px] md:w-[120px] lg:w-[136px] h-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          <span aria-hidden className="hidden md:block h-6 sm:h-7 w-px bg-gradient-to-b from-transparent via-[#b8924a] to-transparent shrink-0" />

          {/* Liens principaux affichés à partir de md: (tablettes larges et ordinateurs) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 shrink-0">
            <Link
              href="/voeux"
              className="py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.1em] lg:tracking-[0.16em] text-[#2b1d12] hover:text-[#8f6f33] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Vœux</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            <Link
              href="/mots-doux"
              className="py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.1em] lg:tracking-[0.16em] text-[#9e1b23] hover:text-[#d62828] transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-1"
            >
              <span>Mots Doux</span>
              <span className="hidden xl:inline text-[11px]">❤️</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            <Link
              href="/espace-prestataire"
              className="py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.1em] lg:tracking-[0.16em] text-[#2b1d12] hover:text-[#8f6f33] transition-colors whitespace-nowrap shrink-0"
            >
              <span className="hidden xl:inline">Espace </span>Prestataires
            </Link>
          </nav>
        </div>

        {/* Côté droit : CTA Principal et Bouton Menu Mobile/Tablette */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Link
            href="/create"
            className="btn-lux shrink-0 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-2.5 text-[10px] sm:text-[11px] !tracking-[0.06em] sm:!tracking-[0.12em] !gap-1.5 whitespace-nowrap shadow-md"
          >
            <span>Créer mon événement</span>
            <ArrowRight size={13} className="hidden sm:inline-block text-[#f0d999]" />
          </Link>

          {/* Bouton Hamburger pour mobile et tablette (visible jusqu'à md:) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu de navigation"
            className="md:hidden p-2 rounded-xl border border-[#c9a45e]/40 bg-[#fbf5ec] text-[#2b1d12] hover:bg-white transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant mobile & tablette raffiné Haute Couture */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf3e8] border-b border-[#c9a45e]/40 px-4 py-4 space-y-2.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/voeux"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4d8c4] text-[#2b1d12] text-xs font-semibold uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#b8924a]" /> Vœux d&apos;Exception
            </span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>

          <Link
            href="/mots-doux"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4d8c4] text-[#9e1b23] text-xs font-semibold uppercase tracking-wider font-serif"
          >
            <span className="flex items-center gap-2">
              <Heart size={15} className="text-[#d62828]" /> Les Mots Doux ❤️
            </span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>

          <Link
            href="/invitations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4d8c4] text-[#2b1d12] text-xs font-semibold uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-[#b8924a]" /> Modèles d&apos;Invitation
            </span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>

          <Link
            href="/espace-prestataire"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#2a1b0f] to-[#120b06] text-[#fbf3e4] text-xs font-semibold uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <Store size={15} className="text-[#e2c178]" /> Espace Prestataire (Pro)
            </span>
            <ArrowRight size={14} className="text-[#f0d999]" />
          </Link>

          <div className="pt-2 border-t border-[#c9a45e]/30 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl border border-gray-300 bg-white text-gray-800"
            >
              Connexion
            </Link>
            <Link
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl bg-[#b8924a] text-white"
            >
              Créer un événement
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
