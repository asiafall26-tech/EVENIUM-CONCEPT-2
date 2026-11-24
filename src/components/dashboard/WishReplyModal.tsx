"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Sparkles,
  Heart,
  Send,
  Copy,
  Check,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  generateWishReply,
  getWishReplyPresets,
  getGuestFirstName,
} from "@/lib/wishReplies";
import { saveWishReplyAction } from "@/app/actions/wishReplies";

export interface WishReplyGuest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  status?: string;
  reply?: string;
  repliedAt?: string;
  channel?: string;
}

interface WishReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: WishReplyGuest | null;
  event: {
    id: string;
    name?: string;
    type?: string;
  };
  onReplySaved?: (guestId: string, reply: string, repliedAt: string, channel: string) => void;
}

export default function WishReplyModal({
  isOpen,
  onClose,
  guest,
  event,
  onReplySaved,
}: WishReplyModalProps) {
  const [selectedTone, setSelectedTone] = useState<"chaleureux" | "religieux" | "reconnaissant" | "court">("chaleureux");
  const [replyText, setReplyText] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialisation à l'ouverture du modal
  useEffect(() => {
    if (guest) {
      setPhoneInput(guest.phone || "");
      if (guest.reply) {
        setReplyText(guest.reply);
      } else {
        const initialText = generateWishReply({
          eventName: event.name,
          guestName: guest.name,
          originalWish: guest.message,
          eventType: event.type,
          tone: selectedTone,
        });
        setReplyText(initialText);
      }
      setSaveSuccess(false);
    }
  }, [guest, event.name, event.type]);

  if (!isOpen || !guest) return null;

  const presets = getWishReplyPresets({
    eventName: event.name,
    guestName: guest.name,
    originalWish: guest.message,
    eventType: event.type,
  });

  const handleSelectTone = (tone: "chaleureux" | "religieux" | "reconnaissant" | "court") => {
    setSelectedTone(tone);
    const newText = generateWishReply({
      eventName: event.name,
      guestName: guest.name,
      originalWish: guest.message,
      eventType: event.type,
      tone,
    });
    setReplyText(newText);
  };

  const cleanPhone = (phoneInput || guest.phone || "").replace(/[^0-9+]/g, "").replace(/^00/, "+");

  // Envoi direct via WhatsApp
  const handleSendWhatsApp = async () => {
    if (!replyText.trim()) return;
    setIsSaving(true);

    try {
      await saveWishReplyAction({
        eventId: event.id,
        guestId: guest.id,
        replyText: replyText.trim(),
        channel: "whatsapp",
        guestPhone: phoneInput.trim() || undefined,
      });

      const now = new Date().toISOString();
      if (onReplySaved) {
        onReplySaved(guest.id, replyText.trim(), now, "whatsapp");
      }
      setSaveSuccess(true);

      const targetDigits = cleanPhone.replace(/[^0-9]/g, "");
      const encoded = encodeURIComponent(replyText.trim());
      const url = targetDigits
        ? `https://api.whatsapp.com/send?phone=${targetDigits}&text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;

      window.open(url, "_blank");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur sauvegarde réponse:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Envoi direct par SMS
  const handleSendSms = async () => {
    if (!replyText.trim()) return;
    setIsSaving(true);

    try {
      await saveWishReplyAction({
        eventId: event.id,
        guestId: guest.id,
        replyText: replyText.trim(),
        channel: "sms",
        guestPhone: phoneInput.trim() || undefined,
      });

      const now = new Date().toISOString();
      if (onReplySaved) {
        onReplySaved(guest.id, replyText.trim(), now, "sms");
      }
      setSaveSuccess(true);

      const targetDigits = cleanPhone.replace(/[^0-9]/g, "");
      const encoded = encodeURIComponent(replyText.trim());
      const url = targetDigits ? `sms:${targetDigits}?body=${encoded}` : `sms:?body=${encoded}`;

      window.open(url, "_blank");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur sauvegarde réponse:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Envoi par Email
  const handleSendEmail = async () => {
    if (!replyText.trim() || !guest.email) return;
    setIsSaving(true);

    try {
      await saveWishReplyAction({
        eventId: event.id,
        guestId: guest.id,
        replyText: replyText.trim(),
        channel: "email",
      });

      const now = new Date().toISOString();
      if (onReplySaved) {
        onReplySaved(guest.id, replyText.trim(), now, "email");
      }
      setSaveSuccess(true);

      const subject = encodeURIComponent(`Merci pour vos vœux touchants — ${event.name || "Notre Événement"}`);
      const body = encodeURIComponent(replyText.trim());
      window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`, "_blank");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur sauvegarde réponse:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Copier le texte
  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Enregistrer simplement dans la base de données (sans ouvrir d'app externe)
  const handleSaveOnly = async () => {
    if (!replyText.trim()) return;
    setIsSaving(true);

    try {
      const res = await saveWishReplyAction({
        eventId: event.id,
        guestId: guest.id,
        replyText: replyText.trim(),
        channel: "manuel",
        guestPhone: phoneInput.trim() || undefined,
      });

      if (res.success) {
        const now = res.repliedAt || new Date().toISOString();
        if (onReplySaved) {
          onReplySaved(guest.id, replyText.trim(), now, "manuel");
        }
        setSaveSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Erreur sauvegarde réponse:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const firstName = getGuestFirstName(guest.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#b8924a]/30 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* En-tête */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#FAF9F6] to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#fbf7f0] border border-[#b8924a]/30 flex items-center justify-center text-lg shrink-0 shadow-2xs">
              💌
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33] block">
                Livre d&apos;or &amp; Vœux reçus
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 truncate">
                Répondre aux vœux de {guest.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps du modal défilable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Notification de succès */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs">
                Votre réponse a été enregistrée avec succès pour {firstName} !
              </span>
            </div>
          )}

          {/* Rappel du vœu reçu */}
          {guest.message && (
            <div className="bg-[#FAF9F6] border border-[#b8924a]/25 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] flex items-center gap-1">
                  <Sparkles size={11} /> Vœu laissé par {firstName} :
                </span>
                {guest.status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                    {guest.status}
                  </span>
                )}
              </div>
              <p className="font-serif italic text-gray-800 text-xs sm:text-[13px] leading-relaxed">
                « {guest.message} »
              </p>
            </div>
          )}

          {/* Suggestions rapides de ton (1 clic) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-700">
              Style de réponse en 1 clic :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {presets.map((p) => {
                const isActive = selectedTone === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectTone(p.id)}
                    className={`py-2 px-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isActive
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs flex items-center gap-1 font-semibold">
                      <span>{p.icon}</span>
                      <span className="truncate">{p.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zone de texte éditable */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-[#b8924a]" />
                Votre message de réponse (entièrement personnalisable) :
              </label>
              <span className="text-[10px] text-gray-400">
                {replyText.length} caractères
              </span>
            </div>
            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrivez votre mot de remerciement..."
              className="w-full bg-[#fcfbfa] border border-gray-300 rounded-2xl p-3.5 text-xs sm:text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none transition-all leading-relaxed shadow-inner"
            />
          </div>

          {/* Destinataire & Coordonnées */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
              Coordonnées de l&apos;invité pour l&apos;envoi :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Phone size={11} className="text-emerald-600" />
                  Numéro WhatsApp / Téléphone :
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-[#b8924a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Mail size={11} className="text-blue-600" />
                  Email :
                </label>
                <input
                  type="email"
                  readOnly
                  value={guest.email || "Non renseigné"}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 outline-none cursor-default"
                />
              </div>
            </div>
          </div>

          {/* Historique de réponse précédente si existante */}
          {guest.reply && (
            <div className="p-3 bg-neutral-100 rounded-xl text-xs text-neutral-600 flex items-start gap-2">
              <Clock size={13} className="text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[11px] text-neutral-700">
                  Dernière réponse enregistrée {guest.repliedAt ? `le ${new Date(guest.repliedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : ""} :
                </span>
                <p className="italic text-[11px] text-neutral-600 mt-0.5">« {guest.reply} »</p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page avec actions d'envoi direct */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FAF9F6] space-y-2.5">
          {/* Bouton Principal : Envoi direct WhatsApp */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={isSaving || !replyText.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle size={18} />
            <span>Envoyer directement à {firstName} sur WhatsApp</span>
          </button>

          {/* Boutons secondaires : SMS, Email, Copier, Enregistrer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleSendSms}
              disabled={isSaving || !replyText.trim()}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send size={13} className="text-gray-500" />
              <span>SMS</span>
            </button>

            {guest.email ? (
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSaving || !replyText.trim()}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail size={13} className="text-blue-500" />
                <span>Email</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-gray-500" />}
                <span>{copied ? "Copié !" : "Copier"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveOnly}
              disabled={isSaving || !replyText.trim()}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-[#f5dfaa] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check size={13} className="text-[#f5dfaa]" />
              <span>{isSaving ? "Enregistrement..." : "Marquer répondu"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
