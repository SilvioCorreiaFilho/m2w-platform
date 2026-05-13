"use client";

import { useRef } from "react";
import { useScrollSequence } from "@/hooks/useScrollSequence";

interface CanvasSequenceProps {
  /** Public directory of WebP frames, e.g. "/frames/mia/" */
  framesDir: string;
  /** Total number of frames in the sequence */
  frameCount: number;
  /** Scroll container height in vh units (300 = 3× viewport of scroll space) */
  scrollHeight?: number;
  /** Additional Tailwind classes for the outer container */
  className?: string;
  /** Optional overlay content rendered above the canvas */
  children?: React.ReactNode;
}

/**
 * Scroll-to-video illusion engine.
 * Maps vertical scroll progress to a WebP frame index and draws it on a 2D
 * canvas. No <video> tag — pure canvas + GSAP ScrollTrigger + createImageBitmap.
 */
export function CanvasSequence({
  framesDir,
  frameCount,
  scrollHeight = 300,
  className = "",
  children,
}: CanvasSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useScrollSequence({
    framesDir,
    frameCount,
    scrollHeight,
    containerRef,
    canvasRef,
  });

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: "100vh" }}
    >
      {/* Fallback gradient shown while frames load */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(124,58,237,0.25) 0%, rgba(5,5,8,0) 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />

      {children && (
        <div className="absolute inset-0 z-10">{children}</div>
      )}
    </div>
  );
}
