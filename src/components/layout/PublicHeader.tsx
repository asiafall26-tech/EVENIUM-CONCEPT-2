"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

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
      className="sticky top-0 z-50 bg-[#faf3e8]/90 backdrop-blur-xl transition-all after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#c9a45e]/60 after:to-transparent"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-5 min-w-0">
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/logo-horizontal-dark.png"
              alt="Evenium Logo"
              width={140}
              height={36}
              className="object-contain w-[88px] sm:w-[140px] h-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>
          <span aria-hidden className="h-7 sm:h-9 w-px bg-gradient-to-b from-transparent via-[#b8924a] to-transparent" />
          <Link
            href="/espace-prestataire"
            className="py-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.22em] text-[#2b1d12] hover:text-[#8f6f33] transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Espace </span>Prestataire
          </Link>
        </div>

        <Link
          href="/create"
          className="btn-lux shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3 text-[9.5px] sm:text-[11px] !tracking-[0.08em] sm:!tracking-[0.16em] !gap-1.5"
        >
          <span>Créer mon événement</span>
          <ArrowRight size={13} className="hidden sm:inline-block text-[#f0d999]" />
        </Link>
      </div>
    </header>
  );
}
