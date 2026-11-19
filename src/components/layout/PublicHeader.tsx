"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Sparkles, Heart, Store, Calendar } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
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
        {/* Logo & Navigation gauche : les 3 services + prestataires visibles */}
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

          {/* Liens principaux affichés à partir de md: (tablettes larges et ordinateurs) : Les 4 Catégories + Prestataires sans prix */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2.5 shrink-0">
            {/* Catégorie 1 : Invitations Grands Événements */}
            <Link
              href="/invitations?cat=invitations"
              className={`py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.08em] lg:tracking-[0.12em] transition-colors whitespace-nowrap shrink-0 ${
                pathname === '/invitations' ? 'text-[#8f6f33] font-bold' : 'text-[#2b1d12] hover:text-[#8f6f33]'
              }`}
            >
              <span>Invitations</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            {/* Catégorie 2 : Vœux */}
            <Link
              href="/invitations?cat=voeux"
              className={`py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.08em] lg:tracking-[0.12em] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                pathname.startsWith('/voeux') ? 'text-[#8f6f33] font-bold' : 'text-[#2b1d12] hover:text-[#8f6f33]'
              }`}
            >
              <Sparkles size={11} className="text-[#b8924a]" />
              <span>Vœux</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            {/* Catégorie 3 : Mots Doux */}
            <Link
              href="/invitations?cat=mots_doux"
              className={`py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.08em] lg:tracking-[0.12em] text-[#9e1b23] hover:text-[#d62828] transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-1 ${
                pathname.startsWith('/mots-doux') ? 'font-bold' : ''
              }`}
            >
              <Heart size={11} className="text-[#d62828]" />
              <span>Mots Doux</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            {/* Catégorie 4 : Invitations Couple */}
            <Link
              href="/invitations?cat=couple"
              className={`py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.08em] lg:tracking-[0.12em] text-[#7a1c22] hover:text-[#d62828] transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-1 ${
                pathname.startsWith('/couple') ? 'font-bold' : ''
              }`}
            >
              <span>Invitations Couple</span>
            </Link>

            <span aria-hidden className="h-3.5 lg:h-4 w-px bg-[#b8924a]/30 shrink-0" />

            {/* Prestataires */}
            <Link
              href="/espace-prestataire"
              className="py-1.5 px-2 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.08em] lg:tracking-[0.12em] text-[#2b1d12] hover:text-[#8f6f33] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Prestataires</span>
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
        </div>
      </div>

      {/* Sur téléphone : Barre de navigation directe des 4 catégories sans aucun prix */}
      <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#faf3e8]/95 border-t border-[#c9a45e]/20 overflow-x-auto no-scrollbar scroll-smooth">
        <Link
          href="/invitations?cat=invitations"
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${pathname === '/invitations'
              ? 'bg-[#2b1d12] text-[#f0d999] shadow-xs'
              : 'bg-white/90 border border-[#c9a45e]/40 text-[#2b1d12]'
            }`}
        >
          <Calendar size={11} className="text-[#b8924a]" /> Invitations
        </Link>

        <Link
          href="/invitations?cat=voeux"
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${pathname.startsWith('/voeux')
              ? 'bg-[#2b1d12] text-[#f0d999] shadow-xs'
              : 'bg-white/90 border border-[#c9a45e]/40 text-[#2b1d12]'
            }`}
        >
          <Sparkles size={11} className="text-[#b8924a]" /> Vœux
        </Link>

        <Link
          href="/invitations?cat=mots_doux"
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${pathname.startsWith('/mots-doux') || pathname.startsWith('/couple')
              ? 'bg-[#9e1b23] text-white shadow-xs'
              : 'bg-white/90 border border-[#f4c2c9] text-[#9e1b23]'
            }`}
        >
          <Heart size={11} className="text-[#e63946]" /> Mots Doux
        </Link>

        <Link
          href="/invitations?cat=couple"
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${pathname.startsWith('/couple')
              ? 'bg-[#7a1c22] text-white shadow-xs'
              : 'bg-white/90 border border-[#f4c2c9] text-[#7a1c22]'
            }`}
        >
          <span>Couple</span>
        </Link>

        <Link
          href="/espace-prestataire"
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1 bg-[#2a1b0f] text-[#f0d999]"
        >
          <Store size={11} className="text-[#e2c178]" /> Prestataires
        </Link>
      </div>

    </header>
  );
}
