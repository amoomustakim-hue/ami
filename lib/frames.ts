import manifest from "./frame-manifest.json";

export type FrameTier = "desktop" | "mobile";

export const FRAME_COUNT = manifest.count;
export const FRAME_ASPECT = manifest.aspect; // width / height of a cropped frame
/** Native width of an encoded frame — the ceiling on real detail. */
export const FRAME_WIDTH = manifest.tiers.desktop.width;
export const FRAME_POSTER = manifest.poster;

/**
 * Frames decoded before the preloader will hand over the page.
 *
 * Kept deliberately small: the hero only ever shows frame 1, the scrub falls
 * back to the nearest decoded frame, and the rest of the sequence keeps
 * streaming behind the revealed page. Raising this only makes people wait.
 */
export const PRIORITY_FRAMES = 6;

/**
 * Narrative anchors, expressed as progress (0–1) through the film.
 * Derived from the source walkthrough: the camera leaves the pavement at ~0.30,
 * crosses the threshold at ~0.45 and is standing in the room by ~0.66.
 */
export const BEAT = {
  arrival: { in: 0.0, out: 0.24 },
  enter: { in: 0.3, out: 0.58 },
  collection: { in: 0.63, out: 1.0 },
} as const;

export function framePath(tier: FrameTier, index: number) {
  return `/frames/${tier}/${String(index + 1).padStart(4, "0")}.webp`;
}

export function pickTier(): FrameTier {
  if (typeof window === "undefined") return "desktop";
  // Narrow viewports only ever see the centre band of the portrait frame, so the
  // lighter ladder costs them almost nothing in perceived detail.
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
