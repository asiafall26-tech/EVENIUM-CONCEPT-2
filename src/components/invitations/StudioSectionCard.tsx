"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff, RotateCcw, type LucideIcon } from "lucide-react";

interface Props {
  num: number | string;
  icon: LucideIcon;
  title: string;
  desc?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  isHidden?: boolean;
  onToggleHide?: () => void;
  hideLabel?: string;
  children: ReactNode;
}

export default function StudioSectionCard({
  num,
  icon: Icon,
  title,
  desc,
  badge,
  defaultOpen = true,
  isHidden = false,
  onToggleHide,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isHidden
          ? "border-dashed border-gray-300 bg-gray-50/50 opacity-80"
          : "border-gray-200/90 bg-white shadow-xs hover:border-[#b8924a]/40"
      }`}
    >
      {/* En-tête de la section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 border-b border-gray-100">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isHidden
                ? "bg-gray-200 text-gray-500"
                : "bg-[#2b2118] text-[#f5eee1] shadow-2xs"
            }`}
          >
            {typeof num === "number" ? num : num}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon size={16} className={isHidden ? "text-gray-400" : "text-[#8f6f33]"} />
              <h4 className={`font-serif text-base sm:text-lg font-bold ${isHidden ? "text-gray-500 line-through" : "text-gray-900"}`}>
                {title}
              </h4>
              {badge}
              {isHidden && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                  Masquée
                </span>
              )}
            </div>
            {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onToggleHide && (
            <button
              type="button"
              onClick={onToggleHide}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isHidden
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600"
              }`}
              title={isHidden ? "Afficher cette section sur l'invitation" : "Masquer cette section sur l'invitation"}
            >
              {isHidden ? (
                <>
                  <RotateCcw size={13} />
                  <span>Rétablir</span>
                </>
              ) : (
                <>
                  <EyeOff size={13} />
                  <span className="hidden sm:inline">Masquer</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Replier la section" : "Déplier la section"}
            className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Contenu de la section */}
      {open && (
        <div className="p-4 sm:p-6 space-y-4">
          {isHidden ? (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <EyeOff size={16} className="text-amber-700 shrink-0" />
                <span>Cette rubrique est actuellement masquée et n&apos;apparaîtra pas sur l&apos;invitation envoyée aux convives.</span>
              </div>
              {onToggleHide && (
                <button
                  type="button"
                  onClick={onToggleHide}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 shrink-0 cursor-pointer"
                >
                  Rétablir cette section
                </button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
