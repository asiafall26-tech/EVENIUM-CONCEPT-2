"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Store, Users, ShieldCheck, Mail, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Role = "client" | "prestataire" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for auth
    setTimeout(() => {
      setIsLoading(false);
      // Redirect based on selected role
      if (selectedRole === "client") {
        router.push("/dashboard");
      } else if (selectedRole === "prestataire") {
        router.push("/prestataire");
      } else if (selectedRole === "admin") {
        router.push("/admin");
      }
    }, 1200);
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
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37] font-serif text-3xl font-bold mb-8">
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
        <Link href="/" className="absolute top-8 left-8 lg:hidden text-[#D4AF37] font-serif text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} />
          Evenium
        </Link>
        
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold mb-2">Bienvenue</h1>
            <p className="text-gray-500">Connectez-vous à votre espace personnel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Role Selection (Mock Auth) */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Choisissez votre rôle (Simulation)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setSelectedRole("client")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    selectedRole === "client" 
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37] text-gray-900 font-semibold" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Users size={20} className={selectedRole === "client" ? "text-[#D4AF37]" : ""} />
                  Organisateur
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("prestataire")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    selectedRole === "prestataire" 
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37] text-gray-900 font-semibold" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Store size={20} className={selectedRole === "prestataire" ? "text-[#D4AF37]" : ""} />
                  Prestataire
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    selectedRole === "admin" 
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37] text-gray-900 font-semibold" 
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShieldCheck size={20} className={selectedRole === "admin" ? "text-[#D4AF37]" : ""} />
                  Admin
                </button>

              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@evenium.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <Link href="#" className="text-xs font-semibold text-[#D4AF37] hover:underline">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Nouveau sur Evenium ?{" "}
              <Link href="#" className="font-semibold text-gray-900 hover:text-[#D4AF37] transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
