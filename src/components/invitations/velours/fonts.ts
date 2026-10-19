import { Cormorant_Garamond, Parisienne, Montserrat } from "next/font/google";

const serif = Cormorant_Garamond({
  variable: "--inv-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const script = Parisienne({
  variable: "--inv-script",
  subsets: ["latin"],
  weight: "400",
});

const sans = Montserrat({
  variable: "--inv-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const veloursFontVars = `${serif.variable} ${script.variable} ${sans.variable}`;
