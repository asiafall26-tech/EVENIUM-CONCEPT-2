'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Calendar, CheckCircle2, CreditCard, Lock, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useEvents } from '@/store/EventsContext';
import { IPhone16ProMaxFrame } from '@/components/ui/IPhone16ProMaxFrame';
import { EVENT_TYPES, type EventTypeName } from '@/lib/eventTypes';
import { EventDetailsFields } from '@/components/events/EventDetailsFields';
import { EMPTY_EVENT_DETAILS, eventDetailsToRow, missingEventDetails, type EventDetails } from '@/lib/eventDetails';

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<EventTypeName>('Mariage');
  const [plan, setPlan] = useState<'standard' | 'premium' | 'gold'>('standard');
  const [invitationType, setInvitationType] = useState<'carte' | 'animee'>('carte');
  // Premium et Gold : détails de l'événement obligatoires, repris dans le dashboard
  const [details, setDetails] = useState<EventDetails>(EMPTY_EVENT_DETAILS);
  const [showDetailsErrors, setShowDetailsErrors] = useState(false);
  const needsDetails = plan === 'premium' || plan === 'gold';
  
  const [selectedModel, setSelectedModel] = useState(7);
  const [previewModelId, setPreviewModelId] = useState<number | null>(null);
  
  const { addEvent } = useEvents();

  // Fake Pricing
  const prices = {
    standard: { carte: "3 500", animee: "5 000" },
    premium: { carte: "7 500", animee: "10 000" },
    gold: { carte: "15 000", animee: "20 000" }
  };

  const models = [
    { id: 7, name: 'Velours Bordeaux', color: 'bg-[#800020]', image: '/invit-velours-cover.jpg', liveUrl: '/invitation-mariage' },
    { id: 8, name: "Sceau d'Or Impérial", color: 'bg-[#43080f]', image: '/invit-sceau-dor-cover.jpg', liveUrl: '/invitation-sceau-dor' },
    { id: 9, name: 'Ivoire Couture', color: 'bg-[#1f1715]', image: '/invit-ivoire-cover.jpg', liveUrl: '/invitation-ivoire' },
    { id: 10, name: 'Rose Poudrée & Or Impérial', color: 'bg-[#efe2dc]', image: '/invit-rose-or-cover.jpg', liveUrl: '/invitation-rose-or' },
    { id: 11, name: 'Anniversaire Bordeaux & Or', color: 'bg-[#6b1428]', image: '/invit-anniversaire-cover.jpg', liveUrl: '/invitation-anniversaire' },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsDetails) {
      const missing = missingEventDetails(details);
      if (missing.length) {
        setShowDetailsErrors(true);
        alert(`Formule ${plan === 'gold' ? 'Gold' : 'Premium'} : merci de renseigner ${missing.join(", ")} de votre événement.`);
        return;
      }
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    // Construct new event
    const newEvent = {
      name: eventName,
      type: eventType,
      date: (needsDetails ? details.date : eventDate) || "À définir",
      time: (needsDetails && details.time) || "18:00",
      location: (needsDetails && details.location) || "À définir",
      guestsCount: needsDetails ? Number(details.guestsCount) || 0 : 50,
      plan: plan === 'gold' ? ('Gold' as const) : plan === 'premium' ? ('Premium' as const) : ('Standard' as const),
      format: invitationType === 'animee' ? 'Animée' as const : 'Carte' as const,
      status: 'active' as any,
      invitationModelId: `invit-${selectedModel}`,
    };
    
    try {
      const row = eventDetailsToRow(details);
      const newId = await addEvent(newEvent, needsDetails ? { budget_total: row.budget_total, event_details: row.event_details } : undefined);
      setIsLoading(false);
      if (newId) {
        router.push(`/dashboard/events/${newId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setIsLoading(false);
      alert("Une erreur s'est produite lors de la création de l'événement : " + (error?.message || "Erreur inconnue"));
    }
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
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-[#b8924a]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-[#b8924a]' : 'bg-gray-200'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 3 ? 'bg-[#b8924a]' : 'bg-gray-200'}`} />
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
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/20 focus:border-[#b8924a] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type d'événement</label>
                  <select
                    required
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventTypeName)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/20 focus:border-[#b8924a] outline-none transition-all"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date prévue</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="date" 
                      required
                      value={eventDate}
                      onChange={(e) => { setEventDate(e.target.value); setDetails(prev => prev.date ? prev : { ...prev, date: e.target.value }); }}
                      className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/20 focus:border-[#b8924a] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">Type d'invitation</h2>
                  <span className="text-xs text-gray-500">Choisissez le format souhaité</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setInvitationType('carte')} className={`p-4 rounded-xl border text-left transition-all ${invitationType === 'carte' ? 'border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-gray-900">Carte Statique</h3>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">Sans musique</span>
                    </div>
                    <p className="text-xs text-gray-500">Carte web classique épurée (aucun son ni musique)</p>
                  </button>
                  <button type="button" onClick={() => setInvitationType('animee')} className={`p-4 rounded-xl border text-left transition-all ${invitationType === 'animee' ? 'border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-gray-900">Faire-part Animé</h3>
                      <span className="text-[10px] bg-[#b8924a]/20 text-[#8f6f33] font-bold px-2 py-0.5 rounded-full">Musique & effets</span>
                    </div>
                    <p className="text-xs text-gray-500">Animations immersives avec musique d'ambiance</p>
                  </button>
                </div>

                {/* Explication explicite */}
                {invitationType === 'carte' ? (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <span className="text-sm">📄</span>
                    <p>
                      <strong>Format Carte Statique :</strong> Les cartes statiques sont conçues pour être purement visuelles. Elles <u>ne peuvent pas comporter de musique ni de son d&apos;ambiance</u>.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-[#fbf7f0] border border-[#b8924a]/30 rounded-xl text-xs text-gray-800 flex items-start gap-2">
                    <span className="text-sm">✨</span>
                    <p>
                      <strong className="text-[#8f6f33]">Format Faire-part Animé :</strong> Scénographie interactive avec ouverture au sceau, effets visuels et <u>lecteur de musique d&apos;ambiance</u>.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-3">Formule</h2>
                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${plan === 'standard' ? 'border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="plan" checked={plan === 'standard'} onChange={() => setPlan('standard')} className="mt-1 w-4 h-4 text-[#8f6f33] focus:ring-[#8f6f33]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-900">Standard</h3>
                        <span className="font-bold">{prices.standard[invitationType]} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Accès Dashboard Organisateur, lien officiel et QR Code actif ({invitationType === 'carte' ? 'carte statique sans son' : 'faire-part animé avec musique'}).
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${plan === 'premium' ? 'border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="plan" checked={plan === 'premium'} onChange={() => setPlan('premium')} className="mt-1 w-4 h-4 text-[#8f6f33] focus:ring-[#8f6f33]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-900">Premium</h3>
                        <span className="font-bold">{prices.premium[invitationType]} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Accès Dashboard, RSVP direct, itinéraire GPS et galerie photos ({invitationType === 'carte' ? 'format visuel sans musique' : 'avec musique d\'ambiance'}).
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${plan === 'gold' ? 'border-[#b8924a] bg-[#b8924a]/5 ring-1 ring-[#b8924a]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="plan" checked={plan === 'gold'} onChange={() => setPlan('gold')} className="mt-1 w-4 h-4 text-[#8f6f33] focus:ring-[#8f6f33]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-[#8f6f33]">Gold VIP</h3>
                        <span className="font-bold">{prices.gold[invitationType]} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        La suite complète : Dashboard, Budget, prestataires certifiés (0% commission), checklist Jour J et support 7j/7 ({invitationType === 'carte' ? 'carte statique sans son' : 'invitation animée avec musique'}).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {needsDetails && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-semibold text-gray-900">Détails de votre événement</h2>
                    <p className="text-sm text-gray-500 mt-1">Obligatoires avec la formule {plan === 'gold' ? 'Gold VIP' : 'Premium'} : ils sont repris dans votre dashboard, où vous pourrez les modifier.</p>
                  </div>
                  <EventDetailsFields value={details} onChange={setDetails} showErrors={showDetailsErrors} />
                </div>
              )}

              <button type="submit" className="w-full bg-[#2b2118] hover:bg-black text-[#b8924a] font-semibold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
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

              <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
                {models.map(model => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative rounded-3xl overflow-hidden border-2 text-left transition-all cursor-pointer group shadow-sm ${selectedModel === model.id ? 'border-[#b8924a] ring-4 ring-[#b8924a]/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                  >
                    <div className="h-64 sm:h-80 w-full relative bg-gray-100 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                      <img src={model.image} alt={model.name} className="w-full h-full object-cover transition-transform duration-700" />
                      
                      {/* Always visible overlay button in center */}
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPreviewModelId(model.id); }}
                          className="pointer-events-auto bg-white/95 text-gray-900 px-6 py-3 rounded-full font-semibold text-sm shadow-xl flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105"
                          title="Prévisualiser ce design"
                        >
                          <Eye size={18} />
                          Voir la démo animée
                        </button>
                      </div>
                    </div>
                    <div className="p-5 bg-white flex justify-between items-center relative z-10">
                      <div>
                        <span className="font-serif text-xl font-bold text-gray-900 block">{model.name}</span>
                        <span className="text-sm text-gray-500">Design premium interactif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedModel === model.id ? (
                          <div className="bg-[#b8924a] text-white p-1.5 rounded-full shadow-sm">
                            <CheckCircle2 size={20} />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-gray-200" />
                        )}
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
                  className="flex-1 bg-[#2b2118] hover:bg-black text-[#b8924a] font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
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
                <div className="w-16 h-16 bg-[#b8924a]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#8f6f33]">
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
                  <span className="text-2xl font-bold text-[#b8924a]">{prices[plan][invitationType]} FCFA</span>
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
        <div className="hidden md:block w-1/3 bg-gray-50 border-l border-gray-200 p-5 sm:p-8 lg:p-10 h-full">
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
                  <CheckCircle2 size={16} className="text-[#b8924a]" />
                  <span className="font-medium capitalize text-gray-900">{plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#b8924a]" />
                  <span className="text-sm text-gray-600">
                    {invitationType === 'carte' ? 'Carte statique (sans son)' : 'Faire-part animé (avec musique)'}
                  </span>
                </div>
              </div>

              {step >= 2 && (
                <>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Modèle sélectionné</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#b8924a]" />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setPreviewModelId(null)} />
          
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            {/* Top Close button */}
            <div className="w-[min(440px,94vw,calc((82vh-20px)*(9/19.5)))] flex justify-end mb-2">
              <button 
                onClick={() => setPreviewModelId(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors shadow-lg border border-white/20"
                aria-label="Fermer la prévisualisation"
              >
                <X size={18} />
              </button>
            </div>

            <IPhone16ProMaxFrame
              src="/invitation-mariage"
              bgColor="bg-[#3a0511]"
              title="Prévisualisation du modèle"
            >
              {/* Action Footer overlay inside the phone */}
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <button 
                  onClick={() => {
                    setSelectedModel(previewModelId);
                    setPreviewModelId(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#b8924a] to-[#F3E5AB] text-black rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/80 flex items-center justify-center gap-2 border border-[#b8924a]/50"
                >
                  <CheckCircle2 size={18} />
                  Choisir ce design
                </button>
              </div>
            </IPhone16ProMaxFrame>
          </div>
        </div>
      )}
    </div>
  );
}
