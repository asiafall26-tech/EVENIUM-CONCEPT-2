"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, MessageCircle, Mail, Share2, FileText } from "lucide-react";

interface DevisShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  devis: {
    id: string;
    reference?: string;
    total?: number;
    eventName?: string;
    providerName?: string;
  };
  shareUrl?: string;
}

export function DevisShareModal({
  isOpen,
  onClose,
  devis,
  shareUrl,
}: DevisShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const reference = devis.reference || `DEV-${devis.id?.substring(0, 8).toUpperCase()}`;
  
  // Calculate URL
  const resolvedUrl = typeof window !== 'undefined' 
    ? (shareUrl || `${window.location.origin}/dashboard/devis/${devis.id}`)
    : "";

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && resolvedUrl) {
        await navigator.clipboard.writeText(resolvedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const shareText = `Bonjour, voici le devis Evenium n° ${reference}${devis.total ? ` d'un montant de ${devis.total.toLocaleString()} FCFA` : ''}${devis.eventName ? ` pour l'événement "${devis.eventName}"` : ''} : ${resolvedUrl}`;

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Devis Evenium n° ${reference}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-dessous le lien pour consulter les détails du devis Evenium n° ${reference} :\n\n${resolvedUrl}\n\nCordialement,\nEvenium Conciergerie`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Devis ${reference} - Evenium`,
          text: shareText,
          url: resolvedUrl,
        });
      } catch (err) {
        // User closed or canceled share dialog
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e4d8c4]/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#fbf7f0] to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5eee1] border border-[#b8924a]/30 flex items-center justify-center text-[#8f6f33]">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">Partager le devis</h3>
              <p className="text-xs text-gray-500">N° {reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-[#fbf7f0] border border-[#EFEAE0] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={18} className="text-[#8f6f33] shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {devis.eventName || "Devis de prestation"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {devis.providerName || "Prestataire agréé Evenium"}
                </p>
              </div>
            </div>
            {devis.total !== undefined && (
              <div className="text-right shrink-0 pl-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Total TTC</p>
                <p className="font-bold text-sm text-[#241b13]">{devis.total.toLocaleString()} FCFA</p>
              </div>
            )}
          </div>

          {/* Copy Link Section */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Lien direct du devis
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={resolvedUrl}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#b8924a] select-all font-mono"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  copied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-[#241b13] text-white hover:bg-black"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copié !
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copier
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                ✓ Lien copié dans votre presse-papiers !
              </p>
            )}
          </div>

          {/* Direct Share Options */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ou partager directement via :
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs transition-colors border border-[#25D366]/20 shadow-sm"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              
              <button
                onClick={handleEmail}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold text-xs transition-colors border border-gray-200 shadow-sm"
              >
                <Mail size={16} /> Email
              </button>
            </div>

            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 rounded-xl bg-white border border-[#b8924a]/40 text-[#8f6f33] hover:bg-[#f5eee1] font-bold text-xs transition-colors shadow-sm"
              >
                <Share2 size={16} /> Autres options de partage...
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Le destinataire pourra consulter le devis en ligne sur Evenium.
          </p>
        </div>
      </div>
    </div>
  );
}
