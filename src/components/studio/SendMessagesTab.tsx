"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  Users,
  Smartphone,
  ChevronDown,
  Info,
  BookmarkPlus,
  Trash2
} from "lucide-react";
import {
  fetchMessageTemplates,
  normalizeEventType,
  renderMessageTemplate,
  type MessageTemplate,
  type MessageTone,
  type TemplateVariables
} from "@/lib/messageTemplates";

interface Props {
  eventType?: string;
  shareUrl: string;
  partnerNames?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  guests?: Array<{ id: string; nom: string; telephone?: string }>;
  savedMessages?: string[];
  onSaveMessage?: (msg: string) => void;
  onDeleteSavedMessage?: (index: number) => void;
}

const TONES: { id: MessageTone | "all"; label: string; icon: string }[] = [
  { id: "all", label: "Tous", icon: "✨" },
  { id: "chaleureux", label: "Chaleureux", icon: "☀️" },
  { id: "formel", label: "Formel", icon: "🎩" },
  { id: "court", label: "Court", icon: "⚡" },
  { id: "tendre", label: "Tendre", icon: "❤️" },
];

const KNOWN_EVENT_TYPES = [
  "Mariage",
  "Baptême",
  "Anniversaire",
  "Conférence",
  "Vœux",
  "Mots doux",
];

export default function SendMessagesTab({
  eventType: initialEventType,
  shareUrl,
  partnerNames = "Alexandre & Marie",
  eventDate = "15 mai",
  eventTime = "16:00",
  eventVenue = "Domaine du Jardin Blanc",
  guests = [],
  savedMessages = [],
  onSaveMessage,
  onDeleteSavedMessage,
}: Props) {
  // Détection automatique du type sans le redemander
  const [selectedType, setSelectedType] = useState<string>(() => {
    const norm = normalizeEventType(initialEventType);
    return norm || "mariage";
  });

  const [activeTone, setActiveTone] = useState<MessageTone | "all">("all");
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customBody, setCustomBody] = useState<string>("");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Charger les modèles selon le type
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMessageTemplates(selectedType).then((res) => {
      if (!cancelled) {
        setTemplates(res);
        if (res.length > 0) {
          const first = res[0];
          setSelectedTemplateId(first.id);
          setCustomBody(first.body);
        }
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedType]);

  // Invité sélectionné pour la personnalisation individuelle
  const selectedGuest = useMemo(
    () => guests.find((g) => g.id === selectedGuestId),
    [guests, selectedGuestId]
  );

  // Variables de remplacement
  const currentVariables: TemplateVariables = useMemo(() => {
    return {
      prenom_invite: selectedGuest ? selectedGuest.nom.split(" ")[0] : "",
      prenoms_hotes: partnerNames,
      date: eventDate,
      heure: eventTime,
      lieu: eventVenue,
      lien: shareUrl,
    };
  }, [selectedGuest, partnerNames, eventDate, eventTime, eventVenue, shareUrl]);

  // Rendu en direct avec remplacement des variables
  const renderedMessage = useMemo(() => {
    return renderMessageTemplate(customBody, currentVariables, selectedType);
  }, [customBody, currentVariables, selectedType]);

  // Filtrage par ton
  const filteredTemplates = useMemo(() => {
    if (activeTone === "all") return templates;
    return templates.filter((t) => t.tone === activeTone);
  }, [templates, activeTone]);

  // Choisir un modèle
  const handleSelectTemplate = (t: MessageTemplate) => {
    setSelectedTemplateId(t.id);
    setCustomBody(t.body);
  };

  // Copier dans le presse-papier
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Enregistrer le message personnalisé avec l'invitation
  const handleSaveCustom = () => {
    if (!customBody.trim() || !onSaveMessage) return;
    onSaveMessage(customBody.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Lien WhatsApp wa.me
  const whatsappUrl = useMemo(() => {
    const textEncoded = encodeURIComponent(renderedMessage);
    const phone = selectedGuest?.telephone?.replace(/[^0-9]/g, "") || "";
    if (phone) {
      return `https://wa.me/${phone}?text=${textEncoded}`;
    }
    return `https://wa.me/?text=${textEncoded}`;
  }, [renderedMessage, selectedGuest]);

  return (
    <div className="space-y-4">
      {/* 1. Entête du type d'événement avec changement direct si besoin */}
      <div className="p-3.5 bg-gradient-to-r from-[#faf6ee] to-[#f4ebe1] rounded-2xl border border-[#b8924a]/30 flex items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f6f33] block">
            Type d&apos;invitation détecté
          </span>
          <p className="font-serif text-sm font-bold text-gray-900 capitalize">
            {selectedType}
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-white border border-[#b8924a]/40 text-gray-800 rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#b8924a] cursor-pointer"
          >
            {KNOWN_EVENT_TYPES.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Filtres par tonalité (Formel / Chaleureux / Court / Tendre) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700">Tonalité du message</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((tone) => {
            const active = activeTone === tone.id;
            return (
              <button
                type="button"
                key={tone.id}
                onClick={() => setActiveTone(tone.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  active
                    ? "bg-[#1b140e] text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{tone.icon}</span>
                <span>{tone.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Suggestions prêtes à l'emploi */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">Modèles recommandés</label>
        {loading ? (
          <div className="p-4 text-center text-xs text-gray-400">Chargement des messages…</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
            Aucun message dans ce ton pour ce type d&apos;invitation.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-50/70 border-[#b8924a] ring-1 ring-[#b8924a]/30 text-gray-900"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#8f6f33]">
                      Ton {t.tone} {t.sub_type ? `· ${t.sub_type}` : ""}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-[#b8924a] text-white px-1.5 py-0.5 rounded font-bold">
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 italic text-gray-600 leading-relaxed">{t.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Édition libre du message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-800">
            Modifier le texte librement
          </label>
          <span className="text-[10px] text-gray-400 font-mono">
            {customBody.length} caractères
          </span>
        </div>
        <textarea
          rows={4}
          value={customBody}
          onChange={(e) => setCustomBody(e.target.value)}
          placeholder="Rédigez ou personnalisez votre message..."
          className="w-full p-3 bg-white border border-gray-200 focus:border-[#b8924a] rounded-xl text-xs sm:text-sm text-gray-900 leading-relaxed outline-none focus:ring-1 focus:ring-[#b8924a] resize-y"
        />
        <p className="text-[10px] text-gray-400">
          Variables reconnues : <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{"{prenom_invite}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{"{prenoms_hotes}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{"{date}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{"{lieu}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{"{lien}"}</code>
        </p>
      </div>

      {/* 5. Sélecteur d'invité optionnel si la liste existe */}
      {guests.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
          <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <Users size={14} className="text-[#b8924a]" />
            <span>Personnaliser pour un invité spécifique :</span>
          </label>
          <select
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 outline-none cursor-pointer"
          >
            <option value="">Aperçu général (sans invité particulier)</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nom} {g.telephone ? `(${g.telephone})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 6. Aperçu WhatsApp en direct */}
      <div className="bg-[#efeae2] p-3.5 rounded-2xl border border-gray-200/80 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs text-[#075e54] font-bold">
          <div className="flex items-center gap-1.5">
            <Smartphone size={14} />
            <span>Aperçu du message envoyé</span>
          </div>
          <span className="text-[10px] text-gray-500 font-normal">Style WhatsApp</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-black/5 text-xs text-gray-800 whitespace-pre-line leading-relaxed font-sans">
          {renderedMessage}
        </div>
      </div>

      {/* 7. Boutons d'action (Copier / WhatsApp / Enregistrer) */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Message copié !" : "Copier le message"}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
          >
            <Send size={14} />
            <span>Envoyer sur WhatsApp</span>
          </a>
        </div>

        {onSaveMessage && (
          <button
            type="button"
            onClick={handleSaveCustom}
            className="w-full py-2 px-3 rounded-xl border border-[#b8924a]/40 bg-amber-50/60 hover:bg-amber-100/70 text-[#8f6f33] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookmarkPlus size={14} />
            <span>{savedSuccess ? "Enregistré avec l'invitation !" : "Enregistrer ce modèle personnalisé"}</span>
          </button>
        )}
      </div>

      {/* Messages personnalisés enregistrés */}
      {savedMessages.length > 0 && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Vos messages enregistrés ({savedMessages.length})
          </span>
          <div className="space-y-1.5">
            {savedMessages.map((msg, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs flex items-center justify-between gap-2"
              >
                <p
                  className="truncate flex-1 italic text-gray-700 cursor-pointer hover:text-black"
                  onClick={() => setCustomBody(msg)}
                  title="Cliquer pour charger ce texte"
                >
                  {msg}
                </p>
                {onDeleteSavedMessage && (
                  <button
                    type="button"
                    onClick={() => onDeleteSavedMessage(idx)}
                    className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Supprimer ce message"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note rassurante sur le RSVP */}
      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2">
        <Info size={14} className="text-[#b8924a] shrink-0 mt-0.5" />
        <p>
          Envoyer le message d&apos;accompagnement ne modifie pas le statut de réponse : seule la confirmation de votre invité au RSVP met à jour votre tableau de bord.
        </p>
      </div>
    </div>
  );
}
