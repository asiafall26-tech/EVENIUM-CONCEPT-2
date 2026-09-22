export type EventStatus = "draft" | "published" | "completed";
export type EventType = "Mariage" | "Anniversaire" | "Baptême" | "Baby shower" | "Conférence" | "Événement professionnel" | "Gala" | "Fiançailles";
export type PlanType = "Premium" | "Gold";
export type FormatType = "Carte" | "Animée";

export interface Event {
  id: string;
  name: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  guestsCount: number;
  plan: PlanType;
  format: FormatType;
  status: EventStatus;
  budget: {
    total: number;
    spent: number;
  };
  guests: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  tasks: {
    total: number;
    completed: number;
  };
  providersCount: number;
}

export const mockEvents: Event[] = [
  {
    id: "evt-001",
    name: "Mariage Astou & Ali",
    type: "Mariage",
    date: "20 Septembre 2026",
    time: "14:00",
    location: "Dakar, Sénégal",
    guestsCount: 150,
    plan: "Gold",
    format: "Animée",
    status: "published",
    budget: {
      total: 2500000,
      spent: 1450000,
    },
    guests: {
      total: 124,
      confirmed: 87,
      pending: 25,
      declined: 12,
    },
    tasks: {
      total: 45,
      completed: 37,
    },
    providersCount: 3,
  },
  {
    id: "evt-002",
    name: "Anniversaire de Sophie",
    type: "Anniversaire",
    date: "10 Octobre 2026",
    time: "20:00",
    location: "Saly",
    guestsCount: 50,
    plan: "Premium",
    format: "Carte",
    status: "published",
    budget: {
      total: 500000,
      spent: 150000,
    },
    guests: {
      total: 50,
      confirmed: 30,
      pending: 15,
      declined: 5,
    },
    tasks: {
      total: 15,
      completed: 5,
    },
    providersCount: 0,
  }
];
