"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import s from "./ivoire.module.css";
import { ivoireFontVars } from "./fonts";
import {
  formatDates,
  initial,
  PREVIEW_MSG,
  printTime,
  weddingDate,
  withDefaults,
  type IvoireContent,
  type Venue,
} from "./content";
import { mapsEmbedUrl, mapsLink, wazeLink } from "../sceau/content";
import { createSoundtrack, type Soundtrack } from "../sceau/effects";
import type { RsvpPayload } from "../velours/VeloursInvitation";
import InvitationEndCta from "../InvitationEndCta";
import InvitationStyleTag, { modelSelectors } from "../InvitationStyleTag";
import { cls } from "@/lib/invitationStyle";

interface Props {
  content?: Partial<IvoireContent> | null;
  /** Called when a guest submits the form; without it the form only shows the thank-you state */
  onRsvp?: (rsvp: RsvpPayload) => Promise<void>;
  /** Accept live content updates from a parent editor (iframe preview) */
  preview?: boolean;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  hideCta?: boolean;
}

const subscribeNoop = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/* ───────────────────────── Decorative pieces ───────────────────────── */

function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** Torn paper edge filled with the colour of the next section, with a fibrous white lip on light papers */
function Torn({ fill, seed, big, top }: { fill: string; seed: number; big?: boolean; top?: boolean }) {
  const { line, lip } = useMemo(() => {
    const r = seeded(seed);
    const pts: [number, number][] = [];
    let x = 0;
    while (x < 400) {
      pts.push([x, (big ? 10 : 12) + r() * (big ? 22 : 16)]);
      x += 3 + r() * (big ? 10 : 12);
    }
    pts.push([400, 14 + r() * 10]);
    const path = (dy: number) => pts.map((p, k) => `${k ? "L" : "M"}${p[0].toFixed(1)} ${(p[1] + dy).toFixed(1)}`).join(" ");
    return { line: path(0), lip: path(-1.8) };
  }, [seed, big]);
  const light = /^#[EF]/i.test(fill);
  return (
    <svg className={cx(s.torn, top ? s.tornTop : s.tornBottom)} viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      {light && <path d={`${lip} L400 40 L0 40Z`} fill="#fff" opacity=".9" />}
      <path d={`${line} L400 40 L0 40Z`} fill={fill} />
      <path d={line} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="1" />
    </svg>
  );
}

function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="iv-waxg" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fbf8f2" />
          <stop offset=".65" stopColor="#e7dfd2" />
          <stop offset="1" stopColor="#c9bead" />
        </radialGradient>
        <symbol id="iv-corner" viewBox="0 0 64 64">
          <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path d="M8 60V22C8 14 14 8 22 8h38" />
            <path d="M14 54V26c0-7 5-12 12-12h28" />
            <path d="M22 30c0-6 4-9 9-9 5 0 7 4 5 7s-7 2-6-2" />
            <path d="M8 22c-4 0-6-3-5-6s5-3 6 0" />
            <path d="M22 8c0-4 3-6 6-5s3 5 0 6" />
            <circle cx="8" cy="60" r="1.6" fill="currentColor" />
            <circle cx="60" cy="8" r="1.6" fill="currentColor" />
          </g>
        </symbol>
        <symbol id="iv-wax" viewBox="0 0 200 92">
          <g fill="none" stroke="#B9AE9F" strokeWidth="1.3" strokeLinecap="round">
            <path d="M8 50c20-8 40-6 56 4M192 50c-20-8-40-6-56 4" />
            <path d="M20 46c6-10 18-12 24-4M180 46c-6-10-18-12-24-4" />
          </g>
          <path
            d="M100 6c8 0 10 5 17 6s11 4 12 11 5 9 4 16 3 11-1 17-3 11-10 13-9 8-17 8-10-5-17-7-11-6-13-12-6-9-4-16-2-12 3-17 6-10 13-11 9-8 17-8z"
            fill="url(#iv-waxg)"
            stroke="#d2c7b6"
            strokeWidth="1"
          />
          <circle cx="100" cy="46" r="27" fill="none" stroke="#cfc4b3" strokeWidth="1.6" />
          <g fill="none" stroke="#b5a995" strokeWidth="1.3" strokeLinecap="round">
            <path d="M100 66V30" />
            <path d="M100 38c-6-6-6-12 0-16 6 4 6 10 0 16z" />
            <path d="M100 48c-8-2-12-8-10-14 6 2 10 8 10 14zM100 48c8-2 12-8 10-14-6 2-10 8-10 14z" />
            <path d="M100 58c-7 0-11-5-11-10 6 0 10 4 11 10zM100 58c7 0 11-5 11-10-6 0-10 4-11 10z" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

/** Real Google map, tinted to the paper; inert until tapped so scrolling never gets trapped */
function VenueMap({ v }: { v: Venue }) {
  const [active, setActive] = useState(false);
  const query = [v.name, v.address].filter((x) => x.trim()).join(", ");
  if (!query && !v.mapsUrl) return null;
  return (
    <>
      <div className={s.map}>
        <iframe
          className={s.mapFrame}
          src={mapsEmbedUrl(v.mapsUrl, query)}
          title={`Plan d'accès : ${v.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ pointerEvents: active ? "auto" : "none" }}
        />
        <div className={s.mapVeil} />
        <span className={s.mapPulse} />
        <span className={s.mapPin}>
          <svg viewBox="0 0 34 46" aria-hidden="true">
            <path d="M17 45S2 27 2 16a15 15 0 0 1 30 0c0 11-15 29-15 29z" fill="#6e1a25" stroke="#4a0f17" />
            <circle cx="17" cy="16" r="6" fill="#f4ecdf" />
          </svg>
        </span>
        <span className={s.mapTag}>{v.name || "Plan d'accès"}</span>
        {!active && (
          <button type="button" className={s.mapShield} onClick={() => setActive(true)} aria-label="Explorer la carte">
            <span>Touchez pour explorer</span>
          </button>
        )}
      </div>
      <div className={s.mapButtons}>
        <a className={s.btnO} href={mapsLink(v.mapsUrl, query)} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          Google Maps
        </a>
        <a className={s.btnO} href={wazeLink(v.mapsUrl, query)} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l18-8-8 18-2-8-8-2z" />
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
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={cx(s.count, s.rv)} data-rv>
      <div><b>{d}</b><span className={s.label}>Jours</span></div>
      <div><b>{pad(Math.floor(left / 3600))}</b><span className={s.label}>Heures</span></div>
      <div><b>{pad(Math.floor((left % 3600) / 60))}</b><span className={s.label}>Minutes</span></div>
      <div><b>{pad(left % 60)}</b><span className={s.label}>Secondes</span></div>
    </div>
  );
}

function RsvpForm({ mono, onRsvp }: { mono: string; onRsvp?: Props["onRsvp"] }) {
  const [name, setName] = useState("");
  const [yes, setYes] = useState(true);
  const [count, setCount] = useState("1");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Indiquez votre nom pour que les mariés sachent qui répond.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await onRsvp?.({ name: name.trim(), phone: "", attending: yes, guests: yes ? Number(count) : 0, message: msg.trim() });
      setDone(true);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cx(s.formCard, s.rv)} data-rv>
      <div className={s.medal}>
        <div>{mono}</div>
      </div>
      {done ? (
        <div className={s.thanks}>
          <span className={s.script}>Merci {name.trim().split(/\s+/)[0]}</span>
          <p>
            {yes
              ? "Votre présence est bien notée. Nous avons hâte de célébrer avec vous."
              : "Vous nous manquerez. Merci d'avoir pris le temps de nous répondre."}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className={s.field}>
            <label htmlFor="ivName">Nom complet</label>
            <input id="ivName" autoComplete="name" placeholder="Votre nom et prénom" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={s.field}>
            <span className={s.lbl}>Serez-vous des nôtres ?</span>
            <div className={s.choice} role="radiogroup">
              <input type="radio" name="ivAtt" id="ivYes" checked={yes} onChange={() => setYes(true)} />
              <label htmlFor="ivYes">Oui, avec joie</label>
              <input type="radio" name="ivAtt" id="ivNo" checked={!yes} onChange={() => setYes(false)} />
              <label htmlFor="ivNo">Nous ne pourrons pas venir</label>
            </div>
          </div>
          {yes && (
            <div className={s.field}>
              <label htmlFor="ivCount">Nombre de personnes</label>
              <select id="ivCount" value={count} onChange={(e) => setCount(e.target.value)}>
                {["1", "2", "3", "4", "5", "6"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
          <div className={s.field}>
            <label htmlFor="ivMsg">Un petit mot pour les mariés (optionnel)</label>
            <textarea id="ivMsg" placeholder="Laissez-leur un message..." value={msg} onChange={(e) => setMsg(e.target.value)} />
          </div>
          {error && <p className={s.err}>{error}</p>}
          <button className={s.btn} type="submit" disabled={sending}>
            {sending ? "Envoi…" : "Confirmer ma présence"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

/** Textes de ce modèle par catégorie, pour les réglages de style du studio des modèles */
const STYLE_SELECTORS = modelSelectors({
  names: cls(s.names, s.amp),
  titles: cls(s.script),
  labels: cls(s.label, s.lbl, s.month, s.when, s.deadline, s.mapTag, s.kind, s.tag, s.dayLabel),
  numbers: cls(s.bigday, s.count),
  body: cls(s.intro, s.prose, s.it, s.love, s.thanks),
  buttons: cls(s.btn, s.btnO),
});

export default function IvoireInvitation({ content, onRsvp, preview, onBackToEdit, onFinalize, hideCta }: Props) {
  const [live, setLive] = useState<Partial<IvoireContent> | null>(null);
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const [music, setMusic] = useState<"hidden" | "on" | "off">("hidden");
  const mounted = useMounted();
  const mainRef = useRef<HTMLElement>(null);
  const musicBox = useRef<Soundtrack | null>(null);
  const timer = useRef(0);

  const c = withDefaults(live ?? content);
  const dates = formatDates(c);
  const mono = `${initial(c.partnerA)}&${initial(c.partnerB)}`;
  const welcome = c.welcomeText.split(/\n\s*\n/).filter((p) => p.trim());
  const blocks = c.programme.filter((b) => b.title.trim() || b.items.some((i) => i.label.trim()));
  const venues = c.venues.filter((v) => v.name.trim() || v.address.trim());

  useEffect(() => {
    musicBox.current = createSoundtrack();
    return () => {
      musicBox.current?.destroy();
      window.clearTimeout(timer.current);
    };
  }, []);

  // The couple's own song (chosen excerpt) replaces the music box when there is one
  useEffect(() => {
    musicBox.current?.setTrack(c.audioUrl, c.audioStart, c.audioEnd);
  }, [c.audioUrl, c.audioStart, c.audioEnd]);

  // Page scroll stays locked behind the envelope (top-level only)
  useEffect(() => {
    if (typeof window !== "undefined" && window.self !== window.top) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  // Inside a preview iframe the visible scrollbar eats into the phone screen: hide it, scrolling still works
  useEffect(() => {
    if (window.self === window.top) return;
    const root = document.documentElement;
    root.classList.add("embedded-preview");
    return () => root.classList.remove("embedded-preview");
  }, []);

  // Open automatically on wheel or touch swipe up
  useEffect(() => {
    if (opened) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        open(true);
      }
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const curY = e.touches[0]?.clientY || 0;
      if (touchStartY - curY > 20) {
        open(true);
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
  }, [opened]);

  // Reveal on scroll once open: only blocks below the fold start hidden
  useEffect(() => {
    const main = mainRef.current;
    if (!opened || !main || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove(s.pre);
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    main.querySelectorAll("[data-rv]").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add(s.pre);
        io.observe(el);
      }
    });
    return () => {
      io.disconnect();
      main.querySelectorAll("[data-rv]").forEach((el) => el.classList.remove(s.pre));
    };
  }, [opened]);

  const open = (withMusic = true) => {
    if (opened) return;
    window.scrollTo(0, 0);
    setOpened(true);
    if (withMusic) {
      musicBox.current?.start();
      setMusic("on");
    }
    timer.current = window.setTimeout(() => setGone(true), 1300);
  };

  // Live preview: the editor (parent window) pushes content and playback commands
  useEffect(() => {
    if (!preview || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data?.type) return;
      if (e.data.type === PREVIEW_MSG.content) setLive(e.data.content);
      if (e.data.type === PREVIEW_MSG.skip) {
        setOpened(true);
        setGone(true);
      }
      if (e.data.type === PREVIEW_MSG.replay) {
        window.clearTimeout(timer.current);
        musicBox.current?.stop();
        setMusic("hidden");
        window.scrollTo(0, 0);
        setGone(false);
        setOpened(false);
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

  const layers = (
    <div className={cx(s.theme, ivoireFontVars)}>
      {!gone && (
        <div className={cx(s.opening, opened && s.go)} onClick={() => open()} aria-label="Enveloppe d'invitation">
          <svg className={s.shadows} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g fill="#8a6a4f" opacity=".35">
              <path d="M-20 40c80 20 140 70 190 150-60-30-120-60-190-70z" />
              <path d="M60 -10c40 60 60 120 50 190-30-50-50-110-50-190z" />
              <path d="M210 -20c-10 70 10 120 60 170-60-20-80-90-60-170z" />
              <path d="M300 20c30 50 70 80 120 90-60 10-110-30-120-90z" />
              <path d="M140 60c50 40 110 50 170 30-50 40-120 50-170-30z" />
              <path d="M-30 210c70-10 130 10 170 60-60 0-120-20-170-60z" />
            </g>
          </svg>
          <svg className={s.blooms} viewBox="0 0 200 140" aria-hidden="true">
            <g fill="#f8f1e6" stroke="#d9c7ae" strokeWidth=".6">
              <g transform="translate(30 30)"><circle r="9" /><circle cx="10" cy="-4" r="7" /><circle cx="-8" cy="8" r="7" /><circle cx="4" cy="10" r="6" /><circle r="3" fill="#e2cfa8" /></g>
              <g transform="translate(70 18)"><circle r="7" /><circle cx="8" cy="3" r="5.5" /><circle cx="-6" cy="5" r="5" /><circle r="2.4" fill="#e2cfa8" /></g>
              <g transform="translate(14 72)"><circle r="7" /><circle cx="7" cy="6" r="5.5" /><circle cx="-5" cy="-6" r="5" /><circle r="2.4" fill="#e2cfa8" /></g>
              <g transform="translate(104 40)"><circle r="5" /><circle cx="6" cy="3" r="4" /><circle r="1.8" fill="#e2cfa8" /></g>
            </g>
            <g stroke="#b9a383" strokeWidth=".8" fill="none">
              <path d="M30 30c20 20 40 30 70 40M70 18c10 20 20 40 50 60M14 72c20 0 40 10 60 30" />
            </g>
          </svg>
          <div className={s.env}>
            <img src="/models/ivoire/envelope.jpg" alt="Enveloppe ivoire scellée d'un sceau de cire doré" />
            <button
              type="button"
              className={s.sealHit}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              aria-label="Ouvrir l'invitation"
            >
              <span className={s.sealMono}>{mono}</span>
            </button>
          </div>
          <div className={s.opHint}>
            <span className={s.script}>{c.openingText}</span>
            <span className={s.label}>Touchez le sceau pour ouvrir</span>
          </div>
          {!opened && (
            <button
              type="button"
              className={s.skip}
              onClick={(e) => {
                e.stopPropagation();
                open(false);
              }}
            >
              Passer
            </button>
          )}
        </div>
      )}
      {music !== "hidden" && (
        <button className={s.music} onClick={toggleMusic} aria-label={music === "on" ? "Couper la musique" : "Activer la musique"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {music === "on" ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className={cx(s.theme, s.root, ivoireFontVars, !opened && s.locked)} data-inv-style="">
      <InvitationStyleTag style={c.style} selectors={STYLE_SELECTORS} />
      <Defs />
      <main ref={mainRef} className={s.inv}>
        {/* ============ HERO ============ */}
        <header className={s.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element -- client photos can be data URLs */}
          <img className={s.heroPhoto} src={c.heroPhoto} alt={`${c.partnerA} et ${c.partnerB}`} style={{ objectPosition: c.heroFocus || "50% 45%" }} />
          <h1 className={cx(s.names, s.heroIn, s.hIn)} style={{ transitionDelay: ".15s" }}>
            <span>{c.partnerA}</span>
            <span className={s.amp}>&amp;</span>
            <span>{c.partnerB}</span>
          </h1>
          <span className={cx(s.label, s.dayLabel, s.heroIn, s.hIn)} style={{ transitionDelay: ".45s" }}>
            {dates.weekday}
          </span>
          <span className={cx(s.bigday, s.heroIn, s.hIn)} style={{ transitionDelay: ".55s" }}>
            {dates.day}
          </span>
          <span className={cx(s.month, s.heroIn, s.hIn)} style={{ transitionDelay: ".65s" }}>
            {dates.monthYear}
          </span>
          {c.heroTimes.some((t) => t.label.trim() || t.time) && (
            <div className={cx(s.times, s.heroIn, s.hIn)} style={{ transitionDelay: ".85s" }}>
              {c.heroTimes.slice(0, 3).map((t, i) => (
                <div key={i}>
                  <span>{t.label}</span>
                  <b>{printTime(t.time)}</b>
                </div>
              ))}
            </div>
          )}
          <a className={cx(s.cue, s.label, s.heroIn, s.hIn)} href="#iv-mot" style={{ transitionDelay: "1.1s" }}>
            Scrollez pour en savoir plus
          </a>
          <Torn fill="#F4EFE7" seed={11} big />
        </header>

        {/* ============ WELCOME ============ */}
        <section className={cx(s.welcome, s.paper, s.center)} id="iv-mot">
          <div className={cx(s.mono, s.rv)} data-rv>
            {initial(c.partnerA)} &amp; {initial(c.partnerB)}
          </div>
          <div className={cx(s.prose, s.rv)} data-rv>
            {c.welcomeLead && <p>{c.welcomeLead}</p>}
            {welcome.map((p, i) => (
              <p key={i} className={s.it}>
                {p}
              </p>
            ))}
          </div>
          <div className={cx(s.sign, s.rv)} data-rv>
            {c.partnerA} &amp; {c.partnerB}
          </div>
          <Torn fill="#EEE7DC" seed={48} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.bowPeek} src="/models/ivoire/bow.svg" alt="" />
        </section>

        {/* ============ DETAILS ============ */}
        <section className={cx(s.details, s.paper, s.paper2)}>
          <div className={cx(s.ovalWrap, s.rv)} data-rv>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/models/ivoire/oval.svg" alt="" />
            <div className={s.tag}>
              <span className={s.pin} />
              <span className={s.script}>
                Voir les
                <br />
                Détails
              </span>
              <span className={s.arrow}>↓</span>
              <p>{c.detailsText}</p>
            </div>
          </div>
        </section>

        {/* ============ VENUES ============ */}
        {venues.length > 0 && (
          <section className={cx(s.venues, s.paper, s.paper2)}>
            {venues.map((v, i) => (
              <div key={i} className={cx(s.venue, s.rv)} data-rv>
                {v.intro && <span className={s.label}>{v.intro}</span>}
                <article className={s.card}>
                  <svg className={s.wax} aria-hidden="true">
                    <use href="#iv-wax" />
                  </svg>
                  {[s.tl, s.tr, s.bl, s.br].map((pos) => (
                    <svg key={pos} className={cx(s.corner, pos)} aria-hidden="true">
                      <use href="#iv-corner" />
                    </svg>
                  ))}
                  <h3>{v.name}</h3>
                  {v.kind && <div className={s.kind}>{v.kind}</div>}
                  {v.address && <address>{v.address}</address>}
                  {v.when && <p className={s.when}>{v.when}</p>}
                  <VenueMap v={v} />
                </article>
              </div>
            ))}
            <Torn fill="#4A0F17" seed={85} />
          </section>
        )}

        {/* ============ PROGRAMME ============ */}
        <section className={s.program}>
          <h2 className={s.rv} data-rv>
            {c.programmeTitle}
          </h2>
          {c.programmeIntro && (
            <p className={cx(s.intro, s.rv)} data-rv>
              {c.programmeIntro}
            </p>
          )}
          {blocks.map((b, bi) => (
            <div key={bi}>
              {b.title && (
                <h3 className={s.rv} data-rv>
                  {b.title}
                </h3>
              )}
              <ol className={cx(s.timeline, s.rv)} data-rv>
                {b.items
                  .filter((it) => it.time || it.label.trim())
                  .map((it, i) => (
                    <li key={i}>
                      <time>{printTime(it.time)}</time>
                      <span>{it.label}</span>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={cx(s.banquet, s.rv)} data-rv src="/models/ivoire/banquet.svg" alt="" />
        </section>

        {/* ============ DRESS CODE (optional) ============ */}
        {c.dressColors.length > 0 && (
          <section className={cx(s.paper, s.dress)}>
            <Torn fill="#4A0F17" seed={122} top />
            <h2 className={s.rv} data-rv>
              Dress code
            </h2>
            {c.dressCodeText && (
              <p className={s.rv} data-rv>
                {c.dressCodeText}
              </p>
            )}
            <div className={cx(s.swatches, s.rv)} data-rv>
              {c.dressColors.map((col, i) => (
                <div key={i} className={s.sw}>
                  <i style={{ background: col.hex }} />
                  {col.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ RSVP ============ */}
        <section className={cx(s.rsvp, s.paper, s.center)} id="rsvp">
          {c.dressColors.length === 0 && <Torn fill="#4A0F17" seed={122} top />}
          <span className={cx(s.label, s.rv)} data-rv>
            Confirmation de présence
          </span>
          <h2 className={s.rv} data-rv>
            {c.rsvpTitle}
          </h2>
          {c.rsvpDeadline && (
            <p className={cx(s.deadline, s.rv)} data-rv>
              {c.rsvpDeadline}
            </p>
          )}
          <RsvpForm mono={mono} onRsvp={onRsvp} />
        </section>

        {/* ============ COUNTDOWN & FINALE ============ */}
        <section className={cx(s.finale, s.paper, s.center)}>
          {mounted && <Countdown target={weddingDate(c)} />}
          <div className={cx(s.love, s.rv)} data-rv>
            {c.loveText}
          </div>
          <div className={cx(s.final, s.rv)} data-rv aria-hidden="true">
            <svg viewBox="0 0 440 475" preserveAspectRatio="xMidYMax meet">
              <defs>
                <pattern id="iv-stripes" width="16" height="10" patternUnits="userSpaceOnUse">
                  <rect width="16" height="10" fill="#f3ece2" />
                  <rect width="8" height="10" fill="#6e1a25" />
                </pattern>
                <linearGradient id="iv-envb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6e1a25" />
                  <stop offset="1" stopColor="#3f0a12" />
                </linearGradient>
                <linearGradient id="iv-envf" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#7d2230" />
                  <stop offset="1" stopColor="#4a0f17" />
                </linearGradient>
                <clipPath id="iv-oval">
                  <ellipse cx="220" cy="290" rx="43" ry="54" />
                </clipPath>
              </defs>
              <path d="M30 150h380v325H30z" fill="url(#iv-envb)" />
              <path d="M44 150L220 40l176 110z" fill="url(#iv-stripes)" />
              <path d="M44 150L220 40l176 110" fill="none" stroke="#4a0f17" strokeWidth="3" />
              <rect x="74" y="48" width="292" height="350" fill="#F6F1EA" stroke="#e5dccf" />
              <rect x="84" y="58" width="272" height="330" fill="none" stroke="#d2c6b4" />
              <g fill="none" stroke="#cbbfac" strokeWidth="1.2">
                <path d="M84 92c18 0 30-12 30-34M356 92c-18 0-30-12-30-34M84 354c18 0 30 12 30 34M356 354c-18 0-30 12-30 34" />
              </g>
              <text x="220" y="100" textAnchor="middle" fontFamily="var(--serif)" fontSize="12" letterSpacing="3.5" fill="#3b2f2c">
                SAVE THE DATE
              </text>
              <text x="220" y="148" textAnchor="middle" fontFamily="var(--script)" fontSize="34" fill="#2e2422" textLength="236" lengthAdjust="spacingAndGlyphs">
                {c.partnerA} &amp; {c.partnerB}
              </text>
              <text x="220" y="184" textAnchor="middle" fontFamily="var(--serif)" fontSize="17" letterSpacing="1.5" fill="#2e2422">
                {dates.dots}
              </text>
              <ellipse cx="220" cy="290" rx="51" ry="62" fill="#efe6d8" stroke="#e1d6c6" strokeWidth="8" />
              {c.finalPhoto ? (
                <image href={c.finalPhoto} x="177" y="236" width="86" height="108" preserveAspectRatio="xMidYMid slice" clipPath="url(#iv-oval)" />
              ) : (
                <>
                  <ellipse cx="220" cy="290" rx="43" ry="54" fill="#d9ccba" />
                  <text x="220" y="300" textAnchor="middle" fontFamily="var(--script)" fontSize="32" fill="#6e1a25">
                    {mono}
                  </text>
                </>
              )}
              <ellipse cx="220" cy="290" rx="43" ry="54" fill="none" stroke="#bfb19d" />
              <path d="M30 300L220 410 410 300v175H30z" fill="url(#iv-envf)" />
              <path d="M30 300L220 410 410 300" fill="none" stroke="#350810" strokeWidth="2" opacity=".6" />
              <g transform="translate(372 330) rotate(-20)">
                <path d="M0 0c-26-14-30-48-6-70 8 20 18 40 6 70z" fill="#fbf7f0" stroke="#e1d5c2" />
                <path d="M-6-70c6 20 6 40 6 70" stroke="#e7c76a" strokeWidth="3" fill="none" />
                <path d="M2 0c-4 30-4 60 0 100" stroke="#6f7f55" strokeWidth="3" fill="none" />
              </g>
              <g transform="translate(396 350) rotate(8)">
                <path d="M0 0c-22-14-24-40-4-58 6 18 14 34 4 58z" fill="#fbf7f0" stroke="#e1d5c2" />
                <path d="M0 0c-2 30 0 60 4 100" stroke="#6f7f55" strokeWidth="3" fill="none" />
              </g>
              <image href="/models/ivoire/bow.svg" x="180" y="372" width="80" height="56" />
            </svg>
          </div>
        </section>
        <footer className={s.footer}>
          <span className={s.label}>
            {c.partnerA} &amp; {c.partnerB} · {dates.long}
          </span>
        </footer>
        {!hideCta && (
          <InvitationEndCta
            theme="ivoire"
            modelId="invit-8"
            onBackToEdit={onBackToEdit}
            onFinalize={onFinalize}
            hideCta={hideCta}
          />
        )}
      </main>

      {/* Ancestors may be transformed/filtered (page transitions, layouts), which breaks position:fixed —
          so full-screen layers are portaled to <body>. Before hydration, a plain cover hides the page. */}
      {mounted ? createPortal(layers, document.body) : <div className={s.cover} />}
    </div>
  );
}
