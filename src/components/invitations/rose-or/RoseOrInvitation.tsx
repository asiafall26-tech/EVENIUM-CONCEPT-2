"use client";

import { useEffect, useRef } from "react";
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
}

/** Guest-facing "Rose Poudrée & Or Impérial" invitation: the animated page, fed with the event's content. */
export default function RoseOrInvitation({ content, onRsvp, onBackToEdit, onFinalize }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const full = withDefaults(content);
  const contentRef = useRef(full);
  const onRsvpRef = useRef(onRsvp);
  const onBackToEditRef = useRef(onBackToEdit);
  const onFinalizeRef = useRef(onFinalize);

  useEffect(() => {
    contentRef.current = full;
    onRsvpRef.current = onRsvp;
    onBackToEditRef.current = onBackToEdit;
    onFinalizeRef.current = onFinalize;
  });

  useEffect(() => {
    const post = (msg: object) => frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_MSG.ready) {
        post(toPreviewMessage(contentRef.current, !!onRsvpRef.current));
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

  return (
    <iframe
      ref={frameRef}
      src={LIVE_SRC}
      title={`${full.partnerA} & ${full.partnerB}`}
      className="w-full h-screen border-0 block bg-[#efe2dc]"
      allow="autoplay; fullscreen"
    />
  );
}
