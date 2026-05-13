"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type GSAPCallback = (context: gsap.Context) => void;

/**
 * Scoped GSAP hook with automatic context cleanup.
 * Pass a ref for scoping (recommended) or leave undefined for global scope.
 */
export function useGSAP(
  callback: GSAPCallback,
  deps: React.DependencyList = [],
  scopeRef?: React.RefObject<HTMLElement | null>
) {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const ctx = gsap.context(callback, scopeRef?.current ?? undefined);
    contextRef.current = ctx;

    return () => {
      ctx.revert();
      contextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return contextRef;
}
