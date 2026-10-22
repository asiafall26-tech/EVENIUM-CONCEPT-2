"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cake,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  MapPin,
  Martini,
  Music,
  PartyPopper,
  Sparkles,
  Volume2,
  VolumeX,
  Wine,
  type LucideIcon,
} from "lucide-react";
import InvitationEndCta from "../InvitationEndCta";
import InvitationStyleTag from "../InvitationStyleTag";
import type { RsvpPayload } from "../velours/VeloursInvitation";
import { anniversaireFontVars } from "./fonts";
import s from "./anniversaire.module.css";
import {
  ASSETS,
  DEFAULT_ANNIVERSAIRE,
  eventDate,
  formatDates,
  mapsLink,
  printTime,
  withDefaults,
  type AnniversaireContent,
  type ProgrammeIcon,
} from "./content";

const ICONS: Record<ProgrammeIcon, LucideIcon> = {
  diner: Wine,
  gateau: Cake,
  ambiance: Music,
  souvenirs: Camera,
  cadeaux: Gift,
  cocktail: Martini,
  danse: Sparkles,
  surprise: PartyPopper,
};

interface Props {
  content?: AnniversaireContent;
  onRsvp?: (rsvp: RsvpPayload) => Promise<void>;
  /** Démo publique du modèle */
  preview?: boolean;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  hideCta?: boolean;
}

function Swirl({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 30" fill="none" aria-hidden>
      <path d="M2 18c40 0 60-14 98-14 30 0 22 20 30 20s8-20 30-20c38 0 58 14 98 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M124 15c2-6 10-6 6 0-2 3-6 3-6 0z" fill="currentColor" />
    </svg>
  );
}

function useCountdownDays(target: Date | null) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const update = () => setDays(Math.ceil((target.getTime() - Date.now()) / 86_400_000));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [target]);
  return days;
}

/** Musique facultative : l'extrait choisi tourne en boucle après la première interaction. */
function useMusic(c: AnniversaireContent) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const state: "off" | "on" | "none" = !c.audioUrl ? "none" : playing ? "on" : "off";

  useEffect(() => {
    if (!c.audioUrl) return;
    const a = new Audio(c.audioUrl);
    a.preload = "auto";
    const start = c.audioStart ?? 0;
    const end = c.audioEnd ?? 0;
    a.currentTime = start;
    const loop = () => {
      if (end > start && a.currentTime >= end) a.currentTime = start;
    };
    a.addEventListener("timeupdate", loop);
    a.addEventListener("ended", () => {
      a.currentTime = start;
      a.play().catch(() => {});
    });
    audio.current = a;
    return () => {
      a.pause();
      setPlaying(false);
      a.removeEventListener("timeupdate", loop);
      audio.current = null;
    };
  }, [c.audioUrl, c.audioStart, c.audioEnd]);

  const play = () => {
    if (!audio.current) return;
    audio.current.play().then(() => setPlaying(true)).catch(() => {});
  };
  const toggle = () => {
    if (!audio.current) return;
    if (state === "on") {
      audio.current.pause();
      setPlaying(false);
    } else play();
  };
  return { state, play, toggle };
}

function RsvpSheet({ c, onRsvp, onClose }: { c: AnniversaireContent; onRsvp?: Props["onRsvp"]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Indiquez votre nom.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onRsvp?.({ name: name.trim(), phone: "", attending, guests: attending ? Math.max(1, guests) : 0, message: message.trim() });
      setDone(true);
    } catch {
      setError("Votre réponse n'a pas pu être envoyée. Réessayez dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={s.overlay} role="dialog" aria-modal="true" aria-label="Confirmer ma présence" onClick={onClose}>
      <div className={s.sheet} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <h2>Merci !</h2>
            <p className={s.sheetText}>
              {attending ? `Votre présence est bien notée. ${c.celebrant ? `${c.celebrant} a hâte de vous retrouver !` : ""}` : "Votre réponse est bien notée. Merci de nous avoir prévenus."}
            </p>
            <button type="button" className={s.submit} onClick={onClose}>
              Fermer
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2>Serez-vous là ?</h2>
            {c.rsvpDeadline && <p className={s.sheetText}>{c.rsvpDeadline}</p>}
            <label className={s.field}>
              <span>Votre nom</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <div className={s.choice}>
              <button type="button" className={attending ? s.chosen : ""} onClick={() => setAttending(true)}>
                Avec joie
              </button>
              <button type="button" className={!attending ? s.chosen : ""} onClick={() => setAttending(false)}>
                Je ne pourrai pas
              </button>
            </div>
            {attending && (
              <label className={s.field}>
                <span>Nombre de personnes (vous compris)</span>
                <input type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} />
              </label>
            )}
            <label className={s.field}>
              <span>Un petit mot (facultatif)</span>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            {error && <p className={s.error}>{error}</p>}
            <button type="submit" className={s.submit} disabled={sending}>
              {sending ? "Envoi…" : "Envoyer ma réponse"}
            </button>
            <button type="button" className={s.cancel} onClick={onClose}>
              Annuler
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AnniversaireInvitation({ content, onRsvp, preview, onBackToEdit, onFinalize, hideCta }: Props) {
  const c = useMemo(() => withDefaults(content ?? DEFAULT_ANNIVERSAIRE), [content]);
  const dates = formatDates(c);
  const target = useMemo(() => eventDate(c), [c]);
  const days = useCountdownDays(target);
  const music = useMusic(c);
  const [page, setPage] = useState<0 | 1>(0);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const maps = mapsLink(c);

  const goTo = (p: 0 | 1) => {
    setPage(p);
    if (music.state === "off") music.play();
  };

  // ?page=2 ouvre directement la page de l'invitation
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("page") !== "2") return;
    const id = requestAnimationFrame(() => setPage(1));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage(1);
      if (e.key === "ArrowLeft") setPage(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const subtitle = c.coverSubtitle || [c.celebrant, c.age && `${c.age} ans`].filter(Boolean).join(" · ");

  return (
    <div className={`${s.root} ${anniversaireFontVars}`} data-inv-style="">
      <InvitationStyleTag style={c.style} />
      {music.state !== "none" && (
        <button type="button" className={s.music} onClick={music.toggle} aria-label={music.state === "on" ? "Couper la musique" : "Activer la musique"}>
          {music.state === "on" ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      <div className={s.stage}>
        <div
          className={s.book}
          data-page={page}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx < -40) goTo(1);
            if (dx > 40) goTo(0);
            touchX.current = null;
          }}
        >
          {/* ── PAGE 1 : COUVERTURE ── */}
          <section className={`${s.page} ${s.cover}`} aria-label="Page 1 : couverture">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.coverPhoto} src={c.coverPhoto} alt="" style={{ objectPosition: c.coverFocus }} />
            <div className={s.coverGlow} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.coverFlowers} src={`${ASSETS}/fleurs-haut-photo.jpg`} alt="" />
            <div className={s.coverHead}>
              <h1 className={s.coverTitle}>{c.coverTitle}</h1>
              <div className={s.heart} aria-hidden>
                ♥
              </div>
              {subtitle && <p className={s.coverSubtitle}>{subtitle}</p>}
            </div>
            <svg className={s.coverWave} viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
              <path d="M0 24 C 90 54, 170 0, 260 22 S 370 40, 400 14 L 400 60 L 0 60 Z" fill="#5b0e1d" />
              <path d="M0 24 C 90 54, 170 0, 260 22 S 370 40, 400 14" fill="none" stroke="#c9a35c" strokeWidth="1.4" />
            </svg>
            <div className={s.coverFrame} />
            <button type="button" className={s.openBtn} onClick={() => goTo(1)}>
              Ouvrir l&apos;invitation <ChevronRight size={14} />
            </button>
          </section>

          {/* ── PAGE 2 : INVITATION ── */}
          <section className={`${s.page} ${s.card} ${s.second}`} aria-label="Page 2 : invitation">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${s.deco} ${s.decoTopLeft}`} src={`${ASSETS}/fleurs-haut.jpg`} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${s.deco} ${s.decoTopRight}`} src={`${ASSETS}/feuilles-haut-droite.jpg`} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${s.deco} ${s.decoBottomLeft}`} src={`${ASSETS}/feuilles-bas-gauche.jpg`} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${s.deco} ${s.decoBottomRight}`} src={`${ASSETS}/fleurs-bas.jpg`} alt="" />
            <div className={s.cardFrame} />

            <div className={s.cardBody}>
              {c.kicker && <p className={s.kicker}>{c.kicker}</p>}
              <h2 className={s.cardTitle}>{c.title}</h2>
              {c.celebrant && !c.coverSubtitle && <p className={s.celebrant}>{[c.celebrant, c.age && `${c.age} ans`].filter(Boolean).join(" · ")}</p>}
              <div className={s.heart} aria-hidden>
                ♥
              </div>
              {c.message && <p className={s.message}>{c.message}</p>}

              <div className={s.infos}>
                <div className={s.info}>
                  <CalendarDays className={s.infoIcon} />
                  <span className={s.infoBig}>
                    {dates.weekday}
                    <br />
                    {dates.dayMonth}
                    <br />
                    {dates.year}
                  </span>
                </div>
                <div className={s.info}>
                  <Clock className={s.infoIcon} />
                  {c.timeLabel && <span className={s.infoSmall}>{c.timeLabel}</span>}
                  <span className={s.infoBig}>{c.time ? printTime(c.time) : "—"}</span>
                </div>
                <a className={`${s.info} ${s.mapLink}`} href={maps || undefined} target="_blank" rel="noopener noreferrer" aria-label={`Itinéraire vers ${c.venueName}`}>
                  <MapPin className={s.infoIcon} />
                  <span className={s.infoSmall}>{c.venueName}</span>
                  <span className={s.infoBig}>{c.venueCity}</span>
                </a>
              </div>

              <div className={s.heart} aria-hidden style={{ marginTop: "4cqw" }}>
                ♥
              </div>

              {c.programme.length > 0 && (
                <>
                  {c.programmeTitle && <p className={s.programmeTitle}>{c.programmeTitle}</p>}
                  <div className={s.programme}>
                    {c.programme.map((p, i) => {
                      const Icon = ICONS[p.icon] ?? PartyPopper;
                      return (
                        <div key={i} className={s.progItem}>
                          <Icon className={s.progIcon} />
                          <span>{p.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <Swirl className={s.swirl} />
              {c.closing && (
                <p className={s.closing}>
                  {c.closing} <span>♥</span>
                </p>
              )}
            </div>
          </section>
        </div>

        <div className={s.mobileNav}>
          <button type="button" className={s.navBtn} onClick={() => goTo(0)} disabled={page === 0} aria-label="Page précédente">
            <ChevronLeft size={18} />
          </button>
          <div className={s.dots}>
            {[0, 1].map((p) => (
              <button key={p} type="button" className={`${s.dot} ${page === p ? s.dotActive : ""}`} onClick={() => goTo(p as 0 | 1)} aria-label={`Page ${p + 1}`} />
            ))}
          </div>
          <span>Page {page + 1} / 2</span>
          <button type="button" className={s.navBtn} onClick={() => goTo(1)} disabled={page === 1} aria-label="Page suivante">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={s.actions}>
        <button type="button" className={s.actionPrimary} onClick={() => setRsvpOpen(true)}>
          <Heart size={14} /> Confirmer ma présence
        </button>
        {maps && (
          <a className={s.action} href={maps} target="_blank" rel="noopener noreferrer">
            <MapPin size={14} /> Itinéraire
          </a>
        )}
      </div>
      {days !== null && days > 0 && <p className={s.countdown}>Plus que {days} jour{days > 1 ? "s" : ""} avant la fête</p>}
      {days === 0 && <p className={s.countdown}>C&apos;est aujourd&apos;hui !</p>}
      {c.rsvpDeadline && <p className={s.deadline}>{c.rsvpDeadline}</p>}

      {rsvpOpen && <RsvpSheet c={c} onRsvp={preview && !onRsvp ? async () => {} : onRsvp} onClose={() => setRsvpOpen(false)} />}

      {!hideCta && (
        <InvitationEndCta theme="velours" modelId="invit-11" onBackToEdit={onBackToEdit} onFinalize={onFinalize} hideCta={hideCta} />
      )}
    </div>
  );
}
