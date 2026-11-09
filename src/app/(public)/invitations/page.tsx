"use client";

import { mockInvitationModels, defaultClassification } from "@/data/mock/invitations";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ModelCard from "@/components/landing/ModelCard";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { classificationOf, fetchModelDefaults, invalidateModelDefaultsCache, modelCoverOf, modelNameOf, type ModelDefaultRow } from "@/lib/modelDefaults";
import { customModelId, customModelUrl, fetchCustomModels, invalidateCustomModelsCache, type CustomModelRow } from "@/lib/customModels";
import { subscribeToSync } from "@/lib/syncService";
import { previewHref } from "@/lib/modelPreview";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";

/** Titre de rubrique de la galerie : sur-titre doré, titre Playfair, filet. */
function GallerySectionTitle({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <p className="pl-[0.3em] text-[10.5px] font-medium uppercase tracking-[0.3em] text-[#8f6f33]">{eyebrow}</p>
      <h2 className="mt-2 font-serif not-italic text-3xl sm:text-4xl text-[#1d120a]">{title}</h2>
      <DiamondRule className="mt-4" />
      <p className="mt-4 text-sm text-[#3d3126] leading-relaxed">{lead}</p>
    </div>
  );
}

export default function InvitationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  // Initialisation avec la catégorie demandée dans l'URL ou dernièrement consultée
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const fromUrl = sp.get("cat") || sp.get("category");
      if (fromUrl) {
        setSelectedCategory(fromUrl);
        try {
          sessionStorage.setItem("evenium:last_category", fromUrl);
        } catch {}
      } else {
        try {
          const saved = sessionStorage.getItem("evenium:last_category");
          if (saved) setSelectedCategory(saved);
        } catch {}
      }
    }
  }, []);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (typeof window !== "undefined") {
      try {
        if (cat === "Tous") {
          sessionStorage.removeItem("evenium:last_category");
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          sessionStorage.setItem("evenium:last_category", cat);
          window.history.replaceState(null, "", `${window.location.pathname}?cat=${encodeURIComponent(cat)}`);
        }
      } catch {}
    }
  };

  // Classement et présence sur le site choisis par l'admin (studio des modèles)
  const [rows, setRows] = useState<Record<string, ModelDefaultRow>>({});
  // Modèles importés par l'admin (ZIP / HTML) et publiés
  const [customs, setCustoms] = useState<CustomModelRow[]>([]);
  useEffect(() => {
    const supabase = createClient();
    const reload = (force = false) => {
      if (force) {
        invalidateModelDefaultsCache();
        invalidateCustomModelsCache();
      }
      fetchModelDefaults(supabase, force).then(setRows);
      fetchCustomModels(supabase, { publishedOnly: true, force }).then(setCustoms);
    };
    reload();

    const unsubSync = subscribeToSync("models", () => reload(true));

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
      unsubSync();
      supabase.removeChannel(channel);
    };
  }, []);
  const siteModels = mockInvitationModels
    .filter((m) => !rows[m.id]?.is_hidden)
    .map((m) => {
      const c = classificationOf(rows[m.id], defaultClassification(m.id));
      return {
        ...m,
        name: modelNameOf(rows[m.id], m.name),
        thumbnail: modelCoverOf(rows[m.id], m.thumbnail),
        type: c.type,
        category: c.events[0] ?? m.category,
        events: c.events,
      };
    })
    .concat(
      customs.map((m) => ({
        id: customModelId(m.slug),
        name: m.name,
        type: m.invitation_type,
        category: (m.event_types?.[0] ?? "Mariage") as (typeof mockInvitationModels)[number]["category"],
        events: Array.isArray(m.event_types) ? m.event_types : [],
        thumbnail: m.cover_url || "/invit-velours-cover.jpg",
        isPremium: true,
        description: "Création exclusive Evenium, personnalisable de A à Z.",
        liveUrl: customModelUrl(m),
      }))
    );

  const countFor = (catId: string) => {
    if (catId === "Tous") return siteModels.length;
    if (catId === "Vœux") {
      return siteModels.filter((m) => m.type === "voeu" || m.events.includes("Vœux")).length;
    }
    if (catId === "Couple") {
      return siteModels.filter(
        (m) =>
          m.type === "couple" ||
          m.type === "mot_doux" ||
          m.events.includes("Couple") ||
          m.events.includes("Invitations Couple") ||
          m.events.includes("Mots Doux")
      ).length;
    }
    return siteModels.filter((m) => m.events.includes(catId)).length;
  };

  const categoryFilter = (m: (typeof siteModels)[number]) => {
    if (selectedCategory === "Tous") return true;
    if (selectedCategory === "Vœux") {
      return m.type === "voeu" || m.events.includes("Vœux");
    }
    if (selectedCategory === "Couple") {
      return (
        m.type === "couple" ||
        m.type === "mot_doux" ||
        m.events.includes("Couple") ||
        m.events.includes("Invitations Couple") ||
        m.events.includes("Mots Doux")
      );
    }
    return m.events.includes(selectedCategory);
  };

  const animatedModels = siteModels
    .filter((m) => m.type === "animée")
    .filter(categoryFilter);

  const cardModels = siteModels
    .filter((m) => m.type !== "animée")
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

  const categories = [
    { id: "Tous", label: "Tous les modèles", icon: "✨" },
    { id: "Vœux", label: "Vœux d'Exception", icon: "🌟" },
    { id: "Couple", label: "Mots Doux & Couple", icon: "❤️" },
    ...EVENT_TYPES.map((t) => ({
      id: t,
      label: t,
      icon: EVENT_TYPE_ICONS[t] || "🎉",
    })),
  ].map((cat) => {
    const count = countFor(cat.id);
    return {
      ...cat,
      count: count || undefined,
      soon: count === 0,
    };
  });

  return (
    <div className="bg-silk">
    <main className="py-20 sm:py-24 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <Fleuron className="mx-auto w-44 md:w-52 h-auto mb-3" />
        <p className="pl-[0.35em] text-[11px] md:text-xs font-medium tracking-[0.35em] uppercase text-[#8f6f33] mb-4">La collection</p>
        <h1 className="font-serif not-italic text-4xl md:text-6xl mb-2 text-[#1d120a]">
          Modèles d&apos;<span className="italic text-gold-foil">Invitations</span>
        </h1>
        <DiamondRule className="mt-5 mb-6" />
        <p className="text-[#3d3126] max-w-2xl mx-auto font-sans leading-relaxed">
          Faites forte impression avec nos invitations digitales haute couture.
          Touchez n&apos;importe quel modèle pour explorer directement son univers interactif.
        </p>
      </div>

      {/* Barre de sélection de catégorie d'événement */}
      <div className="max-w-4xl mx-auto mb-14">
        <div className="card-lux flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-[0_0_20px_-6px_rgba(233,196,120,0.7)] border border-[#c9a45e]"
                    : "bg-transparent hover:bg-[#f2e4cf]/70 text-gray-700 border border-transparent"
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
        <GallerySectionTitle
          eyebrow={`${selectedCategory === "Tous" ? "Tous les modèles" : selectedCategory} · ${animatedModels.length} ${animatedModels.length > 1 ? "modèles animés" : "modèle animé"}`}
          title={<>Invitations <span className="italic text-gold-foil">Animées</span> &amp; Interactives</>}
          lead="Expériences immersives haute couture : ouverture d'enveloppe au sceau de cire, vidéos cinématiques, mélodies et confirmation de présence instantanée."
        />

        {animatedModels.length > 0 ? (
          <div className={gridClass(animatedModels.length)}>
            {animatedModels.map((model) => (
              <ModelCard
                key={model.id}
                href={previewHref(model, selectedCategory)}
                name={model.name}
                image={model.thumbnail}
                kind="animée"
                eyebrow={`Modèle ${model.category}`}
                description={model.description}
                badge={model.isPremium ? "Signature" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="card-lux relative p-8 sm:p-12 text-center max-w-lg mx-auto">
            <LuxFrame className="inset-2.5" />
            <Fleuron className="mx-auto w-36 h-auto mb-4" />
            <h3 className="font-serif not-italic text-2xl text-[#1d120a] mb-2">Bientôt disponible</h3>
            <p className="text-sm text-[#3d3126] mb-7">
              Les modèles pour la catégorie <strong>{selectedCategory}</strong> sont en cours de création.
            </p>
            <button
              type="button"
              onClick={() => handleSelectCategory("Mariage")}
              className="btn-lux relative px-7 py-3.5 text-[11px]"
            >
              Voir la collection Mariage
            </button>
          </div>
        )}
      </div>

      {/* Cartes, Vœux & Attentions d'Exception */}
      {cardModels.length > 0 && (
        <div className="max-w-6xl mx-auto mb-20">
          <GallerySectionTitle
            eyebrow={`${cardModels.length} ${cardModels.length > 1 ? "créations & cartes" : "création"}`}
            title={<>Cartes, Vœux &amp; <span className="italic text-gold-foil">Attentions</span> d&apos;Exception</>}
            lead="L'élégance intemporelle de la papeterie haute couture, lettres cachetées à la cire, vœux secrets et invitations romantiques."
          />
          <div className={gridClass(cardModels.length)}>
            {cardModels.map((model) => (
              <ModelCard
                key={model.id}
                href={previewHref(model, selectedCategory)}
                name={model.name}
                image={model.thumbnail}
                kind={model.type as any}
                eyebrow={`Modèle ${model.category}`}
                description={model.description}
                badge={model.isPremium ? "Signature" : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA final en bas de la page Galerie */}
      <div className="card-lux max-w-4xl mx-auto mt-16 px-6 py-12 sm:p-14 text-center relative overflow-hidden">
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
