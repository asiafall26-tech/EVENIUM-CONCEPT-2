"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Inbox, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CalendarDays, 
  User, 
  Star, 
  Settings,
  LayoutList,
  Wallet
} from "lucide-react";

export function PrestataireSidebarNav() {
  const pathname = usePathname();

  const links = [
    { name: "Tableau de bord", href: "/prestataire", icon: Home },
    { name: "Mes demandes", href: "/prestataire/demandes", icon: Inbox, badge: "3" },
    { name: "Messages", href: "/prestataire/messages", icon: MessageSquare },
    { name: "Mes prestations", href: "/prestataire/evenements", icon: Calendar },
    { name: "Devis", href: "/prestataire/devis", icon: FileText },
    { name: "Planning", href: "/prestataire/planning", icon: CalendarDays },
    { name: "Catalogue d'offres", href: "/prestataire/catalogue", icon: LayoutList },
    { name: "Finance", href: "/prestataire/finances", icon: Wallet },
    { name: "Mon profil", href: "/prestataire/profil", icon: User },
    { name: "Avis clients", href: "/prestataire/avis", icon: Star },
    { name: "Paramètres", href: "/prestataire/settings", icon: Settings },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
              isActive 
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
                : "text-gray-600 hover:bg-[#D4AF37]/5 hover:text-[#B8860B] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
            }`}
          >
            <div className="flex items-center gap-4">
              <link.icon size={20} strokeWidth={1.5} className={isActive ? "fill-white/20" : ""} /> {link.name}
            </div>
            {link.badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#E53935]' : 'bg-[#E53935] text-white'}`}>
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
