"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin, Music, Volume2, VolumeX } from "lucide-react";
import s from "./velours.module.css";
import { veloursFontVars } from "./fonts";
import { bindSegment, cleanRange } from "@/utils/audioSegment";
import {
  formatDates,
  initial,
  PREVIEW_MSG,
  weddingDate,
  withDefaults,
  type VeloursContent,
} from "./content";
import InvitationEndCta from "../InvitationEndCta";

export interface RsvpPayload {
  name: string;
  phone: string;
  attending: boolean;
  guests: number;
  message: string;
}

interface Props {
  content?: Partial<VeloursContent> | null;
  /** Called when a guest submits the RSVP form; without it the form only shows the thank-you state */
  onRsvp?: (rsvp: RsvpPayload) => Promise<void>;
  /** Accept live content updates from a parent editor (iframe preview) */
  preview?: boolean;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Phase = "closed" | "opening" | "rising" | "leaving" | "done";

// Deterministic pseudo-random so decorative layouts are stable between renders
function rnd(i: number, seed: number) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const subscribeNoop = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/* ───────────────────────── Decorative pieces ───────────────────────── */

const PEONY_LAYERS = [
  { n: 9, r: 48, rx: 24, ry: 40, rot: 0 },
  { n: 8, r: 36, rx: 21, ry: 32, rot: 22 },
  { n: 7, r: 24, rx: 17, ry: 25, rot: 8 },
  { n: 6, r: 13, rx: 12, ry: 17, rot: 34 },
  { n: 5, r: 5, rx: 8, ry: 10, rot: 12 },
];

function Peony({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const gid = `peony${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={gid} cx="50%" cy="100%" r="110%">
          <stop offset="0%" stopColor="#24030c" />
          <stop offset="55%" stopColor="#6e1024" />
          <stop offset="100%" stopColor="#b4364d" />
        </radialGradient>
      </defs>
      {PEONY_LAYERS.map((layer, li) =>
        Array.from({ length: layer.n }, (_, pi) => (
          <ellipse
            key={`${li}-${pi}`}
            cx={0}
            cy={-layer.r}
            rx={layer.rx}
            ry={layer.ry}
            transform={`rotate(${layer.rot + (360 / layer.n) * pi})`}
            fill={`url(#${gid})`}
            stroke="rgba(20,0,6,0.35)"
            strokeWidth={0.8}
          />
        )),
      )}
      <circle r={6} fill="#1c0208" />
    </svg>
  );
}

function PeonyCluster({ className }: { className?: string }) {
  return (
    <div className={`${s.cluster} ${className ?? ""}`} aria-hidden>
      <Peony className={s.peonyA} />
      <Peony className={s.peonyB} />
      <Peony className={s.peonyC} />
      <Peony className={s.peonyD} />
    </div>
  );
}

const PETAL_COLORS = ["#7a1428", "#9b2338", "#5e0d1f", "#b13a50", "#d9b3b0"];

function Petals({ count, className }: { count: number; className?: string }) {
  return (
    <div className={`${s.petals} ${className ?? ""}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const style = {
          left: `${rnd(i, 1) * 100}%`,
          color: PETAL_COLORS[i % PETAL_COLORS.length],
          "--dur": `${10 + rnd(i, 2) * 10}s`,
          "--delay": `${-rnd(i, 3) * 20}s`,
          "--sway": `${(rnd(i, 4) - 0.5) * 180}px`,
          "--size": `${10 + rnd(i, 5) * 16}px`,
          "--spin": `${(rnd(i, 6) > 0.5 ? 1 : -1) * (300 + rnd(i, 7) * 400)}deg`,
        } as React.CSSProperties;
        return (
          <span key={i} className={s.petal} style={style}>
            <svg viewBox="0 0 20 28">
              <path d="M10 0C17 6 20 14 15 22C13 26 7 26 5 22C0 14 3 6 10 0Z" fill="currentColor" />
              <path d="M10 3C11 10 11 17 10 24" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

function Burst() {
  const count = 48;
  return (
    <div className={s.burst} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rnd(i, 8) * 0.4;
        const dist = 110 + rnd(i, 9) * 240;
        const heart = i % 7 === 0;
        const style = {
          "--tx": `${Math.cos(angle) * dist}px`,
          "--ty": `${Math.sin(angle) * dist * 0.75 - 70}px`,
          "--d": `${rnd(i, 10) * 0.35}s`,
          "--s": `${3 + rnd(i, 11) * 5}px`,
        } as React.CSSProperties;
        return (
          <span key={i} className={heart ? s.sparkHeart : s.spark} style={style}>
            {heart ? "♥" : null}
          </span>
        );
      })}
    </div>
  );
}

function Mono({ a, b, className }: { a: string; b: string; className?: string }) {
  return (
    <span className={className}>
      {a}
      <i />
      {b}
    </span>
  );
}

function SealFace({ a, b }: { a: string; b: string }) {
  return (
    <span className={s.sealFace}>
      <Mono a={a} b={b} className={s.sealMono} />
    </span>
  );
}

function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className={`${s.photo} ${className ?? ""}`}>
      {src && failed !== src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} />
      )}
    </div>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Swash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 30" className={className} aria-hidden>
      <motion.path
        d="M4 22C60 30 120 6 170 14C205 20 230 26 256 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`${s.label} ${light ? s.labelLight : ""}`}>{children}</p>;
}

function SplitName({ text, start, delay }: { text: string; start: boolean; delay: number }) {
  return (
    <span className={s.name} aria-label={text}>
      {[...text.toUpperCase()].map((c, i) => (
        <motion.span
          key={`${i}-${c}`}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: 26, filter: "blur(12px)" }}
          animate={start ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ delay: delay + i * 0.07, duration: 1, ease: EASE }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

/* ───────────────────────── Sections ───────────────────────── */

type SectionProps = { c: VeloursContent; dates: ReturnType<typeof formatDates> };

function Hero({ c, dates, start }: SectionProps & { start: boolean }) {
  const fade = (delay: number, y = 18) => ({
    initial: { opacity: 0, y },
    animate: start ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.2, delay, ease: EASE },
  });

  return (
    <section className={`${s.section} ${s.hero} ${s.velvetBg}`}>
      <div className={s.folds} />
      <motion.div className={s.heroTop} {...fade(0.2, -10)}>
        <span>
          Invitation
          <br />à notre mariage
        </span>
        <span className={s.burger} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </motion.div>

      <h1 className={s.names}>
        <SplitName text={c.partnerA} start={start} delay={0.4} />
        <motion.span
          className={s.amp}
          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
          animate={start ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.4, delay: 1.1, ease: EASE }}
        >
          &amp;
        </motion.span>
        <SplitName text={c.partnerB} start={start} delay={1.4} />
      </h1>

      <motion.p className={s.tagline} {...fade(2.1)}>
        {c.tagline}
      </motion.p>

      <motion.div
        className={s.heroArt}
        initial={{ opacity: 0, y: 60 }}
        animate={start ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1.6, delay: 1.6, ease: EASE }}
      >
        <PeonyCluster className={s.heroCluster} />
        <div className={s.heroCard}>
          <Mono a={initial(c.partnerA)} b={initial(c.partnerB)} className={s.heroCardMono} />
          <span className={s.heroCardDate}>{dates.short}</span>
          <Peony className={s.heroCardEmboss} />
        </div>
      </motion.div>

      <motion.div className={s.scrollCue} {...fade(2.8, 0)}>
        <span>Découvrir</span>
        <i />
      </motion.div>
    </section>
  );
}

function useCountdown(target: Date | null) {
  const [left, setLeft] = useState<number | null>(null);
  const time = target?.getTime() ?? null;
  useEffect(() => {
    if (time === null) return;
    const tick = () => setLeft(Math.max(0, time - Date.now()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [time]);
  if (left === null || time === null) return null;
  const sec = Math.floor(left / 1000);
  return {
    jours: Math.floor(sec / 86400),
    heures: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    secondes: sec % 60,
  };
}

function DateSection({ c, dates }: SectionProps) {
  const cd = useCountdown(weddingDate(c));
  const units = ["jours", "heures", "minutes", "secondes"] as const;
  return (
    <section className={`${s.section} ${s.mist}`}>
      <Reveal>
        <p className={s.bigDate}>{dates.long}</p>
        <p className={s.weekday}>{dates.weekday}</p>
        <span className={s.rule} />
      </Reveal>
      <Reveal delay={0.15}>
        <p className={s.scriptTitle}>{c.welcomeTitle}</p>
      </Reveal>
      <Reveal delay={0.25}>
        <p className={s.body}>{c.welcomeText}</p>
        <p className={s.heart}>♡</p>
      </Reveal>
      <Reveal delay={0.35} className={s.countdown}>
        {units.map((u) => (
          <div key={u} className={s.cdBox}>
            <span className={s.cdNum}>{cd ? String(cd[u]).padStart(2, "0") : "--"}</span>
            <span className={s.cdUnit}>{u}</span>
          </div>
        ))}
      </Reveal>
      <PeonyCluster className={s.cornerCluster} />
    </section>
  );
}

function StorySection({ c }: SectionProps) {
  return (
    <section className={`${s.section} ${s.satin} ${s.left}`}>
      <div className={s.satinFolds} />
      <Reveal>
        <Label>À propos de nous</Label>
        <h2 className={s.title}>
          Notre
          <br />
          histoire
        </h2>
      </Reveal>
      <Reveal delay={0.15}>
        <p className={s.bodyLeft}>{c.storyText}</p>
      </Reveal>
      {c.storyQuote && (
        <Reveal delay={0.3} className={s.quoteWrap}>
          <p className={s.quote}>{c.storyQuote}</p>
          <Swash className={s.swash} />
        </Reveal>
      )}
      <Reveal delay={0.2}>
        <Photo src={c.photoStory} alt={`${c.partnerA} et ${c.partnerB}`} className={s.photoTall} />
      </Reveal>
    </section>
  );
}

function ProgrammeSection({ c }: SectionProps) {
  return (
    <section className={`${s.section} ${s.satin} ${s.left}`}>
      <div className={s.satinFolds} />
      <Reveal>
        <Label>Programme</Label>
        <h2 className={s.title}>
          Le déroulé
          <br />
          de la journée
        </h2>
      </Reveal>
      <div className={s.timeline}>
        <motion.span
          className={s.tlLine}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        {c.programme.map((p, i) => (
          <motion.div
            key={i}
            className={s.tlRow}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.2, ease: EASE }}
          >
            <span className={s.tlDot} />
            <span className={s.tlTime}>{p.time}</span>
            <span className={s.tlLabel}>{p.label}</span>
          </motion.div>
        ))}
      </div>
      {c.programmeQuote && (
        <Reveal className={s.quoteWrap}>
          <p className={s.quote}>{c.programmeQuote}</p>
          <Swash className={s.swash} />
        </Reveal>
      )}
      <Reveal>
        <Photo src={c.photoProgramme} alt="Photo du programme" className={s.photoWide} />
      </Reveal>
    </section>
  );
}

function DetailsSection({ c, dates }: SectionProps) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [c.venue, c.address, c.city].filter(Boolean).join(" "),
  )}`;
  const rows = [
    { key: "date", icon: CalendarDays, main: dates.long, sub: dates.weekday },
    { key: "time", icon: Clock, main: c.time || "—", sub: "Accueil des invités · Merci d'arriver à l'avance" },
    { key: "place", icon: MapPin, main: c.city, sub: [c.venue, c.address].filter(Boolean).join(" · ") },
  ];
  return (
    <section className={`${s.section} ${s.satin} ${s.left} ${s.details}`}>
      <div className={s.satinFolds} />
      <Reveal>
        <Label>Détails</Label>
        <h2 className={s.title}>Quand et où</h2>
      </Reveal>
      <div className={s.infoList}>
        {rows.map((r, i) => (
          <Reveal key={r.key} delay={0.1 + i * 0.15} className={s.infoRow}>
            <r.icon size={22} strokeWidth={1.3} className={s.infoIcon} />
            <div>
              <p className={s.infoMain}>{r.main}</p>
              <p className={s.infoSub}>{r.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.5}>
        <a href={mapUrl} target="_blank" rel="noreferrer" className={s.ghostBtn}>
          Voir sur la carte <ArrowRight size={14} strokeWidth={1.4} />
        </a>
      </Reveal>
    </section>
  );
}

function RsvpSection({ c, dates, onRsvp }: SectionProps & { onRsvp?: Props["onRsvp"] }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", attending: "oui", guests: 1, message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError(null);
    setSending(true);
    try {
      await onRsvp?.({
        name: form.name.trim(),
        phone: form.phone.trim(),
        attending: form.attending === "oui",
        guests: form.attending === "oui" ? form.guests : 0,
        message: form.message.trim(),
      });
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`${s.section} ${s.velvetBg} ${s.left} ${s.rsvp}`}>
      <div className={s.folds} />
      <Reveal>
        <Label light>RSVP</Label>
        <h2 className={`${s.title} ${s.titleLight}`}>
          Merci de confirmer
          <br />
          votre présence
        </h2>
        <p className={s.bodyLight}>{c.rsvpText}</p>
      </Reveal>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="thanks"
            className={s.thanks}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className={s.heartBurst} aria-hidden>
              {Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                    animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 80, opacity: 0, scale: 1.2 }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                  >
                    ♥
                  </motion.span>
                );
              })}
            </div>
            <p className={s.scriptLight}>Merci {form.name.split(" ")[0]} !</p>
            <p className={s.bodyLight}>
              {form.attending === "oui"
                ? `Nous avons hâte de vous retrouver le ${dates.long}.`
                : "Vous nous manquerez, merci d'avoir répondu."}
            </p>
          </motion.div>
        ) : !open ? (
          <motion.div key="cta" exit={{ opacity: 0, y: -10 }}>
            <Reveal delay={0.2}>
              <button type="button" className={s.solidBtn} onClick={() => setOpen(true)}>
                Confirmer ma présence <ArrowRight size={14} strokeWidth={1.4} />
              </button>
            </Reveal>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            className={s.form}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <label className={s.field}>
              <span>Nom &amp; prénom</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom"
              />
            </label>
            <label className={s.field}>
              <span>Téléphone (facultatif)</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+221 …"
              />
            </label>
            <div className={s.choice}>
              {[
                { v: "oui", l: "Avec joie" },
                { v: "non", l: "Hélas, non" },
              ].map((o) => (
                <button
                  type="button"
                  key={o.v}
                  className={form.attending === o.v ? s.choiceOn : ""}
                  onClick={() => setForm({ ...form, attending: o.v })}
                >
                  {o.l}
                </button>
              ))}
            </div>
            {form.attending === "oui" && (
              <label className={s.field}>
                <span>Nombre de personnes</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                />
              </label>
            )}
            <label className={s.field}>
              <span>Un petit mot (facultatif)</span>
              <textarea
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Vos vœux aux mariés…"
              />
            </label>
            {error && <p className={s.formError}>{error}</p>}
            <button type="submit" className={s.solidBtn} disabled={sending}>
              {sending ? "Envoi…" : "Envoyer ma réponse"} <ArrowRight size={14} strokeWidth={1.4} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <Reveal className={s.footer}>
        <p className={s.footerSmall}>
          Merci de faire partie
          <br />
          de notre histoire ♡
        </p>
        <p className={s.scriptLight}>
          Avec amour,
          <br />
          {c.partnerA} &amp; {c.partnerB} ♡
        </p>
        <Mono a={initial(c.partnerA)} b={initial(c.partnerB)} className={s.footerMono} />
        <p className={s.footerSmall}>
          Mariage
          <br />
          {c.partnerA} &amp; {c.partnerB}
          <br />
          {dates.short}
        </p>
        {c.closingQuote && <p className={s.footerQuote}>{c.closingQuote}</p>}
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Envelope intro + page ───────────────────────── */

export default function VeloursInvitation({ content, onRsvp, preview, onBackToEdit, onFinalize }: Props) {
  const [phase, setPhase] = useState<Phase>(preview ? "done" : "closed");
  const [live, setLive] = useState<Partial<VeloursContent> | null>(null);
  const mounted = useMounted();
  const timers = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const c = withDefaults(live ?? content);
  const dates = formatDates(c);
  const a = initial(c.partnerA);
  const b = initial(c.partnerB);

  // Only the excerpt chosen in the editor is played, in a loop
  const audioRange = useRef(cleanRange(c.audioStart, c.audioEnd));
  useEffect(() => {
    audioRange.current = cleanRange(c.audioStart, c.audioEnd);
  }, [c.audioStart, c.audioEnd]);
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    return bindSegment(el, () => audioRange.current);
  }, [mounted, c.audioUrl]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    // Only lock top-level window body scroll; never lock inside an iframe preview
    if (typeof window !== "undefined" && window.self !== window.top) return;
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Inside a preview iframe the visible scrollbar eats into the phone screen: hide it, scrolling still works
  useEffect(() => {
    if (window.self === window.top) return;
    const root = document.documentElement;
    root.classList.add("embedded-preview");
    return () => root.classList.remove("embedded-preview");
  }, []);

  // If the user scrolls with their mouse wheel or touch-swipes while the envelope is closed, open it automatically
  useEffect(() => {
    if (phase !== "closed") return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        open();
      }
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const curY = e.touches[0]?.clientY || 0;
      if (touchStartY - curY > 20) {
        open();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [phase]);

  // Live preview: the editor (parent window) pushes content and playback commands
  useEffect(() => {
    if (!preview || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data?.type) return;
      if (e.data.type === PREVIEW_MSG.content) setLive(e.data.content);
      if (e.data.type === PREVIEW_MSG.skip) setPhase("done");
      if (e.data.type === PREVIEW_MSG.replay) {
        timers.current.forEach((t) => window.clearTimeout(t));
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }
        window.scrollTo(0, 0);
        setPhase("closed");
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_MSG.ready }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  const open = () => {
    if (phase !== "closed") return;
    if (c.audioUrl && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setPhase("opening");
    const at = (ms: number, p: Phase) => timers.current.push(window.setTimeout(() => setPhase(p), ms));
    at(1200, "rising");
    at(2900, "leaving");
    at(4100, "done");
  };

  const toggleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const isOpen = phase !== "closed";
  const isRising = phase === "rising" || phase === "leaving";
  const isLeaving = phase === "leaving";
  const heroStart = phase === "leaving" || phase === "done";

  const intro =
    phase !== "done" ? (
      <div
        onClick={phase === "closed" ? open : undefined}
        className={[s.intro, isOpen && s.isOpen, isRising && s.isRising, isLeaving && s.isLeaving, phase === "closed" && "cursor-pointer"]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={`${s.fill} ${s.velvetBg}`}>
          <div className={s.folds} />
        </div>
        {mounted && <Petals count={18} />}

        <div className={s.introHead}>
          <p className={s.introKicker}>Vous êtes invités</p>
          <p className={s.introNames}>
            {c.partnerA} &amp; {c.partnerB}
          </p>
        </div>

        <button type="button" className={s.envWrap} onClick={open} aria-label="Ouvrir l'invitation">
          <div className={s.envelope}>
            <div className={s.envBack} />
            <div className={s.letter}>
              <span className={s.letterSmall}>Mariage</span>
              <Mono a={a} b={b} className={s.letterMono} />
              <span className={s.letterDate}>{dates.short}</span>
            </div>
            <div className={s.pocket} />
            <div className={s.flap} />
            <div className={s.seal}>
              <span className={s.sealHalfL}>
                <SealFace a={a} b={b} />
              </span>
              <span className={s.sealHalfR}>
                <SealFace a={a} b={b} />
              </span>
            </div>
            {mounted && <Burst />}
          </div>
        </button>

        <p className={s.introHint}>Touchez le sceau pour ouvrir</p>
        {!isOpen && (
          <button
            type="button"
            className={s.skip}
            onClick={(e) => {
              e.stopPropagation();
              if (c.audioUrl && audioRef.current) {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
              setPhase("done");
            }}
          >
            Passer
          </button>
        )}
        <div className={s.flash} />
      </div>
    ) : null;

  return (
    <div className={`${s.theme} ${s.root} ${veloursFontVars}`}>
      {c.audioUrl && (
        <audio
          ref={audioRef}
          src={c.audioUrl}
          loop
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <div className={`${s.backdrop} ${s.velvetBg}`}>
        <div className={s.folds} />
      </div>

      <main className={s.card}>
        <Hero c={c} dates={dates} start={heroStart} />
        <DateSection c={c} dates={dates} />
        <StorySection c={c} dates={dates} />
        <ProgrammeSection c={c} dates={dates} />
        <DetailsSection c={c} dates={dates} />
        <RsvpSection c={c} dates={dates} onRsvp={onRsvp} />
        <InvitationEndCta
          theme="velours"
          modelId="invit-1"
          onBackToEdit={onBackToEdit}
          onFinalize={onFinalize}
        />
      </main>

      {/* Floating Audio Controller */}
      {c.audioUrl && mounted && (
        <button
          type="button"
          onClick={toggleAudio}
          className={s.musicFab}
          title={isPlaying ? "Mettre la musique en pause" : "Jouer la musique"}
          aria-label={isPlaying ? "Mettre la musique en pause" : "Jouer la musique"}
        >
          <div className={`${s.musicDisc} ${isPlaying ? s.musicDiscPlaying : ""}`}>
            {isPlaying ? <Music size={16} /> : <VolumeX size={16} />}
          </div>
          <div className={s.musicInfo}>
            <span className={s.musicTitle}>{c.audioTitle || "Bande-son des mariés"}</span>
            <span className={s.musicStatus}>
              {isPlaying ? (
                <>
                  <span className={s.soundBars}>
                    <span className={s.soundBar} />
                    <span className={s.soundBar} />
                    <span className={s.soundBar} />
                  </span>
                  En lecture
                </>
              ) : (
                "En pause"
              )}
            </span>
          </div>
        </button>
      )}

      {/* Ancestors may be transformed/filtered (page transitions, layouts), which breaks position:fixed —
          so full-screen layers are portaled to <body>. Before hydration, a plain cover hides the page. */}
      {mounted ? (
        createPortal(
          <div className={`${s.theme} ${s.layer} ${veloursFontVars}`}>
            {phase === "done" && <Petals count={12} className={s.petalsSoft} />}
            {intro}
          </div>,
          document.body,
        )
      ) : (
        <div className={`${s.cover} ${s.velvetBg}`} />
      )}
    </div>
  );
}
