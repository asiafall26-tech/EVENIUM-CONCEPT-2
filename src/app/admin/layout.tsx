import { LayoutDashboard as TabHome, CalendarHeart as TabEvents, Store as TabProviders, MessageSquare as TabMessages, LifeBuoy as TabSupport } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import Link from "next/link";
import Image from "next/image";
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
  Search,
  Bell,
  ChevronDown,
  Plus
} from "lucide-react";
import { AdminSidebarNav } from "@/components/AdminSidebarNav";
import { UserMenu } from "@/components/ui/UserMenu";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'client') {
    redirect('/dashboard');
  } else if (profile?.role === 'prestataire') {
    redirect('/prestataire');
  } else if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Super Admin";
  const initials = (fullName || "SA")
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "SA";
  return (
    <DashboardFrame
      mobileTabs={[
        { href: "/admin", label: "Accueil", icon: <TabHome size={21} />, exact: true },
        { href: "/admin/evenements", label: "Événements", icon: <TabEvents size={21} /> },
        { href: "/admin/prestataires", label: "Prestataires", icon: <TabProviders size={21} /> },
        { href: "/admin/messages", label: "Messages", icon: <TabMessages size={21} />, badge: "unreadMessages" },
        { href: "/admin/support", label: "Support", icon: <TabSupport size={21} />, badge: "pendingSupport" },
      ]}
      variant="light"
      sidebarVariant="dark"
      homeHref="/admin"
      badge="Admin"
      sidebar={<AdminSidebarNav dark={true} />}
      sidebarFooter={
        <div className="relative overflow-hidden rounded-2xl bg-[#241b13] p-4 text-center shadow-lg border border-[#b8924a]/30">
          <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#b8924a]/20 rounded-full blur-2xl" />
          <div className="relative flex justify-center mb-2">
            <div className="w-9 h-9 bg-[#b8924a]/15 ring-1 ring-[#b8924a]/30 rounded-full flex items-center justify-center text-[#b8924a] text-base">
              👑
            </div>
          </div>
          <h4 className="relative font-serif text-sm font-bold text-white mb-0.5">Console Admin</h4>
          <p className="relative font-serif text-[13px] text-white/70 leading-relaxed">
            Faisons de chaque<br/>événement une réussite !
          </p>
        </div>
      }
      header={
        <>
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un événement, un client, un prestataire..."
              className="w-full bg-gray-50 border border-gray-200 shadow-xs rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30 focus:border-[#b8924a] focus:bg-white transition-all text-gray-900"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <NotificationBell role="admin" />
            <span className="hidden sm:block w-px h-8 bg-gray-200" />
            <UserMenu
              name="Super Admin"
              role="Administrateur"
              initials="SA"
              avatarColor="bg-[#241b13] text-[#b8924a] ring-2 ring-[#b8924a]/30"
              profileHref="/admin/settings"
            />
          </div>
        </>
      }
    >
      {children}
    </DashboardFrame>
  );
}
