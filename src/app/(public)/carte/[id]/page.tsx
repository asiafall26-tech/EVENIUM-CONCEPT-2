"use client";

import { use, useEffect, useState } from "react";
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Shirt, 
  Volume2, 
  VolumeX, 
  Check, 
  Loader2 
} from "lucide-react";
import { getCardById, updatePartnerResponse, type VirtualCard } from "@/lib/cartesService";

export default function CardViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [card, setCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États d'ouverture de l'enveloppe
  const [isOpened, setIsOpened] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // État de réponse du partenaire (si invitation couple)
  const [partnerAccepted, setPartnerAccepted] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getCardById(id);
      if (data) {
        setCard(data);
        if (data.partnerResponse === "accepted") {
          setPartnerAccepted(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleOpenEnvelope = () => {
    setIsOpened(true);
  };

  const handleAcceptCoupleInvitation = async () => {
    if (!card || partnerAccepted || isSubmittingResponse) return;
    setIsSubmittingResponse(true);
    await updatePartnerResponse(card.id, "accepted");
    setPartnerAccepted(true);
    setIsSubmittingResponse(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0704] flex items-center justify-center text-[#d4af37]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#b8924a]" />
          <p className="font-serif text-sm tracking-widest uppercase">Chargement de votre lettre...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0e0704] text-[#fbf7ee] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <span className="text-4xl">📜</span>
          <h1 className="font-serif text-2xl text-[#d4af37]">Carte introuvable ou archivée</h1>
          <p className="text-xs text-gray-400">
            Ce lien est peut-être expiré ou incomplet. Contactez l'expéditeur pour recevoir à nouveau son attention.
          </p>
        </div>
      </div>
    );
  }

  const isCouple = card.type === "invitation_couple";
  const isMotDoux = card.type === "mot_doux";

  // Thème de couleur de l'enveloppe
  const envelopeBg = isCouple 
    ? "bg-gradient-to-br from-[#4a0e17] via-[#2d090e] to-[#140306]" 
    : isMotDoux
    ? "bg-gradient-to-br from-[#3b0b14] via-[#24060c] to-[#120205]"
    : "bg-gradient-to-br from-[#26170d] via-[#1a0f07] to-[#0d0703]";

  // Couleur du sceau de cire
  const getSealBg = () => {
    if (card.sealColor === "ruby") return "bg-gradient-to-br from-[#d62828] via-[#9e1b23] to-[#590d12] shadow-red-950/60";
    if (card.sealColor === "gold") return "bg-gradient-to-br from-[#f3e099] via-[#c9a45e] to-[#805e26] shadow-amber-950/60";
    if (card.sealColor === "emerald") return "bg-gradient-to-br from-[#2d6a4f] via-[#1b4332] to-[#081c15] shadow-emerald-950/60";
    if (card.sealColor === "pearl") return "bg-gradient-to-br from-[#ffffff] via-[#f1ede4] to-[#c9bfae] text-[#1a0f07] shadow-slate-900/40";
    if (card.sealColor === "sapphire") return "bg-gradient-to-br from-[#2a6f97] via-[#013a63] to-[#012a4a] shadow-blue-950/60";
    return isCouple || isMotDoux
      ? "bg-gradient-to-br from-[#d62828] via-[#9e1b23] to-[#590d12] shadow-red-950/60"
      : "bg-gradient-to-br from-[#f3e099] via-[#c9a45e] to-[#805e26] shadow-amber-950/60";
  };
  const sealBg = getSealBg();

  // Thème du papier de la lettre
  const getPaperClasses = () => {
    if (card.paperTheme === "rose") return "bg-[#fff5f6] text-[#2d1217] border-[#eed1d7]";
    if (card.paperTheme === "parchment") return "bg-[#f8f0de] text-[#28180c] border-[#d4af37]/60";
    if (card.paperTheme === "dark_velvet") return "bg-[#160f0c] text-[#fbf7ee] border-[#b8924a]/50";
    return "bg-[#fcf9f2] text-[#24170e] border-[#d9c08c]";
  };
  const paperClasses = getPaperClasses();

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#2b1d12] relative overflow-hidden flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-[#c9a45e]/30">
      
      {/* HALO LUMINEUX CHAUD D'AMBIANCE */}
      <div 
        aria-hidden 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-gradient-to-b from-[#b8924a]/20 via-[#b8924a]/5 to-transparent blur-[120px] pointer-events-none" 
      />

      {/* POUSSIÈRES D'ÉTOILES FLOTTANTES */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <span className="absolute top-12 left-[10%] text-amber-300 text-xs animate-pulse opacity-40">✦</span>
        <span className="absolute top-1/3 right-[12%] text-[#d4af37] text-sm animate-pulse opacity-60">✧</span>
        <span className="absolute bottom-16 left-[20%] text-amber-200 text-xs animate-pulse opacity-50">✦</span>
      </div>

      {/* CONTRÔLE DU SON */}
      {isOpened && card.music && (
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#b8924a]/40 text-[#d4af37] text-[11px] font-medium flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{card.music}</span>
        </button>
      )}

      {/* ───────────────── ÉTAT 1 : ENVELOPPE SCELLÉE ───────────────── */}
      {!isOpened && (
        <div className="relative z-10 w-full max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-700">
          
          <div className="mb-6 space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#b8924a]/15 border border-[#b8924a]/30 text-[#d4af37] text-[11px] font-bold uppercase tracking-[0.2em]">
              <Sparkles size={12} />
              <span>Une attention vous attend</span>
            </span>
            <p className="font-serif text-xl sm:text-2xl text-[#fbf7ee]">
              Pour <strong>{card.recipientName}</strong>
            </p>
            <p className="text-xs text-[#a39082]">
              Scellée par <strong>{card.senderName}</strong>
            </p>
          </div>

          {/* CORPS DE L'ENVELOPPE HAUTE COUTURE */}
          <div className={`relative rounded-3xl p-8 sm:p-10 border border-[#b8924a]/40 shadow-2xl shadow-black/80 ${envelopeBg} transition-all duration-500`}>
            
            {/* Lignes dorées luxueuses du rabat de l'enveloppe */}
            <div className="absolute inset-x-0 top-0 h-28 border-b border-[#b8924a]/30 pointer-events-none" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "rgba(184, 146, 74, 0.05)" }} />

            <div className="pt-16 pb-8 space-y-6">
              
              {/* SCEAU DE CIRE CLIQUABLE */}
              <button
                onClick={handleOpenEnvelope}
                className="group relative mx-auto block cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Cliquer pour briser le sceau"
              >
                <div className={`w-24 h-24 rounded-full ${sealBg} border-2 border-white/30 flex flex-col items-center justify-center shadow-2xl text-white relative transition-all duration-300 group-hover:brightness-110`}>
                  
                  {/* Effet relief du cachet de cire */}
                  <div className="w-20 h-20 rounded-full border border-black/20 flex flex-col items-center justify-center">
                    {isCouple || isMotDoux ? (
                      <Heart size={28} className="fill-white/90 text-white drop-shadow-md animate-pulse" />
                    ) : (
                      <Sparkles size={28} className="text-[#1a0f07] drop-shadow-md" />
                    )}
                    <span className="text-[9px] uppercase tracking-widest font-bold mt-1 text-white/90 drop-shadow">
                      Evenium
                    </span>
                  </div>

                </div>

                {/* Bulle d'indication pulsante */}
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#d4af37]/40 text-[#fbf7ee] text-[10px] uppercase font-semibold tracking-widest shadow-md">
                  ✦ Toucher pour ouvrir ✦
                </span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ───────────────── ÉTAT 2 : LETTRE DÉPLOYÉE ───────────────── */}
      {isOpened && (
        <div className="relative z-10 w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* CARTE / LETTRE HAUTE PAPETERIE */}
          <div className={`relative ${paperClasses} rounded-3xl p-7 sm:p-12 shadow-2xl shadow-black/70 overflow-hidden transition-all duration-500`}>
            
            {/* Cadre ornemental doré délicat */}
            <div className="absolute inset-3 sm:inset-4 border border-[#d4af37]/40 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 sm:inset-5 border border-[#d4af37]/20 rounded-xl pointer-events-none" />

            <div className="relative z-10 text-center space-y-6">
              
              {/* PETIT SCEAU EMBOSSÉ DE RAPPEL */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] text-[10px] font-bold uppercase tracking-[0.2em]">
                {isCouple ? <Heart size={11} className="fill-red-500 text-red-500" /> : <Sparkles size={11} className="text-[#b8924a]" />}
                <span>{card.occasionName || (isCouple ? "Invitation Privée" : isMotDoux ? "Mot Doux" : "Vœu d'Exception")}</span>
              </div>

              {/* EN-TÊTE DÉLICAT */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] font-bold mb-1">
                  {card.kicker || "Pour toi"}
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1a0f07] leading-tight font-medium">
                  {card.title}
                </h1>
              </div>

              {/* CORPS DU MESSAGE */}
              <div className="py-2 px-2 sm:px-6">
                <p className="font-serif text-base sm:text-lg text-[#3d2919] leading-relaxed whitespace-pre-line italic">
                  "{card.message}"
                </p>
              </div>

              {/* ──────────────── SI INVITATION COUPLE : DÉTAILS DU RENDEZ-VOUS ──────────────── */}
              {isCouple && (
                <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#faf0dc] to-[#f5e3be] border border-[#d4af37]/50 text-left space-y-3.5 shadow-sm">
                  
                  <div className="flex items-center justify-between border-b border-[#b8924a]/20 pb-2.5">
                    <span className="font-serif text-sm font-semibold text-[#1a0f07] flex items-center gap-1.5">
                      <span>🕯️</span> Rendez-vous en Amoureux
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f6f33] px-2 py-0.5 rounded-full bg-white/70">
                      Privilège Duo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {card.rendezVousDate && (
                      <div className="flex items-center gap-2 text-[#4a3424]">
                        <Calendar size={14} className="text-[#b8924a] shrink-0" />
                        <span><strong>Date :</strong> {card.rendezVousDate}</span>
                      </div>
                    )}
                    {card.rendezVousTime && (
                      <div className="flex items-center gap-2 text-[#4a3424]">
                        <Clock size={14} className="text-[#b8924a] shrink-0" />
                        <span><strong>Heure :</strong> {card.rendezVousTime}</span>
                      </div>
                    )}
                  </div>

                  {card.rendezVousPlace && (
                    <div className="flex items-start gap-2 text-xs text-[#4a3424] pt-1">
                      <MapPin size={14} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span><strong>Lieu :</strong> {card.rendezVousPlace}</span>
                    </div>
                  )}

                  {card.dressCode && (
                    <div className="flex items-start gap-2 text-xs text-[#4a3424]">
                      <Shirt size={14} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span><strong>Dress code :</strong> {card.dressCode}</span>
                    </div>
                  )}

                  {/* BOUTON D'ACCEPTATION DU PARTENAIRE */}
                  <div className="pt-3 border-t border-[#b8924a]/20 text-center">
                    {partnerAccepted ? (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md animate-in zoom-in-75 duration-300">
                        <Check size={16} />
                        <span>J'ai accepté avec tout mon amour ❤️</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleAcceptCoupleInvitation}
                        disabled={isSubmittingResponse}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d62828] via-[#ba181b] to-[#a4161a] hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/20 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        <Heart size={15} className="fill-white" />
                        <span>{isSubmittingResponse ? "Envoi..." : "J'accepte avec amour ❤️"}</span>
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* SIGNATURE DE L'EXPÉDITEUR */}
              <div className="pt-4 border-t border-[#d4af37]/30 flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-widest text-gray-500">
                  Avec toute la tendresse de
                </span>
                <span className="font-serif text-xl text-[#1a0f07] font-semibold mt-0.5">
                  {card.senderName}
                </span>
              </div>

            </div>

          </div>

          {/* DISCRÈTE MENTION DE SCELLÉ D'ORIGINE */}
          <p className="text-center text-[10px] text-[#805e26] mt-4 uppercase tracking-[0.2em] font-medium">
            Création numérique scellée • Haute Papeterie Evenium
          </p>

        </div>
      )}

    </div>
  );
}

