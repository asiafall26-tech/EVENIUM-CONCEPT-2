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
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] pb-16 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉPURÉ, COURT ET IMPACTANT AVEC ANIMATIONS D'ÉCLOSION */}
      <section className="relative pt-12 sm:pt-18 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center bg-silk border-b border-[#e6d7c3] overflow-hidden">
        
        {/* Halo doré chaud et particules d'or flottantes */}
        <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-gradient-to-b from-[#f5dfaa]/60 via-[#edd194]/25 to-transparent blur-[110px] pointer-events-none" />
        
        {/* Poussières d'étoiles flottantes animées */}
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
          <p className="font-serif italic text-base sm:text-xl text-[#8f6f33] max-w-2xl mx-auto leading-relaxed pt-1">
            « Il y a les vœux qu'on lit, puis qu'on oublie. Et il y a ceux qui touchent l'âme, que l'on chérit et relit encore et encore. Ici, vos vœux deviennent inoubliables. »
          </p>

          <DiamondRule className="my-3 opacity-90" />

          {/* 3 Promesses précises et directes */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-1 text-xs font-semibold text-[#554131]">
            <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span><strong>0 formulaire</strong> ni RSVP</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
              <MessageCircle size={15} className="text-emerald-600" />
              <span>Partage <strong>WhatsApp &amp; Lien</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 transition-transform hover:scale-105">
              <Star size={15} className="text-[#c98f24] fill-[#c98f24]" />
              <span>Dès <strong>3,90 €</strong> à l'unité</span>
            </span>
          </div>

        </div>
      </section>

      {/* 2. SÉLECTEUR DE CATÉGORIES RAPIDE (1 CLIC) */}
      <section className="sticky top-0 z-30 bg-[#fbf7ee]/95 backdrop-blur-md py-3.5 px-4 sm:px-6 lg:px-8 border-b border-[#e6d7c3] shadow-2xs transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all duration-300 cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] shadow-md scale-102"
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
              className={`px-3.5 py-2 rounded-full text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all duration-300 cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] font-bold shadow-md scale-102"
                  : "bg-white text-[#554131] border-[#e6d7c3] hover:border-[#c9a45e] hover:bg-[#faf3e8]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name.split("&")[0].trim()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. LE SALON DES VŒUX : GRILLE VISUELLE, SIMPLE, DIRECTE AVEC MICRO-ANIMATIONS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex items-center justify-between mb-6 animate-in fade-in duration-500">
          <p className="text-xs uppercase font-bold tracking-widest text-[#8f6f33]">
            {filteredTemplates.length} {filteredTemplates.length > 1 ? "Modèles disponibles" : "Modèle disponible"}
          </p>
          <span className="text-xs text-[#735842] font-light hidden sm:inline">
            ✦ Cliquez sur un modèle pour composer votre lettre
          </span>
        </div>

        {/* Grille des Cartes : Photos 100% nettes, survol animé et bouton direct */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredTemplates.map((template, idx) => (
            <div
              key={template.id}
              onClick={() => setActiveModalTemplate(template)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="group relative rounded-3xl bg-white border border-[#e6d7c3] hover:border-[#c9a45e] transition-all duration-400 ease-out overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_22px_45px_-10px_rgba(90,60,25,0.22),0_0_20px_rgba(201,164,94,0.18)] animate-in fade-in"
            >
              {/* Photo de couverture nette, lumineuse, proportion portrait */}
              <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-stone-900">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-100"
                />

                {/* Voile d'ombrage léger bas pour le texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Sceau de cire médaillon animé au hover */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="w-8 h-8 rounded-full border border-amber-200/60 shadow-md flex items-center justify-center text-[10px] font-serif font-black text-amber-100 group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300"
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

                {/* Bouton d'action direct avec reflet shimmer */}
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
                    className="btn-shimmer px-4 py-2 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
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
      <footer className="max-w-4xl mx-auto px-4 mt-16 text-center space-y-3 text-xs text-[#735842] border-t border-[#e6d7c3] pt-8 animate-in fade-in duration-700">
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
