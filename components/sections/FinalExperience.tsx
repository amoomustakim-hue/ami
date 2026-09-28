"use client";

import { useExperience } from "../Experience";
import { Magnetic } from "../Magnetic";
import { useReveal } from "@/lib/useReveal";

/**
 * Section 8 — back inside the room, one last time.
 * A late frame from the same walkthrough is used as a still plate here, so the
 * closing statement is spoken in the boutique rather than on a blank page.
 */
export function FinalExperience() {
  const { scrollTo, revealed } = useExperience();
  const ref = useReveal<HTMLElement>({ enabled: revealed, start: "top 72%" });

  return (
    <section
      ref={ref}
      className="relative z-10 flex min-h-[100svh] items-center overflow-hidden bg-ink text-ivory"
    >
      <picture>
        <source media="(max-width: 767px)" srcSet="/frames/mobile/0126.webp" />
        <img
          src="/frames/desktop/0126.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70"
        />
      </picture>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/90"
      />

      <div className="relative mx-auto w-full max-w-[112rem] px-6 py-32 md:px-10 md:py-44 lg:px-14">
        <h2 className="font-display display-lg max-w-[16ch] font-light">
          {["Your scent.", "Your signature."].map((line) => (
            <span key={line} data-reveal-line className="block">
              <span className="block">{line}</span>
            </span>
          ))}
        </h2>

        <p
          data-reveal
          data-reveal-delay="0.15"
          className="font-display mt-10 text-[clamp(1.5rem,3vw,2.5rem)] leading-tight font-light text-ivory/70 italic"
        >
          Discover ami.
        </p>

        <div
          data-reveal
          data-reveal-delay="0.25"
          className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10"
        >
          <Magnetic strength={0.24}>
            <button
              type="button"
              onClick={() => scrollTo("#signature", -1)}
              className="label border border-ivory/80 bg-ivory px-8 py-4 text-ink transition-colors duration-600 hover:border-ivory hover:bg-transparent hover:text-ivory"
            >
              Explore the Collection
            </button>
          </Magnetic>

          <Magnetic strength={0.24}>
            <button
              type="button"
              className="label group relative text-ivory/80 transition-colors duration-500 hover:text-ivory"
            >
              Visit the House
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-ivory/70 transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100" />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
