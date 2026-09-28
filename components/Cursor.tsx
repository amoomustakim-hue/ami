"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A hairline ring that trails the pointer, with a small solid core.
 * Fine pointers only — touch devices never see it, and it is purely decorative.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.14, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.14, ease: "power3.out" });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.4 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);

      const interactive = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor]"
      );
      gsap.to(ring, {
        scale: interactive ? 2.1 : 1,
        borderColor: interactive
          ? "rgba(244,239,229,0.75)"
          : "rgba(244,239,229,0.32)",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(dot, {
        scale: interactive ? 0 : 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      visible = false;
      gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.documentElement.classList.add("cursor-none-fine");

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("cursor-none-fine");
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <div
        ref={ringRef}
        className="absolute top-0 left-0 h-9 w-9 rounded-full border border-ivory/30 opacity-0 mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-[3px] w-[3px] rounded-full bg-ivory opacity-0 mix-blend-difference"
      />
    </div>
  );
}
