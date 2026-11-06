"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  Eye, 
  MousePointerClick, 
  MessageSquare, 
  CheckCircle2, 
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
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Video,
  Camera,
  RotateCcw,
  CheckCheck,
  Flame,
  Globe
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ProviderCampaign, CampaignPlanType, CAMPAIGN_PLANS } from "@/types/campaigns";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { 
  fetchProviderCampaignsAction, 
  saveProviderCampaignAction, 
  activateCampaignAction 
} from "@/app/actions/campaignActions";
import { MAIN_COUNTRIES, regionsOf, quartiersOf } from "@/lib/zones";
import { activityFromProfile, ProviderActivity } from "@/lib/providerProfile";

const BADGE_OPTIONS = [
  "✨ Offre Spéciale",
  "🥂 Dégustation Offerte",
  "🔥 Remise -15%",
  "💎 Pack Clé en Main",
  "⭐ Partenaire Privilège",
  "🎬 Vidéo 4K Offerte",
  "🎶 DJ & Scène Offerte",
  "🌟 Coup de Cœur Evenium",
];

const PRESET_PHOTOS = [
  { label: "Gastronomie & Réception", url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" },
  { label: "Scénographie Mariage Romantique", url: "https://images.unsplash.com/photo-1519225438865-d069b2520638?auto=format&fit=crop&w=800&q=80" },
  { label: "Cinéma & Photographie 4K", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80" },
  { label: "Animation & Piste DJ", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" },
  { label: "Fêtes & Décoration Scintillante", url: "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=800&q=80" },
  { label: "Cocktail d'Exception & Verres", url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80" },
];

const PRESET_VIDEOS = [
  { label: "Reel Mariage & Bague (Ambiance)", url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-and-groom-holding-each-other-42686-large.mp4" },
  { label: "Reel Scénographie & Tables de Fête", url: "https://assets.mixkit.co/videos/preview/mixkit-set-of-plates-and-cutlery-on-a-wedding-table-42683-large.mp4" },
  { label: "Reel Champagne & Soirée Privée", url: "https://assets.mixkit.co/videos/preview/mixkit-champagne-glasses-at-a-party-42684-large.mp4" },
];

export default function PrestatairePublicitePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<ProviderCampaign | null>(null);
  const [currentProviderId, setCurrentProviderId] = useState<string>("prov-me");
  const [providerName, setProviderName] = useState<string>("Mon Entreprise");
  const [providerAvatar, setProviderAvatar] = useState<string | null>(null);
  const [userProfileActivity, setUserProfileActivity] = useState<ProviderActivity | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [badge, setBadge] = useState(BADGE_OPTIONS[0]);
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [mediaUrl, setMediaUrl] = useState(PRESET_PHOTOS[0].url);
  const [ctaLabel, setCtaLabel] = useState("Demander un devis");
  const [targetEventTypes, setTargetEventTypes] = useState<string[]>(["Tous"]);

  // Hiérarchie Géographique stricte : Pays -> Région -> Quartier
  const [country, setCountry] = useState<string>("Sénégal");
  const [region, setRegion] = useState<string>("Dakar");
  const [quartiers, setQuartiers] = useState<string[]>([]);
  const [customQuartier, setCustomQuartier] = useState("");

  // Instagram Interactive States
  const [liked, setLiked] = useState(false);
  const [likesOffset, setLikesOffset] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLIFrameElement | HTMLVideoElement | null>(null);

  // Modal boost purchase
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CampaignPlanType>("boost_30j");
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "card">("wave");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Initialisation et récupération du profil prestataire
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
            .select("*")
            .eq("id", provId)
            .maybeSingle();

          if (profile) {
            setProviderName(profile.business_name || profile.full_name || "Prestataire Evenium");
            setProviderAvatar(profile.avatar_url || null);
            const act = activityFromProfile(profile);
            setUserProfileActivity(act);

            if (act.country) setCountry(act.country);
            if (act.region) setRegion(act.region);
            if (act.quartiers && act.quartiers.length) setQuartiers(act.quartiers);
          }
        }

        const campaigns = await fetchProviderCampaignsAction(provId);
        if (campaigns && campaigns.length > 0) {
          const current = campaigns[0];
          setCampaign(current);
          setTitle(current.title || "");
          setHook(current.hook || "");
          setBadge(current.badge || BADGE_OPTIONS[0]);
          const url = current.media_url || PRESET_PHOTOS[0].url;
          setMediaUrl(url);
          setMediaType(url.endsWith(".mp4") || url.includes("video") ? "video" : "photo");
          setCtaLabel(current.cta_label || "Demander un devis");
          setTargetEventTypes(current.target_event_types || ["Tous"]);

          // Parse zones si existantes
          if (current.target_zones && current.target_zones.length > 0) {
            const first = current.target_zones[0];
            if (regionsOf(country).includes(first)) {
              setRegion(first);
              setQuartiers(current.target_zones.slice(1));
            }
          }
        }
      } catch (err) {
        console.warn("Init error in publicite page:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [supabase]);

  // Synchronisation 1-clic avec les coordonnées de l'inscription / profil
  const handleSyncWithProfile = () => {
    if (!userProfileActivity) {
      alert("Aucune information de localisation trouvée sur votre profil.");
      return;
    }
    if (userProfileActivity.country) setCountry(userProfileActivity.country);
    if (userProfileActivity.region) setRegion(userProfileActivity.region);
    if (userProfileActivity.quartiers && userProfileActivity.quartiers.length) {
      setQuartiers(userProfileActivity.quartiers);
    } else {
      setQuartiers([]);
    }
    alert(`Localisation synchronisée avec votre profil : ${userProfileActivity.country} > ${userProfileActivity.region || "Toutes régions"} !`);
  };

  // Liste hiérarchique construite
  const availableRegions = regionsOf(country);
  const availableQuartiers = quartiersOf(country, region);

  const unifiedTargetZones = Array.from(new Set([
    country,
    region,
    ...quartiers,
  ])).filter(Boolean);

  // Bascule directe Publier en ligne / Retirer en ligne
  const handleToggleOnlineStatus = async () => {
    const nextStatus = campaign?.status === "active" ? "paused" : "active";
    if (nextStatus === "active" && (!title.trim() || !hook.trim())) {
      alert("Veuillez renseigner un titre et une accroche avant de publier en ligne.");
      return;
    }
    setSaving(true);
    try {
      const updated = await saveProviderCampaignAction({
        id: campaign?.id,
        provider_id: currentProviderId,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        title: title || "Sélection Privilège Evenium",
        hook: hook || "Prestation haut de gamme pour vos célébrations inoubliables.",
        badge,
        media_url: mediaUrl,
        cta_label: ctaLabel,
        target_event_types: targetEventTypes,
        target_zones: unifiedTargetZones,
        status: nextStatus,
        plan_type: campaign?.plan_type || "boost_7j",
      });
      setCampaign(updated);
      alert(nextStatus === "active" ? "🚀 Votre annonce est maintenant EN LIGNE auprès des organisateurs !" : "⏸️ Votre annonce a été RETIRÉE de la vitrine.");
    } catch {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!title.trim() || !hook.trim()) {
      alert("Veuillez renseigner un titre et une accroche promotionnelle avant d'enregistrer.");
      return;
    }
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
        target_zones: unifiedTargetZones,
        status: campaign?.status || "active",
        plan_type: campaign?.plan_type || "boost_7j",
      });
      setCampaign(updated);
      alert("Votre annonce Insta et vos réglages de ciblage ont été enregistrés avec succès !");
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

  const handleToggleQuartier = (q: string) => {
    if (quartiers.includes(q)) {
      setQuartiers(quartiers.filter((item) => item !== q));
    } else {
      setQuartiers([...quartiers, q]);
    }
  };

  const handleAddCustomQuartier = () => {
    const clean = customQuartier.trim();
    if (!clean) return;
    if (!quartiers.includes(clean)) {
      setQuartiers([...quartiers, clean]);
    }
    setCustomQuartier("");
  };

  const handleActivateBoost = async () => {
    if (!title.trim() || !hook.trim()) {
      alert("Veuillez d'abord rédiger un titre et une accroche promotionnelle dans le studio avant d'activer votre boost.");
      setIsBoostModalOpen(false);
      return;
    }

    let activeCampaignId = campaign?.id;
    if (!activeCampaignId) {
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
        target_zones: unifiedTargetZones,
        plan_type: selectedPlan,
        status: "active",
      });
      setCampaign(created);
      activeCampaignId = created.id;
    }

    setIsProcessingPayment(true);
    setTimeout(async () => {
      try {
        const result = await activateCampaignAction(activeCampaignId!, selectedPlan);
        setIsProcessingPayment(false);
        setPaymentSuccessMessage(result.message);
        
        setCampaign((prev) =>
          prev
            ? {
                ...prev,
                status: "active",
                plan_type: selectedPlan,
                ends_at: result.endsAt,
              }
            : null
        );
      } catch {
        setIsProcessingPayment(false);
        alert("Une erreur est survenue lors de l'activation.");
      }
    }, 1200);
  };

  const daysRemaining = campaign?.ends_at
    ? Math.max(0, Math.ceil((new Date(campaign.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isOnline = campaign?.status === "active";
  const viewsCount = campaign?.impressions_count ?? 1240;
  const rawLikes = 142 + (liked ? 1 : 0) + likesOffset;
  const clicksCount = campaign?.clicks_count ?? 86;
  const contactsCount = campaign?.contacts_count ?? 14;
  const engagementRate = (((rawLikes + clicksCount + contactsCount) / (viewsCount || 1)) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 1. EN-TÊTE ÉLÉGANT HAUTE COUTURE */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e4d8c4] bg-[#fbf7f0] p-6 sm:p-10">
        <div aria-hidden className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#ecd9b0]/50 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-[#f3e8e2]/80 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebdccb]/70 border border-[#dcc59c] text-[#7a5e2b] text-[11px] font-bold uppercase tracking-widest">
              <Sparkles size={13} className="text-[#a47e36]" />
              <span>Studio Publicitaire • Format Insta & Vitrine Organisateur</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1e150f] font-medium leading-tight">
              Annonces & Boosts Insta-Haute Couture
            </h1>
            <p className="text-sm sm:text-base text-[#6b5847] leading-relaxed">
              Éditez votre annonce au format visuel Instagram avec photos et vidéos HD. Vos publications apparaissent en tête des recherches organisateurs ciblées par Pays, Région et Quartier.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-3">
            {/* Bouton direct Publier / Retirer */}
            <button
              onClick={handleToggleOnlineStatus}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer ${
                isOnline
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-lg"
              }`}
            >
              {isOnline ? (
                <>
                  <Pause size={15} /> <span>Retirer de la vitrine</span>
                </>
              ) : (
                <>
                  <Play size={15} /> <span>Publier en ligne</span>
                </>
              )}
            </button>

            {/* Bouton Booster */}
            <button
              onClick={() => {
                setPaymentSuccessMessage(null);
                setIsBoostModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#201811] via-[#332418] to-[#1c150e] hover:brightness-125 text-[#fbf5eb] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition cursor-pointer"
            >
              <Zap size={16} className="text-[#e2c178]" />
              <span>{isOnline && daysRemaining > 0 ? "Prolonger le Boost" : "Booster la visibilité"}</span>
            </button>
          </div>
        </div>

        {/* 2. VITRINE & MONITORING DES PERFORMANCES (STATISTIQUES INSTA INSIGHTS) */}
        <div className="mt-8 pt-6 border-t border-[#eedfc9] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Statut */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex flex-col justify-between shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826f5d]">Statut Vitrine</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"}`} />
            </div>
            <p className="text-sm font-bold text-[#1e150f] flex items-center gap-1.5">
              {isOnline ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  🟢 En ligne {daysRemaining > 0 && `(${daysRemaining}j)`}
                </span>
              ) : (
                <span className="text-neutral-500">⏸️ En pause / Hors ligne</span>
              )}
            </p>
          </div>

          {/* Vues / Impressions */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826f5d]">Vues Organisateur</span>
              <Eye size={16} className="text-[#a47e36]" />
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#1e150f]">
              {viewsCount.toLocaleString("fr-FR")}
            </p>
          </div>

          {/* Likes relatifs */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826f5d]">Likes Relatifs</span>
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#1e150f]">
              {rawLikes.toLocaleString("fr-FR")}
            </p>
          </div>

          {/* Clics vitrine */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826f5d]">Clics Vitrine</span>
              <MousePointerClick size={16} className="text-[#a47e36]" />
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#1e150f]">
              {clicksCount.toLocaleString("fr-FR")}
            </p>
          </div>

          {/* Taux d'engagement */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ecdcc8] p-4 flex flex-col justify-between shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#826f5d]">Engagement Insta</span>
              <Flame size={16} className="text-amber-500" />
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#a47e36]">
              {engagementRate}%
            </p>
          </div>
        </div>
      </section>

      {/* 3. STUDIO D'ÉDITION & APERÇU TEMPS RÉEL AU FORMAT INSTA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE GAUCHE (7 cols) : STUDIO DE CONCEPTION & CIBLAGE */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-7">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-[#1e150f] font-semibold">
                Studio de Création de l&apos;Annonce
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Rédigez votre offre, choisissez vos médias (photo ou vidéo) et définissez le ciblage géographique.
              </p>
            </div>
            <button
              onClick={handleSaveCampaign}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#201811] hover:bg-[#332418] text-[#f7e7b4] text-xs font-bold tracking-wider shadow-sm transition"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>

          {/* Choix du format média : Photo vs Vidéo */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
              <span>Format du Média Insta</span>
              <span className="text-[11px] font-normal text-gray-500">Photo HD ou Vidéo MP4</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType("photo");
                  setMediaUrl(PRESET_PHOTOS[0].url);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  mediaType === "photo"
                    ? "bg-[#281a10] text-[#f7e7b4] border-[#281a10] shadow-sm"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Camera size={16} /> <span>Photo Haute Définition</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType("video");
                  setMediaUrl(PRESET_VIDEOS[0].url);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  mediaType === "video"
                    ? "bg-[#281a10] text-[#f7e7b4] border-[#281a10] shadow-sm"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Video size={16} /> <span>Vidéo MP4 / Reel Animé</span>
              </button>
            </div>

            {/* Presets rapides */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-gray-500 mb-2">
                Sélections de prestige recommandées :
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(mediaType === "photo" ? PRESET_PHOTOS.slice(0, 3) : PRESET_VIDEOS).map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setMediaUrl(item.url)}
                    className={`p-2 rounded-xl text-left border text-[11px] transition line-clamp-2 ${
                      mediaUrl === item.url
                        ? "bg-[#faf5eb] border-[#b8924a] text-[#8a682b] font-bold ring-1 ring-[#b8924a]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL personnalisée */}
            <div className="mt-2">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Ou collez l'URL directe d'une photo (.jpg, .png) ou vidéo (.mp4)..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a]"
              />
            </div>
          </div>

          {/* Titre & Accroche */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Titre de la publication (Accroche principale)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                placeholder="Ex : Mariages & Réceptions Royales"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm font-medium"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-1">{title.length} / 60 caractères</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Texte du Post & Avantage Spécial
              </label>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="Ex : Réservez votre traiteur d'exception avant le 30 du mois et bénéficiez de la fontaine à champagne et du cocktail d'accueil offerts !"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm leading-relaxed"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-1">{hook.length} / 160 caractères</span>
            </div>
          </div>

          {/* Badge & Macaron */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-[#b8924a]" />
              <span>Badge Signature Sponsorisé</span>
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
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton d'action CTA */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Texte du Bouton d&apos;Action Insta
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ex : Demander un devis, Découvrir nos formules, Réserver une date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a] text-sm"
            />
          </div>

          {/* CIBLAGE GÉOGRAPHIQUE STRICT : PAYS -> RÉGION -> QUARTIER AVEC SYNCHRONISATION */}
          <div className="p-5 bg-[#faf7f2] rounded-3xl border border-[#ecdcc8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdcc9] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#634b22] flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#a47e36]" />
                  <span>Ciblage Géographique : Pays &gt; Région &gt; Quartier</span>
                </h3>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Ne mélangez pas tout : ciblez précisément les convives de votre zone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncWithProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-[#d8c298] text-[#8a682b] text-xs font-bold shadow-2xs transition self-start"
              >
                <RotateCcw size={13} />
                <span>Reprendre ma localisation (Profil)</span>
              </button>
            </div>

            {/* Niveau 1 : Pays */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">1. Pays d&apos;intervention</label>
              <select
                value={country}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setCountry(newCountry);
                  const regs = regionsOf(newCountry);
                  setRegion(regs[0] || "");
                  setQuartiers([]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-sm focus:outline-none focus:border-[#b8924a]"
              >
                {MAIN_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Niveau 2 : Région */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">2. Région / Ville principale</label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setQuartiers([]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-sm focus:outline-none focus:border-[#b8924a]"
              >
                {availableRegions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Niveau 3 : Quartiers */}
            {availableQuartiers.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  3. Quartiers & Communes ciblés ({quartiers.length} sélectionné{quartiers.length > 1 ? "s" : ""})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setQuartiers([])}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      quartiers.length === 0 ? "bg-[#281a10] text-[#f7e7b4]" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Toute la région
                  </button>
                  {availableQuartiers.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleToggleQuartier(q)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        quartiers.includes(q)
                          ? "bg-[#b8924a] text-white"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {quartiers.includes(q) ? "✓ " : ""}{q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action finale */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveCampaign}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-[#201811] hover:bg-[#332418] text-[#fbf5eb] text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
            <button
              onClick={handleToggleOnlineStatus}
              disabled={saving}
              className={`py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                isOnline
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isOnline ? "Retirer de la vitrine" : "Mettre en ligne maintenant"}
            </button>
          </div>
        </div>

        {/* COLONNE DROITE (5 cols) : LE RENDU DESIGN INSTA OFFICIEL */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#d4af37] to-[#ec4899]" />
              <h3 className="font-serif text-lg font-bold text-gray-900">Aperçu en Direct • Format Insta</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {isOnline ? "🟢 Diffusé en direct" : "⏸️ Aperçu préparatoire"}
            </span>
          </div>

          {/* CARTE INSTAGRAM POST HAUTE COUTURE */}
          <div className="w-full max-w-sm mx-auto bg-black text-white rounded-[32px] overflow-hidden border border-white/10 shadow-2xl transition-all">
            
            {/* Header Instagram Post */}
            <div className="p-3.5 flex items-center justify-between border-b border-white/10 bg-[#0f0c09]">
              <div className="flex items-center gap-2.5">
                {/* Avatar avec anneau dégradé Instagram Gold/Rose */}
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f59e0b] to-[#ec4899] shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-900 border border-black flex items-center justify-center">
                    {providerAvatar ? (
                      <Image src={providerAvatar} alt={providerName} width={36} height={36} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[#f7e7b4]">
                        {providerName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate max-w-[170px]">
                      {providerName}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#d4af37] text-black text-[9px] font-extrabold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">
                    {region}, {country} • <span className="text-[#d4af37]">Sponsorisé</span>
                  </p>
                </div>
              </div>

              <button type="button" className="text-gray-400 hover:text-white p-1">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Média Instagram (Photo ou Vidéo avec badge) */}
            <div className="relative aspect-square w-full bg-stone-950 overflow-hidden flex items-center justify-center">
              {mediaType === "video" ? (
                <div className="relative w-full h-full">
                  <video
                    src={mediaUrl}
                    autoPlay={videoPlaying}
                    loop
                    muted={videoMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Contrôles overlay vidéo */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => setVideoMuted(!videoMuted)}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition"
                      aria-label="Son"
                    >
                      {videoMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition"
                      aria-label="Pause"
                    >
                      {videoPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <Image
                  src={mediaUrl}
                  alt={title || "Visuel Sponsorisé"}
                  fill
                  className="object-cover"
                />
              )}

              {/* Badge d'offre privilégiée sur le média */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#d4af37]/60 text-[#f7e7b4] text-[11px] font-bold shadow-lg">
                  {badge}
                </span>
              </div>
            </div>

            {/* Bouton d'action CTA Instagram Sponsorisé */}
            <div className="p-2.5 bg-[#17130e] border-y border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#f7e7b4] pl-2 truncate">
                {title || "Offre Spéciale Evenium"}
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-extrabold text-xs shadow-md flex items-center gap-1 hover:brightness-105 active:scale-95 transition shrink-0"
              >
                <span>{ctaLabel}</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* Barre d'actions Instagram (Like, Comment, Share, Save) */}
            <div className="p-3 pb-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setLiked(!liked);
                    setLikesOffset((prev) => (liked ? prev - 1 : prev + 1));
                  }}
                  className="hover:scale-110 active:scale-90 transition"
                  aria-label="J'aime"
                >
                  <Heart
                    size={22}
                    className={liked ? "text-rose-500 fill-rose-500" : "text-white hover:text-rose-400"}
                  />
                </button>
                <button type="button" className="hover:scale-110 active:scale-90 transition" aria-label="Contacter">
                  <MessageSquare size={21} className="text-white" />
                </button>
                <button type="button" className="hover:scale-110 active:scale-90 transition" aria-label="Partager">
                  <Share2 size={20} className="text-white" />
                </button>
              </div>
              <button type="button" className="hover:scale-110 active:scale-90 transition" aria-label="Enregistrer">
                <Bookmark size={21} className="text-white" />
              </button>
            </div>

            {/* Compteurs de Likes & Vues relatifs */}
            <div className="px-3.5 pb-2 text-xs font-bold text-white flex items-center gap-3">
              <span>❤️ {rawLikes.toLocaleString("fr-FR")} J&apos;aime</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300 font-normal">👁️ {viewsCount.toLocaleString("fr-FR")} vues</span>
            </div>

            {/* Légende du post */}
            <div className="px-3.5 pb-4 text-xs space-y-1 text-gray-200">
              <p className="leading-relaxed">
                <span className="font-bold text-white mr-1.5">{providerName}</span>
                <span className="text-[#f7e7b4] font-semibold">{title}</span> — {hook}
              </p>
              <p className="text-[11px] text-[#d4af37]/90 pt-1 font-medium">
                #Evenium #MariageDeLuxe #{region.replace(/\s+/g, "")} #PrestataireEvenium #HauteCouture
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE PAIEMENT & ACTIVATION DU BOOST */}
      {isBoostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#fbf7f0] border border-[#d9c08c] rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a47e36] bg-[#ecd9b0]/50 px-3 py-1 rounded-full border border-[#dcc59c]">
                Formules Visibilité Evenium Pro
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1e150f]">
                Activez votre Boost Publicitaire
              </h3>
              <p className="text-xs text-[#6b5847]">
                Votre annonce Instagram apparaîtra en tête des recommandations organisateurs.
              </p>
            </div>

            {paymentSuccessMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCheck size={32} />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#1e150f]">Félicitations !</h4>
                <p className="text-sm text-gray-700">{paymentSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsBoostModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#201811] text-[#f7e7b4] text-xs font-bold uppercase tracking-wider"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Choix des formules */}
                <div className="space-y-3">
                  {CAMPAIGN_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        selectedPlan === plan.id
                          ? "bg-white border-[#b8924a] ring-2 ring-[#b8924a]/20 shadow-sm"
                          : "bg-white/60 border-gray-200 hover:bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#1e150f]">{plan.name}</span>
                          {plan.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4e8d3] text-[#8a682b]">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.durationLabel}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-base text-[#1e150f]">{plan.priceFcfa.toLocaleString("fr-FR")} FCFA</span>
                        <span className="block text-[11px] text-gray-400">({plan.priceEur})</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Méthodes de paiement sécurisées */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Moyen de paiement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wave")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                        paymentMethod === "wave"
                          ? "bg-[#1da1f2]/10 border-[#1da1f2] text-[#1da1f2]"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      <Smartphone size={16} /> <span>Wave</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("orange_money")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                        paymentMethod === "orange_money"
                          ? "bg-[#ff6600]/10 border-[#ff6600] text-[#ff6600]"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      <Smartphone size={16} /> <span>Orange Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                        paymentMethod === "card"
                          ? "bg-[#281a10] border-[#281a10] text-[#f7e7b4]"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      <CreditCard size={16} /> <span>Carte Bancaire</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBoostModalOpen(false)}
                    className="px-5 py-3 rounded-full border border-gray-300 text-gray-600 text-xs font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleActivateBoost}
                    disabled={isProcessingPayment}
                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#201811] via-[#332418] to-[#1c150e] text-[#f7e7b4] text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-125 transition flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Zap size={15} className="text-[#e2c178]" />
                        <span>Confirmer & Activer</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
