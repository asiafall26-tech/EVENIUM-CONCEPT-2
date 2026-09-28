'use client';

import { ReactNode } from 'react';
import { EventsProvider } from '@/store/EventsContext';
import { PrestataireProvider } from '@/store/PrestataireContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EventsProvider>
      <PrestataireProvider>
        {children}
      </PrestataireProvider>
    </EventsProvider>
  );
}
