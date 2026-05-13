"use client";

import { useCallback, useRef, useState } from "react";
import type { InferenceMetrics } from "@/types/inference";

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

export function useInference() {
  const [metrics, setMetrics] = useState<InferenceMetrics>(defaultMetrics);
  const wsRef = useRef<WebSocket | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const COMFYUI_WS =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_COMFYUI_WS ?? "ws://127.0.0.1:8188/ws")
      : "ws://127.0.0.1:8188/ws";

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const startInference = useCallback(
    (promptId: string) => {
      disconnect();
      startTimeRef.current = Date.now();

      setMetrics((prev) => ({
        ...prev,
        promptId,
        status: "queued",
        progress: 0,
        currentStep: 0,
        outputImageUrl: null,
      }));

      const ws = new WebSocket(COMFYUI_WS);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (typeof event.data !== "string") return;

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msg = JSON.parse(event.data) as any;

          if (msg.type === "progress") {
            const { value, max } = msg.data as { value: number; max: number };
            const elapsed = startTimeRef.current
              ? Date.now() - startTimeRef.current
              : null;

            setMetrics((prev) => ({
              ...prev,
              status: "running",
              currentStep: value,
              totalSteps: max,
              progress: Math.round((value / max) * 100),
              elapsedMs: elapsed,
            }));
          }

          if (
            msg.type === "executed" &&
            msg.data?.prompt_id === promptId
          ) {
            const images = msg.data?.output?.images as
              | Array<{ filename: string; subfolder: string }>
              | undefined;

            if (images?.length) {
              const img = images[0];
              const base = COMFYUI_WS.replace("ws://", "http://").replace(
                "/ws",
                ""
              );
              const url = `${base}/view?filename=${img.filename}&subfolder=${img.subfolder}`;

              setMetrics((prev) => ({
                ...prev,
                status: "completed",
                progress: 100,
                outputImageUrl: url,
                elapsedMs: startTimeRef.current
                  ? Date.now() - startTimeRef.current
                  : null,
              }));
            }

            ws.close();
          }

          if (msg.type === "status") {
            const queueRemaining =
              msg.data?.status?.exec_info?.queue_remaining ?? null;
            setMetrics((prev) => ({
              ...prev,
              vramUsed: queueRemaining,
            }));
          }
        } catch {
          // Non-JSON ping/pong frames — ignore
        }
      };

      ws.onerror = () => {
        setMetrics((prev) => ({ ...prev, status: "error" }));
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    },
    [COMFYUI_WS, disconnect]
  );

  const reset = useCallback(() => {
    disconnect();
    startTimeRef.current = null;
    setMetrics(defaultMetrics);
  }, [disconnect]);

  return { metrics, startInference, reset };
}
