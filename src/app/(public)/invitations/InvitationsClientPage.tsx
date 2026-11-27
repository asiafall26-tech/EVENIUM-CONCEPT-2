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

/** Titre de rubrique de la galerie : sobre, élégant et moderne. */
function GallerySectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead?: string | null }) {
  return (
    <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f6f33] block mb-1">
        {eyebrow}
      </span>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
        {title}
      </h2>
      {lead && <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans">{lead}</p>}
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
    const isExcluded = (idOrSlug: string) => {
      const slug = idOrSlug.replace(/^(custom:|invit-)/, "");
      const cid = customModelId(slug);
      const invId = `invit-${slug}`;
      const r = rows[idOrSlug] || rows[cid] || rows[slug] || rows[invId];
      if (!r) return false;
      return r.is_hidden || isModelDeleted(r);
    };

    const builtIn = mockInvitationModels
      .filter((m) => !isExcluded(m.id))
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
      .filter((m) => m.status === "published" && !isExcluded(m.slug))
      .map((m) => {
        const mockMatch = mockInvitationModels.find((b) => b.id === `invit-${m.slug}` || b.liveUrl?.includes(m.slug));
        return {
          id: customModelId(m.slug),
          name: m.name,
          type: m.invitation_type,
          category: (m.event_types?.[0] ?? mockMatch?.category ?? "Mariage") as (typeof mockInvitationModels)[number]["category"],
          events: Array.isArray(m.event_types) && m.event_types.length > 0 ? m.event_types : (mockMatch?.events || []),
          thumbnail: m.cover_url || mockMatch?.thumbnail || "/invit-velours-cover.jpg",
          isPremium: true,
          description: mockMatch?.description || "Création exclusive Evenium, personnalisable de A à Z.",
          liveUrl: customModelUrl(m),
        };
      });

    const seenSlugs = new Set(imported.map((m) => m.id.replace(/^custom:/, "")));
    const filteredBuiltIn = builtIn.filter((m) => {
      const slug = m.id.replace(/^invit-/, "");
      return !seenSlugs.has(slug);
    });

    return [...imported, ...filteredBuiltIn];
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

  // Responsive grid layout harmonisé et centré selon le nombre de modèles (cartes réduites et compactes)
  const gridClass = (count: number) =>
    count === 1
      ? "grid grid-cols-1 max-w-[180px] mx-auto gap-2.5"
      : count === 2
        ? "grid grid-cols-2 max-w-[360px] mx-auto gap-2 sm:gap-3"
        : count === 3
          ? "grid grid-cols-2 sm:grid-cols-3 max-w-[540px] mx-auto gap-2 sm:gap-3"
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 max-w-6xl mx-auto";

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-neutral-900">
      <main className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* En-tête Collection simple & esthétique */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-neutral-200/90 text-neutral-800 text-[11px] font-semibold tracking-wider uppercase shadow-2xs mb-3">
            <Sparkles size={12} className="text-[#b8924a]" /> Collection Exclusive
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-bold tracking-tight">
            Nos Modèles d&apos;Invitations
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base mt-2.5 leading-relaxed font-sans">
            Touchez un modèle pour explorer son univers immersif, tester les animations et écouter sa musique d&apos;ambiance.
          </p>
        </div>

        {/* 1. Barre des Catégories en pilules sobres */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {filterCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const isEmpty = cat.count === 0 && cat.slug !== "all" && cat.slug !== "tous";
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${isActive
                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                      : "bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                        ? "bg-white/20 text-white"
                        : isEmpty
                          ? "bg-neutral-100 text-neutral-400 font-normal"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                  >
                    {isEmpty ? "Bientôt" : cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Contrôles secondaires : Recherche & Sous-filtres */}
        <div className="max-w-5xl mx-auto mb-10 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Formats : uniquement si Invitations ou Tous */}
            {(selectedCategory === "invitations" || selectedCategory === "evenementielles" || selectedCategory === "tous") ? (
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full w-full sm:w-auto shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${selectedFormat === "all"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                    }`}
                >
                  Tous ({formatCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("animée")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${selectedFormat === "animée"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                    }`}
                >
                  <span>🎬 3D Animée</span>
                  <span className="text-[10px] opacity-75">({formatCounts.animee})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("statique")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${selectedFormat === "statique"
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                    }`}
                >
                  <span>📜 Haute Couture</span>
                  <span className="text-[10px] opacity-75">({formatCounts.statique})</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <span className="text-xs text-[#8f6f33] font-semibold flex items-center gap-1">
                  <Sparkles size={13} /> {activeCategoryInfo.label}
                </span>
              </div>
            )}

            {/* Champ de recherche rapide */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200/90 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Événements disponibles (si applicable) */}
          {availableEvents.list.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth justify-start sm:justify-center flex-nowrap sm:flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedEvent("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedEvent === "all" || selectedEvent === "Tous"
                    ? "bg-neutral-800 text-[#f5dfaa] font-semibold"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                  }`}
              >
                Tous ({availableEvents.total})
              </button>

              {availableEvents.list.map((evt) => {
                const isSelected = selectedEvent.toLowerCase() === evt.name.toLowerCase();
                return (
                  <button
                    key={evt.name}
                    type="button"
                    onClick={() => setSelectedEvent(isSelected ? "all" : evt.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${isSelected
                        ? "bg-neutral-800 text-[#f5dfaa] font-semibold"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                      }`}
                  >
                    <span>{evt.icon}</span>
                    <span>{evt.name}</span>
                    <span className="text-[10px] opacity-75 font-bold">
                      {evt.count}
                    </span>
                    {isSelected && (
                      <X size={11} className="ml-0.5 text-[#f5dfaa]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Filtre actif indicator */}
          {(selectedEvent !== "all" || searchQuery || selectedFormat !== "all") && (
            <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in duration-200 text-xs text-[#8f6f33]">
              <span>
                Filtre : <strong className="text-neutral-900">{selectedEvent !== "all" ? selectedEvent : ""}{searchQuery ? ` « ${searchQuery} »` : ""}</strong> · {filteredModels.length} modèle{filteredModels.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedEvent("all");
                  setSelectedFormat("all");
                  setSearchQuery("");
                }}
                className="text-[11px] font-bold text-[#8f6f33] hover:text-neutral-900 underline cursor-pointer flex items-center gap-1 ml-1"
              >
                <RotateCcw size={11} /> Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Titre de la section filtrée */}
        <div className="max-w-7xl mx-auto mb-10">
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
                  compact
                  sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
              <p className="text-3xl mb-3">✨</p>
              <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2">Collection en renouvellement</h3>
              <p className="text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed">
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
                className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Voir tous les modèles ({siteModels.length})
              </button>
            </div>
          )}
        </div>

        {/* CTA final simple et esthétique */}
        <div className="max-w-3xl mx-auto mt-16 sm:mt-20 p-8 sm:p-12 text-center bg-white rounded-3xl border border-neutral-200/90 shadow-sm">
          <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold mb-3 tracking-tight">
            Vous avez trouvé votre inspiration ?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto mb-7 leading-relaxed">
            Créez votre événement en quelques minutes, personnalisez vos textes en direct et commencez à inviter vos proches.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/create"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-[#f5dfaa] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Personnaliser mon invitation</span>
              <ArrowRight size={15} className="text-[#f5dfaa]" />
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors py-2 px-4"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
