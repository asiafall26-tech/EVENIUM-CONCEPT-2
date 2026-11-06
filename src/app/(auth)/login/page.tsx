"use client";

import { useState, Suspense } from "react";
import { ArrowRight, Eye, EyeOff, CalendarHeart, Store, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Fleuron, LuxFrame } from "@/components/landing/LuxOrnaments";
import { login } from "../auth-actions";
import { useSearchParams } from "next/navigation";

const inputCls =
  "w-full bg-[#fffdf9] border border-[#e4d8c4] text-gray-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#b8924a]/25 focus:border-[#b8924a] outline-none transition-all placeholder:text-gray-400 text-sm";

function LoginForm() {
  const [role, setRole] = useState<"client" | "prestataire">("client");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const explicitRedirect = searchParams.get("redirectTo");

  const effectiveRedirect =
    explicitRedirect || (role === "prestataire" ? "/prestataire" : "/dashboard");

  return (
    <main
      className="theme-luxe bg-silk relative overflow-hidden min-h-dvh flex flex-col items-center justify-center px-4 font-sans text-gray-900"
      style={{
        paddingTop: "max(2rem, calc(env(safe-area-inset-top, 0px) + 1.5rem))",
        paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))",
      }}
    >
      <Image src="/hero/chandelier.png" alt="" aria-hidden width={268} height={124} className="absolute top-0 right-0 w-[55%] max-w-[420px] h-auto pointer-events-none" />
      <Image src="/hero/flowers.png" alt="" aria-hidden width={195} height={330} className="absolute bottom-0 right-0 w-[28%] max-w-[220px] h-auto pointer-events-none opacity-90" />

      <Link href="/" className="relative mb-6">
        <Image src="/logo-horizontal-dark.png" alt="Evenium" width={170} height={44} priority className="w-[150px] sm:w-[170px] h-auto object-contain" />
      </Link>

      <div className="card-lux relative w-full max-w-md p-6 sm:p-9 shadow-2xl">
        <LuxFrame className="inset-2.5" />
        <Fleuron className="mx-auto w-32 h-auto mb-2 opacity-90" />

        {/* Sélecteur de profil fluide Haute Couture */}
        <div className="relative z-10 flex p-1 mb-6 rounded-2xl bg-[#f2ebd9]/70 border border-[#d9c08c]/40">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              role === "client"
                ? "bg-[#281a10] text-[#f7e7b4] shadow-md"
                : "text-[#5c4939] hover:text-gray-900"
            }`}
          >
            <CalendarHeart size={15} />
            <span>Organisateur</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("prestataire")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              role === "prestataire"
                ? "bg-[#281a10] text-[#f7e7b4] shadow-md"
                : "text-[#5c4939] hover:text-gray-900"
            }`}
          >
            <Store size={15} />
            <span>Prestataire Pro</span>
          </button>
        </div>

        <div className="text-center relative z-10 mb-6">
          <h1 className="font-serif not-italic text-2xl sm:text-3xl text-[#1d120a] font-bold">
            {role === "prestataire" ? "Espace Prestataire" : "Bienvenue sur Evenium"}
          </h1>
          <p className="text-[#5c4939] text-xs sm:text-sm mt-1.5 leading-relaxed">
            {role === "prestataire"
              ? "Accédez à votre vitrine, vos devis et gérez vos boosts publicitaires."
              : "Connectez-vous pour suivre vos événements et vos invitations."}
          </p>
        </div>

        {errorMsg && (
          <div className="relative z-10 mb-5 p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form action={login} onSubmit={() => setIsLoading(true)} className="space-y-4 relative z-10">
          <input type="hidden" name="redirectTo" value={effectiveRedirect} />

          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Adresse e-mail {role === "prestataire" && "professionnelle"}
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={role === "prestataire" ? "contact@votre-agence.com" : "vous@exemple.com"}
              className={inputCls}
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-700">Mot de passe</span>
            </div>
            <span className="relative block">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-lux w-full py-3.5 sm:py-4 text-xs sm:text-[13px] font-bold tracking-wide mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#f5eee1] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight size={16} strokeWidth={2} className="text-[#f0d999]" />
              </>
            )}
          </button>
        </form>

        {role === "prestataire" ? (
          <div className="relative z-10 mt-6 pt-5 border-t border-[#d9c08c]/30 text-center">
            <p className="text-xs text-gray-600 mb-2">Vous n&apos;avez pas encore rejoint le réseau Evenium ?</p>
            <Link
              href="/espace-prestataire/inscription"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6f33] hover:text-[#5c4939] underline underline-offset-4"
            >
              <Sparkles size={13} /> Devenir Prestataire Partenaire
            </Link>
          </div>
        ) : (
          <div className="relative z-10 mt-6 pt-5 border-t border-[#d9c08c]/30 text-center">
            <p className="text-xs text-gray-600 mb-2">Pas encore de compte organisateur ?</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6f33] hover:text-[#5c4939] underline underline-offset-4"
            >
              <CalendarHeart size={13} /> Créer mon compte gratuit
            </Link>
          </div>
        )}
      </div>

      {/* Raccourci vers l'autre inscription */}
      <div className="relative w-full max-w-md mt-5 text-center">
        {role === "client" ? (
          <Link
            href="/espace-prestataire/inscription"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#5c4939] hover:text-gray-900 bg-white/70 hover:bg-white px-4 py-2 rounded-full border border-[#d9c08c]/40 transition-all shadow-2xs"
          >
            <Store size={14} className="text-[#8f6f33]" />
            <span>Vous êtes traiteur, photographe ou lieu ? <strong>Espace Pro</strong></span>
          </Link>
        ) : (
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#5c4939] hover:text-gray-900 bg-white/70 hover:bg-white px-4 py-2 rounded-full border border-[#d9c08c]/40 transition-all shadow-2xs"
          >
            <CalendarHeart size={14} className="text-[#8f6f33]" />
            <span>Vous organisez un mariage ou une fête ? <strong>Espace Client</strong></span>
          </Link>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center bg-[#faf8f4] text-stone-500 text-sm">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}
