/**
 * Module centralisé de gestion des formules et tarifs Evenium.
 * 
 * Formules avec Faire-part :
 * - Standard : 5 000 (Animée) / 3 500 (Carte)
 * - Premium  : 10 000 (Animée) / 7 500 (Carte)
 * - Gold VIP : 20 000 (Animée) / 15 000 (Carte)
 * 
 * Formule Prestataires (Sans invitation) :
 * - Jusqu'à 5 prestataires sollicités  : 10 000 FCFA
 * - Jusqu'à 10 prestataires sollicités : 15 000 FCFA
 * - Au-delà (Plus de 10 prestataires) : Sur devis
 */

export type EventPlanType = "Standard" | "Premium" | "Gold" | "Prestataires";

export interface PrestatairesTier {
  id: "5" | "10" | "devis";
  name: string;
  badge?: string;
  providersLimit: number;
  price: number;
  priceFormatted: string;
  subtitle: string;
  description: string;
  features: string[];
}

export const PRESTATAIRES_TIERS: PrestatairesTier[] = [
  {
    id: "5",
    name: "Pack 5 Prestataires",
    badge: "Essentiel",
    providersLimit: 5,
    price: 10000,
    priceFormatted: "10 000",
    subtitle: "Jusqu'à 5 prestataires sollicités",
    description: "Idéal pour sélectionner vos intervenants majeurs (lieu, traiteur, photographe, DJ, décoration).",
    features: [
      "Sollicitation de 5 prestataires différents maximum",
      "Accès complet à l'annuaire certifié Evenium (0% commission)",
      "Demandes de devis détaillées & négociation directe",
      "Messagerie intégrée avec les prestataires",
      "Gestion budgétaire & suivi des acomptes / soldes",
      "Checklist & rétroplanning intelligent du Jour J",
      "Support & assistance Evenium"
    ]
  },
  {
    id: "10",
    name: "Pack 10 Prestataires",
    badge: "Populaire",
    providersLimit: 10,
    price: 15000,
    priceFormatted: "15 000",
    subtitle: "Jusqu'à 10 prestataires sollicités",
    description: "Recommandé pour un événement complet avec mise en concurrence et recrutement de toute votre équipe.",
    features: [
      "Sollicitation de 10 prestataires différents maximum",
      "Accès complet à l'annuaire certifié Evenium (0% commission)",
      "Demandes de devis détaillées & négociation directe",
      "Messagerie intégrée avec les prestataires",
      "Gestion budgétaire complète & alertes de dépassement",
      "Checklist & rétroplanning intelligent du Jour J",
      "Support prioritaire Evenium"
    ]
  },
  {
    id: "devis",
    name: "Formule Sur Devis",
    badge: "Sur-mesure",
    providersLimit: Infinity,
    price: 0,
    priceFormatted: "Sur devis",
    subtitle: "Au-delà de 10 prestataires sollicités",
    description: "Pour les réceptions d'envergure nécessitant une équipe élargie et un accompagnement dédié.",
    features: [
      "Sollicitation de prestataires illimitée",
      "Accompagnement conciergerie sur-mesure",
      "Recherche personnalisée de prestataires rares",
      "Négociation tarifaire assistée par nos experts",
      "Suivi budgétaire multi-postes & audit des devis",
      "Support VIP 7j/7 dédié"
    ]
  }
];

export const PRESTATAIRES_TIERS_MAP: Record<"5" | "10" | "devis", PrestatairesTier> = {
  "5": PRESTATAIRES_TIERS[0],
  "10": PRESTATAIRES_TIERS[1],
  "devis": PRESTATAIRES_TIERS[2],
};

/**
 * Détermine si un plan correspond à la formule Prestataires
 */
export function isPrestatairesPlan(plan?: string | null): boolean {
  if (!plan) return false;
  return plan.toLowerCase().includes("prestataire");
}

/**
 * Détermine si un événement donne accès aux prestataires (Formule Gold ou Formule Prestataires)
 */
export function hasPrestatairesAccess(plan?: string | null): boolean {
  if (!plan) return false;
  const p = plan.toLowerCase();
  return p === "gold" || p.includes("prestataire");
}

/**
 * Récupère le quota maximal de prestataires pouvant être sollicités
 */
export function getPrestatairesQuota(plan?: string | null): number {
  if (!plan) return 0;
  if (!isPrestatairesPlan(plan)) {
    // Si Gold, accès illimité
    if (plan.toLowerCase() === "gold") return Infinity;
    return 0;
  }
  if (plan.includes("10")) return 10;
  if (plan.includes("5")) return 5;
  if (plan.toLowerCase().includes("devis") || plan.toLowerCase().includes("illimité") || plan.toLowerCase().includes("sur-mesure")) {
    return Infinity;
  }
  return 5;
}

/**
 * Libellé lisible du quota
 */
export function getPrestatairesQuotaLabel(plan?: string | null): string {
  if (!plan) return "";
  if (plan.includes("10")) return "Pack 10 Prestataires (15 000 FCFA)";
  if (plan.includes("5")) return "Pack 5 Prestataires (10 000 FCFA)";
  if (plan.toLowerCase().includes("devis")) return "Formule Sur Devis (Illimité)";
  return "Formule Prestataires";
}

/**
 * Calcule le montant officiel d'achat d'un événement selon sa formule et son format
 */
export function computeEventPrice(plan?: string | null, format?: string | null): number {
  if (!plan) return 0;
  const p = plan.toLowerCase();
  const isCarte = format?.toLowerCase().includes("carte");
  const isAnim = !isCarte && !format?.toLowerCase().includes("sans");

  // Formule Prestataires (Sans invitation)
  if (p.includes("prestataire")) {
    if (p.includes("10")) return 15000;
    if (p.includes("5")) return 10000;
    if (p.includes("devis")) return 0;
    return 10000;
  }

  // Formules avec invitation
  if (p === "gold") return isAnim ? 20000 : 15000;
  if (p === "standard") return isAnim ? 5000 : 3500;
  // Premium
  return isAnim ? 10000 : 7500;
}
