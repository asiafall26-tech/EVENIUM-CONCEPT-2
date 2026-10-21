"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, FlipHorizontal2, Loader2, RotateCcw, RotateCw, Sun, Contrast, Droplets, X, ZoomIn } from "lucide-react";

export interface ImageEditOptions {
  /** Format proposé par défaut (largeur / hauteur) ; null = format d'origine */
  aspect?: number | null;
  /** Titre affiché en haut de l'éditeur */
  title?: string;
}

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Original", value: null },
  { label: "Carré", value: 1 },
  { label: "Paysage 4:3", value: 4 / 3 },
  { label: "Portrait 3:4", value: 3 / 4 },
  { label: "Bannière 16:9", value: 16 / 9 },
];

const MAX_OUTPUT = 2000;

interface EditorProps {
  source: File | string;
  options: ImageEditOptions;
  onCancel: () => void;
  onDone: (file: File) => void;
}

/** Recadrage (déplacer / zoomer dans un cadre), rotation, miroir et réglages de luminosité. */
function ImageEditor({ source, options, onCancel, onDone }: EditorProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [aspect, setAspect] = useState<number | null>(options.aspect ?? null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // multiples de 90°
  const [flip, setFlip] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [saving, setSaving] = useState(false);
  const [maxW] = useState(() => (typeof window === "undefined" ? 520 : Math.min(560, window.innerWidth - 48)));
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // L'URL locale est créée et libérée dans le même effet : en mode développement, React
  // monte deux fois le composant et une URL créée une seule fois serait déjà libérée.
  const [srcUrl, setSrcUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    let active = true;
    const im = new Image();
    if (typeof source === "string") im.crossOrigin = "anonymous";
    im.onload = () => {
      if (!active) return;
      setSrcUrl(url);
      setImg(im);
    };
    im.onerror = () => {
      if (active) setLoadError(true);
    };
    im.src = url;
    return () => {
      active = false;
      if (typeof source !== "string") URL.revokeObjectURL(url);
    };
  }, [source]);

  const rotated = rotation % 180 !== 0;
  const natW = img?.naturalWidth ?? 1;
  const natH = img?.naturalHeight ?? 1;
  const rw = rotated ? natH : natW;
  const rh = rotated ? natW : natH;
  const ratio = aspect ?? rw / rh;

  // Cadre affiché : largeur max, hauteur limitée à 60 % de l'écran
  const maxH = typeof window === "undefined" ? 420 : Math.max(260, window.innerHeight * 0.5);
  let frameW = maxW;
  let frameH = frameW / ratio;
  if (frameH > maxH) {
    frameH = maxH;
    frameW = frameH * ratio;
  }

  const baseScale = Math.max(frameW / rw, frameH / rh);
  const scale = baseScale * zoom;

  const clamp = useCallback(
    (x: number, y: number) => {
      const limX = Math.max(0, (rw * scale - frameW) / 2);
      const limY = Math.max(0, (rh * scale - frameH) / 2);
      return { x: Math.min(limX, Math.max(-limX, x)), y: Math.min(limY, Math.max(-limY, y)) };
    },
    [rw, rh, scale, frameW, frameH]
  );

  // Garder l'image dans le cadre quand le format, le zoom ou la rotation changent
  const shown = clamp(offset.x, offset.y);

  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: shown.x, oy: shown.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(clamp(drag.current.ox + e.clientX - drag.current.x, drag.current.oy + e.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setFlip(false);
    setOffset({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const save = async () => {
    if (!img) return;
    setSaving(true);
    // Taille de sortie : la zone recadrée en pixels d'origine, limitée à MAX_OUTPUT
    let outW = frameW / scale;
    let outH = frameH / scale;
    const k = Math.min(1, MAX_OUTPUT / Math.max(outW, outH));
    outW = Math.round(outW * k);
    outH = Math.round(outH * k);
    const f = outW / frameW;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setSaving(false);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.filter = filter;
    ctx.translate(outW / 2 + shown.x * f, outH / 2 + shown.y * f);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flip ? -1 : 1, 1);
    const dw = natW * scale * f;
    const dh = natH * scale * f;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);

    canvas.toBlob(
      (blob) => {
        setSaving(false);
        if (!blob) {
          alert("Cette photo ne peut pas être modifiée. Importez-la à nouveau depuis votre appareil.");
          return;
        }
        const base = typeof source === "string" ? "photo" : source.name.replace(/\.[^.]+$/, "");
        onDone(new File([blob], `${base}-edit.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  };

  const slider = (icon: React.ReactNode, labelText: string, value: number, set: (v: number) => void, min = 50, max = 150) => (
    <label className="flex items-center gap-3 text-xs text-gray-600">
      <span className="w-28 shrink-0 flex items-center gap-1.5">
        {icon} {labelText}
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} className="flex-1 accent-[#b8924a]" />
      <span className="w-10 text-right tabular-nums">{value}%</span>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Modifier la photo">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100">
          <h2 className="font-serif text-2xl text-gray-900">{options.title || "Modifier la photo"}</h2>
          <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {loadError ? (
            <div className="text-center py-14 space-y-4">
              <p className="text-sm text-[#6b1f2a]">Cette photo ne peut pas être affichée dans l'éditeur (format non pris en charge par le navigateur).</p>
              {typeof source !== "string" && (
                <button type="button" onClick={() => onDone(source)} className="px-5 py-2.5 rounded-xl bg-black text-[#f5eee1] text-sm font-semibold">
                  Importer la photo sans retouche
                </button>
              )}
            </div>
          ) : !img ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-[#b8924a]" />
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-xl bg-[#2b2118] touch-none cursor-grab active:cursor-grabbing select-none"
                  style={{ width: frameW, height: frameH }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onWheel={(e) => setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.0015)))}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srcUrl ?? undefined}
                    alt=""
                    draggable={false}
                    className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                    style={{
                      width: natW * scale,
                      height: natH * scale,
                      transform: `translate(-50%, -50%) translate(${shown.x}px, ${shown.y}px) rotate(${rotation}deg) scaleX(${flip ? -1 : 1})`,
                      filter,
                    }}
                  />
                  {/* Grille des tiers */}
                  <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/15" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">Faites glisser la photo pour la cadrer · molette ou curseur pour zoomer</p>

              <div className="flex flex-wrap justify-center gap-2">
                {ASPECTS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setAspect(a.value);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs border ${aspect === a.value ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-600 border-gray-200 hover:border-[#b8924a]/60"}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-[#fbf7f0] rounded-2xl p-4">
                <label className="flex items-center gap-3 text-xs text-gray-600 md:col-span-2">
                  <span className="w-28 shrink-0 flex items-center gap-1.5">
                    <ZoomIn size={14} /> Zoom
                  </span>
                  <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[#b8924a]" />
                  <span className="w-10 text-right tabular-nums">{Math.round(zoom * 100)}%</span>
                </label>
                {slider(<Sun size={14} />, "Luminosité", brightness, setBrightness)}
                {slider(<Contrast size={14} />, "Contraste", contrast, setContrast)}
                {slider(<Droplets size={14} />, "Saturation", saturation, setSaturation, 0, 200)}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRotation((r) => (r + 270) % 360)} className="p-2 rounded-lg border border-gray-200 bg-white hover:border-[#b8924a]/60" title="Pivoter à gauche" aria-label="Pivoter à gauche">
                    <RotateCcw size={16} />
                  </button>
                  <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} className="p-2 rounded-lg border border-gray-200 bg-white hover:border-[#b8924a]/60" title="Pivoter à droite" aria-label="Pivoter à droite">
                    <RotateCw size={16} />
                  </button>
                  <button type="button" onClick={() => setFlip((v) => !v)} className={`p-2 rounded-lg border bg-white ${flip ? "border-[#b8924a]" : "border-gray-200 hover:border-[#b8924a]/60"}`} title="Effet miroir" aria-label="Effet miroir">
                    <FlipHorizontal2 size={16} />
                  </button>
                  <button type="button" onClick={reset} className="ml-auto text-xs text-[#8f6f33] hover:underline">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 sm:px-7 py-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!img || saving}
            className="px-6 py-2.5 rounded-xl bg-black text-[#f5eee1] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Valider la photo
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ouvre l'éditeur et attend le résultat :
 *   const { editImage, editorElement } = useImageEditor();
 *   const file = await editImage(fichier, { aspect: 16 / 9 }); // null si annulé
 * `editorElement` doit être rendu dans la page.
 */
export function useImageEditor() {
  const [job, setJob] = useState<{ source: File | string; options: ImageEditOptions } | null>(null);
  const resolver = useRef<((f: File | null) => void) | null>(null);

  const editImage = useCallback((source: File | string, options: ImageEditOptions = {}) => {
    return new Promise<File | null>((resolve) => {
      resolver.current = resolve;
      setJob({ source, options });
    });
  }, []);

  const finish = (f: File | null) => {
    resolver.current?.(f);
    resolver.current = null;
    setJob(null);
  };

  const editorElement = job ? (
    <ImageEditor key={typeof job.source === "string" ? job.source : job.source.name + job.source.size} source={job.source} options={job.options} onCancel={() => finish(null)} onDone={(f) => finish(f)} />
  ) : null;

  return { editImage, editorElement };
}
