"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  X, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { ProviderCampaign } from "@/types/campaigns";
import { fetchActiveCampaignsAction, recordCampaignAction } from "@/app/actions/campaignActions";

interface PrivilegeOffersCarouselProps {
  eventType?: string;
  zone?: string;
  title?: string;
  className?: string;
  onSelectCampaign?: (campaign: ProviderCampaign) => void;
}

export function PrivilegeOffersCarousel({
  eventType,
  zone,
  title = "Sélection Privilège & Offres Partenaires",
  className = "",
  onSelectCampaign,
}: PrivilegeOffersCarouselProps) {
  const [campaigns, setCampaigns] = useState<ProviderCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed ids from localStorage
    try {
      const stored = localStorage.getItem("evenium_dismissed_campaigns");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }

    async function loadCampaigns() {
      try {
        const res = await fetchActiveCampaignsAction({ eventType, zone, limit: 6 });
        setCampaigns(res);
      } catch (err) {
        console.warn("Failed to load privilege campaigns:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [eventType, zone]);

  const visibleCampaigns = campaigns.filter((c) => !dismissedIds.includes(c.id));

  // Record impression for active visible cards
  useEffect(() => {
    if (visibleCampaigns.length > 0) {
      const active = visibleCampaigns[currentIndex];
      if (active) {
        recordCampaignAction(active.id, "impression");
      }
    }
  }, [visibleCampaigns, currentIndex]);

  const handleDismiss = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = [...dismissedIds, campaignId];
    setDismissedIds(updated);
    try {
      localStorage.setItem("evenium_dismissed_campaigns", JSON.stringify(updated));
    } catch {}
    recordCampaignAction(campaignId, "dismissed");
    if (currentIndex >= visibleCampaigns.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCtaClick = (campaign: ProviderCampaign) => {
    recordCampaignAction(campaign.id, "click");
    if (onSelectCampaign) {
      onSelectCampaign(campaign);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : visibleCampaigns.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < visibleCampaigns.length - 1 ? prev + 1 : 0));
  };

  if (loading || visibleCampaigns.length === 0) {
    return null;
  }

  const current = visibleCampaigns[currentIndex] || visibleCampaigns[0];

  return (
    <section className={`w-full overflow-hidden rounded-3xl border border-[#ecdcc8] bg-gradient-to-br from-[#fdfbf7] via-[#faf6ee] to-[#f7f0e3] p-5 sm:p-7 shadow-xs relative ${className}`}>
      
      {/* Halo or subtil de fond */}
      <div 
        aria-hidden 
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#ecd9b0]/35 blur-3xl pointer-events-none" 
      />

      {/* Header compact & élégant */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#ebdcca]/80 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#f3e7cb] border border-[#d6bd8b] flex items-center justify-center text-[#937130] shadow-xs">
            <Sparkles size={14} className="text-[#a47e36]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-medium text-[#241a12]">
                {title}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eddcb9]/60 text-[#7c5f27] border border-[#dcc59c]">
                <ShieldCheck size={11} /> Partenaires Vérifiés
              </span>
            </div>
            <p className="text-[11px] text-[#7c6a58]">
              {eventType ? `Privilèges exclusifs pour votre événement « ${eventType} »` : "Offres sélectionnées et réservées aux membres Evenium"}
            </p>
          </div>
        </div>

        {/* Contrôles carrousel (flèches + compteur) */}
        {visibleCampaigns.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#8c7762] font-medium hidden sm:inline">
              {currentIndex + 1} / {visibleCampaigns.length}
            </span>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Offre précédente"
              className="w-8 h-8 rounded-full border border-[#d9c49f] bg-white/80 hover:bg-white text-[#6b5329] flex items-center justify-center shadow-xs transition hover:scale-105"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Offre suivante"
              className="w-8 h-8 rounded-full border border-[#d9c49f] bg-white/80 hover:bg-white text-[#6b5329] flex items-center justify-center shadow-xs transition hover:scale-105"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Carte d'offre active */}
      <div className="relative z-10 bg-white/95 rounded-2xl border border-[#ebdccb] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-5 sm:gap-6 group hover:border-[#b8924a]/50 transition-all">
        
        {/* Visuel média */}
        <div className="relative w-full md:w-56 lg:w-64 h-48 md:h-44 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-[#edd7be]/60">
          {current.media_url ? (
            <Image
              src={current.media_url}
              alt={current.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-100 p-4 text-center">
              <Sparkles size={28} className="text-[#b8924a] mb-1" />
              <span className="text-xs font-serif text-[#7c633a]">Prestation d&apos;Exception</span>
            </div>
          )}

          {/* Badge macaron sur l'image */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1e1711]/90 backdrop-blur-xs text-[#f5ebd7] border border-[#d4af37]/60 shadow-md">
              <Sparkles size={10} className="text-[#f1c40f]" />
              {current.badge}
            </span>
          </div>

          {/* Bouton masquer discrètement */}
          <button
            onClick={(e) => handleDismiss(e, current.id)}
            title="Masquer cette offre pour moi"
            aria-label="Masquer cette offre"
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center transition shadow-xs"
          >
            <X size={12} />
          </button>
        </div>

        {/* Détails & Contenu de l'annonce */}
        <div className="flex-1 w-full space-y-2.5 text-left">
          
          {/* Identité du prestataire */}
          <div className="flex items-center gap-2.5">
            {current.provider_avatar ? (
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#d6be90] shrink-0">
                <Image
                  src={current.provider_avatar}
                  alt={current.provider_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#f1e4cb] text-[#86672c] font-bold text-xs flex items-center justify-center border border-[#d6be90]">
                {current.provider_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-[#1f1710] flex items-center gap-1.5">
                <span>{current.provider_name}</span>
                <CheckCircle2 size={12} className="text-[#b8924a] shrink-0" />
              </p>
              {current.provider_category && (
                <p className="text-[10px] text-[#85715c] uppercase tracking-wider">
                  {current.provider_category}
                </p>
              )}
            </div>
          </div>

          {/* Titre & Accroche */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-medium text-[#1c140d] leading-snug">
              {current.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#5d4d3d] mt-1 leading-relaxed">
              {current.hook}
            </p>
          </div>

          {/* Ciblage ou détails supplémentaires si présents */}
          {current.target_zones && current.target_zones.length > 0 && !current.target_zones.includes("Toutes") && (
            <p className="text-[11px] text-[#937b64]">
              📍 Disponible : <span className="font-medium text-[#4d3a27]">{current.target_zones.join(", ")}</span>
            </p>
          )}

          {/* Boutons d'action */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/messages?prestataire=${encodeURIComponent(current.provider_id)}&msg=${encodeURIComponent(`Bonjour, j'ai vu votre offre privilège « ${current.title} » sur Evenium et j'aimerais échanger pour mon événement.`)}`}
              onClick={() => handleCtaClick(current)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#201811] via-[#2f2217] to-[#1c150e] hover:brightness-125 text-[#fbf5eb] text-xs font-bold tracking-wider shadow-sm hover:scale-[1.02] transition"
            >
              <MessageSquare size={13} className="text-[#e2c178]" />
              <span>{current.cta_label || "Contacter le prestataire"}</span>
            </Link>

            <Link
              href={`/prestataire-activite?id=${encodeURIComponent(current.provider_id)}`}
              onClick={() => recordCampaignAction(current.id, "click")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a682b] hover:text-[#5a4216] hover:underline px-2 py-2"
            >
              <span>Découvrir la vitrine</span>
              <ExternalLink size={12} />
            </Link>
          </div>

        </div>

      </div>

      {/* Puces de pagination carrousel */}
      {visibleCampaigns.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {visibleCampaigns.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Aller à l'offre ${i + 1}`}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-[#b8924a]" : "w-1.5 bg-[#d8c39e]/60 hover:bg-[#b8924a]/60"
              }`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

