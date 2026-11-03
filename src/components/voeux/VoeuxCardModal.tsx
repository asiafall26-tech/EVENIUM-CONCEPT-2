"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, Sparkles, Send, Copy, Check, Heart, Share2, 
  Volume2, VolumeX, Eye, Edit3, ArrowRight, Gift,
  QrCode, RefreshCw, CheckCircle2, MessageCircle,
  CreditCard, ShieldCheck, Lock, ExternalLink
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
  const [recipient, setRecipient] = useState(initialRecipient || "Chère Maman");
  const [sender, setSender] = useState(initialSender || "Alexandre");
  const [customText, setCustomText] = useState(
    initialMessage || template?.quotePreview || "Que chaque seconde de cette nouvelle année te rappelle combien ta présence est un cadeau pour nous tous. Très bel anniversaire !"
  );
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<"stars" | "petals" | "confetti">("stars");
  const [mobileView, setMobileView] = useState<"card" | "edit" | "share">("card");
  const [showQrCode, setShowQrCode] = useState(false);
  
  // État d'achat du modèle : simulation d'acquisition pour partage illimité
  const [isPurchased, setIsPurchased] = useState(true); // Par défaut actif pour démonstration immédiate fluide
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);

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

  const shareText = `✨ ${sender} vous a envoyé une carte de vœux d'art « ${template.title} » sur Evenium :\n\n« ${customText} »\n\n🎁 Touchez le sceau de cire pour découvrir votre lettre animée et votre mélodie ici : ${cardShareUrl}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cardShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePurchase = () => {
    setIsProcessingBuy(true);
    setTimeout(() => {
      setIsProcessingBuy(false);
      setIsPurchased(true);
      setMobileView("share");
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-6xl h-dvh sm:h-[94vh] max-h-[960px] bg-[#1a110a] sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-0 sm:border border-[#c9a45e]/50 flex flex-col overflow-hidden text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRE SUPÉRIEURE DE LUXE */}
        <header className="shrink-0 bg-[#120a05] px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#c9a45e]/30 shadow-md">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e6ca85] via-[#c9a45e] to-[#8a6a2c] text-stone-950 flex items-center justify-center shadow-[0_0_15px_rgba(201,164,94,0.4)]">
              <Gift size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#fef9f0] tracking-wide truncate max-w-[200px] sm:max-w-md">
                  {template.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c9a45e]/25 text-[#f0d999] border border-[#c9a45e]/50 hidden sm:inline-block">
                  {template.price} • Prêt à offrir
                </span>
              </div>
              <p className="text-[11px] text-[#c4b5a5] flex items-center gap-1.5 font-light">
                <span>Modèle d'art partageable partout</span>
                <span>•</span>
                <span className="text-[#f0d999] font-medium">{template.categoryName}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">0 formulaire / Aucun RSVP</span>
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
                  : "bg-white/10 text-[#f0d999] border-[#c9a45e]/40 hover:bg-white/20"
              }`}
              title="Musique d'ambiance poétique"
            >
              {isPlayingMusic ? (
                <>
                  <Volume2 size={15} className="animate-pulse" />
                  <span className="hidden md:inline text-[11px] truncate max-w-[150px]">{template.suggestedMusic}</span>
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-stone-950 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 h-2/3 bg-stone-950 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-full bg-stone-950 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX size={15} />
                  <span className="hidden sm:inline text-[11px]">Musique d'ambiance</span>
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
        <div className="shrink-0 flex lg:hidden bg-[#120a05] border-b border-[#c9a45e]/25 px-2">
          <button
            type="button"
            onClick={() => setMobileView("card")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "card" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.04]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Eye size={14} /> 1. Carte en Direct
          </button>
          <button
            type="button"
            onClick={() => setMobileView("edit")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "edit" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.04]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Edit3 size={14} /> 2. Personnaliser
          </button>
          <button
            type="button"
            onClick={() => setMobileView("share")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mobileView === "share" 
                ? "text-[#f0d999] border-[#c9a45e] bg-white/[0.04]" 
                : "text-stone-400 border-transparent"
            }`}
          >
            <Share2 size={14} /> 3. Offrir &amp; Partager
          </button>
        </div>

        {/* CONTENU PRINCIPAL : DOUBLE COLONNE ATELIER SUR DESKTOP */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-gradient-to-b from-[#1c120a] via-[#140b06] to-[#0c0603]">
          
          {/* COLONNE GAUCHE (7/12) : SCÈNE IMMERSIVE AVEC ARRIÈRE-PLAN VIVANT & CLAIR */}
          <div className={`lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-[#c9a45e]/30 relative overflow-hidden ${
            mobileView === "card" ? "block" : "hidden lg:flex"
          }`}>
            
            {/* Lueurs dorées chaudes visibles */}
            <div aria-hidden className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#c9a45e]/25 blur-[100px] pointer-events-none" />
            <div aria-hidden className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#e8a598]/20 blur-[100px] pointer-events-none" />

            {/* Barre d'état au-dessus de la carte */}
            <div className="w-full max-w-md flex items-center justify-between mb-3 z-10">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#f0d999] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#f0d999]" />
                {isOpened ? "Lettre Dépliée & Visible" : "Enveloppe Prête à Offrir"}
              </span>

              {/* Sélecteur d'effets visuels */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full border border-[#c9a45e]/40 shadow-inner">
                <span className="text-[10px] text-[#c4b5a5] font-light mr-1 hidden sm:inline">Effet :</span>
                <button
                  type="button"
                  onClick={() => setSelectedEffect("stars")}
                  title="Étoiles d'or scintillantes"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "stars" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-sm" : "text-stone-300 hover:text-white"
                  }`}
                >
                  ✨
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEffect("petals")}
                  title="Pétales de rose délicats"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "petals" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-sm" : "text-stone-300 hover:text-white"
                  }`}
                >
                  🌸
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEffect("confetti")}
                  title="Confettis festifs"
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedEffect === "confetti" ? "bg-[#c9a45e] text-stone-950 font-bold shadow-sm" : "text-stone-300 hover:text-white"
                  }`}
                >
                  🎉
                </button>
              </div>
            </div>

            {/* CONTENEUR DE LA CARTE AVEC ARRIÈRE-PLAN ARTISTIQUE VISIBLE */}
            <div className="relative w-full max-w-[390px] aspect-[3/4.2] my-auto select-none">
              
              {/* Particules flottantes */}
              {selectedEffect === "stars" && (
                <div aria-hidden className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute text-amber-200 text-xs animate-pulse opacity-90 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                      style={{
                        top: `${12 + (i * 12)}%`,
                        left: `${8 + (i * 13)}%`,
                        animationDelay: `${i * 300}ms`,
                        transform: `scale(${0.9 + (i % 3) * 0.3})`
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>
              )}

              {/* CADRE DU FAIRE-PART : L'ARRIÈRE-PLAN RESTE NET ET CLAIREMENT VISIBLE */}
              <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(201,164,94,0.35)] border-2 border-[#e6ca85] transition-all duration-700 bg-[#160c07]">
                
                {/* L'IMAGE DE COUVERTURE : VISIBLE, LUMINEUSE ET NETTE (PAS DE VOILE NOIR ÉTOUFFANT !) */}
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover transition-transform duration-1000 scale-100 opacity-95"
                  priority
                />

                {/* Voile d'ombrage très léger aux coins pour préserver la lisibilité sans cacher l'image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

                {/* Cadre LuxFrame doré aux coins rentrants */}
                <LuxFrame className="inset-3.5 opacity-80" />

                {/* ÉTAT 1 : ENVELOPPE SCELLÉE AU CACHET DE CIRE */}
                {!isOpened ? (
                  <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center z-10">
                    
                    {/* Rabat supérieur */}
                    <div className="space-y-1 pt-1">
                      <Fleuron className="mx-auto w-24 h-auto opacity-80" />
                      <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#f0d999] drop-shadow-sm">
                        Carte de Vœux Haute Couture
                      </p>
                      <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {recipient || "Votre Destinataire"}
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
                      <p className="text-[11px] text-[#fbf3e4] tracking-wider uppercase font-bold mt-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] animate-pulse">
                        ✦ Touchez le sceau pour découvrir ✦
                      </p>
                    </div>

                    {/* Bas de l'enveloppe */}
                    <div className="space-y-1 pb-1">
                      <p className="text-xs font-serif italic text-white drop-shadow-md line-clamp-1">
                        « {template.quotePreview.slice(0, 50)}... »
                      </p>
                      <DiamondRule className="my-1.5 opacity-80" />
                      <p className="text-[11px] text-[#f0d999] font-medium tracking-wider drop-shadow-md">
                        Offert avec tout mon amour par <strong className="text-white">{sender || "Vous"}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ÉTAT 2 : CARTE DÉPLIÉE — LA LETTRE FLOTTE ÉLÉGAMMENT SUR L'IMAGE DE FOND VISIBLE */
                  <div className="absolute inset-2.5 sm:inset-3 rounded-2xl bg-[#140b05]/85 backdrop-blur-md border border-[#c9a45e]/70 p-5 sm:p-6 flex flex-col justify-between text-center z-20 animate-in zoom-in-95 duration-400 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                    
                    {/* En-tête de la lettre */}
                    <div className="space-y-1">
                      <div className="w-9 h-9 mx-auto rounded-full bg-[#c9a45e]/25 border border-[#c9a45e]/60 text-[#f0d999] flex items-center justify-center shadow-sm">
                        <Heart size={16} />
                      </div>
                      <p className="text-[9px] uppercase tracking-[0.25em] text-[#d4af37] font-bold">
                        Vœux d'Exception • {template.categoryName}
                      </p>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {recipient || "Chère personne"},
                      </h4>
                    </div>

                    {/* Corps du message dynamique */}
                    <div className="my-auto py-2 px-1 sm:px-2 overflow-y-auto max-h-[190px]">
                      <p className="font-serif italic text-sm sm:text-base leading-relaxed text-[#fbf3e4] whitespace-pre-line drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        « {customText || "Vos pensées les plus tendres et chaleureuses..."} »
                      </p>
                    </div>

                    {/* Pied de carte avec signature */}
                    <div className="pt-2 border-t border-[#c9a45e]/30 space-y-1">
                      <p className="text-[11px] text-stone-300 italic">Du fond du cœur,</p>
                      <p className="font-serif text-lg font-bold text-[#f0d999] tracking-wider">
                        {sender || "Alexandre"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsOpened(false)}
                        className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer pt-1"
                      >
                        Refermer l'enveloppe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contrôles bas de carte */}
            <div className="w-full max-w-md flex items-center justify-between gap-3 mt-3 z-10">
              <button
                type="button"
                onClick={() => setIsOpened(!isOpened)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f0d999] border border-[#c9a45e]/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>{isOpened ? "Refermer le faire-part" : "Déplier le faire-part"}</span>
              </button>

              <span className="text-[11px] text-[#c4b5a5] italic hidden sm:block">
                Papier : {template.paperTexture.split(" ")[0]} ivoire
              </span>

              {/* Bouton rapide vers l'atelier sur mobile */}
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

          {/* COLONNE DROITE (5/12) : STUDIO DE PERSONNALISATION, ACHAT & PARTAGE SANS RSVP */}
          <div className={`lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6 ${
            mobileView === "card" ? "hidden lg:flex" : "flex"
          }`}>
            
            {/* VUE 1 : ATELIER DE PERSONNALISATION DES TEXTES */}
            {(mobileView === "edit" || mobileView === "card") && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 text-[#f0d999] text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Edit3 size={11} /> Atelier d'Écriture Haute Couture
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[#fef9f0]">
                    Personnalisez votre <span className="italic text-gold-foil">Message</span>
                  </h4>
                  <p className="text-xs text-[#c4b5a5] mt-1 leading-relaxed font-light">
                    Tapez vos mots : ils se reflètent instantanément en temps réel sur la carte.
                  </p>
                </div>

                {/* Formulaire des noms */}
                <div className="space-y-4 bg-white/[0.04] p-4 sm:p-5 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#d9c08c] mb-1">
                        Pour qui ? (Destinataire)
                      </label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Ex: Chère Maman, Mon amour..."
                        maxLength={35}
                        className="w-full px-3.5 py-2.5 bg-black/50 border border-[#c9a45e]/40 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#f0d999] transition-colors"
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
                        placeholder="Ex: Alexandre, La famille Diop..."
                        maxLength={35}
                        className="w-full px-3.5 py-2.5 bg-black/50 border border-[#c9a45e]/40 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#f0d999] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#d9c08c]">
                        Votre lettre de vœux
                      </label>
                      <span className="text-[10px] text-stone-400">
                        {customText.length}/350 caractères
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Écrivez avec le cœur les mots qui marqueront pour toujours..."
                      maxLength={350}
                      className="w-full p-3.5 bg-black/50 border border-[#c9a45e]/40 rounded-xl text-sm text-[#fbf3e4] placeholder-stone-500 focus:outline-none focus:border-[#f0d999] leading-relaxed resize-none font-serif"
                    />
                  </div>
                </div>

                {/* Suggestions poétiques inspirantes en 1 clic */}
                {relevantInspirations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#d9c08c] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#f0d999]" /> Textes littéraires prêts à l'emploi :
                    </p>
                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
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
                            ✦ {ins.title} ({ins.occasion})
                          </span>
                          « {ins.text} »
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VUE 2 : BLOC D'ACHAT DU MODÈLE & PARTAGE UNIVERSEL ILLIMITÉ */}
            <div className="pt-4 border-t border-[#c9a45e]/30 space-y-4">
              
              {/* RAPPEL EXPLICITE : AUCUN RSVP NI TRACKING REQUIS */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-black/40 border border-emerald-500/30 flex items-start gap-3 text-left">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    Cadeau d'émotion pur • 0 formulaire / Aucun RSVP
                  </p>
                  <p className="text-[11px] text-stone-300 font-light mt-0.5 leading-snug">
                    Votre destinataire n'a aucune réponse à confirmer. Il clique, le cachet se brise avec la musique, et il savoure votre attention. Partageable partout à n'importe qui !
                  </p>
                </div>
              </div>

              {/* Bouton WhatsApp direct préformaté */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-[0_4px_18px_rgba(37,211,102,0.35)] hover:shadow-xl transition-all cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Envoyer directement sur WhatsApp à {recipient || "votre proche"}</span>
              </a>

              {/* Copie du lien & QR Code */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-[#c9a45e]/50 text-xs font-semibold text-[#f0d999] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? "Lien copié dans le presse-papier !" : "Copier le lien universel (SMS, Réseaux, Mail)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Afficher le QR Code du vœu"
                >
                  <QrCode size={16} />
                </button>
              </div>

              {/* QR Code Pop-in */}
              {showQrCode && (
                <div className="p-4 rounded-2xl bg-white text-stone-900 text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <p className="text-xs font-bold uppercase tracking-wider">Flashez pour ouvrir la carte sur smartphone</p>
                  <div className="w-28 h-28 mx-auto bg-stone-100 rounded-xl p-2 border border-stone-300 flex items-center justify-center">
                    <QrCode size={90} className="text-stone-800" />
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono break-all truncate max-w-xs mx-auto">
                    {cardShareUrl}
                  </p>
                </div>
              )}

              {/* Mention de garantie */}
              <p className="text-[10px] text-center text-stone-400">
                🔒 Modèle permanent • Valable à vie • Accessible sur tout smartphone sans application
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
