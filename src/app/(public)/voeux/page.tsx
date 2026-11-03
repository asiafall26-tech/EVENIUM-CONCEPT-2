"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, Gift, Heart, Send, ArrowRight, CheckCircle2, 
  Share2, Eye, ShieldCheck, Clock, Award, Music, 
  ChevronRight, MessageCircle, Star, Check, Zap, Smartphone,
  Smile, Lock
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
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] overflow-hidden">
      
      {/* 1. HERO SECTION : SALON D'OR & DE SOIE AVEC ARRIÈRE-PLAN LUMINEUX ET CHAUD */}
      <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#e6d7c3] overflow-hidden bg-silk">
        
        {/* Lueurs or et champagne visibles en arrière-plan */}
        <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-gradient-to-b from-[#f5dfaa]/60 via-[#ecd39a]/30 to-transparent blur-[120px] pointer-events-none" />
        <div aria-hidden className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#e8a598]/30 blur-[100px] pointer-events-none" />
        <div aria-hidden className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-[#f3dea5]/40 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Colonne gauche (7/12) : Textes percutants & émotionnels qui donnent envie d'acheter */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#c9a45e] text-[#8f6f33] text-xs font-bold uppercase tracking-[0.22em] shadow-sm">
                <Sparkles size={14} className="text-[#b8924a]" />
                <span>Haute Papeterie Numérique • Nouveauté Evenium</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1a0f07] leading-[1.12] tracking-tight">
                Un simple SMS s'efface. <br />
                <span className="italic text-gold-foil">Offrez une émotion qui reste.</span>
              </h1>

              <p className="font-serif italic text-lg sm:text-2xl text-[#8f6f33] leading-relaxed">
                « Parce qu'un être cher mérite infiniment plus qu'un message ordinaire tapé à la va-vite. »
              </p>

              <DiamondRule className="lg:justify-start my-4 opacity-90" />

              <p className="text-[#554131] text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                Surprenez vos proches avec un véritable <strong>trésor d'émotion</strong> : une lettre d'art scellée au cachet de cire, qui s'ouvre au son d'un carillon céleste et d'une douce mélodie. Un cadeau digital prestigieux, <strong>partageable partout sans limite</strong> et sans aucun formulaire contraignant.
              </p>

              {/* Arguments clés d'achat & de liberté */}
              <div className="p-4 rounded-2xl bg-white/70 border border-[#e4d3bc] shadow-xs space-y-2 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#24170d]">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Zéro RSVP, zéro tracking :</strong> votre destinataire ouvre, s'émerveille et savoure directement.</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#24170d]">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Partageable partout :</strong> par WhatsApp, SMS, Email ou lien privé à n'importe qui.</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#24170d]">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Prêt en 2 minutes :</strong> choisissez votre modèle, personnalisez les mots et offrez immédiatement.</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#salon-voeux"
                  className="btn-lux group px-8 py-4 text-xs sm:text-[13px] !tracking-[0.16em] cursor-pointer shadow-lg"
                >
                  <span>Choisir un modèle à offrir</span>
                  <ArrowRight size={15} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalTemplate(heroTemplate)}
                  className="btn-lux-light px-7 py-4 text-xs sm:text-[13px] !tracking-[0.14em] cursor-pointer hover:bg-white transition-all shadow-sm"
                >
                  <Gift size={15} className="text-[#8f6f33]" />
                  <span>Tester ce modèle</span>
                </button>
              </div>

              {/* Badges de confiance */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#735842] font-medium">
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-[#c98f24] fill-[#c98f24]" /> À partir de 3,90 € à l'unité
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#8f6f33]" /> 100% Mobile &amp; WhatsApp
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Valable à vie
                </span>
              </div>

            </div>

            {/* Colonne droite (5/12) : Pièce Maîtresse Interactive Démo — Arrière-plan VISIBLE et éclatant */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[380px] aspect-[3/4.2]">
                
                {/* Halo chaud d'orfèvrerie */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-[#e9c478]/40 via-[#f0d999]/30 to-[#c9a45e]/20 blur-xl pointer-events-none" />

                {/* Faire-part interactif flottant avec image VIVANTE et VISIBLE */}
                <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(60,38,18,0.35),0_0_35px_rgba(201,164,94,0.3)] border-2 border-[#d4af37] bg-white transition-all duration-700">
                  
                  {/* Photo de couverture VIVANTE et LUMINEUSE */}
                  <Image
                    src={heroTemplate.coverImage}
                    alt="Carte de vœux Evenium"
                    fill
                    className="object-cover scale-100 opacity-95 transition-transform duration-700"
                    priority
                  />

                  {/* Voile dégradé léger pour contraster le texte sans assombrir la photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Cadre ornemental LuxFrame */}
                  <LuxFrame className="inset-3.5 opacity-80" />

                  {/* Badge prix & statut */}
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-[#f0d999] border border-[#c9a45e]/60 shadow-sm backdrop-blur-xs">
                    {heroTemplate.price} • Prêt à offrir
                  </span>

                  {/* État 1 : Enveloppe cachetée */}
                  {!heroCardOpened ? (
                    <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center z-10">
                      
                      <div className="space-y-1 pt-6">
                        <Fleuron className="mx-auto w-24 h-auto opacity-80" />
                        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#f0d999] drop-shadow-sm">
                          Haute Papeterie Evenium
                        </p>
                        <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
                        <p className="text-[11px] text-[#fbf3e4] tracking-wider uppercase font-bold mt-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] animate-pulse">
                          ✦ Touchez le sceau pour découvrir ✦
                        </p>
                      </div>

                      <div className="space-y-1 pb-1">
                        <p className="text-xs font-serif italic text-white drop-shadow-md line-clamp-1">
                          « {heroTemplate.quotePreview.slice(0, 50)}... »
                        </p>
                        <DiamondRule className="my-1 opacity-80" />
                        <p className="text-[11px] text-[#f0d999] font-medium tracking-wider drop-shadow-md">
                          Offert avec amour par <strong className="text-white">Alexandre</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* État 2 : Message dévoilé — La lettre flotte sur la photo visible */
                    <div className="absolute inset-2.5 sm:inset-3 rounded-2xl bg-[#180e07]/90 backdrop-blur-md border border-[#c9a45e]/70 p-5 flex flex-col justify-between text-center z-20 animate-in zoom-in-95 duration-400 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                      
                      <div className="space-y-1">
                        <div className="w-9 h-9 mx-auto rounded-full bg-[#c9a45e]/25 border border-[#c9a45e]/60 text-[#f0d999] flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-[#d4af37] font-bold">
                          Joyeux Anniversaire
                        </p>
                        <h4 className="font-serif text-xl font-bold text-white">
                          Chère Maman,
                        </h4>
                      </div>

                      <div className="my-auto py-2 overflow-y-auto max-h-[170px]">
                        <p className="font-serif italic text-sm sm:text-base leading-relaxed text-[#fbf3e4] whitespace-pre-line drop-shadow-sm">
                          « Que chaque seconde de cette nouvelle année te rappelle combien ta lumière est précieuse pour nous tous. Très bel anniversaire ! »
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#c9a45e]/30 space-y-2">
                        <div>
                          <p className="text-[10px] text-stone-300 italic">Du fond du cœur,</p>
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
                            className="text-[10px] text-stone-300 hover:text-white underline cursor-pointer"
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

      {/* 2. LES 6 MOMENTS DE LA VIE : TEXTES PROFONDÉMENT ÉVOCATEURS */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8f6f33] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[#b8924a]" />
            <span>À chaque émotion son écrin</span>
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1a0f07]">
            À qui voulez-vous faire <span className="italic text-gold-foil">plaisir aujourd'hui ?</span>
          </h2>
          <DiamondRule className="mt-5 mb-5" />
          <p className="text-sm sm:text-base text-[#554131] font-light leading-relaxed">
            Parents, âme sœur, amis de toujours, nouveau-né ou collègue inspirant : découvrez nos collections d'art conçues pour toucher droit au cœur.
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
                className={`group relative p-7 rounded-[2rem] bg-white border transition-all duration-400 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 ${
                  isSelected 
                    ? "border-[#c9a45e] shadow-[0_20px_45px_-10px_rgba(201,164,94,0.35)] ring-2 ring-[#c9a45e]/50" 
                    : "border-[#e6d7c3] hover:border-[#c9a45e] hover:shadow-[0_20px_40px_-10px_rgba(90,60,25,0.15)]"
                }`}
              >
                {/* Lueur subtile de catégorie */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: cat.themeStyle.sealColor }}
                />

                <div>
                  {/* Badge & Icône */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-14 h-14 rounded-2xl bg-[#faf3e8] border border-[#e6d7c3] flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${cat.themeStyle.badgeColor}`}>
                      {countInCat} {countInCat > 1 ? "Modèles" : "Modèle"}
                    </span>
                  </div>

                  {/* Titre & Hook */}
                  <h3 className="font-serif text-2xl font-bold text-[#1a0f07] group-hover:text-[#8f6f33] transition-colors mb-1.5">
                    {cat.name}
                  </h3>

                  <p className="text-xs font-semibold text-[#8f6f33] mb-3">
                    {cat.hook}
                  </p>

                  <p className="text-xs text-[#665140] leading-relaxed mb-6 font-light">
                    {cat.description}
                  </p>
                </div>

                {/* Subcatégories & Action */}
                <div className="pt-4 border-t border-[#f0e4d4] space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-[#faf5ed] border border-[#e8dac8] text-[#554131]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-[#8f6f33] font-bold group-hover:text-[#1a0f07] transition-colors">
                    <span>Explorer ces vœux ({countInCat})</span>
                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. LE SALON DES VŒUX : CARTES PORTRAIT AVEC COUVERTURE NETTE & VISIBLE */}
      <section id="salon-voeux" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e6d7c3] relative bg-[#fdfaf4]">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Fleuron className="mx-auto w-36 sm:w-48 h-auto mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8f6f33] mb-2">
            Collection Disponible Immédiatement
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1a0f07]">
            Le Salon de <span className="italic text-gold-foil">Haute Papeterie</span>
          </h2>
          <DiamondRule className="mt-5 mb-5" />
          <p className="text-sm sm:text-base text-[#554131] font-light leading-relaxed">
            Chaque modèle est une œuvre prête à être personnalisée en 2 minutes et partagée instantanément sur WhatsApp, SMS ou lien privé.
          </p>
        </div>

        {/* Barre de filtres stylée */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] shadow-md"
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
              className={`px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-[#24170d] text-[#f0d999] border-[#c9a45e] font-bold shadow-md"
                  : "bg-white text-[#554131] border-[#e6d7c3] hover:border-[#c9a45e] hover:bg-[#faf3e8]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* GRILLE DES CARTES : LES IMAGES SONT 100% VISIBLES, ÉCLATANTES ET NETTES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setActiveModalTemplate(template)}
              className="group relative rounded-[2rem] bg-white border border-[#e6d7c3] hover:border-[#c9a45e] transition-all duration-400 overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(90,60,25,0.2)]"
            >
              {/* Image de couverture en proportion portrait : NETTE ET VISIBLE SANS VOILE ÉTOUFFANT */}
              <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-stone-900">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-100"
                />

                {/* Voile d'ombrage léger bas pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Sceau de cire médaillon en haut à droite */}
                <div className="absolute top-3 right-3 z-10">
                  <span 
                    className="w-8 h-8 rounded-full border border-amber-200/60 shadow-md flex items-center justify-center text-[10px] font-serif font-black text-amber-100"
                    style={{ backgroundColor: template.waxSealColor }}
                  >
                    ★
                  </span>
                </div>

                {/* Badge prix & statut */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/75 text-[#f0d999] border border-[#c9a45e]/60 backdrop-blur-xs">
                  {template.price}
                </span>

                {/* Catégorie & sous-catégorie */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-white drop-shadow-md">
                    {template.subCategory}
                  </span>
                  <span className="text-[10px] text-[#f0d999] tracking-wider uppercase font-semibold">
                    {template.categoryName}
                  </span>
                </div>
              </div>

              {/* Titre, citation et action */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#1a0f07] group-hover:text-[#8f6f33] transition-colors leading-snug">
                    {template.title}
                  </h4>
                  
                  <p className="text-xs text-[#665140] italic mt-2 line-clamp-2 leading-relaxed font-light">
                    « {template.quotePreview} »
                  </p>
                </div>

                {/* Détails & Bouton Découvrir */}
                <div className="pt-3 border-t border-[#f0e4d4] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#8a725e] truncate max-w-[130px] flex items-center gap-1">
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
      </section>

      {/* 4. POURQUOI CHOISIR LES VŒUX EVENIUM (ARGUMENTS QUI DONNENT ENVIE D'ACHETER) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8f6f33] mb-2">
            La Différence Evenium
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1a0f07]">
            Bien plus qu'un message : <span className="italic text-gold-foil">un cadeau précieux</span>
          </h2>
          <DiamondRule className="mt-5 mb-5" />
          <p className="text-sm sm:text-base text-[#554131] font-light">
            Découvrez pourquoi nos membres préfèrent offrir une carte Evenium plutôt qu'un texte éphémère.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-7 rounded-[2rem] bg-white border border-[#e6d7c3] shadow-xs space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] flex items-center justify-center text-xl font-bold">
              ✦
            </span>
            <h4 className="font-serif text-xl text-[#1a0f07]">L'Effet Frisson</h4>
            <p className="text-xs text-[#665140] leading-relaxed font-light">
              Le geste tactile de briser le sceau de cire virtuel, l'accord de harpe céleste et l'envolée d'étoiles créent un instant magique que votre proche n'oubliera jamais.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] bg-white border border-[#e6d7c3] shadow-xs space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] flex items-center justify-center text-xl font-bold">
              🔓
            </span>
            <h4 className="font-serif text-xl text-[#1a0f07]">0 Formulaire, 0 RSVP</h4>
            <p className="text-xs text-[#665140] leading-relaxed font-light">
              Contrairement aux invitations d'événements, ici aucun formulaire ni tracking de présence n'est imposé. Votre proche profite d'un cadeau pur, sans contrainte.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] bg-white border border-[#e6d7c3] shadow-xs space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] flex items-center justify-center text-xl font-bold">
              🌍
            </span>
            <h4 className="font-serif text-xl text-[#1a0f07]">Partage Universel</h4>
            <p className="text-xs text-[#665140] leading-relaxed font-light">
              Envoi direct en 1 clic sur WhatsApp, SMS, Email ou réseaux. Votre destinataire ouvre sa carte instantanément sur iPhone, Android ou PC, sans application.
            </p>
          </div>

          <div className="p-7 rounded-[2rem] bg-white border border-[#e6d7c3] shadow-xs space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] flex items-center justify-center text-xl font-bold">
              💎
            </span>
            <h4 className="font-serif text-xl text-[#1a0f07]">Souvenir Éternel</h4>
            <p className="text-xs text-[#665140] leading-relaxed font-light">
              Une fois acquise, la carte reste accessible à vie. Votre destinataire pourra la réécouter et la relire à tout moment dès qu'il a besoin de réconfort.
            </p>
          </div>

        </div>
      </section>

      {/* 5. GRAND CTA FINAL : PRÊT À OFFRIR */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] p-8 sm:p-16 text-center overflow-hidden border border-[#d4af37] bg-gradient-to-b from-[#25170e] via-[#1a0f08] to-[#120a05] text-white shadow-2xl">
          <LuxFrame className="inset-4 sm:inset-6 opacity-40" />
          <Fleuron className="mx-auto w-36 sm:w-48 h-auto mb-4" />

          <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#fef9f0] mb-4">
            Une personne qui compte <span className="italic text-gold-foil">dans votre vie</span> ?
          </h3>

          <p className="text-xs sm:text-sm text-[#c4b5a5] max-w-xl mx-auto mb-8 font-light leading-relaxed">
            N'attendez pas une date lointaine pour lui dire combien elle compte. Choisissez votre carte coup de cœur et faites battre son cœur dès maintenant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              type="button"
              onClick={() => setActiveModalTemplate(VOEUX_TEMPLATES[0])}
              className="btn-lux px-8 py-4 text-xs sm:text-[13px] !tracking-[0.16em] cursor-pointer shadow-xl"
            >
              <span>Personnaliser ma carte de vœux (3,90 €)</span>
              <Gift size={16} className="text-[#f0d999]" />
            </button>

            <Link
              href="/"
              className="px-6 py-3.5 rounded-full text-xs font-semibold text-[#c4b5a5] hover:text-white hover:bg-white/10 transition-colors border border-white/20"
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
