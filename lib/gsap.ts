/**
 * Single registration point for GSAP.
 *
 * Effects run child-first, so registering ScrollTrigger inside a provider's
 * effect is already too late for the components beneath it. Registering at
 * module scope guarantees the plugin exists before any component can reach for
 * it, whichever one mounts first.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
