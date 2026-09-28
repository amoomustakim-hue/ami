"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Bottle } from "../Bottle";
import { Magnetic } from "../Magnetic";
import { MOODS, fragranceById } from "@/lib/data";
import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";

/**
 * Section 6 — a single question, answered with one word.
 * Written as an editorial prompt rather than a quiz: no steps, no progress bar,
 * no scoring. Choosing again simply re-composes the answer.
 */
export function FindYourScent() {
  const { revealed } = useExperience();
  const revealRef = useReveal<HTMLElement>({ enabled: revealed, start: "top 78%" });
  const [moodId, setMoodId] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const mood = MOODS.find((m) => m.id === moodId) ?? null;
  const match = mood ? fragranceById(mood.fragranceId) : null;

  // Re-compose the answer on every change, including the first.
  useEffect(() => {
    const root = resultRef.current;
    if (!root || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-result-part]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.07,
          overwrite: true,
        }
      );
      gsap.fromTo(
        "[data-result-bottle]",
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 1.3, ease: "expo.out", overwrite: true }
      );
    }, root);

    return () => ctx.revert();
  }, [moodId, match]);

  return (
    <section
      id="house"
      ref={revealRef}
      className="relative z-10 bg-warm-white text-ink"
    >
      <div className="mx-auto w-full max-w-[112rem] px-6 py-28 md:px-10 md:py-40 lg:px-14">
        <span data-reveal className="label block text-ink/45">
          Find Your Scent
        </span>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-20">
          {/* ---- the question ---- */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.5rem,6.2vw,5.25rem)] leading-[1.02] font-light tracking-[-0.02em] text-balance">
              {["What does your", "presence smell like?"].map((line) => (
                <span key={line} data-reveal-line className="block">
                  <span className="block">{line}</span>
                </span>
              ))}
            </h2>

            <p
              data-reveal
              data-reveal-delay="0.12"
              className="measure mt-8 text-sm leading-[1.8] font-light text-ink/55 md:text-base"
            >
              Choose the word you would want said about you as you leave a room.
            </p>

            <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-5 md:mt-20 md:gap-x-14">
              {MOODS.map((m, i) => {
                const active = m.id === moodId;
                return (
                  <li key={m.id} data-reveal data-reveal-delay={`${i * 0.05}`}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMoodId(m.id)}
                      className="group relative block py-1"
                    >
                      <span
                        className={[
                          "font-display block text-[clamp(1.75rem,4vw,3rem)] leading-none font-light tracking-[-0.01em] transition-colors duration-600",
                          active ? "text-ink" : "text-ink/35 group-hover:text-ink/70",
                        ].join(" ")}
                      >
                        {m.label}
                      </span>
                      <span
                        className={[
                          "absolute -bottom-1 left-0 h-px bg-ink transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---- the answer ---- */}
          <div className="lg:col-span-5">
            <div
              ref={resultRef}
              className="relative flex min-h-[32rem] flex-col justify-center border-t border-ink/12 pt-12 lg:min-h-[40rem] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14"
            >
              {!match ? (
                <div
                  data-reveal
                  data-reveal-delay="0.2"
                  className="flex flex-col items-start gap-6"
                >
                  <span className="label text-ink/35">Awaiting a word</span>
                  <p className="font-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-[1.35] font-light text-ink/30 italic">
                    Every answer here is a single bottle. Choose, and the house
                    will name it.
                  </p>
                </div>
              ) : (
                <>
                  <p
                    data-result-part
                    className="font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.4] font-light text-balance text-ink/70 italic"
                  >
                    &ldquo;{mood!.line}&rdquo;
                  </p>

                  <div className="mt-12 flex items-end gap-8">
                    <span data-result-bottle className="block shrink-0">
                      <Bottle
                        key={match.id}
                        tone={match.tone}
                        mark={match.mark}
                        className="h-52 w-auto text-ink md:h-64"
                      />
                    </span>
                    <div className="pb-2">
                      <span
                        data-result-part
                        className="label label-tight block text-ink/45"
                      >
                        {match.family}
                      </span>
                      <h3
                        data-result-part
                        className="font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-light"
                      >
                        {match.name}
                      </h3>
                      <p
                        data-result-part
                        className="mt-4 max-w-[26ch] text-sm leading-[1.75] font-light text-ink/60"
                      >
                        {match.description}
                      </p>
                    </div>
                  </div>

                  <div
                    data-result-part
                    className="mt-10 flex items-baseline justify-between border-t border-ink/12 pt-5"
                  >
                    <span className="label label-tight text-ink/70">
                      {match.price}
                      <span className="ml-2 text-ink/35">{match.volume}</span>
                    </span>
                    <Magnetic strength={0.2}>
                      <button
                        type="button"
                        className="label group/btn relative text-ink/80 transition-colors duration-500 hover:text-ink"
                      >
                        Discover
                        <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-ink/70 transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:origin-left group-hover/btn:scale-x-100" />
                      </button>
                    </Magnetic>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
