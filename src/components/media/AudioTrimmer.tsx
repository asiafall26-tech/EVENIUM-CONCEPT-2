"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Minus, Pause, Play, Plus, RotateCcw, Scissors } from "lucide-react";
import { formatTime } from "@/utils/audioSegment";

interface Props {
  url: string;
  /** seconds */
  start: number;
  /** seconds; 0 = until the end of the track */
  end: number;
  onChange: (start: number, end: number) => void;
}

const BARS = 90;
/** Shortest excerpt that can be chosen, in seconds */
const MIN_LENGTH = 5;

/** Reads the track once to draw its waveform; returns null when the file cannot be decoded (CORS, format…) */
async function loadPeaks(url: string, signal: AbortSignal): Promise<number[] | null> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const audio = await ctx.decodeAudioData(buf);
    ctx.close();
    const data = audio.getChannelData(0);
    const block = Math.floor(data.length / BARS);
    const peaks: number[] = [];
    for (let i = 0; i < BARS; i++) {
      let max = 0;
      for (let j = i * block; j < (i + 1) * block; j += 32) max = Math.max(max, Math.abs(data[j]));
      peaks.push(max);
    }
    const top = Math.max(...peaks, 0.01);
    return peaks.map((p) => Math.max(0.08, p / top));
  } catch {
    return null;
  }
}

/** Lets the user pick the part of a song played by the invitation. */
export function AudioTrimmer({ url, start: startProp, end: endProp, onChange }: Props) {
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [loadingWave, setLoadingWave] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: "start" | "end" | "move"; offset: number } | null>(null);

  // Shortest excerpt (shorter for very short files), and saved values kept inside the actual file length
  const minLen = duration ? Math.min(MIN_LENGTH, duration) : MIN_LENGTH;
  const start = duration ? Math.min(startProp, Math.max(0, duration - minLen)) : startProp;
  const wantedEnd = endProp > startProp ? endProp : duration;
  const realEnd = duration ? Math.max(start + minLen, Math.min(wantedEnd, duration)) : wantedEnd;
  const end = endProp;
  const range = useRef({ start, end: realEnd });
  useEffect(() => {
    range.current = { start, end: realEnd };
  }, [start, realEnd]);

  // Duration + waveform of the current track
  useEffect(() => {
    const ctrl = new AbortController();
    const a = new Audio();
    a.preload = "metadata";
    a.src = url;
    const onMeta = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    a.addEventListener("loadedmetadata", onMeta);
    audioRef.current = a;
    loadPeaks(url, ctrl.signal).then((p) => {
      if (ctrl.signal.aborted) return;
      setPeaks(p);
      setLoadingWave(false);
    });
    const onTime = () => {
      const { start: s, end: e } = range.current;
      setPlayhead(a.currentTime);
      if (e > s && a.currentTime >= e) {
        a.pause();
        a.currentTime = s;
        setPlaying(false);
        setPlayhead(null);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setPlayhead(null);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    return () => {
      ctrl.abort();
      a.pause();
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      audioRef.current = null;
      setPlaying(false);
      setPlayhead(null);
      setPeaks(null);
      setLoadingWave(true);
      setDuration(0);
    };
  }, [url]);

  const commit = useCallback(
    (s: number, e: number) => {
      if (!duration) return;
      s = Math.max(0, Math.min(s, duration - minLen));
      e = Math.min(duration, Math.max(e, s + minLen));
      // Whole track = no custom end, so the invitation keeps working if the file length changes
      onChange(Math.round(s * 10) / 10, e >= duration - 0.2 ? 0 : Math.round(e * 10) / 10);
    },
    [duration, minLen, onChange]
  );

  const timeAt = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r || !duration) return 0;
    return Math.min(duration, Math.max(0, ((clientX - r.left) / r.width) * duration));
  };

  const startDrag = (kind: "start" | "end" | "move", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { kind, offset: timeAt(e.clientX) - start };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const t = timeAt(e.clientX);
    const len = realEnd - start;
    if (d.kind === "start") commit(Math.min(t, realEnd - minLen), realEnd);
    else if (d.kind === "end") commit(start, Math.max(t, start + minLen));
    else {
      const s = Math.max(0, Math.min(t - d.offset, duration - len));
      commit(s, s + len);
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  // Click on the waveform: move the closest handle there
  const onTrackClick = (e: React.MouseEvent) => {
    if (!duration) return;
    const t = timeAt(e.clientX);
    if (Math.abs(t - start) <= Math.abs(t - realEnd)) commit(Math.min(t, realEnd - minLen), realEnd);
    else commit(start, Math.max(t, start + minLen));
  };

  const togglePreview = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      setPlayhead(null);
      return;
    }
    a.currentTime = start;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const nudge = (which: "start" | "end", delta: number) => {
    if (which === "start") commit(Math.min(start + delta, realEnd - minLen), realEnd);
    else commit(start, Math.max(realEnd + delta, start + minLen));
  };

  const pct = (t: number) => (duration ? `${(t / duration) * 100}%` : "0%");
  const isWhole = start === 0 && end === 0;

  return (
    <div className="rounded-2xl border border-[#b8924a]/30 bg-gradient-to-b from-[#fbf7f0] to-white p-3 sm:p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Scissors size={14} className="text-[#8f6f33]" /> Partie du morceau jouée sur l&apos;invitation
        </p>
        {!isWhole && (
          <button
            type="button"
            onClick={() => onChange(0, 0)}
            className="text-[11px] font-semibold text-[#8f6f33] hover:text-black flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} /> Tout le morceau
          </button>
        )}
      </div>

      {/* Waveform + selection */}
      <div
        ref={trackRef}
        onClick={onTrackClick}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-20 sm:h-24 rounded-xl bg-gray-100/90 overflow-hidden cursor-pointer select-none touch-none border border-gray-200/60"
      >
        {/* Bars */}
        <div className="absolute inset-0 flex items-center gap-[2px] px-1">
          {loadingWave && !peaks ? (
            <div className="w-full flex items-center justify-center text-[11px] text-gray-400 gap-1.5">
              <Loader2 size={13} className="animate-spin" /> Analyse du morceau…
            </div>
          ) : (
            (peaks ?? Array.from({ length: BARS }, (_, i) => 0.35 + 0.25 * Math.abs(Math.sin(i * 0.7)))).map((p, i) => {
              const t = ((i + 0.5) / BARS) * duration;
              const inside = t >= start && t <= realEnd;
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${inside ? "bg-[#b8924a]" : "bg-gray-300"}`}
                  style={{ height: `${p * 88}%` }}
                />
              );
            })
          )}
        </div>

        {duration > 0 && (
          <>
            {/* Selected window (drag to move) */}
            <div
              onPointerDown={(e) => startDrag("move", e)}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 bottom-0 bg-[#b8924a]/15 border-y-2 border-[#b8924a] cursor-grab active:cursor-grabbing"
              style={{ left: pct(start), width: `calc(${pct(realEnd)} - ${pct(start)})` }}
              title="Faites glisser pour déplacer l'extrait"
            />
            {/* Handles : zone tactile élargie pour le confort mobile */}
            {(["start", "end"] as const).map((k) => (
              <div
                key={k}
                onPointerDown={(e) => startDrag(k, e)}
                onClick={(e) => e.stopPropagation()}
                role="slider"
                aria-label={k === "start" ? "Début de l'extrait" : "Fin de l'extrait"}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(k === "start" ? start : realEnd)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") nudge(k, -1);
                  if (e.key === "ArrowRight") nudge(k, 1);
                }}
                className="absolute top-0 bottom-0 w-6 -ml-3 flex items-center justify-center cursor-ew-resize z-10 focus:outline-none group touch-none"
                style={{ left: pct(k === "start" ? start : realEnd) }}
              >
                <span className="w-2 h-14 rounded-full bg-[#241b13] ring-2 ring-white shadow-lg group-focus:ring-[#b8924a] transition-transform group-hover:scale-110" />
              </div>
            ))}
            {/* Playhead */}
            {playhead !== null && <span className="absolute top-0 bottom-0 w-0.5 bg-[#E53935] pointer-events-none" style={{ left: pct(playhead) }} />}
          </>
        )}
      </div>

      {/* Times + controls : 2 cards spacieuses Début / Fin pour mobile et desktop */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {(["start", "end"] as const).map((k) => (
          <div key={k} className="bg-white rounded-xl border border-gray-200/90 p-2 sm:p-2.5 flex items-center justify-between gap-1 shadow-2xs">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500">{k === "start" ? "Début" : "Fin"}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => nudge(k, -1)}
                aria-label="Reculer d'une seconde"
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="font-mono font-bold text-xs sm:text-sm text-gray-900 w-10 text-center">
                {formatTime(k === "start" ? start : realEnd)}
              </span>
              <button
                type="button"
                onClick={() => nudge(k, 1)}
                aria-label="Avancer d'une seconde"
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
          <span className="font-medium">Durée de l&apos;extrait :</span>
          <span className="font-mono font-bold text-gray-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
            {formatTime(Math.max(0, realEnd - start))}
          </span>
        </span>

        <button
          type="button"
          onClick={togglePreview}
          disabled={!duration}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#241b13] text-[#d9c08c] text-xs font-bold hover:bg-black shadow-sm disabled:opacity-40 transition-all active:scale-98"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Arrêter la lecture" : "Écouter l'extrait choisi"}
        </button>
      </div>

      <p className="text-[10px] text-gray-400">Faites glisser les poignées ou l&apos;extrait doré. L&apos;extrait est joué en boucle sur l&apos;invitation.</p>
    </div>
  );
}
