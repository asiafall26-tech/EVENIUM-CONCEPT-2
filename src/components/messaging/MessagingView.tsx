"use client";

import { useMemo, useState, useRef, useEffect, type FormEvent, type RefObject } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  Inbox,
  MessageSquarePlus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Film,
  FileText,
  Loader2,
  Trash2,
  Plus,
  Tag,
  Phone,
  Mail,
  MapPin,
  Building,
  Info,
  Sliders,
  ChevronRight,
  User,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { extractFirstName, formatDisplayName } from "@/lib/devis/revisionMessages";
import {
  parseMediaMessage,
  createMediaMessage,
  getMediaSummaryText,
  formatFileSize,
  type MediaPayload,
  type MediaType,
} from "@/lib/messaging/mediaPayload";
import { MediaBubble } from "./MediaBubble";
import { VoiceRecorder } from "./VoiceRecorder";
import { MediaLightbox } from "./MediaLightbox";

/* Shared look of the three inboxes (admin, prestataire, organisateur). Data loading stays in each page. */

export interface InboxProfile {
  id?: string;
  role?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  category?: string | null;
  phone?: string | null;
  email?: string | null;
  company_name?: string | null;
  bio?: string | null;
  address?: string | null;
  created_at?: string | null;
  is_verified?: boolean;
}

export interface InboxMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read?: boolean | null;
}

export interface InboxConversation {
  id: string;
  profile?: InboxProfile;
  lastMessage: InboxMessage;
  messages: InboxMessage[];
  unread: number;
  eventContext?: {
    name: string;
    type?: string;
    date?: string;
  };
}

export interface ComposeGroup {
  label?: string;
  options: { value: string; label: string }[];
}

export interface PriorityBadge {
  id: string;
  label: string;
  colorName: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
  level: "haute" | "moyenne" | "normale" | "basse" | "personnalisee";
  isCustom?: boolean;
}

export const DEFAULT_PRIORITY_BADGES: PriorityBadge[] = [
  {
    id: "urgent",
    label: "Urgent",
    colorName: "red",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
    dotColor: "#ef4444",
    level: "haute",
  },
  {
    id: "important",
    label: "Important",
    colorName: "amber",
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
    dotColor: "#f59e0b",
    level: "haute",
  },
  {
    id: "en_attente",
    label: "En attente",
    colorName: "yellow",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-800",
    borderClass: "border-yellow-200",
    dotColor: "#eab308",
    level: "moyenne",
  },
  {
    id: "devis",
    label: "Devis / Offre",
    colorName: "sky",
    bgClass: "bg-sky-50",
    textClass: "text-sky-800",
    borderClass: "border-sky-200",
    dotColor: "#0284c7",
    level: "moyenne",
  },
  {
    id: "confirme",
    label: "Confirmé",
    colorName: "emerald",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
    dotColor: "#10b981",
    level: "normale",
  },
  {
    id: "vip",
    label: "VIP / Prestige",
    colorName: "purple",
    bgClass: "bg-purple-50",
    textClass: "text-purple-800",
    borderClass: "border-purple-200",
    dotColor: "#a855f7",
    level: "haute",
  },
  {
    id: "suivi",
    label: "À relancer",
    colorName: "gold",
    bgClass: "bg-[#fbf7f0]",
    textClass: "text-[#8f6f33]",
    borderClass: "border-[#b8924a]/40",
    dotColor: "#b8924a",
    level: "moyenne",
  },
];

export const BADGE_COLOR_PALETTES = [
  { name: "red", label: "Rouge vif", bgClass: "bg-red-50", textClass: "text-red-700", borderClass: "border-red-200", dotColor: "#ef4444" },
  { name: "rose", label: "Rose", bgClass: "bg-rose-50", textClass: "text-rose-700", borderClass: "border-rose-200", dotColor: "#f43f5e" },
  { name: "orange", label: "Orange", bgClass: "bg-orange-50", textClass: "text-orange-800", borderClass: "border-orange-200", dotColor: "#f97316" },
  { name: "amber", label: "Ambre", bgClass: "bg-amber-50", textClass: "text-amber-800", borderClass: "border-amber-200", dotColor: "#f59e0b" },
  { name: "yellow", label: "Jaune soleil", bgClass: "bg-yellow-50", textClass: "text-yellow-800", borderClass: "border-yellow-200", dotColor: "#eab308" },
  { name: "emerald", label: "Vert émeraude", bgClass: "bg-emerald-50", textClass: "text-emerald-800", borderClass: "border-emerald-200", dotColor: "#10b981" },
  { name: "teal", label: "Turquoise", bgClass: "bg-teal-50", textClass: "text-teal-800", borderClass: "border-teal-200", dotColor: "#14b8a6" },
  { name: "sky", label: "Bleu ciel", bgClass: "bg-sky-50", textClass: "text-sky-800", borderClass: "border-sky-200", dotColor: "#0284c7" },
  { name: "indigo", label: "Indigo", bgClass: "bg-indigo-50", textClass: "text-indigo-800", borderClass: "border-indigo-200", dotColor: "#6366f1" },
  { name: "purple", label: "Pourpre royal", bgClass: "bg-purple-50", textClass: "text-purple-800", borderClass: "border-purple-200", dotColor: "#a855f7" },
  { name: "gold", label: "Or Evenium", bgClass: "bg-[#fbf7f0]", textClass: "text-[#8f6f33]", borderClass: "border-[#b8924a]/50", dotColor: "#b8924a" },
  { name: "slate", label: "Ardoise", bgClass: "bg-stone-100", textClass: "text-stone-800", borderClass: "border-stone-300", dotColor: "#64748b" },
];

interface Props {
  /** Shown in the header: "Messagerie" + a short line about who you talk to */
  subtitle: string;
  myId: string | null;
  myProfile?: InboxProfile;
  conversations: InboxConversation[];
  activeConvId: string | null;
  onSelectConversation: (id: string | null) => void;
  reply: string;
  onReplyChange: (v: string) => void;
  onSendReply: (e?: FormEvent, customContent?: string) => void;
  onSendMessageContent?: (content: string) => Promise<{ success?: boolean; error?: string } | void>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  compose: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    recipient: string;
    onRecipientChange: (v: string) => void;
    message: string;
    onMessageChange: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    placeholder: string;
    groups: ComposeGroup[];
  };
}

/* ---------- Display helpers ---------- */

export function displayName(p?: InboxProfile) {
  if (p?.role === "admin") return "Support Evenium";
  return p?.full_name || "Utilisateur";
}

export function roleLabel(p?: InboxProfile) {
  if (p?.role === "admin") return "Équipe support";
  if (p?.role === "prestataire") return p.category || "Prestataire";
  if (p?.role === "client") return "Organisateur";
  return "Membre";
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U"
  );
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function listTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Hier";
  if (now.getTime() - d.getTime() < 6 * 864e5) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

const hourOf = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function personalizeMessage(
  rawContent: string,
  correspondentName: string,
  isMe: boolean,
  correspondentProfile?: InboxProfile,
  myProfile?: InboxProfile
): string {
  if (!rawContent) return rawContent;

  const organizerProfile = myProfile?.role === "client" ? myProfile : (correspondentProfile?.role === "client" ? correspondentProfile : undefined);
  const providerProfile = myProfile?.role === "prestataire" ? myProfile : (correspondentProfile?.role === "prestataire" ? correspondentProfile : undefined);

  let providerName = providerProfile?.company_name || providerProfile?.full_name || "";
  let organizerName = organizerProfile?.full_name || "";

  if (!providerName) {
    if (myProfile?.role === "client" && correspondentName && !["Utilisateur", "Client", "Prestataire"].includes(correspondentName)) {
      providerName = correspondentName;
    } else if (correspondentProfile?.role === "client" && myProfile?.full_name) {
      providerName = myProfile.company_name || myProfile.full_name;
    }
  }

  if (!organizerName) {
    if (myProfile?.role === "prestataire" && correspondentName && !["Utilisateur", "Client", "Prestataire"].includes(correspondentName)) {
      organizerName = correspondentName;
    } else if (correspondentProfile?.role === "prestataire" && myProfile?.full_name) {
      organizerName = myProfile.full_name;
    }
  }

  // Ne JAMAIS tronquer le nom du prestataire (GALA LIGHT reste GALA LIGHT)
  const providerFullName = providerName.trim() ? formatDisplayName(providerName.trim()) : "";
  const organizerFullName = organizerName.trim() ? formatDisplayName(organizerName.trim()) : "";
  const organizerFirstName = organizerFullName ? extractFirstName(organizerFullName, "L'organisateur") : "L'organisateur";

  const toProviderGreeting = providerFullName ? `Bonjour ${providerFullName},` : "Bonjour,";
  const toOrganizerGreeting = organizerFullName ? `Bonjour ${organizerFullName},` : "Bonjour,";

  let processed = rawContent;

  processed = processed
    .replace(/\[Prénom de l'organisateur\]/gi, organizerFullName || organizerFirstName)
    .replace(/\[Nom de l'organisateur\]/gi, organizerFullName || organizerFirstName)
    .replace(/\[Prénom du prestataire\]/gi, providerFullName || "Le prestataire")
    .replace(/\[Nom du prestataire\]/gi, providerFullName || "Le prestataire")
    .replace(/\[Prénom du client\]/gi, organizerFullName || organizerFirstName)
    .replace(/\[Nom du client\]/gi, organizerFullName || organizerFirstName);

  if (organizerFullName && organizerFullName !== "ASTOU") {
    processed = processed.replace(/\bASTOU\b/g, organizerFullName);
  }
  if (providerFullName && providerFullName !== "MISS") {
    processed = processed.replace(/\bMISS\b/g, providerFullName);
  }

  // Harmoniser les messages de révision structurés
  if (
    processed.includes("🔄 Demande de révision de devis") ||
    processed.includes("souhaite apporter des ajustements supplémentaires")
  ) {
    // Organisateur -> Prestataire : le destinataire est le Prestataire
    if (providerFullName) {
      processed = processed.replace(/Bonjour\s+Le prestataire,/g, toProviderGreeting);
      processed = processed.replace(/^Bonjour\s+[^,\n]+,/m, toProviderGreeting);
    }
    return processed;
  }

  if (
    processed.includes("a pris en compte votre demande de révision") ||
    processed.includes("✨ Votre devis a été révisé !") ||
    processed.includes("ne peut pas donner suite à votre demande de révision")
  ) {
    // Prestataire -> Organisateur : le destinataire est l'Organisateur
    if (organizerFullName) {
      processed = processed.replace(/Bonjour\s+L'organisateur,/g, toOrganizerGreeting);
      processed = processed.replace(/^Bonjour\s+[^,\n]+,/m, toOrganizerGreeting);
    }
    return processed;
  }

  if (
    processed.includes("🎉 Votre devis a été accepté !") ||
    processed.includes("n'a pas retenu votre proposition révisée")
  ) {
    return processed;
  }

  // 1. Acceptation de devis : Organisateur -> Prestataire (Destinataire = Prestataire)
  if (
    rawContent.includes("a été accepté par le client") ||
    rawContent.includes("a été automatiquement programmé dans votre planning") ||
    rawContent.includes("j'ai validé votre devis n°") ||
    rawContent.includes("j'accepte votre proposition de devis")
  ) {
    const devisMatch = rawContent.match(/(?:Votre devis n°|proposition de devis n°|votre devis n°)\s*([^\s(]+)(?:\s*\(([^)]+)\))?/i);
    const eventMatch = rawContent.match(/(?:L'événement|pour l'événement)\s*["«]([^"»]+)["»]/i);
    const dateMatch = rawContent.match(/(?:pour le|prévu le|date du)\s*([^\n.]+)/i);

    const devisRef = devisMatch?.[1] || "DEV";
    const montant = devisMatch?.[2] ? ` (${devisMatch[2]})` : "";
    const eventName = eventMatch?.[1] ? ` « ${eventMatch[1]} »` : "";
    const dateStr = dateMatch?.[1] ? ` prévu le ${dateMatch[1].trim()}` : "";

    return `${toProviderGreeting}\n\nJ'ai bien reçu votre proposition de devis n° ${devisRef}${montant} pour l'événement${eventName}${dateStr}.\n\nJ'ai le plaisir de vous informer que j'accepte votre proposition de devis ! La prestation est ainsi officiellement confirmée dans notre planning.\n\nAu plaisir de collaborer avec vous !`;
  }

  // 2. Proposition de devis : Prestataire -> Organisateur (Destinataire = Organisateur)
  if (
    rawContent.includes("transmettre ma proposition de devis") ||
    rawContent.includes("ma proposition de devis n°") ||
    rawContent.includes("Proposition de devis n°")
  ) {
    const devisMatch = rawContent.match(/proposition de devis n°\s*([^\s(]+)(?:\s*(?:pour un montant de|\()([^)\n]+)\)?)?/i);
    const eventMatch = rawContent.match(/pour (?:l'événement|votre événement)\s*["«]([^"»]+)["»]/i);
    const devisRef = devisMatch?.[1] || "DEV";
    const montant = devisMatch?.[2] ? ` (${devisMatch[2].trim()})` : "";
    const eventName = eventMatch?.[1] ? ` « ${eventMatch[1]} »` : "";

    return `${toOrganizerGreeting}\n\nSuite à votre demande, j'ai le plaisir de vous transmettre ma proposition de devis n° ${devisRef}${montant} pour votre événement${eventName}.\n\nVous pouvez consulter le détail de ma proposition et la valider directement dans votre espace Devis.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire !`;
  }

  // 3. Demande de devis : Organisateur -> Prestataire (Destinataire = Prestataire)
  if (
    rawContent.includes("demande de devis pour la prestation") ||
    rawContent.includes("solliciter une proposition de devis") ||
    rawContent.includes("Demandes de devis")
  ) {
    const prestMatch = rawContent.match(/prestation\s*["«]([^"»]+)["»]/i);
    const serviceName = prestMatch?.[1] ? ` « ${prestMatch[1]} »` : "votre prestation";

    return `${toProviderGreeting}\n\nJe prépare mon événement et je souhaiterais solliciter une proposition de devis de votre part pour la prestation ${serviceName}.\n\nPourriez-vous me préparer et me transmettre votre proposition tarifaire détaillée ?\n\nMerci d'avance pour votre proposition !`;
  }

  // 4. Demande d'ajustement / révision : Organisateur -> Prestataire (Destinataire = Prestataire)
  if (rawContent.startsWith("[Demande de révision sur devis") || rawContent.includes("souhaiterais solliciter un ajustement")) {
    const refMatch = rawContent.match(/(?:\[Demande de révision sur devis ref\s*([^\]]+)\]\s*:\s*([\s\S]*)|proposition de devis n°\s*([^\s,]+)[^«]*«\s*([\s\S]*?)\s*»)/i);
    const devisRef = refMatch?.[1] || refMatch?.[3] || "DEV";
    const userComment = refMatch?.[2] || refMatch?.[4] || "Ajustement demandé";
    return `${toProviderGreeting}\n\nConcernant votre proposition de devis n° ${devisRef.trim()}, je souhaiterais solliciter un ajustement :\n\n« ${userComment.trim()} »\n\nMerci d'avance pour votre prise en compte !`;
  }

  // 5. Contre-proposition du prestataire : Prestataire -> Organisateur (Destinataire = Organisateur)
  if (rawContent.includes("Concernant votre demande de devis pour") && rawContent.includes("Je vous propose un ajustement")) {
    return processed.replace(/^Bonjour\s*[^,\n]*,/m, toOrganizerGreeting);
  }

  // 6. Confirmation d'événement par le prestataire : Prestataire -> Organisateur (Destinataire = Organisateur)
  if (rawContent.includes("J'ai le plaisir de vous confirmer la prise en charge de votre événement")) {
    return processed.replace(/^Bonjour\s*[^,\n]*,/m, toOrganizerGreeting);
  }

  // 7. Support Evenium : Support -> Utilisateur
  if (rawContent.includes("Mise à jour Support :") && rawContent.includes("a été marquée comme résolue")) {
    const subjMatch = rawContent.match(/le sujet\s*"([^"]+)"/i);
    const subject = subjMatch?.[1] ? ` « ${subjMatch[1]} »` : "votre réclamation";
    const targetUser = (myProfile?.role === "admin" ? correspondentName : myProfile?.full_name) || "";
    const userGreeting = targetUser && !["Utilisateur", "Client", "Prestataire"].includes(targetUser) ? `Bonjour ${formatDisplayName(targetUser)},` : "Bonjour,";
    return `${userGreeting}\n\nNotre équipe Support Evenium vous informe que votre demande concernant ${subject} a bien été résolue par nos équipes.\n\nNous restons à votre entière disposition pour toute question !`;
  }

  return processed;
}

export function formatPreviewSummary(
  rawContent: string,
  correspondentName: string,
  fromMe: boolean
): string {
  if (!rawContent) return "Nouvelle conversation";

  const parsedMedia = parseMediaMessage(rawContent);
  if (parsedMedia.isMedia && parsedMedia.media) {
    const summary = getMediaSummaryText(parsedMedia.media);
    return fromMe ? `Vous : ${summary}` : summary;
  }

  if (rawContent.includes("🔄 Demande de révision de devis") || rawContent.includes("souhaite apporter des ajustements supplémentaires")) {
    const devisMatch = rawContent.match(/devis n°\s*([^\s,]+)/i);
    const ref = devisMatch?.[1] || "";
    return fromMe ? `Vous : Demande de révision ${ref}` : `🔄 Demande de révision ${ref}`;
  }

  if (rawContent.includes("a pris en compte votre demande de révision")) {
    return fromMe ? `Vous : Révision prise en compte` : `Révision en cours de traitement`;
  }

  if (rawContent.includes("✨ Votre devis a été révisé !")) {
    return fromMe ? `Vous : Nouvelle version transmise` : `✨ Devis révisé disponible`;
  }

  if (rawContent.includes("ne peut pas donner suite à votre demande de révision")) {
    return fromMe ? `Vous : Révision déclinée` : `Révision non retenue`;
  }

  if (rawContent.includes("🎉 Votre devis a été accepté !")) {
    return fromMe ? `Vous : Devis validé` : `🎉 Devis accepté !`;
  }

  if (rawContent.includes("n'a pas retenu votre proposition révisée")) {
    return fromMe ? `Vous : Proposition déclinée` : `Proposition révisée non retenue`;
  }

  if (
    rawContent.includes("a été accepté par le client") ||
    rawContent.includes("a été automatiquement programmé dans votre planning") ||
    rawContent.includes("j'ai validé votre devis n°") ||
    rawContent.includes("j'accepte votre proposition de devis")
  ) {
    const devisMatch = rawContent.match(/(?:Votre devis n°|proposition de devis n°|votre devis n°)\s*([^\s(]+)/i);
    const devisRef = devisMatch?.[1] || "DEV";
    return fromMe
      ? `Vous : J'accepte votre proposition de devis n° ${devisRef}`
      : `Proposition de devis n° ${devisRef} acceptée`;
  }

  if (
    rawContent.includes("transmettre ma proposition de devis") ||
    rawContent.includes("ma proposition de devis n°") ||
    rawContent.includes("Proposition de devis n°")
  ) {
    const devisMatch = rawContent.match(/proposition de devis n°\s*([^\s(]+)/i);
    const devisRef = devisMatch?.[1] || "DEV";
    return fromMe
      ? `Vous : Proposition de devis n° ${devisRef}`
      : `${correspondentName} : Proposition de devis n° ${devisRef}`;
  }

  if (
    rawContent.includes("demande de devis pour la prestation") ||
    rawContent.includes("solliciter une proposition de devis") ||
    rawContent.includes("Demandes de devis")
  ) {
    const prestMatch = rawContent.match(/prestation\s*["«]([^"»]+)["»]/i);
    const serviceName = prestMatch?.[1] ? ` (« ${prestMatch[1]} »)` : "";
    return fromMe
      ? `Vous : Demande de proposition de devis${serviceName}`
      : `Demande de proposition de devis${serviceName}`;
  }

  if (rawContent.includes("Demande de révision sur devis") || rawContent.includes("solliciter un ajustement")) {
    const devisMatch = rawContent.match(/(?:devis ref|proposition de devis n°|devis n°)\s*([^\s\]]+)/i);
    const devisRef = devisMatch?.[1] || "";
    return fromMe
      ? `Vous : Demande d'ajustement sur votre proposition ${devisRef}`
      : `Demande d'ajustement sur votre proposition ${devisRef}`;
  }

  if (rawContent.includes("Mise à jour Support :") || rawContent.includes("résolue par nos équipes")) {
    return "Support Evenium : Ticket résolu avec succès";
  }

  const cleanLine = rawContent.replace(/\s+/g, " ").trim();
  return fromMe ? `Vous : ${cleanLine}` : cleanLine;
}

function Avatar({ profile, size = "md" }: { profile?: InboxProfile; size?: "sm" | "md" | "lg" | "xl" }) {
  const dims =
    size === "xl"
      ? "w-20 h-20 text-2xl"
      : size === "lg"
      ? "w-12 h-12 text-sm"
      : size === "sm"
      ? "w-8 h-8 text-[11px]"
      : "w-11 h-11 text-sm";

  if (profile?.role === "admin") {
    return (
      <div className={`${dims} shrink-0 rounded-full bg-gradient-to-br from-[#d9c08c] to-[#8f6f33] text-[#241b13] flex items-center justify-center shadow-sm ring-2 ring-white`}>
        <ShieldCheck size={size === "xl" ? 36 : size === "sm" ? 14 : 18} />
      </div>
    );
  }
  if (profile?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from any storage host
    return <img src={profile.avatar_url} alt="" className={`${dims} shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm`} />;
  }
  return (
    <div className={`${dims} shrink-0 rounded-full bg-gradient-to-br from-[#efe6d6] to-[#dfceb0] text-[#7a5e2b] font-bold flex items-center justify-center ring-2 ring-white shadow-sm`}>
      {initials(displayName(profile))}
    </div>
  );
}

/* ---------- Component ---------- */

export function MessagingView({
  subtitle,
  myId,
  myProfile,
  conversations,
  activeConvId,
  onSelectConversation,
  reply,
  onReplyChange,
  onSendReply,
  onSendMessageContent,
  messagesEndRef,
  compose,
}: Props) {
  const [query, setQuery] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const totalUnread = conversations.reduce((n, c) => n + (c.unread || 0), 0);

  // Badges de priorité personnalisables
  const [priorityBadges, setPriorityBadges] = useState<PriorityBadge[]>(DEFAULT_PRIORITY_BADGES);
  const [convBadges, setConvBadges] = useState<Record<string, string>>({});
  const [selectedFilterBadge, setSelectedFilterBadge] = useState<string | null>(null);
  const [isBadgeManagerOpen, setIsBadgeManagerOpen] = useState(false);
  const [isBadgePickerOpen, setIsBadgePickerOpen] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Formulaire création badge
  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("red");
  const [newBadgeLevel, setNewBadgeLevel] = useState<PriorityBadge["level"]>("haute");

  // Charger les badges et associations depuis le localStorage pour chaque utilisateur
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKeyBadges = `evenium_priority_badges_${myId || "shared"}`;
    const storageKeyConv = `evenium_conv_badges_${myId || "shared"}`;

    try {
      const savedBadges = localStorage.getItem(storageKeyBadges);
      if (savedBadges) {
        const parsed = JSON.parse(savedBadges);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPriorityBadges(parsed);
        }
      }
      const savedConvBadges = localStorage.getItem(storageKeyConv);
      if (savedConvBadges) {
        const parsedConv = JSON.parse(savedConvBadges);
        if (parsedConv && typeof parsedConv === "object") {
          setConvBadges(parsedConv);
        }
      }
    } catch (e) {
      console.warn("Erreur lecture badges localStorage:", e);
    }
  }, [myId]);

  const handleAssignBadge = (convId: string, badgeId: string | null) => {
    setConvBadges((prev) => {
      const next = { ...prev };
      if (badgeId) {
        next[convId] = badgeId;
      } else {
        delete next[convId];
      }
      if (typeof window !== "undefined") {
        const storageKeyConv = `evenium_conv_badges_${myId || "shared"}`;
        localStorage.setItem(storageKeyConv, JSON.stringify(next));
      }
      return next;
    });
    setIsBadgePickerOpen(false);
  };

  const handleCreateCustomBadge = (e: FormEvent) => {
    e.preventDefault();
    if (!newBadgeLabel.trim()) return;

    const palette = BADGE_COLOR_PALETTES.find((p) => p.name === newBadgeColor) || BADGE_COLOR_PALETTES[0];
    const newBadge: PriorityBadge = {
      id: `custom_${Date.now()}`,
      label: newBadgeLabel.trim(),
      colorName: palette.name,
      bgClass: palette.bgClass,
      textClass: palette.textClass,
      borderClass: palette.borderClass,
      dotColor: palette.dotColor,
      level: newBadgeLevel,
      isCustom: true,
    };

    const updated = [...priorityBadges, newBadge];
    setPriorityBadges(updated);
    if (typeof window !== "undefined") {
      const storageKeyBadges = `evenium_priority_badges_${myId || "shared"}`;
      localStorage.setItem(storageKeyBadges, JSON.stringify(updated));
    }
    setNewBadgeLabel("");
  };

  const handleDeleteCustomBadge = (badgeId: string) => {
    const updated = priorityBadges.filter((b) => b.id !== badgeId);
    setPriorityBadges(updated);
    if (typeof window !== "undefined") {
      const storageKeyBadges = `evenium_priority_badges_${myId || "shared"}`;
      localStorage.setItem(storageKeyBadges, JSON.stringify(updated));
    }
    setConvBadges((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cid) => {
        if (next[cid] === badgeId) delete next[cid];
      });
      if (typeof window !== "undefined") {
        const storageKeyConv = `evenium_conv_badges_${myId || "shared"}`;
        localStorage.setItem(storageKeyConv, JSON.stringify(next));
      }
      return next;
    });
    if (selectedFilterBadge === badgeId) {
      setSelectedFilterBadge(null);
    }
  };

  const allContacts = useMemo(() => {
    const list: { value: string; label: string; group?: string }[] = [];
    compose.groups.forEach((g) => {
      g.options.forEach((o) => {
        list.push({ ...o, group: g.label });
      });
    });
    return list;
  }, [compose.groups]);

  const filteredContacts = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter((c) => c.label.toLowerCase().includes(q));
  }, [allContacts, modalSearch]);

  // Multimédia & Pièces jointes
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    previewUrl: string;
    type: MediaType;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{
    isOpen: boolean;
    url: string;
    name?: string;
    type?: "image" | "video";
  }>({ isOpen: false, url: "" });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const badgePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setIsAttachMenuOpen(false);
      }
      if (badgePickerRef.current && !badgePickerRef.current.contains(e.target as Node)) {
        setIsBadgePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectFile = (file: File, type: MediaType) => {
    setIsAttachMenuOpen(false);
    let max = 15 * 1024 * 1024;
    if (type === "video") max = 50 * 1024 * 1024;
    else if (type === "audio" || type === "file") max = 25 * 1024 * 1024;

    if (file.size > max) {
      alert(`Ce fichier est trop volumineux (maximum ${Math.round(max / (1024 * 1024))} Mo).`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingAttachment({ file, previewUrl, type });
  };

  const handleRemoveAttachment = () => {
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  };

  const uploadAndSendAttachment = async (e?: FormEvent) => {
    e?.preventDefault?.();
    if (!pendingAttachment || isUploading) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", pendingAttachment.file);
      formData.append("folder", "messages");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Échec du téléversement du fichier.");
      }

      const mediaMessage = createMediaMessage(
        pendingAttachment.type,
        json.url,
        pendingAttachment.file.name,
        {
          size: pendingAttachment.file.size,
          text: reply.trim() || undefined,
        }
      );

      URL.revokeObjectURL(pendingAttachment.previewUrl);
      setPendingAttachment(null);
      onReplyChange("");

      if (onSendMessageContent) {
        await onSendMessageContent(mediaMessage);
      } else {
        onSendReply(e, mediaMessage);
      }
    } catch (err: any) {
      console.error("Erreur envoi média:", err);
      alert(err.message || "Erreur lors de l'envoi de la pièce jointe.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVoiceNote = async (blob: Blob, durationSeconds: number) => {
    setIsUploading(true);
    try {
      const isMp4 = blob.type.includes("mp4");
      const ext = isMp4 ? "mp4" : "webm";
      const audioFile = new File([blob], `vocal_${Date.now()}.${ext}`, {
        type: blob.type || "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("folder", "messages");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Échec de l'envoi de la note vocale.");
      }

      const mediaMessage = createMediaMessage("audio", json.url, "Message vocal", {
        duration: durationSeconds,
        size: blob.size,
      });

      setIsRecordingVoice(false);

      if (onSendMessageContent) {
        await onSendMessageContent(mediaMessage);
      } else {
        onSendReply(undefined, mediaMessage);
      }
    } catch (err: any) {
      console.error("Erreur envoi vocal:", err);
      alert(err.message || "Erreur lors de l'envoi du message vocal.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pendingAttachment) {
      uploadAndSendAttachment(e);
    } else if (reply.trim()) {
      onSendReply(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleSelectFile(file, "image");
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const mime = file.type.toLowerCase();
      let type: MediaType = "file";
      if (mime.startsWith("image/")) type = "image";
      else if (mime.startsWith("video/")) type = "video";
      else if (mime.startsWith("audio/")) type = "audio";
      handleSelectFile(file, type);
    }
  };

  const filtered = useMemo(() => {
    let list = conversations;
    if (selectedFilterBadge) {
      list = list.filter((c) => convBadges[c.id] === selectedFilterBadge);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        displayName(c.profile).toLowerCase().includes(q) ||
        c.profile?.category?.toLowerCase().includes(q) ||
        c.profile?.company_name?.toLowerCase().includes(q) ||
        c.profile?.email?.toLowerCase().includes(q) ||
        c.profile?.phone?.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [conversations, query, selectedFilterBadge, convBadges]);

  const activeBadge = activeConv ? priorityBadges.find((b) => b.id === convBadges[activeConv.id]) : undefined;

  return (
    <div className="h-full w-full flex overflow-hidden min-h-0 bg-white rounded-none border-0 animate-in fade-in duration-300">
      {/* ===== Colonne Conversations ===== */}
      <aside
        className={`${
          activeConv ? "hidden md:flex" : "flex"
        } w-full md:w-[320px] lg:w-[360px] xl:w-[410px] shrink-0 flex-col border-r border-stone-200/90 bg-[#fcfbfa] h-full min-h-0 overflow-hidden`}
      >
        {/* En-tête de la liste */}
        <div
          className="p-4 lg:p-5 pb-3 border-b border-stone-200/70 shrink-0"
          style={{
            paddingTop: "max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("evenium:open-sidebar"))}
                aria-label="Ouvrir le menu"
                className="md:hidden p-1.5 -ml-1 rounded-xl text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer shrink-0"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                  Messagerie
                  {totalUnread > 0 && (
                    <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#E53935] text-white">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-stone-600 font-medium truncate mt-0.5">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={compose.onOpen}
              aria-label="Nouveau message"
              title="Nouvelle discussion"
              className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center shadow-md shadow-[#b8924a]/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <MessageSquarePlus size={18} />
            </button>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher nom, profil, texte…"
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all shadow-2xs"
            />
          </div>

          {/* Filtres par Badge de Priorité */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedFilterBadge(null)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedFilterBadge === null
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              Tous ({conversations.length})
            </button>

            {priorityBadges.map((badge) => {
              const count = conversations.filter((c) => convBadges[c.id] === badge.id).length;
              const isSelected = selectedFilterBadge === badge.id;
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setSelectedFilterBadge(isSelected ? null : badge.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? `${badge.bgClass} ${badge.textClass} ring-2 ring-[#b8924a]`
                      : `${badge.bgClass} ${badge.textClass} ${badge.borderClass} opacity-80 hover:opacity-100`
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.dotColor }} />
                  <span>{badge.label}</span>
                  {count > 0 && <span className="opacity-80 text-[10px]">({count})</span>}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsBadgeManagerOpen(true)}
              title="Personnaliser les badges de priorité"
              className="shrink-0 p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors ml-auto cursor-pointer"
            >
              <Sliders size={14} />
            </button>
          </div>
        </div>

        {/* Liste des conversations défilable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5 space-y-1">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#efe6d6] text-[#8f6f33] flex items-center justify-center mb-4">
                <Inbox size={28} />
              </div>
              <p className="font-bold text-stone-900">Votre boîte de réception est vide.</p>
              <p className="text-xs text-stone-600 mt-1 mb-4 font-medium">Démarrez une conversation pour échanger ici.</p>
              <button
                type="button"
                onClick={compose.onOpen}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold hover:scale-105 transition-transform"
              >
                Écrire un message
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm font-medium text-stone-600">Aucune discussion trouvée avec ces critères.</p>
              {selectedFilterBadge && (
                <button
                  type="button"
                  onClick={() => setSelectedFilterBadge(null)}
                  className="mt-3 text-xs font-bold text-[#b8924a] hover:underline"
                >
                  Afficher toutes les discussions
                </button>
              )}
            </div>
          ) : (
            filtered.map((c) => {
              const isActive = c.id === activeConvId;
              const fromMe = c.lastMessage?.sender_id === myId;
              const unread = c.unread > 0;
              const previewSummary = formatPreviewSummary(
                c.lastMessage?.content || "Nouvelle conversation",
                displayName(c.profile),
                fromMe
              );
              const badgeId = convBadges[c.id];
              const badge = badgeId ? priorityBadges.find((b) => b.id === badgeId) : undefined;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectConversation(c.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-white shadow-md ring-2 ring-[#b8924a]/70"
                      : "hover:bg-white/80 hover:shadow-2xs"
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <Avatar profile={c.profile} />
                    {unread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1.5">
                      <span
                        className={`truncate text-sm ${
                          unread ? "font-extrabold text-stone-950" : "font-bold text-stone-900"
                        }`}
                      >
                        {displayName(c.profile)}
                      </span>
                      <span
                        className={`shrink-0 text-[11px] font-semibold ${
                          unread ? "font-bold text-[#8f6f33]" : "text-stone-500"
                        }`}
                      >
                        {c.lastMessage?.created_at ? listTime(c.lastMessage.created_at) : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`truncate text-xs ${
                          unread ? "font-bold text-stone-950" : "text-stone-600 font-medium"
                        }`}
                      >
                        {previewSummary}
                      </p>
                      {unread && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center text-center text-[10px] font-bold px-1 rounded-full bg-[#E53935] text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] truncate">
                        {roleLabel(c.profile)}
                      </span>

                      {badge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.dotColor }} />
                          {badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ===== Zone de Discussion Principale ===== */}
      <section
        className={`${
          activeConv ? "flex" : "hidden md:flex"
        } flex-1 min-w-0 flex-col bg-[#faf8f5] h-full min-h-0 overflow-hidden relative`}
      >
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-[#b8924a]/10 border border-[#b8924a]/30 flex items-center justify-center text-[#b8924a]">
                <Send size={34} />
              </div>
              <Sparkles size={18} className="absolute -top-2 -right-2 text-[#b8924a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Espace Messagerie Evenium</h2>
            <p className="text-sm font-medium text-stone-600 mt-2 max-w-sm">
              Sélectionnez une discussion à gauche pour voir les échanges, partager des pièces jointes ou planifier des devis.
            </p>
            <button
              type="button"
              onClick={compose.onOpen}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#241b13] text-[#d9c08c] text-sm font-bold hover:bg-black transition-colors shadow-md cursor-pointer"
            >
              <MessageSquarePlus size={18} /> Nouveau message
            </button>
          </div>
        ) : (
          <>
            {/* Header de la discussion active */}
            <header
              className="shrink-0 px-4 sm:px-6 flex items-center justify-between gap-3 bg-white border-b border-stone-200/90 shadow-2xs z-10 transition-all"
              style={{
                paddingTop: "max(0.6rem, env(safe-area-inset-top, 0px))",
                minHeight: "calc(4.5rem + env(safe-area-inset-top, 0px))",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectConversation(null)}
                  aria-label="Retour aux conversations"
                  className="md:hidden p-2 -ml-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div
                  onClick={() => setShowProfileDrawer(true)}
                  className="flex items-center gap-3 cursor-pointer group min-w-0"
                  title="Voir le profil complet"
                >
                  <Avatar profile={activeConv.profile} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-stone-950 truncate group-hover:text-[#b8924a] transition-colors">
                        {displayName(activeConv.profile)}
                      </h2>
                      <Info size={14} className="text-stone-400 group-hover:text-[#b8924a] shrink-0" />
                    </div>
                    <p className="text-xs font-semibold text-[#8f6f33] truncate">
                      {roleLabel(activeConv.profile)}
                      {activeConv.profile?.company_name ? ` • ${activeConv.profile.company_name}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Raccourcis Header : Sélecteur de badge & Contexte événement */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Menu dropdown pour affecter un badge de priorité */}
                <div className="relative" ref={badgePickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsBadgePickerOpen(!isBadgePickerOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      activeBadge
                        ? `${activeBadge.bgClass} ${activeBadge.textClass} ${activeBadge.borderClass}`
                        : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/70"
                    }`}
                  >
                    <Tag size={13} />
                    <span>{activeBadge ? activeBadge.label : "Priorité"}</span>
                  </button>

                  {isBadgePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Marquer la discussion
                      </div>
                      <div className="space-y-1 my-1">
                        {priorityBadges.map((badge) => {
                          const isAssigned = convBadges[activeConv.id] === badge.id;
                          return (
                            <button
                              key={badge.id}
                              type="button"
                              onClick={() => handleAssignBadge(activeConv.id, isAssigned ? null : badge.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                isAssigned ? "bg-[#faf6ee] text-[#b8924a]" : "hover:bg-stone-100 text-stone-800"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: badge.dotColor }} />
                                <span>{badge.label}</span>
                              </div>
                              {isAssigned && <Check size={14} className="text-[#b8924a]" />}
                            </button>
                          );
                        })}
                      </div>

                      {activeBadge && (
                        <button
                          type="button"
                          onClick={() => handleAssignBadge(activeConv.id, null)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1 border-t border-stone-100 pt-1.5"
                        >
                          Retirer le badge de priorité
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsBadgePickerOpen(false);
                          setIsBadgeManagerOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors mt-1"
                      >
                        <Sliders size={13} />
                        <span>Créer un nouveau badge…</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Événement rattaché */}
                {activeConv.eventContext && (
                  <div className="hidden sm:flex items-center gap-2 bg-[#fbf7f0] border border-[#b8924a]/40 px-3 py-1.5 rounded-xl shadow-2xs max-w-[220px]">
                    <Calendar size={14} className="text-[#8f6f33] shrink-0" />
                    <div className="min-w-0 text-right">
                      <span className="block text-xs font-bold text-stone-950 truncate">
                        {activeConv.eventContext.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bouton Profil détaillé */}
                <button
                  type="button"
                  onClick={() => setShowProfileDrawer(true)}
                  title="Voir la fiche profil"
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <User size={18} />
                </button>
              </div>
            </header>

            {/* Zone des messages défilable */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 relative"
            >
              {/* Overlay glisser-déposer */}
              {isDragging && (
                <div className="absolute inset-4 z-20 rounded-2xl border-2 border-dashed border-[#b8924a] bg-[#faf8f5]/90 backdrop-blur-2xs flex flex-col items-center justify-center gap-3 text-stone-800 animate-in fade-in duration-150">
                  <div className="w-14 h-14 rounded-full bg-[#b8924a]/20 text-[#8f6f33] flex items-center justify-center">
                    <Paperclip size={28} />
                  </div>
                  <p className="font-serif text-base font-bold text-stone-900">
                    Déposez votre photo, vidéo ou document ici
                  </p>
                  <p className="text-xs text-stone-500 font-medium">
                    Le fichier sera prêt à être envoyé avec votre message
                  </p>
                </div>
              )}

              <div className="max-w-4xl mx-auto space-y-3 w-full">
                {activeConv.messages.map((msg, i) => {
                  const isMe = msg.sender_id === myId;
                  const prev = activeConv.messages[i - 1];
                  const next = activeConv.messages[i + 1];
                  const newDay = !prev || !sameDay(new Date(prev.created_at), new Date(msg.created_at));
                  const lastOfGroup =
                    !next ||
                    next.sender_id !== msg.sender_id ||
                    !sameDay(new Date(next.created_at), new Date(msg.created_at)) ||
                    new Date(next.created_at).getTime() - new Date(msg.created_at).getTime() > 5 * 60_000;

                  const parsedMedia = parseMediaMessage(msg.content);

                  return (
                    <div key={msg.id}>
                      {newDay && (
                        <div className="flex items-center gap-3 my-5">
                          <span className="flex-1 h-px bg-stone-300/80" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 first-letter:uppercase">
                            {dayLabel(msg.created_at)}
                          </span>
                          <span className="flex-1 h-px bg-stone-300/80" />
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (lastOfGroup ? <Avatar profile={activeConv.profile} size="sm" /> : <span className="w-8 shrink-0" />)}
                        <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-4.5 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words shadow-2xs font-normal sm:font-medium ${
                              isMe
                                ? `bg-gradient-to-br from-[#1f1712] via-[#1a130f] to-[#140e0a] text-white rounded-2xl ${
                                    lastOfGroup ? "rounded-br-md" : ""
                                  }`
                                : `bg-white text-stone-950 border border-stone-200/90 rounded-2xl ${
                                    lastOfGroup ? "rounded-bl-md" : ""
                                  }`
                            }`}
                          >
                            {parsedMedia.isMedia && parsedMedia.media ? (
                              <MediaBubble
                                media={parsedMedia.media}
                                isMe={isMe}
                                onOpenLightbox={(url, name, type) =>
                                  setLightboxMedia({ isOpen: true, url, name, type })
                                }
                              />
                            ) : (
                              personalizeMessage(
                                msg.content,
                                displayName(activeConv.profile),
                                isMe,
                                activeConv.profile,
                                myProfile
                              )
                            )}
                          </div>
                          {lastOfGroup && (
                            <span className="mt-1 px-1 flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
                              {hourOf(msg.created_at)}
                              {isMe &&
                                (msg.is_read ? (
                                  <CheckCheck size={14} className="text-[#b8924a]" aria-label="Lu" />
                                ) : (
                                  <Check size={14} aria-label="Envoyé" />
                                ))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer d'envoi en bas */}
            <div
              className="shrink-0 p-3 sm:p-4 bg-white border-t border-stone-200/90 shadow-2xs relative z-10 transition-all"
              style={{
                paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))",
              }}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0], "image")}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0], "video")}
              />
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0], "file")}
              />

              {/* Mode Vocal */}
              {isRecordingVoice ? (
                <VoiceRecorder onCancel={() => setIsRecordingVoice(false)} onSendAudio={handleSendVoiceNote} />
              ) : (
                <div className="max-w-4xl mx-auto space-y-2 w-full">
                  {/* Pièce jointe en attente */}
                  {pendingAttachment && (
                    <div className="flex items-center justify-between gap-3 p-2.5 px-3.5 bg-[#fbf7f0] border border-[#b8924a]/40 rounded-2xl shadow-2xs animate-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        {pendingAttachment.type === "image" && (
                          <img
                            src={pendingAttachment.previewUrl}
                            alt="Aperçu"
                            className="w-12 h-12 rounded-xl object-cover border border-[#b8924a]/30 shrink-0"
                          />
                        )}
                        {pendingAttachment.type === "video" && (
                          <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-[#d9c08c] shrink-0">
                            <Film size={20} />
                          </div>
                        )}
                        {pendingAttachment.type === "file" && (
                          <div className="w-12 h-12 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                            <FileText size={22} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">{pendingAttachment.file.name}</p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {formatFileSize(pendingAttachment.file.size)} •{" "}
                            {pendingAttachment.type === "image"
                              ? "Photo"
                              : pendingAttachment.type === "video"
                              ? "Vidéo"
                              : "Document"}{" "}
                            prêt à l'envoi
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                        title="Retirer la pièce jointe"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Formulaire message */}
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex items-center gap-2 p-1.5 pl-2.5 sm:pl-3 bg-[#faf8f5] border border-stone-300 rounded-full focus-within:ring-2 focus-within:ring-[#b8924a]/50 focus-within:border-[#b8924a] transition-all relative"
                  >
                    {/* Menu Pièce jointe (+) */}
                    <div className="relative" ref={attachMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                        aria-label="Joindre un fichier"
                        title="Joindre une photo, vidéo ou document"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-[#b8924a] hover:bg-white transition-all cursor-pointer"
                      >
                        <Plus
                          size={20}
                          className={`transition-transform duration-200 ${isAttachMenuOpen ? "rotate-45" : ""}`}
                        />
                      </button>

                      {isAttachMenuOpen && (
                        <div className="absolute bottom-12 left-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-stone-700 hover:bg-[#fbf7f0] hover:text-[#b8924a] transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <ImageIcon size={16} />
                            </div>
                            Photo / Image
                          </button>

                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-stone-700 hover:bg-[#fbf7f0] hover:text-[#b8924a] transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <Film size={16} />
                            </div>
                            Vidéo
                          </button>

                          <button
                            type="button"
                            onClick={() => docInputRef.current?.click()}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-stone-700 hover:bg-[#fbf7f0] hover:text-[#b8924a] transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            Document (PDF, Word)
                          </button>

                          <div className="my-1 border-t border-stone-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setIsAttachMenuOpen(false);
                              setIsRecordingVoice(true);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-stone-700 hover:bg-[#fbf7f0] hover:text-[#b8924a] transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <Mic size={16} />
                            </div>
                            Message vocal
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Champ de texte */}
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => onReplyChange(e.target.value)}
                      onPaste={handlePaste}
                      placeholder={
                        pendingAttachment
                          ? "Ajouter une légende à votre pièce jointe…"
                          : `Écrire à ${displayName(activeConv.profile)}…`
                      }
                      className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-medium text-stone-950 placeholder:text-stone-500 focus:outline-none"
                    />

                    {/* Bouton micro rapide */}
                    {!reply.trim() && !pendingAttachment && (
                      <button
                        type="button"
                        onClick={() => setIsRecordingVoice(true)}
                        aria-label="Enregistrer un message vocal"
                        title="Enregistrer un message vocal"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-[#b8924a] hover:bg-white transition-colors cursor-pointer shrink-0"
                      >
                        <Mic size={19} />
                      </button>
                    )}

                    {/* Bouton d'envoi */}
                    <button
                      type="submit"
                      disabled={(!reply.trim() && !pendingAttachment) || isUploading}
                      aria-label="Envoyer"
                      className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center shadow-md shadow-[#b8924a]/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                    >
                      {isUploading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ===== Tiroir Fiche Profil Détaillé du Contact ===== */}
      {showProfileDrawer && activeConv?.profile && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-stone-200"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Profil */}
            <div className="p-6 bg-[#fbf7f0] border-b border-[#b8924a]/30 relative">
              <button
                type="button"
                onClick={() => setShowProfileDrawer(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-white/80 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="relative mb-3">
                  <Avatar profile={activeConv.profile} size="xl" />
                  {activeConv.profile.role === "admin" && (
                    <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#b8924a] text-white ring-2 ring-white">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {displayName(activeConv.profile)}
                </h3>
                <p className="text-xs font-bold text-[#8f6f33] uppercase tracking-wider mt-1">
                  {roleLabel(activeConv.profile)}
                </p>
                {activeConv.profile.company_name && (
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    {activeConv.profile.company_name}
                  </p>
                )}
              </div>
            </div>

            {/* Informations renseignées dans les paramètres */}
            <div className="p-6 space-y-6 flex-1">
              {/* Badge de priorité attribué */}
              <div className="bg-[#fcfbfa] border border-stone-200/90 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Badge de priorité
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBadgeManagerOpen(true)}
                    className="text-[11px] font-bold text-[#b8924a] hover:underline"
                  >
                    Gérer
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {priorityBadges.map((badge) => {
                    const isAssigned = convBadges[activeConv.id] === badge.id;
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => handleAssignBadge(activeConv.id, isAssigned ? null : badge.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isAssigned
                            ? `${badge.bgClass} ${badge.textClass} ring-2 ring-[#b8924a]`
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.dotColor }} />
                        <span>{badge.label}</span>
                        {isAssigned && <Check size={12} className="text-[#b8924a]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coordonnées & Données profil */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Coordonnées vérifiées
                </h4>

                {/* Email */}
                {activeConv.profile.email ? (
                  <a
                    href={`mailto:${activeConv.profile.email}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:border-[#b8924a] hover:bg-[#fbf7f0] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">E-mail</span>
                        <span className="text-xs font-bold text-stone-900 group-hover:text-[#b8924a] truncate block">
                          {activeConv.profile.email}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-stone-400 group-hover:text-[#b8924a]" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-100 bg-stone-50 text-stone-400 text-xs">
                    <Mail size={16} /> Aucun e-mail renseigné
                  </div>
                )}

                {/* Téléphone */}
                {activeConv.profile.phone ? (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${activeConv.profile.phone}`}
                      className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:border-[#b8924a] hover:bg-[#fbf7f0] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">Appeler</span>
                        <span className="text-xs font-bold text-stone-900 group-hover:text-[#b8924a] truncate block">
                          {activeConv.profile.phone}
                        </span>
                      </div>
                    </a>

                    <a
                      href={`https://wa.me/${activeConv.profile.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-900 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        WA
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 block">WhatsApp</span>
                        <span className="text-xs font-bold text-emerald-950 truncate block">Discuter</span>
                      </div>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-100 bg-stone-50 text-stone-400 text-xs">
                    <Phone size={16} /> Aucun téléphone renseigné
                  </div>
                )}

                {/* Adresse / Localisation */}
                {activeConv.profile.address && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-white">
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Localisation</span>
                      <span className="text-xs font-semibold text-stone-900 block">
                        {activeConv.profile.address}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bio / Description */}
                {activeConv.profile.bio && (
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                      Présentation / Bio
                    </span>
                    <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
                      {activeConv.profile.bio}
                    </p>
                  </div>
                )}

                {/* Événement rattaché */}
                {activeConv.eventContext && (
                  <div className="p-4 rounded-xl border border-[#b8924a]/40 bg-[#fbf7f0]">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-[#8f6f33]" />
                      <span className="text-xs font-bold text-stone-900">
                        {activeConv.eventContext.name}
                      </span>
                    </div>
                    {activeConv.eventContext.type && (
                      <p className="text-[11px] font-semibold text-[#8f6f33]">
                        Type : {activeConv.eventContext.type}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pied du tiroir */}
            <div className="p-4 border-t border-stone-200 bg-[#fcfbfa]">
              <button
                type="button"
                onClick={() => setShowProfileDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Fermer la fiche profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modale de Personnalisation des Badges ===== */}
      <Modal
        isOpen={isBadgeManagerOpen}
        onClose={() => setIsBadgeManagerOpen(false)}
        title="Personnalisation des Badges de Priorité"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-xs text-stone-600">
            Personnalisez vos badges pour classer et retrouver facilement vos discussions selon votre propre niveau de priorité (urgent, devis, suivi, etc.).
          </p>

          {/* Formulaire ajout nouveau badge */}
          <form
            onSubmit={handleCreateCustomBadge}
            className="p-4 rounded-2xl bg-[#fbf7f0] border border-[#b8924a]/30 space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Plus size={15} className="text-[#b8924a]" />
              Créer un nouveau badge de priorité
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Nom du badge
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: À relancer sous 24h"
                  value={newBadgeLabel}
                  onChange={(e) => setNewBadgeLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Niveau d'importance
                </label>
                <select
                  value={newBadgeLevel}
                  onChange={(e) => setNewBadgeLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                >
                  <option value="haute">🔴 Haute priorité</option>
                  <option value="moyenne">🟡 Moyenne priorité</option>
                  <option value="normale">🟢 Priorité normale</option>
                  <option value="basse">🔵 Basse priorité</option>
                  <option value="personnalisee">🟣 Personnalisée</option>
                </select>
              </div>
            </div>

            {/* Choix de la couleur */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Couleur d'affichage
              </label>
              <div className="flex flex-wrap gap-2">
                {BADGE_COLOR_PALETTES.map((color) => {
                  const isSelected = newBadgeColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewBadgeColor(color.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        color.bgClass
                      } ${color.textClass} ${color.borderClass} ${
                        isSelected ? "ring-2 ring-stone-900 scale-105" : "hover:opacity-90"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.dotColor }} />
                      <span>{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newBadgeLabel.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
              >
                Ajouter ce badge
              </button>
            </div>
          </form>

          {/* Liste des badges existants */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Badges actifs ({priorityBadges.length})
            </h4>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {priorityBadges.map((badge) => {
                const count = conversations.filter((c) => convBadges[c.id] === badge.id).length;
                return (
                  <div
                    key={badge.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badge.dotColor }} />
                        {badge.label}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {count} discussion{count > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {badge.isCustom ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomBadge(badge.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Supprimer ce badge"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Par défaut
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsBadgeManagerOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== Nouveau message Modal Redessiné ===== */}
      <Modal isOpen={compose.isOpen} onClose={compose.onClose} title="Nouvelle discussion" maxWidth="lg">
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            Sélectionnez un contact pour ouvrir directement votre conversation en plein écran.
          </p>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              placeholder="Rechercher par nom, rôle ou spécialité..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#fbf7f0] border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a]"
              autoFocus
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs font-medium">
                Aucun contact ne correspond à votre recherche.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isBroadcast = contact.value.startsWith("all_") || contact.value === "everyone";
                const isSelected = compose.recipient === contact.value;
                const cleanName = contact.label.replace(/\(.*?\)/, "").trim();
                const roleMatch = contact.label.match(/\((.*?)\)/)?.[1];
                const contactInitials = cleanName
                  .split(/\s+/)
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase() || "EV";

                return (
                  <div
                    key={contact.value}
                    onClick={() => {
                      compose.onRecipientChange(contact.value);
                      if (!isBroadcast) {
                        onSelectConversation(contact.value);
                        compose.onClose();
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-[#faf6ee] border-[#b8924a] shadow-xs"
                        : "bg-white border-stone-200 hover:border-[#b8924a]/60 hover:bg-[#fbf7f0]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isBroadcast
                            ? "bg-purple-100 text-purple-800"
                            : contact.label.includes("Support")
                            ? "bg-[#241b13] text-[#d9c08c] ring-2 ring-[#b8924a]/30"
                            : "bg-gradient-to-br from-[#d9c08c]/40 to-[#b8924a]/20 text-[#8f6f33]"
                        }`}
                      >
                        {isBroadcast ? "📢" : contactInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-stone-900 group-hover:text-[#b8924a] transition-colors truncate">
                          {cleanName}
                        </div>
                        <div className="text-xs text-stone-500 font-medium truncate">
                          {isBroadcast ? "Diffusion groupée (Tous)" : roleMatch || contact.group || "Contact"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold group-hover:bg-[#b8924a] group-hover:text-white transition-all shrink-0 cursor-pointer"
                    >
                      {isBroadcast ? "Sélectionner" : "Discuter →"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {(compose.recipient.startsWith("all_") || compose.recipient === "everyone" || compose.message) && (
            <form onSubmit={compose.onSubmit} className="pt-3 border-t border-stone-200 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  {compose.recipient.startsWith("all_") || compose.recipient === "everyone"
                    ? "Message de diffusion groupée"
                    : "Ou écrivez un premier message immédiat :"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={compose.message}
                  onChange={(e) => compose.onMessageChange(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-4 py-2.5 bg-[#fbf7f0] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={compose.onClose}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={!compose.message.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#241b13] text-[#d9c08c] text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Envoyer
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Lightbox pour les images et vidéos en plein écran */}
      <MediaLightbox
        isOpen={lightboxMedia.isOpen}
        onClose={() => setLightboxMedia({ isOpen: false, url: "" })}
        url={lightboxMedia.url}
        name={lightboxMedia.name}
        type={lightboxMedia.type}
      />
    </div>
  );
}
