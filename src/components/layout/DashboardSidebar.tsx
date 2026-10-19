"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Home, 
  Calendar, 
  Send, 
  Users, 
  Store, 
  Wallet, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Lock,
  FileText
} from "lucide-react";
import { useEvents } from "@/store/EventsContext";
import { ContactSupportButton } from "../ContactSupportButton";
import { SidebarHeading, sidebarIconClass, sidebarLinkClass } from "./DashboardFrame";
import { badgeLabel, trackRsvpEvents, useBadgeStore } from "@/store/BadgeStore";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { events } = useEvents();
  const unreadMessages = useBadgeStore((s) => s.unreadMessages);
  const pendingDevis = useBadgeStore((s) => s.pendingDevis);
  const newRsvps = useBadgeStore((s) => s.newRsvps);
  const refreshBadges = useBadgeStore((s) => s.refresh);

  // Count new guest answers for every event of the organiser (from the first visit on)
  const eventIds = events.map((e) => e.id).join(",");
  useEffect(() => {
    if (!eventIds) return;
    trackRsvpEvents(eventIds.split(","));
    refreshBadges();
  }, [eventIds, refreshBadges]);

  return (
    <>
        
        {/* GLOBAL HUB MENU */}
        <div>
          <SidebarHeading>Vue Générale</SidebarHeading>
          <nav className="space-y-1">
            <SidebarLink href="/dashboard" icon={Home} label="Mon Espace" currentPath={pathname} exact />
            <SidebarLink href="/dashboard/devis" icon={FileText} label="Mes Devis" currentPath={pathname} badge={badgeLabel(pendingDevis)} />
            <SidebarLink href="/dashboard/messages" icon={Send} label="Messagerie Globale" currentPath={pathname} badge={badgeLabel(unreadMessages)} />
          </nav>
        </div>

        {/* EVENTS LIST */}
        <div>
          <SidebarHeading>Mes Événements</SidebarHeading>
          <nav className="space-y-1.5">
            {events.map((event) => {
              const isEventActive = pathname.includes(`/dashboard/events/${event.id}`);
              
              return (
                <div key={event.id} className="space-y-1">
                  <Link href={`/dashboard/events/${event.id}`} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isEventActive ? 'bg-white text-gray-900 shadow-sm ring-1 ring-[#b8924a]/30' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}>
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isEventActive ? 'bg-[#b8924a]' : 'bg-gray-300'}`} />
                      <span className="truncate">{event.name}</span>
                      {event.status === 'completed' && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] uppercase font-bold shrink-0">Clos</span>}
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {!isEventActive && newRsvps[event.id] > 0 && (
                        <span
                          aria-label={`${newRsvps[event.id]} nouvelle(s) réponse(s)`}
                          className="min-w-[20px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E53935] text-white shadow-sm"
                        >
                          {badgeLabel(newRsvps[event.id])}
                        </span>
                      )}
                      {isEventActive ? <ChevronDown size={14} /> : <ChevronRight size={14} className="text-gray-400" />}
                    </span>
                  </Link>
                  
                  {isEventActive && (
                    <div className="pl-3 space-y-0.5 mt-1.5 border-l border-[#b8924a]/30 ml-6 pb-2">
                      {event.plan === "Standard" ? (
                        <>
                          <SubLink href={`/dashboard/events/${event.id}`} label="Lien & QR Code Actif" currentPath={pathname} exact />
                          <SubLink href={`/dashboard/events/${event.id}/invitations`} label="Mon Invitation" currentPath={pathname} />
                          <SubLink href={`/dashboard/events/${event.id}`} label="Dashboard RSVP (Premium)" currentPath={pathname} locked={true} />
                          <SubLink href={`/dashboard/events/${event.id}`} label="Budget & Checklist (Gold)" currentPath={pathname} locked={true} />
                        </>
                      ) : (
                        <>
                          <SubLink href={`/dashboard/events/${event.id}`} label="Accueil / Aperçu" currentPath={pathname} exact />
                          <SubLink href={`/dashboard/events/${event.id}/invitations`} label="Invitations" currentPath={pathname} />
                          <SubLink href={`/dashboard/events/${event.id}/participants`} label="Invités & RSVP" currentPath={pathname} badge={badgeLabel(newRsvps[event.id] ?? 0)} />
                          
                          {/* GOLD Features - Locked if Premium */}
                          <SubLink href={`/dashboard/events/${event.id}/budget`} label="Budget" currentPath={pathname} locked={event.plan !== "Gold"} />
                          <SubLink href={`/dashboard/events/${event.id}/checklist`} label="Checklist / Tâches" currentPath={pathname} locked={event.plan !== "Gold"} />
                          <SubLink href={`/dashboard/events/${event.id}/prestataires`} label="Prestataires" currentPath={pathname} locked={event.plan !== "Gold"} />
                          
                          <SubLink href={`/dashboard/events/${event.id}/statistiques`} label="Statistiques" currentPath={pathname} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* SETTINGS */}
        <div className="mt-auto pt-4 border-t border-gray-100">
           <nav className="space-y-1">
             <SidebarLink href="/dashboard/settings" icon={Settings} label="Mon Profil" currentPath={pathname} />
             <div className="pt-2">
               <ContactSupportButton className="px-4 py-2.5 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-xl" />
             </div>
           </nav>
        </div>

    </>
  );
}

function SidebarLink({ href, icon: Icon, label, currentPath, exact = false, badge }: { href: string, icon: any, label: string, currentPath: string, exact?: boolean, badge?: string }) {
  const isActive = exact ? currentPath === href : currentPath.startsWith(href) && href !== '/dashboard';
  const finalIsActive = isActive || (href === '/dashboard' && currentPath === '/dashboard');

  return (
    <Link href={href} className={sidebarLinkClass(finalIsActive)}>
      <span className="flex items-center gap-3">
        <Icon size={19} strokeWidth={1.6} className={sidebarIconClass(finalIsActive)} /> {label}
      </span>
      {badge ? (
        <span
          aria-label={`${badge} non lu(s)`}
          className={`min-w-[20px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in ${finalIsActive ? 'bg-[#b8924a] text-[#241b13]' : 'bg-[#E53935] text-white'}`}
        >
          {badge}
        </span>
      ) : (
        finalIsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#b8924a]" />
      )}
    </Link>
  );
}

function SubLink({ href, label, currentPath, exact = false, locked = false, badge }: { href: string, label: string, currentPath: string, exact?: boolean, locked?: boolean, badge?: string }) {
  const isActive = exact ? currentPath === href : currentPath === href;
  
  if (locked) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 text-[13px] font-medium rounded-lg text-gray-300 cursor-not-allowed group relative">
        <span className="flex items-center gap-2">{label}</span>
        <Lock size={12} className="text-gray-300" />
        <div className="absolute left-full ml-2 hidden group-hover:block w-max bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded z-50 shadow-xl normal-case font-medium">
          Disponible avec la formule Gold
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className={`flex items-center justify-between px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${isActive ? 'text-[#9a7209] font-semibold bg-[#b8924a]/10' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}>
      <span>{label}</span>
      {badge && (
        <span aria-label={`${badge} nouveau(x)`} className="min-w-[20px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E53935] text-white shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}
