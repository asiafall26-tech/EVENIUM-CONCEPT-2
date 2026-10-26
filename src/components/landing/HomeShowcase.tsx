"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import {
  defaultClassification,
  mockInvitationModels,
  showcaseModelIds,
  type InvitationModel,
} from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/client";
import {
  classificationOf,
  fetchModelDefaults,
  hiddenModelIds,
  modelNameOf,
} from "@/lib/modelDefaults";

interface HomeShowcaseProps {
  initialModels: InvitationModel[];
}

export default function HomeShowcase({ initialModels }: HomeShowcaseProps) {
  const [showcaseModels, setShowcaseModels] = useState<InvitationModel[]>(initialModels);

  useEffect(() => {
    const supabase = createClient();

    const reload = async () => {
      try {
        const rows = await fetchModelDefaults(supabase);
        const hidden = hiddenModelIds(rows);
        const visible = mockInvitationModels
          .filter((m) => !hidden.has(m.id))
          .map((m) => {
            const c = classificationOf(rows[m.id], defaultClassification(m.id));
            return {
              ...m,
              name: modelNameOf(rows[m.id], m.name),
              type: c.type,
              category: (c.events[0] as any) ?? m.category,
            };
          });

        const ordered = [
          ...showcaseModelIds
            .map((id) => visible.find((m) => m.id === id))
            .filter((m): m is InvitationModel => m !== undefined),
          ...visible.filter((m) => !showcaseModelIds.includes(m.id)),
        ].slice(0, 4);

        setShowcaseModels(ordered);
      } catch (err) {
        console.error("Erreur lors de l'actualisation des modèles vitrine :", err);
      }
    };

    // Chargement immédiat côté client pour avoir l'état le plus frais
    reload();

    // Abonnement Supabase Realtime pour actualisation automatique instantanée
    const channel = supabase
      .channel("home_showcase_model_defaults_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitation_model_defaults" },
        () => {
          reload();
        }
      )
      .subscribe();

    const handleFocus = () => reload();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return (
    <section className="py-24 md:py-28 px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="La collection"
          title={
            <>
              Des invitations qui{" "}
              <span className="italic text-accent">marquent les esprits</span>
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
              <Link
                key={model.id}
                href={model.liveUrl || "/invitations"}
                className={`${
                  showcaseModels.length >= 4
                    ? ""
                    : "w-[calc(50%-0.5rem)] max-w-[300px] md:w-72"
                } ${i % 2 === 1 ? "md:translate-y-8" : ""}`}
              >
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 cursor-pointer">
                  <Image
                    src={model.thumbnail}
                    alt={`Modèle d'invitation ${model.name}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#b8924a]/0 group-hover:ring-[#b8924a]/70 transition-all duration-500" />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm text-[#8f6f33]">
                      {model.type === "animée" ? "Animée" : "Carte"}
                    </span>
                    <span className="bg-black/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm text-[#b8924a] border border-[#b8924a]/40">
                      💍 {model.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 inset-x-0 text-center px-3 z-10">
                    <p className="font-serif text-lg font-bold text-white drop-shadow leading-tight">
                      {model.name}
                    </p>
                    <p className="text-[10px] text-[#F3E5AB] font-semibold tracking-widest uppercase mt-1">
                      Collection {model.category}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>
        )}

        <div className="text-center">
          <Link
            href="/invitations"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#b8924a]/50 bg-white text-primary font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            Découvrir la galerie{" "}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
