"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, Gift, Heart, Send, ArrowRight, CheckCircle2, 
  Eye, Music, MessageCircle, Star, Smartphone, ShieldCheck
} from "lucide-react";
import { Fleuron, DiamondRule } from "@/components/landing/LuxOrnaments";
import { 
  VOEUX_CATEGORIES, 
  VOEUX_TEMPLATES, 
  type VoeuxTemplate 
} from "@/data/mock/voeux";
import VoeuxCardModal from "@/components/voeux/VoeuxCardModal";

export default function VoeuxPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalTemplate, setActiveModalTemplate] = useState<VoeuxTemplate | null>(null);

  const filteredTemplates = selectedCategory === "all"
    ? VOEUX_TEMPLATES
    : VOEUX_TEMPLATES.filter((t) => t.categoryId === selectedCategory);

  return (
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] pb-16">
      
      {/* 1. EN-TÊTE ÉPURÉ, COURT ET IMPACTANT */}
      <section className="relative pt-10 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center bg-silk border-b border-[#e6d7c3]">
        <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-b from-[#f5dfaa]/50 to-transparent blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#c9a45e] text-[#8f6f33] text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xs">
            <Sparkles size={13} className="text-[#b8924a]" />
            <span>Haute Papeterie Numérique • Prêt à offrir</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1a0f07] leading-tight tracking-tight">
            Envoyez un Vœu d'Exception, <br />
            <span className="italic text-gold-foil">scellé au cachet de cire</span>
          </h1>

          <p className="font-serif italic text-base sm:text-xl text-[#8f6f33] max-w-2xl mx-auto">
            « Bien plus qu'un SMS : une lettre d'art avec musique douce que votre proche brise du doigt. »
          </p>

          <DiamondRule className="my-3 opacity-80" />

          {/* 3 Promesses précises et directes */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-1 text-xs font-semibold text-[#554131]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span><strong>0 formulaire</strong> ni RSVP</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={15} className="text-emerald-600" />
              <span>Partage <strong>WhatsApp &amp; Lien</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star size={15} className="text-[#c98f24] fill-[#c98f24]" />
              <span>Dès <strong>3,90 €</strong> à l'unité</span>
            </span>
          </div>

        </div>
      </section>

      {/* 2. SÉLECTEUR DE CATÉGORIES RAPIDE (1 CLIC) */}
      <section className="sticky top-0 z-30 bg-[#fbf7ee]/95 backdrop-blur-md py-4 px-4 sm:px-6 lg:px-8 border-b border-[#e6d7c3] shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] shadow-xs"
                : "bg-white text-[#554131] border-[#e6d7c3] hover:border-[#c9a45e] hover:bg-[#faf3e8]"
            }`}
          >
            ✦ Toute la collection ({VOEUX_TEMPLATES.length})
          </button>

          {VOEUX_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] font-bold shadow-xs"
                  : "bg-white text-[#554131] border-[#e6d7c3] hover:border-[#c9a45e] hover:bg-[#faf3e8]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name.split("&")[0].trim()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. LE SALON DES VŒUX : GRILLE VISUELLE, SIMPLE, DIRECTE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase font-bold tracking-widest text-[#8f6f33]">
            {filteredTemplates.length} {filteredTemplates.length > 1 ? "Modèles disponibles" : "Modèle disponible"}
          </p>
          <span className="text-xs text-[#735842] font-light">
            Cliquez sur un modèle pour le personnaliser
          </span>
        </div>

        {/* Grille des Cartes (Photos 100% visibles, nettes, avec bouton direct) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setActiveModalTemplate(template)}
              className="group relative rounded-3xl bg-white border border-[#e6d7c3] hover:border-[#c9a45e] transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-10px_rgba(90,60,25,0.18)]"
            >
              {/* Photo de couverture nette, lumineuse, proportion portrait */}
              <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-stone-900">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-100"
                />

                {/* Voile d'ombrage léger bas pour le texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Sceau de cire médaillon */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="w-8 h-8 rounded-full border border-amber-200/60 shadow-md flex items-center justify-center text-[10px] font-serif font-black text-amber-100"
                    style={{ backgroundColor: template.waxSealColor }}
                  >
                    ★
                  </span>
                </div>

                {/* Badge prix */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-[#f0d999] border border-[#c9a45e]/60 backdrop-blur-xs">
                  {template.price}
                </span>

                {/* Catégorie */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-white drop-shadow-md">
                    {template.subCategory}
                  </span>
                  <span className="text-[10px] text-[#f0d999] tracking-wider uppercase font-semibold">
                    {template.categoryName.split("&")[0]}
                  </span>
                </div>
              </div>

              {/* Titre, citation et action directe */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1a0f07] group-hover:text-[#8f6f33] transition-colors leading-snug">
                    {template.title}
                  </h3>
                  
                  <p className="text-xs text-[#665140] italic mt-1.5 line-clamp-2 leading-relaxed font-light">
                    « {template.quotePreview} »
                  </p>
                </div>

                {/* Bouton d'action direct */}
                <div className="pt-2 border-t border-[#f0e4d4] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#8a725e] truncate max-w-[120px] flex items-center gap-1 font-light">
                    <Music size={11} className="text-[#8f6f33]" />
                    {template.suggestedMusic.split("(")[0]}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalTemplate(template);
                    }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Gift size={13} />
                    <span>Offrir ({template.price})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. PIED DE PAGE DISCRET & RÉASSURANCES */}
      <footer className="max-w-4xl mx-auto px-4 mt-16 text-center space-y-3 text-xs text-[#735842] border-t border-[#e6d7c3] pt-8">
        <p className="flex items-center justify-center gap-2 font-medium">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Achat unique • Valable à vie • Partageable à l'infini partout sur WhatsApp, SMS ou lien</span>
        </p>
        <p className="text-[11px] text-[#8a725e]">
          Votre destinataire n'a aucune application à installer et aucun formulaire à remplir.
        </p>
      </footer>

      {/* MODALE DU SALON DE HAUTE PAPETERIE */}
      <VoeuxCardModal
        template={activeModalTemplate}
        onClose={() => setActiveModalTemplate(null)}
      />

    </div>
  );
}
