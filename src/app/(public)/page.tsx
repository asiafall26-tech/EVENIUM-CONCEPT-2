import Link from "next/link";
import { ArrowRight, Sparkles, Users, Wallet, Star, LayoutList } from "lucide-react";
import PricingSection from "@/components/ui/PricingSection";
import HeroEvents from "@/components/landing/HeroEvents";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { Fleuron, LuxFrame } from "@/components/landing/LuxOrnaments";
import HomeShowcase from "@/components/landing/HomeShowcase";
import { mockInvitationModels } from "@/data/mock/invitations";
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults } from "@/lib/modelDefaults";
import { fetchCustomModels } from "@/lib/customModels";
import { buildShowcase } from "@/lib/showcase";

// Vitrine toujours à jour en temps réel : un modèle désactivé disparaît immédiatement
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getShowcaseModels() {
  try {
    const supabase = await createClient();
    const [rows, customs] = await Promise.all([fetchModelDefaults(supabase), fetchCustomModels(supabase, { publishedOnly: true })]);
    return buildShowcase(rows, customs);
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
    <main className="flex-1 bg-[#fbf6ee]">
      {/* 1. HERO — animé, un écran par type d'événement */}
      <HeroEvents />

      {/* 2. SECTION LA COLLECTION D'INVITATIONS (temps réel automatique) */}
      <HomeShowcase initialModels={showcaseModels} />

      {/* 3. SECTION COMMENT ÇA MARCHE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#24170d] via-[#1c120a] to-[#140c06] text-white py-24 md:py-28 px-6 lg:px-8">
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#e9c478]/15 blur-[120px]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a45e] to-transparent" />
        <LuxFrame className="inset-3 sm:inset-6 opacity-50" />
        <div className="relative max-w-6xl mx-auto">
          <SectionHeading
            dark
            eyebrow="Comment ça marche"
            title={<>L&apos;organisation simplifiée en <span className="italic text-gold-foil">3 étapes</span></>}
          />

          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex">
                <article className="relative flex-1 rounded-3xl border border-[#c9a45e]/25 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-sm p-4 sm:p-6 lg:p-8 pt-10 hover:border-[#c9a45e]/60 hover:shadow-[0_0_40px_-12px_rgba(233,196,120,0.45)] transition-all duration-500">
                  <span className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-none text-gold-foil">
                    {i + 1}
                  </span>
                  <h3 className="mt-6 font-serif text-2xl text-[#fbf3e4]">{s.title}</h3>
                  <p className="mt-3 text-white/65 leading-relaxed">{s.text}</p>
                  {i < STEPS.length - 1 && (
                    <span className="hidden md:flex absolute top-1/2 -right-[22px] z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-[#1c120a] border border-[#c9a45e]/60 text-[#e7c97f] items-center justify-center">
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
      <section id="services" className="bg-silk relative overflow-hidden py-20 md:py-24 px-6 lg:px-8">
        <div className="relative max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Tout-en-un"
            title={<>Nos <span className="italic text-gold-foil">Services</span></>}
            className="mb-10 md:mb-14"
          />

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {SERVICES.map((s, i) => (
              <article
                key={s.title}
                className="card-lux group relative flex flex-col overflow-hidden p-6 hover:shadow-[0_24px_50px_-20px_rgba(184,134,11,0.45)] hover:-translate-y-1 transition-all duration-500 min-h-[160px]"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-full bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] border border-[#c9a45e]/70 shadow-[0_0_18px_-6px_rgba(233,196,120,0.7)] flex items-center justify-center">
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
      <section className="px-6 lg:px-8 py-20 md:py-24 bg-[#fbf6ee]">
        <Reveal className="max-w-6xl mx-auto">
          <div className="bg-silk relative overflow-hidden rounded-[2.5rem] px-6 py-16 md:py-20 text-center shadow-[0_30px_70px_-35px_rgba(90,60,25,0.5)]">
            <div aria-hidden className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#ffe2aa]/50 blur-[100px]" />
            <LuxFrame className="inset-4 md:inset-6" />
            <Fleuron className="relative mx-auto w-44 md:w-52 h-auto mb-6" />
            <h2 className="relative font-serif text-3xl md:text-5xl text-[#1d120a] mb-10 max-w-2xl mx-auto leading-tight">
              Prêt à vivre un événement <span className="italic text-gold-foil">inoubliable</span> ?
            </h2>
            <Link href="/create" className="btn-lux group relative px-9 py-4 text-xs sm:text-[13px]">
              Commencer maintenant
              <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
