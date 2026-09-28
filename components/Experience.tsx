"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useFrameSequence } from "@/lib/useFrameSequence";
import { prefersReducedMotion } from "@/lib/frames";

type ExperienceValue = {
  frames: (HTMLImageElement | null)[];
  /** Opening frames decoded — the preloader may retire. */
  ready: boolean;
  /** Preloader has finished its exit; sections may play their intros. */
  revealed: boolean;
  progress: number;
  reducedMotion: boolean;
  scrollTo: (target: string | number, offset?: number) => void;
  setRevealed: (value: boolean) => void;
};

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <Experience>");
  return ctx;
}

export function Experience({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  const { frames, ready, progress } = useFrameSequence(true);

  // --- Lenis + GSAP ScrollTrigger wiring -------------------------------------
  useEffect(() => {

    if (prefersReducedMotion()) {
      // No momentum layer: native scrolling only.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      // Long, heavy easing — the page should feel like a camera dolly, not a list.
      lerp: 0.075,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.25,
      syncTouch: false,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Hold the page still until the experience is handed over.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (revealed) {
      lenis?.start();
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("height");
    } else {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      document.body.style.height = "100dvh";
    }
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;
    // Layout settles after the reveal; re-measure every trigger once.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [revealed]);

  const scrollTo = useCallback((target: string | number, offset = 0) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.8 });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target + offset, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const value = useMemo<ExperienceValue>(
    () => ({
      frames,
      ready,
      revealed,
      progress,
      reducedMotion,
      scrollTo,
      setRevealed,
    }),
    [frames, ready, revealed, progress, reducedMotion, scrollTo]
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}
