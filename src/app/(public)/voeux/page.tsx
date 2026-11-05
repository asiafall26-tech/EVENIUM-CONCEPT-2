"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Heart,
  ShieldCheck,
  Check
} from "lucide-react";
import { 
  VOEUX_OCCASIONS, 
  VOEUX_INSPIRATIONS,
  type VoeuxOccasion 
} from "@/data/mock/voeux";
import { CardStudioModal } from "@/components/cartes/CardStudioModal";

export default function VoeuxPage() {
  const [selectedOccasion, setSelectedOccasion] = useState<VoeuxOccasion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenStudio = (occasion: VoeuxOccasion) => {
    setSelectedOccasion(occasion);
    setIsModalOpen(true);
  };

  const handleOpenGeneralStudio = () => {
    // Par défaut Anniversaire si aucun sélectionné
    setSelectedOccasion(VOEUX_OCCASIONS[0]);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] pb-24 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉPURÉ AVEC ANIMATION D'ÉCLOSION */}
      <section className="relative pt-14 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center bg-silk border-b border-[#e6d7c3] overflow-hidden">
        
        {/* Halo doré chaud en arrière-plan */}
        <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-gradient-to-b from-[#f5dfaa]/60 via-[#edd194]/25 to-transparent blur-[110px] pointer-events-none" />
        
        {/* Poussières d'étoiles dorées flottantes animées */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-8 left-[15%] text-amber-400 text-xs animate-gold-float opacity-70">✦</span>
          <span className="absolute top-16 right-[18%] text-[#c9a45e] text-sm animate-gold-float-slow opacity-80">✧</span>
          <span className="absolute bottom-10 left-[22%] text-[#d4af37] text-base animate-gold-float-slow opacity-60">✦</span>
          <span className="absolute top-1/2 right-[12%] text-amber-300 text-xs animate-gold-float opacity-75">✧</span>
          <span className="absolute bottom-6 right-[28%] text-[#c9a45e] text-sm animate-gold-float opacity-65">✦</span>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          
          {/* Badge élégant */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#c9a45e] text-[#8f6f33] text-[11px] font-bold uppercase tracking-[0.22em] shadow-2xs hover:scale-105 transition-transform duration-300">
            <Sparkles size={13} className="text-[#b8924a] animate-spin" style={{ animationDuration: "10s" }} />
            <span>Haute Papeterie Numérique • Evenium</span>
          </div>

          {/* Titre Exact Utilisateur */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1a0f07] leading-[1.12] tracking-tight">
            Envoyez un Vœu d'Exception, <br className="hidden sm:inline" />
            <span className="italic text-gold-foil">et faites éclore les émotions.</span>
          </h1>

          {/* Sous-titre Exact Utilisateur */}
          <p className="font-serif text-base sm:text-xl text-[#8f6f33] max-w-2xl mx-auto leading-relaxed pt-1">
            <span className="italic">Il y a les vœux qu'on lit, puis qu'on oublie. Et il y a ceux qui touchent l'âme, que l'on chérit et relit encore et encore.</span>{" "}
            <span className="font-semibold text-[#1a0f07] not-italic block sm:inline mt-1 sm:mt-0">Ici, vos vœux deviennent inoubliables.</span>
          </p>

          {/* Bouton Voir les modèles */}
          <div className="pt-4">
            <Link
              href="/create?category=Vœux"
              className="btn-lux px-8 py-3.5 text-xs sm:text-sm !tracking-[0.16em] cursor-pointer inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <span>Voir les modèles</span>
              <ArrowRight size={15} className="text-[#f0d999]" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. LES 5 OCCASIONS OFFICIELLES (ÉPURÉES & SANS FAUX MODÈLES) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8f6f33]">
            Choisissez votre moment précieux
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1a0f07]">
            Une attention sur-mesure pour chaque grand moment
          </h2>
        </div>

        {/* GRILLE DES 5 OCCASIONS RÉELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VOEUX_OCCASIONS.map((occ) => (
            <Link
              key={occ.id}
              href="/create?category=Vœux"
              className="group card-lux rounded-3xl p-6 sm:p-7 border border-[#e6d7c3] bg-white/95 shadow-sm hover:shadow-xl hover:border-[#b8924a] transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {occ.icon}
                </div>

                <div>
                  <h3 className="font-serif text-xl text-[#1a0f07] group-hover:text-[#8f6f33] transition-colors font-medium">
                    {occ.name}
                  </h3>
                  <p className="text-xs text-[#8f6f33] font-serif italic mt-0.5">
                    {occ.tagline}
                  </p>
                </div>

                <p className="text-xs text-[#665140] leading-relaxed">
                  {occ.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[#f0e6d6] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#8f6f33] font-bold">
                  Sceau de cire doré
                </span>
                <span className="text-xs font-bold text-[#1a0f07] group-hover:text-[#8f6f33] flex items-center gap-1">
                  <span>Voir les modèles</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </section>

      {/* 3. PASSERELLE VERS L'ÉCRIN DES AMOUREUX */}
      <section className="max-w-4xl mx-auto px-4 mt-16 sm:mt-20">
        <div className="rounded-3xl p-7 sm:p-10 bg-gradient-to-r from-[#20050b] via-[#330911] to-[#20050b] text-[#fbf7ee] border border-[#b8924a]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full bg-white/10 text-[#ffcad4] border border-[#d62828]/40">
              <Heart size={12} className="fill-red-400 text-red-400" />
              <span>Espace Dédié aux Couples</span>
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white">
              Découvrez nos Mots Doux & Invitations Couple
            </h3>
            <p className="text-xs text-[#d1a3ac] max-w-lg leading-relaxed">
              Pour ceux qui s'aiment : lettres d'amour numériques confidentielles, dîners secrets aux chandelles et rendez-vous en tête-à-tête.
            </p>
          </div>

          <Link
            href="/mots-doux"
            className="shrink-0 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explorer l'Espace Amoureux</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 4. LIEN DE SÉCURITÉ & RETROUVER MON LIEN */}
      <section className="max-w-md mx-auto px-4 mt-12 text-center">
        <div className="p-4 rounded-2xl bg-white border border-[#e6d7c3] space-y-1.5 shadow-xs">
          <p className="text-xs text-[#665140] flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-[#8f6f33]" />
            <span>Vous avez déjà commandé un Vœu ?</span>
          </p>
          <Link
            href="/cartes/retrouver"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8f6f33] hover:text-[#1a0f07] hover:underline"
          >
            <Search size={12} />
            <span>Retrouver mon lien avec mon email ou téléphone</span>
          </Link>
        </div>
      </section>

      {/* STUDIO DE CRÉATION & PERSONNALISATION */}
      {selectedOccasion && (
        <CardStudioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardConfig={{
            type: "voeu",
            templateId: `voeu-${selectedOccasion.id}`,
            occasionId: selectedOccasion.id,
            occasionName: selectedOccasion.name,
            templateTitle: `Vœu d'Exception • ${selectedOccasion.name}`,
            theme: "gold",
            waxSealColor: "gold",
            defaultSender: "Moi",
            defaultRecipient: "Un être cher",
            defaultKicker: `Pour célébrer votre ${selectedOccasion.name}`,
            defaultTitle: selectedOccasion.hook,
            defaultMessage: selectedOccasion.description,
            suggestedMusic: "Clair de Lune - Debussy",
            priceFcfa: 3900,
            priceEur: "3,90 €",
            inspirations: VOEUX_INSPIRATIONS.filter((i) => i.occasionId === selectedOccasion.id).map((i) => ({
              title: i.title,
              text: i.text,
            }))
          }}
        />
      )}

    </div>
  );
}
