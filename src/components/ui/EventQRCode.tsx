"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Check, Share2, Sparkles } from "lucide-react";

interface EventQRCodeProps {
  url: string;
  eventName?: string;
  date?: string;
  size?: number;
  showDownloadButtons?: boolean;
  className?: string;
}

export default function EventQRCode({
  url,
  eventName = "Votre Événement Evenium",
  date,
  size = 200,
  showDownloadButtons = true,
  className = "",
}: EventQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!url) return;

    QRCode.toDataURL(url, {
      width: size * 2, // 2x for retina display
      margin: 1.5,
      color: {
        dark: "#1a1514",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((res) => {
        setDataUrl(res);
      })
      .catch((err) => {
        console.error("Erreur génération QR Code:", err);
      });
  }, [url, size]);

  // Télécharger le QR Code PNG
  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    const safeName = (eventName || "invitation").toLowerCase().replace(/[^a-z0-9]/g, "-");
    a.download = `qrcode-${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Télécharger le Carton Numérique d'Invitation complet (HTML/Image imprimable avec QR Code)
  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const cardCanvas = document.createElement("canvas");
      const ctx = cardCanvas.getContext("2d");
      if (!ctx) return;

      const cardWidth = 800;
      const cardHeight = 1100;
      cardCanvas.width = cardWidth;
      cardCanvas.height = cardHeight;

      // 1. Fond luxueux ivoire & dégradé
      const gradient = ctx.createLinearGradient(0, 0, 0, cardHeight);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.5, "#fcf9f2");
      gradient.addColorStop(1, "#f5ede0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // 2. Bordure dorée prestigieuse
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, cardWidth - 60, cardHeight - 60);

      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, cardWidth - 80, cardHeight - 80);

      // 3. En-tête Evenium
      ctx.fillStyle = "#8f6f33";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "4px";
      ctx.fillText("— EVENIUM HAUTE COUTURE DIGITALE —", cardWidth / 2, 90);

      // 4. Titre de l'événement
      ctx.fillStyle = "#1a1514";
      ctx.font = "bold 34px serif";
      ctx.fillText(eventName, cardWidth / 2, 170);

      if (date) {
        ctx.fillStyle = "#5c4d47";
        ctx.font = "italic 19px serif";
        ctx.fillText(date, cardWidth / 2, 215);
      }

      ctx.fillStyle = "#333333";
      ctx.font = "17px sans-serif";
      ctx.fillText("Scannez ce QR Code avec votre smartphone", cardWidth / 2, 280);
      ctx.fillStyle = "#777777";
      ctx.font = "14px sans-serif";
      ctx.fillText("pour ouvrir votre invitation interactive et confirmer votre présence", cardWidth / 2, 308);

      // 5. Dessin du QR Code
      const qrImg = new Image();
      qrImg.onload = () => {
        const qrSize = 360;
        const qrX = (cardWidth - qrSize) / 2;
        const qrY = 360;

        // Ombre sous le QR
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

        ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

        ctx.shadowColor = "transparent";
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // 6. Bas du carton
        ctx.fillStyle = "#8f6f33";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("OU RENDEZ-VOUS SUR LE LIEN OFFICIEL :", cardWidth / 2, 800);

        ctx.fillStyle = "#111111";
        ctx.font = "bold 15px monospace";
        ctx.fillText(url, cardWidth / 2, 835);

        ctx.fillStyle = "#888888";
        ctx.font = "italic 13px serif";
        ctx.fillText("Votre présence est le plus précieux des cadeaux.", cardWidth / 2, 920);

        ctx.fillStyle = "#b8924a";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("✨ Evenium", cardWidth / 2, 960);

        // Déclencher le téléchargement du carton PNG
        const a = document.createElement("a");
        a.href = cardCanvas.toDataURL("image/png");
        const safeName = (eventName || "invitation").toLowerCase().replace(/[^a-z0-9]/g, "-");
        a.download = `carton-invitation-qr-${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloading(false);
      };
      qrImg.src = dataUrl;
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Cadre luxueux du QR Code */}
      <div className="relative group p-3.5 rounded-3xl bg-white border-2 border-[#D4AF37]/40 shadow-xl shadow-[#D4AF37]/10 flex flex-col items-center">
        {/* Glow discret */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#F3E5AB]/20 to-[#D4AF37]/20 blur-md pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 bg-white rounded-2xl p-2 flex items-center justify-center">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Code ${eventName}`}
              width={size}
              height={size}
              className="rounded-xl block object-contain"
            />
          ) : (
            <div
              style={{ width: size, height: size }}
              className="flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 animate-pulse text-xs"
            >
              <QrCode size={36} className="text-[#D4AF37]" />
            </div>
          )}
        </div>

        {/* Badge Evenium officiel sous le QR */}
        <div className="relative z-10 mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#8f6f33] uppercase tracking-wider bg-[#fcf9f2] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
          <Sparkles size={11} className="text-[#D4AF37]" />
          <span>QR Code Officiel Evenium</span>
        </div>
      </div>

      {/* Boutons d'action : Téléchargement PNG & Carton */}
      {showDownloadButtons && (
        <div className="w-full flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-900 text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Download size={14} className="text-[#D4AF37]" />
            <span>Télécharger QR Code (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:brightness-105 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <QrCode size={14} />
            <span>{downloading ? "Génération..." : "Télécharger Carton Imprimable"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
