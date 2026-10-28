"use client";

import { useState } from "react";
import { FileText, Download, Play, Film, FileArchive, FileSpreadsheet, Eye } from "lucide-react";
import { type MediaPayload, formatFileSize } from "@/lib/messaging/mediaPayload";
import { AudioMessagePlayer } from "./AudioMessagePlayer";
import { MediaLightbox } from "./MediaLightbox";

interface Props {
  media: MediaPayload;
  isMe: boolean;
  onOpenLightbox?: (url: string, name?: string, type?: "image" | "video") => void;
}

export function MediaBubble({ media, isMe, onOpenLightbox }: Props) {
  const [internalLightboxOpen, setInternalLightboxOpen] = useState(false);

  const handleOpenMedia = () => {
    if (onOpenLightbox) {
      onOpenLightbox(media.url, media.name, media.mediaType === "video" ? "video" : "image");
    } else {
      setInternalLightboxOpen(true);
    }
  };

  const getDocIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="text-red-500" size={26} />;
    if (ext === "doc" || ext === "docx") return <FileText className="text-blue-500" size={26} />;
    if (ext === "xls" || ext === "xlsx" || ext === "csv") return <FileSpreadsheet className="text-emerald-500" size={26} />;
    if (ext === "zip" || ext === "rar") return <FileArchive className="text-amber-500" size={26} />;
    return <FileText className="text-stone-500" size={26} />;
  };

  return (
    <div className="space-y-2">
      {/* 1. IMAGE */}
      {media.mediaType === "image" && (
        <div className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={handleOpenMedia}>
          <img
            src={media.url}
            alt={media.name || "Photo"}
            loading="lazy"
            className="max-h-72 w-auto max-w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
              <Eye size={18} />
            </span>
          </div>
        </div>
      )}

      {/* 2. VIDÉO */}
      {media.mediaType === "video" && (
        <div className="overflow-hidden rounded-xl bg-black/90 max-w-sm">
          <video
            src={media.url}
            controls
            preload="metadata"
            className="max-h-72 w-full rounded-xl"
          />
        </div>
      )}

      {/* 3. MESSAGE VOCAL (AUDIO) */}
      {media.mediaType === "audio" && (
        <AudioMessagePlayer
          src={media.url}
          duration={media.duration}
          isMe={isMe}
        />
      )}

      {/* 4. DOCUMENT / FICHIER */}
      {media.mediaType === "file" && (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            isMe
              ? "bg-white/10 border-white/20 hover:bg-white/15"
              : "bg-stone-50 border-stone-200 hover:bg-stone-100"
          }`}
        >
          <div className="shrink-0 p-2 rounded-lg bg-white shadow-xs">
            {getDocIcon(media.name)}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className={`text-sm font-bold truncate ${isMe ? "text-white" : "text-stone-900"}`}>
              {media.name}
            </p>
            {media.size && (
              <p className={`text-xs ${isMe ? "text-stone-300" : "text-stone-500"}`}>
                {formatFileSize(media.size)}
              </p>
            )}
          </div>
          <a
            href={media.url}
            download={media.name}
            target="_blank"
            rel="noopener noreferrer"
            title="Télécharger le fichier"
            className={`p-2 rounded-full shrink-0 transition-colors ${
              isMe
                ? "bg-white/20 hover:bg-white/30 text-[#d9c08c]"
                : "bg-stone-200 hover:bg-stone-300 text-stone-800"
            }`}
          >
            <Download size={16} />
          </a>
        </div>
      )}

      {/* Légende / Texte accompagnateur éventuel */}
      {media.text && (
        <p className={`text-[14.5px] leading-relaxed whitespace-pre-wrap break-words ${isMe ? "text-white" : "text-stone-950"}`}>
          {media.text}
        </p>
      )}

      {/* Lightbox interne si le parent ne fournit pas de handler global */}
      {!onOpenLightbox && (
        <MediaLightbox
          isOpen={internalLightboxOpen}
          onClose={() => setInternalLightboxOpen(false)}
          url={media.url}
          name={media.name}
          type={media.mediaType === "video" ? "video" : "image"}
        />
      )}
    </div>
  );
}
