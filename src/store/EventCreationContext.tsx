'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EventType = "Mariage" | "Anniversaire" | "Baptême" | "Baby shower" | "Conférence" | "Événement professionnel" | "Gala" | "Fiançailles";
export type PlanType = "Premium" | "Gold" | null;
export type InvitationType = "Carte" | "Animée" | null;

export interface EventCreationState {
  // Step 1: Base Info
  name: string;
  type: EventType | "";
  date: string;
  time: string;
  location: string;
  guestsCount: number | "";
  
  // Step 2: Formula
  plan: PlanType;
  invitationType: InvitationType;
  
  // Step 3: Invitation Template
  invitationModelId: string | null;
}

const initialState: EventCreationState = {
  name: "",
  type: "",
  date: "",
  time: "",
  location: "",
  guestsCount: "",
  plan: null,
  invitationType: null,
  invitationModelId: null,
};

interface EventCreationContextType {
  state: EventCreationState;
  updateState: (updates: Partial<EventCreationState>) => void;
  resetState: () => void;
}

const EventCreationContext = createContext<EventCreationContextType | undefined>(undefined);

export function EventCreationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EventCreationState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('evenium_event_creation');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved event creation state");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('evenium_event_creation', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const updateState = (updates: Partial<EventCreationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    localStorage.removeItem('evenium_event_creation');
  };

  // Prevent hydration mismatch by not rendering children until loaded
  if (!isLoaded) return null;

  return (
    <EventCreationContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </EventCreationContext.Provider>
  );
}

export function useEventCreation() {
  const context = useContext(EventCreationContext);
  if (context === undefined) {
    throw new Error('useEventCreation must be used within an EventCreationProvider');
  }
  return context;
}
