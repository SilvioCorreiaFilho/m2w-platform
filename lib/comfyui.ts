import type {
  MiaInfluencerParams,
  ComfyUIPayload,
  ComfyNode,
} from "@/types/comfyui";

export function buildPositivePrompt(params: MiaInfluencerParams): string {
  const base =
    "photo of mia park, brazilian woman, long black wavy hair, white crop top, ";

  const scenarioMap: Record<MiaInfluencerParams["scenario"], string> = {
    bathroom: "bright white tiled bathroom, morning light, ",
    studio: "professional studio, ring light, clean background, ",
    outdoor: "outdoor urban setting, natural sunlight, ",
    bedroom: "cozy bedroom, warm light, ",
  };

  const poseMap: Record<MiaInfluencerParams["pose"], string> = {
    standing: "standing, full body shot, ",
    seated: "seated, medium shot, ",
    closeup: "extreme close up face, portrait, ",
    walking: "walking, dynamic pose, ",
  };

  const outfitMap: Record<MiaInfluencerParams["outfit"], string> = {
    casual: "casual outfit, jeans and t-shirt, ",
    sport: "sportswear, athletic, ",
    elegant: "elegant dress, evening wear, ",
    ugc_creator: "ugc creator style, holding product, trendy outfit, ",
  };

  const expressionMap: Record<MiaInfluencerParams["expression"], string> = {
    surprise: "surprised expression, wide eyes, mouth open, ",
    smile: "bright smile, happy expression, ",
    neutral: "neutral expression, confident look, ",
    confident: "confident smirk, empowered expression, ",
  };

  const productStr = params.product
    ? `holding ${params.product.replace(/_/g, " ")}, `
    : "";

  return (
    base +
    scenarioMap[params.scenario] +
    poseMap[params.pose] +
    outfitMap[params.outfit] +
    expressionMap[params.expression] +
    productStr +
    "8k, photorealistic, sharp focus, professional photography, UGC creator content, " +
    "soft studio lighting, skin texture detail, hyperrealistic"
  );
}

export function buildComfyPayload(params: MiaInfluencerParams): ComfyUIPayload {
  const clientId = `m2w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const nodes: Record<string, ComfyNode> = {
    "1": {
      class_type: "CheckpointLoaderSimple",
      inputs: {
        ckpt_name: "realisticVisionV60B1_v60B1VAE.safetensors",
      },
    },
    "2": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["1", 1],
        text: buildPositivePrompt(params),
      },
    },
    "3": {
      class_type: "CLIPTextEncode",
      inputs: {
        clip: ["1", 1],
        text:
          "blurry, deformed, ugly, watermark, text, nsfw, low quality, " +
          "bad anatomy, extra limbs, disfigured, mutated, cartoon, anime",
      },
    },
    "4": {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0],
        positive: ["2", 0],
        negative: ["3", 0],
        latent_image: ["5", 0],
        seed: params.seed ?? Math.floor(Math.random() * 999_999_999),
        steps: 30,
        cfg: 7,
        sampler_name: "dpm_2m_karras",
        scheduler: "karras",
        denoise: 1,
      },
    },
    "5": {
      class_type: "EmptyLatentImage",
      inputs: { width: 768, height: 1344, batch_size: 1 },
    },
    "6": {
      class_type: "VAEDecode",
      inputs: { samples: ["4", 0], vae: ["1", 2] },
    },
    "7": {
      class_type: "SaveImage",
      inputs: {
        images: ["6", 0],
        filename_prefix: `mia_${params.pose}_${params.scenario}`,
      },
    },
  };

  return { client_id: clientId, prompt: nodes };
}

export const VALID_POSES: MiaInfluencerParams["pose"][] = [
  "standing",
  "seated",
  "closeup",
  "walking",
];

export const VALID_SCENARIOS: MiaInfluencerParams["scenario"][] = [
  "bathroom",
  "studio",
  "outdoor",
  "bedroom",
];

export const VALID_OUTFITS: MiaInfluencerParams["outfit"][] = [
  "casual",
  "sport",
  "elegant",
  "ugc_creator",
];

export const VALID_EXPRESSIONS: MiaInfluencerParams["expression"][] = [
  "surprise",
  "smile",
  "neutral",
  "confident",
];
