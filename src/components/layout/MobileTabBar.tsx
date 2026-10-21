"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBadgeStore } from "@/store/BadgeStore";

export interface MobileTab {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Compteur affiché en pastille */
  badge?: "unreadMessages" | "pendingDemandes" | "pendingDevis" | "pendingSupport";
  /** Actif uniquement sur l'adresse exacte (page d'accueil d'un espace) */
  exact?: boolean;
}

/** Barre d'onglets fixée en bas de l'écran sur téléphone et petite tablette (masquée dès 1024 px). */
export function MobileTabBar({ tabs, dark = false }: { tabs: MobileTab[]; dark?: boolean }) {
  const pathname = usePathname();
  const counts = useBadgeStore();

  return (
    <nav
      aria-label="Navigation principale"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-xl pb-[env(safe-area-inset-bottom)] ${
        dark ? "bg-[#0B0907]/95 border-[#b8924a]/20" : "bg-white/95 border-stone-200/80 shadow-[0_-8px_24px_-16px_rgba(43,33,24,0.35)]"
      }`}
    >
      <ul className="flex items-stretch justify-around max-w-xl mx-auto">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
          const count = t.badge ? Number(counts[t.badge] ?? 0) : 0;
          return (
            <li key={t.href} className="flex-1 min-w-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 h-16 px-1 text-[10.5px] leading-none font-medium tracking-wide ${
                  active ? (dark ? "text-[#d9c08c]" : "text-[#8f6f33]") : dark ? "text-stone-400" : "text-stone-500"
                }`}
              >
                {active && <span aria-hidden className={`absolute top-0 inset-x-5 h-0.5 rounded-full ${dark ? "bg-[#d9c08c]" : "bg-[#b8924a]"}`} />}
                <span className="relative">
                  {t.icon}
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E53935] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                <span className="truncate max-w-full">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
