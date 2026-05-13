"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface UseScrollSequenceOptions {
  framesDir: string;
  frameCount: number;
  scrollHeight?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

interface FrameCache {
  bitmap: ImageBitmap | null;
  loaded: boolean;
}

export function useScrollSequence({
  framesDir,
  frameCount,
  scrollHeight = 300,
  containerRef,
  canvasRef,
}: UseScrollSequenceOptions) {
  const frameIndexRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const cacheRef = useRef<FrameCache[]>([]);
  const isDrawingRef = useRef<boolean>(false);

  const padded = (n: number) => String(n).padStart(3, "0");

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frameData = cacheRef.current[index];
      if (!frameData?.loaded || !frameData.bitmap) return;

      if (isDrawingRef.current) return;
      isDrawingRef.current = true;

      rafRef.current = requestAnimationFrame(() => {
        const { width: cw, height: ch } = canvas;
        const { width: iw, height: ih } = frameData.bitmap!;
        const scale = Math.max(cw / iw, ch / ih);
        const sw = iw * scale;
        const sh = ih * scale;
        const sx = (cw - sw) / 2;
        const sy = (ch - sh) / 2;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(frameData.bitmap!, sx, sy, sw, sh);
        isDrawingRef.current = false;
      });
    },
    [canvasRef]
  );

  const preloadFrames = useCallback(async () => {
    cacheRef.current = Array.from({ length: frameCount }, () => ({
      bitmap: null,
      loaded: false,
    }));

    const loadFrame = async (i: number) => {
      try {
        const response = await fetch(`${framesDir}frame_${padded(i)}.webp`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        cacheRef.current[i] = { bitmap, loaded: true };
        if (i === 0) drawFrame(0);
      } catch {
        cacheRef.current[i] = { bitmap: null, loaded: false };
      }
    };

    // Priority load: first 10 frames immediately
    await Promise.all(
      Array.from({ length: Math.min(10, frameCount) }, (_, i) => loadFrame(i))
    );

    // Remaining frames in background
    void Promise.all(
      Array.from({ length: Math.max(0, frameCount - 10) }, (_, i) =>
        loadFrame(i + 10)
      )
    );
  }, [framesDir, frameCount, drawFrame]);

  // ResizeObserver keeps canvas resolution correct
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        drawFrame(frameIndexRef.current);
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, drawFrame]);

  // ScrollTrigger maps scroll progress → frame index
  useEffect(() => {
    if (!containerRef.current) return;

    void preloadFrames();

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${scrollHeight}%`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const raw = Math.round(self.progress * (frameCount - 1));
        const clamped = Math.max(0, Math.min(raw, frameCount - 1));
        if (clamped !== frameIndexRef.current) {
          frameIndexRef.current = clamped;
          drawFrame(clamped);
        }
      },
    });

    return () => {
      trigger.kill();
      cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, frameCount, scrollHeight, preloadFrames, drawFrame]);
}
