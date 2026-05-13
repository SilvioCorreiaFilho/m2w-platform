"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Ensures GSAP plugins are registered and ScrollTrigger defaults are configured.
 * Must be placed above LenisProvider in the tree since LenisProvider
 * calls initGSAP which depends on ScrollTrigger being registered.
 */
export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure ScrollTrigger defaults for the dark M2W theme
    ScrollTrigger.defaults({
      toggleActions: "play none none reverse",
    });

    // Refresh after fonts and layout are stable
    const id = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      clearTimeout(id);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf("*");
    };
  }, []);

  return <>{children}</>;
}
