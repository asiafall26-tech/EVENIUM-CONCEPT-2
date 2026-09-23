import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { login } from "@/app/(auth)/auth-actions";

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 py-16 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-black mb-2">Bienvenue</h1>
            <p className="text-gray-500 text-sm">Connectez-vous pour accéder à votre espace Evenium.</p>
          </div>

          <form action={login} className="space-y-5">
            <input type="hidden" name="redirect" value="checkout" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="vous@exemple.com" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <Link href="#" className="text-xs font-semibold text-[#B8860B] hover:text-[#996B00]">Oublié ?</Link>
              </div>
              <input 
                type="password"
                name="password"
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                required
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-[#D4AF37] py-3.5 rounded-xl text-sm font-semibold shadow-md transition-all mt-2">
              Se connecter <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative bg-white px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
              Ou continuer avec
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link href="/register" className="font-semibold text-[#B8860B] hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
