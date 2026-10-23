/**
 * Extraction du son d'une vidéo et conversion en MP3, directement dans le navigateur
 * (aucun envoi de la vidéo : seul le MP3 obtenu est importé).
 */

export const isVideoFile = (f: File) => f.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i.test(f.name);

const KBPS = 160;
const FRAME = 1152;

/** Convertit une vidéo (ou un fichier audio) en MP3. `onProgress` reçoit un pourcentage. */
export async function videoToMp3(file: File, onProgress?: (percent: number) => void): Promise<File> {
  const AudioCtx: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  let audio: AudioBuffer;
  try {
    audio = await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error("Impossible de lire le son de cette vidéo dans ce navigateur. Essayez un fichier MP4, ou ouvrez la page dans Chrome.");
  } finally {
    ctx.close().catch(() => {});
  }

  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const channels = Math.min(2, audio.numberOfChannels);
  const encoder = new Mp3Encoder(channels, audio.sampleRate, KBPS);

  const toInt16 = (data: Float32Array, start: number, end: number) => {
    const out = new Int16Array(end - start);
    for (let i = start; i < end; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      out[i - start] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };

  const left = audio.getChannelData(0);
  const right = channels > 1 ? audio.getChannelData(1) : undefined;
  const chunks: Uint8Array[] = [];
  const total = left.length;

  for (let i = 0, n = 0; i < total; i += FRAME, n++) {
    const end = Math.min(i + FRAME, total);
    const mp3 = right ? encoder.encodeBuffer(toInt16(left, i, end), toInt16(right, i, end)) : encoder.encodeBuffer(toInt16(left, i, end));
    if (mp3.length) chunks.push(mp3);
    // Laisse respirer la page et met à jour la progression
    if (n % 400 === 0) {
      onProgress?.(Math.round((i / total) * 100));
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  const last = encoder.flush();
  if (last.length) chunks.push(last);
  onProgress?.(100);

  const name = file.name.replace(/\.[^/.]+$/, "") + ".mp3";
  return new File(chunks as BlobPart[], name, { type: "audio/mpeg" });
}
