'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { EventCreationProvider } from '@/store/EventCreationContext';

const steps = [
  { path: '/create/step-1', label: 'Informations' },
  { path: '/create/step-2', label: 'Formule' },
  { path: '/create/step-3', label: 'Invitation' },
  { path: '/create/step-4', label: 'Récapitulatif' },
  { path: '/create/step-5', label: 'Authentification' },
  { path: '/create/checkout', label: 'Paiement' },
];

export default function CreateEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const currentStepIndex = steps.findIndex(s => pathname.includes(s.path));
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  
  const progress = ((activeIndex) / (steps.length - 1)) * 100;

  return (
    <EventCreationProvider>
      <div className="flex-1 flex flex-col bg-[#FCFBF8] relative min-h-screen">
        
        {/* Bulle décorative d'arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />

        {/* En-tête de progression ultra-premium */}
        <div className="pt-12 pb-6 px-6 relative z-10 max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-2">Création d'événement</h1>
            <p className="text-3xl font-serif text-gray-900">Configurez votre expérience</p>
          </div>

          {/* Stepper (Affichage de toutes les étapes) */}
          <div className="relative">
            {/* Ligne de fond */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 rounded-full hidden md:block"></div>
            {/* Ligne de progression active */}
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#B8860B] to-[#D4AF37] -translate-y-1/2 rounded-full transition-all duration-700 ease-out hidden md:block"
              style={{ width: `${progress}%` }}
            ></div>

            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = index === activeIndex;
                const isCompleted = index < activeIndex;

                return (
                  <div key={step.path} className="flex flex-col items-center group">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 shadow-sm relative z-10 ${
                        isActive 
                          ? 'bg-[#111111] text-[#D4AF37] scale-110 ring-4 ring-[#D4AF37]/20' 
                          : isCompleted 
                            ? 'bg-[#D4AF37] text-white' 
                            : 'bg-white text-gray-400 border-2 border-gray-100'
                      }`}
                    >
                      {isCompleted ? <span className="text-lg">✓</span> : index + 1}
                    </div>
                    <span 
                      className={`mt-3 text-xs md:text-sm font-medium transition-colors hidden md:block ${
                        isActive ? 'text-gray-900 font-bold' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wizard Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pb-20 flex flex-col relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 md:p-14 min-h-[600px] flex flex-col transition-all">
            {children}
          </div>
        </main>
        
      </div>
    </EventCreationProvider>
  );
}
