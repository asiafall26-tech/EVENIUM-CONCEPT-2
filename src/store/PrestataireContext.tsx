'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Prestataire {
  id: string;
  name: string;
  role: string;
  rating: number | null;
  phone: string;
  isPlatformProvider: boolean;
  zone: string;
  description: string;
  services: string[];
  priceRange: string;
}

export interface Demande {
  id: string;
  eventId: string; // Lien avec l'événement du client
  clientName: string;
  eventType: string;
  eventDate: string;
  prestataireId: string;
  status: "Nouvelle demande" | "En discussion" | "Devis envoyé" | "Confirmé" | "Acompte payé" | "Annulé" | "Réalisé";
  budget: number;
}

interface PrestataireContextType {
  prestataires: Prestataire[];
  demandes: Demande[];
  addDemande: (demande: Omit<Demande, 'id'>) => void;
  updateDemandeStatus: (id: string, status: Demande['status']) => void;
}

const PrestataireContext = createContext<PrestataireContextType | undefined>(undefined);

export function PrestataireProvider({ children }: { children: ReactNode }) {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  const fetchPrestataires = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'prestataire');
    if (data) {
      setPrestataires(data.map(p => ({
        id: p.id,
        name: p.full_name || "Prestataire",
        role: p.category || "Service",
        rating: 5,
        phone: p.phone || "Non renseigné",
        isPlatformProvider: true,
        zone: p.address || "Non renseigné",
        description: p.description || "",
        services: p.category ? [p.category] : [],
        priceRange: "Sur devis"
      })));
    }
  };

  const fetchDemandes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // We fetch all requests (RLS will filter automatically based on if user is client or provider)
    const { data, error } = await supabase.from('demandes_devis')
      .select(`
        id, event_id, prestataire_id, status, budget_propose,
        events ( name, type, date, client_id )
      `);
      
    if (data) {
      // 1. Get current user's profile to know their role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      // 2. Filter securely in JS just in case RLS is missing or misconfigured
      let filteredData = data;
      if (profile?.role === 'client') {
        filteredData = data.filter((d: any) => d.events?.client_id === user.id);
      } else if (profile?.role === 'prestataire') {
        filteredData = data.filter((d: any) => d.prestataire_id === user.id);
      }

      setDemandes(filteredData.map((d: any) => ({
        id: d.id,
        eventId: d.event_id,
        clientName: d.events?.name || "Client",
        eventType: d.events?.type || "Événement",
        eventDate: d.events?.date || "À définir",
        prestataireId: d.prestataire_id,
        status: d.status,
        budget: Number(d.budget_propose)
      })));
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchPrestataires();
      await fetchDemandes();
      setIsLoaded(true);
    };

    initData();
  }, []);

  const addDemande = async (demande: Omit<Demande, 'id'>) => {
    const { data, error } = await supabase.from('demandes_devis').insert([{
      event_id: demande.eventId,
      prestataire_id: demande.prestataireId,
      status: demande.status,
      budget_propose: demande.budget
    }]).select().single();
    
    if (data) {
      await fetchDemandes();
    }
  };

  const updateDemandeStatus = async (id: string, status: Demande['status']) => {
    const { error } = await supabase.from('demandes_devis').update({ status }).eq('id', id);
    if (!error) {
      await fetchDemandes();
    }
  };

  if (!isLoaded) return null;

  return (
    <PrestataireContext.Provider value={{ prestataires, demandes, addDemande, updateDemandeStatus }}>
      {children}
    </PrestataireContext.Provider>
  );
}

export function usePrestataires() {
  const context = useContext(PrestataireContext);
  if (context === undefined) {
    throw new Error('usePrestataires must be used within a PrestataireProvider');
  }
  return context;
}
