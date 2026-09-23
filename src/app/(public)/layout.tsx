import Link from "next/link";
import Image from "next/image";
import { PublicNav } from "@/components/PublicNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Evenium Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          
          <PublicNav />
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-50">
              Connexion
            </Link>
            <Link href="/create" className="flex items-center justify-center rounded-full bg-[#111111] px-6 py-2.5 text-sm font-semibold text-[#D4AF37] hover:bg-black hover:shadow-md transition-all border border-transparent hover:border-[#D4AF37]/30">
              Créer un événement
            </Link>
          </div>
        </div>
      </header>
      
      {children}

      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 Evenium. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
