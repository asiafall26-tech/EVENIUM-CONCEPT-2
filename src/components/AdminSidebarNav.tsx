"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, 
  Calendar, 
  FileText, 
  Store, 
  Users, 
  Wallet, 
  MessageSquare, 
  PieChart, 
  Settings,
  Bell,
  Music,
  Brush
} from "lucide-react";
import { SidebarHeading, sidebarIconClass, sidebarLinkClass } from "./layout/DashboardFrame";
import { getAdminAlertsAndAutoTerminate } from "@/app/admin/admin-actions";
import { badgeLabel, useBadgeStore } from "@/store/BadgeStore";

export function AdminSidebarNav({ dark = true }: { dark?: boolean }) {
  const pathname = usePathname();
  const unreadCount = useBadgeStore((s) => s.unreadMessages);
  const pendingSupport = useBadgeStore((s) => s.pendingSupport);
  const newPrestataires = useBadgeStore((s) => s.newPrestataires);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch active alerts count (reminders + auto-closures)
        const res = await getAdminAlertsAndAutoTerminate();
        if (res.stats) {
          setAlertsCount(res.stats.urgentReminders);
        }
      } catch (_) {}
    }
    loadData();
  }, []);

  const links: { name: string; href: string; icon: typeof Home; badge?: string; urgent?: boolean }[] = [
    { name: "Tableau de bord", href: "/admin", icon: Home },
    { name: "Alertes & Rappels", href: "/admin/alertes", icon: Bell, badge: badgeLabel(alertsCount) },
    { name: "Événements", href: "/admin/evenements", icon: Calendar },
    { name: "Support & Tickets", href: "/admin/support", icon: FileText, badge: badgeLabel(pendingSupport), urgent: true },
    { name: "Prestataires", href: "/admin/prestataires", icon: Store, badge: badgeLabel(newPrestataires), urgent: true },
    { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { name: "Finances & Revenus", href: "/admin/budget", icon: Wallet },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare, badge: badgeLabel(unreadCount), urgent: true },
    { name: "Studio des modèles", href: "/admin/modeles", icon: Brush },
    { name: "Banque de sons", href: "/admin/sons", icon: Music },
    { name: "Rapports", href: "/admin/rapports", icon: PieChart },
    { name: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  return (
    <nav className="space-y-1.5">
      <SidebarHeading dark={dark}>Administration</SidebarHeading>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={
              dark
                ? isActive
                  ? "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 bg-gradient-to-r from-[#b8924a] to-[#d9c08c] text-[#241b13] shadow-lg shadow-[#b8924a]/20"
                  : "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-stone-200 hover:text-white hover:bg-white/[0.08]"
                : sidebarLinkClass(isActive, false)
            }
          >
            <div className="flex items-center gap-3">
              <link.icon 
                size={19} 
                strokeWidth={1.7} 
                className={
                  dark
                    ? isActive 
                      ? "text-[#241b13] shrink-0" 
                      : "text-[#b8924a] shrink-0 group-hover:text-white transition-colors"
                    : sidebarIconClass(isActive, false)
                } 
              /> 
              <span>{link.name}</span>
            </div>
            {link.badge && (
              <span
                aria-label={`${link.badge} en attente`}
                className={`min-w-[20px] text-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-[#241b13] text-[#b8924a]'
                  : link.urgent
                    ? 'bg-[#E53935] text-white shadow-sm shadow-red-900/40 animate-in zoom-in'
                    : dark
                      ? 'bg-[#b8924a]/25 text-[#d9c08c]'
                      : 'bg-[#b8924a]/20 text-[#8f6f33]'
              }`}>
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
