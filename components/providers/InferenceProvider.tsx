"use client";

import { createContext, useContext } from "react";
import { useInference } from "@/hooks/useInference";
import type { InferenceContextValue, InferenceMetrics } from "@/types/inference";

const defaultMetrics: InferenceMetrics = {
  promptId: null,
  progress: 0,
  currentStep: 0,
  totalSteps: 30,
  status: "idle",
  outputImageUrl: null,
  vramUsed: null,
  gpuName: null,
  elapsedMs: null,
};

const InferenceContext = createContext<InferenceContextValue>({
  metrics: defaultMetrics,
  startInference: () => {},
  reset: () => {},
});

export function InferenceProvider({ children }: { children: React.ReactNode }) {
  const { metrics, startInference, reset } = useInference();

  return (
    <InferenceContext.Provider value={{ metrics, startInference, reset }}>
      {children}
    </InferenceContext.Provider>
  );
}

export function useInferenceContext(): InferenceContextValue {
  return useContext(InferenceContext);
}
