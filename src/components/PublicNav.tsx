"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNav() {
  const pathname = usePathname();

  const links = [
    { name: "Accueil", href: "/" },
    { name: "Nos services", href: "/#services" },
    { name: "Invitations", href: "/invitations" },
    { name: "Formules", href: "/#tarifs" },
    { name: "Espace Prestataire", href: "/espace-prestataire", special: true },
  ];

  return (
    <nav className="flex items-center gap-1 text-sm font-medium">
      {links.map((link) => {
        const isActive = pathname === link.href;
        
        if (link.special) {
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`ml-2 px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1 border ${
                isActive 
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#B8860B]" 
                  : "bg-transparent border-[#D4AF37]/20 text-[#B8860B] hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/40"
              }`}
            >
              {link.name}
            </Link>
          );
        }

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`px-4 py-2 rounded-full transition-all duration-300 ${
              isActive 
                ? "bg-gray-100/80 text-gray-900 font-semibold" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
