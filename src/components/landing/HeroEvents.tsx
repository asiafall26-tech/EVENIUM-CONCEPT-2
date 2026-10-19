"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const TAGLINE = [
  "Il y a des jours qu’on attend",
  "toute une vie. Annoncez-les",
  "comme il se doit.",
];

/** Fixed positions so server and client render the same gold dust. */
const DUST = [
  { x: 8, y: 72, s: 3, d: 0 }, { x: 14, y: 28, s: 2, d: 2.4 }, { x: 22, y: 86, s: 2, d: 4.1 },
  { x: 31, y: 18, s: 3, d: 1.2 }, { x: 39, y: 64, s: 2, d: 5.3 }, { x: 47, y: 90, s: 2, d: 3.1 },
  { x: 55, y: 12, s: 2, d: 0.7 }, { x: 62, y: 78, s: 3, d: 2.9 }, { x: 70, y: 34, s: 2, d: 4.6 },
  { x: 77, y: 88, s: 2, d: 1.8 }, { x: 84, y: 22, s: 3, d: 3.7 }, { x: 91, y: 60, s: 2, d: 0.3 },
  { x: 4, y: 44, s: 2, d: 5.8 }, { x: 96, y: 40, s: 2, d: 2.1 }, { x: 52, y: 52, s: 2, d: 6.4 },
];

function Corner({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute text-[#b8924a] text-[10px] leading-none ${className}`}>
      ✦
    </span>
  );
}

export default function HeroEvents() {
  const reduceMotion = useReducedMotion();
  const fade = (delay: number, y = 14) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  });

  return (
    <section className="relative w-full min-h-[calc(100svh-5rem)] flex items-center justify-center overflow-hidden bg-[#faf8f4]">
      {/* ── Ambiance : halos doux ── */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[-18%] -translate-x-1/2 w-[900px] h-[620px] rounded-full bg-[#f3ead8] blur-[140px] opacity-40"
        animate={reduceMotion ? undefined : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[-12%] bottom-[-20%] w-[520px] h-[520px] rounded-full bg-[#f4e6e2] blur-[130px] opacity-30"
        animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[-10%] bottom-[-10%] w-[480px] h-[480px] rounded-full bg-[#f5eee1] blur-[120px] opacity-40"
        animate={reduceMotion ? undefined : { x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Trame de papier fine, estompée sur les bords */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(184,146,74,0.045) 0 1px, transparent 1px 9px)",
          maskImage: "radial-gradient(ellipse at center, transparent 30%, black 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 85%)",
        }}
      />

      {/* Poussière dorée */}
      {!reduceMotion &&
        DUST.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full bg-[#b8924a]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
            animate={{ y: [0, -38, 0], opacity: [0, 0.75, 0] }}
            transition={{ duration: 7 + (i % 4), delay: p.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* ── Cadre façon faire-part ── */}
      <motion.div
        aria-hidden
        className="absolute inset-3 sm:inset-6 md:inset-10 pointer-events-none"
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <div className="absolute inset-0 border border-[#b8924a]/35" />
        <div className="absolute inset-[6px] border border-[#b8924a]/15" />
        <Corner className="-top-[5px] -left-[4px]" />
        <Corner className="-top-[5px] -right-[4px]" />
        <Corner className="-bottom-[5px] -left-[4px]" />
        <Corner className="-bottom-[5px] -right-[4px]" />
      </motion.div>

      {/* ── Contenu ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 sm:px-12 py-20 md:py-16 flex flex-col items-center text-center">
        <motion.p
          {...fade(0.2, 8)}
          className="pl-[0.5em] text-[10px] sm:text-xs md:text-[13px] font-normal uppercase tracking-[0.5em] text-[#8f6f33]"
        >
          L’élite de l’événementiel
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, delay: 0.45, ease: EASE }}
          className="hero-shimmer mt-5 md:mt-4 font-serif not-italic font-normal text-[4.2rem] sm:text-8xl md:text-[7.25rem] leading-[0.95] tracking-[0.01em]"
        >
          Evenium
        </motion.h1>

        {/* Filet + losange */}
        <div aria-hidden className="mt-7 md:mt-7 flex items-center gap-4 md:gap-5">
          <motion.span
            className="block h-px w-20 sm:w-28 md:w-40 bg-gradient-to-l from-[#b8924a] to-transparent origin-right"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
          />
          <motion.span
            className="block w-2 h-2 rotate-45 bg-[#b8924a]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
          />
          <motion.span
            className="block h-px w-20 sm:w-28 md:w-40 bg-gradient-to-r from-[#b8924a] to-transparent origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
          />
        </div>

        <h2 className="mt-10 md:mt-10 font-serif italic font-normal text-[2.1rem] sm:text-5xl md:text-[3.5rem] leading-[1.18] text-[#2b2118]">
          {TAGLINE.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 1.25 + i * 0.25, ease: EASE }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <motion.p
          {...fade(2.05)}
          className="mt-9 md:mt-8 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-gray-500"
        >
          Mariage, baptême, anniversaire, henné time…
          <br />
          Choisissez l’invitation, ou confiez-nous toute la fête.
        </motion.p>

        <motion.div
          {...fade(2.35)}
          className="mt-10 md:mt-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
        >
          <Link
            href="/create"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-black px-9 py-4 text-[11px] sm:text-xs font-normal uppercase tracking-[0.25em] text-[#f5eee1] border border-[#b8924a]/40 shadow-[0_18px_40px_-18px_rgba(43,33,24,0.6)] hover:border-[#b8924a] hover:-translate-y-0.5"
          >
            Créer mon événement
            <ArrowRight size={14} className="text-[#d9c08c] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/invitations"
            className="relative py-2 text-[11px] sm:text-xs font-normal uppercase tracking-[0.25em] text-[#8f6f33] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-[#b8924a]/50 after:origin-left after:transition-transform hover:after:scale-x-50"
          >
            Découvrir les modèles
          </Link>
        </motion.div>
      </div>

      {/* Invitation à défiler */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 w-px h-12 overflow-hidden bg-[#b8924a]/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
      >
        {!reduceMotion && (
          <motion.span
            className="absolute left-0 top-0 w-px h-5 bg-[#b8924a]"
            animate={{ y: [-20, 48] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </section>
  );
}
