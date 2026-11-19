"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Fleuron, GoldSwash, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";

const EASE = [0.16, 1, 0.3, 1] as const;

const TAGLINE = [
  "Il y a des jours qu'on attend",
  "toute une vie. Annoncez-les",
  "comme il se doit.",
];

export default function HeroEvents() {
  const fade = (delay: number, y = 10) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="bg-[#faf3e8] relative w-full min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center justify-center overflow-hidden">
      {/* ── Fond épuré beige uni : élégant, harmonieux et raffiné ── */}
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
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-12 pt-14 pb-20 sm:pt-16 sm:pb-24 flex flex-col items-center text-center">
        <motion.div {...fade(0.05, 6)}>
          <Fleuron className="w-48 sm:w-60 h-auto" />
        </motion.div>

        <motion.p
          {...fade(0.15, 6)}
          className="mt-4 pl-[0.4em] text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.4em] text-[#8f6f33]"
        >
          L&apos;élite de l&apos;événementiel
        </motion.p>
        <span aria-hidden className="mt-3 block h-px w-56 sm:w-72 bg-gradient-to-r from-transparent via-[#c9a45e] to-transparent" />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-4 sm:mt-5 font-display not-italic font-normal text-[4.5rem] sm:text-8xl md:text-[8.5rem] leading-[0.95] tracking-[-0.01em] text-[#1d120a]"
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
          Choisissez l&apos;invitation, ou confiez-nous toute la fête.
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
