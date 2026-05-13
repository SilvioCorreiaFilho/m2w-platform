export type InferenceStatus =
  | "idle"
  | "queued"
  | "running"
  | "completed"
  | "error";

export interface InferenceMetrics {
  promptId: string | null;
  progress: number;
  currentStep: number;
  totalSteps: number;
  status: InferenceStatus;
  outputImageUrl: string | null;
  vramUsed: number | null;
  gpuName: string | null;
  elapsedMs: number | null;
}

export interface InferenceContextValue {
  metrics: InferenceMetrics;
  startInference: (promptId: string) => void;
  reset: () => void;
}

// WebSocket message types from ComfyUI
export interface WSProgressMessage {
  type: "progress";
  data: {
    value: number;
    max: number;
    prompt_id: string;
    node: string;
  };
}

export interface WSExecutedMessage {
  type: "executed";
  data: {
    node: string;
    output: {
      images?: Array<{ filename: string; subfolder: string; type: string }>;
    };
    prompt_id: string;
  };
}

export interface WSStatusMessage {
  type: "status";
  data: {
    status: {
      exec_info: {
        queue_remaining: number;
      };
    };
    sid?: string;
  };
}

export interface WSExecutingMessage {
  type: "executing";
  data: {
    node: string | null;
    prompt_id: string;
  };
}

export type WSMessage =
  | WSProgressMessage
  | WSExecutedMessage
  | WSStatusMessage
  | WSExecutingMessage;
