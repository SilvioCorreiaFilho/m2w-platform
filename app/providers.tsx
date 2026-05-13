"use client";

import { GSAPProvider } from "@/components/providers/GSAPProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { InferenceProvider } from "@/components/providers/InferenceProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GSAPProvider>
      <LenisProvider>
        <InferenceProvider>{children}</InferenceProvider>
      </LenisProvider>
    </GSAPProvider>
  );
}
