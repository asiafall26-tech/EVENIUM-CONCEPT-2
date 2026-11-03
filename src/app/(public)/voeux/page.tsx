"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, Gift, Heart, Send, ArrowRight, CheckCircle, 
  Share2, Eye, ShieldCheck, Clock, Award
} from "lucide-react";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";
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

  const currentCategoryData = VOEUX_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-[#fbf6ee] min-h-screen">
      {/* 1. HERO SECTION LUXUEUSE */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-6 lg:px-8 border-b border-[#e9dcce]">
        <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-[#e9c478]/25 to-transparent blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Fleuron className="mx-auto w-40 sm:w-52 h-auto mb-4" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] text-xs font-bold uppercase tracking-[0.25em] mb-5 shadow-2xs">
            <Sparkles size={13} className="text-[#b8924a]" /> Nouveau Service Evenium
          </div>

          <h1 className="font-serif not-italic text-3xl sm:text-5xl lg:text-6xl text-[#1d120a] leading-tight mb-4 tracking-tight">
            Espace <span className="italic text-gold-foil">Vœux d'Exception</span>
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl text-[#8f6f33] mb-6">
            « Faites plaisir à vos proches, même à distance ! »
          </p>

          <DiamondRule className="mb-6" />

          <p className="text-[#4a3b2c] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Evenium vous propose un espace dédié aux <strong>Vœux</strong>, regroupant une collection de magnifiques cartes de vœux numériques personnalisables pour célébrer tous les moments précieux de la vie.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogue"
              className="btn-lux group px-7 py-3 text-xs sm:text-[13px] !tracking-[0.15em]"
            >
              <span>Découvrir la collection</span>
              <ArrowRight size={14} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/create"
              className="px-6 py-3 rounded-full text-xs font-semibold text-[#665038] hover:text-[#1d120a] hover:bg-white/80 transition-all border border-[#d9c08c]/50"
            >
              Créer un événement complet
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LES 6 MOMENTS IMPORTANTS DE LA VIE (GRID DES CATÉGORIES) */}
      <section className="py-14 sm:py-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8f6f33] mb-2">Moments de vie</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1d120a]">
            Célébrez chaque <span className="italic text-gold-foil">occasion marquante</span>
          </h2>
          <DiamondRule className="mt-4 mb-4" />
          <p className="text-sm text-[#544333]">
            Des vœux délicats et touchants conçus sur-mesure pour chaque chapitre de votre histoire.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOEUX_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const el = document.getElementById("catalogue");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`card-lux p-6 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 ${
                  isSelected 
                    ? "ring-2 ring-[#c9a45e] shadow-[0_16px_36px_-12px_rgba(201,164,94,0.4)]" 
                    : "hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-3 bg-white rounded-2xl border border-[#e9dcce] shadow-2xs group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33] bg-[#faf0dc] px-2.5 py-1 rounded-full border border-[#d9c08c]/40">
                      Explorer
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#1d120a] group-hover:text-[#8f6f33] transition-colors mb-1">
                    {cat.name}
                  </h3>

                  <p className="text-xs font-semibold text-[#8f6f33] mb-3">
                    {cat.tagline}
                  </p>

                  <p className="text-xs text-[#5a4837] leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e9dcce] flex flex-wrap gap-1.5">
                  {cat.subcategories.slice(0, 3).map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#e4d8c8] text-[#554332]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CATALOGUE DE CARTES INTERACTIVES */}
      <section id="catalogue" className="py-14 sm:py-20 px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e9dcce]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8f6f33] mb-2">Collection d'exception</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1d120a]">
            Nos Cartes de Vœux <span className="italic text-gold-foil">Personnalisables</span>
          </h2>
          <DiamondRule className="mt-4 mb-4" />
          <p className="text-sm text-[#544333]">
            Sélectionnez une carte pour ouvrir son enveloppe interactive et rédiger votre message chaleureux.
          </p>
        </div>

        {/* Barre de filtres rapides */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[#2b1d12] to-[#150d07] text-[#f0d999] shadow-md border border-[#c9a45e]"
                : "bg-white text-stone-700 hover:bg-[#faf0dc] border border-[#e4d8c8]"
            }`}
          >
            ✨ Toutes les cartes ({VOEUX_TEMPLATES.length})
          </button>
          {VOEUX_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                selectedCategory === c.id
                  ? "bg-gradient-to-r from-[#2b1d12] to-[#150d07] text-[#f0d999] shadow-md border border-[#c9a45e] font-bold"
                  : "bg-white text-stone-700 hover:bg-[#faf0dc] border border-[#e4d8c8]"
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Grille des Cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card-lux rounded-3xl overflow-hidden group flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 border border-[#e4d8c8]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {template.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-950/80 text-[#f0d999] border border-[#c9a45e]/60 backdrop-blur-sm">
                    {template.badge}
                  </span>
                )}

                <span className="absolute bottom-3 left-3 text-xs font-serif font-bold text-white drop-shadow">
                  {template.categoryName}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#8f6f33] transition-colors leading-snug">
                    {template.title}
                  </h4>
                  <p className="text-xs text-stone-500 italic mt-1 line-clamp-2">
                    « {template.quotePreview} »
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400 truncate">
                    {template.suggestedMusic}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveModalTemplate(template)}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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

      {/* 4. COMMENT ÇA FONCTIONNE (3 ÉTAPES) */}
      <section className="py-16 sm:py-20 px-6 lg:px-8 bg-gradient-to-b from-[#1f140b] to-[#120b06] text-white relative overflow-hidden">
        <LuxFrame className="inset-4 sm:inset-6 opacity-30" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d9c08c] mb-2">Simplicité &amp; Magie</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#fef9f0] mb-4">
            Envoyer des vœux en <span className="italic text-gold-foil">3 gestes simples</span>
          </h2>
          <DiamondRule className="mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm space-y-3">
              <span className="w-14 h-14 rounded-2xl bg-[#d9c08c]/20 border border-[#d9c08c]/40 text-[#f0d999] flex items-center justify-center mx-auto text-xl font-serif font-bold">
                1
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Choisissez votre modèle</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Parcourez notre collection selon l'occasion : anniversaire, mariage, diplôme ou mot de remerciement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm space-y-3">
              <span className="w-14 h-14 rounded-2xl bg-[#d9c08c]/20 border border-[#d9c08c]/40 text-[#f0d999] flex items-center justify-center mx-auto text-xl font-serif font-bold">
                2
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Personnalisez l'émotion</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Indiquez le nom du destinataire, sélectionnez une suggestion poétique ou rédigez librement vos mots chaleureux.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm space-y-3">
              <span className="w-14 h-14 rounded-2xl bg-[#d9c08c]/20 border border-[#d9c08c]/40 text-[#f0d999] flex items-center justify-center mx-auto text-xl font-serif font-bold">
                3
              </span>
              <h4 className="font-serif text-xl text-[#fef9f0]">Partagez instantanément</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Envoyez la carte par WhatsApp, SMS, Email ou copiez le lien sécurisé pour faire plaisir même à des milliers de kilomètres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LES ENGAGEMENTS & AVANTAGES DU SERVICE VŒUX */}
      <section className="py-16 sm:py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-white border border-[#e9dcce] shadow-2xs space-y-2">
            <Sparkles size={24} className="text-[#b8924a] mx-auto" />
            <h5 className="font-serif font-bold text-sm text-[#1d120a]">100% Interactif</h5>
            <p className="text-[11px] text-stone-500">Sceau de cire à briser, animations d'étoiles et mélodies apaisantes.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#e9dcce] shadow-2xs space-y-2">
            <Clock size={24} className="text-[#b8924a] mx-auto" />
            <h5 className="font-serif font-bold text-sm text-[#1d120a]">Livraison Instantanée</h5>
            <p className="text-[11px] text-stone-500">Accessible en 1 clic sur tout smartphone, tablette ou ordinateur.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#e9dcce] shadow-2xs space-y-2">
            <Heart size={24} className="text-[#b8924a] mx-auto" />
            <h5 className="font-serif font-bold text-sm text-[#1d120a]">Écologique &amp; Zéro Déchet</h5>
            <p className="text-[11px] text-stone-500">Le raffinement du papier et de l'or sans aucun impact environnemental.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#e9dcce] shadow-2xs space-y-2">
            <Award size={24} className="text-[#b8924a] mx-auto" />
            <h5 className="font-serif font-bold text-sm text-[#1d120a]">Élégance Haute Couture</h5>
            <p className="text-[11px] text-stone-500">Designs pensés par les directeurs artistiques Evenium.</p>
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="pb-20 sm:pb-24 px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="card-lux rounded-[2.5rem] p-8 sm:p-14 text-center relative overflow-hidden border border-[#d9c08c]">
          <LuxFrame className="inset-3 sm:inset-5" />
          <Fleuron className="mx-auto w-36 sm:w-44 h-auto mb-4" />
          <h3 className="font-serif text-2xl sm:text-4xl text-[#1d120a] mb-3">
            Une pensée à transmettre <span className="italic text-gold-foil">aujourd'hui</span> ?
          </h3>
          <p className="text-sm text-[#544333] max-w-lg mx-auto mb-8 leading-relaxed">
            Ne laissez pas filer les moments précieux. Envoyez dès maintenant vos premiers vœux personnalisés à ceux qui vous sont chers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveModalTemplate(VOEUX_TEMPLATES[0]);
              }}
              className="btn-lux px-8 py-3.5 text-xs sm:text-[13px] cursor-pointer"
            >
              <span>Envoyer une carte de vœux</span>
              <Gift size={15} className="text-[#f0d999]" />
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-100 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      {/* Modale de visualisation et personnalisation de la carte */}
      <VoeuxCardModal
        template={activeModalTemplate}
        onClose={() => setActiveModalTemplate(null)}
      />
    </div>
  );
}
