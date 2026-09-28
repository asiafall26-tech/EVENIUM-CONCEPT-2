'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Calendar, CheckCircle2, CreditCard, Lock, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useEvents } from '@/store/EventsContext';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [plan, setPlan] = useState<'premium' | 'gold'>('premium');
  const [invitationType, setInvitationType] = useState<'carte' | 'animee'>('carte');
  
  const [selectedModel, setSelectedModel] = useState(1);
  const [previewModelId, setPreviewModelId] = useState<number | null>(null);
  
  const { addEvent } = useEvents();

  // Fake Pricing
  const prices = {
    premium: { carte: "7 500", animee: "10 000" },
    gold: { carte: "15 000", animee: "20 000" }
  };

  const models = [
    { id: 1, name: 'Élégance Or', color: 'bg-white' },
    { id: 2, name: 'Nuit Royale', color: 'bg-black' },
    { id: 3, name: 'Champêtre', color: 'bg-[#F4F1EA]' },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = () => {
    setIsLoading(true);
    
    // Construct new event
    const newId = `evt-${Date.now()}`;
    const newEvent = {
      id: newId,
      name: eventName,
      type: "Mariage" as any, // Simple fallback type for now
      date: eventDate ? new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : "À définir",
      time: "18:00",
      location: "À définir",
      guestsCount: 0,
      plan: plan === 'gold' ? 'Gold' as const : 'Premium' as const,
      format: invitationType === 'animee' ? 'Animée' as const : 'Carte' as const,
      status: 'draft' as const,
      budget: { total: 0, spent: 0 },
      guests: { total: 0, confirmed: 0, pending: 0, declined: 0 },
      tasks: { total: 0, completed: 0 },
      providersCount: 0,
    };
    
    setTimeout(() => {
      addEvent(newEvent);
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="flex items-center gap-4 mb-10">
        <Link href="/dashboard" className="p-2 text-gray-500 hover:text-black bg-white rounded-full border border-gray-200 shadow-sm transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-gray-900">Nouvel Événement</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 3 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-8 animate-in fade-in duration-300 pb-10">
              
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">Informations de base</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nom de l'événement</label>
                  <input 
                    type="text" 
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Ex: Mariage de Sophie & Marc" 
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date prévue</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="date" 
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">Type d'invitation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setInvitationType('carte')} className={`p-4 rounded-xl border text-left transition-all ${invitationType === 'carte' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-semibold text-gray-900 mb-1">Statique</h3>
                    <p className="text-xs text-gray-500">Carte web classique</p>
                  </button>
                  <button type="button" onClick={() => setInvitationType('animee')} className={`p-4 rounded-xl border text-left transition-all ${invitationType === 'animee' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-semibold text-gray-900 mb-1">Animée</h3>
                    <p className="text-xs text-gray-500">Effets et animations</p>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">Formule</h2>
                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${plan === 'premium' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="plan" checked={plan === 'premium'} onChange={() => setPlan('premium')} className="mt-1 w-4 h-4 text-[#B8860B] focus:ring-[#B8860B]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-900">Premium</h3>
                        <span className="font-bold">{prices.premium[invitationType]} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">Gestion des invités et invitations illimitées.</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${plan === 'gold' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="plan" checked={plan === 'gold'} onChange={() => setPlan('gold')} className="mt-1 w-4 h-4 text-[#B8860B] focus:ring-[#B8860B]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-[#B8860B]">Gold</h3>
                        <span className="font-bold">{prices.gold[invitationType]} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">La suite complète : budget, prestataires, tâches.</p>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                Continuer
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2">Choix du Design</h2>
                <p className="text-gray-500 text-sm">Sélectionnez le modèle visuel pour votre invitation {invitationType}.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {models.map(model => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer group ${selectedModel === model.id ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/10' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className={`h-32 w-full ${model.color} flex items-center justify-center border-b border-gray-100`}>
                      <span className="font-serif text-lg opacity-50 px-2 text-center">{model.name}</span>
                    </div>
                    <div className="p-3 bg-white flex justify-between items-center relative z-10">
                      <span className="font-semibold text-sm">{model.name}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setPreviewModelId(model.id); }}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Prévisualiser ce design"
                        >
                          <Eye size={16} />
                        </div>
                        {selectedModel === model.id && <CheckCircle2 size={16} className="text-[#D4AF37]" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all"
                >
                  Retour
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Suivant
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#B8860B]">
                  <CreditCard size={32} />
                </div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2">Paiement Sécurisé</h2>
                <p className="text-gray-500 text-sm">Vous êtes sur le point de valider la création de votre événement.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{prices[plan][invitationType]} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-lg">Total à payer</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">{prices[plan][invitationType]} FCFA</span>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <button 
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={16} />
                      Payer et créer l'événement
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Summary Card */}
        <div className="hidden md:block w-1/3 bg-gray-50 border-l border-gray-200 p-10 h-full">
          <div className="sticky top-0">
            <h3 className="font-serif text-xl font-semibold mb-6">Récapitulatif</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Événement</p>
                <p className="font-medium text-gray-900">{eventName || 'À définir'}</p>
                {eventDate && !isNaN(new Date(eventDate).getTime()) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(eventDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>

              <div className="w-full h-px bg-gray-200"></div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Formule choisie</p>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-[#D4AF37]" />
                  <span className="font-medium capitalize text-gray-900">{plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D4AF37]" />
                  <span className="text-sm text-gray-600">Invitation {invitationType}</span>
                </div>
              </div>

              {step >= 2 && (
                <>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Modèle sélectionné</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#D4AF37]" />
                      <span className="font-medium text-gray-900">{models.find(m => m.id === selectedModel)?.name}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="w-full h-px bg-gray-200"></div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{prices[plan][invitationType]} <span className="text-lg font-medium text-gray-400">FCFA</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal Overlay */}
      {previewModelId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewModelId(null)} />
          
          <div className="relative bg-white rounded-3xl overflow-hidden w-full max-w-sm sm:max-w-md h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setPreviewModelId(null)}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Fake Preview Content based on model */}
            <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center relative ${models.find(m => m.id === previewModelId)?.color}`}>
               {/* Pattern overlay depending on model */}
               <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               
               <div className="relative z-10 flex flex-col items-center">
                 <h3 className="font-serif text-3xl font-bold mb-4 opacity-80 leading-tight">
                   {eventName || "Le Mariage de Sophie & Marc"}
                 </h3>
                 
                 <p className="text-sm opacity-60 mb-8 uppercase tracking-widest font-medium">
                   {eventDate && !isNaN(new Date(eventDate).getTime()) 
                     ? new Date(eventDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
                     : "Samedi 25 Octobre 2026"}
                 </p>
                 
                 <div className="w-16 h-px bg-current opacity-30 mb-8" />
                 <p className="text-xs opacity-50 uppercase tracking-widest font-semibold">Vous êtes conviés</p>
               </div>
            </div>
            
            {/* Action Footer */}
            <div className="p-4 bg-white border-t border-gray-100 text-center shrink-0">
               <button 
                 onClick={() => {
                   setSelectedModel(previewModelId);
                   setPreviewModelId(null);
                 }}
                 className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#D4AF37] rounded-xl font-semibold text-sm transition-colors shadow-md"
               >
                 Choisir ce design
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
