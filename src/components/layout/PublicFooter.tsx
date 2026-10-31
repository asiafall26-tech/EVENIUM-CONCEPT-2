"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DiamondRule } from "@/components/landing/LuxOrnaments";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function PublicFooter() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; role?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user?.id) {
        setUser(null);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.id) {
          setUser({ id: data.user.id, role: profile.role });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    });
  }, []);

  // Hide the marketing footer during the creation funnel
  if (pathname.startsWith('/create')) {
    return null;
  }

  const dashboardHref =
    user?.role === "prestataire"
      ? "/prestataire"
      : user?.role === "admin"
      ? "/admin"
      : "/dashboard";

  return (
    <footer
      className="relative bg-gradient-to-b from-[#1f140b] to-[#120b06] text-[#e9dcc6] pt-14 pb-10 mt-auto"
      style={{
        paddingBottom: "max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a45e] to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center gap-6">
        <Image src="/logo-horizontal-light.png" alt="Evenium" width={150} height={38} className="w-[130px] h-auto object-contain" />
        <p className="font-serif italic text-lg text-[#e7c97f]">L’élite de l’événementiel</p>
        <DiamondRule />
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.2em]">
          {user ? (
            <Link href={dashboardHref} className="hover:text-[#f0d999] transition-colors flex items-center gap-2">
              <User size={14} className="text-[#c9a45e]" />
              Tableau de bord
            </Link>
          ) : (
            <Link href="/login" className="hover:text-[#f0d999] transition-colors flex items-center gap-2">
              <User size={14} className="text-[#c9a45e]" />
              Se connecter
            </Link>
          )}
          <Link href="/invitations" className="hover:text-[#f0d999] transition-colors">
            Modèles
          </Link>
          <Link href="/espace-prestataire" className="hover:text-[#f0d999] transition-colors">
            Espace Prestataire
          </Link>
          <Link href="/admin" className="text-[#e9dcc6]/60 hover:text-[#f0d999] transition-colors">
            Administration
          </Link>
        </nav>
        <p className="text-xs text-[#e9dcc6]/50">© 2026 Evenium. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
