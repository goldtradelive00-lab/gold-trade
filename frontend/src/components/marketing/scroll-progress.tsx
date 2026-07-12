"use client";

import { useEffect, useRef } from "react";

/**
 * Thin progress bar showing how far the visitor has scrolled through the
 * page. Uses a rAF lerp loop (instead of binding width directly to the
 * scroll event) so the fill eases toward the target instead of jumping,
 * noticeably smoother on trackpads/fast wheel scrolls.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const updateTarget = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      target.current = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // rAF is throttled by the browser while the tab is hidden/backgrounded,
      // so apply the value directly in that case instead of silently stalling.
      if (document.hidden && barRef.current) {
        current.current = target.current;
        barRef.current.style.width = `${current.current}%`;
      }
    };

    const tick = () => {
      current.current += (target.current - current.current) * 0.12;
      if (Math.abs(target.current - current.current) < 0.05) {
        current.current = target.current;
      }
      if (barRef.current) {
        barRef.current.style.width = `${current.current}%`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="h-[3px] w-full bg-border/40">
      <div
        ref={barRef}
        className="h-full w-0 bg-gradient-to-r from-gold-soft to-primary"
        style={{ boxShadow: "0 0 8px rgba(236, 194, 70, 0.6)" }}
      />
    </div>
  );
}
