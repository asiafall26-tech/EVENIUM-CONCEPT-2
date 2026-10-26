"use client";

import { useEffect, useRef } from "react";
import type { AddedRubrique } from "@/lib/invitationSections";

/**
 * Rubriques supprimées / ajoutées par l'organisateur, appliquées à la page d'un modèle Evenium.
 * Les rubriques du modèle portent data-inv-sec="<clé>". Une rubrique ajoutée reprend le fond, la couleur
 * et les polices de la rubrique après laquelle elle s'affiche (ou se place dans data-inv-slot si le modèle en a un).
 */
export default function InvitationSections({ hidden, rubriques }: { hidden?: string[]; rubriques?: unknown }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hiddenKey = JSON.stringify(hidden ?? []);
  const rubriquesKey = JSON.stringify(Array.isArray(rubriques) ? rubriques : []);

  useEffect(() => {
    const root = ref.current?.closest("[data-inv-style]");
    if (!root) return;
    const off: string[] = JSON.parse(hiddenKey);
    const added: AddedRubrique[] = JSON.parse(rubriquesKey);

    root.querySelectorAll<HTMLElement>("[data-inv-sec]").forEach((sec) => {
      const hide = off.includes(sec.dataset.invSec ?? "");
      sec.style.display = hide ? "none" : "";
    });

    const inserted: HTMLElement[] = [];
    for (const r of added) {
      const anchor = (r.after && root.querySelector<HTMLElement>(`[data-inv-sec="${CSS.escape(r.after)}"]`)) || null;
      const all = root.querySelectorAll<HTMLElement>("[data-inv-sec]");
      const ref2 = anchor ?? all[all.length - 1] ?? null;
      const slot = root.querySelector<HTMLElement>("[data-inv-slot]");
      const look = ref2 ? getComputedStyle(ref2) : null;

      const el = document.createElement("section");
      el.setAttribute("data-inv-rubrique", r.id);
      el.style.cssText = slot
        ? "padding:18px 0;text-align:center"
        : `padding:64px 24px;text-align:center;position:relative;color:${look?.color ?? "inherit"};background-color:${look?.backgroundColor ?? "transparent"};background-image:${look?.backgroundImage ?? "none"};background-size:cover`;
      const inner = document.createElement("div");
      inner.style.cssText = "max-width:620px;margin:0 auto";
      if (r.title) {
        const h = document.createElement("h2");
        h.textContent = r.title;
        inner.appendChild(h);
      }
      if (r.image) {
        const img = document.createElement("img");
        img.src = r.image;
        img.alt = r.title || "";
        img.style.cssText = "display:block;width:100%;max-width:520px;margin:18px auto;border-radius:6px;object-fit:cover";
        inner.appendChild(img);
      }
      for (const para of String(r.text || "").split(/\n{2,}/).filter(Boolean)) {
        const p = document.createElement("p");
        para.split("\n").forEach((line, i) => {
          if (i) p.appendChild(document.createElement("br"));
          p.appendChild(document.createTextNode(line));
        });
        inner.appendChild(p);
      }
      el.appendChild(inner);

      if (slot) slot.appendChild(el);
      else if (ref2?.parentNode) ref2.parentNode.insertBefore(el, ref2.nextSibling);
      else root.appendChild(el);
      inserted.push(el);
    }
    return () => inserted.forEach((n) => n.remove());
  }, [hiddenKey, rubriquesKey]);

  return <span ref={ref} hidden aria-hidden="true" />;
}
