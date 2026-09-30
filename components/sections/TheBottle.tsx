"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Bottle } from "../Bottle";
import type { BottleMotion } from "../GlassBottle";

// three.js only ships to the screens that render it, and only when needed.
const GlassBottle = dynamic(() => import("../GlassBottle"), { ssr: false });

/** Real-time glass on large screens with motion and WebGL; the drawing everywhere else. */
function canRenderGlass() {
  if (!window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}
import { Magnetic } from "../Magnetic";
import { FLAGSHIP } from "@/lib/data";
import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";

const GROUPS = [
  { key: "top", title: "Top Notes", notes: FLAGSHIP.notes.top, side: "left", y: "20%" },
  { key: "heart", title: "Heart Notes", notes: FLAGSHIP.notes.heart, side: "right", y: "44%" },
  { key: "base", title: "Base Notes", notes: FLAGSHIP.notes.base, side: "left", y: "68%" },
] as const;

/** The ground colour the section settles on — reused by the stacked notes below. */
const GROUND_END = "#2b2e23";

/**
 * Section 7 — one object, held still while the page moves around it.
 * The bottle scales on scroll, the ground warms from ink to deep olive, and the
 * three note families draw themselves in along hairline leaders.
 */
export function TheBottle() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { revealed } = useExperience();
  const stackRef = useReveal<HTMLDivElement>({ enabled: revealed, start: "top 85%" });
  const [motion] = useState<BottleMotion>(() => ({ turn: 0 }));
  const [glass, setGlass] = useState(false);
  const [glassReady, setGlassReady] = useState(false);

  useEffect(() => setGlass(canRenderGlass()), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = gsap.utils.selector(root);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(q("[data-note-group], [data-bottle-meta]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-leader]"), { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // The object grows slowly through the whole section.
      tl.fromTo(
        q("[data-bottle-art]"),
        { scale: 0.84, y: 24 },
        { scale: 1.14, y: -18, duration: 1 },
        0
      );
      // …and turns in the light (read by the glass flacon every frame).
      tl.fromTo(motion, { turn: 0 }, { turn: 1, duration: 1 }, 0);

      // Ground shifts from near-black to the house olive.
      tl.fromTo(
        q("[data-bottle-ground]"),
        { backgroundColor: "#17150f" },
        { backgroundColor: GROUND_END, duration: 1 },
        0
      );

      tl.fromTo(
        q("[data-bottle-meta]"),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.12 },
        0.06
      );

      GROUPS.forEach((g, i) => {
        const at = 0.28 + i * 0.2;
        tl.fromTo(
          q(`[data-note-group="${g.key}"]`),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.12 },
          at
        );
        tl.fromTo(
          q(`[data-leader="${g.key}"]`),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.14, ease: "power2.out" },
          at
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={rootRef} className="relative z-10 h-[230vh] lg:h-[340vh]">
        <div
          data-bottle-ground
          className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-ink text-ivory"
        >
          {/* a single soft pool of light — no glow, no bloom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(58% 46% at 50% 52%, rgba(211,190,158,0.15) 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto flex h-full w-full max-w-[112rem] items-center justify-center px-6 md:px-10 lg:px-14">
            <span
              data-bottle-meta
              className="label absolute top-[11svh] left-1/2 -translate-x-1/2 text-ivory/45 md:top-[13svh]"
            >
              The Bottle
            </span>

            <span data-bottle-art className="relative block will-change-transform">
              <Bottle
                variant="wide"
                tone={FLAGSHIP.tone}
                mark={FLAGSHIP.mark}
                className={[
                  "h-[40svh] w-auto text-ivory transition-opacity duration-700 md:h-[46svh]",
                  glassReady ? "opacity-0" : "opacity-100",
                ].join(" ")}
              />
              {glass && (
                <span
                  className={[
                    "absolute top-1/2 left-1/2 h-[64svh] w-[64svh] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
                    glassReady ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  <GlassBottle
                    tone={FLAGSHIP.tone}
                    mark={FLAGSHIP.mark}
                    motion={motion}
                    onReady={() => setGlassReady(true)}
                  />
                </span>
              )}
            </span>

            <div
              data-bottle-meta
              className="absolute bottom-[7svh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3.5 text-center md:bottom-[10svh] md:gap-4"
            >
              <h2 className="font-display text-[clamp(1.75rem,5vw,3.75rem)] leading-none font-light">
                {FLAGSHIP.name}
              </h2>
              <span className="label label-tight text-ivory/45">
                {FLAGSHIP.family} &middot; {FLAGSHIP.volume} &middot; {FLAGSHIP.price}
              </span>
              <Magnetic strength={0.25}>
                <button
                  type="button"
                  className="label mt-1 border border-ivory/25 px-6 py-2.5 text-ivory/85 transition-colors duration-600 hover:border-ivory/60 hover:text-ivory md:px-7 md:py-3"
                >
                  Add to Bag
                </button>
              </Magnetic>
            </div>

            {/* ---- note families, drawn in along leaders (wide viewports) ---- */}
            {GROUPS.map((g) => (
              <div
                key={g.key}
                data-note-group={g.key}
                style={{ top: g.y }}
                className={[
                  "absolute hidden w-[15rem] opacity-0 lg:block xl:w-[18rem]",
                  g.side === "left"
                    ? "left-10 text-right xl:left-16"
                    : "right-10 text-left xl:right-16",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center gap-4",
                    g.side === "left" ? "flex-row" : "flex-row-reverse",
                  ].join(" ")}
                >
                  <div className="flex-1">
                    <span className="label label-tight block text-ivory/45">
                      {g.title}
                    </span>
                    <ul className="mt-3 space-y-1.5">
                      {g.notes.map((n) => (
                        <li
                          key={n}
                          className="font-display text-[1.3rem] leading-snug font-light text-ivory/85"
                        >
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span
                    data-leader={g.key}
                    className={[
                      "block h-px w-14 bg-ivory/30 xl:w-24",
                      g.side === "left" ? "origin-left" : "origin-right",
                    ].join(" ")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- the same three families, stacked, for narrow viewports ---- */}
      <section
        ref={stackRef}
        style={{ backgroundColor: GROUND_END }}
        className="relative z-10 text-ivory lg:hidden"
      >
        <div className="mx-auto w-full max-w-[112rem] px-6 pt-4 pb-24 md:px-10">
          <dl className="border-t border-ivory/12">
            {GROUPS.map((g) => (
              <div
                key={g.key}
                data-reveal
                className="flex flex-col gap-3 border-b border-ivory/12 py-7 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="label label-tight shrink-0 text-ivory/45 sm:w-40">
                  {g.title}
                </dt>
                <dd className="font-display text-[1.375rem] leading-snug font-light text-ivory/85">
                  {g.notes.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
