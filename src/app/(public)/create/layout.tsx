'use client';

import React from 'react';
import { EventCreationProvider } from '@/store/EventCreationContext';

export default function CreateEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventCreationProvider>
      <div className="flex-1 flex flex-col bg-[#fbf7f0] relative min-h-screen">
        {/* Bulle décorative d'arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#b8924a]/5 to-transparent pointer-events-none" />

        {/* Contenu principal Express Studio Complet */}
        <main className="flex-1 w-full max-w-[1550px] mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col relative z-10">
          {children}
        </main>
      </div>
    </EventCreationProvider>
  );
}
