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
    <nav className="hidden md:flex gap-4 text-sm font-medium">
      {links.map((link) => {
        const isActive = pathname === link.href;
        
        if (link.special) {
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1 ${
                isActive 
                  ? "bg-[#D4AF37]/10 text-[#B8860B] font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                  : "text-[#B8860B] font-semibold hover:bg-[#D4AF37]/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
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
                ? "bg-gray-100 text-black font-bold shadow-[0_0_15px_rgba(0,0,0,0.05)]" 
                : "text-gray-600 hover:text-black hover:bg-gray-50 hover:shadow-[0_0_10px_rgba(0,0,0,0.05)]"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
