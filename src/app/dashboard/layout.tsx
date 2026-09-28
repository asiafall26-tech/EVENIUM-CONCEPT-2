import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Bell, Plus, ChevronDown } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { UserMenu } from "@/components/ui/UserMenu";
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
            
            <NotificationBell role="client" />

            <UserMenu 
              name="Ndeye Astou" 
              role="Organisatrice" 
              initials="NA" 
              avatarColor="bg-black text-white" 
              profileHref="/dashboard/settings" 
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
