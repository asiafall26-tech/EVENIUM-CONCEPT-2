'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEventCreation } from '@/store/EventCreationContext';
import { ShoppingCart, CheckCircle, Calendar, MapPin, Users, Info, Sparkles, Crown } from 'lucide-react';

export default function Step4Page() {
  const router = useRouter();
  const { state } = useEventCreation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/create/step-5');
  };

  if (!state.name || !state.plan || !state.invitationModelId) {
    if (typeof window !== 'undefined') {
      router.push('/create/step-1');
    }
    return null;
  }

  const planPrice = state.plan === 'Gold' ? 50000 : 25000;
  const invitationPrice = state.invitationType === 'Animée' ? 15000 : 0;
  const total = planPrice + invitationPrice;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3 flex items-center justify-center gap-3">
          Récapitulatif de votre commande
        </h2>
        <p className="text-gray-500 text-lg">Vérifiez les détails avant de finaliser la création de votre espace.</p>
      </div>

      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        
        {/* Layout en 2 colonnes */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 flex-1">
          
          {/* Colonne Gauche : L'Événement */}
          <div className="flex-1 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col">
            <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#D4AF37]" /> Détails de l'événement
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nom de l'événement</p>
                <p className="text-2xl font-serif text-gray-900">{state.name}</p>
              </div>

              <div className="w-full h-px bg-gray-200"></div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={14}/> Date & Heure</p>
                  <p className="font-medium text-gray-900">{new Date(state.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  {state.time && <p className="text-gray-600 mt-0.5">à {state.time}</p>}
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users size={14}/> Invités</p>
                  <p className="font-medium text-gray-900">{state.guestsCount ? `~${state.guestsCount} personnes` : 'Non défini'}</p>
                </div>
              </div>

              {state.location && (
                <>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14}/> Lieu</p>
                    <p className="font-medium text-gray-900">{state.location}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Info bulle discrète */}
            <div className="mt-8 bg-blue-50/50 text-blue-800 p-4 rounded-2xl flex gap-3 items-start text-sm border border-blue-100">
              <Info className="shrink-0 mt-0.5 text-blue-500" size={18} />
              <p>La personnalisation de votre invitation se fera depuis votre espace client, juste après la validation de votre commande.</p>
            </div>
          </div>

          {/* Colonne Droite : Le Panier "Style Ticket" */}
          <div className="w-full md:w-[45%] lg:w-[40%] bg-[#111111] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Effet reflet / lumière */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/30 to-transparent blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-8 flex items-center gap-2">
                <ShoppingCart size={16} /> Votre Panier
              </h3>
              
              <div className="space-y-6">
                {/* Ligne Formule */}
                <div className="flex justify-between items-start border-b border-white/10 pb-6">
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2">
                      Formule {state.plan}
                      {state.plan === 'Gold' ? <Crown size={14} className="text-[#D4AF37]" /> : <Sparkles size={14} className="text-[#D4AF37]" />}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Accès complet aux outils de gestion</p>
                  </div>
                  <span className="font-medium text-white whitespace-nowrap">{planPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>

                {/* Ligne Invitation */}
                <div className="flex justify-between items-start border-b border-white/10 pb-6">
                  <div>
                    <h4 className="font-medium text-white">Modèle #{state.invitationModelId}</h4>
                    <p className="text-xs text-gray-400 mt-1">Format : Invitation {state.invitationType}</p>
                  </div>
                  <span className="font-medium text-white whitespace-nowrap">{invitationPrice > 0 ? `${invitationPrice.toLocaleString('fr-FR')} FCFA` : 'Inclus'}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="relative z-10 mt-10 pt-6">
              <p className="text-gray-400 text-sm mb-1">Total à régler</p>
              <div className="text-4xl font-light text-white">
                {total.toLocaleString('fr-FR')} <span className="text-xl text-[#D4AF37] font-serif">FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-10 mt-6 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <button 
            type="button"
            onClick={() => router.push('/create/step-3')}
            className="w-full md:w-auto px-8 text-gray-500 hover:text-gray-900 font-medium py-3 rounded-full transition-colors flex items-center justify-center"
          >
            Modifier mes choix
          </button>
          
          <button 
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-auto px-12 bg-black hover:bg-gray-900 text-[#D4AF37] font-semibold py-4 rounded-full transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2"
          >
            Continuer <span className="hidden sm:inline">vers l'inscription</span>
          </button>
        </div>
      </div>
    </div>
  );
}
