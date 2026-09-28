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
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-gray-800">
      {/* Sidebar - Dark Mode */}
      <aside className="w-64 bg-[#111111] text-gray-400 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex flex-col justify-center px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Evenium Logo" width={120} height={40} className="object-contain bg-white/90 rounded-md py-1 px-2 -ml-2" priority />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          <AdminSidebarNav />
        </div>

        <div className="p-6 pt-0">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#D4AF37]/20 relative overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl" />
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37]">
                👑
              </div>
            </div>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">
              Faisons de chaque<br/>événement une réussite !
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 justify-between shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un événement, un client, un prestataire..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-black transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <UserMenu 
              name="Super Admin" 
              role="Administrateur" 
              initials="SA" 
              avatarColor="bg-black text-white" 
              profileHref="/admin/settings" 
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
