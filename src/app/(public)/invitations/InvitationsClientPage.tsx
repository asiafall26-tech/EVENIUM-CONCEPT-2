"use client";

import { mockInvitationModels, defaultClassification } from "@/data/mock/invitations";
import { ArrowRight, Sparkles, Search, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import ModelCard from "@/components/landing/ModelCard";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  classificationOf,
  fetchModelDefaults,
  invalidateModelDefaultsCache,
  modelCoverOf,
  modelNameOf,
  isModelDeleted,
  type ModelDefaultRow,
} from "@/lib/modelDefaults";
import {
  customModelId,
  customModelUrl,
  fetchCustomModels,
  invalidateCustomModelsCache,
  type CustomModelRow,
} from "@/lib/customModels";
import { subscribeToSync } from "@/lib/syncService";
import { previewHref } from "@/lib/modelPreview";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";
import {
  fetchServiceCategories,
  modelMatchesCategory,
  modelMatchesFormat,
  modelMatchesEvent,
  type InvitationFormatFilter,
  type ServiceCategory,
  FALLBACK_CATEGORIES,
} from "@/lib/serviceCategories";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";

/** Titre de rubrique de la galerie : sur-titre doré, titre Playfair, filet. */
function GallerySectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead?: string | null }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <p className="pl-[0.3em] text-[10.5px] font-medium uppercase tracking-[0.3em] text-[#8f6f33]">{eyebrow}</p>
      <h2 className="mt-2 font-serif not-italic text-3xl sm:text-4xl text-[#1d120a]">{title}</h2>
      <DiamondRule className="mt-4" />
      {lead && <p className="mt-4 text-sm text-[#3d3126] leading-relaxed">{lead}</p>}
    </div>
  );
}

interface InvitationsClientPageProps {
  initialRows?: Record<string, ModelDefaultRow>;
  initialCustoms?: CustomModelRow[];
  initialCategories?: ServiceCategory[];
}

export default function InvitationsClientPage({
  initialRows = {},
  initialCustoms = [],
  initialCategories = FALLBACK_CATEGORIES,
}: InvitationsClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("tous");
  const [selectedFormat, setSelectedFormat] = useState<InvitationFormatFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [rows, setRows] = useState<Record<string, ModelDefaultRow>>(initialRows);
  const [customs, setCustoms] = useState<CustomModelRow[]>(initialCustoms);
  const [, setLoaded] = useState(true);

  // Initialisation avec la catégorie et l'événement demandés dans l'URL ou dernièrement consultés
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const fromUrl = sp.get("cat") || sp.get("category");
      const fromEvent = sp.get("event") || sp.get("evt");
      if (fromEvent) {
        setSelectedEvent(fromEvent);
      }
      if (fromUrl) {
        const normalized = fromUrl.toLowerCase();
        setSelectedCategory(normalized);
        try {
          sessionStorage.setItem("evenium:last_category", normalized);
        } catch { }
      } else {
        try {
          const saved = sessionStorage.getItem("evenium:last_category");
          if (saved) setSelectedCategory(saved.toLowerCase());
        } catch { }
      }
    }
  }, []);

  const handleSelectCategory = (catSlug: string) => {
    const slug = catSlug.toLowerCase();
    setSelectedCategory(slug);
    setSelectedFormat("all");
    setSelectedEvent("all");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      try {
        if (slug === "tous" || slug === "all") {
          sessionStorage.removeItem("evenium:last_category");
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          sessionStorage.setItem("evenium:last_category", slug);
          window.history.replaceState(null, "", `${window.location.pathname}?cat=${encodeURIComponent(slug)}`);
        }
      } catch { }
    }
  };

  // Chargement et synchronisation temps réel des modèles et des catégories
  useEffect(() => {
    const supabase = createClient();
    const reload = async (force = false) => {
      if (force) {
        invalidateModelDefaultsCache();
        invalidateCustomModelsCache();
      }
      try {
        const [modelRows, customRows, serviceCats] = await Promise.all([
          fetchModelDefaults(supabase, force),
          fetchCustomModels(supabase, { publishedOnly: true, force }),
          fetchServiceCategories(supabase, force),
        ]);
        setRows(modelRows);
        setCustoms(customRows);
        if (serviceCats && serviceCats.length > 0) {
          setCategories(serviceCats);
        }
      } finally {
        setLoaded(true);
      }
    };

    const unsubSyncModels = subscribeToSync("models", () => reload(true));
    const unsubSyncCats = subscribeToSync("categories", () => reload(true));

    const channel = supabase
      .channel("invitations_gallery_realtime")
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
      unsubSyncModels();
      unsubSyncCats();
      supabase.removeChannel(channel);
    };
  }, []);

  // Modèles disponibles sur le site : les modèles retirés par l'admin sont rigoureusement exclus
  const siteModels = useMemo(() => {
    const builtIn = mockInvitationModels
      .filter((m) => !rows[m.id]?.is_hidden && !isModelDeleted(rows[m.id]))
      .map((m) => {
        const c = classificationOf(rows[m.id], defaultClassification(m.id));
        return {
          ...m,
          name: modelNameOf(rows[m.id], m.name),
          thumbnail: modelCoverOf(rows[m.id], m.thumbnail),
          type: c.type,
          category: (c.events[0] ?? m.category) as (typeof mockInvitationModels)[number]["category"],
          events: c.events,
        };
      });

    const imported = customs
      .filter((m) => m.status === "published" && !rows[customModelId(m.slug)]?.is_hidden && !rows[m.slug]?.is_hidden)
      .map((m) => ({
        id: customModelId(m.slug),
        name: m.name,
        type: m.invitation_type,
        category: (m.event_types?.[0] ?? "Mariage") as (typeof mockInvitationModels)[number]["category"],
        events: Array.isArray(m.event_types) ? m.event_types : [],
        thumbnail: m.cover_url || "/invit-velours-cover.jpg",
        isPremium: true,
        description: "Création exclusive Evenium, personnalisable de A à Z.",
        liveUrl: customModelUrl(m),
      }));

    return [...imported, ...builtIn];
  }, [rows, customs]);

  // Liste complète des catégories de filtrage (Tous les modèles + catégories dynamiques)
  const filterCategories = useMemo(() => {
    const allPill = {
      id: "all",
      slug: "tous",
      label: "Tous les modèles",
      icon: "✨",
      count: siteModels.length,
      price_fcfa: null,
    };

    const dynamicPills = categories.map((cat) => {
      const count = siteModels.filter((m) => modelMatchesCategory(m, cat.slug)).length;
      return {
        id: cat.id || cat.slug,
        slug: cat.slug,
        label: cat.label,
        icon: cat.icon || "📜",
        count,
        price_fcfa: cat.price_fcfa,
      };
    });

    return [allPill, ...dynamicPills];
  }, [categories, siteModels]);

  // Compteurs de formats pour Invitations événementielles (animée vs statique)
  const formatCounts = useMemo(() => {
    const base = siteModels.filter((m) => modelMatchesCategory(m, "invitations"));
    return {
      all: base.length,
      animee: base.filter((m) => modelMatchesFormat(m, "animée")).length,
      statique: base.filter((m) => modelMatchesFormat(m, "statique")).length,
    };
  }, [siteModels]);

  // Événements réellement disponibles pour la sélection active (compteur > 0 uniquement !)
  const availableEvents = useMemo(() => {
    const base = siteModels.filter((m) => {
      if (selectedCategory !== "tous" && selectedCategory !== "all" && !modelMatchesCategory(m, selectedCategory)) {
        return false;
      }
      if (selectedCategory === "invitations" || selectedCategory === "evenementielles") {
        return modelMatchesFormat(m, selectedFormat);
      }
      return true;
    });

    const counts: Record<string, number> = {};
    for (const evt of EVENT_TYPES) {
      const c = base.filter((m) => modelMatchesEvent(m, evt)).length;
      if (c > 0) {
        counts[evt] = c;
      }
    }

    const list = Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
      icon: EVENT_TYPE_ICONS[name as keyof typeof EVENT_TYPE_ICONS] || "🎉",
    }));

    // Respect de l'ordre officiel de présentation
    list.sort((a, b) => {
      const idxA = (EVENT_TYPES as readonly string[]).indexOf(a.name as any);
      const idxB = (EVENT_TYPES as readonly string[]).indexOf(b.name as any);
      return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
    });

    return { list, total: base.length };
  }, [siteModels, selectedCategory, selectedFormat]);

  // Réinitialiser automatiquement le filtre d'événement s'il n'est plus pertinent pour la nouvelle catégorie
  useEffect(() => {
    if (selectedEvent !== "all" && selectedEvent !== "Tous" && selectedEvent !== "tous") {
      const exists = availableEvents.list.some(
        (e) => e.name.toLowerCase() === selectedEvent.toLowerCase()
      );
      if (!exists) {
        setSelectedEvent("all");
      }
    }
  }, [availableEvents, selectedEvent]);

  // Modèles filtrés selon la catégorie active, le format, l'événement et la recherche en temps réel
  const filteredModels = useMemo(() => {
    let list = siteModels;
    if (selectedCategory !== "tous" && selectedCategory !== "all") {
      list = list.filter((m) => modelMatchesCategory(m, selectedCategory));
    }
    if (selectedCategory === "invitations" || selectedCategory === "evenementielles") {
      list = list.filter((m) => modelMatchesFormat(m, selectedFormat));
    }
    if (selectedEvent !== "all" && selectedEvent !== "Tous" && selectedEvent !== "tous") {
      list = list.filter((m) => modelMatchesEvent(m, selectedEvent));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.category || "").toLowerCase().includes(q) ||
        (m.events || []).some((e) => e.toLowerCase().includes(q))
      );
    }
    return list;
  }, [siteModels, selectedCategory, selectedFormat, selectedEvent, searchQuery]);

  const activeCategoryInfo = useMemo(() => {
    const eventSuffix = selectedEvent !== "all" && selectedEvent !== "Tous" ? ` · ${selectedEvent}` : "";
    const searchSuffix = searchQuery.trim() ? ` · « ${searchQuery.trim()} »` : "";
    if (selectedCategory === "tous" || selectedCategory === "all") {
      return {
        label: `Tous les modèles${eventSuffix}${searchSuffix}`,
        description: selectedEvent !== "all" && selectedEvent !== "Tous"
          ? `Explorez nos modèles d'exception adaptés pour : ${selectedEvent}.`
          : "Explorez l'intégralité de nos invitations digitales, vœux et lettres d'amour haute couture.",
        count: filteredModels.length,
      };
    }
    const match = categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
    return {
      label: `${match ? match.label : "Collection"}${eventSuffix}${searchSuffix}`,
      description: selectedEvent !== "all" && selectedEvent !== "Tous"
        ? `Découvrez nos créations dédiées à votre événement : ${selectedEvent}.`
        : (match?.description || "Créations exclusives Evenium."),
      count: filteredModels.length,
    };
  }, [selectedCategory, selectedEvent, searchQuery, categories, filteredModels.length]);

  // Responsive grid layout harmonisé et centré selon le nombre de modèles
  const gridClass = (count: number) =>
    count === 1
      ? "grid grid-cols-1 max-w-sm mx-auto gap-8 sm:gap-10"
      : count === 2
        ? "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-8 sm:gap-10"
        : count === 3
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-8"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8";

  return (
    <div className="bg-[#faf3e8] min-h-screen">
      <main className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* En-tête Collection */}
        <div className="text-center mb-8 sm:mb-12">
          <Fleuron className="mx-auto w-40 md:w-48 h-auto mb-3" />
          <p className="pl-[0.35em] text-[10.5px] md:text-xs font-semibold tracking-[0.35em] uppercase text-[#8f6f33] mb-2.5">
            La collection exclusive
          </p>
          <h1 className="font-serif not-italic text-3xl sm:text-5xl md:text-6xl mb-3 text-[#1d120a] tracking-tight">
            Nos <span className="italic text-gold-foil">Créations</span> &amp; Modèles
          </h1>
          <DiamondRule className="mt-3 mb-4" />
          <p className="text-[#3d3126] max-w-2xl mx-auto font-sans text-sm sm:text-base leading-relaxed">
            Faites sensation avec nos invitations digitales interactives. Touchez n&apos;importe quel modèle pour explorer son univers immersif et tester les fonctionnalités.
          </p>
        </div>

        {/* 1. Barre des 4 Services (+ Tous les modèles) — Design Prestige */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-10">
          <div className="bg-white/90 backdrop-blur-md border border-[#c9a45e]/35 rounded-2xl sm:rounded-full p-1.5 sm:p-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 shadow-[0_4px_24px_-6px_rgba(43,33,24,0.08)]">
            {filterCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const isEmpty = cat.count === 0 && cat.slug !== "all" && cat.slug !== "tous";
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-b from-[#2e1d12] via-[#1f130b] to-[#120a06] text-[#f5dfaa] shadow-[0_4px_16px_-2px_rgba(201,164,94,0.4)] border border-[#c9a45e]"
                      : "bg-transparent hover:bg-[#f6ebd9]/80 text-[#3d3126] border border-transparent"
                  }`}
                >
                  <span className="text-base sm:text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-[#c9a45e]/30 text-[#fcf4e3]"
                        : isEmpty
                        ? "bg-[#efe5d4] text-[#8c7864] font-normal"
                        : "bg-black/5 text-[#544638]"
                    }`}
                  >
                    {isEmpty ? "Bientôt" : cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Barre de Contrôle Contextuelle (Format, Recherche, Événements Disponibles) */}
        <div className="max-w-5xl mx-auto mb-10 sm:mb-12 space-y-3.5">
          {/* Rangée supérieure : Sélecteur de formats + Recherche rapide */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 backdrop-blur-sm border border-[#c9a45e]/25 rounded-2xl p-2 sm:p-2.5 shadow-2xs">
            {/* Formats : uniquement si Invitations ou Tous */}
            {(selectedCategory === "invitations" || selectedCategory === "evenementielles" || selectedCategory === "tous") ? (
              <div className="flex items-center gap-1 bg-[#f5eee1] p-1 rounded-xl w-full sm:w-auto shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFormat === "all"
                      ? "bg-[#2b2118] text-[#f5eee1] shadow-2xs"
                      : "text-[#6e6255] hover:text-[#2b2118]"
                  }`}
                >
                  Tous les formats ({formatCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("animée")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedFormat === "animée"
                      ? "bg-[#2b2118] text-[#f5eee1] shadow-2xs"
                      : "text-[#6e6255] hover:text-[#2b2118]"
                  }`}
                >
                  <span>🎬 Animée</span>
                  <span className="text-[10px] opacity-80">({formatCounts.animee})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("statique")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedFormat === "statique"
                      ? "bg-[#2b2118] text-[#f5eee1] shadow-2xs"
                      : "text-[#6e6255] hover:text-[#2b2118]"
                  }`}
                >
                  <span>📜 Statique</span>
                  <span className="text-[10px] opacity-80">({formatCounts.statique})</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <span className="text-xs text-[#8f6f33] font-semibold flex items-center gap-1">
                  <Sparkles size={13} /> {activeCategoryInfo.label}
                </span>
              </div>
            )}

            {/* Champ de recherche rapide */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8f6f33]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle, univers..."
                className="w-full pl-9 pr-8 py-2 bg-white/90 border border-[#c9a45e]/30 rounded-xl text-xs text-[#2b2118] placeholder-[#948473] focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Rangée inférieure : Événements réellement disponibles (compte > 0 uniquement) */}
          {availableEvents.list.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth justify-start sm:justify-center flex-nowrap sm:flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedEvent("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedEvent === "all" || selectedEvent === "Tous"
                    ? "bg-gradient-to-b from-[#2e1d12] to-[#120a06] text-[#f5dfaa] shadow-xs border border-[#c9a45e]"
                    : "bg-white/80 border border-[#c9a45e]/25 text-[#3d3126] hover:border-[#b8924a] hover:bg-white"
                }`}
              >
                <span>Tous les événements</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedEvent === "all" || selectedEvent === "Tous" ? "bg-white/20 text-[#f5dfaa]" : "bg-[#f5eee1] text-[#6e6255]"
                }`}>
                  {availableEvents.total}
                </span>
              </button>

              {availableEvents.list.map((evt) => {
                const isSelected = selectedEvent.toLowerCase() === evt.name.toLowerCase();
                return (
                  <button
                    key={evt.name}
                    type="button"
                    onClick={() => setSelectedEvent(isSelected ? "all" : evt.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-b from-[#2e1d12] to-[#120a06] text-[#f5dfaa] shadow-xs border border-[#c9a45e]"
                        : "bg-white/85 border border-[#c9a45e]/25 text-[#3d3126] hover:border-[#b8924a] hover:bg-[#fbf7f0]"
                    }`}
                  >
                    <span>{evt.icon}</span>
                    <span>{evt.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-[#f5dfaa]"
                          : "bg-[#f3e7d3] text-[#785b28]"
                      }`}
                    >
                      {evt.count}
                    </span>
                    {isSelected && (
                      <X size={12} className="ml-0.5 text-[#f5dfaa] hover:opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Puce d'information si un sous-filtre ou une recherche est actif */}
          {(selectedEvent !== "all" || searchQuery || selectedFormat !== "all") && (
            <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in duration-200">
              <span className="text-xs text-[#8f6f33]">
                Filtre actif :{" "}
                <strong className="text-[#2b2118]">
                  {selectedEvent !== "all" ? selectedEvent : ""}
                  {selectedEvent !== "all" && selectedFormat !== "all" ? " · " : ""}
                  {selectedFormat !== "all" ? (selectedFormat === "animée" ? "Format animé" : "Format statique") : ""}
                  {searchQuery ? ` « ${searchQuery} »` : ""}
                </strong>
                {" "}· {filteredModels.length} {filteredModels.length > 1 ? "créations" : "création"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedEvent("all");
                  setSelectedFormat("all");
                  setSearchQuery("");
                }}
                className="text-[11px] font-bold text-[#8f6f33] hover:text-[#2b2118] underline cursor-pointer flex items-center gap-1 ml-1"
              >
                <RotateCcw size={11} /> Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Titre de la section filtrée */}
        <div className="max-w-6xl mx-auto mb-12">
          <GallerySectionTitle
            eyebrow={`${activeCategoryInfo.count} ${activeCategoryInfo.count > 1 ? "modèles disponibles" : "modèle disponible"}`}
            title={<>{activeCategoryInfo.label}</>}
            lead={activeCategoryInfo.description}
          />

          {/* Grille des modèles filtrés */}
          {filteredModels.length > 0 ? (
            <div className={gridClass(filteredModels.length)}>
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  href={previewHref(model, selectedCategory)}
                  name={model.name}
                  image={model.thumbnail}
                  kind={model.type as any}
                  eyebrow={model.category ? `Modèle ${model.category}` : "Création Haute Couture"}
                  description={model.description}
                  badge={model.isPremium ? "Signature" : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="card-lux relative p-8 sm:p-12 text-center max-w-lg mx-auto bg-white/80 rounded-3xl border border-[#c9a45e]/30 shadow-md">
              <LuxFrame className="inset-2.5" />
              <Fleuron className="mx-auto w-36 h-auto mb-4" />
              <h3 className="font-serif not-italic text-2xl text-[#1d120a] mb-2">Collection en renouvellement</h3>
              <p className="text-sm text-[#3d3126] mb-6">
                Aucun modèle n&apos;est actuellement visible dans la catégorie <strong>{activeCategoryInfo.label}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("tous");
                  setSelectedEvent("all");
                  setSelectedFormat("all");
                  setSearchQuery("");
                }}
                className="btn-lux relative px-7 py-3 text-xs flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles size={14} className="text-[#f0d999]" />
                <span>Réinitialiser les filtres ({siteModels.length} modèles)</span>
              </button>
            </div>
          )}
        </div>

        {/* CTA final en bas de page pour créer son événement */}
        <div className="card-lux max-w-4xl mx-auto mt-20 px-6 py-12 sm:p-14 text-center relative overflow-hidden bg-white/70 rounded-3xl border border-[#c9a45e]/35 shadow-lg">
          <LuxFrame className="inset-3" />
          <div className="relative z-10">
            <Fleuron className="mx-auto w-40 h-auto mb-4" />
            <h2 className="font-serif not-italic text-3xl sm:text-4xl text-[#1d120a] mb-3">
              Vous avez trouvé l&apos;<span className="italic text-gold-foil">inspiration</span> ?
            </h2>
            <p className="text-sm text-[#3d3126] max-w-xl mx-auto mb-8 leading-relaxed">
              Créez votre événement en quelques minutes, configurez votre invitation d&apos;exception et commencez à inviter vos proches sans attendre.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
              <Link href="/create" className="btn-lux group px-8 py-4 text-xs sm:text-[13px]">
                Créer mon événement
                <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/" className="link-lux text-xs">
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
