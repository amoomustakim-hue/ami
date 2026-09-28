"use client";

import { Bottle } from "../Bottle";
import { Magnetic } from "../Magnetic";
import { FEATURED } from "@/lib/data";
import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";

/**
 * Section 4 — the first moment of daylight after the film.
 * Laid out as a boutique shelf: four tall bays divided by hairlines, never cards.
 */
export function Signature() {
  const { revealed } = useExperience();
  const ref = useReveal<HTMLElement>({ enabled: revealed });

  return (
    <section
      id="signature"
      ref={ref}
      className="relative z-10 bg-ivory text-ink"
    >
      <div className="mx-auto w-full max-w-[112rem] px-6 py-28 md:px-10 md:py-40 lg:px-14">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span data-reveal className="label block text-ink/45">
              Signature Scents
            </span>
            <h2 className="font-display display-lg mt-6 max-w-[14ch] font-light text-balance">
              Four ways to be remembered.
            </h2>
          </div>
          <p
            data-reveal
            data-reveal-delay="0.1"
            className="measure text-sm leading-[1.8] font-light text-ink/60 md:text-right md:text-base"
          >
            Each composition is built in small batches at the house, then left to
            rest before it is ever bottled.
          </p>
        </header>

        <ul className="mt-20 grid grid-cols-1 gap-y-16 border-t border-ink/12 md:mt-28 md:grid-cols-2 md:gap-y-0 lg:grid-cols-4">
          {FEATURED.map((f, i) => (
            <li
              key={f.id}
              data-reveal
              data-reveal-delay={`${i * 0.08}`}
              className="group relative flex flex-col border-ink/12 pt-10 md:border-b md:px-8 md:pt-14 md:pb-14 lg:px-10 [&:not(:last-child)]:md:border-r"
            >
              {/* A whisper of warmth on hover — no card, no shadow. */}
              <span className="pointer-events-none absolute inset-0 bg-sand/0 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-sand/25" />

              <div className="relative flex items-start justify-between">
                <span className="label label-tight text-ink/35 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="label label-tight text-ink/45">{f.family}</span>
              </div>

              <div className="relative flex min-h-[15rem] items-center justify-center py-10 md:min-h-[19rem]">
                <Bottle
                  tone={f.tone}
                  mark={f.mark}
                  className="h-[15rem] w-auto text-ink transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] md:h-[19rem]"
                />
              </div>

              <div className="relative mt-auto">
                <h3 className="font-display text-[1.75rem] leading-tight font-light md:text-[2rem]">
                  {f.name}
                </h3>
                <p className="mt-4 max-w-[30ch] text-sm leading-[1.75] font-light text-ink/60">
                  {f.description}
                </p>

                <div className="mt-8 flex items-baseline justify-between border-t border-ink/12 pt-5">
                  <span className="label label-tight text-ink/70">
                    {f.price}
                    <span className="ml-2 text-ink/35">{f.volume}</span>
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
