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
    .single();

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
      homeHref="/dashboard"
      badge="Client"
      sidebar={<DashboardSidebar />}
      header={
        <>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell role="client" />
            <span className="w-px h-8 bg-gray-100" />
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
