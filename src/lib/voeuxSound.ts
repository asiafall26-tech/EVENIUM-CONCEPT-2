/**
 * Synthétiseur audio doux pour les cartes de vœux Evenium.
 * Génère un accord de harpe céleste / carillon doré lors de l'ouverture du sceau de cire.
 */
export function playWaxSealChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Accord harpe cristalline en do majeur 9e (C5, E5, G5, B5, D6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + index * 0.06;
      const duration = 1.6;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.07, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  } catch {
    // Fallback silencieux en cas de blocage navigateur
  }
}
