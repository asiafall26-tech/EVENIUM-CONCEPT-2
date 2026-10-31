import { useId } from "react";

/** Dégradé « feuille d'or » partagé par les ornements SVG. */
function GoldGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9c7124" />
      <stop offset="0.3" stopColor="#e9cf8a" />
      <stop offset="0.5" stopColor="#b8924a" />
      <stop offset="0.72" stopColor="#f3dea5" />
      <stop offset="1" stopColor="#9c7124" />
    </linearGradient>
  );
}

/** Fleur de lys et rinceaux dorés posés au-dessus des titres. */
export function Fleuron({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 240 48" className={className} fill="none">
      <defs>
        <GoldGradient id={id} />
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1.3" strokeLinecap="round">
        <path d="M120 33 C111 20 100 19 98 26 C97 31 102 33 105 30" />
        <path d="M120 33 C129 20 140 19 142 26 C143 31 138 33 135 30" />
        <path d="M108 39 C97 45 86 35 74 38 C64 41 52 40 18 40" />
        <path d="M132 39 C143 45 154 35 166 38 C176 41 188 40 222 40" />
        <path d="M80 37 C77 31 69 31 69 36 C69 40 74 41 76 38" />
        <path d="M160 37 C163 31 171 31 171 36 C171 40 166 41 164 38" />
      </g>
      <g fill={`url(#${id})`}>
        <path d="M120 3 C127 13 129 23 120 33 C111 23 113 13 120 3 Z" />
        <rect x="110" y="33" width="20" height="2.6" rx="1.3" />
        <path d="M120 35.6 L116.5 43 L123.5 43 Z" />
      </g>
    </svg>
  );
}

/** Trait de pinceau doré, effilé aux deux extrémités (sous « Evenium »). */
export function GoldSwash({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 400 40" preserveAspectRatio="none" className={className}>
      <defs>
        <GoldGradient id={id} />
      </defs>
      <path d="M18 34 C110 18 250 3 394 9 C250 13 112 27 18 34 Z" fill={`url(#${id})`} />
    </svg>
  );
}

/** Deux filets dorés autour d'un losange. */
export function DiamondRule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="block h-px w-16 sm:w-28 bg-gradient-to-l from-[#b8924a] to-transparent" />
      <span className="block w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-[#f3dea5] via-[#c9a45e] to-[#8a6a2c] shadow-[0_0_10px_rgba(233,196,120,0.7)]" />
      <span className="block h-px w-16 sm:w-28 bg-gradient-to-r from-[#b8924a] to-transparent" />
    </div>
  );
}

/** Coin rentrant du cadre (dessiné pour le coin haut gauche, pivoté pour les autres). */
function FrameCorner({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={`absolute w-5 h-5 ${className}`} fill="none">
      <path d="M20 0.6 H14 A13.4 13.4 0 0 1 0.6 14 V20" stroke="#c9a45e" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Cadre doré de faire-part aux coins rentrants. À placer dans un parent
 * `relative` ; `inset` règle la marge intérieure (classes Tailwind).
 */
export function LuxFrame({ className = "inset-3", openBottom = false }: { className?: string; openBottom?: boolean }) {
  const line = "absolute bg-gradient-to-r from-[#c9a45e] via-[#ecd39a] to-[#c9a45e]";
  // Cadre ouvert : les montants s'effacent vers le bas au lieu de se refermer
  const col = openBottom
    ? "absolute bg-gradient-to-b from-[#c9a45e] via-[#ecd39a] to-transparent"
    : "absolute bg-gradient-to-b from-[#c9a45e] via-[#ecd39a] to-[#c9a45e]";
  return (
    <div aria-hidden className={`absolute pointer-events-none ${className}`}>
      <span className={`${line} top-0 left-5 right-5 h-[1.2px]`} />
      <span className={`${col} left-0 top-5 ${openBottom ? "bottom-0" : "bottom-5"} w-[1.2px]`} />
      <span className={`${col} right-0 top-5 ${openBottom ? "bottom-0" : "bottom-5"} w-[1.2px]`} />
      <FrameCorner className="top-0 left-0" />
      <FrameCorner className="top-0 right-0 -scale-x-100" />
      {!openBottom && (
        <>
          <span className={`${line} bottom-0 left-5 right-5 h-[1.2px]`} />
          <FrameCorner className="bottom-0 left-0 -scale-y-100" />
          <FrameCorner className="bottom-0 right-0 -scale-100" />
        </>
      )}
    </div>
  );
}
