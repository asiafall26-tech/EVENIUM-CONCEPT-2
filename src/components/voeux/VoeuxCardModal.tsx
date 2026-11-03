"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, Sparkles, Send, Copy, Check, Heart, Share2, 
  Volume2, VolumeX, Eye, Edit3, ArrowRight, Gift
} from "lucide-react";
import { type VoeuxTemplate, VOEUX_INSPIRATIONS } from "@/data/mock/voeux";

interface Props {
  template: VoeuxTemplate | null;
  onClose: () => void;
}

export default function VoeuxCardModal({ template, onClose }: Props) {
  const [recipient, setRecipient] = useState("Chère Sophie");
  const [sender, setSender] = useState("Alexandre");
  const [customText, setCustomText] = useState(
    template?.quotePreview || "Que cette journée soit remplie de joie, d'émotions intenses et de merveilleux souvenirs !"
  );
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<"stars" | "petals" | "confetti">("stars");
  const [activeTab, setActiveTab] = useState<"preview" | "customize" | "share">("preview");

  if (!template) return null;

  const relevantInspirations = VOEUX_INSPIRATIONS.filter(
    (ins) => ins.categoryId === template.categoryId
  );

  const handleCopyLink = () => {
    const fakeUrl = `${window.location.origin}/voeux?card=${template.id}&to=${encodeURIComponent(recipient)}&from=${encodeURIComponent(sender)}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `✨ ${sender} vous a envoyé une carte de vœux d'exception « ${template.title} » sur Evenium : ${customText}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-5xl h-dvh sm:h-[92vh] max-h-[950px] bg-[#faf7f2] rounded-none sm:rounded-3xl shadow-2xl border border-[#c9a45e]/40 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la Modale */}
        <div className="shrink-0 bg-stone-950 text-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-stone-950 flex items-center justify-center shadow-md">
              <Gift size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#fef9f0] truncate">
                  {template.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#b8924a]/25 text-[#f0d999] border border-[#b8924a]/40">
                  {template.categoryName}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Carte de vœux interactive haute couture Evenium
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlayingMusic(!isPlayingMusic)}
              className={`p-2 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium ${
                isPlayingMusic ? "bg-[#b8924a] text-stone-950 font-bold" : "bg-stone-800 text-stone-400 hover:text-white"
              }`}
              title="Musique d'ambiance"
            >
              {isPlayingMusic ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden md:inline text-[11px]">{template.suggestedMusic}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Onglets (Mobile & Desktop) */}
        <div className="shrink-0 bg-white border-b border-stone-200 px-4 sm:px-8 flex gap-2 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "preview" 
                ? "text-[#b8924a] border-[#b8924a]" 
                : "text-stone-500 border-transparent hover:text-stone-900"
            }`}
          >
            <Eye size={15} /> 1. Expérience Visuelle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("customize")}
            className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "customize" 
                ? "text-[#b8924a] border-[#b8924a]" 
                : "text-stone-500 border-transparent hover:text-stone-900"
            }`}
          >
            <Edit3 size={15} /> 2. Personnaliser le Message
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "share" 
                ? "text-[#b8924a] border-[#b8924a]" 
                : "text-stone-500 border-transparent hover:text-stone-900"
            }`}
          >
            <Share2 size={15} /> 3. Partager &amp; Offrir
          </button>
        </div>

        {/* Corps de la Modale */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#faf7f2] to-[#f4ece1]">
          {activeTab === "preview" && (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[460px] space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] font-semibold">
                  Aperçu immersif pour {recipient}
                </span>
                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {isOpened ? "Message d'émotion dévoilé" : "Touchez le sceau pour ouvrir la carte"}
                </h4>
              </div>

              {/* Rendu Carte 3D Interactive */}
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#d4af37]/50 bg-stone-950 transition-all duration-700">
                {/* Photo de couverture de fond */}
                <Image 
                  src={template.coverImage} 
                  alt={template.title} 
                  fill 
                  className={`object-cover transition-all duration-1000 ${isOpened ? "scale-105 opacity-20 blur-sm" : "opacity-85"}`}
                />

                {/* Voile dégradé */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

                {!isOpened ? (
                  /* Enveloppe scellée */
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-8 text-center z-10">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#f0d999]">À l'attention de</p>
                      <h5 className="font-serif text-2xl font-bold text-white tracking-wide">{recipient}</h5>
                    </div>

                    {/* Sceau de cire interactif */}
                    <button
                      type="button"
                      onClick={() => setIsOpened(true)}
                      className="group relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#8a1c14] to-[#c93226] shadow-[0_0_30px_rgba(201,50,38,0.7)] flex flex-col items-center justify-center border-2 border-[#f0d999]/80 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                      <Sparkles size={22} className="text-[#f0d999] animate-pulse mb-0.5" />
                      <span className="text-[9px] font-serif font-black tracking-widest text-[#f0d999] uppercase">Ouvrir</span>
                      <span className="absolute -inset-2 rounded-full border border-[#f0d999]/30 animate-ping opacity-60" />
                    </button>

                    <div className="space-y-1">
                      <p className="text-xs text-stone-300 italic font-serif">« Un instant d'attention qui vient du cœur »</p>
                      <p className="text-[11px] text-[#b8924a] font-medium tracking-wider">De la part de {sender}</p>
                    </div>
                  </div>
                ) : (
                  /* Carte ouverte avec message */
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-center z-10 animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-[#b8924a]/20 border border-[#b8924a]/50 text-[#f0d999] flex items-center justify-center">
                        <Heart size={18} />
                      </div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#f0d999]">Vœux Chaleureux</p>
                      <h5 className="font-serif text-xl sm:text-2xl text-white font-bold">{recipient},</h5>
                    </div>

                    <div className="my-auto py-4 px-2">
                      <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#fbf3e4] drop-shadow-sm whitespace-pre-line">
                        « {customText} »
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#b8924a]/30">
                      <p className="text-xs text-stone-400">Avec toute mon affection,</p>
                      <p className="font-serif text-xl font-bold text-[#f0d999] tracking-wider mt-0.5">{sender}</p>
                      <button
                        type="button"
                        onClick={() => setIsOpened(false)}
                        className="mt-3 text-[11px] text-stone-400 hover:text-white underline cursor-pointer"
                      >
                        Refermer l'enveloppe
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Raccourcis bas de page */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpened(!isOpened)}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                >
                  {isOpened ? "Refermer la carte" : "Ouvrir la carte"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("customize")}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Personnaliser ce modèle</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "customize" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <h4 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-[#b8924a]" /> Informations de la Carte
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Destinataire (Nom ou Surnom) *
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Ex: Chère Sophie, Maman d'amour..."
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Expéditeur (Votre nom) *
                    </label>
                    <input
                      type="text"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      placeholder="Ex: Alexandre, La famille Diop..."
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Message personnalisé *
                    </label>
                    <span className="text-[11px] text-stone-400">Émotion &amp; Chaleur</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Écrivez ici vos vœux les plus sincères..."
                    className="w-full p-4 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 leading-relaxed resize-none"
                  />
                </div>

                {/* Suggestions automatiques */}
                {relevantInspirations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#b8924a]" /> Suggestions de textes prêtes à l'emploi :
                    </p>
                    <div className="space-y-2">
                      {relevantInspirations.map((ins, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCustomText(ins.text)}
                          className="w-full text-left p-3 rounded-xl bg-[#faf6ee] hover:bg-[#f5ebd6] border border-[#b8924a]/30 transition-colors text-xs text-stone-800 leading-relaxed group cursor-pointer"
                        >
                          <span className="font-bold text-[#8f6f33] block mb-0.5">{ins.occasion}</span>
                          « {ins.text} »
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Animation & Scintillements */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Animation d'ouverture :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "stars", label: "Étoiles dorées", icon: "✨" },
                      { id: "petals", label: "Pétales de rose", icon: "🌸" },
                      { id: "confetti", label: "Confettis festifs", icon: "🎉" }
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setSelectedEffect(eff.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          selectedEffect === eff.id
                            ? "bg-[#2b1d12] text-[#f0d999] border-[#c9a45e]"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <span>{eff.icon}</span>
                        <span>{eff.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Voir le rendu
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("share")}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Passer à l'envoi</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "share" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#faf6ee] to-[#f2e4cf] border border-[#b8924a]/40 text-[#b8924a] flex items-center justify-center mx-auto shadow-inner">
                  <Send size={26} />
                </div>

                <div>
                  <h4 className="font-serif text-2xl font-bold text-stone-900">
                    Votre carte est prête pour {recipient} !
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Transmettez-lui vos vœux instantanément par message, WhatsApp ou par lien direct.
                  </p>
                </div>

                {/* Encadré d'aperçu du lien */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Lien personnalisé de la carte</p>
                    <p className="text-xs font-mono text-stone-700 truncate">
                      evenium.com/voeux?card={template.id}&amp;to={encodeURIComponent(recipient)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                  </button>
                </div>

                {/* Boutons d'action directs */}
                <div className="space-y-3 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Share2 size={18} />
                    <span>Envoyer sur WhatsApp à {recipient}</span>
                  </a>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Une pensée chaleureuse pour vous : Vœux Evenium`)}&body=${encodeURIComponent(shareText)}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-colors"
                  >
                    <Send size={16} />
                    <span>Envoyer par Email</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check size={14} /> 100% Gratuit &amp; Illimité
                  </span>
                  <span>•</span>
                  <span>Accessible sur tout mobile</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
