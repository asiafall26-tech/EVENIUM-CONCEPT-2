"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Music, 
  Search, 
  Heart,
  Crown,
  Gift
} from "lucide-react";
import { 
  VOEUX_OCCASIONS, 
  VOEUX_TEMPLATES, 
  VOEUX_INSPIRATIONS,
  type VoeuxTemplate 
} from "@/data/mock/voeux";
import { CardStudioModal } from "@/components/cartes/CardStudioModal";

export default function VoeuxPage() {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<VoeuxTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTemplates = selectedOccasion === "all"
    ? VOEUX_TEMPLATES
    : VOEUX_TEMPLATES.filter((t) => t.occasionId === selectedOccasion);

  const handleOpenStudio = (tmpl: VoeuxTemplate) => {
    setSelectedTemplate(tmpl);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] pb-24 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉPURÉ AVEC ANIMATION D'ÉCLOSION */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center bg-silk border-b border-[#e6d7c3] overflow-hidden">
        
        {/* Halo doré chaud en arrière-plan */}
        <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-gradient-to-b from-[#f5dfaa]/60 via-[#edd194]/25 to-transparent blur-[110px] pointer-events-none" />
        
        {/* Poussières d'étoiles dorées flottantes animées */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-8 left-[15%] text-amber-400 text-xs animate-pulse opacity-70">✦</span>
          <span className="absolute top-16 right-[18%] text-[#c9a45e] text-sm animate-pulse opacity-80">✧</span>
          <span className="absolute bottom-10 left-[22%] text-[#d4af37] text-base animate-pulse opacity-60">✦</span>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          
          {/* Badge élégant */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#c9a45e] text-[#8f6f33] text-[11px] font-bold uppercase tracking-[0.22em] shadow-2xs hover:scale-105 transition-transform duration-300">
            <Sparkles size={13} className="text-[#b8924a]" />
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

        </div>
      </section>

      {/* 2. FILTRE PAR OCCASIONS (LES 5 OCCASIONS OFFICIELLES) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10">
          <button
            onClick={() => setSelectedOccasion("all")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedOccasion === "all"
                ? "bg-[#1a0f07] text-[#d4af37] shadow-md"
                : "bg-white border border-[#e6d7c3] text-[#665140] hover:text-[#1a0f07] hover:border-[#b8924a]"
            }`}
          >
            ✦ Toutes les occasions
          </button>

          {VOEUX_OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setSelectedOccasion(occ.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedOccasion === occ.id
                  ? "bg-[#1a0f07] text-[#d4af37] shadow-md"
                  : "bg-white border border-[#e6d7c3] text-[#665140] hover:text-[#1a0f07] hover:border-[#b8924a]"
              }`}
            >
              <span>{occ.icon}</span>
              <span>{occ.name}</span>
            </button>
          ))}
        </div>

        {/* 3. GRILLE DES MODÈLES DE VŒUX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card-lux rounded-3xl p-6 border border-[#e6d7c3] bg-white/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33] px-2.5 py-0.5 rounded-full bg-[#faf0dc] border border-[#d9c08c]">
                    {template.occasionName}
                  </span>
                  {template.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1a0f07] text-[#d4af37]">
                      {template.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-xl text-[#1a0f07] font-medium">
                    {template.title}
                  </h3>
                  <p className="text-xs text-[#8f6f33] font-serif italic mt-0.5">
                    {template.defaultKicker}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#edd194]/40 font-serif italic text-xs text-[#4a3424] leading-relaxed line-clamp-3">
                  "{template.defaultMessage}"
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#8f6f33]">
                    <Music size={12} />
                    <span className="truncate max-w-[140px]">{template.suggestedMusic}</span>
                  </span>
                  <span className="font-serif text-sm font-bold text-[#1a0f07]">
                    {template.priceFcfa.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* ACTION */}
              <div className="pt-5 mt-5 border-t border-[#e6d7c3] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  Cachet de cire doré
                </span>

                <button
                  onClick={() => handleOpenStudio(template)}
                  className="btn-lux px-4 py-2.5 text-xs !tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span>Personnaliser</span>
                  <ArrowRight size={13} className="text-[#f0d999]" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 4. PASSERELLE VERS L'ÉCRIN DES AMOUREUX */}
      <section className="max-w-4xl mx-auto px-4 mt-16">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#20050b] via-[#330911] to-[#20050b] text-[#fbf7ee] border border-[#b8924a]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full bg-white/10 text-[#ffcad4] border border-[#d62828]/40">
              <Heart size={12} className="fill-red-400 text-red-400" />
              <span>Nouveau Service Amoureux</span>
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white">
              Découvrez nos Mots Doux & Invitations Couple
            </h3>
            <p className="text-xs text-[#d1a3ac] max-w-lg">
              Lettres d'amour numériques confidentielles, dîners secrets aux chandelles et escapades romantiques en tête-à-tête.
            </p>
          </div>

          <Link
            href="/mots-doux"
            className="shrink-0 px-6 py-3 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-red-950/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explorer l'Espace Amoureux</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 5. LIEN RETROUVER MON LIEN */}
      <section className="max-w-md mx-auto px-4 mt-10 text-center">
        <div className="p-4 rounded-2xl bg-white border border-[#e6d7c3] space-y-1">
          <p className="text-xs text-[#665140]">
            Vous avez déjà envoyé un Vœu d'Exception ?
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

      {/* MODALE DE PERSONNALISATION EXPRESS */}
      {selectedTemplate && (
        <CardStudioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardConfig={{
            type: "voeu",
            templateId: selectedTemplate.id,
            occasionId: selectedTemplate.occasionId,
            occasionName: selectedTemplate.occasionName,
            templateTitle: selectedTemplate.title,
            theme: selectedTemplate.theme,
            waxSealColor: selectedTemplate.waxSealColor,
            defaultSender: "Moi",
            defaultRecipient: "Un être cher",
            defaultKicker: selectedTemplate.defaultKicker,
            defaultTitle: selectedTemplate.defaultTitle,
            defaultMessage: selectedTemplate.defaultMessage,
            suggestedMusic: selectedTemplate.suggestedMusic,
            priceFcfa: templatePriceFcfa(selectedTemplate),
            priceEur: selectedTemplate.priceEur,
            inspirations: VOEUX_INSPIRATIONS.filter((i) => i.occasionId === selectedTemplate.occasionId).map((i) => ({
              title: i.title,
              text: i.text,
            }))
          }}
        />
      )}

    </div>
  );
}

function templatePriceFcfa(tmpl: VoeuxTemplate): number {
  return tmpl.priceFcfa || 3900;
}
