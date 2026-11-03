"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, Gift, Heart, Send, ArrowRight, CheckCircle, 
  Share2, Eye, ShieldCheck, Clock, Award, Music, 
  ChevronRight, Compass, MessageCircle, Star
} from "lucide-react";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";
import { 
  VOEUX_CATEGORIES, 
  VOEUX_TEMPLATES, 
  type VoeuxTemplate 
} from "@/data/mock/voeux";
import VoeuxCardModal from "@/components/voeux/VoeuxCardModal";
import WaxSeal from "@/components/voeux/WaxSeal";

export default function VoeuxPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalTemplate, setActiveModalTemplate] = useState<VoeuxTemplate | null>(null);

  // Carte héro interactive démo
  const [heroCardOpened, setHeroCardOpened] = useState(false);

  const filteredTemplates = selectedCategory === "all"
    ? VOEUX_TEMPLATES
    : VOEUX_TEMPLATES.filter((t) => t.categoryId === selectedCategory);

  const heroTemplate = VOEUX_TEMPLATES[0];

  return (
    <div className="bg-[#0c0704] text-[#fbf6ee] min-h-screen selection:bg-[#c9a45e]/30 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION LUXUEUSE & INTERACTIVE */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#c9a45e]/20 overflow-hidden">
        {/* Lueurs or et velours en arrière-plan */}
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-[#e9c478]/15 via-[#c9a45e]/5 to-transparent blur-[140px] pointer-events-none" />
        <div aria-hidden className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-[#8a1c14]/15 blur-[120px] pointer-events-none" />
        <div aria-hidden className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-[#1e3c72]/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Colonne gauche (7/12) : Titres & Philosophie */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#c9a45e]/40 text-[#f0d999] text-xs font-bold uppercase tracking-[0.22em] shadow-[0_0_20px_rgba(201,164,94,0.15)]">
                <Sparkles size={13} className="text-[#f0d999]" />
                <span>Haute Papeterie Virtuelle • Evenium</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#fef9f0] leading-[1.12] tracking-tight">
                L'Art d'Offrir des Vœux <span className="italic text-gold-foil block sm:inline">d'Exception</span>
              </h1>

              <p className="font-serif italic text-xl sm:text-2xl text-[#d4af37] leading-relaxed">
                « Faites plaisir à vos proches, même à distance ! »
              </p>

              <DiamondRule className="lg:justify-start my-4 opacity-80" />

              <p className="text-[#c4b5a5] text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                Evenium vous ouvre les portes de son salon privé de <strong>Vœux</strong> : une collection exclusive de faire-part et cartes d'art interactives, scellées au cachet de cire et brodées d'or pur, pour immortaliser chaque chapitre marquant de la vie.
              </p>

              {/* Boutons d'appel à l'action */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#salon-voeux"
                  className="btn-lux group px-8 py-3.5 text-xs sm:text-[13px] !tracking-[0.16em] cursor-pointer"
                >
                  <span>Explorer la collection</span>
                  <ArrowRight size={14} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalTemplate(heroTemplate)}
                  className="px-6 py-3.5 rounded-full text-xs font-semibold text-[#f0d999] bg-white/[0.05] hover:bg-white/10 transition-all border border-[#c9a45e]/40 hover:border-[#c9a45e] flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Gift size={14} />
                  <span>Personnaliser une carte</span>
                </button>
              </div>

              {/* 4 Badges de prestige */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left border-t border-white/10">
                <div className="space-y-1">
                  <span className="text-[#f0d999] font-serif text-lg font-bold block">12 Modèles</span>
                  <p className="text-[11px] text-[#a89b8d]">Finitions feuille d'or</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#f0d999] font-serif text-lg font-bold block">Sceau de Cire</span>
                  <p className="text-[11px] text-[#a89b8d]">Ouverture interactive</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#f0d999] font-serif text-lg font-bold block">1 Clic WhatsApp</span>
                  <p className="text-[11px] text-[#a89b8d]">Partage instantané</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#f0d999] font-serif text-lg font-bold block">100% Inclus</span>
                  <p className="text-[11px] text-[#a89b8d]">Zéro déchet papier</p>
                </div>
              </div>

            </div>

            {/* Colonne droite (5/12) : Pièce Maîtresse Interactive Démo en Direct */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[370px] aspect-[3/4.2]">
                
                {/* Socle lumineux d'orfèvrerie */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-[#c9a45e]/30 via-transparent to-[#c9a45e]/20 blur-xl pointer-events-none" />

                {/* Faire-part interactif flottant */}
                <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(201,164,94,0.3)] border-2 border-[#e6ca85]/70 bg-[#160c07] transition-all duration-700">
                  
                  {/* Photo d'ambiance avec flou au décachetage */}
                  <Image
                    src={heroTemplate.coverImage}
                    alt="Carte de vœux Evenium"
                    fill
                    className={`object-cover transition-all duration-1000 ${
                      heroCardOpened ? "scale-105 opacity-15 blur-[2px]" : "opacity-80 scale-100"
                    }`}
                  />

                  {/* Voile dégradé noir / or */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ${
                    heroCardOpened 
                      ? "bg-gradient-to-b from-[#1b1009]/95 via-[#140b06]/95 to-[#0b0503]/98" 
                      : "bg-gradient-to-t from-black/90 via-black/45 to-black/20"
                  }`} />

                  {/* Cadre ornemental LuxFrame */}
                  <LuxFrame className="inset-3.5 opacity-60" />

                  {/* État 1 : Enveloppe scellée au sceau de cire */}
                  {!heroCardOpened ? (
                    <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center z-10">
                      <div className="space-y-1 pt-2">
                        <Fleuron className="mx-auto w-24 h-auto opacity-70" />
                        <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#d9c08c]">
                          Collection Signature Evenium
                        </p>
                        <h4 className="font-serif text-2xl font-bold text-white tracking-wide">
                          Chère Maman
                        </h4>
                      </div>

                      {/* Sceau tactile cliquable */}
                      <div className="my-auto flex flex-col items-center">
                        <WaxSeal
                          color="#c98f24"
                          size="lg"
                          isBroken={false}
                          onBreak={() => setHeroCardOpened(true)}
                          label="Ouvrir"
                        />
                        <p className="text-[10px] text-[#f0d999] tracking-widest uppercase font-semibold mt-3 animate-pulse">
                          ✦ Touchez le sceau pour découvrir ✦
                        </p>
                      </div>

                      <div className="space-y-1 pb-1">
                        <p className="text-xs font-serif italic text-stone-300 line-clamp-1">
                          « Un océan de bonheur pour ton anniversaire... »
                        </p>
                        <DiamondRule className="my-1 opacity-60" />
                        <p className="text-[10px] text-[#d9c08c] font-medium tracking-wider">
                          De la part de <strong className="text-white">Alexandre</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* État 2 : Message dévoilé */
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-center z-10 animate-in zoom-in-95 duration-500">
                      <div className="space-y-1 pt-1">
                        <div className="w-9 h-9 mx-auto rounded-full bg-[#c9a45e]/20 border border-[#c9a45e]/50 text-[#f0d999] flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#d9c08c] font-bold">
                          Joyeux Anniversaire
                        </p>
                        <h4 className="font-serif text-xl font-bold text-white">
                          Chère Maman,
                        </h4>
                      </div>

                      <div className="my-auto py-2">
                        <p className="font-serif italic text-base leading-relaxed text-[#fbf3e4] whitespace-pre-line">
                          « Que cette journée t'apporte autant de joie, de douceur et d'éclat que tout l'amour que tu nous donnes chaque jour. »
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#c9a45e]/30 space-y-2">
                        <div>
                          <p className="text-[10px] text-stone-400 italic">Avec tout mon amour,</p>
                          <p className="font-serif text-lg font-bold text-[#f0d999]">Alexandre</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveModalTemplate(heroTemplate)}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-[11px] font-bold shadow-md cursor-pointer hover:brightness-105"
                          >
                            Personnaliser ce modèle
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroCardOpened(false)}
                            className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                          >
                            Refermer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. LES 6 MOMENTS IMPORTANTS DE LA VIE (SHOWCASE ÉTOILÉ) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={13} />
            <span>Chaque chapitre compte</span>
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#fef9f0]">
            Célébrez les 6 Grands <span className="italic text-gold-foil">Moments de la Vie</span>
          </h2>
          <DiamondRule className="mt-5 mb-5" />
          <p className="text-sm sm:text-base text-[#c4b5a5] font-light leading-relaxed">
            De la première lueur d'une naissance jusqu'au jubilé d'or, Evenium sublime chaque émotion humaine à travers une papeterie virtuelle sur-mesure.
          </p>
        </div>

        {/* Grille des 6 Moments de Vie */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {VOEUX_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const countInCat = VOEUX_TEMPLATES.filter((t) => t.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const el = document.getElementById("salon-voeux");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative p-7 rounded-[2rem] bg-gradient-to-b from-[#180e07] to-[#100703] border transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 ${
                  isSelected 
                    ? "border-[#e6ca85] shadow-[0_15px_40px_-10px_rgba(201,164,94,0.4)] ring-1 ring-[#c9a45e]" 
                    : "border-white/10 hover:border-[#c9a45e]/60 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8)]"
                }`}
              >
                {/* Lueur de coin */}
                <div 
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: cat.themeStyle.sealColor }}
                />

                <div>
                  {/* Badge & Icône */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${cat.themeStyle.badgeColor}`}>
                      {countInCat} {countInCat > 1 ? "Modèles" : "Modèle"}
                    </span>
                  </div>

                  {/* Titre & Tagline */}
                  <h3 className="font-serif text-2xl font-bold text-[#fef9f0] group-hover:text-[#f0d999] transition-colors mb-1.5">
                    {cat.name}
                  </h3>

                  <p className="text-xs font-semibold text-[#d4af37] mb-3">
                    {cat.tagline}
                  </p>

                  <p className="text-xs text-[#a89b8d] leading-relaxed mb-6 font-light">
                    {cat.description}
                  </p>
                </div>

                {/* Subcatégories & Action */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[#d9c08c]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-[#d9c08c] font-semibold group-hover:text-white transition-colors">
                    <span>Découvrir la collection</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. LE SALON DES VŒUX (CATALOGUE DE HAUTE PAPETERIE PORTRAIT) */}
      <section id="salon-voeux" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#c9a45e]/20 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Fleuron className="mx-auto w-36 sm:w-48 h-auto mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-2">
            Collection Exclusive
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#fef9f0]">
            Le Salon des <span className="italic text-gold-foil">Cartes d'Exception</span>
          </h2>
          <DiamondRule className="mt-5 mb-5" />
          <p className="text-sm sm:text-base text-[#c4b5a5] font-light leading-relaxed">
            Chaque création est une œuvre numérique unique, habillée de velours, de nacre et d'un sceau de cire frappé à la main.
          </p>
        </div>

        {/* Barre de filtres de luxe */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 border-[#f0d999] shadow-[0_0_20px_rgba(201,164,94,0.4)]"
                : "bg-white/[0.04] text-[#c4b5a5] border-white/10 hover:border-[#c9a45e]/50 hover:text-white"
            }`}
          >
            ✦ Toutes les créations ({VOEUX_TEMPLATES.length})
          </button>

          {VOEUX_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 border-[#f0d999] font-bold shadow-[0_0_20px_rgba(201,164,94,0.4)]"
                  : "bg-white/[0.04] text-[#c4b5a5] border-white/10 hover:border-[#c9a45e]/50 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* GRILLE DES CARTES DE VŒUX (RATIO PORTRAIT LUXE 3:4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setActiveModalTemplate(template)}
              className="group relative rounded-[2rem] bg-gradient-to-b from-[#180e07] to-[#100703] border border-white/10 hover:border-[#c9a45e] transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(201,164,94,0.25)]"
            >
              {/* Image de couverture en proportion portrait faire-part */}
              <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-stone-950">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />

                {/* Voile sombre pour le texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#100703] via-black/40 to-black/20" />

                {/* Sceau de cire timbre en filigrane */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="w-8 h-8 rounded-full border border-amber-200/50 shadow-md flex items-center justify-center text-[10px] font-serif font-black text-amber-100"
                    style={{ backgroundColor: template.waxSealColor }}
                  >
                    ★
                  </span>
                </div>

                {/* Badge de prestige */}
                {template.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-[#f0d999] border border-[#c9a45e]/50 backdrop-blur-md">
                    {template.badge}
                  </span>
                )}

                {/* Catégorie sur image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#fef9f0] drop-shadow-md">
                    {template.subCategory}
                  </span>
                  <span className="text-[10px] text-[#f0d999] tracking-wider uppercase font-semibold">
                    {template.categoryName}
                  </span>
                </div>
              </div>

              {/* Corps de la carte avec typographie & citations */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#fef9f0] group-hover:text-[#f0d999] transition-colors leading-snug">
                    {template.title}
                  </h4>
                  
                  <p className="text-xs text-[#c4b5a5] italic mt-2 line-clamp-2 leading-relaxed font-light">
                    « {template.quotePreview} »
                  </p>
                </div>

                {/* Détails & Bouton Découvrir */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#a89b8d] truncate max-w-[140px] flex items-center gap-1">
                    <Music size={11} className="text-[#d4af37]" />
                    {template.suggestedMusic.split("(")[0]}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalTemplate(template);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Eye size={13} />
                    <span>Ouvrir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. L'ÉCRIN VIRTUEL EVENIUM (SAVOIR-FAIRE & MAGIE DIGITALE) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#140b06] to-[#0c0704] border-t border-[#c9a45e]/20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-2">
              Le Savoir-Faire Evenium
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#fef9f0]">
              L'Excellence du Papier, la <span className="italic text-gold-foil">Magie du Digital</span>
            </h2>
            <DiamondRule className="mt-5 mb-5" />
            <p className="text-sm sm:text-base text-[#c4b5a5] font-light">
              Pourquoi choisir une carte de vœux Evenium plutôt qu'un message ordinaire ?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-7 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#c9a45e]/50 transition-all space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-[#c9a45e]/20 border border-[#c9a45e]/40 text-[#f0d999] flex items-center justify-center text-xl">
                ✦
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Le Cachet de Cire</h4>
              <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
                Une gestuelle tactile et poétique où le destinataire brise virtuellement le sceau pour révéler vos mots avec un éclat d'étoiles.
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#c9a45e]/50 transition-all space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-[#c9a45e]/20 border border-[#c9a45e]/40 text-[#f0d999] flex items-center justify-center text-xl">
                🎼
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Partitions Délicates</h4>
              <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
                Chaque modèle est accordé à une composition musicale apaisante (piano, harpe, cordes ou jazz lounge) qui réchauffe le cœur.
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#c9a45e]/50 transition-all space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-[#c9a45e]/20 border border-[#c9a45e]/40 text-[#f0d999] flex items-center justify-center text-xl">
                💬
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">WhatsApp en 1 Clic</h4>
              <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
                Partagez directement par message ou lien sécurisé. Votre proche ouvre son faire-part instantanément, sans aucune application à installer.
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#c9a45e]/50 transition-all space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-[#c9a45e]/20 border border-[#c9a45e]/40 text-[#f0d999] flex items-center justify-center text-xl">
                🌿
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Éco-Responsable</h4>
              <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
                Toute l'élégance du carton toilé et de la dorure à chaud, sans aucun arbre abattu ni délai postal. L'émotion immédiate et durable.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. COMMENT ÇA FONCTIONNE (3 GESTES NOBLES) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37] mb-2">
          Simplicité &amp; Raffinement
        </p>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#fef9f0] mb-4">
          Offrir des Vœux en <span className="italic text-gold-foil">3 Gestes Simples</span>
        </h2>
        <DiamondRule className="mb-14" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2.2rem] bg-white/[0.03] border border-white/10 relative space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#c9a45e] text-stone-950 flex items-center justify-center mx-auto text-lg font-serif font-bold shadow-[0_0_15px_rgba(201,164,94,0.5)]">
              1
            </span>
            <h4 className="font-serif text-xl text-[#fef9f0]">Choisissez votre modèle</h4>
            <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
              Sélectionnez l'œuvre adaptée à votre occasion : anniversaire, mariage, naissance, diplôme ou mot de gratitude.
            </p>
          </div>

          <div className="p-8 rounded-[2.2rem] bg-white/[0.03] border border-white/10 relative space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#c9a45e] text-stone-950 flex items-center justify-center mx-auto text-lg font-serif font-bold shadow-[0_0_15px_rgba(201,164,94,0.5)]">
              2
            </span>
            <h4 className="font-serif text-xl text-[#fef9f0]">Personnalisez l'émotion</h4>
            <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
              Indiquez le nom de votre proche, piochez dans nos suggestions poétiques ou écrivez librement vos sentiments.
            </p>
          </div>

          <div className="p-8 rounded-[2.2rem] bg-white/[0.03] border border-white/10 relative space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#c9a45e] text-stone-950 flex items-center justify-center mx-auto text-lg font-serif font-bold shadow-[0_0_15px_rgba(201,164,94,0.5)]">
              3
            </span>
            <h4 className="font-serif text-xl text-[#fef9f0]">Partagez le secret</h4>
            <p className="text-xs text-[#a89b8d] leading-relaxed font-light">
              Transmettez le lien ou le message WhatsApp. Votre destinataire brise le cachet et conserve ce souvenir à jamais.
            </p>
          </div>
        </div>
      </section>

      {/* 6. GRAND CTA FINAL */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] p-8 sm:p-16 text-center overflow-hidden border border-[#c9a45e]/50 bg-gradient-to-b from-[#1c1008] via-[#140a04] to-[#0c0602] shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
          <LuxFrame className="inset-4 sm:inset-6 opacity-40" />
          <Fleuron className="mx-auto w-36 sm:w-48 h-auto mb-4" />

          <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#fef9f0] mb-4">
            Une pensée chaleureuse à <span className="italic text-gold-foil">transmettre</span> ?
          </h3>

          <p className="text-xs sm:text-sm text-[#c4b5a5] max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Ne laissez pas filer les moments précieux du quotidien. Surprenez vos proches dès aujourd'hui avec un faire-part inoubliable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              type="button"
              onClick={() => setActiveModalTemplate(VOEUX_TEMPLATES[0])}
              className="btn-lux px-8 py-4 text-xs sm:text-[13px] !tracking-[0.16em] cursor-pointer"
            >
              <span>Créer ma première carte de vœux</span>
              <Gift size={16} className="text-[#f0d999]" />
            </button>

            <Link
              href="/"
              className="px-6 py-3.5 rounded-full text-xs font-semibold text-[#c4b5a5] hover:text-white hover:bg-white/10 transition-colors border border-white/15"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      {/* MODALE DU SALON DE HAUTE PAPETERIE */}
      <VoeuxCardModal
        template={activeModalTemplate}
        onClose={() => setActiveModalTemplate(null)}
      />

    </div>
  );
}
