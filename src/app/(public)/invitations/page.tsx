"use client";

import { mockInvitationModels } from "@/data/mock/invitations";
import { Sparkles, PlayCircle, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function InvitationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Mariage");

  const categoryFilter = (m: (typeof mockInvitationModels)[number]) =>
    selectedCategory === "Tous" ? true : m.category === selectedCategory;

  const animatedModels = mockInvitationModels
    .filter((m) => m.type === "animée")
    .filter(categoryFilter);

  const cardModels = mockInvitationModels
    .filter((m) => m.type === "carte")
    .filter(categoryFilter);

  // Responsive grid layout based on model count
  const gridClass = (count: number) =>
    count === 1
      ? "grid grid-cols-1 max-w-md mx-auto gap-12"
      : count === 2
      ? "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-10"
      : count === 3
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8";

  return (
    <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-primary">Modèles d&apos;Invitations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-sans">
          Faites forte impression avec nos invitations digitales haute couture.
          Touchez n&apos;importe quel modèle pour explorer directement son univers interactif.
        </p>
      </div>

      {/* Barre de sélection de catégorie d'événement */}
      <div className="max-w-4xl mx-auto mb-14">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-gray-200/80 shadow-sm">
          {[
            { id: "Mariage", label: "Mariage", icon: "💍", count: mockInvitationModels.filter(m => m.category === "Mariage").length },
            { id: "Tous", label: "Tous les modèles", icon: "✨", count: mockInvitationModels.length },
            { id: "Anniversaire", label: "Anniversaire", icon: "🎂", soon: true },
            { id: "Gala", label: "Gala & Soirée", icon: "🥂", soon: true },
            { id: "Baptême", label: "Baptême", icon: "🕊️", soon: true },
            { id: "Corporate", label: "Corporate", icon: "💼", soon: true },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-black text-[#b8924a] shadow-lg shadow-black/15 scale-105 border border-[#b8924a]/50"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-transparent"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.count !== undefined ? (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-[#b8924a]/25 text-[#b8924a]" : "bg-gray-200 text-gray-700"}`}>
                    {cat.count}
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-500 font-normal">
                    Bientôt
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invitations Animées (Mises en avant pour la catégorie) */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/60 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                💍 Catégorie {selectedCategory === "Tous" ? "Mariage" : selectedCategory}
              </span>
              <span className="text-xs bg-[#6b1f2a] text-pink-200 px-3 py-1 rounded-full font-semibold tracking-wider uppercase">
                {animatedModels.length} {animatedModels.length > 1 ? "Modèles Animés" : "Modèle Animé"}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900">
              Invitations Animées &amp; Interactives
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
              Expériences immersives haute couture pour célébrer votre mariage : ouverture d&apos;enveloppe au sceau de cire, vidéos cinématiques, mélodies romantiques et confirmation de présence instantanée.
            </p>
          </div>
          <div className="hidden lg:block h-px bg-gray-200 flex-1 max-w-xs mb-3"></div>
        </div>

        {animatedModels.length > 0 ? (
          <div className={gridClass(animatedModels.length)}>
            {animatedModels.map((model) => (
              <Link
                key={model.id}
                href={model.liveUrl || "/invitation-mariage"}
                className="group relative flex flex-col items-center block w-full focus:outline-none"
              >
                <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all relative cursor-pointer border border-gray-200 group-hover:border-[#b8924a]/60 group-hover:-translate-y-1">
                  <Image
                    src={model.thumbnail}
                    alt={model.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Bouton d'accès direct sur hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 gap-3">
                    <span className="bg-white text-primary px-6 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                      <Eye size={16} className="text-[#b8924a]" /> Voir le modèle
                    </span>
                  </div>

                  {/* Badges sur l'image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm text-gray-900 border border-gray-100">
                      <PlayCircle size={13} className="text-[#6b1f2a]" /> Animée
                    </span>
                    {model.isPremium && (
                      <span className="bg-gradient-to-r from-[#b8924a] to-[#F3E5AB] text-black px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm flex items-center gap-1 border border-[#b8924a]/50">
                        <Sparkles size={11} /> Signature
                      </span>
                    )}
                  </div>
                </div>

                {/* Présentation texte aérée avec lien explicite */}
                <div className="mt-4 text-center px-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7a5e2b] bg-[#b8924a]/15 px-2.5 py-0.5 rounded-full mb-1.5 border border-[#b8924a]/30">
                    💍 Modèle {model.category}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-gray-900 leading-snug group-hover:text-[#8f6f33] transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 max-w-sm mt-1.5 leading-relaxed">
                    {model.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6f33] group-hover:text-black transition-colors mt-2.5">
                    Découvrir l&apos;invitation <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <p className="text-4xl mb-3">🎨</p>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Bientôt disponible</h3>
            <p className="text-sm text-gray-500 mb-6">
              Les modèles pour la catégorie <strong>{selectedCategory}</strong> sont en cours de création.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("Mariage")}
              className="px-6 py-2.5 bg-black text-[#b8924a] rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              Voir la collection Mariage
            </button>
          </div>
        )}
      </div>

      {/* Cartes Classiques */}
      {cardModels.length > 0 && (
        <div className="max-w-5xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-3xl text-gray-900">Cartes Classiques</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className={gridClass(cardModels.length)}>
            {cardModels.map((model) => (
              <Link
                key={model.id}
                href={model.liveUrl || "/invitation-mariage"}
                className="group relative flex flex-col items-center block w-full focus:outline-none"
              >
                <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all relative cursor-pointer border border-gray-200 group-hover:border-[#b8924a]/60 group-hover:-translate-y-1">
                  <Image
                    src={model.thumbnail}
                    alt={model.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 gap-3">
                    <span className="bg-white text-primary px-6 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                      <Eye size={16} className="text-[#b8924a]" /> Voir le modèle
                    </span>
                  </div>

                  {model.isPremium && (
                    <div className="absolute top-4 right-4 z-10 bg-[#b8924a] text-black px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                      <Sparkles size={12} /> Signature
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-serif text-xl font-semibold text-gray-900 group-hover:text-[#8f6f33] transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-sm mt-1">
                    {model.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6f33] group-hover:text-black transition-colors mt-2">
                    Voir l&apos;invitation <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA final en bas de la page Galerie */}
      <div className="max-w-4xl mx-auto mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-black via-gray-900 to-black text-white text-center border border-[#b8924a]/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 text-[#b8924a] mx-auto flex items-center justify-center mb-4">
            <Sparkles size={22} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Vous avez trouvé l&apos;inspiration ?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-6 leading-relaxed">
            Créez votre événement en quelques minutes, configurez votre invitation d&apos;exception et commencez à inviter vos proches sans attendre.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/create"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#b8924a] to-[#F3E5AB] text-black font-extrabold text-sm shadow-xl shadow-[#b8924a]/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} /> Créer mon événement
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
