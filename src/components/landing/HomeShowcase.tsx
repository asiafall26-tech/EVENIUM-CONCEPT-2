"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModelCard from "@/components/landing/ModelCard";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import type { InvitationModel } from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/client";
import { fetchModelDefaults, invalidateModelDefaultsCache } from "@/lib/modelDefaults";
import { fetchCustomModels, invalidateCustomModelsCache } from "@/lib/customModels";
import { buildShowcase } from "@/lib/showcase";
import { previewHref } from "@/lib/modelPreview";

interface HomeShowcaseProps {
  initialModels: InvitationModel[];
}

export default function HomeShowcase({ initialModels }: HomeShowcaseProps) {
  const [showcaseModels, setShowcaseModels] = useState<InvitationModel[]>(initialModels);

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

    // Abonnement Supabase Realtime pour actualisation automatique instantanée (modèles built-in ET modèles importés du studio)
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

    const handleFocus = () => reload(true);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return (
    <section className="py-24 md:py-28 px-6 lg:px-8 bg-gradient-to-b from-[#f2e4cf] via-[#f8efe2] to-[#fbf6ee]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="La collection"
          title={
            <>
              Des invitations qui{" "}
              <span className="italic text-gold-foil">marquent les esprits</span>
            </>
          }
          lead="Découvrez un aperçu de notre collection. Des designs exclusifs pour annoncer la couleur de votre événement."
          className="mb-14"
        />

        {showcaseModels.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="font-serif text-lg text-gray-700 mb-2">Notre collection se renouvelle.</p>
            <p className="text-sm">De nouveaux modèles exclusifs seront bientôt disponibles.</p>
          </div>
        ) : (
          <Reveal
            className={
              showcaseModels.length >= 4
                ? "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
                : "flex flex-wrap justify-center gap-4 md:gap-6 mb-12 md:mb-16"
            }
          >
            {showcaseModels.map((model, i) => (
              <ModelCard
                key={model.id}
                href={previewHref(model)}
                name={model.name}
                image={model.thumbnail}
                kind={model.type}
                eyebrow={`Collection ${model.category}`}
                compact
                sizes="(min-width: 768px) 25vw, 50vw"
                className={`${
                  showcaseModels.length >= 4
                    ? ""
                    : "w-[calc(50%-0.5rem)] max-w-[300px] md:w-72"
                } self-start ${i % 2 === 1 ? "md:mt-8" : ""}`}
              />
            ))}
          </Reveal>
        )}

        <div className="text-center">
          <Link
            href="/invitations"
            className="btn-lux group px-8 py-4 text-xs sm:text-[13px]"
          >
            Découvrir la galerie
            <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
