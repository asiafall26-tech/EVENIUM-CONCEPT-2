"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Calendar, 
  FileText, 
  Store, 
  Users, 
  Wallet, 
  MessageSquare, 
  PieChart, 
  Settings
} from "lucide-react";

export function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    { name: "Tableau de bord", href: "/admin", icon: Home },
    { name: "Événements", href: "/admin/evenements", icon: Calendar },
    { name: "Support & Tickets", href: "/admin/demandes", icon: FileText, badge: "12" },
    { name: "Prestataires", href: "/admin/prestataires", icon: Store },
    { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { name: "Finances (SaaS)", href: "/admin/budget", icon: Wallet },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare, badge: "5" },
    { name: "Rapports", href: "/admin/rapports", icon: PieChart },
    { name: "Paramètres", href: "/admin/settings", icon: Settings },
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
                : "text-gray-400 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
            }`}
          >
            <div className="flex items-center gap-4">
              <link.icon size={20} strokeWidth={1.5} className={isActive ? "fill-white/20" : ""} /> {link.name}
            </div>
            {link.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-[#B8860B]' : 'bg-[#D4AF37] text-black'}`}>
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
