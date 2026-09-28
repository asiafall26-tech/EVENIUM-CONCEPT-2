'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventCreation } from '@/store/EventCreationContext';
import { useEvents } from '@/store/EventsContext';
import { CreditCard, Smartphone, Check, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useEventCreation();
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'om' | 'card'>('wave');
  const [isProcessing, setIsProcessing] = useState(false);

  const { addEvent } = useEvents();

  if (!state.plan && typeof window !== 'undefined') {
    router.push('/create/step-1');
    return null;
  }

  const planPrice = state.plan === 'Gold' ? 50000 : 25000;
  const invitationPrice = state.invitationType === 'Animée' ? 15000 : 0;
  const total = planPrice + invitationPrice;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      // Create new event in the global context
      const newEventId = "evt_" + Math.random().toString(36).substr(2, 9);
      
      addEvent({
        id: newEventId,
        name: state.name,
        type: state.type as any, // casting safely as EventType
        format: "Présentiel", // default
        date: state.date,
        plan: state.plan as any,
        status: "active",
        guests: {
          total: Number(state.guestsCount) || 50,
          confirmed: 0,
          pending: Number(state.guestsCount) || 50,
        },
        progress: 0,
        budget: {
          total: 0,
          spent: 0,
        }
      });
      
      setIsProcessing(false);
      router.push(`/dashboard/events/${newEventId}`);
    }, 2500);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10">
      
      {/* Conteneur principal - Style "Stripe Checkout" de luxe */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Colonne Gauche : Récapitulatif (Thème Sombre Premium) */}
        <div className="w-full md:w-[40%] bg-[#111111] text-white p-10 md:p-12 flex flex-col relative">
          {/* Décoration dorée */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-serif text-[#D4AF37] mb-8">Evenium</h2>
            
            <p className="text-gray-400 text-sm mb-2">Montant à régler</p>
            <div className="text-4xl font-light tracking-tight text-white mb-10">
              {total.toLocaleString('fr-FR')} <span className="text-xl text-gray-500 font-normal">FCFA</span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                <div>
                  <h4 className="font-medium text-white mb-1">Formule {state.plan}</h4>
                  <p className="text-sm text-gray-400">Événement : {state.name}</p>
                </div>
                <span className="text-white font-medium">{planPrice.toLocaleString('fr-FR')}</span>
              </div>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-6">
                <div>
                  <h4 className="font-medium text-white mb-1">Format de l'invitation</h4>
                  <p className="text-sm text-gray-400">{state.invitationType}</p>
                </div>
                <span className="text-white font-medium">{invitationPrice > 0 ? invitationPrice.toLocaleString('fr-FR') : 'Inclus'}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 relative z-10 flex items-center gap-3 text-sm text-gray-400">
            <ShieldCheck className="text-[#D4AF37]" size={20} />
            Paiement sécurisé
          </div>
        </div>

        {/* Colonne Droite : Paiement (Thème Clair Épuré) */}
        <div className="w-full md:w-[60%] bg-white p-10 md:p-12">
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900">Moyen de paiement</h3>
            <p className="text-sm text-gray-500 mt-1">Choisissez comment vous souhaitez régler votre commande.</p>
          </div>

          {/* Sélection du moyen de paiement (Tabs élégantes) */}
          <div className="grid grid-cols-3 gap-3 mb-10 bg-gray-50 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setPaymentMethod('wave')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 ${
                paymentMethod === 'wave' 
                  ? 'bg-white shadow-sm ring-1 ring-gray-200 text-[#00a3ff]' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="font-bold text-xl mb-1">W</div>
              <span className={`text-xs font-medium ${paymentMethod === 'wave' ? 'text-gray-900' : ''}`}>Wave</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('om')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 ${
                paymentMethod === 'om' 
                  ? 'bg-white shadow-sm ring-1 ring-gray-200 text-[#ff7900]' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="font-bold text-lg mb-1">OM</div>
              <span className={`text-xs font-medium ${paymentMethod === 'om' ? 'text-gray-900' : ''}`}>Orange</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 ${
                paymentMethod === 'card' 
                  ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CreditCard size={24} className="mb-1" />
              <span className={`text-xs font-medium ${paymentMethod === 'card' ? 'text-gray-900' : ''}`}>Carte</span>
            </button>
          </div>

          {/* Formulaire de saisie ultra-épuré */}
          <form onSubmit={handlePayment} className="space-y-6">
            
            {paymentMethod !== 'card' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Numéro de téléphone</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-medium text-gray-500 border-r border-gray-200 pr-3">+221</span>
                    <input 
                      type="tel" 
                      required
                      placeholder="77 123 45 67" 
                      className="w-full bg-white border border-gray-200 text-gray-900 font-medium rounded-xl pl-20 pr-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                  <Smartphone className="shrink-0 text-blue-500" size={18} />
                  <p>Gardez votre téléphone à proximité. Une notification push s'affichera sur votre application {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} pour valider le paiement.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Informations de la carte</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="Numéro de carte" 
                      className="w-full bg-white border border-gray-200 text-gray-900 font-medium rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="MM/AA" 
                      className="w-full bg-white border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="CVC" 
                      className="w-full bg-white border border-gray-200 text-gray-900 font-medium rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full mt-8 bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-xl transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Payer {total.toLocaleString('fr-FR')} FCFA
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <Lock size={12} /> Vos données sont chiffrées de bout en bout.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
