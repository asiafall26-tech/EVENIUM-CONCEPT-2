"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Music, 
  Calendar, 
  Eye, 
  Search,
  CheckCircle2,
  Gift
} from "lucide-react";
import { 
  ROMANCE_SERVICES, 
  ROMANCE_TEMPLATES, 
  ROMANCE_INSPIRATIONS,
  type RomanceServiceType,
  type RomanceTemplate 
} from "@/data/mock/romance";
import { CardStudioModal } from "@/components/cartes/CardStudioModal";

export default function RomancePage() {
  const [selectedService, setSelectedService] = useState<RomanceServiceType | "all">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<RomanceTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTemplates = selectedService === "all"
    ? ROMANCE_TEMPLATES
    : ROMANCE_TEMPLATES.filter((t) => t.type === selectedService);

  const handleOpenStudio = (tmpl: RomanceTemplate) => {
    setSelectedTemplate(tmpl);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#120508] text-[#fbf7ee] min-h-screen selection:bg-[#d62828]/40 selection:text-white pb-24 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉLÉGANT & ROMANTIQUE */}
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center border-b border-[#3d121c] overflow-hidden">
        
        {/* Halo rouge rubis & or rose */}
        <div 
          aria-hidden 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] rounded-full bg-gradient-to-b from-[#d62828]/30 via-[#ba181b]/15 to-transparent blur-[130px] pointer-events-none" 
        />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f0d999] text-[11px] font-bold uppercase tracking-[0.22em] shadow-lg">
            <Heart size={13} className="text-[#e63946] fill-[#e63946] animate-pulse" />
            <span>L'Écrin Privé des Amoureux • Evenium</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight">
            Pour ceux qui s'aiment, <br className="hidden sm:inline" />
            <span className="italic bg-gradient-to-r from-[#ffcad4] via-[#f4a261] to-[#e76f51] bg-clip-text text-transparent">
              chaque jour est une déclaration.
            </span>
          </h1>

          <p className="font-serif text-base sm:text-xl text-[#e8c2ca] max-w-2xl mx-auto leading-relaxed pt-1">
            <span className="italic">Des mots doux scellés au cachet de cire et des invitations secrètes en tête-à-tête.</span>{" "}
            <span className="font-semibold text-white not-italic block sm:inline mt-1 sm:mt-0">
              Offrez l'inattendu à celui ou celle qui fait battre votre cœur.
            </span>
          </p>

        </div>
      </section>

      {/* 2. SÉLECTION DES DEUX SERVICES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          
          {/* SERVICE MOTS DOUX */}
          <button
            onClick={() => setSelectedService(selectedService === "mot_doux" ? "all" : "mot_doux")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedService === "mot_doux"
                ? "bg-gradient-to-br from-[#3b0b14] to-[#20050b] border-[#e63946] shadow-xl shadow-red-950/40"
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💌</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#d62828]/20 text-[#ffcad4] border border-[#d62828]/40">
                Romance Privée
              </span>
            </div>
            <h2 className="font-serif text-lg text-white font-medium">Les Mots Doux</h2>
            <p className="text-xs text-[#d1a3ac] mt-1 leading-relaxed">
              Lettres d'amour numériques confidentielles, tendresse, pardon & poésie du matin.
            </p>
          </button>

          {/* SERVICE INVITATIONS COUPLE */}
          <button
            onClick={() => setSelectedService(selectedService === "invitation_couple" ? "all" : "invitation_couple")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedService === "invitation_couple"
                ? "bg-gradient-to-br from-[#3b0b14] to-[#20050b] border-[#e63946] shadow-xl shadow-red-950/40"
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🕯️</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#d62828]/20 text-[#ffcad4] border border-[#d62828]/40">
                Tête-à-tête
              </span>
            </div>
            <h2 className="font-serif text-lg text-white font-medium">Invitations Couple</h2>
            <p className="text-xs text-[#d1a3ac] mt-1 leading-relaxed">
              Dîners secrets aux chandelles, escapades à deux & soirées intimes avec bouton réponse.
            </p>
          </button>

        </div>

        {/* 3. GRILLE DES MODÈLES D'EXCEPTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isCouple = template.type === "invitation_couple";

            return (
              <div
                key={template.id}
                className="group relative rounded-3xl bg-gradient-to-b from-[#1f090e] to-[#140407] border border-[#4a1823] hover:border-[#b8924a]/60 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* BANDEAU SUPÉRIEUR CARTE */}
                <div className="p-6 border-b border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37] flex items-center gap-1.5">
                      <span>{isCouple ? "🕯️" : "💌"}</span>
                      <span>{isCouple ? "Invitation Couple" : "Mot Doux"}</span>
                    </span>
                    {template.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#d62828]/20 text-[#ffcad4] border border-[#d62828]/30">
                        {template.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl text-white group-hover:text-[#f0d999] transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-[#b8929e] line-clamp-2">
                    {template.tagline}
                  </p>
                </div>

                {/* EXTRAIT POÉTIQUE */}
                <div className="p-6 bg-black/20 space-y-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-serif italic text-xs text-[#e8c2ca] leading-relaxed line-clamp-3">
                    "{template.defaultMessage}"
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#f0d999]">
                      <Music size={12} />
                      <span className="truncate max-w-[150px]">{template.suggestedMusic}</span>
                    </span>
                    <span className="font-serif text-sm font-bold text-white">
                      {template.priceFcfa.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* BOUTON D'ACTION */}
                <div className="p-5 border-t border-white/5 bg-black/30 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">
                    Sceau cire rubis
                  </span>

                  <button
                    onClick={() => handleOpenStudio(template)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-red-950/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Personnaliser & Offrir</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 4. LIEN DE SECOURS DE RÉCUPÉRATION */}
      <section className="max-w-xl mx-auto px-4 mt-16 text-center">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <p className="text-xs text-[#d1a3ac]">
            Vous avez déjà commandé une attention pour votre amoureux(se) ?
          </p>
          <Link
            href="/cartes/retrouver"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:underline"
          >
            <Search size={13} />
            <span>Retrouver mon lien avec mon email ou téléphone</span>
          </Link>
        </div>
      </section>

      {/* MODALE DE PERSONNALISATION ET PAIEMENT EXPRESS */}
      {selectedTemplate && (
        <CardStudioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardConfig={{
            type: selectedTemplate.type,
            templateId: selectedTemplate.id,
            occasionId: selectedTemplate.type === "invitation_couple" ? "diner_secret" : "lettre_amour",
            occasionName: selectedTemplate.type === "invitation_couple" ? "Invitation Couple" : "Mot Doux",
            templateTitle: selectedTemplate.title,
            theme: selectedTemplate.theme,
            waxSealColor: selectedTemplate.waxSealColor,
            defaultSender: selectedTemplate.defaultSender,
            defaultRecipient: selectedTemplate.defaultRecipient,
            defaultKicker: selectedTemplate.defaultKicker,
            defaultTitle: selectedTemplate.defaultTitle,
            defaultMessage: selectedTemplate.defaultMessage,
            suggestedMusic: selectedTemplate.suggestedMusic,
            defaultDate: selectedTemplate.defaultDate,
            defaultTime: selectedTemplate.defaultTime,
            defaultPlace: selectedTemplate.defaultPlace,
            defaultDressCode: selectedTemplate.defaultDressCode,
            priceFcfa: selectedTemplate.priceFcfa,
            priceEur: selectedTemplate.priceEur,
            inspirations: ROMANCE_INSPIRATIONS.filter((i) => i.type === selectedTemplate.type).map((i) => ({
              title: i.title,
              text: i.text,
            }))
          }}
        />
      )}

    </div>
  );
}
