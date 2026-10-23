"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Eye, EyeOff, CalendarHeart, Store } from "lucide-react";
import Link from "next/link";
import { login } from "../auth-actions";
import { useSearchParams } from "next/navigation";

const inputCls =
  "w-full bg-white border border-[#e4d8c4] text-gray-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#b8924a]/25 focus:border-[#b8924a] outline-none transition-all";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const redirectTo = searchParams.get("redirectTo");

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[#faf8f4] px-4 py-10 font-sans text-gray-900">
      <Link href="/" className="inline-flex items-center gap-2 text-[#b8924a] font-serif text-3xl mb-8">
        <Sparkles size={24} /> Evenium
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e4d8c4] shadow-sm p-6 sm:p-8">
        <h1 className="font-serif text-3xl text-center">Bienvenue</h1>
        <p className="text-gray-500 text-sm text-center mt-1 mb-6">Connectez-vous à votre espace.</p>

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
            className="w-full bg-[#2b2118] hover:bg-black text-[#f5eee1] font-semibold py-4 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#f5eee1] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Se connecter <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Pas encore de compte : les deux parcours d'inscription à jour */}
      <div className="w-full max-w-md mt-6">
        <p className="text-center text-sm text-gray-500 mb-3">Pas encore de compte ?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={redirectTo ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/register"}
            className="flex items-center gap-3 rounded-2xl border border-[#e4d8c4] bg-white px-4 py-3.5 hover:border-[#b8924a]"
          >
            <CalendarHeart size={20} className="shrink-0 text-[#b8924a]" />
            <span className="text-sm font-semibold text-gray-900">J&apos;organise un événement</span>
          </Link>
          <Link
            href="/espace-prestataire/inscription"
            className="flex items-center gap-3 rounded-2xl border border-[#e4d8c4] bg-white px-4 py-3.5 hover:border-[#b8924a]"
          >
            <Store size={20} className="shrink-0 text-[#b8924a]" />
            <span className="text-sm font-semibold text-gray-900">Je suis prestataire</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
