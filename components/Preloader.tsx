"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useExperience } from "./Experience";
import { FRAME_POSTER } from "@/lib/frames";

/** Minimum time on screen — a loader that blinks reads as a glitch, not a house. */
const MIN_VISIBLE_MS = 1600;

export function Preloader() {
  const { ready, progress, setRevealed } = useExperience();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const mountedAt = useRef<number>(0);
  const shownRef = useRef({ value: 0 });
  const [gone, setGone] = useState(false);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  // Ease the indicator toward the real figure so it never jumps.
  useEffect(() => {
    if (progress <= 0) {
      if (countRef.current) countRef.current.textContent = "—";
      return;
    }

    // `shown` persists across updates, so the figure eases on from where it was
    // rather than restarting at zero each time a frame lands.
    const shown = shownRef.current;
    const tween = gsap.to(shown, {
      value: progress,
      duration: 0.9,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        const pct = Math.round(shown.value * 100);
        if (barRef.current) barRef.current.style.transform = `scaleX(${shown.value})`;
        if (countRef.current) {
          countRef.current.textContent = String(pct).padStart(2, "0");
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress]);

  useEffect(() => {
    if (!ready) return;
    const elapsed = performance.now() - mountedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    const timer = window.setTimeout(() => {
      const root = rootRef.current;
      if (!root) {
        setRevealed(true);
        setGone(true);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setRevealed(true);
          setGone(true);
        },
      });

      tl.to(root.querySelectorAll("[data-pre-fade]"), {
        opacity: 0,
        y: -14,
        duration: 0.7,
        ease: "power2.inOut",
        stagger: 0.06,
      })
        .to(
          root,
          {
            opacity: 0,
            duration: 1.1,
            ease: "power2.inOut",
          },
          "-=0.25"
        )
        // Hand over a touch early so the hero type begins under the fade.
        .call(() => setRevealed(true), undefined, "-=0.55");
    }, wait);

    return () => window.clearTimeout(timer);
  }, [ready, setRevealed]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
      aria-label="Preparing the ami experience"
    >
      {/* The opening frame, reduced to atmosphere. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `url(${FRAME_POSTER})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(46px) saturate(0.75)",
          transform: "scale(1.2)",
        }}
      />
      <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />

      <div className="relative flex flex-col items-center px-6">
        <span
          data-pre-fade
          className="font-display text-[clamp(3.5rem,11vw,7rem)] leading-none font-light tracking-[-0.02em] text-ivory"
        >
          ami
        </span>

        <span
          data-pre-fade
          className="label mt-7 text-ivory/45"
        >
          Preparing your experience
        </span>

        <div data-pre-fade className="mt-10 flex items-center gap-4">
          <span className="relative block h-px w-[clamp(7rem,26vw,13rem)] overflow-hidden bg-ivory/15">
            {/*
              Until the first frame decodes there is nothing honest to report,
              so the track sweeps instead of claiming a percentage. The sweep is
              pure CSS, which means it is alive from first paint — before the
              bundle has even booted.
            */}
            {progress > 0 ? (
              <span
                ref={barRef}
                className="absolute inset-0 origin-left scale-x-0 bg-ivory/70"
              />
            ) : (
              <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-[sweep_1.9s_cubic-bezier(0.4,0,0.2,1)_infinite] bg-ivory/60" />
            )}
          </span>
          <span className="label label-tight w-6 text-ivory/40 tabular-nums">
            {/* Once counting starts the text is owned by the easing tween, never
                by a render — so the dash is a separate, server-rendered node. */}
            {progress > 0 ? <span ref={countRef} /> : <span>&mdash;</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
