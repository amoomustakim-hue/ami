"use client";

import { useExperience } from "../Experience";
import { Magnetic } from "../Magnetic";

/**
 * Beat 1 — the pavement outside the house.
 * Two groups share this beat: the title card, then the arrival statement.
 */
export function Arrival() {
  const { scrollTo } = useExperience();

  return (
    <>
      {/*
        Title card.

        No wordmark here on purpose: the storefront's own illuminated "ami" sign
        fills the top of the opening frame, so an overlay would simply print the
        name twice, in two different typefaces, a few pixels apart. The set is
        the logo at this moment. The house's own wordmark arrives a beat later,
        once the sign has left the shot.
      */}
      <div
        data-film="hero"
        className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-[10svh] text-center md:pb-[12svh]"
      >
        <span className="label text-[0.8rem] text-ivory/75 md:text-[0.9rem]">
          The Art of Scent
        </span>

        <div className="pointer-events-auto mt-8 md:mt-10">
          <Magnetic strength={0.32}>
            <button
              type="button"
              onClick={() => scrollTo("#film", window.innerHeight * 0.85)}
              className="label group flex flex-col items-center gap-4 text-ivory/80 transition-colors duration-500 hover:text-ivory"
            >
              <span className="flex items-center gap-3">
                Enter the House
                <span className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-1">
                  &#8595;
                </span>
              </span>
              <span className="block h-10 w-px overflow-hidden bg-ivory/20">
                <span className="block h-full w-full origin-top animate-[drop_2.8s_cubic-bezier(0.4,0,0.2,1)_infinite] bg-ivory/70" />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>

      {/* ---- arrival statement ---- */}
      <div
        data-film="arrival"
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
      >
        {/* The page's only h1 — the wordmark, shown where nothing competes. */}
        <h1 className="font-display text-[clamp(2.75rem,8vw,6rem)] leading-none font-light text-ivory">
          ami
        </h1>
        <p className="label mt-7 text-ivory/70">The House of Fragrance</p>
        <p className="measure font-display mt-8 text-[clamp(1.125rem,2.1vw,1.6rem)] leading-[1.5] font-light text-balance text-ivory/70 italic">
          An intimate world of scent, crafted for those who leave an impression.
        </p>
      </div>
    </>
  );
}
