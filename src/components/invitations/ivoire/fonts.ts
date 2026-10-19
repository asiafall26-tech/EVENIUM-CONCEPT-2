import { Cormorant_Garamond, Jost, Parisienne, Playfair_Display } from "next/font/google";

const serif = Cormorant_Garamond({
  variable: "--iv-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const script = Parisienne({
  variable: "--iv-script",
  subsets: ["latin"],
  weight: "400",
});

const display = Playfair_Display({
  variable: "--iv-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const sans = Jost({
  variable: "--iv-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const ivoireFontVars = `${serif.variable} ${script.variable} ${display.variable} ${sans.variable}`;
