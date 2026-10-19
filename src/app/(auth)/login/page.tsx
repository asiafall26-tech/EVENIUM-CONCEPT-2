"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { login } from "../auth-actions";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const redirectTo = searchParams.get("redirectTo");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
  };

  return (
    <main className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left Side: Visual / Branding */}
      <div className="hidden lg:flex flex-1 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-collage.jpg" 
            alt="Evenium Événements" 
            fill 
            className="object-cover opacity-40 mix-blend-overlay"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        
        <div className="relative z-20 max-w-lg px-12 text-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-[#b8924a] font-serif text-3xl font-bold mb-8">
            <Sparkles size={28} />
            Evenium
          </Link>
          <h2 className="font-serif text-4xl leading-tight mb-6">
            L'excellence de l'organisation événementielle.
          </h2>
          <p className="text-gray-300 text-lg">
            Connectez-vous pour accéder à vos événements, gérer vos devis ou piloter la plateforme.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative">
        <Link href="/" className="absolute top-8 left-8 lg:hidden text-[#b8924a] font-serif text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} />
          Evenium
        </Link>
        
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold mb-2">Bienvenue</h1>
            <p className="text-gray-500">
              {redirectTo ? "Connectez-vous pour accéder à votre tableau de bord." : "Connectez-vous à votre espace personnel."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form action={login} onSubmit={() => setIsLoading(true)} className="space-y-6">
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="exemple@evenium.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/20 focus:border-[#b8924a] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <Link href="#" className="text-xs font-semibold text-[#b8924a] hover:underline">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-12 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/20 focus:border-[#b8924a] outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#2b2118] hover:bg-black text-[#b8924a] font-semibold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Nouveau sur Evenium ?{" "}
              <Link 
                href={redirectTo ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/register"} 
                className="font-semibold text-gray-900 hover:text-[#b8924a] transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
