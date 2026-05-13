"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, AdaptiveDpr } from "@react-three/drei";
import { Suspense } from "react";

interface GlobalCanvasProps {
  children?: React.ReactNode;
}

/**
 * Singleton WebGL canvas mounted at the root layout.
 * Fixed behind all content — pointer-events disabled so DOM interactions
 * are not blocked. Children are rendered inside the R3F scene graph.
 */
export function GlobalCanvas({ children }: GlobalCanvasProps) {
  return (
    <Canvas
      className="!fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr pixelated />
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
