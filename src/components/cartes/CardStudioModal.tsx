"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  Share2, 
  Heart, 
  Eye, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Shirt,
  Music,
  Lightbulb,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { registerPurchasedCard, type VirtualCard, type CardCategoryType } from "@/lib/cartesService";
import { CartesStudio, type CartesStudioValue } from "./CartesStudio";

interface CardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardConfig: {
    type: CardCategoryType;
    templateId: string;
    occasionId: string;
    occasionName: string;
    templateTitle: string;
    theme: string;
    waxSealColor: string;
    defaultSender?: string;
    defaultRecipient?: string;
    defaultKicker?: string;
    defaultTitle?: string;
    defaultMessage?: string;
    suggestedMusic?: string;
    defaultDate?: string;
    defaultTime?: string;
    defaultPlace?: string;
    defaultDressCode?: string;
    priceFcfa: number;
    priceEur: string;
    inspirations?: Array<{ title: string; text: string }>;
  } | null;
}

export function CardStudioModal({ isOpen, onClose, cardConfig }: CardStudioModalProps) {
  const router = useRouter();

  // Étape du tunnel : 1 = Personnalisation, 2 = Coordonnées & Paiement, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Formulaire de personnalisation
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [kicker, setKicker] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [music, setMusic] = useState("");
  const [sealColor, setSealColor] = useState<"gold" | "ruby" | "emerald" | "pearl" | "sapphire">("gold");
  const [paperTheme, setPaperTheme] = useState<"ivory" | "parchment" | "rose" | "dark_velvet">("ivory");
  
  // Spécifique invitation couple
  const [rendezVousDate, setRendezVousDate] = useState("");
  const [rendezVousTime, setRendezVousTime] = useState("");
  const [rendezVousPlace, setRendezVousPlace] = useState("");
  const [dressCode, setDressCode] = useState("");

  // Coordonnées & Paiement
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "om" | "card">("wave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Résultat après achat
  const [generatedCard, setGeneratedCard] = useState<VirtualCard | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (cardConfig) {
      setRecipient(cardConfig.defaultRecipient || "");
      setSender(cardConfig.defaultSender || "");
      setKicker(cardConfig.defaultKicker || "");
      setTitle(cardConfig.defaultTitle || "");
      setMessage(cardConfig.defaultMessage || "");
      setMusic(cardConfig.suggestedMusic || "Clair de Lune - Debussy");
      setSealColor(
        (cardConfig.waxSealColor as any) ||
        (cardConfig.type === "mot_doux" || cardConfig.type === "invitation_couple" ? "ruby" : "gold")
      );
      setPaperTheme(
        cardConfig.type === "mot_doux" ? "rose" : cardConfig.type === "invitation_couple" ? "ivory" : "parchment"
      );
      setRendezVousDate(cardConfig.defaultDate || "");
      setRendezVousTime(cardConfig.defaultTime || "");
      setRendezVousPlace(cardConfig.defaultPlace || "");
      setDressCode(cardConfig.defaultDressCode || "");
      setStep(1);
      setErrorMessage("");
      setGeneratedCard(null);
    }
  }, [cardConfig]);

  if (!isOpen || !cardConfig) return null;

  // Calcul du lien généré
  const fullCardUrl = typeof window !== "undefined" && generatedCard 
    ? `${window.location.origin}/carte/${generatedCard.id}` 
    : "";

  const handleApplyInspiration = (text: string) => {
    setMessage(text);
  };

  const handleGoToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !sender.trim() || !message.trim()) {
      setErrorMessage("Veuillez renseigner le destinataire, l'expéditeur et votre message.");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleFinalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setErrorMessage("Merci de renseigner votre nom, email et téléphone pour sécuriser votre lien.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Génération de l'identifiant unique
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const cardId = `c_${cardConfig.type.substring(0, 4)}_${randomSuffix}`;

      const newCard: VirtualCard = {
        id: cardId,
        type: cardConfig.type,
        occasionId: cardConfig.occasionId,
        occasionName: cardConfig.occasionName,
        templateId: cardConfig.templateId,
        senderName: sender.trim(),
        recipientName: recipient.trim(),
        kicker: kicker.trim() || cardConfig.defaultKicker || "",
        title: title.trim() || cardConfig.defaultTitle || "",
        message: message.trim(),
        music: music.trim(),
        sealColor: sealColor,
        paperTheme: paperTheme,
        rendezVousDate: cardConfig.type === "invitation_couple" ? rendezVousDate.trim() : undefined,
        rendezVousTime: cardConfig.type === "invitation_couple" ? rendezVousTime.trim() : undefined,
        rendezVousPlace: cardConfig.type === "invitation_couple" ? rendezVousPlace.trim() : undefined,
        dressCode: cardConfig.type === "invitation_couple" ? dressCode.trim() : undefined,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        amount: cardConfig.priceFcfa,
        paymentMethod: paymentMethod,
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      };

      // Simulation de paiement réaliste
      await new Promise((r) => setTimeout(r, 1200));

      // Sauvegarde dans le service (Supabase + Local Vault)
      await registerPurchasedCard(newCard);

      setGeneratedCard(newCard);
      setIsProcessing(false);
      setStep(3);

    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || "Une erreur est survenue lors du paiement.");
    }
  };

  const handleCopyLink = () => {
    if (!fullCardUrl) return;
    navigator.clipboard.writeText(fullCardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!fullCardUrl || !generatedCard) return;
    const text = encodeURIComponent(
      `Coucou ${generatedCard.recipientName} ✨, je t'ai préparé une attention très spéciale scellée au cachet de cire rien que pour toi. Découvre-la ici : ${fullCardUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-5xl bg-[#faf6ee] text-[#2b1d12] rounded-3xl border border-[#d9c08c] shadow-2xl overflow-hidden my-auto">
        
        {/* BANDEAU SUPÉRIEUR HAUTE PAPETERIE */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-[#1a0f07] via-[#2c1a0e] to-[#1a0f07] text-[#fbf7ee] flex items-center justify-between border-b border-[#b8924a]/30">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 flex items-center justify-center text-sm">
              {cardConfig.type === "voeu" ? "🌟" : cardConfig.type === "mot_doux" ? "💌" : "🕯️"}
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37]">
                {cardConfig.type === "voeu" ? "Vœu d'Exception" : cardConfig.type === "mot_doux" ? "Mot Doux Secret" : "Invitation Couple"}
              </p>
              <h3 className="font-serif text-base sm:text-lg text-white font-medium">
                {cardConfig.templateTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ÉTAPES PROGRESSION */}
        <div className="px-6 py-2.5 bg-[#f3ebd9] border-b border-[#e6d7c3] flex items-center justify-between text-xs font-semibold">
          <span className={`flex items-center gap-1.5 ${step === 1 ? "text-[#8f6f33]" : "text-gray-400"}`}>
            <span className="w-4 h-4 rounded-full bg-[#b8924a] text-white text-[10px] flex items-center justify-center">1</span>
            Personnalisation
          </span>
          <span className="text-gray-300">→</span>
          <span className={`flex items-center gap-1.5 ${step === 2 ? "text-[#8f6f33]" : "text-gray-400"}`}>
            <span className={`w-4 h-4 rounded-full ${step >= 2 ? "bg-[#b8924a] text-white" : "bg-gray-300 text-gray-600"} text-[10px] flex items-center justify-center`}>2</span>
            Paiement & Sauvegarde
          </span>
          <span className="text-gray-300">→</span>
          <span className={`flex items-center gap-1.5 ${step === 3 ? "text-[#8f6f33]" : "text-gray-400"}`}>
            <span className={`w-4 h-4 rounded-full ${step === 3 ? "bg-[#b8924a] text-white" : "bg-gray-300 text-gray-600"} text-[10px] flex items-center justify-center`}>3</span>
            Lien & Partage
          </span>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ───────────────── ÉTAPE 1 : STUDIO D'ÉDITION & APERÇU EN DIRECT ───────────────── */}
          {step === 1 && (
            <CartesStudio
              cardType={cardConfig.type}
              occasionName={cardConfig.occasionName}
              templateTitle={cardConfig.templateTitle}
              priceFcfa={cardConfig.priceFcfa}
              priceEur={cardConfig.priceEur}
              value={{
                recipient,
                sender,
                kicker,
                title,
                message,
                music,
                sealColor,
                paperTheme,
                rendezVousDate,
                rendezVousTime,
                rendezVousPlace,
                dressCode,
              }}
              onChange={(patch) => {
                if (patch.recipient !== undefined) setRecipient(patch.recipient);
                if (patch.sender !== undefined) setSender(patch.sender);
                if (patch.kicker !== undefined) setKicker(patch.kicker);
                if (patch.title !== undefined) setTitle(patch.title);
                if (patch.message !== undefined) setMessage(patch.message);
                if (patch.music !== undefined) setMusic(patch.music);
                if (patch.sealColor !== undefined) setSealColor(patch.sealColor);
                if (patch.paperTheme !== undefined) setPaperTheme(patch.paperTheme);
                if (patch.rendezVousDate !== undefined) setRendezVousDate(patch.rendezVousDate);
                if (patch.rendezVousTime !== undefined) setRendezVousTime(patch.rendezVousTime);
                if (patch.rendezVousPlace !== undefined) setRendezVousPlace(patch.rendezVousPlace);
                if (patch.dressCode !== undefined) setDressCode(patch.dressCode);
              }}
              onProceedToCheckout={() => {
                if (!recipient.trim() || !sender.trim() || !message.trim()) {
                  setErrorMessage("Veuillez renseigner le destinataire, l'expéditeur et votre message.");
                  return;
                }
                setErrorMessage("");
                setStep(2);
              }}
              inspirations={cardConfig.inspirations}
            />
          )}

          {/* ───────────────── ÉTAPE 2 : PAIEMENT & COORDONNÉES ───────────────── */}
          {step === 2 && (
            <form onSubmit={handleFinalPayment} className="space-y-5">
              
              <div className="p-4 rounded-2xl bg-white border border-[#d9c08c] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Récapitulatif de commande</p>
                  <p className="font-serif text-base text-[#1a0f07] font-medium">
                    {cardConfig.templateTitle} pour <strong>{recipient}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-[#b8924a]">
                    {cardConfig.priceFcfa.toLocaleString()} FCFA
                  </span>
                  <span className="block text-[10px] text-gray-400">Paiement unique sans abonnement</span>
                </div>
              </div>

              {/* COORDONNÉES POUR NE JAMAIS PERDRE LE LIEN */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#665140] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#b8924a]" />
                  <span>Vos Coordonnées (Pour archiver et sécuriser votre lien)</span>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#665140] mb-1">Votre Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#665140] mb-1">Votre Adresse Email *</label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Le lien de secours vous sera envoyé ici.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#665140] mb-1">Numéro Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Sert à retrouver votre achat via SMS/Wave.</span>
                  </div>
                </div>
              </div>

              {/* SÉLECTION DU MODE DE PAIEMENT */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#665140] mb-2.5">
                  Sélectionnez votre moyen de paiement
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* WAVE */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wave")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "wave"
                        ? "bg-[#1dc4e9]/10 border-[#1dc4e9] text-[#0d7d96] font-bold shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">🐧</span>
                    <span className="text-xs">Wave</span>
                  </button>

                  {/* ORANGE MONEY */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("om")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "om"
                        ? "bg-[#ff6600]/10 border-[#ff6600] text-[#c04e02] font-bold shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">🍊</span>
                    <span className="text-xs">Orange Money</span>
                  </button>

                  {/* CARTE BANCAIRE */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "card"
                        ? "bg-[#b8924a]/15 border-[#b8924a] text-[#8f6f33] font-bold shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="text-xs">Carte Bancaire</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Modifier le texte</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-lux px-6 py-3 text-xs !tracking-[0.14em] cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Création du sceau...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>Confirmer & Payer {cardConfig.priceFcfa.toLocaleString()} FCFA</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ───────────────── ÉTAPE 3 : CONFIRMATION & PARTAGE ───────────────── */}
          {step === 3 && generatedCard && (
            <div className="text-center py-4 space-y-6">
              
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#faf0dc] text-[#8f6f33] text-[11px] font-bold uppercase tracking-widest border border-[#d9c08c] mb-2">
                  <Sparkles size={12} />
                  <span>Votre création est scellée</span>
                </span>
                <h3 className="font-serif text-2xl text-[#1a0f07]">
                  Félicitations ! Votre carte est prête.
                </h3>
                <p className="text-xs text-[#665140] max-w-md mx-auto mt-1">
                  Elle est scellée au cachet de cire et prête à être dévoilée à <strong>{generatedCard.recipientName}</strong>.
                </p>
              </div>

              {/* BOÎTIER LIEN UNIQUE */}
              <div className="p-4 rounded-2xl bg-white border border-[#d9c08c] text-left max-w-lg mx-auto shadow-sm">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                  Lien unique de votre création
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullCardUrl}
                    className="w-full text-xs font-mono bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 px-3 py-2 rounded-lg bg-[#b8924a] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copié !" : "Copier"}</span>
                  </button>
                </div>
              </div>

              {/* BOUTONS D'ACTION RAPIDE */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>Envoyer sur WhatsApp</span>
                </button>

                <a
                  href={`/carte/${generatedCard.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-[#1a0f07] hover:bg-black text-[#d4af37] text-xs font-bold border border-[#b8924a]/40 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Eye size={15} />
                  <span>Voir ma carte</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* RASSURANCE SAUVEGARDE PERMANENTE */}
              <div className="pt-4 border-t border-[#e6d7c3] text-[11px] text-[#665140] max-w-md mx-auto leading-relaxed">
                <p className="flex items-center justify-center gap-1 font-semibold text-[#1a0f07] mb-1">
                  <ShieldCheck size={13} className="text-[#b8924a]" />
                  <span>Garantie de conservation Evenium</span>
                </p>
                <p>
                  Ce lien est conservé à vie dans votre <strong>Dashboard Evenium</strong> et lié à votre email (<strong>{buyerEmail}</strong>). En cas d'oubli, vous pouvez le récupérer à tout moment sur <span className="underline font-medium">/cartes/retrouver</span>.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

