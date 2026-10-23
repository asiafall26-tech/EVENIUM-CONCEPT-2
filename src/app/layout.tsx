import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Parisienne } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
});

// Affichage mobile : largeur de l'appareil, zoom autorisé (accessibilité), encoche iPhone prise en compte
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5eee1",
};

export const metadata: Metadata = {
  title: "Evenium | Plateforme d'organisation événementielle",
  description: "Créez, personnalisez et gérez votre événement de A à Z avec Evenium.",
};

import { Providers } from "@/components/Providers";
import UpdateWatcher from "@/components/UpdateWatcher";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        <UpdateWatcher />
      </body>
    </html>
  );
}
