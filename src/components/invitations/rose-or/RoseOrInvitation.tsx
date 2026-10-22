"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ctaText, useInvitationCta } from "../InvitationCtaContext";
import { LIVE_SRC, PREVIEW_MSG, toPreviewMessage, withDefaults, type RoseOrContent } from "./content";

export interface RoseOrRsvp {
  name: string;
  email: string;
  attending: boolean;
  message: string;
}

interface Props {
  content: Partial<RoseOrContent>;
  onRsvp?: (rsvp: RoseOrRsvp) => Promise<void>;
  onBackToEdit?: () => void;
  onFinalize?: () => void;
  hideCta?: boolean;
}

/** Guest-facing "Rose Poudrée & Or Impérial" invitation: the animated page, fed with the event's content. */
export default function RoseOrInvitation({ content, onRsvp, onBackToEdit, onFinalize, hideCta }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const full = withDefaults(content);
  const contentRef = useRef(full);
  const onRsvpRef = useRef(onRsvp);
  const onBackToEditRef = useRef(onBackToEdit);
  const onFinalizeRef = useRef(onFinalize);
  const pathname = usePathname();
  const cta = useInvitationCta();
  const ctaLabels = ctaText(cta.variant);
  const ctaLabelsRef = useRef(ctaLabels);

  const isPurchasedOrGuest =
    !!hideCta ||
    (!cta.force && typeof pathname === "string" && (pathname.startsWith("/invite") || pathname.startsWith("/dashboard")));
  const showCta = !isPurchasedOrGuest && (!!onBackToEdit || !!onFinalize || (typeof pathname === "string" && pathname.startsWith("/create")));
  const showCtaRef = useRef(showCta);

  useEffect(() => {
    contentRef.current = full;
    onRsvpRef.current = onRsvp;
    onBackToEditRef.current = onBackToEdit;
    onFinalizeRef.current = onFinalize;
    showCtaRef.current = showCta;
    ctaLabelsRef.current = ctaLabels;
  });

  useEffect(() => {
    const post = (msg: object) => frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_MSG.ready) {
        post({ ...toPreviewMessage(contentRef.current, !!onRsvpRef.current, showCtaRef.current), ctaLabels: ctaLabelsRef.current });
      } else if (e.data?.type === "evenium:close-preview") {
        if (onBackToEditRef.current) onBackToEditRef.current();
        window.dispatchEvent(new CustomEvent("evenium:close-preview"));
      } else if (e.data?.type === "evenium:open-checkout") {
        if (onFinalizeRef.current) onFinalizeRef.current();
        window.dispatchEvent(new CustomEvent("evenium:open-checkout"));
      } else if (e.data?.type === PREVIEW_MSG.rsvp && onRsvpRef.current) {
        const { id, data } = e.data;
        try {
          await onRsvpRef.current({
            name: String(data?.name ?? ""),
            email: String(data?.email ?? ""),
            attending: data?.attend === "oui",
            message: String(data?.message ?? ""),
          });
          post({ type: PREVIEW_MSG.rsvpResult, id, ok: true });
        } catch {
          post({ type: PREVIEW_MSG.rsvpResult, id, ok: false });
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const iframeSrc = isPurchasedOrGuest ? `${LIVE_SRC}&hideCta=1` : LIVE_SRC;

  return (
    <iframe
      ref={frameRef}
      src={iframeSrc}
      title={`${full.partnerA} & ${full.partnerB}`}
      className="w-full h-screen border-0 block bg-[#efe2dc]"
      allow="autoplay; fullscreen"
    />
  );
}
