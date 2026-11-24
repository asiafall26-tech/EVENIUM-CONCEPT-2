"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MessageCircle, Copy, Check, ExternalLink, Edit2, Sparkles, CheckCheck } from "lucide-react";
import { generateAccompanimentMessage, AccompanimentTone } from "@/lib/accompanimentMessages";

interface WhatsAppShareWidgetProps {
  eventId: string;
  eventName: string;
  eventType?: string;
  date?: string;
  time?: string;
  location?: string;
  modelId?: string;
  coverImage?: string;
  shareUrl: string;
  defaultTone?: AccompanimentTone;
  className?: string;
}

/**
 * Résout la photo de couverture appropriée pour le modèle
 */
export function resolveModelThumbnail(modelId?: string, coverImage?: string): string {
  if (coverImage && (coverImage.startsWith("http") || coverImage.startsWith("/"))) {
    return coverImage;
  }
  const mid = (modelId || "").toLowerCase();
  if (mid.includes("sceau")) return "/invit-sceau-dor-cover.jpg";
  if (mid.includes("ivoire")) return "/invit-ivoire-cover.jpg";
  if (mid.includes("rose-or")) return "/invit-rose-or-cover.jpg";
  if (mid.includes("anniversaire")) return "/invit-anniversaire-cover.jpg";
  return "/invit-velours-cover.jpg";
}

/**
 * Formate la date pour l'affichage élégant
 */
function formatEventDate(dateStr?: string): string {
  if (!dateStr || dateStr === "À définir") return "";
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const formatted = parsed.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  } catch {}
  return dateStr;
}

export default function WhatsAppShareWidget({
  eventId,
  eventName,
  eventType = "Mariage",
  date,
  time,
  location,
  modelId,
  coverImage,
  shareUrl,
  defaultTone,
  className = "",
}: WhatsAppShareWidgetProps) {
  const isMarriage = (eventType || "").toLowerCase().includes("mariage");
  const initialTone: AccompanimentTone = defaultTone || (isMarriage ? "religieux" : "chaleureux");

  const [tone, setTone] = useState<AccompanimentTone>(initialTone);
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedDate = useMemo(() => formatEventDate(date), [date]);
  const thumbnail = useMemo(() => resolveModelThumbnail(modelId, coverImage), [modelId, coverImage]);

  // Clean event title for the preview card header
  const previewTitle = useMemo(() => {
    const cleanName = eventName.replace(/^mariage\s*[·:\-]?\s*(de\s*)?/i, "").trim();
    if (eventType.toLowerCase().includes("mariage")) {
      return `Vous êtes invités au mariage de ${cleanName || eventName}`;
    }
    if (eventType.toLowerCase().includes("anniversaire")) {
      return `Vous êtes invités à l'anniversaire de ${cleanName || eventName}`;
    }
    if (eventType.toLowerCase().includes("bapt")) {
      return `Vous êtes invités au baptême de ${cleanName || eventName}`;
    }
    return `Vous êtes invités : ${eventName}`;
  }, [eventName, eventType]);

  // Subtitle in link preview card
  const previewSubtitle = useMemo(() => {
    const loc = location && location !== "À définir" ? location : "";
    if (loc && formattedDate) {
      return `${loc} · ${formattedDate}`;
    }
    if (loc) return `${loc} · Ouvrez votre invitation...`;
    if (formattedDate) return `${formattedDate} · Ouvrez votre invitation...`;
    return "Ouvrez votre invitation officielle...";
  }, [location, formattedDate]);

  // Clean domain for link preview
  const domain = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        return window.location.host;
      }
    } catch {}
    return "evenium.app";
  }, []);

  // Génération du texte selon le ton
  const generatedMessage = useMemo(() => {
    return generateAccompanimentMessage({
      serviceType: eventType,
      eventType: eventType,
      eventName: eventName,
      dateFormatted: formattedDate,
      time: time && time !== "À définir" ? time : undefined,
      location: location && location !== "À définir" ? location : undefined,
      link: shareUrl,
      tone: tone,
    });
  }, [eventType, eventName, formattedDate, time, location, shareUrl, tone]);

  // Synchroniser avec le texte modifiable
  useEffect(() => {
    setCustomText(generatedMessage);
  }, [generatedMessage]);

  const activeMessageText = isEditing ? customText : generatedMessage;

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(activeMessageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyLinkOnly = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappHref = useMemo(() => {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(activeMessageText)}`;
  }, [activeMessageText]);

  return (
    <div className={`bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden ${className}`}>
      {/* En-tête Widget */}
      <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-neutral-50/70 to-white">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#075e54] font-bold">
              Partage WhatsApp Officiel
            </p>
          </div>
          <h3 className="font-serif text-lg sm:text-2xl text-neutral-900 mt-0.5">
            Aperçu de votre invitation sur WhatsApp
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Vos invités reçoivent l&apos;aperçu visuel de votre modèle et votre message personnalisé.
          </p>
        </div>

        {/* Sélecteur de style / ton */}
        <div className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
          {isMarriage && (
            <button
              type="button"
              onClick={() => {
                setTone("religieux");
                setIsEditing(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                tone === "religieux"
                  ? "bg-neutral-900 text-[#f5dfaa] shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span>🕌</span>
              <span>Bénédiction</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTone("chaleureux");
              setIsEditing(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              tone === "chaleureux"
                ? "bg-neutral-900 text-[#f5dfaa] shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <span>✨</span>
            <span>Chaleureux</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTone("prestige");
              setIsEditing(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              tone === "prestige"
                ? "bg-neutral-900 text-[#f5dfaa] shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <span>⚜️</span>
            <span>Prestige</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTone("court");
              setIsEditing(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              tone === "court"
                ? "bg-neutral-900 text-[#f5dfaa] shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <span>⚡</span>
            <span>Express</span>
          </button>
        </div>
      </div>

      {/* Cadre de simulation WhatsApp réaliste (Dark Mode comme dans la capture) */}
      <div className="p-4 sm:p-6 bg-[#0b141a] flex justify-center items-center">
        <div className="w-full max-w-lg">
          {/* Bulle de message WhatsApp */}
          <div className="bg-[#1f2c34] text-[#e9edef] rounded-2xl rounded-tl-sm p-2 sm:p-3 shadow-xl border border-white/5 space-y-2.5 relative">
            {/* 1. Carte de prévisualisation du lien (OpenGraph) en haut du message */}
            <div className="bg-[#182229] rounded-xl overflow-hidden border border-white/5 flex items-stretch cursor-pointer hover:bg-[#1b2730] transition-colors">
              {/* Image miniature du modèle */}
              <div className="relative w-20 sm:w-24 shrink-0 bg-neutral-900 aspect-square overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={previewTitle}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Texte de la prévisualisation */}
              <div className="p-2 sm:p-2.5 flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-semibold text-xs sm:text-[13px] text-[#e9edef] leading-tight line-clamp-2">
                  {previewTitle}
                </p>
                <p className="text-[11px] text-[#8696a0] leading-tight mt-0.5 truncate">
                  {previewSubtitle}
                </p>
                <p className="text-[10px] text-[#8696a0] mt-1.5 flex items-center gap-1 font-mono">
                  <span>🔗</span>
                  <span className="truncate">{domain}</span>
                </p>
              </div>
            </div>

            {/* 2. Corps du message texte */}
            <div className="px-1 text-xs sm:text-[13px] text-[#e9edef] leading-relaxed whitespace-pre-wrap font-sans selection:bg-[#00a884] selection:text-white">
              {activeMessageText}
            </div>

            {/* Heure et coches bleues WhatsApp */}
            <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] pt-0.5 px-1 font-sans">
              <span>{new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              <CheckCheck size={14} className="text-[#53bdeb]" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'édition libre & actions rapides */}
      <div className="p-4 sm:p-6 bg-white space-y-4">
        {/* Toggle d'édition */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f6f33] hover:text-[#735824] transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
            <span>{isEditing ? "Masquer la zone de texte" : "Personnaliser le texte avant envoi"}</span>
          </button>

          <span className="text-[10px] text-neutral-400 font-mono">
            {activeMessageText.length} caractères
          </span>
        </div>

        {/* Zone de saisie si mode édition */}
        {isEditing && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Personnalisez le message WhatsApp..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all"
            />
            <p className="text-[10px] text-neutral-400">
              Le lien officiel est inclus dans le message. Modifiez le texte à votre convenance.
            </p>
          </div>
        )}

        {/* Boutons d'action principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Bouton Partager sur WhatsApp */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>Partager sur WhatsApp</span>
          </a>

          {/* Bouton Copier le message complet */}
          <button
            type="button"
            onClick={handleCopyFullMessage}
            className={`w-full py-3.5 px-5 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${
              copiedMessage
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 shadow-2xs"
            }`}
          >
            {copiedMessage ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedMessage ? "Message copié !" : "Copier le message complet"}</span>
          </button>
        </div>

        {/* Lien direct & bouton copier le lien seul */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-neutral-700">Lien direct :</span>
            <span className="font-mono text-[11px] text-neutral-600 truncate">{shareUrl}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLinkOnly}
              className="text-xs font-semibold text-[#8f6f33] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedLink ? "Lien copié !" : "Copier juste le lien"}</span>
            </button>

            <span className="text-neutral-300">|</span>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-neutral-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink size={12} />
              <span>Tester le lien</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
