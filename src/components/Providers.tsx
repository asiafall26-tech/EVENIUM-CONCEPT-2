'use client';

import { ReactNode } from 'react';
import { EventsProvider } from '@/store/EventsContext';
import { PrestataireProvider } from '@/store/PrestataireContext';
import { NotificationProvider } from './NotificationProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EventsProvider>
      <PrestataireProvider>
        {children}
        <NotificationProvider />
      </PrestataireProvider>
    </EventsProvider>
  );
}
