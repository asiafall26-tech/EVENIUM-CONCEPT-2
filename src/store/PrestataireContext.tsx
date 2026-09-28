'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const mockPrestataires: Prestataire[] = [
  { 
    id: "PR-01",
    name: "Saveurs d'Afrique", 
    role: "Traiteur", 
    rating: 4.8, 
    phone: "+221 77 111 22 33", 
    isPlatformProvider: true,
    zone: "Dakar, Sénégal",
    description: "Service traiteur haut de gamme spécialisé dans la gastronomie africaine et internationale.",
    services: ["Buffet de mariage", "Service à table", "Cocktail dinatoire", "Gâteau sur mesure"],
    priceRange: "À partir de 15 000 FCFA / pax"
  },
  { 
    id: "PR-02",
    name: "Studio Lumière", 
    role: "Photographe", 
    rating: 4.9, 
    phone: "+221 76 222 33 44", 
    isPlatformProvider: true,
    zone: "Sénégal & International",
    description: "L'art de capturer vos plus beaux moments avec une touche cinématographique.",
    services: ["Couverture complète (journée)", "Shooting couple", "Drone vidéo", "Album photo premium"],
    priceRange: "À partir de 100 000 FCFA"
  },
  { 
    id: "PR-03",
    name: "Sons & Rythmes (DJ)", 
    role: "Animation", 
    rating: null, 
    phone: "+221 70 333 44 55", 
    isPlatformProvider: false,
    zone: "Dakar",
    description: "Prestataire externe gérant l'animation musicale.",
    services: ["DJ Set", "Sonorisation"],
    priceRange: "Sur devis"
  },
];

const mockDemandes: Demande[] = [
  { id: "dem-1", eventId: "evt-001", clientName: "Amina Diop", eventType: "Mariage", eventDate: "12 oct. 2026", prestataireId: "PR-01", status: "Nouvelle demande", budget: 1500000 },
  { id: "dem-2", eventId: "evt-002", clientName: "Moussa Kane", eventType: "Séminaire", eventDate: "5 nov. 2026", prestataireId: "PR-01", status: "En discussion", budget: 800000 },
];

const PrestataireContext = createContext<PrestataireContextType | undefined>(undefined);

export function PrestataireProvider({ children }: { children: ReactNode }) {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage or initialize with mocks
    const savedDemandes = localStorage.getItem('evenium_demandes');
    if (savedDemandes) {
      setDemandes(JSON.parse(savedDemandes));
    } else {
      setDemandes(mockDemandes);
      localStorage.setItem('evenium_demandes', JSON.stringify(mockDemandes));
    }
    
    // Prestataires catalogue is static for now, but could be dynamic later
    setPrestataires(mockPrestataires);
    setIsLoaded(true);
  }, []);

  const addDemande = (demande: Omit<Demande, 'id'>) => {
    const newDemande = { ...demande, id: `dem-${Date.now()}` };
    const updated = [newDemande, ...demandes];
    setDemandes(updated);
    localStorage.setItem('evenium_demandes', JSON.stringify(updated));
  };

  const updateDemandeStatus = (id: string, status: Demande['status']) => {
    const updated = demandes.map(d => d.id === id ? { ...d, status } : d);
    setDemandes(updated);
    localStorage.setItem('evenium_demandes', JSON.stringify(updated));
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
