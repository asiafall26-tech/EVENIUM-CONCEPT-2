"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ModelCard from "@/components/landing/ModelCard";
import { ArrowRight, Sparkles, Heart, Calendar, Crown } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import type { InvitationModel } from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/client";
import { fetchModelDefaults, invalidateModelDefaultsCache } from "@/lib/modelDefaults";
import { fetchCustomModels, invalidateCustomModelsCache } from "@/lib/customModels";
import { buildShowcase } from "@/lib/showcase";
import { previewHref } from "@/lib/modelPreview";
import { subscribeToSync } from "@/lib/syncService";

interface HomeShowcaseProps {
  initialModels: InvitationModel[];
}

export default function HomeShowcase({ initialModels }: HomeShowcaseProps) {
  const [showcaseModels, setShowcaseModels] = useState<InvitationModel[]>(initialModels);
  // Les 3 services clairement séparés pour ne pas les mélanger
  const [selectedService, setSelectedService] = useState<"invitations" | "voeux" | "couple">("invitations");

  useEffect(() => {
    const supabase = createClient();

    const reload = async (force = false) => {
      try {
        if (force) {
          invalidateModelDefaultsCache();
          invalidateCustomModelsCache();
        }
        // Modèles Evenium (nom, couverture, retrait) et modèles importés publiés
        const [rows, customs] = await Promise.all([
          fetchModelDefaults(supabase, force),
          fetchCustomModels(supabase, { publishedOnly: true, force }),
        ]);
        const ordered = buildShowcase(rows, customs);
        setShowcaseModels(ordered);
      } catch (err) {
        console.error("Erreur lors de l'actualisation des modèles vitrine :", err);
      }
    };

    // Chargement immédiat côté client pour avoir l'état le plus frais
    reload();

    const unsubSync = subscribeToSync("models", () => reload(true));

    // Abonnement Supabase Realtime pour actualisation automatique instantanée
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
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrage strict par service pour ne pas mélanger les univers
  const displayedModels = useMemo(() => {
    if (selectedService === "voeux") {
      const list = showcaseModels.filter(
        (m) =>
          m.category === "Vœux" ||
          m.type === "voeu" ||
          m.name.toLowerCase().includes("vœu") ||
          m.name.toLowerCase().includes("voeu") ||
          m.name.toLowerCase().includes("birthday")
      );
      return list.length > 0 ? list : showcaseModels.slice(0, 4);
    }
    if (selectedService === "couple") {
      const list = showcaseModels.filter(
        (m) =>
          m.category === "Couple" ||
          m.type === "couple" ||
          m.type === "mot_doux" ||
          m.name.toLowerCase().includes("mot") ||
          m.name.toLowerCase().includes("rendez") ||
          m.name.toLowerCase().includes("amour") ||
          m.name.toLowerCase().includes("princesse")
      );
      return list.length > 0 ? list : showcaseModels.slice(0, 4);
    }
    // "invitations" : Grands événements (Mariages, Anniversaires, Galas) - exclut vœux et couple
    const list = showcaseModels.filter(
      (m) =>
        m.category !== "Vœux" &&
        m.category !== "Couple" &&
        m.type !== "voeu" &&
        m.type !== "mot_doux" &&
        m.type !== "couple"
    );
    return list.length > 0 ? list : showcaseModels.slice(0, 4);
  }, [showcaseModels, selectedService]);

  const serviceMeta = {
    invitations: {
      badge: "Grands Événements",
      title: "Modèles d'Invitation & Réceptions",
      lead: "Faire-part digitaux haute couture pour mariages, anniversaires, baptêmes et galas d'envergure. Dès 5 000 FCFA avec tableau de bord et gestion RSVP.",
      cta: "Explorer tous les modèles d'invitation",
      href: "/invitations",
    },
    voeux: {
      badge: "Célébration Personnelle",
      title: "Vœux d'Exception",
      lead: "Cartes interactives étincelantes avec musique festive et animation pour faire éclore les émotions. Tarif direct : 2 000 FCFA avec lien copiable immédiat.",
      cta: "Découvrir les Vœux d'Exception (2 000 F)",
      href: "/voeux",
    },
    couple: {
      badge: "Écrin Privé des Amoureux",
      title: "Les Mots Doux & Invitations Couple",
      lead: "Lettres d'amour numériques scellées au cachet de cire (1 000 FCFA) et cartons secrets en tête-à-tête (4 000 FCFA). Partage confidentiel en 1 clic.",
      cta: "Découvrir les Mots Doux & Couples",
      href: "/mots-doux",
    },
  }[selectedService];

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f2e4cf] via-[#f8efe2] to-[#fbf6ee]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="La collection Evenium"
          title={
            <>
              Trois univers d&apos;exception,{" "}
              <span className="italic text-gold-foil">chacun à sa juste valeur</span>
            </>
          }
          lead="Faites votre choix parmi nos 3 services distincts : invitations de grands événements, vœux chaleureux ou déclarations romantiques."
          className="mb-8 md:mb-12"
        />

        {/* Sélecteur des 3 Services Distincts (Ne pas mélanger) */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/90 border border-[#b8924a]/35 p-1.5 rounded-2xl sm:rounded-full inline-flex flex-col sm:flex-row gap-1 shadow-sm max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedService("invitations")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedService === "invitations"
                  ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Calendar size={14} className="text-[#d4af37]" />
              <span>1. Modèles d&apos;Invitation</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService("voeux")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedService === "voeux"
                  ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Sparkles size={14} className="text-[#d4af37]" />
              <span>2. Vœux d&apos;Exception (2 000 F)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService("couple")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                selectedService === "couple"
                  ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Heart size={14} className="text-[#e63946]" />
              <span>3. Mots Doux (1 000 F) &amp; Couple (4 000 F)</span>
            </button>
          </div>
        </div>

        {/* Bandeau d'information sur le service sélectionné */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2 animate-in fade-in duration-300">
          <span className="inline-block px-3 py-1 rounded-full bg-[#fbf7f0] border border-[#b8924a]/30 text-[#8f6f33] text-[10px] font-bold uppercase tracking-widest">
            {serviceMeta.badge}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {serviceMeta.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            {serviceMeta.lead}
          </p>
        </div>

        {displayedModels.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-serif text-lg text-gray-700 mb-2">Notre collection se renouvelle.</p>
            <p className="text-sm">De nouveaux modèles exclusifs seront bientôt disponibles.</p>
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
                href={previewHref(model, selectedService === "voeux" ? "Vœux" : selectedService === "couple" ? "Couple" : model.category)}
                name={model.name}
                image={model.thumbnail}
                kind={model.type}
                eyebrow={
                  selectedService === "voeux"
                    ? "Vœu · 2 000 FCFA"
                    : selectedService === "couple"
                    ? model.type === "mot_doux" ? "Mot Doux · 1 000 FCFA" : "Couple · 4 000 FCFA"
                    : `Collection ${model.category}`
                }
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
            href={serviceMeta.href}
            className="btn-lux group px-8 py-4 text-xs sm:text-[13px] inline-flex items-center gap-2"
          >
            <span>{serviceMeta.cta}</span>
            <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
