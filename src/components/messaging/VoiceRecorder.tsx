"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Loader2 } from "lucide-react";
import { formatAudioDuration } from "@/lib/messaging/mediaPayload";

interface Props {
  onCancel: () => void;
  onSendAudio: (blob: Blob, durationSeconds: number) => Promise<void>;
}

export function VoiceRecorder({ onCancel, onSendAudio }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    let isMounted = true;

    async function startRecording() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("L'enregistrement audio n'est pas supporté par votre navigateur.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        // Déterminer le type MIME optimal supporté par le navigateur
        let mimeType = "audio/webm";
        if (typeof MediaRecorder.isTypeSupported === "function") {
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
            mimeType = "audio/ogg;codecs=opus";
          }
        }

        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(250); // morceaux de 250ms

        // Démarrer le chronomètre
        setSeconds(0);
        timerRef.current = setInterval(() => {
          setSeconds((prev) => {
            if (prev >= 300) {
              // Limite max : 5 minutes
              stopAndFinish();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } catch (err: any) {
        console.error("Erreur accès micro:", err);
        setPermissionError(
          err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
            ? "Accès au microphone refusé. Veuillez autoriser l'accès au micro dans votre navigateur."
            : err.message || "Impossible d'accéder au microphone."
        );
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  const stopAndFinish = async () => {
    if (!mediaRecorderRef.current || isUploading) return;
    setIsUploading(true);

    const duration = Math.max(1, secondsRef.current);
    const mime = mediaRecorderRef.current.mimeType || "audio/webm";

    const promise = new Promise<Blob>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mime });
          resolve(blob);
        };
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {
          const blob = new Blob(audioChunksRef.current, { type: mime });
          resolve(blob);
        }
      } else {
        resolve(new Blob([], { type: mime }));
      }
    });

    try {
      const audioBlob = await promise;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioBlob.size > 0) {
        await onSendAudio(audioBlob, duration);
      } else {
        onCancel();
      }
    } catch (err) {
      console.error("Erreur finalisation vocal:", err);
      alert("Erreur lors de l'envoi du message vocal.");
      onCancel();
    } finally {
      setIsUploading(false);
    }
  };

  if (permissionError) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 p-2.5 px-4 bg-amber-50 border border-amber-300 rounded-full text-xs text-amber-900 shadow-sm">
        <span className="truncate">{permissionError}</span>
        <button
          type="button"
          onClick={handleCancel}
          className="shrink-0 px-3 py-1 font-bold rounded-full bg-amber-200 hover:bg-amber-300 transition-colors"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 p-1.5 pl-4 pr-1.5 bg-[#faf8f5] border border-[#b8924a] rounded-full shadow-md animate-in fade-in duration-200">
      {/* Indicateur enregistrement & temps */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
          <span className="w-3 h-3 rounded-full bg-red-600 relative" />
        </div>
        <span className="text-sm font-bold font-mono text-stone-900 tracking-tight">
          {formatAudioDuration(seconds)}
        </span>
        <span className="hidden sm:inline-block text-xs font-medium text-stone-500 truncate">
          {isUploading ? "Envoi du message vocal..." : "Enregistrement en direct..."}
        </span>
      </div>

      {/* Visualiseur d'ondes animées */}
      <div className="flex items-center gap-1 h-5 px-2">
        {[60, 100, 40, 80, 50, 90, 70, 40, 95, 60].map((h, i) => (
          <span
            key={i}
            style={{
              height: `${Math.max(20, (h * (seconds % 2 === 0 ? 0.9 : 1.2)) % 100)}%`,
              animationDuration: `${0.4 + (i % 4) * 0.15}s`,
            }}
            className="w-1 bg-[#b8924a] rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Actions : Annuler (Poubelle) et Envoyer */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          title="Annuler l'enregistrement"
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 size={18} />
        </button>

        <button
          type="button"
          onClick={stopAndFinish}
          disabled={isUploading}
          title="Terminer et envoyer le message vocal"
          className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center shadow-md shadow-[#b8924a]/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
