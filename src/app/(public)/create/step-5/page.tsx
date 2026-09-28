'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Step5Page() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'une requête d'authentification
    setTimeout(() => {
      setIsLoading(false);
      // Redirection vers l'étape finale de paiement
      router.push('/create/checkout');
    }, 1200);
  };

  const handleOAuthLogin = () => {
    setIsLoading(true);
    // Simulation d'une redirection OAuth
    setTimeout(() => {
      setIsLoading(false);
      router.push('/create/checkout');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full py-6">
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            {isLogin ? 'Bon retour !' : 'Créez votre compte'}
          </h2>
          <p className="text-gray-500">
            {isLogin 
              ? 'Connectez-vous pour finaliser votre commande.' 
              : 'Dernière étape avant de finaliser la commande de votre événement.'}
          </p>
        </div>

        {/* Boutons OAuth */}
        <div className="space-y-3 mb-8">
          <button 
            onClick={handleOAuthLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
          
          <button 
            onClick={handleOAuthLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-3.5 rounded-2xl hover:bg-neutral-900 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.87.69 3.65 1.83-3.14 1.83-2.62 5.92.51 7.14-.73 1.77-1.74 3.29-2.83 3.96zM12.03 7.25c-.15-2.58 2.08-4.8 4.41-4.99.3 2.72-2.31 5-4.41 4.99z"/>
            </svg>
            Continuer avec Apple
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400 font-medium">Ou avec votre email</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Formulaire classique */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Nom complet</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="text" 
                  required={!isLogin}
                  placeholder="Ex: Amadou Fall" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Adresse email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="email" 
                required
                placeholder="nom@exemple.com" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
              {isLogin && <button type="button" className="text-xs font-medium text-[#B8860B] hover:underline">Mot de passe oublié ?</button>}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-full transition-all disabled:opacity-70 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Se connecter' : 'Créer mon compte'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? 'Nouveau sur Evenium ?' : 'Vous avez déjà un compte ?'}{' '}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-gray-900 hover:text-[#B8860B] transition-colors underline-offset-4 hover:underline"
          >
            {isLogin ? 'Créer un compte' : 'Connectez-vous'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
