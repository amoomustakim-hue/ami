"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useExperience } from "./Experience";
import { FRAME_COUNT, FRAME_WIDTH } from "@/lib/frames";

/**
 * The walkthrough itself.
 *
 * The frame always covers the viewport edge to edge. The footage is portrait,
 * so on a landscape screen that means cropping it vertically — and the first
 * thing a centred crop throws away is the illuminated storefront sign at the
 * top of frame 1. So the crop is not centred: it rides high while the sign is
 * still in shot and eases to centre once the camera is through the door. The
 * dolly move itself is unaffected by any of this.
 */
export function CinemaCanvas({ filmId }: { filmId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { frames, reducedMotion, revealed } = useExperience();

  // Mutable render state, deliberately outside React.
  const stateRef = useRef({ frame: 0, zoom: 1, active: true, raf: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const state = stateRef.current;
    let cw = 0;
    let ch = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const raw = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);

      /*
        The encoded frame is FRAME_WIDTH wide (1440px from the AI-upscaled
        masters). Past that the image is being enlarged anyway, and rendering
        at 2× device pixels buys no detail — it just raises the per-frame cost
        of a scrub that has to stay at 60fps. Cap the backing store at a
        sensible multiple of the frame and never go below 1×.
      */
      const ceiling = (FRAME_WIDTH * 1.6) / rect.width;
      const dpr = Math.min(raw, Math.max(1, ceiling));

      cw = Math.round(rect.width * dpr);
      ch = Math.round(rect.height * dpr);
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      render(true);
    };

    /** Closest decoded frame to `index`, so a gap never blanks the screen. */
    const nearest = (index: number) => {
      const i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
      if (frames[i]) return frames[i];
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    const paint = () => {
      state.raf = 0;
      const img = nearest(state.frame);
      if (!img || !cw || !ch) return;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Cover: fill the viewport in both axes, whatever the aspect ratio.
      const scale = Math.max(cw / iw, ch / ih) * state.zoom;
      const dw = iw * scale;
      const dh = ih * scale;

      /*
        Where the vertical crop sits.

        0 keeps the top of frame, 0.5 centres, 1 keeps the bottom. The storefront
        sign lives at the top of the opening frames, so the crop starts high and
        eases to centre over roughly the first third of the walk — by which point
        the sign has left the shot on its own and the room wants to be centred.
        Derived from the frame index rather than its own ScrollTrigger, so it
        stays exactly in step with the scrub and reverses with it.
      */
      const t = Math.min(1, state.frame / (FRAME_COUNT * 0.34));
      const focusY = 0.06 + 0.44 * (t * t * (3 - 2 * t));

      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) * focusY, dw, dh);
    };

    const render = (immediate = false) => {
      if (!state.active) return;
      if (immediate) {
        paint();
        return;
      }
      if (state.raf) return;
      state.raf = requestAnimationFrame(paint);
    };

    resize();

    // A frame arriving late (background pass) should repaint the current view.
    const settle = window.setInterval(() => render(), 400);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize());
      ro.observe(host);
    }
    window.addEventListener("orientationchange", resize);

    const film = document.getElementById(filmId);
    const triggers: ScrollTrigger[] = [];
    let scrub: gsap.core.Tween | null = null;

    if (film && !reducedMotion) {
      scrub = gsap.to(state, {
        frame: FRAME_COUNT - 1,
        zoom: 1.045,
        ease: "none",
        scrollTrigger: {
          trigger: film,
          start: "top top",
          end: "bottom bottom",
          // The lag that turns discrete frames into a camera move.
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
        onUpdate: () => render(),
      });

      triggers.push(
        ScrollTrigger.create({
          trigger: film,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            state.active = self.isActive;
            host.style.visibility = self.isActive ? "visible" : "hidden";
            if (self.isActive) render(true);
          },
        })
      );
    } else if (reducedMotion) {
      // Static establishing shot, no scroll coupling.
      state.frame = 0;
      render(true);
    }

    return () => {
      window.clearInterval(settle);
      window.removeEventListener("orientationchange", resize);
      ro?.disconnect();
      if (state.raf) cancelAnimationFrame(state.raf);
      scrub?.scrollTrigger?.kill();
      scrub?.kill();
      triggers.forEach((t) => t.kill());
    };
  }, [frames, filmId, reducedMotion, revealed]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink"
    >
      <canvas
        ref={canvasRef}
        data-film-canvas
        className="block h-full w-full will-change-[filter]"
      />

      {/*
        Legibility scrim. Its weight is driven by the film timeline: the footage
        dims as a statement arrives and lifts again while the camera travels, so
        type stays readable without permanently muddying the set.
      */}
      <div
        data-film-scrim
        className="absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(66% 56% at 50% 50%, rgba(23,21,15,0.95) 0%, rgba(23,21,15,0.62) 56%, rgba(23,21,15,0.16) 100%)",
        }}
      />

      {/* Fixed scrims — kept very light so the footage stays the subject. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-transparent" />
      {/* The title card sits low, so the foot of frame carries most of the load. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/88 via-ink/38 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 78% at 50% 48%, transparent 38%, rgba(20,18,13,0.42) 100%)",
        }}
      />
    </div>
  );
}
