import { Home as TabHome, Inbox as TabInbox, CalendarDays as TabPlanning, MessageSquare as TabMessages, User as TabUser } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import Link from "next/link";
import Image from "next/image";
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
  Bell,
  Headphones,
  ChevronDown
} from "lucide-react";
import { PrestataireSidebarNav } from "@/components/PrestataireSidebarNav";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { UserMenu } from "@/components/ui/UserMenu";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { activityFromProfile, hasActivityColumns, isActivityComplete } from "@/lib/providerProfile";

export default async function PrestataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/prestataire');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'client') {
    redirect('/dashboard');
  } else if (profile?.role === 'admin') {
    redirect('/admin');
  }

  // Prestataire certifié Evenium : types d'événements, prestations, pays et zones obligatoires
  // (contrôle actif dès que le script SQL a ajouté les colonnes)
  if (
    profile?.is_evenium_certified !== false &&
    hasActivityColumns(profile) &&
    !isActivityComplete(activityFromProfile(profile))
  ) {
    redirect('/prestataire-activite');
  }

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Prestataire";
  const initials = (fullName || "PR")
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "PR";

  return (
    <DashboardFrame
      mobileTabs={[
        { href: "/prestataire", label: "Accueil", icon: <TabHome size={21} />, exact: true },
        { href: "/prestataire/demandes", label: "Demandes", icon: <TabInbox size={21} />, badge: "pendingDemandes" },
        { href: "/prestataire/planning", label: "Planning", icon: <TabPlanning size={21} /> },
        { href: "/prestataire/messages", label: "Messages", icon: <TabMessages size={21} />, badge: "unreadMessages" },
        { href: "/prestataire/profil", label: "Profil", icon: <TabUser size={21} /> },
      ]}
      homeHref="/prestataire"
      badge="Pro"
      sidebar={<PrestataireSidebarNav />}
      sidebarFooter={
        <div className="relative overflow-hidden rounded-2xl bg-[#241b13] p-5 text-center shadow-[0_18px_40px_-20px_rgba(15,13,11,0.7)]">
          <div aria-hidden className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#b8924a]/25 blur-2xl" />
          <div className="relative flex justify-center mb-3">
            <div className="w-10 h-10 bg-[#b8924a]/15 ring-1 ring-[#b8924a]/30 rounded-full flex items-center justify-center text-[#b8924a]">
              <Headphones size={18} />
            </div>
          </div>
          <h4 className="relative font-serif text-lg text-white mb-1">Besoin d'aide ?</h4>
          <p className="relative text-xs text-white/55 mb-4 px-2">Notre équipe est là pour vous.</p>
          <button className="relative w-full py-2.5 bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#c9a24d] text-[#241b13] text-sm font-bold rounded-xl shadow-sm hover:brightness-105 transition">
            Nous contacter
          </button>
        </div>
      }
      header={
        <>
          <div className="min-w-0">
            <h2 className="font-serif text-base sm:text-lg text-gray-900 leading-tight truncate">Espace Prestataire</h2>
            <p className="hidden md:block text-xs text-gray-500">Organisez. Collaborez. Créez des événements inoubliables.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NotificationBell role="prestataire" />
            <span className="hidden sm:block w-px h-8 bg-gray-100" />
            <UserMenu
              name={fullName}
              role={profile?.role === 'client' ? "Organisateur" : "Prestataire"}
              initials={initials}
              avatarColor="bg-gradient-to-br from-[#b8924a] to-[#d9c08c] text-[#241b13]"
              profileHref="/prestataire/profil"
            />
          </div>
        </>
      }
    >
      {children}
    </DashboardFrame>
  );
}
