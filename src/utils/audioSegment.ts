/**
 * Plays only part of a track: from `start` to `end` (seconds), looping on that part.
 * `end` <= `start` (e.g. 0) means "until the end of the track".
 */
export interface AudioRange {
  start: number;
  end: number;
}

/** Normalises a saved range (missing / negative values become 0) */
export function cleanRange(start?: number | null, end?: number | null): AudioRange {
  const s = Number.isFinite(start) && (start as number) > 0 ? (start as number) : 0;
  const e = Number.isFinite(end) && (end as number) > s ? (end as number) : 0;
  return { start: s, end: e };
}

/**
 * Keeps `audio` inside the range returned by `getRange` (read on every event, so it can change live).
 * Returns a cleanup function.
 */
export function bindSegment(audio: HTMLAudioElement, getRange: () => AudioRange): () => void {
  audio.loop = true;
  const outside = () => {
    const { start, end } = getRange();
    return audio.currentTime < start - 0.3 || (end > start && audio.currentTime >= end);
  };
  const toStart = () => {
    try {
      audio.currentTime = getRange().start;
    } catch {
      // metadata not loaded yet: onLoaded will place it
    }
  };
  const onPlay = () => {
    if (outside()) toStart();
  };
  // Also catches the native loop, which would restart at 0:00 instead of the chosen start
  const onTime = () => {
    if (!audio.paused && outside()) toStart();
  };
  const onLoaded = () => {
    if (outside()) toStart();
  };
  audio.addEventListener("play", onPlay);
  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("loadedmetadata", onLoaded);
  if (audio.readyState >= 1) onLoaded();
  return () => {
    audio.removeEventListener("play", onPlay);
    audio.removeEventListener("timeupdate", onTime);
    audio.removeEventListener("loadedmetadata", onLoaded);
  };
}

/** "75.4" → "1:15" */
export function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
