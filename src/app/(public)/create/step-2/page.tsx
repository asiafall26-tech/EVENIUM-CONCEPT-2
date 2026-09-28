'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEventCreation } from '@/store/EventCreationContext';
import { Sparkles, Crown, Image as ImageIcon, Video, Check } from 'lucide-react';

export default function Step2Page() {
  const router = useRouter();
  const { state, updateState } = useEventCreation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.plan || !state.invitationType) return;
    router.push('/create/step-3');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Composez votre offre</h2>
        <p className="text-gray-500 text-lg">Choisissez le format de vos invitations et le niveau d'accompagnement souhaité.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="space-y-12 flex-1">
          
          {/* Section 1 : Format de l'invitation */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#B8860B] text-sm">1</span>
              Format de l'invitation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carte Statique */}
              <div 
                onClick={() => updateState({ invitationType: 'Carte' })}
                className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                  state.invitationType === 'Carte'
                    ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {state.invitationType === 'Carte' && (
                  <div className="absolute top-4 right-4 text-[#D4AF37]">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${state.invitationType === 'Carte' ? 'bg-[#D4AF37]/20 text-[#B8860B]' : 'bg-gray-50 text-gray-400'}`}>
                  <ImageIcon size={24} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Carte Digitale Statique</h4>
                <p className="text-gray-500 text-sm">Une invitation au design élégant, claire et intemporelle pour vos convives.</p>
              </div>

              {/* Invitation Animée */}
              <div 
                onClick={() => updateState({ invitationType: 'Animée' })}
                className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                  state.invitationType === 'Animée'
                    ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {state.invitationType === 'Animée' && (
                  <div className="absolute top-4 right-4 text-[#D4AF37]">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${state.invitationType === 'Animée' ? 'bg-[#D4AF37]/20 text-[#B8860B]' : 'bg-gray-50 text-gray-400'}`}>
                  <Video size={24} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Invitation Animée</h4>
                <p className="text-gray-500 text-sm">Créez l'effet 'Wahou' avec une invitation vidéo immersive et dynamique.</p>
              </div>
            </div>
          </div>

          {/* Section 2 : Formule d'Organisation */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#B8860B] text-sm">2</span>
              Formule d'organisation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Premium */}
              <div 
                onClick={() => updateState({ plan: 'Premium' })}
                className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col ${
                  state.plan === 'Premium'
                    ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {state.plan === 'Premium' && (
                  <div className="absolute top-4 right-4 text-[#D4AF37]">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-xl font-serif text-gray-900 flex items-center gap-2">
                    Premium <Sparkles size={18} className={state.plan === 'Premium' ? "text-[#D4AF37]" : "text-gray-400"} />
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">L'essentiel pour un événement réussi</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                  <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 shrink-0 mt-0.5" /> Personnalisation de l'invitation</li>
                  <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 shrink-0 mt-0.5" /> Suivi des RSVP basique</li>
                  <li className="flex gap-2 items-start"><Check size={16} className="text-green-500 shrink-0 mt-0.5" /> Espace client dédié</li>
                </ul>
              </div>

              {/* Gold */}
              <div 
                onClick={() => updateState({ plan: 'Gold' })}
                className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col ${
                  state.plan === 'Gold'
                    ? 'border-[#D4AF37] bg-[#FCFBF8] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {state.plan === 'Gold' && (
                  <div className="absolute top-4 right-4 text-[#D4AF37]">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-xl font-serif text-gray-900 flex items-center gap-2">
                    Gold <Crown size={18} className={state.plan === 'Gold' ? "text-[#D4AF37]" : "text-gray-400"} />
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">L'expérience d'organisation ultime</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                  <li className="flex gap-2 items-start"><Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" /> Tout de la formule Premium</li>
                  <li className="flex gap-2 items-start"><Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" /> Outil de suivi Budgétaire avancé</li>
                  <li className="flex gap-2 items-start"><Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" /> Accès complet au catalogue Prestataires</li>
                  <li className="flex gap-2 items-start"><Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" /> To-Do list intelligente interactive</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-10 mt-auto flex flex-col-reverse md:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <button 
            type="button"
            onClick={() => router.push('/create/step-1')}
            className="w-full md:w-auto px-8 text-gray-500 hover:text-gray-900 font-medium py-3 rounded-full transition-colors flex items-center justify-center"
          >
            Retour
          </button>
          
          <button 
            type="submit"
            disabled={!state.plan || !state.invitationType}
            className="w-full md:w-auto px-10 bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-transparent hover:border-[#D4AF37]/30 flex items-center justify-center gap-2"
          >
            Choisir mon modèle
          </button>
        </div>
      </form>
    </div>
  );
}
