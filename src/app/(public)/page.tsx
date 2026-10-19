import Link from "next/link";
import { ArrowRight, Sparkles, Users, Wallet, Star, LayoutList } from "lucide-react";
import Image from "next/image";
import PricingSection from "@/components/ui/PricingSection";
import HeroEvents from "@/components/landing/HeroEvents";
import Reveal from "@/components/landing/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { mockInvitationModels, showcaseModelIds } from "@/data/mock/invitations";

const showcaseModels = showcaseModelIds
  .map((id) => mockInvitationModels.find((m) => m.id === id))
  .filter((m) => m !== undefined)
  .slice(0, 4);

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

export default function Home() {
  return (
    <main className="flex-1 bg-white">
      {/* 1. HERO — animé, un écran par type d'événement */}
      <HeroEvents />

      {/* 2. SECTION LA COLLECTION D'INVITATIONS */}
      <section className="py-24 md:py-28 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="La collection"
            title={<>Des invitations qui <span className="italic text-accent">marquent les esprits</span></>}
            lead="Découvrez un aperçu de notre collection. Des designs exclusifs pour annoncer la couleur de votre événement."
            className="mb-14"
          />

          {/* Fewer than 4 models: centered row instead of a half-empty 4-column grid */}
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
                className={`${showcaseModels.length >= 4 ? "" : "w-[calc(50%-0.5rem)] max-w-[300px] md:w-72"} ${i % 2 === 1 ? "md:translate-y-8" : ""}`}
              >
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 cursor-pointer">
                  <Image src={model.thumbnail} alt={`Modèle d'invitation ${model.name}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
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
                    <p className="font-serif text-lg font-bold text-white drop-shadow leading-tight">{model.name}</p>
                    <p className="text-[10px] text-[#F3E5AB] font-semibold tracking-widest uppercase mt-1">
                      Collection Mariage
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>

          <div className="text-center">
            <Link href="/invitations" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#b8924a]/50 bg-white text-primary font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors">
              Découvrir la galerie <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

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
                <article className="relative flex-1 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 pt-10 hover:bg-white/[0.07] hover:border-[#b8924a]/40 transition-all duration-500">
                  <span className="font-serif text-7xl leading-none bg-gradient-to-b from-[#f3d58a] to-[#9c7124] bg-clip-text text-transparent">
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-[#fbf7f0] p-6 hover:bg-white hover:shadow-[0_20px_50px_-20px_rgba(184,134,11,0.35)] hover:-translate-y-1 transition-all duration-500 min-h-[160px]"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-white text-[#8f6f33] border border-[#b8924a]/25 shadow-xs flex items-center justify-center group-hover:bg-[#8f6f33] group-hover:text-white transition-colors duration-500">
                    <s.icon size={22} />
                  </span>
                  <span className="font-serif text-3xl font-bold text-[#b8924a]/25 group-hover:text-[#b8924a]/50 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="relative font-serif text-lg sm:text-xl font-bold text-gray-900 group-hover:text-black leading-snug">
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
              className="relative inline-flex rounded-full bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#b8924a] px-8 py-4 text-sm font-bold text-[#241b13] shadow-[0_15px_40px_-10px_rgba(184,146,74,0.6)] hover:gap-3 transition-all items-center gap-2"
            >
              Commencer maintenant <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
