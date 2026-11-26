"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  User, 
  Coins, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { ProviderCampaign } from "@/types/campaigns";
import { createClient } from "@/utils/supabase/client";
import { addNotificationForClient, addNotificationForProvider } from "@/lib/notifications";
import { recordCampaignAction } from "@/app/actions/campaignActions";

interface CampaignQuoteRequestModalProps {
  campaign: ProviderCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventName?: string;
  defaultDate?: string;
  defaultLocation?: string;
}

export function CampaignQuoteRequestModal({
  campaign,
  isOpen,
  onClose,
  eventId,
  eventName,
  defaultDate,
  defaultLocation,
}: CampaignQuoteRequestModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate || "");
  const [eventLocation, setEventLocation] = useState(defaultLocation || "");
  const [guestCount, setGuestCount] = useState<number | "">("");
  const [budgetIndicatif, setBudgetIndicatif] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Pré-remplissage avec le profil connecté et initialisation du message relatif à la pub
  useEffect(() => {
    if (!isOpen || !campaign) return;

    setSubmitted(false);

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, phone, email")
            .eq("id", user.id)
            .maybeSingle();

          if (prof) {
            if (prof.full_name) setClientName(prof.full_name);
            if (prof.phone) setClientPhone(prof.phone);
            if (prof.email) setClientEmail(prof.email);
          } else {
            if (user.user_metadata?.full_name) setClientName(user.user_metadata.full_name);
            if (user.email) setClientEmail(user.email);
          }
        }
      } catch (err) {
        console.warn("Could not prefill user in quote modal:", err);
      }
    }
    loadUser();

    // Message pré-rempli ciblé sur la publication
    const prefillMsg = `Bonjour ${campaign.provider_name},\n\nJe suis très intéressé(e) par votre offre « ${campaign.title} » (${campaign.badge}) pour mon événement${eventName ? ` « ${eventName} »` : ""}.\nMerci de me transmettre un devis détaillé adapté à mes besoins.`;
    setMessage(prefillMsg);
  }, [isOpen, campaign, eventName, supabase]);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !eventDate || !eventLocation.trim()) {
      alert("Veuillez renseigner les éléments essentiels (Nom, WhatsApp, Email, Date et Lieu).");
      return;
    }

    setLoading(true);

    const demandePayload = {
      id: `demande-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      client_id: userId || `client-guest-${Date.now()}`,
      prestataire_id: campaign.provider_id,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_email: clientEmail.trim(),
      service_name: `[Offre Sponsorisée] ${campaign.title}`,
      event_id: eventId || null,
      event_name: eventName || "Événement Evenium",
      event_date: eventDate,
      event_location: eventLocation.trim(),
      guest_count: guestCount ? Number(guestCount) : null,
      budget_propose: budgetIndicatif ? Number(budgetIndicatif) : null,
      budget_indicatif: budgetIndicatif ? Number(budgetIndicatif) : null,
      message: message.trim(),
      status: "Nouvelle",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Sauvegarde locale garantie dans evenium_demandes_devis
    try {
      const storedKey = "evenium_demandes_devis";
      const existing: any[] = JSON.parse(localStorage.getItem(storedKey) || "[]");
      localStorage.setItem(storedKey, JSON.stringify([demandePayload, ...existing]));
    } catch {}

    // 2. Enregistrement Supabase si la table existe
    try {
      await supabase.from("demandes_devis").insert(demandePayload);
    } catch (err) {
      console.warn("Supabase quote insert fallback to local:", err);
    }

    // 3. Incrément du compteur de contacts sur la campagne
    try {
      await recordCampaignAction(campaign.id, "contact", userId || undefined, eventId);
    } catch {}

    // 4. Notification automatique au prestataire
    addNotificationForProvider(campaign.provider_id, {
      title: "Nouvelle demande de devis reçue 📋",
      desc: `${clientName} a demandé un devis pour votre publication « ${campaign.title} »`,
      type: "quote",
      link: "/prestataire/demandes",
    });

    // 5. Notification de confirmation au client
    addNotificationForClient({
      title: "Demande de devis envoyée avec succès ✨",
      desc: `Votre demande pour « ${campaign.title} » a été transmise à ${campaign.provider_name}.`,
      type: "quote",
      link: "/dashboard/messages",
    });

    setLoading(false);
    setSubmitted(true);
  };

  const messageUrl = `/dashboard/messages?prestataire=${encodeURIComponent(campaign.provider_id)}&name=${encodeURIComponent(campaign.provider_name)}&msg=${encodeURIComponent(`Bonjour ${campaign.provider_name}, je viens de vous envoyer une demande de devis relative à votre offre « ${campaign.title} ».`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#ecdcc8] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête Or & Haut de gamme */}
        <div className="relative bg-gradient-to-r from-[#1e150d] via-[#2c1e13] to-[#1a120b] p-5 sm:p-6 text-white border-b border-[#d4af37]/40">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            aria-label="Fermer la modale"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f5dfaa] text-[#1f150e]">
              <Sparkles size={11} className="text-[#a47e36]" />
              {campaign.badge}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#edd9b0] font-medium">
              <ShieldCheck size={13} className="text-[#d4af37]" />
              {campaign.provider_name}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#faf3e8] leading-tight">
            Demande de devis relative à l&apos;offre
          </h3>
          <p className="text-xs text-[#d8c39e] mt-1 line-clamp-1">
            « {campaign.title} »
          </p>
        </div>

        {/* Corps de la modale */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-2xl font-bold text-gray-900">
                  Demande transmise avec succès !
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Votre demande pour l&apos;offre « <strong>{campaign.title}</strong> » a été envoyée directement à <strong>{campaign.provider_name}</strong>. Une alerte en temps réel a été émise sur son tableau de bord.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf8f2] border border-[#ebdccb] text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between text-gray-600">
                  <span>Destinataire :</span>
                  <span className="font-bold text-gray-900">{campaign.provider_name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Date prévue :</span>
                  <span className="font-bold text-gray-900">{eventDate}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Lieu :</span>
                  <span className="font-bold text-gray-900">{eventLocation}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <Link
                  href={messageUrl}
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1e150d] hover:bg-black text-[#f5dfaa] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={15} />
                  <span>Échanger par messagerie</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#faf6ee] border border-[#ebdccb] text-xs text-[#6e583c] flex items-center gap-2">
                <Clock size={16} className="text-[#a47e36] shrink-0" />
                <span>
                  Renseignez uniquement les éléments essentiels pour recevoir une proposition adaptée sous 24h.
                </span>
              </div>

              {/* Vos Coordonnées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-gray-400" />
                    <span>Votre Nom &amp; Prénom *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Awa Diop"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-emerald-600" />
                    <span>Téléphone WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-gray-400" />
                  <span>Adresse Email *</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="contact@exemple.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                />
              </div>

              {/* Date & Lieu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={13} className="text-[#a47e36]" />
                    <span>Date de l&apos;événement *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-[#a47e36]" />
                    <span>Lieu / Ville &amp; Quartier *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Ex: Dakar, Almadies"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>
              </div>

              {/* Invités & Budget indicatif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Users size={13} className="text-gray-400" />
                    <span>Nombre d&apos;invités estimé</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Ex: 150"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Coins size={13} className="text-amber-600" />
                    <span>Budget indicatif (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={budgetIndicatif}
                    onChange={(e) => setBudgetIndicatif(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Ex: 500 000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white"
                  />
                </div>
              </div>

              {/* Précisions / Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MessageSquare size={13} className="text-gray-400" />
                  <span>Vos précisions pour cette offre</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a] bg-white leading-relaxed resize-none"
                />
              </div>

              {/* Boutons d'action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1f150e] via-[#332317] to-[#1f150e] hover:brightness-110 text-[#f5dfaa] text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#f5dfaa] border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} className="text-[#f5dfaa]" />
                      <span>Envoyer ma demande de devis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
