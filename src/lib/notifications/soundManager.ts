"use client";

/**
 * Gestionnaire audio des sonneries et carillons de notification Evenium.
 * Génération par synthèse Web Audio API haute fidélité :
 * Sonneries luxueuses et élégantes durant 3 secondes complètes,
 * sans latence réseau, sans téléchargement MP3, fonctionnant sur tous les navigateurs.
 */

export interface SoundOption {
  id: string;
  name: string;
  duration: string;
  description: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "gold-chime",
    name: "Carillon Doré Impérial",
    duration: "3 sec",
    description: "Arpège royal scintillant à 5 notes avec longue traîne dorée",
  },
  {
    id: "crystal-harp",
    name: "Harpe Royale de Cristal",
    duration: "3 sec",
    description: "Cascade céleste fluide et soyeuse d'arpèges de harpe",
  },
  {
    id: "celestial-bell",
    name: "Cloches du Palais Royal",
    duration: "3 sec",
    description: "Triple tintement majestueux avec résonance acoustique profonde",
  },
  {
    id: "warm-marimba",
    name: "Marimba Symphonique d'Honneur",
    duration: "3 sec",
    description: "Mélodie boisée noble, chaleureuse et feutrée de haute cérémonie",
  },
  {
    id: "royal-nocturne",
    name: "Nocturne & Harmonie d'Or",
    duration: "3 sec",
    description: "Progression harmonique raffinée digne d'une réception de prestige",
  },
  {
    id: "silk-chimes",
    name: "Carillon de Soie & Étoiles",
    duration: "3 sec",
    description: "Pluie scintillante d'harmoniques cristallines douces et apaisantes",
  },
  {
    id: "none",
    name: "Silencieux",
    duration: "-",
    description: "Aucun son émis lors des notifications",
  },
];

export interface NotificationSoundConfig {
  enabled: boolean;
  volume: number; // 0 à 100
  defaultSound: string;
  messageSound: string;
  devisSound: string;
  rsvpSound: string;
}

export const DEFAULT_SOUND_CONFIG: NotificationSoundConfig = {
  enabled: true,
  volume: 75,
  defaultSound: "gold-chime",
  messageSound: "crystal-harp",
  devisSound: "celestial-bell",
  rsvpSound: "warm-marimba",
};

const STORAGE_KEY = "evenium_notification_sound_config";

export function getNotificationSoundConfig(): NotificationSoundConfig {
  if (typeof window === "undefined") return DEFAULT_SOUND_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SOUND_CONFIG;
    return { ...DEFAULT_SOUND_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_CONFIG;
  }
}

export function saveNotificationSoundConfig(config: NotificationSoundConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("Impossible de sauvegarder la configuration sonore:", e);
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Joue une sonnerie luxueuse de 3 secondes par synthèse Web Audio polyphonique.
 */
export function playNotificationSound(soundId: string, volumePercent: number = 75): void {
  if (soundId === "none" || volumePercent <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterVol = Math.max(0, Math.min(1, volumePercent / 100)) * 0.45;
  const now = ctx.currentTime;

  try {
    switch (soundId) {
      // 1. CARILLON DORÉ IMPÉRIAL (3 secondes)
      // Arpège pentatonique doré ascendant avec résonances harmoniques prolongées
      case "gold-chime": {
        const notes = [
          { f: 587.33, t: 0.0, d: 1.8, v: 0.8 },  // D5
          { f: 739.99, t: 0.35, d: 1.8, v: 0.85 }, // F#5
          { f: 880.0,  t: 0.75, d: 2.0, v: 0.9 },  // A5
          { f: 1174.66,t: 1.2, d: 2.1, v: 0.95 }, // D6
          { f: 1760.0, t: 1.7, d: 2.4, v: 0.7 },  // A6
        ];
        notes.forEach((n) => {
          playLushTone(ctx, n.f, now + n.t, n.d, "sine", masterVol * n.v);
          // Harmonique scintillante
          playLushTone(ctx, n.f * 2, now + n.t + 0.02, n.d * 0.6, "triangle", masterVol * n.v * 0.25);
        });
        break;
      }

      // 2. HARPE ROYALE DE CRISTAL (3 secondes)
      // Cascade de harpe étalée avec douceur et fondu soyeux
      case "crystal-harp": {
        const notes = [
          { f: 523.25, t: 0.0,  d: 1.6 }, // C5
          { f: 659.25, t: 0.22, d: 1.6 }, // E5
          { f: 783.99, t: 0.48, d: 1.8 }, // G5
          { f: 1046.5, t: 0.78, d: 2.0 }, // C6
          { f: 1318.5, t: 1.15, d: 2.1 }, // E6
          { f: 1567.98,t: 1.55, d: 2.3 }, // G6
          { f: 2093.0, t: 1.95, d: 2.5 }, // C7
        ];
        notes.forEach((n, idx) => {
          playLushTone(ctx, n.f, now + n.t, n.d, "sine", masterVol * 0.75);
          playLushTone(ctx, n.f * 1.5, now + n.t + 0.03, n.d * 0.5, "triangle", masterVol * 0.18);
        });
        break;
      }

      // 3. CLOCHES DU PALAIS ROYAL (3 secondes)
      // 3 accords de cloches tubulaires de bronze avec harmoniques naturelles
      case "celestial-bell": {
        const bells = [
          { f: 440.0,  t: 0.0,  d: 2.2 }, // A4
          { f: 659.25, t: 0.85, d: 2.3 }, // E5
          { f: 880.0,  t: 1.7,  d: 2.7 }, // A5 (avec réverbération jusqu'à t=3.2s)
        ];
        bells.forEach((b) => {
          playBellChime(ctx, b.f, now + b.t, b.d, masterVol * 0.9);
        });
        break;
      }

      // 4. MARIMBA SYMPHONIQUE D'HONNEUR (3 secondes)
      // Percussions boisées d'une chaleur luxueuse sur 3 secondes
      case "warm-marimba": {
        const sequence = [
          { f: 349.23, t: 0.0,  d: 0.9 }, // F4
          { f: 440.0,  t: 0.28, d: 1.0 }, // A4
          { f: 523.25, t: 0.6,  d: 1.2 }, // C5
          { f: 698.46, t: 1.0,  d: 1.5 }, // F5
          { f: 880.0,  t: 1.45, d: 1.8 }, // A5
          { f: 1046.5, t: 1.9,  d: 2.2 }, // C6
        ];
        sequence.forEach((s) => {
          playWarmWood(ctx, s.f, now + s.t, s.d, masterVol);
        });
        break;
      }

      // 5. NOCTURNE & HARMONIE D'OR (3 secondes)
      // Nappe d'accords veloutés et solennels
      case "royal-nocturne": {
        // Accord initial velouté (t=0)
        playLushTone(ctx, 392.0, now, 2.5, "sine", masterVol * 0.6); // G4
        playLushTone(ctx, 493.88, now + 0.1, 2.5, "sine", masterVol * 0.6); // B4
        playLushTone(ctx, 587.33, now + 0.2, 2.5, "sine", masterVol * 0.65); // D5

        // Note chantante centrale (t=0.9)
        playLushTone(ctx, 987.77, now + 0.9, 2.3, "sine", masterVol * 0.8); // B5
        playLushTone(ctx, 1174.66, now + 1.4, 2.4, "sine", masterVol * 0.85); // D6
        playLushTone(ctx, 1479.98, now + 1.8, 2.6, "triangle", masterVol * 0.5); // F#6
        break;
      }

      // 6. CARILLON DE SOIE & ÉTOILES (3 secondes)
      // Cascades scintillantes d'étoiles dorées
      case "silk-chimes": {
        const sparkleFreqs = [
          { f: 1046.5, t: 0.0,  d: 1.6 },
          { f: 1318.5, t: 0.25, d: 1.7 },
          { f: 1567.98,t: 0.5,  d: 1.8 },
          { f: 1760.0, t: 0.8,  d: 2.0 },
          { f: 2093.0, t: 1.15, d: 2.1 },
          { f: 2637.0, t: 1.5,  d: 2.4 },
          { f: 3135.96,t: 1.85, d: 2.6 },
        ];
        sparkleFreqs.forEach((sf) => {
          playLushTone(ctx, sf.f, now + sf.t, sf.d, "sine", masterVol * 0.55);
          playLushTone(ctx, sf.f * 1.002, now + sf.t + 0.015, sf.d * 0.8, "triangle", masterVol * 0.2);
        });
        break;
      }

      default: {
        // Fallback harmonieux sur 3s
        playLushTone(ctx, 659.25, now, 1.5, "sine", masterVol * 0.8);
        playLushTone(ctx, 1318.5, now + 0.4, 2.2, "sine", masterVol * 0.8);
        playLushTone(ctx, 1975.5, now + 0.9, 2.4, "sine", masterVol * 0.6);
        break;
      }
    }
  } catch (err) {
    console.warn("Erreur lecture son Web Audio:", err);
  }
}

/**
 * Joue une note avec enveloppe d'attaque et décroissance progressive luxueuse.
 */
function playLushTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  vol: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Attaque douce de 25ms pour éviter tout clic ou son sec
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), startTime + 0.035);

  // Décroissance exponentielle lente naturelle vers le silence
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Synthétise une cloche acoustique riche avec harmoniques de bronze.
 */
function playBellChime(ctx: AudioContext, fundamental: number, startTime: number, duration: number, vol: number) {
  // Fréquences d'harmoniques de cloche réelles (frappe, quinte, octave, tierce majeure haute)
  const partials = [
    { ratio: 1.0,  gain: 1.0,  decay: 1.0 },
    { ratio: 2.0,  gain: 0.6,  decay: 0.8 },
    { ratio: 2.76, gain: 0.45, decay: 0.65 },
    { ratio: 4.07, gain: 0.3,  decay: 0.5 },
  ];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamental * p.ratio, startTime);

    const partialVol = vol * p.gain;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, partialVol), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * p.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration * p.decay + 0.05);
  });
}

/**
 * Synthétise un son boisé marimba feutré et chaleureux.
 */
function playWarmWood(ctx: AudioContext, fundamental: number, startTime: number, duration: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(fundamental, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(vol * 0.9, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}
