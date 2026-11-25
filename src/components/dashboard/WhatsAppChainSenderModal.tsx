"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Send, SkipForward, Users } from "lucide-react";
import { updateGuestStatusAction } from "@/app/actions/guestsImport";
import { extractGroupAndWish } from "@/lib/guestImportUtils";

interface WhatsAppChainSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: any[];
  eventId: string;
  eventName: string;
  accompanimentMessage?: string;
  onGuestStatusUpdated: (guestId: string, newStatus: string) => void;
}

export function WhatsAppChainSenderModal({
  isOpen,
  onClose,
  guests,
  eventId,
  eventName,
  accompanimentMessage,
  onGuestStatusUpdated,
}: WhatsAppChainSenderModalProps) {
  // Filtrer uniquement les invités ayant un numéro de téléphone
  const eligibleGuests = guests.filter((g) => g.telephone && String(g.telephone).trim().length > 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSentCount(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentGuest = eligibleGuests[currentIndex];
  const total = eligibleGuests.length;
  const progressPercent = total > 0 ? Math.round(((currentIndex) / total) * 100) : 0;
  const isFinished = currentIndex >= total || total === 0;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://evenium.com";

  const handleSendAndNext = async () => {
    if (!currentGuest) return;

    const personalUrl = `${origin}/invite/${eventId}?guest=${currentGuest.id}`;
    const cleanPhone = String(currentGuest.telephone).replace(/\D/g, "");

    const defaultMsg = `Bonjour ${currentGuest.nom} ! Nous avons la joie de vous inviter à notre événement « ${eventName} ».\n\nRetrouvez tous les détails et confirmez votre présence en un clic sur votre lien personnel :`;
    const baseMessage = (accompanimentMessage && accompanimentMessage.trim().length > 0)
      ? accompanimentMessage.trim()
      : defaultMsg;

    const fullText = `${baseMessage}\n\n👉 Confirmer ma présence :\n${personalUrl}`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`;

    // 1. Ouvrir WhatsApp Web / App
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // 2. Mettre à jour le statut en 'Envoyé' s'il était 'Non envoyé'
    if (currentGuest.statut_rsvp === "Non envoyé") {
      await updateGuestStatusAction(currentGuest.id, eventId, "Envoyé");
      onGuestStatusUpdated(currentGuest.id, "Envoyé");
    }

    setSentCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const { group } = currentGuest ? extractGroupAndWish(currentGuest.message) : { group: "" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col">
        {/* En-tête */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-sm">
              <MessageCircle size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">
                Mode Envoi à la chaîne WhatsApp
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Envoyez vos invitations une par une en 1 clic sans faire d&apos;allers-retours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-2 border border-gray-200 shadow-xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="px-6 pt-4 pb-2 bg-gray-50/60 border-b border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
            <span>Progression des envois</span>
            <span className="font-semibold text-gray-900">
              {Math.min(currentIndex + 1, total)} / {total} invité{total > 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Corps */}
        <div className="p-6">
          {total === 0 ? (
            <div className="text-center py-8">
              <Users size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Aucun numéro de téléphone disponible</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Ajoutez ou importez des invités avec leur numéro de téléphone pour utiliser l&apos;envoi WhatsApp à la chaîne.
              </p>
            </div>
          ) : isFinished ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-bold text-gray-900">
                  Envois à la chaîne terminés !
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>{sentCount} invitation(s)</strong> ont été transmises sur WhatsApp durant cette session.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl bg-black text-[#f7e7b4] text-xs font-bold shadow-md hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Fermer et voir le tableau de suivi
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Carte de l'invité en cours */}
              <div className="bg-[#fcfaf7] border border-[#b8924a]/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#f5eee1] text-[#8f6f33] font-serif font-bold text-lg flex items-center justify-center shrink-0 border border-[#b8924a]/20">
                      {currentGuest.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold text-gray-900">
                        {currentGuest.nom}
                      </h4>
                      <p className="text-xs text-gray-600 font-mono mt-0.5 font-bold">
                        {currentGuest.telephone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {group && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] bg-[#b8924a]/15 px-2 py-0.5 rounded-full">
                        {group}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        currentGuest.statut_rsvp === "Non envoyé"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {currentGuest.statut_rsvp || "Non envoyé"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-gray-500 flex items-center justify-between">
                  <span>Places réservées : <strong>{1 + (Number(currentGuest.nombre_accompagnants) || 0)}</strong></span>
                  <span className="text-[11px] text-[#b8924a] font-medium">Lien personnel unique prêt</span>
                </div>
              </div>

              {/* Action principale d'envoi */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSendAndNext}
                  className="w-full py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Envoyer à {currentGuest.nom} &amp; Suivant</span>
                  <ArrowRight size={16} />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 font-medium disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={13} /> Invité précédent
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                  >
                    <span>Passer sans envoyer</span>
                    <SkipForward size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
