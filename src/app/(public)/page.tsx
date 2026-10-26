import Link from "next/link";
import { ArrowRight, Sparkles, Users, Wallet, Star, LayoutList } from "lucide-react";
import Image from "next/image";
import PricingSection from "@/components/ui/PricingSection";
import HeroEvents from "@/components/landing/HeroEvents";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import HomeShowcase from "@/components/landing/HomeShowcase";
import { mockInvitationModels, showcaseModelIds } from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults, hiddenModelIds, modelNameOf, modelCoverOf } from "@/lib/modelDefaults";

// Vitrine toujours à jour en temps réel : un modèle désactivé disparaît immédiatement
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getShowcaseModels() {
  try {
    const supabase = await createClient();
    const rows = await fetchModelDefaults(supabase);
    const hidden = hiddenModelIds(rows);
    const visible = mockInvitationModels
      .filter((m) => !hidden.has(m.id))
      .map((m) => ({
        ...m,
        name: modelNameOf(rows[m.id], m.name),
        thumbnail: modelCoverOf(rows[m.id], m.thumbnail),
      }));
    // Modèles mis en avant d'abord, complétés par les autres modèles en ligne
    return [
      ...showcaseModelIds.map((id) => visible.find((m) => m.id === id)).filter((m) => m !== undefined),
      ...visible.filter((m) => !showcaseModelIds.includes(m.id)),
    ].slice(0, 4);
  } catch (e) {
    console.error("Erreur getShowcaseModels:", e);
    return mockInvitationModels.slice(0, 4);
  }
}

const SERVICES = [
  {
    icon: Sparkles,
    title: "Invitations sur-mesure",
  },
  {
    icon: Users,
    title: "Suivi des invités & RSVP",
  },
  {
    icon: Wallet,
    title: "Gestion du budget",
  },
  {
    icon: LayoutList,
    title: "To-do List intelligente",
  },
  {
    icon: Star,
    title: "Réseau de prestataires",
  },
];

const STEPS = [
  { title: "Créez votre événement", text: "Renseignez les détails, choisissez votre formule et définissez votre budget initial." },
  { title: "Personnalisez & Invitez", text: "Sélectionnez votre modèle d'invitation, personnalisez-le et envoyez-le à vos proches." },
  { title: "Gérez & Profitez", text: "Trouvez vos prestataires, suivez les confirmations et profitez du jour J sans stress." },
];

export default async function Home() {
  const showcaseModels = await getShowcaseModels();
  return (
    <main className="flex-1 bg-white">
      {/* 1. HERO — animé, un écran par type d'événement */}
      <HeroEvents />

      {/* 2. SECTION LA COLLECTION D'INVITATIONS (temps réel automatique) */}
      <HomeShowcase initialModels={showcaseModels} />

      {/* 3. SECTION COMMENT ÇA MARCHE */}
      <section className="relative overflow-hidden bg-[#241b13] text-white py-24 md:py-28 px-6 lg:px-8">
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#b8924a]/15 blur-[120px]" />
        <div className="relative max-w-6xl mx-auto">
          <SectionHeading
            dark
            eyebrow="Comment ça marche"
            title={<>L&apos;organisation simplifiée en <span className="italic text-accent">3 étapes</span></>}
          />

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex">
                <article className="relative flex-1 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 sm:p-6 lg:p-8 pt-10 hover:bg-white/[0.07] hover:border-[#b8924a]/40 transition-all duration-500">
                  <span className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-none bg-gradient-to-b from-[#f3d58a] to-[#9c7124] bg-clip-text text-transparent">
                    {i + 1}
                  </span>
                  <h3 className="mt-6 font-serif text-2xl">{s.title}</h3>
                  <p className="mt-3 text-white/65 leading-relaxed">{s.text}</p>
                  {i < STEPS.length - 1 && (
                    <span className="hidden md:flex absolute top-1/2 -right-[22px] z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-[#241b13] border border-[#b8924a]/40 text-accent items-center justify-center">
                      <ArrowRight size={16} />
                    </span>
                  )}
                </article>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4. SECTION NOS SERVICES */}
      <section id="services" className="relative overflow-hidden py-20 md:py-24 px-6 lg:px-8 bg-white">
        <div className="relative max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Tout-en-un"
            title={<>Nos <span className="italic text-accent">Services</span></>}
            className="mb-10 md:mb-14"
          />

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {SERVICES.map((s, i) => (
              <article
                key={s.title}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-[#fbf7f0] p-6 hover:bg-white hover:shadow-[0_20px_50px_-20px_rgba(184,134,11,0.35)] hover:-translate-y-1 transition-all duration-500 min-h-[160px]"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-white text-[#8f6f33] border border-[#b8924a]/25 shadow-xs flex items-center justify-center group-hover:bg-[#8f6f33] group-hover:text-white transition-colors duration-500">
                    <s.icon size={22} />
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#b8924a]/25 group-hover:text-[#b8924a]/50 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="relative font-serif text-lg sm:text-xl font-bold text-gray-900 group-hover:text-black leading-snug min-h-[2.75em]">
                  {s.title}
                </h3>
                <span className="absolute left-6 right-6 bottom-0 h-[2px] bg-gradient-to-r from-[#b8924a] to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </article>
            ))}
          </Reveal>
        </div>
      </section>


      {/* 8. SECTION TARIFS (Avec Slider Mobile et Hover Desktop) */}
      <PricingSection />

      {/* 8. CTA Final */}
      <section className="px-6 lg:px-8 py-20 md:py-24 bg-white">
        <Reveal className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#241b13] px-6 py-16 md:py-20 text-center">
            <div aria-hidden className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#b8924a]/25 blur-[100px]" />
            <div aria-hidden className="absolute -bottom-28 -right-10 w-96 h-96 rounded-full bg-[#8a1c33]/30 blur-[110px]" />
            <div aria-hidden className="absolute inset-4 md:inset-6 rounded-[2rem] border border-[#b8924a]/20" />
            <Sparkles className="relative mx-auto text-accent mb-6" size={28} />
            <h2 className="relative font-serif text-3xl md:text-5xl text-white mb-10 max-w-2xl mx-auto leading-tight">
              Prêt à vivre un événement <span className="italic text-accent">inoubliable</span> ?
            </h2>
            <Link
              href="/create"
              className="relative inline-flex rounded-full bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#b8924a] px-4 sm:px-6 lg:px-8 py-4 text-sm font-bold text-[#241b13] shadow-[0_15px_40px_-10px_rgba(184,146,74,0.6)] hover:gap-3 transition-all items-center gap-2"
            >
              Commencer maintenant <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
