"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { formatAudioDuration } from "@/lib/messaging/mediaPayload";

interface Props {
  src: string;
  duration?: number;
  isMe: boolean;
}

export function AudioMessagePlayer({ src, duration: initialDuration, isMe }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (!initialDuration && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [src, initialDuration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch((err) => {
        console.warn("Échec de lecture audio:", err);
      });
      setIsPlaying(true);
    }
  };

  const cycleRate = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 py-1 min-w-[240px] sm:min-w-[280px]`}>
      {/* Bouton Play/Pause */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mettre en pause" : "Écouter le message vocal"}
        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm ${
          isMe
            ? "bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#1f1712]"
            : "bg-[#241b13] text-[#d9c08c]"
        }`}
      >
        {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
      </button>

      {/* Barre de forme d'onde / progression */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="relative h-6 flex items-center cursor-pointer group"
        >
          {/* Fausse forme d'onde avec barres */}
          <div className="w-full flex items-center justify-between gap-[2px] sm:gap-[3px] h-full py-1">
            {[40, 65, 30, 85, 95, 50, 70, 45, 90, 60, 35, 80, 100, 75, 55, 90, 40, 65, 85, 50, 70, 30, 60, 40].map(
              (h, idx, arr) => {
                const barPercent = (idx / arr.length) * 100;
                const isPassed = barPercent <= progressPercent;
                return (
                  <span
                    key={idx}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-colors ${
                      isPassed
                        ? isMe
                          ? "bg-[#d9c08c]"
                          : "bg-[#b8924a]"
                        : isMe
                        ? "bg-white/25 group-hover:bg-white/40"
                        : "bg-stone-300 group-hover:bg-stone-400"
                    }`}
                  />
                );
              }
            )}
          </div>
        </div>

        {/* Temps restant / vitesse */}
        <div
          className={`flex items-center justify-between text-[11px] font-medium leading-none ${
            isMe ? "text-stone-300" : "text-stone-500"
          }`}
        >
          <span>
            {formatAudioDuration(currentTime)} / {formatAudioDuration(duration)}
          </span>
          <button
            type="button"
            onClick={cycleRate}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight transition-colors ${
              isMe
                ? "bg-white/10 hover:bg-white/20 text-[#d9c08c]"
                : "bg-stone-100 hover:bg-stone-200 text-[#8f6f33]"
            }`}
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}
