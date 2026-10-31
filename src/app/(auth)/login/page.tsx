"use client";

import { useState, Suspense } from "react";
import { ArrowRight, Eye, EyeOff, CalendarHeart, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Fleuron, LuxFrame } from "@/components/landing/LuxOrnaments";
import { login } from "../auth-actions";
import { useSearchParams } from "next/navigation";

const inputCls =
  "w-full bg-[#fffdf9] border border-[#e4d8c4] text-gray-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#b8924a]/25 focus:border-[#b8924a] outline-none transition-all";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const redirectTo = searchParams.get("redirectTo");

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

      <Link href="/" className="relative mb-8">
        <Image src="/logo-horizontal-dark.png" alt="Evenium" width={170} height={44} priority className="w-[150px] sm:w-[170px] h-auto object-contain" />
      </Link>

      <div className="card-lux relative w-full max-w-md p-7 sm:p-9">
        <LuxFrame className="inset-2.5" />
        <Fleuron className="mx-auto w-36 h-auto mb-2" />
        <h1 className="font-serif not-italic text-3xl sm:text-4xl text-center text-[#1d120a]">Bienvenue</h1>
        <p className="text-[#3d3126] text-sm text-center mt-2 mb-6">Connectez-vous à votre espace.</p>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">{errorMsg}</div>
        )}

        <form action={login} onSubmit={() => setIsLoading(true)} className="space-y-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse e-mail</span>
            <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" className={inputCls} />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</span>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-lux w-full py-4 text-xs sm:text-[13px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#f5eee1] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Se connecter <ArrowRight size={18} strokeWidth={1.5} className="text-[#f0d999]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Pas encore de compte : les deux parcours d'inscription à jour */}
      <div className="relative w-full max-w-md mt-6">
        <p className="text-center text-sm text-[#3d3126] mb-3">Pas encore de compte ?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={redirectTo ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/register"}
            className="card-lux !rounded-2xl flex items-center gap-3 px-4 py-3.5"
          >
            <CalendarHeart size={20} className="shrink-0 text-[#b8924a]" />
            <span className="text-sm font-semibold text-gray-900">J&apos;organise un événement</span>
          </Link>
          <Link
            href="/espace-prestataire/inscription"
            className="card-lux !rounded-2xl flex items-center gap-3 px-4 py-3.5"
          >
            <Store size={20} className="shrink-0 text-[#b8924a]" />
            <span className="text-sm font-semibold text-gray-900">Je suis prestataire</span>
          </Link>
        </div>
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
