'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockEvents, Event, PlanType, FormatType, EventType } from '@/data/mock/events';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEventPlan: (id: string, newPlan: PlanType) => void;
  updateEventStatus: (id: string, newStatus: "draft" | "published" | "completed") => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('evenium_events');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      setEvents(mockEvents);
      localStorage.setItem('evenium_events', JSON.stringify(mockEvents));
    }
    setIsLoaded(true);
  }, []);

  const addEvent = (event: Event) => {
    const newEvents = [event, ...events];
    setEvents(newEvents);
    localStorage.setItem('evenium_events', JSON.stringify(newEvents));
  };

  const updateEventPlan = (id: string, newPlan: PlanType) => {
    const newEvents = events.map(e => e.id === id ? { ...e, plan: newPlan } : e);
    setEvents(newEvents);
    localStorage.setItem('evenium_events', JSON.stringify(newEvents));
  };

  const updateEventStatus = (id: string, newStatus: "draft" | "published" | "completed") => {
    const newEvents = events.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setEvents(newEvents);
    localStorage.setItem('evenium_events', JSON.stringify(newEvents));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEventPlan, updateEventStatus }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
