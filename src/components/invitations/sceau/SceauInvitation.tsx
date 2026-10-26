"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import s from "./sceau.module.css";
import { sceauFontVars } from "./fonts";
import {
  formatDates,
  initial,
  mapsEmbedUrl,
  mapsLink,
  PREVIEW_MSG,
  venueQuery,
  wazeLink,
  weddingDate,
  withDefaults,
  type SceauContent,
} from "./content";
import { createSoundtrack, paintBouquet, sealPath, startPetals, type PetalEngine, type Soundtrack } from "./effects";
import type { RsvpPayload } from "../velours/VeloursInvitation";
import InvitationEndCta from "../InvitationEndCta";
import InvitationStyleTag, { modelSelectors } from "../InvitationStyleTag";
import InvitationSections from "../InvitationSections";
import { cls } from "@/lib/invitationStyle";

interface Props {
  content?: Partial<SceauContent> | null;
  /** Called when a guest submits the form; without it the form only shows the thank-you state */
  onRsvp?: (rsvp: RsvpPayload) => Promise<void>;
  /** Accept live content updates from a parent editor (iframe preview) */
  preview?: boolean;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  hideCta?: boolean;
}

/** closed → open (seal broken) → curtains (gate faded, curtains part) → done */
type Phase = "closed" | "open" | "curtains" | "done";

const subscribeNoop = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/* ───────────────────────── Decorative pieces ───────────────────────── */

function Seal({ mono, seed, className }: { mono: string; seed: number; className?: string }) {
  const id = `srseal${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const d = useMemo(() => sealPath(seed), [seed]);
  const fs = mono.length > 1 ? 27 : 36;
  return (
    <span className={className}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id={id} cx=".38" cy=".32" r=".78">
            <stop offset="0" stopColor="#fcebb4" />
            <stop offset=".35" stopColor="#dab55c" />
            <stop offset=".75" stopColor="#a47a2b" />
            <stop offset="1" stopColor="#6b4912" />
          </radialGradient>
        </defs>
        <path d={d} fill={`url(#${id})`} />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#7a5418" strokeOpacity=".55" strokeWidth="2.4" />
        <circle cx="50" cy="50" r="27.5" fill="none" stroke="#fff4cf" strokeOpacity=".45" strokeWidth="1" />
        <text x="50.9" y="61.9" textAnchor="middle" fontFamily="var(--f-script)" fontSize={fs} fill="#fff3c9" fillOpacity=".55">
          {mono}
        </text>
        <text x="50" y="61" textAnchor="middle" fontFamily="var(--f-script)" fontSize={fs} fill="#76500f">
          {mono}
        </text>
        <ellipse cx="36" cy="28" rx="13" ry="5.5" fill="#fff" fillOpacity=".28" transform="rotate(-32 36 28)" />
      </svg>
    </span>
  );
}

const DRAPE_ID = "sr-drape-art";

function DrapeDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="sr-dr1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a0610" />
          <stop offset=".14" stopColor="#8e2539" />
          <stop offset=".3" stopColor="#4d0915" />
          <stop offset=".48" stopColor="#9a2b40" />
          <stop offset=".62" stopColor="#5a0e1b" />
          <stop offset=".8" stopColor="#a2324a" />
          <stop offset="1" stopColor="#3d0711" />
        </linearGradient>
        <linearGradient id="sr-dr2" x1="0" y1="0" x2="1" y2=".3">
          <stop offset="0" stopColor="#6a1426" />
          <stop offset=".22" stopColor="#b03b52" />
          <stop offset=".4" stopColor="#55101d" />
          <stop offset=".66" stopColor="#94283d" />
          <stop offset=".86" stopColor="#43080f" />
          <stop offset="1" stopColor="#7a1a2d" />
        </linearGradient>
        <linearGradient id="sr-dr3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a1729" />
          <stop offset=".6" stopColor="#5a0e1b" />
        </linearGradient>
        <g id={DRAPE_ID}>
          <g className={s.sway}>
            <path d="M-40 34 C40 110 110 -6 200 60 S330 110 440 30 L440 150 L-40 150Z" fill="url(#sr-dr1)" />
          </g>
          <g className={s.sway2}>
            <path d="M-40 78 C50 130 120 40 210 92 S350 140 440 72 L440 150 L-40 150Z" fill="url(#sr-dr2)" />
          </g>
          <path d="M-40 112 C60 146 150 96 240 124 S370 150 440 118 L440 150 L-40 150Z" fill="url(#sr-dr3)" />
        </g>
      </defs>
    </svg>
  );
}

function Drape() {
  return (
    <div className={s.drape} aria-hidden="true">
      <svg viewBox="0 0 400 150" preserveAspectRatio="none">
        <use href={`#${DRAPE_ID}`} />
      </svg>
    </div>
  );
}

/** Gold seal pin with the couple's monogram, its tip on the map centre */
function MapPin({ mono }: { mono: string }) {
  const id = `srpin${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 54 72" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#fcebb4" />
          <stop offset=".4" stopColor="#dab55c" />
          <stop offset=".8" stopColor="#a47a2b" />
          <stop offset="1" stopColor="#6b4912" />
        </radialGradient>
      </defs>
      <path d="M27 71C27 71 3 41 3 26a24 24 0 0 1 48 0c0 15-24 45-24 45z" fill="#5a0e1b" stroke="#33050f" strokeWidth="1" />
      <circle cx="27" cy="26" r="17" fill={`url(#${id})`} />
      <circle cx="27" cy="26" r="12.5" fill="none" stroke="#7a5418" strokeOpacity=".55" strokeWidth="1.2" />
      <text x="27" y="31.5" textAnchor="middle" fontFamily="var(--f-script)" fontSize={mono.length > 1 ? 14 : 18} fill="#76500f">
        {mono}
      </text>
    </svg>
  );
}

function Compass() {
  return (
    <svg viewBox="0 0 44 44" className={s.mapCompass} aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="rgba(244,235,223,.88)" stroke="#c9a24a" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="16" fill="none" stroke="#c9a24a" strokeOpacity=".5" strokeWidth=".8" />
      <path d="M22 5l3.2 17H18.8z" fill="#5a0e1b" />
      <path d="M22 39l-3.2-17h6.4z" fill="#c9a24a" />
      <path d="M5 22l17-3.2v6.4zM39 22l-17 3.2v-6.4z" fill="#b99a74" fillOpacity=".7" />
      <text x="22" y="4.2" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#5a0e1b" fontFamily="var(--f-body)">
        N
      </text>
    </svg>
  );
}

/**
 * Tinted Google map in a gold frame. It stays inert until tapped so scrolling the invitation
 * on a phone never gets trapped inside the map.
 */
function MapCard({ c, query, mono }: { c: SceauContent; query: string; mono: string }) {
  const [active, setActive] = useState(false);
  return (
    <>
      {c.showMap && query && (
        <div className={s.mapCard}>
          <div className={s.mapInner}>
            <iframe
              className={s.map}
              src={mapsEmbedUrl(c.mapsUrl, query)}
              title={`Plan d'accès : ${c.venue || c.address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ pointerEvents: active ? "auto" : "none" }}
            />
            <div className={s.mapTint} />
            <span className={s.mapPulse} />
            <span className={s.mapPin}>
              <MapPin mono={mono} />
            </span>
            <Compass />
            {!active && (
              <button type="button" className={s.mapShield} onClick={() => setActive(true)} aria-label="Explorer la carte">
                <span>Touchez pour explorer</span>
              </button>
            )}
          </div>
        </div>
      )}
      <div className={s.mapActions}>
        <a className={cx(s.pill, s.pillDark)} target="_blank" rel="noopener noreferrer" href={mapsLink(c.mapsUrl, query)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          Google Maps
        </a>
        <a className={cx(s.pill, s.pillOutline)} target="_blank" rel="noopener noreferrer" href={wazeLink(c.mapsUrl, query)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 11l18-8-8 18-2-8z" />
          </svg>
          Waze
        </a>
      </div>
    </>
  );
}

function Countdown({ target }: { target: Date | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  let left = Math.max(0, Math.floor(((target?.getTime() ?? now) - now) / 1000));
  const d = Math.floor(left / 86400);
  left %= 86400;
  const h = Math.floor(left / 3600);
  left %= 3600;
  const m = Math.floor(left / 60);
  const sec = left % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={s.count} aria-live="off">
      <div><b>{d}</b><small>jours</small></div>
      <div><b>{pad(h)}</b><small>heures</small></div>
      <div><b>{pad(m)}</b><small>min</small></div>
      <div><b>{pad(sec)}</b><small>sec</small></div>
    </div>
  );
}

/* ───────────────────────── Guest form ───────────────────────── */

function GuestForm({
  c,
  guestName,
  onRsvp,
  onBurst,
}: {
  c: SceauContent;
  guestName: string;
  onRsvp?: Props["onRsvp"];
  onBurst: (x: number, y: number) => void;
}) {
  const [name, setName] = useState(guestName);
  const [att, setAtt] = useState<"oui" | "non" | "">("");
  const [count, setCount] = useState("2");
  const [drinks, setDrinks] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ yes: boolean; text: string } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const yesRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setName((n) => n || guestName), [guestName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const who = name.trim();
    if (!who) {
      setError("Indiquez votre nom pour que les mariés sachent qui répond.");
      nameRef.current?.focus();
      return;
    }
    if (!att) {
      setError("Dites-nous si vous serez présent ou non.");
      yesRef.current?.focus();
      return;
    }
    setError("");
    const yes = att === "oui";
    setSending(true);
    try {
      await onRsvp?.({
        name: who,
        phone: "",
        attending: yes,
        guests: yes ? Number(count) : 0,
        message: drinks.length ? `Boissons : ${drinks.join(", ")}` : "",
      });
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
      setSending(false);
      return;
    }
    setSending(false);
    const b = sendRef.current?.getBoundingClientRect();
    if (yes && b) onBurst(b.left + b.width / 2, b.top);
    setDone({
      yes,
      text: yes
        ? `${who}, votre présence (${count} pers.) est bien notée.` +
          (drinks.length ? ` Côté boissons : ${drinks.join(", ").toLowerCase()}.` : "") +
          " À très vite !"
        : `${who}, vous nous manquerez. Nous penserons à vous ce jour-là.`,
    });
  };

  if (done) {
    return (
      <div className={s.thanks}>
        <p className={s.script}>{done.yes ? "Merci !" : "Merci de nous prévenir"}</p>
        <p>{done.text}</p>
      </div>
    );
  }

  const drinkOptions = c.drinks.filter((d) => d.trim());
  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <label className={s.fld}>
        Votre prénom et nom
        <input ref={nameRef} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <fieldset>
        <legend>Serez-vous des nôtres ?</legend>
        <label className={s.opt}>
          <input ref={yesRef} type="radio" name="att" checked={att === "oui"} onChange={() => setAtt("oui")} />
          Oui, avec grand plaisir
        </label>
        <label className={s.opt}>
          <input type="radio" name="att" checked={att === "non"} onChange={() => setAtt("non")} />
          Malheureusement, je ne pourrai pas
        </label>
      </fieldset>
      {att !== "non" && (
        <label className={s.fld}>
          Nombre de personnes
          <select value={count} onChange={(e) => setCount(e.target.value)}>
            {["1", "2", "3", "4", "5"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      {drinkOptions.length > 0 && att !== "non" && (
        <fieldset>
          <legend>Vos boissons préférées :</legend>
          <div className={s.drinks}>
            {drinkOptions.map((d) => (
              <label key={d} className={s.opt}>
                <input
                  type="checkbox"
                  checked={drinks.includes(d)}
                  onChange={(e) => setDrinks(e.target.checked ? [...drinks, d] : drinks.filter((x) => x !== d))}
                />
                {d}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {error && <p className={s.err}>{error}</p>}
      <div className={s.formActions}>
        <button ref={sendRef} className={cx(s.pill, s.pillLight)} type="submit" disabled={sending}>
          {sending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}

/* ───────────────────────── Page ───────────────────────── */

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Textes de ce modèle par catégorie, pour les réglages de style du studio des modèles */
const STYLE_SELECTORS = modelSelectors({
  names: cls(s.names),
  titles: cls(s.script, s.heroTitle),
  labels: cls(s.caps, s.pageTag, s.progTime, s.progLabel, s.place),
  numbers: cls(s.bigTime, s.month),
  body: cls(s.muted, s.thanks),
  buttons: cls(s.pill),
});

export default function SceauInvitation({ content, onRsvp, preview, onBackToEdit, onFinalize, hideCta }: Props) {
  const [live, setLive] = useState<Partial<SceauContent> | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const [curtainsGone, setCurtainsGone] = useState(false);
  const [music, setMusic] = useState<"hidden" | "on" | "off">("hidden");
  const [guestName, setGuestName] = useState("");
  const [bouquet, setBouquet] = useState("");
  const [drawHeart, setDrawHeart] = useState(false);
  const mounted = useMounted();

  const timers = useRef<number[]>([]);
  const petalsRef = useRef<HTMLCanvasElement>(null);
  const petals = useRef<PetalEngine | null>(null);
  const musicBox = useRef<Soundtrack | null>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const heartRef = useRef<HTMLElement>(null);

  const c = withDefaults(live ?? content);
  const dates = formatDates(c);
  const mono = initial(c.partnerA) + initial(c.partnerB);
  const revealed = phase === "curtains" || phase === "done";
  const query = venueQuery(c);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Petals engine + music box live for the whole page
  useEffect(() => {
    if (!mounted || !petalsRef.current) return;
    petals.current = startPetals(petalsRef.current, reduce());
    musicBox.current = createSoundtrack();
    const list = timers.current;
    return () => {
      petals.current?.destroy();
      musicBox.current?.destroy();
      list.forEach((t) => window.clearTimeout(t));
    };
  }, [mounted]);

  // The couple's own song (chosen excerpt) replaces the music box when there is one
  useEffect(() => {
    musicBox.current?.setTrack(c.audioUrl, c.audioStart, c.audioEnd);
  }, [mounted, c.audioUrl, c.audioStart, c.audioEnd]);

  useEffect(() => {
    try {
      setBouquet(paintBouquet());
    } catch {
      // Decorative only
    }
  }, []);

  // Personalised name from the link: …/invite/123#famille-diop
  useEffect(() => {
    const tok = window.location.hash.slice(1);
    if (!tok || tok === "rsvp") return;
    setGuestName(decodeURIComponent(tok).replace(/[-_.]/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()));
  }, []);

  // Page scroll stays locked until the curtains have parted (top-level only)
  useEffect(() => {
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

  // Open automatically on wheel or touch swipe up
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

  // Heart is drawn around the day when the calendar comes into view
  useEffect(() => {
    const el = heartRef.current;
    if (!revealed || !el || !("IntersectionObserver" in window) || reduce()) return;
    setDrawHeart(false);
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setDrawHeart(true);
          io.disconnect();
        }
      },
      { threshold: 0.8 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [revealed]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const finish = () => {
    clearTimers();
    setPhase("done");
    setCurtainsGone(true);
    petals.current?.setAmbient(true);
  };

  const open = () => {
    if (phase !== "closed") return;
    const r = sealRef.current?.getBoundingClientRect();
    setPhase("open");
    musicBox.current?.start();
    setMusic("on");
    if (r) petals.current?.burst(r.left + r.width / 2, r.top + r.height / 2, 70);
    const T = reduce() ? [0, 0] : [2700, 4600];
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(T[0], () => {
      setPhase("curtains");
      petals.current?.rain(90);
      petals.current?.burst(window.innerWidth / 2, window.innerHeight * 0.15, 60, Math.PI * 1.6);
    });
    at(T[1], finish);
  };

  // Live preview: the editor (parent window) pushes content and playback commands
  useEffect(() => {
    if (!preview || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data?.type) return;
      if (e.data.type === PREVIEW_MSG.content) setLive(e.data.content);
      if (e.data.type === PREVIEW_MSG.skip) finish();
      if (e.data.type === PREVIEW_MSG.replay) {
        clearTimers();
        musicBox.current?.stop();
        setMusic("hidden");
        window.scrollTo(0, 0);
        setCurtainsGone(false);
        setPhase("closed");
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_MSG.ready }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  const toggleMusic = () => {
    if (music === "on") {
      musicBox.current?.stop();
      setMusic("off");
    } else {
      musicBox.current?.start();
      setMusic("on");
    }
  };

  const giftParagraphs = c.giftsText.split(/\n+/).filter((p) => p.trim());
  const pages = c.programme.filter((p) => p.title.trim() || p.items.some((i) => i.label.trim()));
  const stateCls = cx(phase === "closed" || phase === "open" ? s.pre : s.revealed, revealed && s.curtainsOpen);

  const layers = (
    <div className={cx(s.theme, sceauFontVars, stateCls)}>
      <canvas ref={petalsRef} className={s.petals} aria-hidden="true" />
      {!curtainsGone && (
        <>
          <div className={cx(s.curtain, s.velvet, s.curtL)} aria-hidden="true" />
          <div className={cx(s.curtain, s.velvet, s.curtR)} aria-hidden="true" />
        </>
      )}
      {phase !== "done" && (
        <div
          onClick={phase === "closed" ? open : undefined}
          className={cx(s.gate, s.velvet, phase !== "closed" && s.open, revealed && s.gone, phase === "closed" && "cursor-pointer")}
          role="dialog"
          aria-label="Ouvrir l'invitation"
        >
          <div className={s.gateInner}>
            <div className={s.gateTo}>
              <span className={s.caps}>Invitation pour</span>
              <span className={s.script}>{guestName || c.guestLabel}</span>
            </div>
            <div className={s.env}>
              <div className={s.envBack} />
              <div className={s.letter}>
                <span className={s.caps}>Le mariage de</span>
                <span className={s.script}>
                  {c.partnerA} &amp; {c.partnerB}
                </span>
                <span className={s.caps}>{dates.dots}</span>
              </div>
              <div className={s.pocket} />
              <div className={s.flap} />
              <button ref={sealRef} className={s.seal} onClick={open} aria-label="Briser le sceau et ouvrir l'invitation">
                <Seal mono={mono} seed={11} className={cx(s.half, s.halfL)} />
                <Seal mono={mono} seed={11} className={cx(s.half, s.halfR)} />
              </button>
            </div>
            <div className={s.hint}>Touchez le sceau ou l&apos;écran pour ouvrir</div>
          </div>
          <button
            type="button"
            className={s.skip}
            onClick={(e) => {
              e.stopPropagation();
              finish();
            }}
          >
            Passer
          </button>
        </div>
      )}
      {music !== "hidden" && (
        <button
          className={s.sound}
          onClick={toggleMusic}
          aria-label={music === "on" ? "Couper la musique" : "Activer la musique"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {music === "on" && <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />}
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className={cx(s.theme, s.root, sceauFontVars, stateCls)} data-inv-style="">
      <InvitationStyleTag style={c.style} selectors={STYLE_SELECTORS} />
      <InvitationSections hidden={c.__hidden} rubriques={c.__rubriques} />
      <DrapeDefs />
      <main className={cx(s.col, s.velvet)}>
        <header className={s.hero}>
          <p className={cx(s.script, s.heroTitle, s.hAnim)}>Invitation</p>
          <p className={cx(s.caps, s.hAnim)}>au mariage</p>
          <div className={cx(s.heroEnv, s.hAnim)}>
            <svg viewBox="0 0 300 200" aria-hidden="true">
              <defs>
                <linearGradient id="sr-eb" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8a2236" />
                  <stop offset="1" stopColor="#4a0a16" />
                </linearGradient>
                <linearGradient id="sr-ef" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#93293d" />
                  <stop offset="1" stopColor="#5e0f1e" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" rx="5" fill="url(#sr-eb)" />
              <path d="M0 0 L0 200 L140 104Z" fill="#74182a" />
              <path d="M300 0 L300 200 L160 104Z" fill="#6c1526" />
              <path d="M0 200 L150 92 L300 200Z" fill="#661222" />
              <path d="M0 0 L300 0 L150 112Z" fill="url(#sr-ef)" />
            </svg>
            <Seal mono={mono} seed={11} className={s.heroSeal} />
          </div>
          <h1 className={cx(s.names, s.hAnim)}>
            <span>{c.partnerA}</span>
            <em>&amp;</em>
            <span>{c.partnerB}</span>
          </h1>
          <p className={cx(s.caps, s.hAnim)}>
            {dates.long}
            {c.city && ` · ${c.city}`}
          </p>
        </header>

        <div className={cx(s.block, s.rise)}>
          <div className={cx(s.card, s.arch)}>
            <h2 className={s.script}>{c.welcomeTitle}</h2>
            <p>{c.welcomeText}</p>
            {dates.week.length > 0 && (
              <div className={s.cal} aria-label={`Le mariage a lieu le ${dates.long}`}>
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
                {dates.week.map((n, i) =>
                  n === dates.day && i === dates.week.indexOf(dates.day) ? (
                    <b key={i} ref={heartRef} className={cx(s.day, drawHeart && s.draw)}>
                      {n}
                      <svg viewBox="0 0 60 56" aria-hidden="true">
                        <path d="M30 52C10 39 1 27 4 15 7 3 23 1 30 14 37 1 53 3 56 15 59 27 50 39 32 51" />
                      </svg>
                    </b>
                  ) : (
                    <b key={i}>{n}</b>
                  ),
                )}
              </div>
            )}
            <p className={cx(s.script, s.month)}>{dates.month}</p>
          </div>
          <Drape />
        </div>

        <div className={cx(s.block, s.rise)}>
          <div className={cx(s.card, s.sealed)}>
            <Seal mono={initial(c.partnerA)} seed={5} className={s.cardSeal} />
            <h2 className={s.script}>{c.venueTitle}</h2>
            {c.address && (
              <>
                <p className={s.muted}>à l&apos;adresse :</p>
                <p className={s.place}>{c.address}</p>
              </>
            )}
            {c.venueKind && <p className={s.muted}>{c.venueKind}</p>}
            {c.venue && <p className={cx(s.script, s.venue)}>{c.venue}</p>}
            <MapCard c={c} query={query} mono={mono} />
            <p className={s.muted} style={{ marginTop: 8 }}>
              accueil des invités
            </p>
            <p className={s.bigTime}>à {dates.time}</p>
            {mounted && <Countdown target={weddingDate(c)} />}
          </div>
          <Drape />
        </div>

        {bouquet && <img className={cx(s.bouquet, s.rise)} src={bouquet} alt="Bouquet de roses ivoire et bordeaux" />}

        {pages.map((page, pi) => (
          <section data-inv-sec={`prog-${pi}`} key={pi} className={cx(s.onVelvet, s.rise)}>
            {pages.length > 1 && (
              <p className={cx(s.caps, s.pageTag)}>
                Programme · {pi + 1}/{pages.length}
              </p>
            )}
            <h2 className={s.script}>{page.title || "Programme"}</h2>
            {page.subtitle && <p className={s.caps}>{page.subtitle}</p>}
            <ol className={s.prog}>
              {page.items
                .filter((it) => it.time.trim() || it.label.trim())
                .map((it, i) => (
                  <li key={i}>
                    <span className={s.progTime}>{it.time}</span>
                    <span className={s.progDot} />
                    <span className={s.progLabel}>{it.label}</span>
                  </li>
                ))}
            </ol>
            {page.place.trim() && (
              <div className={s.progPlace}>
                <p>{page.place}</p>
                <a
                  className={cx(s.pill, s.pillLight)}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={mapsLink(page.mapsUrl, page.place)}
                >
                  Itinéraire
                </a>
              </div>
            )}
          </section>
        ))}

        {c.dressColors.length > 0 && (
          <section data-inv-sec="dress" className={cx(s.onVelvet, s.rise)}>
            <h2 className={s.script}>Dress code</h2>
            {c.dressCodeText && <p>{c.dressCodeText}</p>}
            <div className={s.swatches}>
              {c.dressColors.map((col, i) => (
                <div key={i} className={s.sw}>
                  <i style={{ background: col.hex }} />
                  {col.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {(c.giftsTitle || giftParagraphs.length > 0) && (
          <div className={cx(s.block, s.rise)}>
            <div className={cx(s.card, s.sealed)}>
              <Seal mono={initial(c.partnerB)} seed={23} className={s.cardSeal} />
              <h2 className={s.script}>{c.giftsTitle}</h2>
              {giftParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Drape />
          </div>
        )}

        <section data-inv-sec="rsvp" className={cx(s.onVelvet, s.rise)} id="rsvp">
          <h2 className={s.script}>Fiche invité</h2>
          {c.rsvpText && <p>{c.rsvpText}</p>}
          <GuestForm
            c={c}
            guestName={guestName}
            onRsvp={onRsvp}
            onBurst={(x, y) => petals.current?.burst(x, y, 80)}
          />
        </section>

        <footer className={s.footer}>
          <p className={s.caps}>{c.closingText}</p>
          {bouquet && <img className={cx(s.bouquet, s.bouquetSmall)} src={bouquet} alt="" />}
          <p className={s.names}>
            <span>{c.partnerA}</span>
            <em>&amp;</em>
            <span>{c.partnerB}</span>
          </p>
        </footer>

        {!hideCta && (
          <InvitationEndCta
            theme="sceau"
            modelId="invit-9"
            onBackToEdit={onBackToEdit}
            onFinalize={onFinalize}
            hideCta={hideCta}
          />
        )}
      </main>

      {/* Ancestors may be transformed/filtered (page transitions, layouts), which breaks position:fixed —
          so full-screen layers are portaled to <body>. Before hydration, a plain cover hides the page. */}
      {mounted ? createPortal(layers, document.body) : <div className={cx(s.cover, s.velvet)} />}
    </div>
  );
}
