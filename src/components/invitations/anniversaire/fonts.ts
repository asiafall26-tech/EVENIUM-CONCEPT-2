import { Cinzel, Cormorant_Garamond, Great_Vibes } from "next/font/google";

const script = Great_Vibes({
  variable: "--anniv-script",
  subsets: ["latin"],
  weight: "400",
});

const caps = Cinzel({
  variable: "--anniv-caps",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const serif = Cormorant_Garamond({
  variable: "--anniv-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const anniversaireFontVars = `${script.variable} ${caps.variable} ${serif.variable}`;
