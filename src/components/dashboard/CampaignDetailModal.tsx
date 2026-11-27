"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Heart, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  Eye, 
  Tag, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock 
} from "lucide-react";
import { ProviderCampaign } from "@/types/campaigns";
import { recordCampaignAction } from "@/app/actions/campaignActions";
import { toggleCampaignLikeLocallyAndRemotely } from "@/lib/campaignsStorage";
import { addNotificationForProvider } from "@/lib/notifications";

interface CampaignDetailModalProps {
  campaign: ProviderCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuoteModal?: (campaign: ProviderCampaign) => void;
}

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onOpenQuoteModal,
}: CampaignDetailModalProps) {
  const [liked, setLiked] = useState(false);
  const [likesOffset, setLikesOffset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  if (!isOpen || !campaign) return null;

  const isVideo = campaign.media_url?.endsWith(".mp4") || campaign.media_url?.includes("video");

  const handleLike = async () => {
    const nextState = !liked;
    setLiked(nextState);
    setLikesOffset((prev) => (nextState ? prev + 1 : prev - 1));
    await toggleCampaignLikeLocallyAndRemotely(campaign.id, nextState);
    if (nextState) {
      addNotificationForProvider(campaign.provider_id, {
        title: "Nouveau J'aime reçu ❤️",
        desc: `Un organisateur a aimé votre publication « ${campaign.title} » !`,
        link: "/prestataire/publicite",
        type: "like",
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contactUrl = `/dashboard/messages?prestataire=${encodeURIComponent(campaign.provider_id)}&name=${encodeURIComponent(campaign.provider_name)}&msg=${encodeURIComponent(`Bonjour ${campaign.provider_name}, j'ai consulté votre publication « ${campaign.title} » (${campaign.badge}) et je souhaite échanger pour mon événement.`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ecdcc8] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Prestige Or & Noir */}
        <div className="bg-gradient-to-r from-[#1e150d] via-[#2c1e13] to-[#1a120b] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#d4af37]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-[#d6be90] shrink-0">
              {campaign.provider_avatar ? (
                <Image src={campaign.provider_avatar} alt={campaign.provider_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sm text-[#f5ebd7] bg-[#3a281a]">
                  {campaign.provider_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#faf3e8]">
                  {campaign.provider_name}
                </h3>
                <ShieldCheck size={14} className="text-[#d4af37]" />
              </div>
              <p className="text-[11px] text-[#edd9b0]">
                {campaign.provider_category || "Prestataire Partenaire Evenium"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5dfaa] text-[#1f150e]">
              <Sparkles size={11} className="text-[#a47e36]" />
              {campaign.badge}
            </span>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corps de l'élément publié */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Média en avant (Photo ou Vidéo) */}
          <div className="relative w-full aspect-video sm:aspect-16/9 rounded-2xl overflow-hidden bg-black shadow-md border border-neutral-200">
            {isVideo ? (
              <video
                src={campaign.media_url || ""}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
                loop
                muted={videoMuted}
              />
            ) : campaign.media_url ? (
              <Image
                src={campaign.media_url}
                alt={campaign.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 p-6 text-center">
                <Sparkles size={36} className="text-[#d4af37] mb-2" />
                <span className="text-sm font-serif text-[#f5ebd7]">Publication Officielle</span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className="bg-black/75 backdrop-blur-xs text-[#f5dfaa] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#d4af37]/60 shadow-xs">
                {campaign.badge}
              </span>
            </div>
          </div>

          {/* Barre d'actions & engagement */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer p-1.5 rounded-lg ${
                  liked ? "text-rose-600 bg-rose-50" : "text-gray-600 hover:text-rose-600 hover:bg-gray-50"
                }`}
              >
                <Heart size={18} className={liked ? "fill-rose-500 text-rose-500 animate-in zoom-in" : ""} />
                <span>{(campaign.likes_count || 0) + likesOffset} J&apos;aime</span>
              </button>

              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Eye size={16} />
                <span>{campaign.impressions_count || 0} vues</span>
              </span>

              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <MessageSquare size={16} />
                <span>{campaign.contacts_count || 0} devis demandés</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-semibold text-[#8f6f33] hover:text-[#5a4216] transition cursor-pointer"
            >
              <Share2 size={14} />
              <span>{copied ? "Lien copié !" : "Partager"}</span>
            </button>
          </div>

          {/* Contenu textuel complet */}
          <div className="space-y-2.5 text-left">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {campaign.title}
            </h2>
            <p className="text-sm font-medium text-[#7c5f27] bg-[#fbf7f0] p-3 rounded-xl border border-[#ebdccb]">
              💡 {campaign.hook}
            </p>
            {campaign.description && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line pt-1">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Informations contextuelles & localisation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <MapPin size={13} className="text-[#a47e36]" />
                <span>Disponibilité géographique</span>
              </span>
              <p className="text-gray-600 font-medium">
                {campaign.target_zones && campaign.target_zones.length > 0
                  ? campaign.target_zones.join(" • ")
                  : "Toutes zones"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Calendar size={13} className="text-[#a47e36]" />
                <span>Types d&apos;événements</span>
              </span>
              <p className="text-gray-600 font-medium">
                {campaign.target_event_types && campaign.target_event_types.length > 0
                  ? campaign.target_event_types.join(" • ")
                  : "Tous types"}
              </p>
            </div>
          </div>

        </div>

        {/* Footer avec boutons d'action essentiels */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <Link
            href={contactUrl}
            onClick={() => {
              recordCampaignAction(campaign.id, "contact");
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#d6bd8b] bg-white hover:bg-[#faf6ee] text-xs font-bold text-[#6b5329] shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={14} className="text-[#a47e36]" />
            <span>Contacter le prestataire</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenQuoteModal) {
                onOpenQuoteModal(campaign);
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1f150e] via-[#302216] to-[#1f150e] hover:brightness-110 text-[#f5dfaa] text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText size={14} className="text-[#f5dfaa]" />
            <span>{campaign.cta_label || "Demander un devis pour cette offre"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
