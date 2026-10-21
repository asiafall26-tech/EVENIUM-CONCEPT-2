import { Home as TabHome, PlusCircle as TabNew, FileText as TabDevis, MessageSquare as TabMessages, User as TabUser } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Bell, Plus, ChevronDown } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { UserMenu } from "@/components/ui/UserMenu";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'prestataire') {
    redirect('/prestataire');
  } else if (profile?.role === 'admin') {
    redirect('/admin');
  }

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Organisateur";
  const initials = (fullName || "OR")
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "OR";

  return (
    <DashboardFrame
      mobileTabs={[
        { href: "/dashboard", label: "Accueil", icon: <TabHome size={21} />, exact: true },
        { href: "/dashboard/new", label: "Créer", icon: <TabNew size={21} /> },
        { href: "/dashboard/devis", label: "Devis", icon: <TabDevis size={21} />, badge: "pendingDevis" },
        { href: "/dashboard/messages", label: "Messages", icon: <TabMessages size={21} />, badge: "unreadMessages" },
        { href: "/dashboard/settings", label: "Compte", icon: <TabUser size={21} /> },
      ]}
      homeHref="/dashboard"
      badge="Client"
      sidebar={<DashboardSidebar />}
      header={
        <>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell role="client" />
            <span className="hidden sm:block w-px h-8 bg-gray-100" />
            <UserMenu
              name={fullName}
              role={profile?.role === 'prestataire' ? "Prestataire" : "Organisateur"}
              initials={initials}
              avatarColor="bg-[#241b13] text-[#b8924a] ring-2 ring-[#b8924a]/30"
              profileHref="/dashboard/settings"
            />
          </div>
        </>
      }
    >
      {children}
    </DashboardFrame>
  );
}
