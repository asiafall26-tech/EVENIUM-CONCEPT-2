"use client";

import Image from "next/image";
import Link from "next/link";

export interface EveniumLogoProps {
  /**
   * "light" = Dark/Black & Gold (for white or light ivory backgrounds)
   * "dark" = Light/White & Gold (for black or dark backgrounds)
   * "auto" = Adapts to dark: Tailwind class or parent theme
   */
  variant?: "light" | "dark" | "auto";
  format?: "horizontal" | "emblem" | "stacked";
  href?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function EveniumLogo({
  variant = "light",
  format = "horizontal",
  href,
  width,
  height,
  className = "",
  priority = false,
}: EveniumLogoProps) {
  // Determine asset based on format and variant
  let src = "";
  let defaultWidth = 140;
  let defaultHeight = 40;

  if (format === "emblem") {
    defaultWidth = 44;
    defaultHeight = 44;
    src = variant === "dark" 
      ? "/logo-emblem-light.png" 
      : "/logo-emblem-dark.png";
  } else if (format === "stacked") {
    defaultWidth = 120;
    defaultHeight = 90;
    src = variant === "dark" 
      ? "/logo-gold-white.png" 
      : "/logo-gold-black.png";
  } else {
    // horizontal
    defaultWidth = 160;
    defaultHeight = 46;
    src = variant === "dark" 
      ? "/logo-horizontal-light.png" 
      : "/logo-horizontal-dark.png";
  }

  const finalWidth = width ?? defaultWidth;
  const finalHeight = height ?? defaultHeight;

  const imageElement = (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <Image
        src={src}
        alt="Evenium Logo"
        width={finalWidth}
        height={finalHeight}
        priority={priority}
        className="object-contain w-auto h-full max-h-full transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ maxHeight: finalHeight }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
