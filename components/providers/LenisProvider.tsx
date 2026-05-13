"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type Lenis from "lenis";
import { createLenis, destroyLenis } from "@/lib/lenis";
import { initGSAP } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = createLenis();
    lenisRef.current = lenis;

    // Wire Lenis into GSAP ticker + ScrollTrigger
    initGSAP(lenis);

    return () => {
      destroyLenis();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}
