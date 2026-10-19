"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// Purely illustrative mosaic of the event types Evenium supports (nothing clickable).
// Spans are chosen so both grids (2 and 4 columns) fill completely with grid-flow-dense.
const EVENTS: {
  label: string;
  tag: string;
  src: string;
  position: string;
  span: string;
}[] = [
  { label: "Mariage", tag: "Faire-part · Plan de table · Traiteur", src: "/events/mariage.jpg", position: "center 25%", span: "col-span-2 row-span-2" },
  { label: "Fiançailles", tag: "Annonce · Réception", src: "/events/fiancailles.jpg", position: "center 40%", span: "" },
  { label: "Anniversaire", tag: "Invitations festives · DJ · Gâteau", src: "/events/anniversaire.jpg", position: "center 30%", span: "row-span-2" },
  { label: "Baptême", tag: "Accueil de bébé · Proches", src: "/events/bapteme.jpg", position: "60% 30%", span: "" },
  { label: "Baby shower", tag: "Moment doux · Liste de naissance", src: "/events/baby-shower.jpg", position: "center 55%", span: "row-span-2" },
  { label: "Remise de diplôme", tag: "Célébration · Photos", src: "/events/diplome.jpg", position: "center 25%", span: "" },
  { label: "Gala & dîner", tag: "Réservation de tables · Dress code", src: "/events/gala.jpg", position: "center 70%", span: "col-span-2 row-span-2" },
  { label: "Conférence", tag: "Inscriptions · Badges · Intervenants", src: "/events/conference.jpg", position: "center 30%", span: "" },
];

const STATS = [
  { value: "8+", label: "types d'événements" },
  { value: "1", label: "plateforme unique" },
  { value: "100%", label: "personnalisable" },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

function Marquee() {
  const reduce = useReducedMotion();
  const items = EVENTS.map((e) => e.label);
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((label) => (
        <span key={label} className="flex items-center">
          <span className="font-serif italic text-2xl md:text-4xl text-white/85 px-6 md:px-10 whitespace-nowrap">{label}</span>
          <span className="text-[#b8924a] text-sm">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}

export default function EventTypesSection() {
  return (
    <section className="relative overflow-hidden bg-[#0f0c0b] text-white py-24 md:py-28 px-6 lg:px-8">
      {/* Ambient glows */}
      <div aria-hidden className="absolute -top-40 left-1/4 w-[620px] h-[620px] rounded-full bg-[#b8924a]/10 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-40 right-0 w-[560px] h-[560px] rounded-full bg-[#8a1c33]/20 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-end mb-14 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="flex items-center gap-3 text-[#b8924a] text-xs md:text-sm font-semibold tracking-[0.28em] uppercase mb-5">
              <span className="w-8 h-px bg-[#b8924a]" /> Pour chaque occasion
            </p>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
              Un seul outil pour <span className="italic text-[#b8924a]">tous</span> vos événements
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Des grands jours en famille aux rendez-vous professionnels, Evenium s&apos;adapte à chaque célébration :
              invitations dédiées, prestataires adaptés et suivi sur-mesure.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-3xl md:text-4xl text-[#b8924a]">{s.value}</p>
                  <p className="mt-1 text-[11px] md:text-xs uppercase tracking-[0.15em] text-white/55">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mosaic */}
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-flow-dense auto-rows-[130px] sm:auto-rows-[150px] lg:auto-rows-[165px] gap-3 md:gap-4">
          {EVENTS.map((ev, i) => (
            <motion.figure
              key={ev.label}
              className={`group relative overflow-hidden rounded-2xl md:rounded-[26px] bg-white/5 ring-1 ring-white/10 ${ev.span}`}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: EASE }}
            >
              <Image
                src={ev.src}
                alt={ev.label}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                style={{ objectPosition: ev.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[#b8924a]/0 group-hover:ring-[#b8924a]/60 transition-all duration-500" />

              <span className="absolute top-3 left-3 md:top-4 md:left-4 font-serif text-xs md:text-sm text-[#b8924a] bg-black/35 backdrop-blur-md rounded-full px-2.5 py-1 ring-1 ring-white/10">
                {String(i + 1).padStart(2, "0")}
              </span>

              <figcaption className="absolute left-3 right-3 bottom-3 md:left-4 md:right-4 md:bottom-4">
                <div className="inline-block max-w-full rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 px-3 py-2 md:px-4 md:py-2.5">
                  <p className="font-serif text-base md:text-xl leading-tight text-white">{ev.label}</p>
                  <p className="hidden md:block max-h-0 overflow-hidden opacity-0 group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-500 text-xs text-white/80">
                    {ev.tag}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <Marquee />
      </div>
    </section>
  );
}
