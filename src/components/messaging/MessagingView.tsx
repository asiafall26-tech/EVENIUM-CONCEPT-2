"use client";

import { useMemo, useState, type FormEvent, type RefObject } from "react";
import { ArrowLeft, Calendar, Check, CheckCheck, Inbox, MessageSquarePlus, Search, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { extractFirstName, formatDisplayName } from "@/lib/devis/revisionMessages";

/* Shared look of the three inboxes (admin, prestataire, organisateur). Data loading stays in each page. */

export interface InboxProfile {
  id?: string;
  role?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  category?: string | null;
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
  onSendReply: (e: FormEvent) => void;
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

  // Déterminer les profils réels en personne de l'organisateur et du prestataire
  const organizerProfile = myProfile?.role === "client" ? myProfile : (correspondentProfile?.role === "client" ? correspondentProfile : undefined);
  const providerProfile = myProfile?.role === "prestataire" ? myProfile : (correspondentProfile?.role === "prestataire" ? correspondentProfile : undefined);

  const organizerFirstName = organizerProfile ? extractFirstName(organizerProfile.full_name, "L'organisateur") : "L'organisateur";
  const providerFullName = providerProfile ? formatDisplayName(providerProfile.full_name, "Le prestataire") : "Le prestataire";
  const providerFirstName = providerProfile ? extractFirstName(providerProfile.full_name, "Le prestataire") : "Le prestataire";

  let processed = rawContent;

  // Remplacer les placeholders du système par les vrais noms en personne
  processed = processed
    .replace(/\[Prénom de l'organisateur\]/gi, organizerFirstName)
    .replace(/\[Nom de l'organisateur\]/gi, organizerProfile?.full_name || organizerFirstName)
    .replace(/\[Prénom du prestataire\]/gi, providerFirstName)
    .replace(/\[Nom du prestataire\]/gi, providerFullName)
    .replace(/\[Prénom du client\]/gi, organizerFirstName)
    .replace(/\[Nom du client\]/gi, organizerProfile?.full_name || organizerFirstName);

  // Remplacer les noms temporaires résiduels par les vrais noms dynamiques
  if (organizerFirstName && organizerFirstName !== "ASTOU") {
    processed = processed.replace(/\bASTOU\b/g, organizerFirstName);
  }
  if (providerFullName && providerFullName !== "MISS") {
    processed = processed.replace(/\bMISS\b/g, providerFullName);
  }

  // Si le message est déjà un des messages officiels du système de révision, le préserver
  if (
    processed.includes("🔄 Demande de révision de devis") ||
    processed.includes("a pris en compte votre demande de révision") ||
    processed.includes("✨ Votre devis a été révisé !") ||
    processed.includes("ne peut pas donner suite à votre demande de révision") ||
    processed.includes("souhaite apporter des ajustements supplémentaires") ||
    processed.includes("🎉 Votre devis a été accepté !") ||
    processed.includes("n'a pas retenu votre proposition révisée")
  ) {
    return processed;
  }

  const targetName =
    correspondentName &&
    correspondentName !== "Utilisateur" &&
    correspondentName !== "Prestataire" &&
    correspondentName !== "Client"
      ? extractFirstName(correspondentName, "")
      : "";

  const greeting = targetName ? `Bonjour ${targetName},` : "Bonjour,";

  // 1. Détection des acceptations de devis / proposition
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

    return `${greeting}\n\nJ'ai bien reçu votre proposition de devis n° ${devisRef}${montant} pour l'événement${eventName}${dateStr}.\n\nJ'ai le plaisir de vous informer que j'accepte votre proposition de devis ! La prestation est ainsi officiellement confirmée dans notre planning.\n\nAu plaisir de collaborer avec vous !`;
  }

  // 2. Détection des propositions de devis soumises par le prestataire
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

    return `${greeting}\n\nSuite à votre demande, j'ai le plaisir de vous transmettre ma proposition de devis n° ${devisRef}${montant} pour votre événement${eventName}.\n\nVous pouvez consulter le détail de ma proposition et la valider directement dans votre espace Devis.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire !`;
  }

  // 3. Détection des demandes de devis génériques formulées par l'organisateur
  if (
    rawContent.includes("demande de devis pour la prestation") ||
    rawContent.includes("solliciter une proposition de devis") ||
    rawContent.includes("Demandes de devis")
  ) {
    const prestMatch = rawContent.match(/prestation\s*["«]([^"»]+)["»]/i);
    const serviceName = prestMatch?.[1] ? ` « ${prestMatch[1]} »` : "votre prestation";

    return `${greeting}\n\nJe prépare mon événement et je souhaiterais solliciter une proposition de devis de votre part pour la prestation ${serviceName}.\n\nPourriez-vous me préparer et me transmettre votre proposition tarifaire détaillée ?\n\nMerci d'avance pour votre proposition !`;
  }

  // 4. Détection des demandes d'ajustement / révision
  if (rawContent.startsWith("[Demande de révision sur devis") || rawContent.includes("souhaiterais solliciter un ajustement")) {
    const refMatch = rawContent.match(/(?:\[Demande de révision sur devis ref\s*([^\]]+)\]\s*:\s*([\s\S]*)|proposition de devis n°\s*([^\s,]+)[^«]*«\s*([\s\S]*?)\s*»)/i);
    const devisRef = refMatch?.[1] || refMatch?.[3] || "DEV";
    const userComment = refMatch?.[2] || refMatch?.[4] || "Ajustement demandé";
    return `${greeting}\n\nConcernant votre proposition de devis n° ${devisRef.trim()}, je souhaiterais solliciter un ajustement :\n\n« ${userComment.trim()} »\n\nMerci d'avance pour votre prise en compte !`;
  }



  // 5. Détection des notifications support
  if (rawContent.includes("Mise à jour Support :") && rawContent.includes("a été marquée comme résolue")) {
    const subjMatch = rawContent.match(/le sujet\s*"([^"]+)"/i);
    const subject = subjMatch?.[1] ? ` « ${subjMatch[1]} »` : "votre réclamation";
    return `${greeting}\n\nNotre équipe Support Evenium vous informe que votre demande concernant ${subject} a bien été résolue par nos équipes.\n\nNous restons à votre entière disposition pour toute question !`;
  }

  return rawContent;
}

export function formatPreviewSummary(
  rawContent: string,
  correspondentName: string,
  fromMe: boolean
): string {
  if (!rawContent) return "Nouvelle conversation";

  // Messages officiels du système de révision
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

  // 1. Acceptation de proposition de devis
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

  // 2. Proposition de devis transmise par le prestataire
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

  // 3. Demande de proposition de devis de l'organisateur
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

  // 4. Demande d'ajustement / révision
  if (rawContent.includes("Demande de révision sur devis") || rawContent.includes("solliciter un ajustement")) {
    const devisMatch = rawContent.match(/(?:devis ref|proposition de devis n°|devis n°)\s*([^\s\]]+)/i);
    const devisRef = devisMatch?.[1] || "";
    return fromMe
      ? `Vous : Demande d'ajustement sur votre proposition ${devisRef}`
      : `Demande d'ajustement sur votre proposition ${devisRef}`;
  }

  // 5. Support
  if (rawContent.includes("Mise à jour Support :") || rawContent.includes("résolue par nos équipes")) {
    return "Support Evenium : Ticket résolu avec succès";
  }

  // Nettoyage des retours à la ligne pour le résumé en 1 ligne
  const cleanLine = rawContent.replace(/\s+/g, " ").trim();
  return fromMe ? `Vous : ${cleanLine}` : cleanLine;
}

function Avatar({ profile, size = "md" }: { profile?: InboxProfile; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-12 h-12 text-sm" : size === "sm" ? "w-8 h-8 text-[11px]" : "w-11 h-11 text-sm";
  if (profile?.role === "admin") {
    return (
      <div className={`${dims} shrink-0 rounded-full bg-gradient-to-br from-[#d9c08c] to-[#8f6f33] text-[#241b13] flex items-center justify-center shadow-sm ring-2 ring-white`}>
        <ShieldCheck size={size === "sm" ? 14 : 18} />
      </div>
    );
  }
  if (profile?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from any storage host
    return <img src={profile.avatar_url} alt="" className={`${dims} shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm`} />;
  }
  return (
    <div className={`${dims} shrink-0 rounded-full bg-[#efe6d6] text-[#7a5e2b] font-bold flex items-center justify-center ring-2 ring-white shadow-sm`}>
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
  messagesEndRef,
  compose,
}: Props) {
  const [query, setQuery] = useState("");
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const totalUnread = conversations.reduce((n, c) => n + (c.unread || 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => displayName(c.profile).toLowerCase().includes(q) || c.messages.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [conversations, query]);

  return (
    <div className="h-[calc(100dvh-64px-2rem)] sm:h-[calc(100dvh-80px-3rem)] lg:h-[calc(100dvh-80px-4rem)] min-h-[420px] rounded-2xl sm:rounded-3xl flex overflow-hidden bg-white border border-stone-200/70 shadow-[0_20px_60px_-30px_rgba(60,40,10,0.25)] animate-in fade-in duration-500">
      {/* ===== Conversation list ===== */}
      <aside className={`${activeConv ? "hidden md:flex" : "flex"} w-full md:w-[340px] lg:w-[380px] shrink-0 flex-col border-r border-stone-200/70 bg-gradient-to-b from-[#fbf7f0] to-white`}>
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                Messagerie
                {totalUnread > 0 && (
                  <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#E53935] text-white">{totalUnread > 99 ? "99+" : totalUnread}</span>
                )}
              </h1>
              <p className="text-xs text-stone-600 font-medium mt-0.5 leading-snug">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={compose.onOpen}
              aria-label="Nouveau message"
              title="Nouveau message"
              className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center shadow-md shadow-[#b8924a]/30 hover:scale-105 active:scale-95 transition-transform"
            >
              <MessageSquarePlus size={20} />
            </button>
          </div>

          <div className="relative mt-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une conversation…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-[#efe6d6] text-[#8f6f33] flex items-center justify-center mb-4">
                <Inbox size={28} />
              </div>
              <p className="font-bold text-stone-900">Votre boîte de réception est vide.</p>
              <p className="text-xs text-stone-600 mt-1 mb-4 font-medium">Démarrez une conversation pour échanger ici.</p>
              <button type="button" onClick={compose.onOpen} className="text-sm font-bold text-[#8f6f33] hover:text-[#7a5e2b]">
                Écrire un message
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm font-medium text-stone-600 py-10">Aucune conversation ne correspond à « {query} ».</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const isActive = c.id === activeConvId;
                const fromMe = c.lastMessage?.sender_id === myId;
                const unread = c.unread > 0;
                const previewSummary = formatPreviewSummary(c.lastMessage?.content || "Nouvelle conversation", displayName(c.profile), fromMe);

                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectConversation(c.id)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                        isActive ? "bg-white shadow-md ring-2 ring-[#b8924a]/60" : "hover:bg-white/90 hover:shadow-xs"
                      }`}
                    >
                      <div className="relative">
                        <Avatar profile={c.profile} />
                        {unread && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? "font-extrabold text-stone-950" : "font-bold text-stone-900"}`}>{displayName(c.profile)}</span>
                          <span className={`shrink-0 text-[11px] font-semibold ${unread ? "font-bold text-[#8f6f33]" : "text-stone-500"}`}>
                            {c.lastMessage?.created_at ? listTime(c.lastMessage.created_at) : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`truncate text-[13px] ${unread ? "font-bold text-stone-950" : "text-stone-700 font-medium"}`}>
                            {previewSummary}
                          </p>
                          {unread && (
                            <span aria-label={`${c.unread} non lu(s)`} className="shrink-0 min-w-[20px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E53935] text-white">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8f6f33] mt-1">{roleLabel(c.profile)}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ===== Conversation ===== */}
      <section className={`${activeConv ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col bg-[#faf8f5]`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-white shadow-lg shadow-[#b8924a]/10 border border-[#b8924a]/20 flex items-center justify-center text-[#b8924a]">
                <Send size={34} />
              </div>
              <Sparkles size={18} className="absolute -top-2 -right-2 text-[#b8924a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Vos conversations</h2>
            <p className="text-sm font-medium text-stone-600 mt-2 max-w-sm">Sélectionnez une conversation à gauche pour la lire et y répondre, ou démarrez-en une nouvelle.</p>
            <button
              type="button"
              onClick={compose.onOpen}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#241b13] text-[#d9c08c] text-sm font-bold hover:bg-black transition-colors shadow-md"
            >
              <MessageSquarePlus size={18} /> Nouveau message
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-[74px] shrink-0 px-4 sm:px-6 flex items-center justify-between gap-3 bg-white border-b border-stone-200/90 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectConversation(null)}
                  aria-label="Retour aux conversations"
                  className="p-2 -ml-2 rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar profile={activeConv.profile} size="lg" />
                <div className="min-w-0">
                  <h2 className="font-serif text-lg font-bold text-stone-950 truncate">
                    {activeConv.profile?.role === "admin" ? "Support Evenium" : displayName(activeConv.profile)}
                  </h2>
                  <p className="text-xs font-semibold text-[#8f6f33] truncate">{roleLabel(activeConv.profile)}</p>
                </div>
              </div>

              {activeConv.eventContext && (
                <div className="flex items-center gap-2 bg-[#fbf7f0] border border-[#b8924a]/50 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 max-w-[220px] sm:max-w-sm">
                  <Calendar size={14} className="text-[#8f6f33] shrink-0" />
                  <div className="min-w-0 text-right">
                    <span className="block text-xs font-bold text-stone-950 truncate">
                      {activeConv.eventContext.name}
                    </span>
                    {activeConv.eventContext.type && (
                      <span className="block text-[10px] font-semibold text-[#8f6f33] truncate">
                        {activeConv.eventContext.type}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-3xl mx-auto space-y-2">
                {activeConv.messages.map((msg, i) => {
                  const isMe = msg.sender_id === myId;
                  const prev = activeConv.messages[i - 1];
                  const next = activeConv.messages[i + 1];
                  const newDay = !prev || !sameDay(new Date(prev.created_at), new Date(msg.created_at));
                  const lastOfGroup =
                    !next || next.sender_id !== msg.sender_id || !sameDay(new Date(next.created_at), new Date(msg.created_at)) ||
                    new Date(next.created_at).getTime() - new Date(msg.created_at).getTime() > 5 * 60_000;
                  
                  const formattedContent = personalizeMessage(
                    msg.content, 
                    displayName(activeConv.profile), 
                    isMe,
                    activeConv.profile,
                    myProfile
                  );

                  return (
                    <div key={msg.id}>
                      {newDay && (
                        <div className="flex items-center gap-3 my-5">
                          <span className="flex-1 h-px bg-stone-300" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 first-letter:uppercase">{dayLabel(msg.created_at)}</span>
                          <span className="flex-1 h-px bg-stone-300" />
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (lastOfGroup ? <Avatar profile={activeConv.profile} size="sm" /> : <span className="w-8 shrink-0" />)}
                        <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-4.5 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words shadow-xs font-normal sm:font-medium ${
                              isMe
                                ? `bg-gradient-to-br from-[#1f1712] via-[#1a130f] to-[#140e0a] text-white rounded-2xl ${lastOfGroup ? "rounded-br-md" : ""}`
                                : `bg-white text-stone-950 border border-stone-300/90 rounded-2xl ${lastOfGroup ? "rounded-bl-md" : ""}`
                            }`}
                          >
                            {formattedContent}
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

            {/* Composer */}
            <div className="shrink-0 p-3 sm:p-4 bg-white border-t border-stone-200/90 shadow-sm">
              <form onSubmit={onSendReply} className="max-w-3xl mx-auto flex items-center gap-2 p-1.5 pl-5 bg-[#faf8f5] border border-stone-300 rounded-full focus-within:ring-2 focus-within:ring-[#b8924a]/50 focus-within:border-[#b8924a] transition-all">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => onReplyChange(e.target.value)}
                  placeholder={`Répondre à ${displayName(activeConv.profile)} (${roleLabel(activeConv.profile)})…`}
                  className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-medium text-stone-950 placeholder:text-stone-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!reply}
                  aria-label="Envoyer"
                  className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center shadow-md shadow-[#b8924a]/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          </>
        )}
      </section>

      {/* ===== New message ===== */}
      <Modal isOpen={compose.isOpen} onClose={compose.onClose} title="Nouveau message" maxWidth="lg">
        <form onSubmit={compose.onSubmit} className="space-y-5">
          <div>
            <label htmlFor="compose-recipient" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Destinataire
            </label>
            <select
              id="compose-recipient"
              required
              className="w-full px-4 py-3 bg-[#fbf7f0] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a]/60"
              value={compose.recipient}
              onChange={(e) => compose.onRecipientChange(e.target.value)}
            >
              <option value="" disabled>
                {compose.placeholder}
              </option>
              {compose.groups.map((g, gi) =>
                g.label ? (
                  <optgroup key={gi} label={g.label}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="compose-message" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Message
            </label>
            <textarea
              id="compose-message"
              required
              className="w-full px-4 py-3 bg-[#fbf7f0] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a]/60 min-h-[140px] resize-none"
              value={compose.message}
              onChange={(e) => compose.onMessageChange(e.target.value)}
              placeholder="Écrivez votre message ici..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={compose.onClose}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <X size={16} /> Annuler
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#241b13] text-[#d9c08c] text-sm font-bold hover:bg-black transition-colors shadow-md"
            >
              <Send size={16} /> Envoyer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
