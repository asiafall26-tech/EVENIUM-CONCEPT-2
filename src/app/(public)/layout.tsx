import Link from "next/link";
import Image from "next/image";
import { PublicNav } from "@/components/PublicNav";
import { User, Menu } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="Evenium Logo" width={110} height={36} className="object-contain transition-transform group-hover:scale-105" priority />
          </Link>
          
          <div className="hidden md:block">
            <PublicNav />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="hidden sm:flex items-center justify-center rounded-full bg-white border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition-all">
              Se connecter
            </Link>
            
            <Link href="/create" className="hidden sm:flex items-center justify-center rounded-full bg-gradient-to-r from-gray-900 to-black px-6 py-2.5 text-sm font-semibold text-[#D4AF37] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 transition-all">
              Créer mon événement
            </Link>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
      
      {children}

      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">© 2026 Evenium. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-gray-600 font-medium hover:text-black transition-colors flex items-center gap-2">
              <User size={16} />
              Espace Client
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
