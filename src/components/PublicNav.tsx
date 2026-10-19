"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

interface PublicNavProps {
  onItemClick?: () => void;
  mobile?: boolean;
  user?: { id: string; role?: string } | null;
}

export function PublicNav({ onItemClick, mobile = false, user = null }: PublicNavProps) {
  const pathname = usePathname();

  const links = [
    { name: "Accueil", href: "/" },
    { name: "Nos services", href: "/#services" },
    { name: "Invitations", href: "/invitations" },
    { name: "Formules", href: "/#tarifs" },
    { name: "Espace Prestataire", href: "/espace-prestataire", special: true },
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1.5 py-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                link.special
                  ? "bg-[#b8924a]/10 text-[#8f6f33] border border-[#b8924a]/30 font-semibold"
                  : isActive
                  ? "bg-gray-100 text-gray-950 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
              }`}
            >
              <span>{link.name}</span>
              {link.special && <Sparkles size={15} className="text-[#b8924a]" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-0.5 bg-gray-100/70 p-1 rounded-full border border-gray-200/50 backdrop-blur-sm shadow-xs">
      {links.map((link) => {
        const isActive = pathname === link.href;

        if (link.special) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`ml-1 px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 border ${
                isActive
                  ? "bg-[#b8924a]/15 border-[#b8924a]/40 text-[#7a5e2b] shadow-xs"
                  : "bg-white/80 border-[#b8924a]/30 text-[#8f6f33] hover:bg-[#b8924a]/10 hover:border-[#b8924a]"
              }`}
            >
              <Sparkles size={13} className="text-[#b8924a]" />
              <span>{link.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 ${
              isActive
                ? "bg-white text-gray-900 font-semibold shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
