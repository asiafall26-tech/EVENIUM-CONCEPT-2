"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  MapPin, 
  Layers, 
  Tag, 
  Check, 
  CreditCard, 
  Smartphone, 
  ArrowRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ProviderCampaign, CampaignPlanType, CAMPAIGN_PLANS } from "@/types/campaigns";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { 
  fetchProviderCampaignsAction, 
  saveProviderCampaignAction, 
  activateCampaignAction 
} from "@/app/actions/campaignActions";

const BADGE_OPTIONS = [
  "Offre Spéciale",
  "Dégustation Offerte",
  "Remise -15%",
  "Pack Clé en Main",
  "Nouveauté",
  "Édition Limitée",
  "Artiste Offert",
  "Partenaire Privilège",
];

const PRESET_PHOTOS = [
  { label: "Gastronomie & Réception", url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" },
  { label: "Scénographie Mariage Romantique", url: "https://images.unsplash.com/photo-1519225438865-d069b2520638?auto=format&fit=crop&w=800&q=80" },
  { label: "Cinéma & Photographie 4K", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80" },
  { label: "Animation & Piste DJ", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" },
  { label: "Fêtes & Décoration Scintillante", url: "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=800&q=80" },
  { label: "Cocktail d'Exception & Verres", url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80" },
];

const ZONE_OPTIONS = ["Toutes", "Dakar", "Abidjan", "Paris", "Saly & Petite Côte", "Yaoundé", "Douala"];

export default function PrestatairePublicitePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<ProviderCampaign | null>(null);
  const [currentProviderId, setCurrentProviderId] = useState<string>("prov-me");
  const [providerName, setProviderName] = useState<string>("Mon Entreprise");
  const [providerAvatar, setProviderAvatar] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("Offre Exceptionnelle pour vos Célébrations");
  const [hook, setHook] = useState("Bénéficiez d'une prestation sur-mesure et d'avantages exclusifs pour toute réservation cette saison.");
  const [badge, setBadge] = useState("Offre Spéciale");
  const [mediaUrl, setMediaUrl] = useState(PRESET_PHOTOS[0].url);
  const [ctaLabel, setCtaLabel] = useState("Demander un devis");
  const [targetEventTypes, setTargetEventTypes] = useState<string[]>(["Tous"]);
  const [targetZones, setTargetZones] = useState<string[]>(["Toutes"]);

  // Modal boost purchase
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CampaignPlanType>("boost_30j");
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "card">("wave");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        let provId = "prov-me";
        if (authData?.user) {
          provId = authData.user.id;
          setCurrentProviderId(provId);
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, business_name")
            .eq("id", provId)
            .maybeSingle();

          if (profile) {
            setProviderName(profile.business_name || profile.full_name || "Prestataire Evenium");
            setProviderAvatar(profile.avatar_url || null);
          }
        }

        const campaigns = await fetchProviderCampaignsAction(provId);
        if (campaigns && campaigns.length > 0) {
          const current = campaigns[0];
          setCampaign(current);
          setTitle(current.title);
          setHook(current.hook);
          setBadge(current.badge);
          setMediaUrl(current.media_url || PRESET_PHOTOS[0].url);
          setCtaLabel(current.cta_label);
          setTargetEventTypes(current.target_event_types || ["Tous"]);
          setTargetZones(current.target_zones || ["Toutes"]);
        }
      } catch (err) {
        console.warn("Init error in publicite page:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [supabase]);

  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      const updated = await saveProviderCampaignAction({
        id: campaign?.id,
        provider_id: currentProviderId,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        title,
        hook,
        badge,
        media_url: mediaUrl,
        cta_label: ctaLabel,
        target_event_types: targetEventTypes,
        target_zones: targetZones,
        status: campaign?.status || "active",
        plan_type: campaign?.plan_type || "boost_7j",
      });
      setCampaign(updated);
      alert("Votre annonce a été mise à jour avec succès !");
    } catch {
      alert("Erreur lors de l'enregistrement de l'annonce.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEventType = (type: string) => {
    if (type === "Tous") {
      setTargetEventTypes(["Tous"]);
      return;
    }
    const withoutTous = targetEventTypes.filter((t) => t !== "Tous");
    if (withoutTous.includes(type)) {
      const remaining = withoutTous.filter((t) => t !== type);
      setTargetEventTypes(remaining.length === 0 ? ["Tous"] : remaining);
    } else {
      setTargetEventTypes([...withoutTous, type]);
    }
  };

  const handleToggleZone = (zone: string) => {
    if (zone === "Toutes") {
      setTargetZones(["Toutes"]);
      return;
    }
    const withoutToutes = targetZones.filter((z) => z !== "Toutes");
    if (withoutToutes.includes(zone)) {
      const remaining = withoutToutes.filter((z) => z !== zone);
      setTargetZones(remaining.length === 0 ? ["Toutes"] : remaining);
    } else {
      setTargetZones([...withoutToutes, zone]);
    }
  };

  const handleActivateBoost = async () => {
    if (!campaign?.id) {
      // First save if no campaign id
      const created = await saveProviderCampaignAction({
        provider_id: currentProviderId,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        title,
        hook,
        badge,
        media_url: mediaUrl,
        cta_label: ctaLabel,
        target_event_types: targetEventTypes,
        target_zones: targetZones,
        plan_type: selectedPlan,
      });
      setCampaign(created);
    }

    setIsProcessingPayment(true);
    setTimeout(async () => {
      try {
        const campaignId = campaign?.id || "camp-current";
        const result = await activateCampaignAction(campaignId, selectedPlan);
        setIsProcessingPayment(false);
        setPaymentSuccessMessage(result.message);
        
        // Update local status
        if (campaign) {
          setCampaign({
            ...campaign,
            status: "active",
            plan_type: selectedPlan,
            ends_at: result.endsAt,
          });
        }
      } catch {
        setIsProcessingPayment(false);
        alert("Une erreur est survenue lors de l'activation.");
      }
    }, 1200);
  };

  const daysRemaining = campaign?.ends_at
    ? Math.max(0, Math.ceil((new Date(campaign.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isActive = campaign?.status === "active" && daysRemaining > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 1. EN-TÊTE ÉLÉGANT & PRÉSENTATION DE L'OFFRE PRIVILÈGE */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e4d8c4] bg-[#fbf7f0] p-6 sm:p-10">
        <div aria-hidden className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#ecd9b0]/50 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-[#f3e8e2]/80 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebdccb]/70 border border-[#dcc59c] text-[#7a5e2b] text-[11px] font-bold uppercase tracking-widest">
              <Sparkles size={13} className="text-[#a47e36]" />
              <span>Visibilité Sponsorisée B2B • Evenium Pro</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1e150f] font-medium leading-tight">
              Sélection Privilège & Boosts d&apos;Annonces
            </h1>
            <p className="text-sm sm:text-base text-[#6b5847] leading-relaxed">
              Faites découvrir vos prestations d&apos;exception directement sur le tableau de bord des clients organisateurs. Ciblez par région et par fête pour multiplier vos demandes de devis qualifiées.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setPaymentSuccessMessage(null);
                setIsBoostModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#201811] via-[#332418] to-[#1c150e] hover:brightness-125 text-[#fbf5eb] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition cursor-pointer"
            >
              <Zap size={16} className="text-[#e2c178]" />
              <span>{isActive ? "Prolonger mon Boost" : "Booster ma visibilité"}</span>
            </button>
          </div>
        </div>

        {/* 2. STATUT ACTIF DU BOOST */}
        <div className="mt-8 pt-6 border-t border-[#eedfc9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex items-center gap-3.5 shadow-xs">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-neutral-100 text-neutral-400'}`}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#826f5d]">Statut Campagne</p>
              <p className="text-sm font-semibold text-[#1e150f]">
                {isActive ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    En ligne ({daysRemaining}j restants)
                  </span>
                ) : (
                  <span className="text-neutral-500">Inactive ou expirée</span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#f5ecda] text-[#8a682b] border border-[#d6be90] flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#826f5d]">Vues Organisateur</p>
              <p className="font-serif text-xl font-bold text-[#1e150f]">
                {campaign?.impressions_count ? campaign.impressions_count.toLocaleString("fr-FR") : "1 420"}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#f5ecda] text-[#8a682b] border border-[#d6be90] flex items-center justify-center">
              <MousePointerClick size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#826f5d]">Clics Générés</p>
              <p className="font-serif text-xl font-bold text-[#1e150f]">
                {campaign?.clicks_count ? campaign.clicks_count.toLocaleString("fr-FR") : "184"}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#f5ecda] text-[#8a682b] border border-[#d6be90] flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#826f5d]">Demandes Directes</p>
              <p className="font-serif text-xl font-bold text-[#1e150f]">
                {campaign?.contacts_count ? campaign.contacts_count.toLocaleString("fr-FR") : "36"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STUDIO D'ÉDITION & APERÇU TEMPS RÉEL (SPLIT SCREEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE GAUCHE (7 cols) : FORMULAIRE DE PERSONNALISATION */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-serif text-xl text-[#1e150f] font-medium">
                Studio de Conception de l&apos;Annonce
              </h2>
              <p className="text-xs text-gray-500">
                Personnalisez le contenu de votre carte « Sélection Privilège » diffusée aux clients.
              </p>
            </div>
            <button
              onClick={handleSaveCampaign}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b8924a] hover:bg-[#9a7736] text-white text-xs font-bold tracking-wider shadow-xs transition"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>

          {/* Titre & Accroche */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Titre de l&apos;offre (Court & percutant)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                placeholder="Ex : Menu Découverte Fêtes & Mariages"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm font-medium"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-1">{title.length} / 60 caractères</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Accroche promotionnelle / Avantage offert
              </label>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                rows={3}
                maxLength={140}
                placeholder="Ex : Dégustation gastronomique offerte pour toute réservation de plus de 50 convives avant fin décembre."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm leading-relaxed"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-1">{hook.length} / 140 caractères</span>
            </div>
          </div>

          {/* Badge & Macaron */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-[#b8924a]" />
              <span>Macaron d&apos;Offre Privilège</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    badge === b
                      ? "bg-[#1e1711] text-[#f5ebd7] border border-[#d4af37]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  {badge === b ? "✨ " : ""}{b}
                </button>
              ))}
            </div>
          </div>

          {/* Visuel de l'annonce */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Layers size={13} className="text-[#b8924a]" />
              <span>Visuel Vitrine (Haute Définition)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_PHOTOS.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setMediaUrl(p.url)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 transition group text-left ${
                    mediaUrl === p.url ? "border-[#b8924a] ring-2 ring-[#b8924a]/20" : "border-gray-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={p.url} alt={p.label} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex items-end">
                    <span className="text-[10px] text-white font-medium line-clamp-1">{p.label}</span>
                  </div>
                  {mediaUrl === p.url && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#b8924a] text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2.5">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Ou collez l'URL d'une image personnalisée..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#b8924a]"
              />
            </div>
          </div>

          {/* Bouton d'action CTA */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Libellé du bouton d&apos;action
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ex : Demander un devis, Découvrir la carte, Contacter le chef"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm"
            />
          </div>

          {/* Ciblage Événements */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#b8924a]" />
              <span>Ciblage : Types d&apos;Événements (Anti-Spam)</span>
            </label>
            <p className="text-[11px] text-gray-500 mb-2">
              Votre offre sera affichée en priorité aux organisateurs de ces événements.
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => handleToggleEventType("Tous")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  targetEventTypes.includes("Tous")
                    ? "bg-[#b8924a] text-white"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                Tous les événements
              </button>
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleToggleEventType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    targetEventTypes.includes(t)
                      ? "bg-[#b8924a] text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Ciblage Zones Géographiques */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#b8924a]" />
              <span>Ciblage : Villes & Régions</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ZONE_OPTIONS.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => handleToggleZone(z)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    targetZones.includes(z)
                      ? "bg-[#201811] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveCampaign}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-[#201811] hover:bg-[#332418] text-[#fbf5eb] text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              {saving ? "Enregistrement en cours..." : "Valider & Mettre à jour l'Annonce"}
            </button>
          </div>

        </div>

        {/* COLONNE DROITE (5 cols) : APERÇU LIVE DU RENDU CLIENT */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          <div className="bg-[#1f1710] text-[#fbf5eb] rounded-3xl p-6 shadow-md border border-[#3d2f21] space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#3d2f21] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold tracking-wide text-[#f5ebd7]">
                  Aperçu en Direct pour les Clients
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-[#140e0a] p-0.5 rounded-lg border border-[#3d2f21]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${previewDevice === "desktop" ? "bg-[#b8924a] text-white" : "text-gray-400"}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${previewDevice === "mobile" ? "bg-[#b8924a] text-white" : "text-gray-400"}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            <p className="text-xs text-[#b39b82] leading-relaxed">
              Voici l&apos;élégant carrousel qui apparaîtra sur le Dashboard des organisateurs correspondant à vos critères :
            </p>

            {/* CARTE RENDU EXACT */}
            <div className="bg-white text-gray-900 rounded-2xl border border-[#ebdccb] p-4 sm:p-5 shadow-lg space-y-3.5 text-left">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f1e4cb] text-[#86672c] font-bold text-xs flex items-center justify-center border border-[#d6be90]">
                    {providerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <span>{providerName}</span>
                      <CheckCircle2 size={11} className="text-[#b8924a]" />
                    </p>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Partenaire Officiel</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1e1711] text-[#f5ebd7] border border-[#d4af37]/60">
                  ✨ {badge}
                </span>
              </div>

              {/* Visuel */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {mediaUrl ? (
                  <Image src={mediaUrl} alt={title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Aucune image</div>
                )}
              </div>

              {/* Titre & Accroche */}
              <div>
                <h4 className="font-serif text-sm font-semibold text-gray-900 line-clamp-1">
                  {title || "Titre de votre annonce"}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {hook || "Votre texte promotionnel..."}
                </p>
              </div>

              {/* Bouton d'action */}
              <div className="pt-1">
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#201811] via-[#2f2217] to-[#1c150e] text-[#fbf5eb] text-xs font-bold tracking-wider text-center flex items-center justify-center gap-2">
                  <MessageSquare size={12} className="text-[#e2c178]" />
                  <span>{ctaLabel || "Contacter le prestataire"}</span>
                </div>
              </div>

            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-[#9c846d] flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#d4af37]" />
                <span>Respect strict de la charte luxe • Zéro pop-up intrusif</span>
              </span>
            </div>

          </div>

          {/* RAPPEL DES FORMULES */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 text-left">
            <h4 className="font-serif text-base text-gray-900 font-medium flex items-center gap-2">
              <TrendingUp size={16} className="text-[#b8924a]" />
              <span>Pourquoi sponsoriser votre activité ?</span>
            </h4>
            <ul className="text-xs text-gray-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-[#b8924a] font-bold">1.</span>
                <span><strong>Proactivité</strong> : Ne restez plus passif dans le catalogue, touchez les clients dès la création de leur événement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b8924a] font-bold">2.</span>
                <span><strong>Ciblage de haute précision</strong> : Ne payez que pour les événements qui correspondent à votre spécialité et vos dates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b8924a] font-bold">3.</span>
                <span><strong>Zéro Commission supplémentaire</strong> : Vos devis conclus restent à 100% pour vous.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* 4. MODALE DE SOUSCRIPTION / TUNNEL DE BOOST */}
      {isBoostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-[#fdfbf7] rounded-3xl border border-[#e4d8c4] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            
            <div className="flex items-start justify-between border-b border-[#ebdccb] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#8a682b] mb-1">
                  <Zap size={13} className="text-[#d4af37]" />
                  <span>Activation Immédiate</span>
                </div>
                <h3 className="font-serif text-2xl text-[#1e150f] font-medium">
                  Choisissez votre Formule de Visibilité
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBoostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {paymentSuccessMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-serif text-xl font-bold text-emerald-900">
                  Boost Activé avec Succès !
                </h4>
                <p className="text-sm text-emerald-700">
                  {paymentSuccessMessage}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsBoostModalOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition"
                  >
                    Fermer & Voir ma campagne
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Choix des formules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CAMPAIGN_PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#b8924a] bg-white shadow-md ring-2 ring-[#b8924a]/20"
                            : "border-[#edd8c1] bg-[#faf5ed] hover:border-[#b8924a]/60"
                        }`}
                      >
                        <div className="space-y-2">
                          {plan.badge && (
                            <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ebdccb] text-[#7a5e2b]">
                              {plan.badge}
                            </span>
                          )}
                          <h4 className="font-serif text-sm font-bold text-[#1e150f]">{plan.name}</h4>
                          <p className="text-[11px] text-[#6b5847]">{plan.durationLabel}</p>
                          <div className="pt-1">
                            <span className="text-lg font-bold text-[#1e150f]">
                              {plan.priceFcfa.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">FCFA</span>
                          </div>
                        </div>

                        <ul className="text-[10px] text-gray-600 space-y-1.5 pt-3 border-t border-gray-100 mt-3">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-[#b8924a]">✓</span>
                              <span className="line-clamp-2">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Moyen de Paiement */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5847]">
                    Mode de Règlement Sécurisé
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wave")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        paymentMethod === "wave"
                          ? "border-[#1ba8e5] bg-[#eaf7fd] text-[#0d7cae] font-bold"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <Smartphone size={18} />
                      <span className="text-xs">Wave</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("orange_money")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        paymentMethod === "orange_money"
                          ? "border-[#ff6600] bg-[#fff2e6] text-[#cc5200] font-bold"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <Smartphone size={18} />
                      <span className="text-xs">Orange Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        paymentMethod === "card"
                          ? "border-[#1e150f] bg-gray-100 text-[#1e150f] font-bold"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-xs">Carte Bancaire</span>
                    </button>
                  </div>
                </div>

                {/* Bouton de confirmation */}
                <div className="pt-4 border-t border-[#ebdccb]">
                  <button
                    type="button"
                    onClick={handleActivateBoost}
                    disabled={isProcessingPayment}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-[#201811] via-[#332418] to-[#1c150e] hover:brightness-125 text-[#fbf5eb] text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-[1.01] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw size={15} className="animate-spin text-[#d4af37]" />
                        <span>Sécurisation & Validation du Boost...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmer & Activer la Diffusion</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Facture émise automatiquement • Renouvellement transparent sans engagement.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
