"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";

const STATEMENTS = [
  { index: "I", text: "First impression.", align: "start" },
  { index: "II", text: "Warmth.", align: "end" },
  { index: "III", text: "Presence.", align: "start" },
  { index: "IV", text: "Memory.", align: "end" },
] as const;

/** Section 5 — the house's own sentence, told at walking pace. */
export function ScentStory() {
  const { revealed } = useExperience();
  const revealRef = useReveal<HTMLElement>({ enabled: revealed, start: "top 75%" });
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;


    const ctx = gsap.context(() => {
      // Each line drifts at its own rate — depth without movement you can name.
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
        const depth = parseFloat(el.dataset.drift ?? "1");
        gsap.fromTo(
          el,
          { yPercent: 14 * depth },
          {
            yPercent: -14 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-drift-scope]") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={revealRef} className="relative z-10 overflow-hidden bg-ink text-ivory">
      <div ref={parallaxRef}>
        {/* ---- the statement ---- */}
        <div
          data-drift-scope
          className="flex min-h-[92svh] items-center justify-center px-6 py-32 md:py-44"
        >
          {/* drift and reveal never share a layer: both write transform */}
          <h2 className="font-display display-xl text-center font-light">
            {["A scent", "becomes a", "memory."].map((line, i) => (
              <span key={line} data-drift={String(0.35 + i * 0.16)} className="block">
                <span data-reveal-line className="block">
                  <span className="block">{line}</span>
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* ---- the four beats ---- */}
        <div className="mx-auto w-full max-w-[112rem] px-6 pb-32 md:px-10 md:pb-48 lg:px-14">
          {STATEMENTS.map((s, i) => (
            <div
              key={s.text}
              data-drift-scope
              className={[
                "flex min-h-[46svh] items-center border-t border-ivory/10 py-14 md:min-h-[58svh]",
                s.align === "end" ? "justify-end text-right" : "justify-start",
              ].join(" ")}
            >
              <div
                data-drift={String(0.5 + i * 0.12)}
                className="flex max-w-3xl flex-col gap-5"
              >
                <span
                  data-reveal
                  className="label label-tight text-ivory/35"
                >
                  {s.index}
                </span>
                <p
                  data-reveal
                  data-reveal-delay="0.08"
                  className="font-display display-md font-light text-ivory/90 italic"
                >
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
