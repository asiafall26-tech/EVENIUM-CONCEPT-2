/**
 * Module centralisé de gestion des messages et données pour le système de révision des devis Evenium.
 */

export interface RevisionRequestData {
  devis_id?: string;
  devis_reference?: string;
  version?: number;
  subject: string; // "Prix / Budget" | "Quantité" | "Prestations incluses" | "Date ou planning" | "Autre"
  description: string;
  target_budget?: number | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  created_at?: string;
  client_id?: string;
  client_name?: string;
  provider_id?: string;
  provider_name?: string;
  event_name?: string;
  service_name?: string;
}

export interface RevisionResponseData {
  action: 'acknowledged' | 'refused' | 'new_version';
  motif_refus?: string;
  responded_at: string;
}

/**
 * Extrait le prénom d'un nom complet (ex: "Sophie Martin" -> "Sophie", "Alexandre Dupont" -> "Alexandre")
 * Si c'est déjà un prénom seul ou un rôle, le retourne nettoyé.
 */
export function extractFirstName(fullName?: string | null, fallback = "L'organisateur"): string {
  if (!fullName || !fullName.trim()) return fallback;
  const cleaned = fullName.trim();
  const lower = cleaned.toLowerCase();
  if (lower === "organisateur" || lower === "l'organisateur") return "L'organisateur";
  if (lower === "prestataire" || lower === "le prestataire") return "Le prestataire";
  if (lower === "client") return "L'organisateur";
  return cleaned.split(/\s+/)[0] || cleaned;
}

/**
 * Formate un nom complet ou nom commercial de prestataire
 */
export function formatDisplayName(fullName?: string | null, fallback = "Le prestataire"): string {
  if (!fullName || !fullName.trim()) return fallback;
  const cleaned = fullName.trim();
  return cleaned;
}

/**
 * 1. DEMANDE DE RÉVISION PAR L'ORGANISATEUR (Version 1)
 */
export function buildRevisionRequestMessage(params: {
  providerName: string;
  clientName: string;
  devisReference: string;
  serviceName: string;
  eventName: string;
  subject: string;
  description: string;
  targetBudget?: number | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  version?: number;
}): string {
  const version = params.version || 1;
  const provFirstName = extractFirstName(params.providerName, "Prestataire");
  const cliFirstName = extractFirstName(params.clientName, "L'organisateur");
  const devisRef = params.devisReference || "DEV";
  const servName = params.serviceName || "la prestation";
  const evName = params.eventName || "votre événement";

  if (version > 1) {
    // 5. NOUVELLE DEMANDE DE RÉVISION (Sur version > 1)
    let msg = `${cliFirstName} souhaite apporter des ajustements supplémentaires à votre devis n° ${devisRef}, version v${version}.\n\n`;
    msg += `Motif de la révision : ${params.subject}.\n\n`;
    msg += `Modifications demandées : ${params.description}.\n`;
    if (params.targetBudget) {
      msg += `\nBudget souhaité : ${params.targetBudget.toLocaleString('fr-FR')} FCFA.`;
    }
    if (params.attachmentUrl) {
      msg += `\nPièce jointe : ${params.attachmentName || 'Document'} (${params.attachmentUrl})`;
    }
    msg += `\n\nConsultez la demande et échangez avec l'organisateur pour trouver un accord.`;
    return msg;
  }

  // Version 1 standard
  let msg = `🔄 Demande de révision de devis\n\n`;
  msg += `Bonjour ${provFirstName},\n\n`;
  msg += `${cliFirstName} souhaite apporter des modifications à votre devis n° ${devisRef}, concernant la prestation ${servName} pour l'événement « ${evName} ».\n\n`;
  msg += `Motif de la révision : ${params.subject}.\n\n`;
  msg += `Précisions : ${params.description}.\n`;
  if (params.targetBudget) {
    msg += `\nBudget souhaité : ${params.targetBudget.toLocaleString('fr-FR')} FCFA.`;
  }
  if (params.attachmentUrl) {
    msg += `\nPièce jointe : ${params.attachmentName || 'Document'} (${params.attachmentUrl})`;
  }
  msg += `\n\nConsultez cette demande et transmettez une nouvelle proposition ou répondez à l'organisateur depuis votre messagerie.`;
  return msg;
}

/**
 * 2. PRISE EN COMPTE DE LA RÉVISION PAR LE PRESTATAIRE
 */
export function buildRevisionAcknowledgedMessage(params: {
  clientName: string;
  providerName: string;
  devisReference: string;
}): string {
  const cliFirstName = extractFirstName(params.clientName, "L'organisateur");
  const provName = formatDisplayName(params.providerName, "Le prestataire");
  const devisRef = params.devisReference || "DEV";

  return `Bonjour ${cliFirstName},\n\n${provName} a pris en compte votre demande de révision du devis n° ${devisRef}.\n\nVotre demande est en cours de traitement. Vous recevrez une notification dès qu'une nouvelle proposition sera disponible.\n\nMerci de votre confiance et à bientôt sur Evenium !`;
}

/**
 * 3. NOUVELLE VERSION DU DEVIS PAR LE PRESTATAIRE
 */
export function buildNewVersionMessage(params: {
  clientName: string;
  providerName?: string;
  prestataireName?: string;
  eventName: string;
  devisReference: string;
  version?: number;
  versionNumber?: number;
  oldTotal: number;
  newTotal: number;
  devisId?: string;
}): string {
  const cliFirstName = extractFirstName(params.clientName, "L'organisateur");
  const provName = formatDisplayName(params.prestataireName || params.providerName, "Le prestataire");
  const evName = params.eventName || "votre événement";
  const devisRef = params.devisReference || "DEV";
  const ver = params.versionNumber || params.version || 2;

  let msg = `✨ Votre devis a été révisé !\n\n`;
  msg += `Bonjour ${cliFirstName},\n\n`;
  msg += `Suite à votre demande de révision, ${provName} vous a transmis une nouvelle version du devis pour l'événement « ${evName} ».\n\n`;
  msg += `Numéro du devis : ${devisRef}.\n`;
  msg += `Version : v${ver}.\n`;
  msg += `Montant précédent : ${params.oldTotal.toLocaleString('fr-FR')} FCFA.\n`;
  msg += `Nouveau montant : ${params.newTotal.toLocaleString('fr-FR')} FCFA.\n\n`;
  msg += `Consultez cette proposition avant de prendre votre décision.`;
  return msg;
}

/**
 * 4. REFUS DE LA RÉVISION PAR LE PRESTATAIRE
 */
export function buildRevisionRefusedMessage(params: {
  clientName: string;
  providerName?: string;
  prestataireName?: string;
  devisReference: string;
  refusalReason: string;
}): string {
  const cliFirstName = extractFirstName(params.clientName, "L'organisateur");
  const provName = formatDisplayName(params.prestataireName || params.providerName, "Le prestataire");
  const devisRef = params.devisReference || "DEV";

  let msg = `Bonjour ${cliFirstName},\n\n`;
  msg += `${provName} ne peut pas donner suite à votre demande de révision du devis n° ${devisRef}.\n\n`;
  msg += `Motif : ${params.refusalReason}.\n\n`;
  msg += `Vous pouvez poursuivre la discussion avec le prestataire pour envisager une autre solution.\n\n`;
  msg += `Le devis initial reste valable uniquement si ses conditions et sa période de validité le permettent.`;
  return msg;
}

/**
 * 6. ACCEPTATION DU DEVIS RÉVISÉ PAR L'ORGANISATEUR
 */
export function buildRevisionAcceptedMessage(params: {
  clientName?: string;
  organizerName?: string;
  devisReference: string;
  version?: number;
  versionNumber?: number;
  finalTotal?: number;
  finalAmount?: number;
  eventName: string;
  eventDate?: string;
}): string {
  const cliFirstName = extractFirstName(params.organizerName || params.clientName, "L'organisateur");
  const devisRef = params.devisReference || "DEV";
  const evName = params.eventName || "Prestation";
  const evDate = params.eventDate || "la date convenue";
  const ver = params.versionNumber || params.version || 2;
  const total = params.finalAmount !== undefined ? params.finalAmount : (params.finalTotal || 0);

  let msg = `🎉 Votre devis a été accepté !\n\n`;
  msg += `${cliFirstName} vient d'accepter votre devis n° ${devisRef}, version v${ver}, pour un montant de ${total.toLocaleString('fr-FR')} FCFA.\n\n`;
  msg += `Événement : « ${evName} ».\n`;
  msg += `Date : ${evDate}.\n\n`;
  msg += `Retrouvez les détails de la prestation dans votre espace Evenium.`;
  return msg;
}

/**
 * 7. REFUS DU DEVIS RÉVISÉ PAR L'ORGANISATEUR
 */
export function buildRevisedQuoteRefusedMessage(params: {
  clientName?: string;
  organizerName?: string;
  devisReference: string;
  motif?: string;
  reason?: string;
}): string {
  const cliFirstName = extractFirstName(params.organizerName || params.clientName, "L'organisateur");
  const devisRef = params.devisReference || "DEV";
  const motifText = params.reason || params.motif;

  let msg = `${cliFirstName} n'a pas retenu votre proposition révisée pour le devis n° ${devisRef}.\n\n`;
  if (motifText && motifText.trim() !== '') {
    msg += `Motif éventuel : ${motifText.trim()}.\n\n`;
  }
  msg += `Vous pouvez poursuivre la discussion si les deux parties souhaitent rechercher un accord.`;
  return msg;
}
