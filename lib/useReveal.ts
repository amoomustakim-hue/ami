"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Options = {
  /**
   * Hold setup until the preloader has handed over. While the loader is up the
   * document is height-locked, so any trigger created then measures against a
   * collapsed page.
   */
  enabled?: boolean;
  /** Play on mount instead of waiting to be scrolled to. */
  immediate?: boolean;
  start?: string;
};

/**
 * Wires the two reveal primitives inside a container:
 *  - `[data-reveal-line] > span` rises out of its own clipped box
 *  - `[data-reveal]` fades and lifts, honouring `data-reveal-delay`
 *
 * Both use `fromTo` so the at-rest state is owned by the tween itself: a
 * ScrollTrigger refresh re-applies it rather than leaving a stale inline
 * transform behind.
 */
export function useReveal<T extends HTMLElement>({
  enabled = true,
  immediate = false,
  start = "top 82%",
}: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root.querySelectorAll("[data-reveal]"), { opacity: 1, y: 0 });
      gsap.set(root.querySelectorAll("[data-reveal-line] > span"), { yPercent: 0 });
      return;
    }

    let ctx: gsap.Context | null = null;

    // One frame of grace so the unlock + global refresh lands first.
    const id = window.setTimeout(() => {
      ctx = gsap.context(() => {
        const lines = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-line] > span",
          root
        );
        if (lines.length) {
          gsap.fromTo(
            lines,
            { yPercent: 108 },
            {
              yPercent: 0,
              duration: 1.35,
              ease: "expo.out",
              stagger: 0.085,
              delay: immediate ? 0.15 : 0,
              scrollTrigger: immediate
                ? undefined
                : { trigger: root, start, toggleActions: "play none none none" },
            }
          );
        }

        gsap.utils.toArray<HTMLElement>("[data-reveal]", root).forEach((el) => {
          const delay = parseFloat(el.dataset.revealDelay ?? "0");
          gsap.fromTo(
            el,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 1.25,
              ease: "expo.out",
              delay: (immediate ? 0.35 : 0) + delay,
              scrollTrigger: immediate
                ? undefined
                : { trigger: el, start, toggleActions: "play none none none" },
            }
          );
        });
      }, root);

      ScrollTrigger.refresh();
    }, 60);

    return () => {
      window.clearTimeout(id);
      ctx?.revert();
    };
  }, [enabled, immediate, start]);

  return ref;
}
