"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Heart, 
  Music, 
  Calendar, 
  Clock, 
  MapPin, 
  Shirt, 
  Eye, 
  Edit3, 
  Lightbulb, 
  Check, 
  ArrowRight,
  Shield,
  Volume2
} from "lucide-react";
import type { CardCategoryType } from "@/lib/cartesService";

export interface CartesStudioValue {
  recipient: string;
  sender: string;
  kicker: string;
  title: string;
  message: string;
  music: string;
  sealColor: "gold" | "ruby" | "emerald" | "pearl" | "sapphire";
  paperTheme: "ivory" | "parchment" | "rose" | "dark_velvet";
  rendezVousDate?: string;
  rendezVousTime?: string;
  rendezVousPlace?: string;
  dressCode?: string;
}

interface CartesStudioProps {
  cardType: CardCategoryType;
  occasionName?: string;
  templateTitle?: string;
  priceFcfa?: number;
  priceEur?: string;
  value: CartesStudioValue;
  onChange: (patch: Partial<CartesStudioValue>) => void;
  onProceedToCheckout?: () => void;
  inspirations?: Array<{ title: string; text: string }>;
}

const SEAL_OPTIONS: Array<{
  id: CartesStudioValue["sealColor"];
  name: string;
  colorCls: string;
  icon: string;
}> = [
  { id: "gold", name: "Or Impérial", colorCls: "from-[#f3e099] via-[#c9a45e] to-[#805e26]", icon: "⚜️" },
  { id: "ruby", name: "Rubis Passion", colorCls: "from-[#d62828] via-[#9e1b23] to-[#590d12]", icon: "❤️" },
  { id: "pearl", name: "Nacre Satinée", colorCls: "from-[#ffffff] via-[#e5ded3] to-[#b8aa94]", icon: "🕊️" },
  { id: "emerald", name: "Émeraude Royale", colorCls: "from-[#2d6a4f] via-[#1b4332] to-[#081c15]", icon: "🌿" },
  { id: "sapphire", name: "Saphir Nocturne", colorCls: "from-[#2a6f97] via-[#013a63] to-[#012a4a]", icon: "🌙" },
];

const PAPER_OPTIONS: Array<{
  id: CartesStudioValue["paperTheme"];
  name: string;
  bgCls: string;
  borderCls: string;
  textCls: string;
}> = [
  { id: "ivory", name: "Ivoire Couture", bgCls: "bg-[#fcf9f2]", borderCls: "border-[#d9c08c]", textCls: "text-[#24170e]" },
  { id: "parchment", name: "Parchemin Royal", bgCls: "bg-[#f8f0de]", borderCls: "border-[#c9a45e]", textCls: "text-[#28180c]" },
  { id: "rose", name: "Soie Rose Poudrée", bgCls: "bg-[#fff5f6]", borderCls: "border-[#eed1d7]", textCls: "text-[#2d1217]" },
  { id: "dark_velvet", name: "Velours Noir & Or", bgCls: "bg-[#160f0c]", borderCls: "border-[#b8924a]/50", textCls: "text-[#fbf7ee]" },
];

const MUSIC_OPTIONS = [
  { id: "Experience - Ludovico Einaudi", name: "Experience (Ludovico Einaudi)" },
  { id: "Clair de Lune - Debussy", name: "Clair de Lune (Debussy)" },
  { id: "Nocturne Op. 9 No. 2 - Chopin", name: "Nocturne Op. 9 (Chopin)" },
  { id: "River Flows in You - Yiruma", name: "River Flows in You (Yiruma)" },
  { id: "Valse des Étoiles", name: "Valse Romantique des Étoiles" },
  { id: "Jazz Romantique Feutré", name: "Jazz Piano Feutré & Chaleureux" },
];

export function CartesStudio({
  cardType,
  occasionName,
  templateTitle,
  priceFcfa = 3900,
  priceEur = "3,90 €",
  value,
  onChange,
  onProceedToCheckout,
  inspirations = [],
}: CartesStudioProps) {
  const [activeTab, setActiveTab] = useState<"textes" | "style" | "musique" | "couple">("textes");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [previewEnvelopeOpen, setPreviewEnvelopeOpen] = useState(true);

  const isCouple = cardType === "invitation_couple";
  const isMotDoux = cardType === "mot_doux";

  // Sceau sélectionné
  const currentSeal = SEAL_OPTIONS.find((s) => s.id === value.sealColor) || SEAL_OPTIONS[0];
  const currentPaper = PAPER_OPTIONS.find((p) => p.id === value.paperTheme) || PAPER_OPTIONS[0];

  return (
    <div className="w-full flex flex-col space-y-4">
      
      {/* COMMUTATEUR MOBILE : ÉDITION VS APERÇU */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-gray-100 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileView === "edit"
              ? "bg-white text-[#1a0f07] shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Edit3 size={14} className="text-[#b8924a]" />
          <span>Partie Édition</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileView === "preview"
              ? "bg-white text-[#1a0f07] shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Eye size={14} className="text-[#b8924a]" />
          <span>Aperçu de la Carte</span>
        </button>
      </div>

      {/* DISPOSITION STUDIO PRINCIPALE (GRILLE CÔTE-À-CÔTE SUR DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ───────────────── VOLET GAUCHE : ÉDITION (7 COLS) ───────────────── */}
        <div className={`lg:col-span-7 flex flex-col space-y-4 ${mobileView === "preview" ? "hidden lg:flex" : "flex"}`}>
          
          {/* BARRE D'ONGLETS D'ÉDITION DU STUDIO */}
          <div className="flex items-center gap-1.5 border-b border-[#e6d7c3] pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("textes")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "textes"
                  ? "bg-[#1a0f07] text-[#f0d999] shadow-sm"
                  : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>✍️</span>
              <span>1. Textes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "style"
                  ? "bg-[#1a0f07] text-[#f0d999] shadow-sm"
                  : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>⚜️</span>
              <span>2. Sceau & Papier</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("musique")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "musique"
                  ? "bg-[#1a0f07] text-[#f0d999] shadow-sm"
                  : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>🎵</span>
              <span>3. Musique</span>
            </button>

            {isCouple && (
              <button
                type="button"
                onClick={() => setActiveTab("couple")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "couple"
                    ? "bg-[#9e1b23] text-white shadow-sm"
                    : "bg-[#fff0f3] text-[#9e1b23] hover:bg-[#ffe0e6] border border-[#f7c2cb]"
                }`}
              >
                <span>🕯️</span>
                <span>4. Rendez-vous Secret</span>
              </button>
            )}
          </div>

          {/* ───────── ONGLET 1 : TEXTES & PERSONNALISATION ───────── */}
          {activeTab === "textes" && (
            <div className="space-y-4 bg-white/95 p-4 sm:p-6 rounded-2xl border border-[#ebd8b7] shadow-xs animate-in fade-in duration-200">
              
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#1a0f07]">
                    Personnalisation du Message
                  </h4>
                  <p className="text-xs text-gray-500">
                    Ces mots seront calligraphiés avec soin sur la lettre dépliée.
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#fbf7f0] text-[#8f6f33] border border-[#d9c08c]">
                  Étape Clé
                </span>
              </div>

              {/* DESTINATAIRE & EXPÉDITEUR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-1">
                    Pour qui ? (Destinataire) *
                  </label>
                  <input
                    type="text"
                    required
                    value={value.recipient}
                    onChange={(e) => onChange({ recipient: e.target.value })}
                    placeholder="Ex: Sophie, Mon Cœur, Fatou..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07] focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-1">
                    De la part de ? (Expéditeur) *
                  </label>
                  <input
                    type="text"
                    required
                    value={value.sender}
                    onChange={(e) => onChange({ sender: e.target.value })}
                    placeholder="Ex: Thomas, Ton admirateur, Aïcha..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07] focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  />
                </div>
              </div>

              {/* KICKER & TITRE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-1">
                    Accroche (En-tête)
                  </label>
                  <input
                    type="text"
                    value={value.kicker}
                    onChange={(e) => onChange({ kicker: e.target.value })}
                    placeholder="Ex: Confidentiel, Pour toi..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07] focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-1">
                    Grand Titre de la lettre
                  </label>
                  <input
                    type="text"
                    value={value.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Ex: Une attention particulière rien que pour toi..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07] focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  />
                </div>
              </div>

              {/* MESSAGE MANUSCRIT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#665140]">
                    Votre Message d'Émotion *
                  </label>
                  <span className="text-[11px] text-[#8f6f33] italic">
                    {value.message.length} caractères
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={value.message}
                  onChange={(e) => onChange({ message: e.target.value })}
                  placeholder="Écrivez avec votre cœur les mots qui marqueront cet instant..."
                  className="w-full p-3.5 rounded-xl bg-white border border-[#d9c08c] text-sm text-[#1a0f07] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                />

                {/* INSPIRATIONS SUGGÉRÉES */}
                {inspirations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-[#8f6f33] flex items-center gap-1 mb-1.5">
                      <Lightbulb size={12} className="text-[#b8924a]" />
                      <span>Inspirations poétiques prêtes à l'emploi (cliquez pour appliquer) :</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {inspirations.map((insp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onChange({ message: insp.text })}
                          className="px-2.5 py-1 text-[11px] bg-[#faf6ee] hover:bg-[#faebd0] border border-[#d9c08c] rounded-full text-[#665140] hover:text-[#1a0f07] transition-all cursor-pointer text-left"
                        >
                          ✦ {insp.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ───────── ONGLET 2 : SCEAU DE CIRE & THÈME DE PAPIER ───────── */}
          {activeTab === "style" && (
            <div className="space-y-5 bg-white/95 p-4 sm:p-6 rounded-2xl border border-[#ebd8b7] shadow-xs animate-in fade-in duration-200">
              
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#1a0f07]">
                  Scénographie & Cachet de Cire
                </h4>
                <p className="text-xs text-gray-500">
                  Choisissez la couleur de votre sceau en relief et le type de papier précieux.
                </p>
              </div>

              {/* SÉLECTEUR DU SCEAU DE CIRE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-2">
                  Couleur du Cachet de Cire à briser
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SEAL_OPTIONS.map((seal) => (
                    <button
                      key={seal.id}
                      type="button"
                      onClick={() => onChange({ sealColor: seal.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        value.sealColor === seal.id
                          ? "bg-amber-50/60 border-[#b8924a] shadow-xs ring-2 ring-[#b8924a]/20"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${seal.colorCls} shadow-sm border border-white/40 flex items-center justify-center text-xs text-white shrink-0`}>
                        {seal.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{seal.name}</p>
                        <p className="text-[10px] text-gray-400">Cachet en relief</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SÉLECTEUR DE PAPIER */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#665140] mb-2">
                  Texture du Papier & Typographie
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAPER_OPTIONS.map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => onChange({ paperTheme: paper.id })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${paper.bgCls} ${
                        value.paperTheme === paper.id
                          ? "border-[#b8924a] ring-2 ring-[#b8924a]/30 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold ${paper.textCls}`}>{paper.name}</p>
                        <p className="text-[10px] text-gray-500">Haute papeterie Evenium</p>
                      </div>
                      {value.paperTheme === paper.id && (
                        <Check size={16} className="text-[#b8924a]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ───────── ONGLET 3 : MUSIQUE & AMBIANCE ───────── */}
          {activeTab === "musique" && (
            <div className="space-y-4 bg-white/95 p-4 sm:p-6 rounded-2xl border border-[#ebd8b7] shadow-xs animate-in fade-in duration-200">
              
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#1a0f07]">
                  Fond Sonore Immersif
                </h4>
                <p className="text-xs text-gray-500">
                  Cette douce mélodie au piano accompagnera l'ouverture de votre lettre.
                </p>
              </div>

              <div className="space-y-2">
                {MUSIC_OPTIONS.map((music) => (
                  <button
                    key={music.id}
                    type="button"
                    onClick={() => onChange({ music: music.name })}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      value.music.includes(music.name) || music.id.includes(value.music)
                        ? "bg-[#faf0dc] border-[#b8924a] text-[#1a0f07] font-semibold shadow-xs"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 size={16} className="text-[#b8924a]" />
                      <span className="text-xs">{music.name}</span>
                    </div>
                    {(value.music.includes(music.name) || music.id.includes(value.music)) && (
                      <span className="text-[10px] uppercase font-bold text-[#8f6f33] bg-white px-2 py-0.5 rounded-full border border-[#d9c08c]">
                        Sélectionné
                      </span>
                    )}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* ───────── ONGLET 4 : RENDEZ-VOUS SECRET (POUR COUPLE) ───────── */}
          {isCouple && activeTab === "couple" && (
            <div className="space-y-4 bg-white/95 p-4 sm:p-6 rounded-2xl border border-[#eed4da] shadow-xs animate-in fade-in duration-200">
              
              <div className="border-b border-[#f4dee2] pb-3">
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#1a0a0e] flex items-center gap-2">
                  <span>🕯️</span>
                  <span>Détails du Rendez-vous en Amoureux</span>
                </h4>
                <p className="text-xs text-[#734c54]">
                  Indiquez les détails de votre tête-à-tête secret. Le destinataire aura un bouton exclusif pour accepter votre invitation !
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#665140] mb-1 flex items-center gap-1">
                    <Calendar size={13} className="text-[#d62828]" /> Date du tête-à-tête
                  </label>
                  <input
                    type="text"
                    value={value.rendezVousDate || ""}
                    onChange={(e) => onChange({ rendezVousDate: e.target.value })}
                    placeholder="Ex: Ce vendredi soir, 14 Février..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#eed4da] text-xs text-[#1a0a0e] focus:ring-1 focus:ring-[#d62828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#665140] mb-1 flex items-center gap-1">
                    <Clock size={13} className="text-[#d62828]" /> Heure convenue
                  </label>
                  <input
                    type="text"
                    value={value.rendezVousTime || ""}
                    onChange={(e) => onChange({ rendezVousTime: e.target.value })}
                    placeholder="Ex: 20h30 précises"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#eed4da] text-xs text-[#1a0a0e] focus:ring-1 focus:ring-[#d62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#665140] mb-1 flex items-center gap-1">
                  <MapPin size={13} className="text-[#d62828]" /> Lieu Secret / Destination
                </label>
                <input
                  type="text"
                  value={value.rendezVousPlace || ""}
                  onChange={(e) => onChange({ rendezVousPlace: e.target.value })}
                  placeholder="Ex: Lieu secret... Je passe te chercher en bas"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#eed4da] text-xs text-[#1a0a0e] focus:ring-1 focus:ring-[#d62828]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#665140] mb-1 flex items-center gap-1">
                  <Shirt size={13} className="text-[#d62828]" /> Dress Code suggéré
                </label>
                <input
                  type="text"
                  value={value.dressCode || ""}
                  onChange={(e) => onChange({ dressCode: e.target.value })}
                  placeholder="Ex: Chic & Séduction, Pyjama de soie, Tenue d'aventurier..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#eed4da] text-xs text-[#1a0a0e] focus:ring-1 focus:ring-[#d62828]"
                />
              </div>

              <div className="p-3 bg-[#fff0f3] rounded-xl border border-[#fed4dc] flex items-center gap-2 text-xs text-[#9e1b23]">
                <Heart size={14} className="fill-[#d62828] text-[#d62828] shrink-0" />
                <span>
                  Bouton de confirmation inclus pour le partenaire : <strong>« J'accepte avec amour ❤️ »</strong>
                </span>
              </div>

            </div>
          )}

          {/* BARRE D'ACTION INFÉRIEURE */}
          {onProceedToCheckout && (
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <div className="text-xs text-[#8f6f33]">
                Tarif unique : <strong className="text-[#1a0f07]">{priceFcfa.toLocaleString()} FCFA</strong> ({priceEur})
              </div>
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="btn-lux px-6 py-3 text-xs !tracking-[0.14em] cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <span>Étape suivante : Paiement & Sauvegarde</span>
                <ArrowRight size={14} className="text-[#f0d999]" />
              </button>
            </div>
          )}

        </div>

        {/* ───────────────── VOLET DROIT : APERÇU EN DIRECT (5 COLS) ───────────────── */}
        <div className={`lg:col-span-5 flex flex-col space-y-3 sticky top-4 ${mobileView === "edit" ? "hidden lg:flex" : "flex"}`}>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8f6f33] flex items-center gap-1.5">
              <Eye size={13} className="text-[#b8924a]" />
              <span>Aperçu en Temps Réel</span>
            </span>

            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewEnvelopeOpen(false)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  !previewEnvelopeOpen ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                }`}
              >
                Enveloppe
              </button>
              <button
                type="button"
                onClick={() => setPreviewEnvelopeOpen(true)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  previewEnvelopeOpen ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                }`}
              >
                Lettre ouverte
              </button>
            </div>
          </div>

          {/* LE CANVAS DU RÉSULTAT */}
          <div className="bg-[#120804] rounded-3xl p-5 border border-[#4a301c] shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col items-center justify-center text-center">
            
            {/* Halo d'ambiance */}
            <div 
              aria-hidden
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-[350px] h-[250px] rounded-full bg-gradient-to-b from-[#b8924a]/25 via-transparent to-transparent blur-3xl pointer-events-none"
            />

            {/* BADGE MUSIQUE EN DIRECT */}
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 border border-[#b8924a]/30 text-[#d4af37] text-[9px] font-medium flex items-center gap-1">
              <Volume2 size={10} />
              <span className="max-w-[140px] truncate">{value.music}</span>
            </div>

            {/* ÉTAT 1 : ENVELOPPE SCELLÉE */}
            {!previewEnvelopeOpen ? (
              <div className="relative z-10 w-full max-w-xs space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-bold">
                    Une attention vous attend
                  </span>
                  <p className="font-serif text-lg text-[#fbf7ee]">
                    Pour <strong>{value.recipient || "Le Destinataire"}</strong>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Scellée par {value.sender || "Vous"}
                  </p>
                </div>

                {/* ENVELOPPE AVEC SCEAU CLIQUABLE */}
                <div 
                  onClick={() => setPreviewEnvelopeOpen(true)}
                  className="rounded-2xl p-6 bg-gradient-to-br from-[#2a170e] to-[#140803] border border-[#b8924a]/40 shadow-xl cursor-pointer hover:border-[#b8924a] transition-all group"
                  title="Cliquer pour ouvrir la lettre"
                >
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${currentSeal.colorCls} border-2 border-white/40 shadow-lg flex flex-col items-center justify-center text-white transition-transform group-hover:scale-105`}>
                    <span className="text-xl">{currentSeal.icon}</span>
                    <span className="text-[7px] uppercase font-bold tracking-widest mt-0.5">Evenium</span>
                  </div>
                  <p className="text-[9px] text-[#fbf7ee] uppercase tracking-wider font-semibold mt-3">
                    ✦ Toucher pour ouvrir ✦
                  </p>
                </div>
              </div>
            ) : (
              /* ÉTAT 2 : LETTRE OUVERTE */
              <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`rounded-2xl p-5 ${currentPaper.bgCls} ${currentPaper.borderCls} ${currentPaper.textCls} border shadow-xl text-center space-y-3 relative`}>
                  
                  {/* Cadre ornemental */}
                  <div className="absolute inset-1.5 border border-[#b8924a]/30 rounded-xl pointer-events-none" />

                  {/* Kicker & Titre */}
                  <div>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-[#8f6f33] font-bold block mb-0.5">
                      {value.kicker || "Attention Particulière"}
                    </span>
                    <h5 className="font-serif text-base font-bold leading-tight">
                      {value.title || "Pour que tu n'oublies jamais..."}
                    </h5>
                  </div>

                  {/* Message calligraphié */}
                  <p className="font-serif text-xs leading-relaxed italic px-2 whitespace-pre-line line-clamp-6">
                    "{value.message || "Votre message d'émotion apparaîtra ici..."}"
                  </p>

                  {/* Rendez-vous couple si actif */}
                  {isCouple && (value.rendezVousDate || value.rendezVousPlace) && (
                    <div className="p-2.5 rounded-xl bg-black/5 border border-[#b8924a]/30 text-left space-y-1 text-[10px]">
                      <div className="flex items-center justify-between font-bold text-[#8f6f33]">
                        <span>🕯️ Rendez-vous en duo</span>
                      </div>
                      {value.rendezVousDate && (
                        <p><strong>Date :</strong> {value.rendezVousDate} {value.rendezVousTime && `à ${value.rendezVousTime}`}</p>
                      )}
                      {value.rendezVousPlace && (
                        <p><strong>Lieu :</strong> {value.rendezVousPlace}</p>
                      )}
                      <div className="pt-1 mt-1 border-t border-black/10 text-center text-[#d62828] font-bold">
                        Bouton invité : « J'accepte avec amour ❤️ »
                      </div>
                    </div>
                  )}

                  {/* Signature */}
                  <div className="pt-2 border-t border-black/10 text-[10px] text-right font-serif italic">
                    Avec toute mon affection, <br />
                    <strong className="not-italic font-bold">{value.sender || "Votre Nom"}</strong>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setPreviewEnvelopeOpen(false)}
                  className="mt-3 text-[10px] text-[#fbf7ee]/60 hover:text-white underline cursor-pointer"
                >
                  Refermer l'enveloppe
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

