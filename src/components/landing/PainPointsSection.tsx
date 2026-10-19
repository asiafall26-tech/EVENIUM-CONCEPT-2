import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Clock, LayoutList, Wallet, X, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";

const PAINS: { icon: LucideIcon; title: string; problem: string; solution: string }[] = [
  {
    icon: Clock,
    title: "Le temps perdu",
    problem: "Des heures à chercher le bon prestataire et à relancer chaque invité, un par un, par message.",
    solution: "Des prestataires vérifiés en quelques clics et des réponses d'invités suivies automatiquement.",
  },
  {
    icon: Wallet,
    title: "Le stress du budget",
    problem: "Des dépenses notées à la volée, des acomptes oubliés et des dépassements découverts trop tard.",
    solution: "Un budget suivi en temps réel, catégorie par catégorie, avec une alerte avant tout dépassement.",
  },
  {
    icon: LayoutList,
    title: "La dispersion des infos",
    problem: "Des listes Excel, des groupes WhatsApp et des notes éparpillées un peu partout.",
    solution: "Invités, tâches, prestataires et budget réunis sur un seul tableau de bord.",
  },
];

export default function PainPointsSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbf7f0] py-24 md:py-28 px-6 lg:px-8 border-y border-gray-100">
      <div aria-hidden className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#b8924a]/10 blur-[100px]" />
      <div aria-hidden className="absolute -bottom-40 -right-24 w-[460px] h-[460px] rounded-full bg-rose-200/30 blur-[110px]" />

      <div className="relative max-w-6xl mx-auto">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="inline-flex items-center gap-3 text-accent text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-5">
            <span className="w-8 h-px bg-accent" /> Le constat <span className="w-8 h-px bg-accent" />
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-primary leading-tight">
            Parce que l&apos;organisation ne devrait pas être <span className="italic text-accent">un calvaire</span>
          </h2>
          <p className="mt-5 text-gray-600 text-lg">
            Organiser un événement mène souvent au stress et à l&apos;éparpillement. Voici ce qu&apos;Evenium change.
          </p>
        </Reveal>

        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PAINS.map((p) => (
            <div key={p.title} className="flex">
            <article
              className="group flex-1 flex flex-col rounded-3xl bg-white border border-gray-100 shadow-[0_10px_40px_-20px_rgba(40,20,10,0.25)] hover:shadow-[0_25px_60px_-25px_rgba(184,134,11,0.4)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
            >
              {/* Without Evenium */}
              <div className="relative flex-1 px-7 pt-7 pb-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <X size={12} /> Sans Evenium
                </span>
                <div className="mt-6 flex items-center gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:rotate-[-6deg] transition-transform duration-500">
                    <p.icon size={22} />
                  </span>
                  <h3 className="font-serif text-2xl text-gray-900 leading-tight">{p.title}</h3>
                </div>
                <p className="mt-4 text-gray-500 leading-relaxed">{p.problem}</p>
              </div>

              {/* Divider with arrow */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-[#b8924a]/50 to-transparent">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#b8924a]/40 text-accent flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                  <ArrowDown size={16} />
                </span>
              </div>

              {/* With Evenium */}
              <div className="md:min-h-[190px] px-7 pt-10 pb-7 bg-gradient-to-b from-[#FBF6EA] to-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b8924a]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9a7209]">
                  <Check size={12} /> Avec Evenium
                </span>
                <p className="mt-4 text-gray-800 font-medium leading-relaxed">{p.solution}</p>
              </div>
            </article>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="font-serif text-xl md:text-2xl text-primary">
            Vous profitez de votre événement, <span className="italic text-accent">Evenium s&apos;occupe du reste.</span>
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-black/80 hover:gap-3 transition-all"
          >
            Commencer <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
