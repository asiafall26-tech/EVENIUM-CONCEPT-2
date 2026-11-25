"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Menu, Sparkles, Heart, Store, Calendar, ChevronRight, LayoutDashboard, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; role?: string; name?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        return;
      }
      const u = session.user;
      const role = u.user_metadata?.role || (u.email === "asiafall26@gmail.com" ? "admin" : "client");
      const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "";
      setUser({ id: u.id, role, name });
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const role = u.user_metadata?.role || (u.email === "asiafall26@gmail.com" ? "admin" : "client");
        const name = u.user_metadata?.full_name || u.email?.split("@")[0] || "";
        setUser({ id: u.id, role, name });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // In the event creation funnel, CreateStudio manages its own dedicated layout & navigation
  if (pathname.startsWith('/create')) {
    return null;
  }

  const dashboardHref =
    user?.role === "prestataire"
      ? "/prestataire"
      : user?.role === "admin"
        ? "/admin"
        : "/dashboard";

  const dashboardLabel =
    user?.role === "prestataire"
      ? "Espace Prestataire"
      : user?.role === "admin"
        ? "Admin"
        : "Mon Espace";

  return (
    <header
      className="sticky top-0 z-50 bg-[#faf3e8]/95 backdrop-blur-xl transition-all after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#c9a45e]/60 after:to-transparent"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Logo & Navigation gauche : les 4 services + prestataires */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/logo-horizontal-dark.png"
              alt="Evenium Logo"
              width={140}
              height={36}
              className="object-contain w-[82px] sm:w-[98px] md:w-[120px] lg:w-[136px] h-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          <span aria-hidden className="hidden md:block h-6 sm:h-7 w-px bg-gradient-to-b from-transparent via-[#b8924a] to-transparent shrink-0" />

          {/* Liens principaux affichés à partir de md: (tablettes larges et ordinateurs) : Les 4 Services épurés */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            {/* Service 1 : Invitations */}
            <Link
              href="/invitations?cat=invitations"
              className={`py-1.5 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-lg ${pathname === '/invitations' ? 'text-[#8f6f33] font-bold bg-[#b8924a]/10' : 'text-[#2b1d12] hover:text-[#8f6f33]'
                }`}
            >
              <span>🎉 Invitations</span>
            </Link>

            {/* Service 2 : Vœux */}
            <Link
              href="/invitations?cat=voeux"
              className={`py-1.5 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-lg ${pathname.startsWith('/voeux') ? 'text-[#8f6f33] font-bold bg-[#b8924a]/10' : 'text-[#2b1d12] hover:text-[#8f6f33]'
                }`}
            >
              <span>🎁 Vœux</span>
            </Link>

            {/* Service 3 : Mots doux */}
            <Link
              href="/invitations?cat=mots_doux"
              className={`py-1.5 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#9e1b23] hover:text-[#d62828] transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-1.5 rounded-lg ${pathname.startsWith('/mots-doux') ? 'font-bold bg-[#9e1b23]/10' : ''
                }`}
            >
              <span>💌 Mots doux</span>
            </Link>

            {/* Service 4 : Espace Couple */}
            <Link
              href="/invitations?cat=couple"
              className={`py-1.5 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#7a1c22] hover:text-[#d62828] transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-1.5 rounded-lg ${pathname.startsWith('/couple') ? 'font-bold bg-[#7a1c22]/10' : ''
                }`}
            >
              <span>❤️ Espace Couple</span>
            </Link>

            {/* Prestataires */}
            <Link
              href="/espace-prestataire"
              className="py-1.5 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#2b1d12] hover:text-[#8f6f33] transition-colors whitespace-nowrap shrink-0 rounded-lg"
            >
              <span>Prestataires</span>
            </Link>
          </nav>
        </div>

        {/* Côté droit : CTA Principal et Bouton Menu Mobile/Tablette */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {user ? (
            <Link
              href={dashboardHref}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#281a10] hover:bg-[#1a1008] text-[#f7e7b4] text-xs font-bold transition-all shadow-sm border border-[#b8924a]/40 group"
            >
              <LayoutDashboard size={14} className="text-[#c9a45e] transition-transform group-hover:scale-110" />
              <span>{dashboardLabel}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#2b1d12] hover:text-[#8f6f33] transition-colors"
            >
              <User size={14} />
              <span>Connexion</span>
            </Link>
          )}

          <Link
            href="/create"
            className="btn-lux shrink-0 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-2.5 text-[10px] sm:text-[11px] !tracking-[0.06em] sm:!tracking-[0.12em] !gap-1.5 whitespace-nowrap shadow-md"
          >
            <span>Créer mon événement</span>
            <ArrowRight size={13} className="hidden sm:inline-block text-[#f0d999]" />
          </Link>

          {/* Bouton Hamburger mobile / tablette */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu principal"
            className="md:hidden p-2 rounded-xl border border-[#c9a45e]/40 bg-[#fbf5ec] text-[#2b1d12] hover:bg-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant mobile raffiné Haute Couture présentant les 4 services sans prix */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf3e8] border-b border-[#c9a45e]/40 px-4 py-4 space-y-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Service 1 : Invitations événementielles */}
          <Link
            href="/invitations?cat=invitations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#e4d8c4] text-[#2b1d12] shadow-xs hover:border-[#b8924a] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2b1d12] group-hover:text-[#8f6f33]">
                  Invitations événementielles
                </p>
                <p className="text-[10px] text-gray-500 font-normal">
                  Invitation animée / Invitation statique
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400 group-hover:text-[#8f6f33] transition-colors" />
          </Link>

          {/* Service 2 : Vœux & Célébrations */}
          <Link
            href="/invitations?cat=voeux"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#e4d8c4] text-[#2b1d12] shadow-xs hover:border-[#b8924a] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎁</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2b1d12] group-hover:text-[#8f6f33]">
                  Vœux &amp; Célébrations
                </p>
                <p className="text-[10px] text-gray-500 font-normal">
                  Vœux chaleureux, félicitations et célébrations
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400 group-hover:text-[#8f6f33] transition-colors" />
          </Link>

          {/* Service 3 : Mots doux */}
          <Link
            href="/invitations?cat=mots_doux"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#eed7dc] text-[#9e1b23] shadow-xs hover:border-[#d62828] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💌</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#9e1b23] font-serif">
                  Mots doux
                </p>
                <p className="text-[10px] text-gray-500 font-normal font-sans">
                  Messages affectueux et attentions romantiques
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400 group-hover:text-[#d62828] transition-colors" />
          </Link>

          {/* Service 4 : Espace Couple */}
          <Link
            href="/invitations?cat=couple"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#eed7dc] text-[#7a1c22] shadow-xs hover:border-[#d62828] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">❤️</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7a1c22] font-serif">
                  Espace Couple
                </p>
                <p className="text-[10px] text-gray-500 font-normal font-sans">
                  Invitations secrètes et moments intimes à deux
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400 group-hover:text-[#d62828] transition-colors" />
          </Link>

          {/* Espace Prestataire (Pro) */}
          <Link
            href="/espace-prestataire"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#2a1b0f] to-[#120b06] text-[#fbf3e4] shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">
                <Store size={15} className="text-[#e2c178]" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#f0d999]">
                  Espace Prestataire (Pro)
                </p>
                <p className="text-[10px] text-gray-300 font-normal">
                  Proposez vos prestations et vos services
                </p>
              </div>
            </div>
            <ArrowRight size={15} className="text-[#f0d999]" />
          </Link>

          {/* Boutons d'action inférieurs mobile */}
          <div className="pt-2 border-t border-[#c9a45e]/30 flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-white/90 rounded-2xl border border-[#e4d8c4] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#281a10] text-[#f7e7b4] flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[170px]">
                        {user.name || "Compte connecté"}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-[#281a10] text-[#f7e7b4] text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <LayoutDashboard size={13} className="text-[#c9a45e]" />
                    <span>Ouvrir</span>
                  </Link>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[#281a10] text-[#f7e7b4] shadow-md flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard size={14} className="text-[#c9a45e]" />
                    <span>{dashboardLabel}</span>
                  </Link>
                  <Link
                    href="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[#b8924a] text-white shadow-md hover:bg-[#8f6f33] transition-colors"
                  >
                    Créer un événement
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl border border-gray-300 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 flex items-center justify-center gap-1.5"
                >
                  <User size={13} />
                  <span>Connexion</span>
                </Link>
                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[#b8924a] text-white shadow-md hover:bg-[#8f6f33] transition-colors"
                >
                  Créer un événement
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
