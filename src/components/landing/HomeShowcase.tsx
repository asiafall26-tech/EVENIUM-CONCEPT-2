"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ModelCard from "@/components/landing/ModelCard";
import { ArrowRight, Sparkles, Heart, Calendar, Eye } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import type { InvitationModel } from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/client";
import { fetchModelDefaults, invalidateModelDefaultsCache } from "@/lib/modelDefaults";
import { fetchCustomModels, invalidateCustomModelsCache } from "@/lib/customModels";
import { buildShowcase } from "@/lib/showcase";
import { previewHref } from "@/lib/modelPreview";
import { subscribeToSync } from "@/lib/syncService";
import {
  fetchServiceCategories,
  modelMatchesCategory,
  type ServiceCategory,
  FALLBACK_CATEGORIES,
} from "@/lib/serviceCategories";
import { SERVICE_EVENT_FILTERS, EVENT_TYPE_ICONS } from "@/lib/eventTypes";

interface HomeShowcaseProps {
  initialModels: InvitationModel[];
}

export default function HomeShowcase({ initialModels }: HomeShowcaseProps) {
  const [showcaseModels, setShowcaseModels] = useState<InvitationModel[]>(initialModels);
  const [categories, setCategories] = useState<ServiceCategory[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("invitations");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();

    const reload = async (force = false) => {
      try {
        if (force) {
          invalidateModelDefaultsCache();
          invalidateCustomModelsCache();
        }
        const [rows, customs, cats] = await Promise.all([
          fetchModelDefaults(supabase, force),
          fetchCustomModels(supabase, { publishedOnly: true, force }),
          fetchServiceCategories(supabase, force),
        ]);
        const ordered = buildShowcase(rows, customs);
        setShowcaseModels(ordered);
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Erreur lors de l'actualisation des modèles vitrine :", err);
      }
    };

    reload();

    const unsubSync = subscribeToSync("models", () => reload(true));
    const unsubCats = subscribeToSync("categories", () => reload(true));

    const channel = supabase
      .channel("home_showcase_models_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitation_model_defaults" },
        () => reload(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_invitation_models" },
        () => reload(true)
      )
      .subscribe();

    return () => {
      unsubSync();
      unsubCats();
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrage strict par catégorie et par événement sélectionné
  const displayedModels = useMemo(() => {
    let list = showcaseModels.filter((m) => modelMatchesCategory(m, selectedCategory));
    if (selectedEvent !== "all" && selectedEvent !== "Tous" && selectedEvent !== "tous") {
      const target = selectedEvent.toLowerCase();
      list = list.filter((m) => {
        const evs = Array.isArray(m.events) ? m.events.map((e: string) => e.toLowerCase()) : [];
        const cat = (m.category || "").toLowerCase();
        const name = (m.name || "").toLowerCase();
        return (
          evs.some((e: string) => e.includes(target) || target.includes(e)) ||
          cat.includes(target) ||
          target.includes(cat) ||
          name.includes(target)
        );
      });
    }
    return list;
  }, [showcaseModels, selectedCategory, selectedEvent]);

  const activeCategory = categories.find((c) => c.slug === selectedCategory) || categories[0];

  const getCategoryIcon = (slug: string) => {
    if (slug === "invitations" || slug === "evenementielles") return <span className="text-sm">🎉</span>;
    if (slug === "voeux" || slug === "celebrations") return <span className="text-sm">🎁</span>;
    if (slug === "mots_doux") return <span className="text-sm">💌</span>;
    if (slug === "couple") return <span className="text-sm">❤️</span>;
    return <span className="text-sm">✨</span>;
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f2e4cf] via-[#f8efe2] to-[#fbf6ee]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="La collection Evenium"
          title={
            <>
              Des univers d&apos;exception,{" "}
              <span className="italic text-gold-foil">chacun à sa juste valeur</span>
            </>
          }
          lead="Faites votre choix parmi nos 4 services : invitations événementielles (animées ou statiques), vœux & célébrations, mots doux et espace couple."
          className="mb-8 md:mb-12"
        />

        {/* Sélecteur des catégories dynamiques sans prix */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white/90 border border-[#b8924a]/35 p-1.5 rounded-2xl sm:rounded-full inline-flex flex-wrap justify-center gap-1.5 shadow-sm max-w-full">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSelectedEvent("all");
                  }}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md border border-[#c9a45e]"
                      : "text-gray-700 hover:text-black hover:bg-gray-100/60"
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtre par événement pour Invitations événementielles et Vœux */}
        {(selectedCategory === "invitations" || selectedCategory === "voeux") && (
          <div className="flex justify-center -mt-2 mb-10 max-w-5xl mx-auto px-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-2 bg-white/85 backdrop-blur-sm rounded-full border border-[#b8924a]/35 shadow-xs scroll-smooth max-w-full">
              <button
                type="button"
                onClick={() => setSelectedEvent("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedEvent === "all"
                    ? "bg-[#2b1d12] text-[#f0d999] shadow-xs"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Tous
              </button>
              {SERVICE_EVENT_FILTERS.map((evt) => {
                const isSelected = selectedEvent.toLowerCase() === evt.toLowerCase();
                return (
                  <button
                    key={evt}
                    type="button"
                    onClick={() => setSelectedEvent(isSelected ? "all" : evt)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-[#2b1d12] text-[#f0d999] shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-white"
                    }`}
                  >
                    <span>{EVENT_TYPE_ICONS[evt] || "🎉"}</span>
                    <span>{evt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bandeau d'information sur la catégorie sélectionnée */}
        {activeCategory && (
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2 animate-in fade-in duration-300">
            <span className="inline-block px-3 py-1 rounded-full bg-[#fbf7f0] border border-[#b8924a]/30 text-[#8f6f33] text-[10px] font-bold uppercase tracking-widest">
              {activeCategory.label}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              {activeCategory.label}
            </h3>
            {activeCategory.description && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
                {activeCategory.description}
              </p>
            )}
          </div>
        )}

        {displayedModels.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white/50 rounded-3xl border border-[#c9a45e]/20 max-w-lg mx-auto p-8 mb-12">
            <p className="font-serif text-lg text-gray-700 mb-2">Notre collection se renouvelle.</p>
            <p className="text-sm">De nouveaux modèles exclusifs pour cette catégorie seront bientôt disponibles.</p>
            <Link
              href="/invitations?cat=tous"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#8f6f33] hover:underline"
            >
              <Eye size={14} /> Voir tous les modèles disponibles
            </Link>
          </div>
        ) : (
          <Reveal
            className={
              displayedModels.length >= 4
                ? "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
                : "flex flex-wrap justify-center gap-4 md:gap-6 mb-12 md:mb-16"
            }
          >
            {displayedModels.map((model, i) => (
              <ModelCard
                key={model.id}
                href={previewHref(model, selectedCategory)}
                name={model.name}
                image={model.thumbnail}
                kind={model.type}
                eyebrow={activeCategory?.label || `Collection ${model.category}`}
                compact
                sizes="(min-width: 768px) 25vw, 50vw"
                className={`${
                  displayedModels.length >= 4
                    ? ""
                    : "w-[calc(50%-0.5rem)] max-w-[300px] md:w-72"
                } self-start ${i % 2 === 1 ? "md:mt-8" : ""}`}
              />
            ))}
          </Reveal>
        )}

        <div className="text-center">
          <Link
            href={`/invitations?cat=${selectedCategory}`}
            className="btn-lux group px-8 py-4 text-xs sm:text-[13px] inline-flex items-center gap-2"
          >
            <span>Explorer la collection {activeCategory?.label}</span>
            <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
