export interface MiaInfluencerParams {
  pose: "standing" | "seated" | "closeup" | "walking";
  scenario: "bathroom" | "studio" | "outdoor" | "bedroom";
  outfit: "casual" | "sport" | "elegant" | "ugc_creator";
  expression: "surprise" | "smile" | "neutral" | "confident";
  product?: string;
  seed?: number;
}

export interface ComfyNode {
  class_type: string;
  inputs: Record<string, unknown>;
}

export interface ComfyUIPayload {
  prompt: Record<string, ComfyNode>;
  client_id: string;
}

export interface ComfyUIQueueResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface ComfyUIHistoryItem {
  prompt: [number, string, ComfyUIPayload, Record<string, unknown>, string[]];
  outputs: Record<string, ComfyUIOutput>;
  status: {
    status_str: "success" | "error";
    completed: boolean;
    messages: Array<[string, unknown]>;
  };
}

export interface ComfyUIOutput {
  images: ComfyUIImage[];
}

export interface ComfyUIImage {
  filename: string;
  subfolder: string;
  type: "output" | "temp";
}
