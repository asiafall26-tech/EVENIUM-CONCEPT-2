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
import { ContactSupportButton } from "./ContactSupportButton";
import { SidebarHeading, sidebarIconClass, sidebarLinkClass } from "./layout/DashboardFrame";
import { badgeLabel, useBadgeStore } from "@/store/BadgeStore";

export function PrestataireSidebarNav() {
  const pathname = usePathname();
  // Kept up to date (realtime + polling) by NotificationProvider
  const pendingDemandes = useBadgeStore((s) => s.pendingDemandes);
  const unreadMessages = useBadgeStore((s) => s.unreadMessages);
  const unansweredReviews = useBadgeStore((s) => s.unansweredReviews);

  const links = [
    { name: "Tableau de bord", href: "/prestataire", icon: Home },
    { name: "Demandes & Devis", href: "/prestataire/demandes", icon: Inbox, badge: badgeLabel(pendingDemandes) },
    { name: "Mes événements", href: "/prestataire/evenements", icon: Calendar },
    { name: "Planning", href: "/prestataire/planning", icon: CalendarDays },
    { name: "Catalogue d'offres", href: "/prestataire/catalogue", icon: LayoutList },
    { name: "Messages", href: "/prestataire/messages", icon: MessageSquare, badge: badgeLabel(unreadMessages) },
    { name: "Finance", href: "/prestataire/finances", icon: Wallet },
    { name: "Mon profil", href: "/prestataire/profil", icon: User },
    { name: "Avis clients", href: "/prestataire/avis", icon: Star, badge: badgeLabel(unansweredReviews) },
    { name: "Paramètres", href: "/prestataire/settings", icon: Settings },
  ];

  return (
    <nav className="space-y-1">
      <SidebarHeading>Navigation</SidebarHeading>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={sidebarLinkClass(isActive)}
          >
            <div className="flex items-center gap-3 relative">
              <link.icon size={19} strokeWidth={1.6} className={sidebarIconClass(isActive)} /> 
              {link.name}
            </div>
            {link.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in ${isActive ? 'bg-[#b8924a] text-[#241b13]' : 'bg-[#E53935] text-white'}`}>
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
      
      <div className="pt-4 mt-4 border-t border-gray-100">
        <ContactSupportButton className="px-4 py-2.5 gap-3 hover:bg-white hover:shadow-sm" />
      </div>
    </nav>
  );
}
