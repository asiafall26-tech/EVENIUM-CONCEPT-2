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
  modelMatchesEvent,
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

  // Événements réellement disponibles dans la vitrine d'accueil pour la catégorie active
  const homeAvailableEvents = useMemo(() => {
    const base = showcaseModels.filter((m) => modelMatchesCategory(m, selectedCategory));
    const counts: Record<string, number> = {};
    for (const evt of SERVICE_EVENT_FILTERS) {
      const c = base.filter((m) => modelMatchesEvent(m, evt)).length;
      if (c > 0) counts[evt] = c;
    }
    return Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
      icon: EVENT_TYPE_ICONS[name as keyof typeof EVENT_TYPE_ICONS] || "🎉",
    }));
  }, [showcaseModels, selectedCategory]);

  // Filtrage strict par catégorie et par événement sélectionné
  const displayedModels = useMemo(() => {
    let list = showcaseModels.filter((m) => modelMatchesCategory(m, selectedCategory));
    if (selectedEvent !== "all" && selectedEvent !== "Tous" && selectedEvent !== "tous") {
      list = list.filter((m) => modelMatchesEvent(m, selectedEvent));
    }
    return list.slice(0, 8);
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
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-y border-neutral-200/60">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Collection Exclusive"
          title={
            <>
              Des créations d&apos;exception,{" "}
              <span className="italic font-normal">sublimées par l&apos;émotion</span>
            </>
          }
          lead="Faites votre choix parmi nos univers raffinés : invitations interactives, célébrations, vœux et attentions précieuses."
          className="mb-8 md:mb-12"
        />

        {/* Sélecteur des catégories épuré */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white border border-neutral-200/80 p-1.5 rounded-2xl sm:rounded-full inline-flex flex-wrap justify-center gap-1.5 shadow-2xs max-w-full">
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
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60"
                  }`}
                >
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtre par événement pour la vitrine */}
        {homeAvailableEvents.length > 0 && (
          <div className="flex justify-center -mt-2 mb-8 max-w-5xl mx-auto px-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-2 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200/80 shadow-2xs scroll-smooth max-w-full">
              <button
                type="button"
                onClick={() => setSelectedEvent("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedEvent === "all"
                    ? "bg-neutral-900 text-[#f5dfaa] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Tous
              </button>
              {homeAvailableEvents.map((evt) => {
                const isSelected = selectedEvent.toLowerCase() === evt.name.toLowerCase();
                return (
                  <button
                    key={evt.name}
                    type="button"
                    onClick={() => setSelectedEvent(isSelected ? "all" : evt.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-neutral-900 text-[#f5dfaa] font-semibold shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60"
                    }`}
                  >
                    <span>{evt.icon}</span>
                    <span>{evt.name}</span>
                    <span className="text-[10px] opacity-70">({evt.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bandeau d'information sur la catégorie sélectionnée */}
        {activeCategory && (
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5 animate-in fade-in duration-300">
            <span className="inline-block px-3 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-widest">
              {activeCategory.label}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
              {activeCategory.label}
            </h3>
            {activeCategory.description && (
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl mx-auto">
                {activeCategory.description}
              </p>
            )}
          </div>
        )}

        {displayedModels.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 bg-white rounded-3xl border border-neutral-200 max-w-lg mx-auto p-8 mb-12 shadow-2xs">
            <p className="font-serif text-lg text-neutral-800 mb-2">Notre collection se renouvelle.</p>
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
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-10 max-w-6xl mx-auto"
                : "flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-6xl mx-auto"
            }
          >
            {displayedModels.map((model) => (
              <ModelCard
                key={model.id}
                href={previewHref(model, selectedCategory)}
                name={model.name}
                image={model.thumbnail}
                kind={model.type}
                eyebrow={activeCategory?.label || `Collection ${model.category}`}
                compact
                sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className={
                  displayedModels.length >= 4
                    ? "w-full"
                    : "w-[calc(50%-0.5rem)] max-w-[190px] md:w-48"
                }
              />
            ))}
          </Reveal>
        )}

        <div className="text-center">
          <Link
            href={`/invitations?cat=${selectedCategory}`}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-[#f5dfaa] font-semibold text-xs sm:text-sm shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Explorer la collection {activeCategory?.label}</span>
            <ArrowRight size={15} strokeWidth={2} className="text-[#f5dfaa]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
