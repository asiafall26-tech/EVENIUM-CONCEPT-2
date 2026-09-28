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

export default function PrestataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-8">
          <Link href="/prestataire" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Evenium Logo" width={120} height={40} className="object-contain" priority />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          <PrestataireSidebarNav />
        </div>

        <div className="p-6">
          <div className="bg-[#F9F5EC] rounded-2xl p-6 text-center shadow-sm relative overflow-hidden border border-[#E8D4A2]/50">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#B8860B] shadow-sm">
                <Headphones size={20} />
              </div>
            </div>
            <h4 className="font-semibold text-black mb-1">Besoin d'aide ?</h4>
            <p className="text-xs text-gray-600 mb-4 px-2">Notre équipe est là pour vous.</p>
            <button className="w-full py-2 bg-[#B8860B] hover:bg-[#996B00] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
              Nous contacter
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-black leading-tight">Espace Prestataire</h2>
            <p className="text-xs text-gray-500">Organisez. Collaborez. Créez des événements inoubliables.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell role="prestataire" />

            <UserMenu 
              name="Saveurs d'Afrique" 
              role="Traiteur" 
              initials="SP" 
              avatarColor="bg-[#B8860B] text-white" 
              profileHref="/prestataire/profil" 
            />
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
