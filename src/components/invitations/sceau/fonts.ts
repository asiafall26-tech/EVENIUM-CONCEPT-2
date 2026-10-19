import { Cormorant_Garamond, Parisienne, Manrope } from "next/font/google";

const serif = Cormorant_Garamond({
  variable: "--sr-serif",
  subsets: ["latin"],
  weight: "500",
  style: ["normal", "italic"],
});

const script = Parisienne({
  variable: "--sr-script",
  subsets: ["latin"],
  weight: "400",
});

const body = Manrope({
  variable: "--sr-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const sceauFontVars = `${serif.variable} ${script.variable} ${body.variable}`;
