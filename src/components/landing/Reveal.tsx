"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades/slides its direct children in, one after another, when scrolled into view.
 * Children keep their own layout classes (no wrapper elements are added).
 */
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-stagger ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
