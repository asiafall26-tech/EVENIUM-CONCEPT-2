"use client";

import { useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name?: string;
  type?: "image" | "video";
}

export function MediaLightbox({ isOpen, onClose, url, name, type = "image" }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Barre d'outils supérieure */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-10"
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={name || "media-evenium"}
          title="Télécharger"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Download size={20} />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Ouvrir dans un nouvel onglet"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ExternalLink size={20} />
        </a>
        <button
          type="button"
          onClick={onClose}
          title="Fermer"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Contenu affiché */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
      >
        {type === "video" ? (
          <video
            src={url}
            controls
            autoPlay
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl bg-black"
          />
        ) : (
          <img
            src={url}
            alt={name || "Image Evenium"}
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain select-none"
          />
        )}
        {name && (
          <p className="mt-3 text-xs font-medium text-white/70 max-w-md truncate text-center">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}
