"use client";

import Link from "next/link";
import { ArrowRight, Users, Store, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signup } from "@/app/(auth)/auth-actions";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const [role, setRole] = useState<"client" | "prestataire">("client");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const redirectTo = searchParams.get("redirectTo");

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 py-16 px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-black mb-2">Créer un compte</h1>
            <p className="text-gray-500 text-sm">Rejoignez Evenium et simplifiez l'organisation de vos événements.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form action={signup} onSubmit={() => setIsLoading(true)} className="space-y-6">
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            
            {/* Role Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Vous êtes ?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    role === "client" 
                      ? "border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a] text-gray-900 font-semibold" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Users size={20} className={role === "client" ? "text-[#b8924a]" : ""} />
                  Organisateur (Client)
                </button>

                <button
                  type="button"
                  onClick={() => setRole("prestataire")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    role === "prestataire" 
                      ? "border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a] text-gray-900 font-semibold" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Store size={20} className={role === "prestataire" ? "text-[#b8924a]" : ""} />
                  Prestataire
                </button>
              </div>
              <input type="hidden" name="role" value={role} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input 
                name="fullName"
                type="text" 
                placeholder="Ex: Mariama Diallo" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse Email</label>
              <input 
                name="email"
                type="email" 
                placeholder="vous@exemple.com" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de téléphone</label>
              <div className="flex gap-2">
                <select className="w-[100px] sm:w-[120px] px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all appearance-none cursor-pointer">
                  <option value="+221">🇸🇳 +221</option>
                  <option value="+225">🇨🇮 +225</option>
                  <option value="+33">🇫🇷 +33</option>
                </select>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="77 123 45 67" 
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all pr-12"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Doit contenir au moins 6 caractères.</p>
            </div>

            <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#2b2118] hover:bg-black text-[#b8924a] py-3.5 rounded-xl text-sm font-semibold shadow-md transition-all mt-4">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>S'inscrire <ArrowRight size={16} /></>
              )}
            </button>
          </form>
          
        </div>
        
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link 
              href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} 
              className="font-semibold text-[#8f6f33] hover:underline"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
