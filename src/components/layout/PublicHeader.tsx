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
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all"
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
      className="sticky top-0 z-50 bg-[#f5eee1]/90 backdrop-blur-xl border-b border-[#e4d8c4]/70 transition-all"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex items-center shrink-0 group">
          <Image
            src="/logo-horizontal-dark.png"
            alt="Evenium Logo"
            width={130}
            height={34}
            className="object-contain w-[92px] sm:w-[130px] h-auto transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <Link
            href="/espace-prestataire"
            className="px-1.5 sm:px-2 py-2 text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.08em] sm:tracking-[0.22em] text-gray-600 hover:text-[#8f6f33] transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Espace </span>Prestataire
          </Link>

          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-full bg-black border border-[#b8924a]/40 px-3 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.08em] sm:tracking-[0.2em] text-[#f5eee1] shadow-[0_6px_20px_-8px_rgba(43,33,24,0.45)] hover:border-[#b8924a] hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <span>Créer mon événement</span>
            <ArrowRight size={13} className="ml-1.5 hidden sm:inline-block text-[#d9c08c]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
