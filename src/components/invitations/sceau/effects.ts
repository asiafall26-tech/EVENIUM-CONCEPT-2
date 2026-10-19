import { bindSegment, cleanRange, type AudioRange } from "@/utils/audioSegment";
// Imperative visual/audio effects of the "Sceau d'Or" model (canvas + Web Audio), kept out of React.

export function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Irregular wax blob outline for a seal, stable for a given seed */
export function sealPath(seed: number) {
  const R = rng(seed);
  const n = 24;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 43 + R() * 6 - (i % 6 === 0 ? 3 : 0);
    pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
  }
  const mid = (a: number[], b: number[]) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  let d = "M" + mid(pts[n - 1], pts[0]);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mid(p, q)}`;
  }
  return d + " Z";
}

/* ---------- Painted bouquet (returns a PNG data URL) ---------- */

export function paintBouquet(): string {
  const W = 760;
  const H = 540;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return "";
  const R = rng(42);
  const cx = W / 2;
  const cy = H * 0.5;

  function leaf(x: number, y: number, len: number, ang: number, col: string[]) {
    g!.save();
    g!.translate(x, y);
    g!.rotate(ang);
    const gr = g!.createLinearGradient(0, 0, len, 0);
    gr.addColorStop(0, col[1]);
    gr.addColorStop(1, col[0]);
    g!.fillStyle = gr;
    g!.beginPath();
    g!.moveTo(0, 0);
    g!.quadraticCurveTo(len * 0.5, -len * 0.3, len, 0);
    g!.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0);
    g!.fill();
    g!.strokeStyle = "rgba(255,240,220,.25)";
    g!.lineWidth = 1.2;
    g!.beginPath();
    g!.moveTo(4, 0);
    g!.quadraticCurveTo(len * 0.5, -len * 0.03, len * 0.92, 0);
    g!.stroke();
    g!.restore();
  }

  function sprig(x: number, y: number, len: number, ang: number) {
    g!.save();
    g!.translate(x, y);
    g!.rotate(ang);
    g!.strokeStyle = "#bfa57f";
    g!.lineWidth = 1.6;
    g!.beginPath();
    g!.moveTo(0, 0);
    g!.quadraticCurveTo(len * 0.5, -14, len, -4);
    g!.stroke();
    for (let t = 0.3; t < 1; t += 0.06) {
      const px = len * t;
      const py = -14 * 4 * t * (1 - t) - 4 * t * t;
      g!.fillStyle = R() < 0.5 ? "#e5d2b2" : "#cdb38b";
      g!.beginPath();
      g!.ellipse(px, py - 5, 2.6, 5.5, -0.5, 0, 7);
      g!.fill();
      g!.beginPath();
      g!.ellipse(px, py + 5, 2.6, 5.5, 0.5, 0, 7);
      g!.fill();
    }
    g!.restore();
  }

  function berries(x: number, y: number) {
    for (let i = 0; i < 7; i++) {
      const a = R() * 7;
      const r = R() * 16;
      g!.fillStyle = R() < 0.5 ? "#6e1426" : "#4a0a16";
      g!.beginPath();
      g!.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 4 + R() * 3, 0, 7);
      g!.fill();
      g!.fillStyle = "rgba(255,255,255,.35)";
      g!.beginPath();
      g!.arc(x + Math.cos(a) * r - 1.5, y + Math.sin(a) * r - 1.5, 1.3, 0, 7);
      g!.fill();
    }
  }

  function rose(x: number, y: number, r: number, p: string[]) {
    g!.save();
    g!.translate(x, y);
    g!.rotate(R() * 6);
    g!.shadowColor = "rgba(25,0,6,.35)";
    g!.shadowBlur = r * 0.14;
    g!.shadowOffsetY = 2;
    for (let L = 0; L < 6; L++) {
      const rr = r * (1 - L * 0.15);
      const n = 5 + (L % 2);
      const off = L * 0.55 + R() * 0.4;
      for (let k = 0; k < n; k++) {
        const a = off + (k * Math.PI * 2) / n;
        g!.save();
        g!.rotate(a);
        const gr = g!.createRadialGradient(0, 0, rr * 0.05, 0, 0, rr);
        gr.addColorStop(0, p[2]);
        gr.addColorStop(0.6, p[1]);
        gr.addColorStop(1, p[0]);
        g!.fillStyle = gr;
        g!.beginPath();
        g!.moveTo(0, 0);
        g!.bezierCurveTo(rr * 0.3, -rr * 0.78, rr * 1.08, -rr * 0.62, rr, 0);
        g!.bezierCurveTo(rr * 1.08, rr * 0.62, rr * 0.3, rr * 0.78, 0, 0);
        g!.fill();
        g!.restore();
      }
    }
    g!.shadowColor = "transparent";
    g!.strokeStyle = p[2];
    g!.lineWidth = Math.max(1.2, r * 0.035);
    for (let j = 0; j < 3; j++) {
      g!.beginPath();
      g!.arc(0, 0, r * (0.08 + j * 0.07), j, j + 4.2);
      g!.stroke();
    }
    g!.restore();
  }

  const leafCols = [
    ["#a9987c", "#5a4b3b"],
    ["#8d7c63", "#4d3f31"],
    ["#c2b293", "#6f5f4c"],
  ];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.25;
    const len = 120 + R() * 110 * (Math.abs(Math.cos(a)) * 0.7 + 0.3);
    leaf(cx + Math.cos(a) * 50, cy + Math.sin(a) * 34, len, a, leafCols[i % 3]);
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.3;
    sprig(cx + Math.cos(a) * 60, cy + Math.sin(a) * 40, 150 + R() * 90, a);
  }
  [
    [cx - 190, cy + 40],
    [cx + 200, cy + 30],
    [cx + 40, cy + 120],
    [cx - 60, cy - 110],
    [cx + 150, cy - 90],
  ].forEach((b) => berries(b[0], b[1]));
  const iv = ["#fffaf2", "#ecdcc6", "#ad9374"];
  const bg = ["#b6485c", "#7e1b2b", "#2b040b"];
  const bl = ["#f2dcd5", "#d7a9ac", "#86525b"];
  const roses: [number, number, number, string[]][] = [
    [cx - 60, cy - 82, 40, bl],
    [cx + 48, cy - 96, 38, bg],
    [cx - 160, cy - 30, 36, iv],
    [cx + 170, cy - 34, 34, bg],
    [cx + 8, cy - 22, 86, iv],
    [cx - 104, cy + 18, 64, bg],
    [cx + 112, cy + 16, 60, iv],
    [cx - 30, cy + 82, 52, bg],
    [cx + 62, cy + 90, 44, bl],
  ];
  roses.sort((a, b) => a[1] - b[1]).forEach((r) => rose(r[0], r[1], r[2], r[3]));
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 0.15 + i * 0.25;
    leaf(cx + 40 + Math.cos(a) * 90, cy + Math.sin(a) * 90, 70, a, leafCols[1]);
  }
  return c.toDataURL("image/png");
}

/* ---------- Falling petals ---------- */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  rot: number;
  vr: number;
  flip: number;
  vf: number;
  sw: number;
  c: string[];
  burst: boolean;
}

const PETAL_COLORS = [
  ["#9c2a3c", "#5c0f1d"],
  ["#7e1b2b", "#3d0711"],
  ["#f6ede1", "#d9c5ad"],
  ["#ecd2cb", "#b98d93"],
  ["#e2c06a", "#a07a2a"],
];

export interface PetalEngine {
  burst: (x: number, y: number, n: number, spread?: number) => void;
  rain: (n: number) => void;
  setAmbient: (on: boolean) => void;
  destroy: () => void;
}

export function startPetals(cv: HTMLCanvasElement, reduce: boolean): PetalEngine {
  const cx = cv.getContext("2d");
  const ps: Petal[] = [];
  let W = 0;
  let H = 0;
  let ambient = false;
  let frame = 0;

  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * d;
    cv.height = H * d;
    cx?.setTransform(d, 0, 0, d, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  function petal(x: number, y: number, vx: number, vy: number, burst: boolean): Petal {
    const c = PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0];
    const gold = c === PETAL_COLORS[4];
    return {
      x, y, vx, vy, burst, c,
      s: (gold ? 3 : 7) + Math.random() * (gold ? 3 : 8),
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.08,
      flip: Math.random() * 6,
      vf: 0.04 + Math.random() * 0.06,
      sw: Math.random() * 6,
    };
  }

  function draw(p: Petal) {
    if (!cx) return;
    cx.save();
    cx.translate(p.x, p.y);
    cx.rotate(p.rot);
    cx.scale(Math.cos(p.flip), 1);
    const gr = cx.createLinearGradient(0, -p.s, 0, p.s);
    gr.addColorStop(0, p.c[0]);
    gr.addColorStop(1, p.c[1]);
    cx.fillStyle = gr;
    cx.beginPath();
    cx.moveTo(0, -p.s);
    cx.bezierCurveTo(p.s * 0.95, -p.s * 0.9, p.s * 0.8, p.s * 0.6, 0, p.s);
    cx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s * 0.95, -p.s * 0.9, 0, -p.s);
    cx.fill();
    cx.restore();
  }

  function loop() {
    cx?.clearRect(0, 0, W, H);
    if (ambient && ps.length < 16 && Math.random() < 0.04)
      ps.push(petal(Math.random() * W, -20, (Math.random() - 0.5) * 0.6, 0.6 + Math.random() * 0.8, false));
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.sw += 0.03;
      p.flip += p.vf;
      p.rot += p.vr;
      if (p.burst) {
        p.vy += 0.12;
        p.vx *= 0.985;
        p.vy = Math.min(p.vy, 2.6);
      }
      p.x += p.vx + Math.sin(p.sw) * 0.7;
      p.y += p.vy;
      if (p.y > H + 30 || p.x < -60 || p.x > W + 60) {
        ps.splice(i, 1);
        continue;
      }
      draw(p);
    }
    frame = requestAnimationFrame(loop);
  }
  if (!reduce) frame = requestAnimationFrame(loop);

  return {
    burst(x, y, n, spread) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * (spread || Math.PI * 2);
        const s = 3 + Math.random() * 9;
        ps.push(petal(x, y, Math.cos(a) * s, Math.sin(a) * s, true));
      }
    },
    rain(n) {
      if (reduce) return;
      for (let i = 0; i < n; i++)
        ps.push(petal(Math.random() * W, -20 - Math.random() * H * 0.6, (Math.random() - 0.5) * 1, 1 + Math.random() * 2, true));
    },
    setAmbient(on) {
      ambient = on;
    },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
    },
  };
}

/* ---------- Music box (synthesised, no audio file) ---------- */

const CHORDS = [
  [293.66, 369.99, 440, 587.33],
  [220, 277.18, 329.63, 440],
  [246.94, 293.66, 369.99, 493.88],
  [196, 246.94, 293.66, 392],
];
const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];

export interface MusicBox {
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

export function createMusicBox(): MusicBox {
  let ac: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer = 0;
  let step = 0;

  function bell(f: number, t: number, v: number) {
    if (!ac || !master) return;
    const o = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g = ac.createGain();
    const g2 = ac.createGain();
    o.type = "sine";
    o2.type = "sine";
    o.frequency.value = f;
    o2.frequency.value = f * 3.01;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    g2.gain.setValueAtTime(v * 0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g);
    o2.connect(g2);
    g.connect(master);
    g2.connect(master);
    o.start(t);
    o2.start(t);
    o.stop(t + 2.5);
    o2.stop(t + 0.6);
  }

  return {
    start() {
      try {
        if (!ac) {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          ac = new Ctx();
          master = ac.createGain();
          master.gain.value = 0.2;
          const d = ac.createDelay();
          d.delayTime.value = 0.42;
          const fb = ac.createGain();
          fb.gain.value = 0.3;
          master.connect(ac.destination);
          master.connect(d);
          d.connect(fb);
          fb.connect(d);
          d.connect(ac.destination);
        }
        ac.resume();
        window.clearInterval(timer);
        timer = window.setInterval(() => {
          if (!ac) return;
          const t = ac.currentTime + 0.05;
          const ch = CHORDS[Math.floor(step / 8) % 4];
          bell(ch[PATTERN[step % 8]] * 2, t, 0.3);
          if (step % 8 === 0) bell(ch[0] / 2, t, 0.22);
          step++;
        }, 340);
      } catch {
        // Audio is a bonus: ignore browsers that refuse it
      }
    },
    stop() {
      window.clearInterval(timer);
    },
    destroy() {
      window.clearInterval(timer);
      ac?.close();
      ac = null;
    },
  };
}

/* ---------- Soundtrack: the couple's own song (chosen excerpt, looped), else the music box ---------- */

export interface Soundtrack extends MusicBox {
  /** Switches to a song file (url) and the part of it to play; empty url = synthesised music box */
  setTrack: (url?: string, start?: number, end?: number) => void;
}

export function createSoundtrack(): Soundtrack {
  const box = createMusicBox();
  let audio: HTMLAudioElement | null = null;
  let unbind: (() => void) | null = null;
  let url = "";
  let range: AudioRange = { start: 0, end: 0 };
  let playing = false;

  const play = () => {
    if (audio) audio.play().catch(() => {});
    else box.start();
  };
  const pause = () => {
    audio?.pause();
    box.stop();
  };

  return {
    start() {
      playing = true;
      play();
    },
    stop() {
      playing = false;
      pause();
    },
    setTrack(nextUrl = "", start, end) {
      range = cleanRange(start, end);
      if (nextUrl === url) return;
      pause();
      unbind?.();
      unbind = null;
      audio = null;
      url = nextUrl;
      if (url) {
        audio = new Audio(url);
        audio.preload = "auto";
        audio.volume = 0.7;
        unbind = bindSegment(audio, () => range);
      }
      if (playing) play();
    },
    destroy() {
      playing = false;
      unbind?.();
      audio?.pause();
      audio = null;
      box.destroy();
    },
  };
}
