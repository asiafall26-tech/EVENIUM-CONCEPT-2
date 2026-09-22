import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Bell, Plus, ChevronDown } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-gray-800">
      {/* Dynamic Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 justify-between shrink-0">
          <div className="flex-1" />
          
          <div className="flex items-center gap-6">
            
            <button className="relative text-gray-500 hover:text-black transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">
                NA
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-black leading-tight">Ndeye Astou</p>
                <p className="text-xs text-gray-500">Organisatrice</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
