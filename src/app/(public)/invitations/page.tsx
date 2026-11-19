"use client";

import { mockInvitationModels, defaultClassification } from "@/data/mock/invitations";
import { ArrowRight, Sparkles } from "lucide-react";
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
  type ServiceCategory,
  FALLBACK_CATEGORIES,
} from "@/lib/serviceCategories";

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

  export default function InvitationsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("tous");
    const [categories, setCategories] = useState<ServiceCategory[]>(FALLBACK_CATEGORIES);
    const [rows, setRows] = useState<Record<string, ModelDefaultRow>>({});
    const [customs, setCustoms] = useState<CustomModelRow[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Initialisation avec la catégorie demandée dans l'URL ou dernièrement consultée
    useEffect(() => {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const fromUrl = sp.get("cat") || sp.get("category");
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

            reload();

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

            // Modèles disponibles sur le site
            const siteModels = useMemo(() => {
              const builtIn = mockInvitationModels
                .filter((m) => !rows[m.id]?.is_hidden)
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

              const imported = customs.map((m) => ({
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

        // Modèles filtrés selon la catégorie active
        const filteredModels = useMemo(() => {
          if (selectedCategory === "tous" || selectedCategory === "all") {
            return siteModels;
          }
        return siteModels.filter((m) => modelMatchesCategory(m, selectedCategory));
      }, [siteModels, selectedCategory]);

          const activeCategoryInfo = useMemo(() => {
            if (selectedCategory === "tous" || selectedCategory === "all") {
              return {
                label: "Tous les modèles",
                description: "Explorez l'intégralité de nos invitations digitales, vœux et lettres d'amour haute couture.",
                count: siteModels.length,
              };
            }
          const match = categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
          return {
            label: match ? match.label : "Collection",
            description: match?.description || "Créations exclusives Evenium.",
            count: filteredModels.length,
          };
        }, [selectedCategory, categories, siteModels.length, filteredModels.length]);

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
              <div className="bg-[#faf3e8] min-h-screen">
                <main className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                  {/* En-tête Collection */}
                  <div className="text-center mb-10 sm:mb-14">
                    <Fleuron className="mx-auto w-44 md:w-52 h-auto mb-3" />
                    <p className="pl-[0.35em] text-[11px] md:text-xs font-medium tracking-[0.35em] uppercase text-[#8f6f33] mb-3">
                      La collection Evenium
                    </p>
                    <h1 className="font-serif not-italic text-3xl sm:text-5xl md:text-6xl mb-3 text-[#1d120a]">
                      Nos <span className="italic text-gold-foil">Créations</span> &amp; Modèles
                    </h1>
                    <DiamondRule className="mt-4 mb-5" />
                    <p className="text-[#3d3126] max-w-2xl mx-auto font-sans text-sm sm:text-base leading-relaxed">
                      Faites sensation avec nos invitations digitales interactives. Touchez n&apos;importe quel modèle pour explorer son univers immersif et tester les fonctionnalités.
                    </p>
                  </div>

                                {/* Barre de sélection dynamique des catégories (sans prix affichés) */}
                                <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
                                  <div className="bg-white/90 border border-[#b8924a]/35 rounded-2xl sm:rounded-full p-2 flex flex-wrap items-center justify-center gap-2 shadow-sm">
                                    {filterCategories.map((cat) => {
                                      const isActive = selectedCategory === cat.slug;
                                      return (
                                        <button
                                          key={cat.slug}
                                          type="button"
                                          onClick={() => handleSelectCategory(cat.slug)}
                                          className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${isActive
                                              ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-[0_0_20px_-6px_rgba(233,196,120,0.7)] border border-[#c9a45e]"
                                              : "bg-transparent hover:bg-[#f2e4cf]/60 text-gray-700 border border-transparent"
                                            }`}
                                        >
                                          <span>{cat.icon}</span>
                                          <span>{cat.label}</span>
                                          <span
                                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isActive
                                                ? "bg-[#b8924a]/30 text-[#f0d999]"
                                                : "bg-gray-100 text-gray-600"
                                              }`}
                                          >
                                            {cat.count}
                                          </span>
                                  </button>
                                  );
            })}
                                </div>
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
                                      onClick={() => handleSelectCategory("tous")}
                                      className="btn-lux relative px-7 py-3 text-xs flex items-center gap-2 mx-auto cursor-pointer"
                                    >
                                      <Sparkles size={14} className="text-[#f0d999]" />
                                      <span>Voir tous les modèles ({siteModels.length})</span>
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
