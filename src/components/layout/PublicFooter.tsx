"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p className="text-gray-500">© 2026 Evenium. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center gap-6">
          {user ? (
            <Link href={dashboardHref} className="text-gray-600 font-medium hover:text-black transition-colors flex items-center gap-2">
              <User size={16} />
              Tableau de bord
            </Link>
          ) : (
            <Link href="/login" className="text-gray-600 font-medium hover:text-black transition-colors flex items-center gap-2">
              <User size={16} />
              Se connecter
            </Link>
          )}
          <Link href="/espace-prestataire" className="text-gray-600 font-medium hover:text-black transition-colors">
            Espace Prestataire
          </Link>
          <Link href="/admin" className="text-gray-500 font-medium hover:text-black transition-colors">
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}
