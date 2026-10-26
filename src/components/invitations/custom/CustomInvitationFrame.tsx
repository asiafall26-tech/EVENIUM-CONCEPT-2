"use client";

import { useEffect, useRef } from "react";
import { ctaText, useInvitationCta, type CtaText } from "@/components/invitations/InvitationCtaContext";
import { customModelUrl, styleMessage, type CustomModelRow, type CustomValues } from "@/lib/customModels";

const CHECKOUT_CTA: CtaText = {
  kicker: "Votre création Evenium",
  title: "Votre invitation est prête !",
  desc: "Toutes vos personnalisations sont en place. Validez votre achat pour activer votre lien officiel et vos accès organisateur.",
  primary: "Valider & Finaliser l'achat",
  secondary: "Revenir à la création",
  pill: "",
};

interface Props {
  model: Pick<CustomModelRow, "slug" | "entry" | "name">;
  values: CustomValues;
  /** Studio : clic sur un élément de l'aperçu pour le retrouver dans la liste */
  pick?: boolean;
  onSelect?: (id: string) => void;
  /** Élément à mettre en évidence dans l'aperçu */
  focusId?: string | null;
  /** Bloc de fin : « Valider » (ou variante du contexte) */
  onFinalize?: () => void;
  /** Bloc de fin : « Retour » */
  onBackToEdit?: () => void;
  hideCta?: boolean;
  className?: string;
  /** Réponse envoyée par le formulaire du modèle lui-même (message ev:rsvp) : enregistrée par le site */
  onRsvp?: (rsvp: ModelRsvp) => Promise<void>;
}

/** Réponse d'un invité saisie dans le formulaire du modèle importé */
export interface ModelRsvp {
  name: string;
  attending: boolean;
  guests: number;
  message: string;
}

/** Modèle importé affiché dans un cadre, alimenté par messages (public/ev-runtime.js). */
export default function CustomInvitationFrame({ model, values, pick, onSelect, focusId, onFinalize, onBackToEdit, hideCta, className, onRsvp }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const ctx = useInvitationCta();
  const custom = ctaText(ctx.variant);
  const cta = hideCta || (!onFinalize && !onBackToEdit) ? null : custom ?? CHECKOUT_CTA;

  const latest = useRef({ values, pick, cta, onSelect, onFinalize, onBackToEdit, onRsvp });
  useEffect(() => {
    latest.current = { values, pick, cta, onSelect, onFinalize, onBackToEdit, onRsvp };
  });

  const post = (msg: object) => frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  const send = () =>
    post({ type: "ev:content", values: latest.current.values, style: styleMessage(latest.current.values), pick: !!latest.current.pick, cta: latest.current.cta });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow || !e.data) return;
      const m = e.data;
      if (m.type === "ev:ready") {
        readyRef.current = true;
        send();
      } else if (m.type === "ev:select") latest.current.onSelect?.(m.id);
      else if (m.type === "evenium:open-checkout") latest.current.onFinalize?.();
      else if (m.type === "evenium:close-preview") latest.current.onBackToEdit?.();
      else if (m.type === "ev:rsvp" && m.rsvp) {
        // Aperçus (studio, création) : rien n'est enregistré, le modèle affiche simplement son remerciement
        const save = latest.current.onRsvp;
        const r = m.rsvp;
        const rsvp: ModelRsvp = {
          name: String(r.name ?? "").slice(0, 200),
          attending: !!r.attending,
          guests: Math.max(0, Math.min(50, Number(r.guests) || 0)),
          message: String(r.message ?? "").slice(0, 2000),
        };
        (save && rsvp.name ? save(rsvp) : Promise.resolve()).then(
          () => post({ type: "ev:rsvp-result", id: m.id, ok: true }),
          () => post({ type: "ev:rsvp-result", id: m.id, ok: false })
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chaque modification est envoyée à l'aperçu
  useEffect(() => {
    if (readyRef.current) send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, pick, cta?.primary]);

  useEffect(() => {
    if (focusId && readyRef.current) post({ type: "ev:focus", id: focusId });
  }, [focusId]);

  return (
    <iframe
      ref={frameRef}
      src={customModelUrl(model)}
      title={model.name}
      className={className ?? "w-full h-full border-0 block bg-white"}
      allow="autoplay; fullscreen"
    />
  );
}
