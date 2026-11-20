"use client";

import { Sparkles } from "lucide-react";
import { WEDDING_TONES, BIRTHDAY_TONES, type ToneInspiration } from "@/lib/weddingToneInspirations";

interface Props {
  tones?: ToneInspiration[];
  onSelect: (tone: ToneInspiration) => void;
  currentText?: string;
  className?: string;
}

export default function ToneSelector({ tones = WEDDING_TONES, onSelect, currentText = "", className = "" }: Props) {
  return (
    <div className={`p-3 bg-gradient-to-r from-[#fbf8f2] via-white to-[#fbf8f2] rounded-2xl border border-[#b8924a]/25 space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8f6f33]">
        <Sparkles size={14} className="text-[#b8924a]" />
        <span>Inspirations de tonalités prêtes à l&apos;emploi (cliquez pour appliquer) :</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tones.map((t) => {
          const isActive = currentText.trim().length > 0 && currentText.trim() === t.welcomeText.trim();
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? "bg-[#2b2118] text-[#f5eee1] border border-[#2b2118]"
                  : "bg-white hover:bg-[#faf4e6] text-gray-700 hover:text-gray-950 border border-[#b8924a]/30"
              }`}
              title={t.subtitle}
            >
              <span>{t.icon}</span>
              <span className="font-semibold">{t.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
