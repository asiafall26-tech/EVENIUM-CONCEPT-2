export type ProviderCategory = 
  | "Traiteurs"
  | "Décorateurs"
  | "Photographes"
  | "Vidéastes"
  | "DJ / Animation"
  | "Salles de réception"
  | "Wedding planners"
  | "Fleuristes"
  | "Location de matériel"
  | "Pâtissiers"
  | "Coiffeurs / maquilleurs"
  | "Transport"
  | "Sécurité";

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  services: string[];
  zone: string;
  phone: string;
  whatsapp: string;
  priceRange: string;
  gallery: string[];
  rating: number;
  isPlatformProvider: boolean;
}

export const mockProviders: Provider[] = [];

