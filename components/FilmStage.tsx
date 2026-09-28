"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CinemaCanvas } from "./CinemaCanvas";
import { useExperience } from "./Experience";
import { Arrival } from "./sections/Arrival";
import { EnterHouse } from "./sections/EnterHouse";
import { Collection } from "./sections/Collection";

const FILM_ID = "film";

/**
 * The scroll-controlled walkthrough.
 *
 * One tall scroll region drives everything: the frame scrub lives in
 * <CinemaCanvas/>, and every piece of copy is keyed to the same 0–1 progress on
 * a single master timeline. Keeping the copy on one timeline is what stops the
 * beats reading as a slideshow — nothing snaps, and scrubbing back up unwinds
 * the whole sequence exactly.
 */
export function FilmStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { revealed, reducedMotion } = useExperience();

  useEffect(() => {
    if (!revealed) return;
    const root = rootRef.current;
    if (!root) return;


    const q = gsap.utils.selector(root);

    if (reducedMotion) {
      // Without motion the beats simply stack as readable blocks.
      gsap.set(
        q('[data-film="arrival"], [data-film="enter"], [data-film="enter-label"], [data-film="collection"]'),
        { opacity: 1, position: "relative", inset: "auto" }
      );
      gsap.set(q("[data-film-scrim]"), { opacity: 0.5 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      // --- the grade ---------------------------------------------------------
      // The set dims and softens whenever a statement is on screen, and opens
      // back up while the camera travels. This is what keeps type legible over
      // the bright interior without flattening the footage for the whole scroll.
      const scrim = q("[data-film-scrim]");
      const plate = q("[data-film-canvas]");

      gsap.set(scrim, { opacity: 0.14 });
      gsap.set(plate, { filter: "blur(0px)" });

      const grade = (at: number, opacity: number, blur: number) => {
        tl.to(scrim, { opacity, duration: 0.06 }, at);
        tl.to(plate, { filter: `blur(${blur}px)`, duration: 0.06 }, at);
      };

      grade(0.06, 0.16, 0); // title card lifts, the set opens up
      grade(0.13, 0.86, 1.8); // arrival statement
      grade(0.26, 0.2, 0); // travelling
      grade(0.38, 0.82, 1.6); // threshold
      grade(0.54, 0.16, 0); // travelling
      grade(0.64, 0.96, 2.8); // the collection index
      grade(0.94, 0.45, 1); // handing over to the next section

      // --- title card: holds, then lifts away as the camera starts moving ----
      tl.to(q('[data-film="hero"]'), { opacity: 0, y: -60, duration: 0.07 }, 0.06)
        .to(q('[data-film="hero"]'), { filter: "blur(6px)", duration: 0.07 }, 0.06);

      // --- arrival statement ------------------------------------------------
      tl.fromTo(
        q('[data-film="arrival"]'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.07 },
        0.13
      ).to(q('[data-film="arrival"]'), { opacity: 0, y: -50, duration: 0.07 }, 0.26);

      // --- threshold --------------------------------------------------------
      tl.fromTo(
        q('[data-film="enter-label"]'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.05 },
        0.33
      ).to(q('[data-film="enter-label"]'), { opacity: 0, duration: 0.05 }, 0.5);

      tl.fromTo(
        q('[data-film="enter"]'),
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.07 },
        0.4
      ).to(q('[data-film="enter"]'), { opacity: 0, y: -46, duration: 0.06 }, 0.54);

      // --- the collection, once the camera is in the room -------------------
      tl.fromTo(
        q('[data-film="collection"]'),
        { opacity: 0 },
        { opacity: 1, duration: 0.05 },
        0.63
      );
      tl.fromTo(
        q('[data-film="collection-title"]'),
        { opacity: 0, y: 46 },
        { opacity: 1, y: 0, duration: 0.06 },
        0.64
      );
      tl.fromTo(
        q('[data-film="collection-item"]'),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.05, stagger: 0.028 },
        0.7
      );
      // Ease the whole index away just before the footage hands over.
      tl.to(q('[data-film="collection"]'), { opacity: 0, y: -40, duration: 0.06 }, 0.94);
    }, root);

    return () => ctx.revert();
  }, [revealed, reducedMotion]);

  return (
    <div id={FILM_ID} ref={rootRef} className="relative h-[520vh]">
      <CinemaCanvas filmId={FILM_ID} />

      {/* One pinned viewport carries every beat. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="pointer-events-none relative h-full w-full">
          <Arrival />
          <EnterHouse />
          <Collection />
        </div>
      </div>
    </div>
  );
}
