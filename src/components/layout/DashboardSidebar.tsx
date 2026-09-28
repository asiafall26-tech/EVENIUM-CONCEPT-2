"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Lock
} from "lucide-react";
import { useEvents } from "@/store/EventsContext";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { events } = useEvents();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex shrink-0">
      <div className="h-20 flex items-center px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Evenium Logo" width={120} height={40} className="object-contain" priority />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 px-4">
        
        {/* GLOBAL HUB MENU */}
        <div>
          <div className="mb-2 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vue Générale</h3>
          </div>
          <nav className="space-y-1">
            <SidebarLink href="/dashboard" icon={Home} label="Mon Espace" currentPath={pathname} exact />
            <SidebarLink href="/dashboard/messages" icon={Send} label="Messagerie Globale" currentPath={pathname} />
          </nav>
        </div>

        {/* EVENTS LIST */}
        <div>
          <div className="mb-2 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mes Événements</h3>
          </div>
          <nav className="space-y-3">
            {events.map((event) => {
              const isEventActive = pathname.includes(`/dashboard/events/${event.id}`);
              
              return (
                <div key={event.id} className="space-y-1">
                  <Link href={`/dashboard/events/${event.id}`} className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isEventActive ? 'bg-[#F9F5EC] text-[#B8860B]' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="truncate">{event.name}</span>
                      {event.status === 'completed' && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] uppercase font-bold shrink-0">Clos</span>}
                    </div>
                    {isEventActive ? <ChevronDown size={14} /> : <ChevronRight size={14} className="text-gray-400" />}
                  </Link>
                  
                  {isEventActive && (
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-gray-100 ml-4 pb-2">
                      <SubLink href={`/dashboard/events/${event.id}`} label="Aperçu" currentPath={pathname} exact />
                      <SubLink href={`/dashboard/events/${event.id}/invitations`} label="Mon invitation" currentPath={pathname} />
                      <SubLink href={`/dashboard/events/${event.id}/participants`} label="Mes invités (RSVP)" currentPath={pathname} />
                      
                      {/* GOLD Features - Locked if Premium */}
                      <SubLink href={`/dashboard/events/${event.id}/budget`} label="Budget" currentPath={pathname} locked={event.plan !== "Gold"} />
                      <SubLink href={`/dashboard/events/${event.id}/checklist`} label="Checklist / Tâches" currentPath={pathname} locked={event.plan !== "Gold"} />
                      <SubLink href={`/dashboard/events/${event.id}/prestataires`} label="Prestataires" currentPath={pathname} locked={event.plan !== "Gold"} />
                      <SubLink href={`/dashboard/events/${event.id}/messages`} label="Messagerie" currentPath={pathname} locked={event.plan !== "Gold"} />
                      
                      <SubLink href={`/dashboard/events/${event.id}/settings`} label="Paramètres" currentPath={pathname} />
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
           </nav>
        </div>

      </div>
    </aside>
  );
}

function SidebarLink({ href, icon: Icon, label, currentPath, exact = false }: { href: string, icon: any, label: string, currentPath: string, exact?: boolean }) {
  const isActive = exact ? currentPath === href : currentPath.startsWith(href) && href !== '/dashboard';
  const finalIsActive = isActive || (href === '/dashboard' && currentPath === '/dashboard');

  if (finalIsActive) {
    return (
      <Link href={href} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-md font-medium transition-colors text-sm">
        <Icon size={20} strokeWidth={1.5} className="fill-white/20" /> {label}
      </Link>
    );
  }

  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black font-medium transition-colors text-sm">
      <Icon size={20} strokeWidth={1.5} /> {label}
    </Link>
  );
}

function SubLink({ href, label, currentPath, exact = false, locked = false }: { href: string, label: string, currentPath: string, exact?: boolean, locked?: boolean }) {
  const isActive = exact ? currentPath === href : currentPath === href;
  
  if (locked) {
    return (
      <div className="flex items-center justify-between px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg text-gray-300 cursor-not-allowed group relative">
        <span className="flex items-center gap-2">{label}</span>
        <Lock size={12} className="text-gray-300" />
        <div className="absolute left-full ml-2 hidden group-hover:block w-max bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded z-50 shadow-xl normal-case font-medium">
          Disponible avec la formule Gold
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className={`block px-4 py-2 text-xs font-medium rounded-lg transition-colors ${isActive ? 'text-[#B8860B] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
      {label}
    </Link>
  );
}
