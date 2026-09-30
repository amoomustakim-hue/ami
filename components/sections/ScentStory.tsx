"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";
import { framePath } from "@/lib/frames";

/**
 * Each beat is paired with a detail from the walkthrough itself — cropped in
 * close, so the same boutique reads as four different photographs.
 * `focus` is the object-position, `zoom` how far in the crop goes.
 */
const STATEMENTS = [
  {
    index: "I",
    text: "First impression.",
    note: "The olive facade, the name in light. You notice it before you decide to.",
    frame: 0,
    focus: "50% 4%",
    zoom: 1.5,
  },
  {
    index: "II",
    text: "Warmth.",
    note: "Oak, stone and a low amber glow — a room built to be lingered in.",
    frame: 104,
    focus: "18% 46%",
    zoom: 1.9,
  },
  {
    index: "III",
    text: "Presence.",
    note: "One ring of light over the table. Everything else stays quiet around it.",
    frame: 140,
    focus: "50% 12%",
    zoom: 1.7,
  },
  {
    index: "IV",
    text: "Memory.",
    note: "What stays on the skin, and in the room, long after you have left it.",
    frame: 150,
    focus: "56% 78%",
    zoom: 1.8,
  },
] as const;

/** Section 5 — the house's own sentence, told at walking pace. */
export function ScentStory() {
  const { revealed } = useExperience();
  const revealRef = useReveal<HTMLElement>({ enabled: revealed, start: "top 75%" });
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root || !revealed) return;
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

      // Stills open like a shutter lifting, then drift inside their frame.
      gsap.utils.toArray<HTMLElement>("[data-still]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "power4.inOut",
            scrollTrigger: { trigger: el, start: "top 82%" },
          }
        );
        gsap.fromTo(
          el.querySelector("[data-still-plate]"),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [revealed]);

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

        {/* ---- the four beats, each with a still from the house ---- */}
        <div className="mx-auto w-full max-w-[112rem] px-6 pb-32 md:px-10 md:pb-48 lg:px-14">
          {STATEMENTS.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={s.text}
                data-drift-scope
                className="grid grid-cols-1 items-center gap-10 border-t border-ivory/10 py-16 md:grid-cols-12 md:gap-8 md:py-24"
              >
                <figure
                  data-still
                  className={[
                    "relative aspect-[4/5] overflow-hidden bg-charcoal md:col-span-5 md:row-start-1",
                    flip ? "md:col-start-8" : "md:col-start-1",
                  ].join(" ")}
                >
                  {/* parallax lives on this layer; the crop lives on the img */}
                  <div data-still-plate className="absolute inset-x-0 -inset-y-[7%]">
                    <picture>
                      <source media="(max-width: 767px)" srcSet={framePath("mobile", s.frame)} />
                      <img
                        src={framePath("desktop", s.frame)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: s.focus, scale: s.zoom, transformOrigin: s.focus }}
                      />
                    </picture>
                  </div>
                  <figcaption className="label label-tight absolute bottom-4 left-4 text-ivory/75">
                    {s.index} — the house
                  </figcaption>
                </figure>

                <div
                  className={[
                    "md:col-span-5 md:row-start-1",
                    flip ? "md:col-start-2" : "md:col-start-8",
                  ].join(" ")}
                >
                  <div data-drift={String(0.4 + i * 0.1)} className="flex max-w-xl flex-col gap-6">
                    <span data-reveal className="label label-tight text-ivory/35">
                      {s.index}
                    </span>
                    <p
                      data-reveal
                      data-reveal-delay="0.08"
                      className="font-display display-md font-light text-ivory/90 italic"
                    >
                      {s.text}
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="0.16"
                      className="measure text-sm leading-[1.8] font-light text-ivory/55 md:text-base"
                    >
                      {s.note}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
