"use client";

import dynamic from "next/dynamic";

// ssr:false must live inside a Client Component (Next.js 15+ rule)
const CanvasWrapper = dynamic(
  () =>
    import("@/components/canvas/CanvasWrapper").then((m) => m.CanvasWrapper),
  { ssr: false }
);

export function CanvasClient() {
  return <CanvasWrapper />;
}
