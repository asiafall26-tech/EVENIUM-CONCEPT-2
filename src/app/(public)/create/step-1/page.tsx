'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEventCreation, EventType } from '@/store/EventCreationContext';
import { Calendar, MapPin, Users, Clock, PartyPopper } from 'lucide-react';

const eventTypes: EventType[] = [
  "Mariage", "Anniversaire", "Baptême", "Baby shower", 
  "Conférence", "Événement professionnel", "Gala", "Fiançailles"
];

export default function Step1Page() {
  const router = useRouter();
  const { state, updateState } = useEventCreation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name || !state.type || !state.date) return;
    router.push('/create/step-2');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Parlez-nous de votre événement</h2>
        <p className="text-gray-500 text-lg">Commençons par les informations de base pour configurer votre espace.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="space-y-8 flex-1">
          
          {/* Nom de l'événement */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Nom de l'événement <span className="text-red-500">*</span></label>
            <div className="relative group">
              <PartyPopper className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="text" 
                required
                value={state.name}
                onChange={(e) => updateState({ name: e.target.value })}
                placeholder="Ex: Le mariage d'Astou & Ali" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all hover:border-gray-300 shadow-sm"
              />
            </div>
          </div>

          {/* Type d'événement */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Type d'événement <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateState({ type })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    state.type === type 
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#B8860B] shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Date <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="date" 
                  required
                  value={state.date}
                  onChange={(e) => updateState({ date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all hover:border-gray-300 shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Heure <span className="font-normal text-gray-400">(Optionnel)</span></label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="time" 
                  value={state.time}
                  onChange={(e) => updateState({ time: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all hover:border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Lieu & Nombre d'invités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Lieu <span className="font-normal text-gray-400">(Optionnel)</span></label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="text" 
                  value={state.location}
                  onChange={(e) => updateState({ location: e.target.value })}
                  placeholder="Ex: Dakar, Sénégal"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all hover:border-gray-300 shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Nombre estimé d'invités <span className="font-normal text-gray-400">(Optionnel)</span></label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="number" 
                  min="1"
                  value={state.guestsCount}
                  onChange={(e) => updateState({ guestsCount: e.target.value ? Number(e.target.value) : "" })}
                  placeholder="Ex: 150"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all hover:border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-10 mt-auto flex justify-end">
          <button 
            type="submit"
            disabled={!state.name || !state.type || !state.date}
            className="w-full md:w-auto px-10 bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-transparent hover:border-[#D4AF37]/30 flex items-center justify-center gap-2"
          >
            Continuer vers la formule
          </button>
        </div>
      </form>
    </div>
  );
}
