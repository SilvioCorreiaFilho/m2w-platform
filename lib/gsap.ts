import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

let gsapInitialized = false;

export function initGSAP(lenis: Lenis): void {
  if (gsapInitialized) return;
  gsapInitialized = true;

  // Drive Lenis from GSAP's ticker for perfect synchronisation
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // CRITICAL: propagate Lenis scroll events to ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);
}

export function resetGSAP(): void {
  gsapInitialized = false;
}

export { gsap, ScrollTrigger };
