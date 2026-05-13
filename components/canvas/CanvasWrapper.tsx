"use client";

import { GlobalCanvas } from "./GlobalCanvas";
import { MiaScene } from "./MiaScene";

/** Single entry point for all R3F content — loaded dynamically with ssr:false */
export function CanvasWrapper() {
  return (
    <GlobalCanvas>
      <MiaScene />
    </GlobalCanvas>
  );
}
