"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, Sparkles, Send, Copy, Check, Heart, Share2, 
  Volume2, VolumeX, Eye, Edit3, ArrowRight, Gift,
  QrCode, RefreshCw, CheckCircle2, MessageCircle
} from "lucide-react";
import { type VoeuxTemplate, VOEUX_INSPIRATIONS } from "@/data/mock/voeux";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";
import WaxSeal from "./WaxSeal";

interface Props {
  template: VoeuxTemplate | null;
  onClose: () => void;
  initialRecipient?: string;
  initialSender?: string;
  initialMessage?: string;
}

export default function VoeuxCardModal({
  template,
  onClose,
  initialRecipient,
  initialSender,
  initialMessage
}: Props) {
  const [recipient, setRecipient] = useState(initialRecipient || "Chère Sophie");
  const [sender, setSender] = useState(initialSender || "Alexandre");
  const [customText, setCustomText] = useState(
    initialMessage || template?.quotePreview || "Que cette journée soit remplie de joie, d'émotions intenses et de merveilleux souvenirs !"
  );
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<"stars" | "petals" | "confetti">("stars");
  const [mobileView, setMobileView] = useState<"card" | "edit" | "share">("card");
  const [showQrCode, setShowQrCode] = useState(false);

  // Synchronisation lors de l'ouverture d'un nouveau modèle
  useEffect(() => {
    if (template) {
      if (!initialMessage) {
        setCustomText(template.quotePreview);
      }
      setIsOpened(false);
      setMobileView("card");
    }
  }, [template, initialMessage]);

  if (!template) return null;

  const relevantInspirations = VOEUX_INSPIRATIONS.filter(
    (ins) => ins.categoryId === template.categoryId
  );

  const cardShareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/voeux?card=${template.id}&to=${encodeURIComponent(recipient)}&from=${encodeURIComponent(sender)}`
    : `https://evenium.com/voeux?card=${template.id}`;

  const shareText = `✨ ${sender} vous a envoyé une carte de vœux d'exception « ${template.title} » sur Evenium :\n\n« ${customText} »\n\nDécouvrez votre carte interactive scellée au cachet de cire ici : ${cardShareUrl}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cardShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-6xl h-dvh sm:h-[94vh] max-h-[960px] bg-[#140c07] sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-0 sm:border border-[#c9a45e]/40 flex flex-col overflow-hidden text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRE DE TÊTE LUXE */}
        <header className="shrink-0 bg-[#0d0703] px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#c9a45e]/25">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-stone-950 flex items-center justify-center shadow-[0_0_15px_rgba(201,164,94,0.4)]">
              <Gift size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#fef9f0] tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {template.title}
                </h3>
                {template.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#b8924a]/20 text-[#f0d999] border border-[#b8924a]/40 hidden sm:inline-block">
                    {template.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#c4b5a5] flex items-center gap-1.5">
                <span>Salon de Haute Papeterie Evenium</span>
                <span>•</span>
                <span className="text-[#f0d999]">{template.categoryName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Lecteur d'ambiance sonore */}
            <button
              type="button"
              onClick={() => setIsPlayingMusic(!isPlayingMusic)}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-2 text-xs cursor-pointer border ${
                isPlayingMusic 
                  ? "bg-[#c9a45e] text-stone-950 border-[#f0d999] font-bold shadow-[0_0_15px_rgba(201,164,94,0.5)]" 
                  : "bg-white/5 text-[#c4b5a5] border-white/10 hover:text-white hover:bg-white/10"
              }`}
              title="Musique d'ambiance poétique"
            >
              {isPlayingMusic ? (
                <>
                  <Volume2 size={15} className="animate-pulse" />
                  <span className="hidden md:inline text-[11px] truncate max-w-[150px]">{template.suggestedMusic}</span>
                  {/* Equalizer bars animées */}
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-stone-950 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 h-2/3 bg-stone-950 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-full bg-stone-950 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX size={15} />
                  <span className="hidden sm:inline text-[11px]">Ambiance sonore</span>
                </>
              )}
            </button>

            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              aria-label="Fermer la modale"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* NAVIGATION ONGLETS SUR MOBILE */}
        <div className="shrink-0 flex lg:hidden bg-[#0d0703] border-b border-[#c9a45e]/20 px-2">
          <button
            type="button"
            onClick={() => setMobileView("card")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "card" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.03]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Eye size={14} /> Carte en Direct
          </button>
          <button
            type="button"
            onClick={() => setMobileView("edit")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "edit" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.03]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Edit3 size={14} /> Personnaliser
          </button>
          <button
            type="button"
            onClick={() => setMobileView("share")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "share" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.03]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Share2 size={14} /> Envoyer
          </button>
        </div>

        {/* CONTENU PRINCIPAL : DOUBLE COLONNE ATELIER SUR DESKTOP */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-gradient-to-b from-[#180e07] via-[#120a05] to-[#0a0502]">
          
          {/* COLONNE GAUCHE (7/12) : SCÈNE IMMERSIVE LIVE CARTE & ENVELOPPE */}
          <div className={`lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-[#c9a45e]/25 relative overflow-hidden ${
            mobileView === "card" ? "block" : "hidden lg:flex"
          }`}>
            {/* Lueurs dorées d'ambiance */}
            <div aria-hidden className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#c9a45e]/15 blur-[90px] pointer-events-none" />
            <div aria-hidden className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#e8a598]/10 blur-[90px] pointer-events-none" />

            {/* Barre de contrôle d'état au-dessus de la carte */}
            <div className="w-full max-w-md flex items-center justify-between mb-4 z-10">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#d4af37] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#f0d999]" />
                {isOpened ? "Faire-part dévoilé" : "Enveloppe scellée"}
              </span>

              {/* Sélecteur d'effets visuels */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-[#c9a45e]/30">
                <button
                  type="button"
                  onClick={() => setSelectedEffect("stars")}
                  title="Étoiles d'or"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "stars" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  ✨
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEffect("petals")}
                  title="Pétales de rose"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "petals" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  🌸
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEffect("confetti")}
                  title="Confettis de fête"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "confetti" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  🎉
                </button>
              </div>
            </div>

            {/* CONTENEUR DE LA CARTE 3D RÉALISTE */}
            <div className="relative w-full max-w-[390px] aspect-[3/4.2] my-auto select-none perspective-[1000px]">
              
              {/* Effet Particules flottantes */}
              {selectedEffect === "stars" && (
                <div aria-hidden className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute text-amber-300 text-xs animate-pulse opacity-70"
                      style={{
                        top: `${15 + (i * 15)}%`,
                        left: `${10 + (i * 14)}%`,
                        animationDelay: `${i * 350}ms`,
                        transform: `scale(${0.8 + (i % 3) * 0.3})`
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>
              )}

              {/* CADRE DU FAIRE-PART PHYSIQUE */}
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(201,164,94,0.25)] border-2 border-[#e6ca85]/60 transition-all duration-700 bg-[#0f0906]">
                
                {/* Image de fond avec transition douce */}
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className={`object-cover transition-all duration-1000 ${
                    isOpened ? "scale-105 opacity-15 blur-[2px]" : "opacity-80 scale-100"
                  }`}
                />

                {/* Voile sombre et dégradé d'orfèvrerie */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${
                  isOpened 
                    ? "bg-gradient-to-b from-[#1b1009]/95 via-[#140b06]/95 to-[#0b0503]/98" 
                    : "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                }`} />

                {/* Cadre ornemental LuxFrame */}
                <LuxFrame className="inset-3.5 opacity-60" />

                {/* 1. ÉTAT CACHETÉ : ENVELOPPE & SCEAU DE CIRE */}
                {!isOpened ? (
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between items-center text-center z-10">
                    {/* Rabat supérieur */}
                    <div className="space-y-1.5 pt-2">
                      <Fleuron className="mx-auto w-28 h-auto opacity-70" />
                      <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#d9c08c]">
                        Faire-part Numérique d'Exception
                      </p>
                      <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-md">
                        {recipient || "Votre Proche"}
                      </h4>
                    </div>

                    {/* Sceau de cire tactile interactif */}
                    <div className="my-auto py-2 flex flex-col items-center">
                      <WaxSeal
                        color={template.waxSealColor}
                        size="lg"
                        isBroken={false}
                        onBreak={() => setIsOpened(true)}
                        label="Ouvrir"
                      />
                      <p className="text-[10px] text-[#f0d999] tracking-wider uppercase font-semibold mt-3 animate-pulse">
                        ✦ Touchez le sceau pour ouvrir ✦
                      </p>
                    </div>

                    {/* Signature basse */}
                    <div className="space-y-1 pb-1">
                      <p className="text-xs font-serif italic text-stone-300">
                        « {template.quotePreview.slice(0, 55)}... »
                      </p>
                      <DiamondRule className="my-1.5 opacity-60" />
                      <p className="text-[11px] text-[#d9c08c] font-medium tracking-wider">
                        Offert avec tendresse par <strong className="text-white">{sender || "Vous"}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 2. ÉTAT DÉPLIÉ : MESSAGE CHALEUREUX RÉVÉLÉ */
                  <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-between text-center z-10 animate-in zoom-in-95 duration-500">
                    
                    {/* En-tête de la lettre */}
                    <div className="space-y-1 pt-1">
                      <div className="w-10 h-10 mx-auto rounded-full bg-[#c9a45e]/20 border border-[#c9a45e]/50 text-[#f0d999] flex items-center justify-center shadow-inner">
                        <Heart size={18} />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#d9c08c] font-bold">
                        Vœux d'Exception • {template.categoryName}
                      </p>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {recipient || "Cher(e) ami(e)"},
                      </h4>
                    </div>

                    {/* Corps du message dynamique */}
                    <div className="my-auto py-3 px-1 sm:px-2 overflow-y-auto max-h-[220px]">
                      <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#fbf3e4] whitespace-pre-line drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        « {customText || "Vos pensées les plus douces écrites ici..."} »
                      </p>
                    </div>

                    {/* Pied de carte avec sceau miniature et signature */}
                    <div className="pt-2 border-t border-[#c9a45e]/30 space-y-1 pb-1">
                      <p className="text-[11px] text-stone-400 italic">Avec toute mon affection,</p>
                      <p className="font-serif text-xl font-bold text-[#f0d999] tracking-wider">
                        {sender || "Alexandre"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsOpened(false)}
                        className="text-[10px] text-[#c4b5a5] hover:text-white underline tracking-wider cursor-pointer pt-1"
                      >
                        Refermer l'enveloppe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pied d'actions rapides sous la carte */}
            <div className="w-full max-w-md flex items-center justify-between gap-3 mt-4 z-10">
              <button
                type="button"
                onClick={() => setIsOpened(!isOpened)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f0d999] border border-[#c9a45e]/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>{isOpened ? "Refermer le faire-part" : "Déplier le faire-part"}</span>
              </button>

              <div className="text-[11px] text-[#c4b5a5] italic hidden sm:block">
                Texture : {template.paperTexture}
              </div>

              {/* Bouton pour basculer sur l'onglet personnalisation sur mobile */}
              <button
                type="button"
                onClick={() => setMobileView("edit")}
                className="lg:hidden px-4 py-2 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Personnaliser</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* COLONNE DROITE (5/12) : STUDIO DE PERSONNALISATION & ENVOI */}
          <div className={`lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6 ${
            mobileView === "card" ? "hidden lg:flex" : "flex"
          }`}>
            
            {/* Si vue Personnalisation active */}
            {(mobileView === "edit" || mobileView === "card") && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 text-[#f0d999] text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Edit3 size={11} /> Atelier de Personnalisation
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[#fef9f0]">
                    Composez votre <span className="italic text-gold-foil">Message</span>
                  </h4>
                  <p className="text-xs text-[#c4b5a5] mt-1 leading-relaxed">
                    Les modifications s'affichent instantanément en temps réel sur la carte ci-contre.
                  </p>
                </div>

                {/* Formulaire des participants */}
                <div className="space-y-4 bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#d9c08c] mb-1">
                        Pour qui ? (Destinataire)
                      </label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Ex: Maman chérie, Sophie..."
                        maxLength={35}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-[#c9a45e]/40 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#f0d999] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#d9c08c] mb-1">
                        De la part de (Expéditeur)
                      </label>
                      <input
                        type="text"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        placeholder="Ex: Alexandre, La famille..."
                        maxLength={35}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-[#c9a45e]/40 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#f0d999] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#d9c08c]">
                        Votre mot chaleureux
                      </label>
                      <span className="text-[10px] text-stone-400">
                        {customText.length}/350 caractères
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Écrivez avec le cœur vos vœux les plus sincères..."
                      maxLength={350}
                      className="w-full p-3.5 bg-black/40 border border-[#c9a45e]/40 rounded-xl text-sm text-[#fbf3e4] placeholder-stone-500 focus:outline-none focus:border-[#f0d999] leading-relaxed resize-none font-serif"
                    />
                  </div>
                </div>

                {/* Suggestions poétiques en 1 clic */}
                {relevantInspirations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#d9c08c] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#f0d999]" /> Inspirations prêtes à l'emploi :
                    </p>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {relevantInspirations.map((ins, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCustomText(ins.text);
                            setIsOpened(true);
                          }}
                          className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#c9a45e]/25 hover:border-[#c9a45e] transition-all text-xs text-[#fbf3e4] leading-relaxed cursor-pointer group"
                        >
                          <span className="font-bold text-[#f0d999] block text-[11px] mb-0.5 group-hover:underline">
                            ✦ {ins.occasion}
                          </span>
                          « {ins.text} »
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Si vue Partage active ou bloc partage en bas */}
            <div className="pt-4 border-t border-[#c9a45e]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d9c08c]">
                  Transmettre la carte
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Inclus &amp; Instantané
                </span>
              </div>

              {/* Bouton WhatsApp vert officiel */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Envoyer sur WhatsApp à {recipient || "votre proche"}</span>
              </a>

              {/* Copie du lien avec feedback */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-[#c9a45e]/40 text-xs font-semibold text-[#f0d999] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? "Lien copié dans le presse-papier !" : "Copier le lien sécurisé"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Afficher le QR Code"
                >
                  <QrCode size={16} />
                </button>
              </div>

              {/* Modale ou aperçu QR Code */}
              {showQrCode && (
                <div className="p-4 rounded-2xl bg-white text-stone-900 text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider">Flashez pour ouvrir sur mobile</p>
                  <div className="w-32 h-32 mx-auto bg-stone-100 rounded-xl p-2 border border-stone-300 flex items-center justify-center">
                    <QrCode size={100} className="text-stone-800" />
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono break-all truncate max-w-xs mx-auto">
                    {cardShareUrl}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
