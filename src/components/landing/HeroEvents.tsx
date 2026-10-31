"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Fleuron, GoldSwash, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";

const EASE = [0.16, 1, 0.3, 1] as const;

const TAGLINE = [
  "Il y a des jours qu’on attend",
  "toute une vie. Annoncez-les",
  "comme il se doit.",
];

/** Bokeh doré : positions fixes pour un rendu identique serveur / client. */
const BOKEH = [
  { x: 6, y: 64, s: 46, d: 0 }, { x: 18, y: 84, s: 28, d: 2.4 }, { x: 30, y: 90, s: 36, d: 4.1 },
  { x: 72, y: 70, s: 30, d: 1.2 }, { x: 90, y: 32, s: 40, d: 5.3 }, { x: 82, y: 12, s: 24, d: 3.1 },
  { x: 12, y: 22, s: 22, d: 0.7 }, { x: 58, y: 88, s: 26, d: 2.9 }, { x: 94, y: 56, s: 20, d: 4.6 },
];

/** Voile de soie qui tombe depuis le coin haut gauche. */
function Silk({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 420" className={className} fill="none">
      <defs>
        <linearGradient id="silk-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf9" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#f6e9d6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f3e3cc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="silk-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ead7bb" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ead7bb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 0 H300 C230 50 170 110 140 210 C110 310 50 370 0 410 Z" fill="url(#silk-a)" />
      <path d="M0 0 H170 C120 60 90 140 70 220 C55 280 30 320 0 345 Z" fill="url(#silk-b)" />
      <path d="M0 0 H110 C80 70 60 150 30 230 C20 260 10 275 0 285 Z" fill="url(#silk-a)" />
      <path d="M250 0 C185 60 150 120 125 210 C100 300 55 355 0 395" stroke="#fff" strokeOpacity="0.9" strokeWidth="2" />
      <path d="M150 0 C110 70 85 150 62 225" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
    </svg>
  );
}

export default function HeroEvents() {
  const reduceMotion = useReducedMotion();
  const fade = (delay: number, y = 10) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="bg-silk relative w-full min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden">
      {/* ── Décor : soie, lustre, bokeh ── */}
      <Silk className="absolute top-0 left-0 w-[62%] max-w-[520px] h-auto pointer-events-none blur-[1px]" />

      <motion.div
        aria-hidden
        className="absolute top-2 right-0 w-[58%] max-w-[460px] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: [0.85, 1, 0.85] }}
        transition={reduceMotion ? { duration: 1 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/hero/chandelier.png" alt="" width={268} height={124} priority className="w-full h-auto" />
      </motion.div>

      {BOKEH.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.s,
            height: b.s,
            background: "radial-gradient(circle, rgba(255,226,170,0.75) 0%, rgba(255,226,170,0.25) 45%, transparent 70%)",
          }}
          animate={reduceMotion ? undefined : { opacity: [0.35, 0.9, 0.35], scale: [1, 1.12, 1] }}
          transition={{ duration: 6 + (i % 3) * 1.5, delay: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Table dressée : drapé, bougie, bouquet */}
      <Image
        src="/hero/silk.png"
        alt=""
        width={400}
        height={110}
        aria-hidden
        className="absolute bottom-0 left-0 w-[75%] sm:w-[48%] h-auto pointer-events-none [mask-image:linear-gradient(to_right,black_55%,transparent)]"
      />
      <Image
        src="/hero/candle.png"
        alt=""
        width={125}
        height={190}
        aria-hidden
        className="absolute bottom-0 left-0 w-[19%] max-w-[150px] sm:w-[12%] h-auto pointer-events-none"
      />
      <Image
        src="/hero/flowers.png"
        alt=""
        width={195}
        height={330}
        aria-hidden
        className="absolute bottom-0 right-0 w-[33%] max-w-[250px] sm:w-[20%] h-auto pointer-events-none"
      />

      {/* ── Cadre doré aux coins rentrants ── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 1.01 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <LuxFrame openBottom className="inset-x-3.5 top-3.5 bottom-[12%] sm:inset-x-8 sm:top-8 md:inset-x-12 md:top-10" />
      </motion.div>

      {/* ── Contenu ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-12 pt-14 pb-36 sm:pt-16 sm:pb-40 flex flex-col items-center text-center">
        <motion.div {...fade(0.05, 6)}>
          <Fleuron className="w-48 sm:w-60 h-auto" />
        </motion.div>

        <motion.p
          {...fade(0.15, 6)}
          className="mt-4 pl-[0.4em] text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.4em] text-[#8f6f33]"
        >
          L’élite de l’événementiel
        </motion.p>
        <span aria-hidden className="mt-3 block h-px w-56 sm:w-72 bg-gradient-to-r from-transparent via-[#c9a45e] to-transparent" />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-4 sm:mt-5 font-display not-italic font-normal text-[4.5rem] sm:text-8xl md:text-[8.5rem] leading-[0.95] tracking-[-0.01em] text-[#1d120a] [text-shadow:0_2px_18px_rgba(255,244,222,0.9)]"
        >
          Evenium
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className="-mt-1 sm:-mt-2 w-60 sm:w-80 md:w-[26rem] origin-left"
        >
          <GoldSwash className="w-full h-6 sm:h-8 drop-shadow-[0_2px_6px_rgba(201,164,94,0.45)]" />
        </motion.div>

        <motion.div {...fade(0.6, 0)} className="mt-5 sm:mt-6">
          <DiamondRule />
        </motion.div>

        <h2 className="mt-7 sm:mt-9 font-display italic font-normal text-[1.85rem] sm:text-5xl md:text-[3.4rem] leading-[1.2] text-[#22160d]">
          {TAGLINE.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.65 + i * 0.1, ease: EASE }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <motion.p
          {...fade(0.95, 10)}
          className="mt-6 sm:mt-8 max-w-2xl text-[15px] sm:text-lg md:text-xl leading-relaxed text-[#3d3126]"
        >
          Mariage, baptême, anniversaire, henné time…
          <br />
          Choisissez l’invitation, ou confiez-nous toute la fête.
        </motion.p>

        <motion.div
          {...fade(1.1, 10)}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-10"
        >
          <Link href="/create" className="btn-lux group px-9 sm:px-11 py-4 sm:py-[1.15rem] text-[13px] sm:text-sm">
            Créer mon événement
            <ArrowRight size={18} strokeWidth={1.5} className="text-[#f0d999] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/invitations" className="link-lux text-xs sm:text-[13px]">
            Découvrir les modèles
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
