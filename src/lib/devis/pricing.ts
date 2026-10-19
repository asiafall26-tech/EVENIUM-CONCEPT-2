/**
 * Modes de tarification et calculs des devis.
 * Une ligne vaut : prix unitaire × quantité (si le mode en a une) × durée (si le mode en a une).
 */

export type PricingModeId =
  | "forfait"
  | "unitaire"
  | "par_personne"
  | "horaire"
  | "journalier"
  | "location"
  | "personnel"
  | "vehicule";

export interface PricingMode {
  id: PricingModeId;
  label: string;
  /** Libellé du prix saisi */
  priceLabel: string;
  /** Libellé de la quantité ; null = pas de quantité (forfait) */
  qtyLabel: string | null;
  /** Unité par défaut de la quantité */
  defaultUnit: string;
  /** L'unité de quantité est-elle libre (pièce, m², table…) ? */
  unitChoice?: boolean;
  /** Second multiplicateur (durée, trajets…) ; null = aucun */
  durationLabel: string | null;
  durationUnits?: string[];
}

export const PRICING_MODES: Record<PricingModeId, PricingMode> = {
  forfait: { id: "forfait", label: "Forfait", priceLabel: "Prix du forfait", qtyLabel: null, defaultUnit: "Forfait", durationLabel: null },
  unitaire: { id: "unitaire", label: "Prix unitaire × quantité", priceLabel: "Prix unitaire", qtyLabel: "Quantité", defaultUnit: "Pièce", unitChoice: true, durationLabel: null },
  par_personne: { id: "par_personne", label: "Par personne", priceLabel: "Prix par personne", qtyLabel: "Personnes", defaultUnit: "Personne", durationLabel: null },
  horaire: { id: "horaire", label: "Tarif horaire", priceLabel: "Tarif horaire", qtyLabel: "Heures", defaultUnit: "Heure", durationLabel: null },
  journalier: { id: "journalier", label: "Par journée", priceLabel: "Tarif journalier", qtyLabel: "Jours", defaultUnit: "Jour", durationLabel: null },
  location: { id: "location", label: "Location (quantité × durée)", priceLabel: "Prix unitaire par période", qtyLabel: "Quantité", defaultUnit: "Pièce", unitChoice: true, durationLabel: "Durée", durationUnits: ["Jour", "Heure", "Semaine", "Week-end"] },
  personnel: { id: "personnel", label: "Agents × durée", priceLabel: "Tarif par agent", qtyLabel: "Agents", defaultUnit: "Agent", durationLabel: "Durée", durationUnits: ["Heure", "Jour"] },
  vehicule: { id: "vehicule", label: "Par véhicule", priceLabel: "Tarif par véhicule", qtyLabel: "Véhicules", defaultUnit: "Véhicule", durationLabel: "Nombre de", durationUnits: ["Trajet", "Jour", "Demi-journée"] },
};

export const UNITS = [
  "Forfait", "Pièce", "Élément", "Personne", "Part", "Heure", "Jour", "Demi-journée", "Semaine",
  "m²", "Mètre linéaire", "Table", "Chaise", "Lot", "Kit", "Trajet", "Véhicule", "Agent",
  "Exemplaire", "Livrable", "Séance", "Plateau", "Bouteille", "Litre",
];

export interface DevisLine {
  /** Identifiant local (clé React) ou id en base */
  id: string | number;
  category_id?: string | null;
  designation: string;
  description?: string | null;
  pricing_mode?: PricingModeId | string | null;
  quantity: number;
  unit?: string | null;
  duration?: number | null;
  duration_unit?: string | null;
  unit_price: number;
  total: number;
}

export interface DevisOption {
  id: string | number;
  name: string;
  is_included: boolean;
  price: number;
}

export const modeOf = (id?: string | null): PricingMode =>
  PRICING_MODES[(id as PricingModeId) || "unitaire"] ?? PRICING_MODES.unitaire;

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function lineTotal(line: Pick<DevisLine, "pricing_mode" | "quantity" | "duration" | "unit_price">): number {
  const mode = modeOf(line.pricing_mode);
  const qty = mode.qtyLabel ? num(line.quantity) : 1;
  const dur = mode.durationLabel ? num(line.duration ?? 1) : 1;
  return Math.round(num(line.unit_price) * qty * dur);
}

/** Recalcule le total d'une ligne et aligne l'unité sur le mode. */
export function normalizeLine<T extends DevisLine>(line: T): T {
  const mode = modeOf(line.pricing_mode);
  const unit = mode.unitChoice ? line.unit || mode.defaultUnit : mode.defaultUnit;
  const quantity = mode.qtyLabel ? line.quantity : 1;
  const duration = mode.durationLabel ? line.duration ?? 1 : null;
  const duration_unit = mode.durationLabel ? line.duration_unit || mode.durationUnits?.[0] || null : null;
  const next = { ...line, unit, quantity, duration, duration_unit };
  return { ...next, total: lineTotal(next) };
}

export const formatFCFA = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} FCFA`;

/** Détail lisible du calcul d'une ligne, ex. « 120 personnes × 8 000 FCFA ». */
export function lineBreakdown(line: DevisLine): string {
  const mode = modeOf(line.pricing_mode);
  if (!line.pricing_mode) {
    return `${num(line.quantity)} ${line.unit || ""} × ${formatFCFA(num(line.unit_price))}`.replace(/\s+/g, " ");
  }
  if (mode.id === "forfait") return "Forfait";
  const parts = [`${num(line.quantity)} ${(line.unit || mode.defaultUnit).toLowerCase()}${num(line.quantity) > 1 ? "(s)" : ""}`];
  if (mode.durationLabel) parts.push(`${num(line.duration ?? 1)} ${(line.duration_unit || "").toLowerCase()}${num(line.duration ?? 1) > 1 ? "(s)" : ""}`);
  parts.push(formatFCFA(num(line.unit_price)));
  return parts.join(" × ");
}

export interface DevisAmountsInput {
  items: Pick<DevisLine, "total">[];
  options: DevisOption[];
  discountType: "amount" | "percentage";
  discountValue: number;
  taxRate: number;
  depositType: "amount" | "percentage";
  depositValue: number;
}

export interface DevisAmounts {
  subtotal: number;
  fees: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
}

/** Sous-total + frais − remise, puis taxes ; l'acompte se calcule sur le total TTC. */
export function computeAmounts(i: DevisAmountsInput): DevisAmounts {
  const subtotal = i.items.reduce((s, it) => s + num(it.total), 0);
  const fees = i.options.filter((o) => !o.is_included).reduce((s, o) => s + num(o.price), 0);
  const gross = subtotal + fees;
  const discount = Math.min(gross, i.discountType === "percentage" ? (gross * num(i.discountValue)) / 100 : num(i.discountValue));
  const taxable = Math.max(0, gross - discount);
  const tax = Math.round((taxable * num(i.taxRate)) / 100);
  const total = Math.round(taxable + tax);
  const deposit = Math.min(total, Math.round(i.depositType === "percentage" ? (total * num(i.depositValue)) / 100 : num(i.depositValue)));
  return { subtotal, fees, discount: Math.round(discount), taxable, tax, total, deposit, balance: Math.max(0, total - deposit) };
}

/**
 * Montant d'acompte en FCFA d'un devis enregistré.
 * Les anciens devis stockaient la valeur saisie (ex. 30 pour 30 %) dans deposit_amount.
 */
export function resolveDeposit(devis: any): number {
  if (!devis) return 0;
  if (devis.deposit_value !== undefined && devis.deposit_value !== null) return num(devis.deposit_amount);
  if (devis.deposit_type === "percentage") return Math.round((num(devis.total) * num(devis.deposit_amount)) / 100);
  return num(devis.deposit_amount);
}

/** Montant de remise en FCFA d'un devis enregistré (anciens devis : pourcentage stocké dans discount). */
export function resolveDiscount(devis: any): number {
  if (!devis) return 0;
  if (devis.discount_amount !== undefined && devis.discount_amount !== null) return num(devis.discount_amount);
  if (!num(devis.discount)) return 0;
  if (devis.discount_type === "percentage") return Math.round(((num(devis.subtotal) + num(devis.extra_fees)) * num(devis.discount)) / 100);
  return num(devis.discount);
}
