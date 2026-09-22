export type InvitationType = "carte" | "animée";

export interface InvitationModel {
  id: string;
  name: string;
  type: InvitationType;
  thumbnail: string;
  isPremium: boolean;
  description: string;
}

export const mockInvitationModels: InvitationModel[] = [
  {
    id: "inv-001",
    name: "Golden Minimal",
    type: "carte",
    thumbnail: "/invit-1.jpg",
    isPremium: true,
    description: "Un design épuré avec des touches dorées, parfait pour un mariage élégant."
  },
  {
    id: "inv-002",
    name: "Floral Romance",
    type: "animée",
    thumbnail: "/invit-2.jpg",
    isPremium: true,
    description: "Une animation fluide de fleurs s'ouvrant pour dévoiler les détails de l'événement."
  },
  {
    id: "inv-003",
    name: "Classic Noir",
    type: "carte",
    thumbnail: "/invit-3.jpg",
    isPremium: false,
    description: "Noir et blanc intemporel avec une typographie serif luxueuse."
  },
  {
    id: "inv-004",
    name: "Modern Glass",
    type: "animée",
    thumbnail: "/invit-4.jpg",
    isPremium: true,
    description: "Effet glassmorphism dynamique avec de subtiles micro-animations."
  }
];
