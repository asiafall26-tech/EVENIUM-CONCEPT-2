"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { playWaxSealChime } from "@/lib/voeuxSound";

interface WaxSealProps {
  color?: string;
  size?: "sm" | "md" | "lg";
  isBroken?: boolean;
  onBreak?: () => void;
  className?: string;
  showHalo?: boolean;
  label?: string;
}

export default function WaxSeal({
  color = "#8a1c14",
  size = "md",
  isBroken = false,
  onBreak,
  className = "",
  showHalo = true,
  label = "Ouvrir"
}: WaxSealProps) {
  const [isSparkling, setIsSparkling] = useState(false);

  const sizeClasses = {
    sm: "w-14 h-14 text-[9px]",
    md: "w-20 h-20 text-[10px]",
    lg: "w-24 h-24 text-xs"
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  }[size];

  const handleClick = () => {
    setIsSparkling(true);
    playWaxSealChime();
    if (onBreak) onBreak();
    setTimeout(() => setIsSparkling(false), 900);
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Halo doré pulsant si non brisé */}
      {showHalo && !isBroken && (
        <>
          <span 
            className="absolute -inset-3 rounded-full opacity-60 animate-ping pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
            }}
          />
          <span 
            className="absolute -inset-2 rounded-full blur-md opacity-75 pointer-events-none"
            style={{ 
              backgroundColor: color 
            }}
          />
        </>
      )}

      {/* Bouton Sceau de cire avec relief et estampage */}
      <button
        type="button"
        onClick={handleClick}
        title={isBroken ? "Sceau brisé" : "Cliquez pour briser le sceau et ouvrir"}
        className={`relative ${sizeClasses} rounded-full transition-transform duration-300 hover:scale-108 active:scale-95 cursor-pointer shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border border-amber-200/50 group`}
        style={{
          background: `radial-gradient(circle at 35% 30%, #ffd983 0%, ${color} 40%, #150505 100%)`,
        }}
      >
        {/* Bordure organique / cire fondue */}
        <div 
          className="absolute inset-1 rounded-full border border-amber-100/40 shadow-inner flex flex-col items-center justify-center pointer-events-none"
          style={{
            boxShadow: "inset 0 1px 3px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.6)"
          }}
        >
          {/* Monogramme ou symbole */}
          <div className="flex flex-col items-center justify-center -space-y-0.5 text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <Sparkles size={iconSizes} className="text-amber-200 group-hover:rotate-12 transition-transform" />
            <span className="font-serif font-black tracking-widest uppercase">
              {isBroken ? "★" : (label || "E")}
            </span>
          </div>
        </div>

        {/* Effet particules / éclats dorés lors du clic */}
        {isSparkling && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 animate-ping"
                style={{
                  transform: `rotate(${i * 45}deg) translate(${size === "lg" ? 40 : 30}px)`,
                  animationDuration: "0.8s"
                }}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
}

